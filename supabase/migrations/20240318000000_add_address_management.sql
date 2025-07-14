-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses_tc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  address_type TEXT NOT NULL CHECK (address_type IN ('home', 'work', 'other')),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add delivery related columns to jobs table
ALTER TABLE jobs_tc
ADD COLUMN IF NOT EXISTS pickup_address_id UUID REFERENCES addresses_tc(id),
ADD COLUMN IF NOT EXISTS delivery_address_id UUID REFERENCES addresses_tc(id),
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'out_for_delivery', 'delivered')),
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE addresses_tc ENABLE ROW LEVEL SECURITY;

-- Policies for addresses
CREATE POLICY "Users can view their own addresses"
ON addresses_tc FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
ON addresses_tc FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
ON addresses_tc FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
ON addresses_tc FOR DELETE
USING (auth.uid() = user_id);

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION update_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE addresses_tc
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_address
BEFORE INSERT OR UPDATE ON addresses_tc
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION update_default_address();