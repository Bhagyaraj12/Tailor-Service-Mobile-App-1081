-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'tailor');
CREATE TYPE measurement_type AS ENUM ('ai_camera', 'manual', 'sample_image');
CREATE TYPE job_status AS ENUM (
  'pending_assignment',
  'assigned',
  'in_progress',
  'completed_by_tailor',
  'delivered'
);

-- Create profiles table
CREATE TABLE profiles_tc (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  phone TEXT UNIQUE,
  role user_role DEFAULT 'customer',
  tailor_skill_tags TEXT[],
  availability_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create jobs table
CREATE TABLE jobs_tc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles_tc(id),
  assigned_tailor_id UUID REFERENCES profiles_tc(id),
  category TEXT NOT NULL,
  design_model TEXT NOT NULL,
  add_ons TEXT[],
  measurement_type measurement_type,
  measurement_data JSONB,
  measurement_image_url_front TEXT,
  measurement_image_url_side TEXT,
  sample_image_url TEXT,
  pickup_address TEXT,
  delivery_address TEXT,
  price_total DECIMAL(10,2),
  fast_delivery_charge DECIMAL(10,2) DEFAULT 0,
  tailor_amount DECIMAL(10,2),
  delivery_date DATE,
  status job_status DEFAULT 'pending_assignment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create job status logs table
CREATE TABLE job_status_logs_tc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs_tc(id),
  updated_by UUID REFERENCES profiles_tc(id),
  old_status job_status,
  new_status job_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create notifications table
CREATE TABLE notifications_tc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles_tc(id),
  job_id UUID REFERENCES jobs_tc(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles_tc ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_tc ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_logs_tc ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_tc ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles_tc FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles_tc FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles_tc WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for jobs
CREATE POLICY "Customers can view their own jobs"
  ON jobs_tc FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Tailors can view assigned jobs"
  ON jobs_tc FOR SELECT
  USING (assigned_tailor_id = auth.uid());

CREATE POLICY "Admins can view all jobs"
  ON jobs_tc FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles_tc WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Customers can create jobs"
  ON jobs_tc FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can update jobs"
  ON jobs_tc FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles_tc WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Tailors can update assigned jobs"
  ON jobs_tc FOR UPDATE
  USING (
    assigned_tailor_id = auth.uid() AND
    status IN ('assigned', 'in_progress')
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications_tc FOR SELECT
  USING (user_id = auth.uid());

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_job_status_log()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO job_status_logs_tc (
      job_id,
      updated_by,
      old_status,
      new_status
    ) VALUES (
      NEW.id,
      auth.uid(),
      OLD.status,
      NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_status_change
  AFTER UPDATE ON jobs_tc
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_job_status_log();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_job_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify customer when job is assigned
  IF NEW.status = 'assigned' AND OLD.status = 'pending_assignment' THEN
    INSERT INTO notifications_tc (user_id, job_id, message)
    VALUES (NEW.customer_id, NEW.id, 'Your order has been assigned to a tailor');
  END IF;
  
  -- Notify customer when job is completed
  IF NEW.status = 'delivered' AND OLD.status = 'completed_by_tailor' THEN
    INSERT INTO notifications_tc (user_id, job_id, message)
    VALUES (NEW.customer_id, NEW.id, 'Your order is ready for delivery');
  END IF;
  
  -- Notify tailor when job is assigned
  IF NEW.status = 'assigned' AND OLD.status = 'pending_assignment' THEN
    INSERT INTO notifications_tc (user_id, job_id, message)
    VALUES (NEW.assigned_tailor_id, NEW.id, 'New job assigned to you');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_notification
  AFTER UPDATE ON jobs_tc
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_job_notification();