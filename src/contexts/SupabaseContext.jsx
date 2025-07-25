import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const SupabaseContext = createContext();

export const useAuth = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseProvider');
  }
  return context;
};

// Generate a proper UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Simplified database setup with no complex policies that could cause recursion
const setupDatabase = async () => {
  try {
    console.log('Setting up database tables...');
    
    // Create users_tc table if not exists
    await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS users_tc (
          id UUID PRIMARY KEY,
          phone_number TEXT,
          role TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );`
    }).catch(() => {
      console.log('RPC failed, trying direct approach...');
    });

    // Create jobs_tc table if not exists with proper columns
    await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS jobs_tc (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          customer_id UUID,
          customer_phone TEXT,
          category TEXT,
          design TEXT,
          add_ons JSONB DEFAULT '[]',
          delivery_date TIMESTAMP WITH TIME ZONE,
          measurement_data JSONB DEFAULT '{}',
          pickup_address_id UUID,
          delivery_address_id UUID,
          delivery_status TEXT DEFAULT 'pending',
          delivery_notes TEXT,
          delivered_at TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'Pending Assignment',
          total_price DECIMAL,
          assigned_tailor_id UUID,
          assignment_amount DECIMAL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );`
    }).catch(() => {
      console.log('Direct table creation failed');
    });

    // Create addresses_tc table if not exists
    await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS addresses_tc (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          address_type TEXT NOT NULL,
          full_name TEXT NOT NULL,
          phone_number TEXT,
          address_line1 TEXT NOT NULL,
          address_line2 TEXT,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          pincode TEXT NOT NULL,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );`
    }).catch(() => {
      console.log('Address table creation failed');
    });

    // Setup simple RLS policies that won't cause recursion
    await supabase.rpc('exec_sql', {
      query: `
        -- Enable RLS
        ALTER TABLE users_tc ENABLE ROW LEVEL SECURITY;
        ALTER TABLE jobs_tc ENABLE ROW LEVEL SECURITY;
        ALTER TABLE addresses_tc ENABLE ROW LEVEL SECURITY;
        
        -- Drop any existing policies
        DROP POLICY IF EXISTS "Allow all operations for users" ON users_tc;
        DROP POLICY IF EXISTS "Allow all operations for jobs" ON jobs_tc;
        DROP POLICY IF EXISTS "Allow all operations for addresses" ON addresses_tc;
        DROP POLICY IF EXISTS "Users can view their own profile" ON users_tc;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON users_tc;
        
        -- Create simple policies that allow all operations (for demo purposes)
        CREATE POLICY "anon_access_users" ON users_tc FOR ALL USING (true);
        CREATE POLICY "anon_access_jobs" ON jobs_tc FOR ALL USING (true);
        CREATE POLICY "anon_access_addresses" ON addresses_tc FOR ALL USING (true);`
    }).catch(() => {
      console.log('Policy setup failed');
    });

    console.log('Database setup complete.');

    // Create demo tailors with simpler approach
    const { data: existingTailors } = await supabase
      .from('users_tc')
      .select('id')
      .eq('role', 'tailor')
      .limit(1);

    if (!existingTailors || existingTailors.length === 0) {
      await supabase.from('users_tc').insert([
        {
          id: '00000000-0000-4000-a000-000000000001',
          phone_number: '+91 98765 43212',
          role: 'tailor'
        },
        {
          id: '00000000-0000-4000-a000-000000000002',
          phone_number: '+91 98765 43213',
          role: 'tailor'
        }
      ]);
      console.log('Demo tailors created.');
    }
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize database tables
  useEffect(() => {
    const initDb = async () => {
      try {
        // Check if users_tc table exists with a simple count
        const { count, error } = await supabase
          .from('users_tc')
          .select('*', { count: 'exact', head: true });

        if (error) {
          // Table likely doesn't exist, setup database
          await setupDatabase();
        }
        
        setDbInitialized(true);
      } catch (error) {
        console.error('Error checking/initializing database:', error);
        // Attempt setup anyway
        try {
          await setupDatabase();
          setDbInitialized(true);
        } catch (setupError) {
          console.error('Error in database setup:', setupError);
        }
      }
    };

    initDb();
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!dbInitialized) return;

    const initAuth = async () => {
      try {
        setLoading(true);
        // Check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          // Get user details from users_tc table
          const { data: userData, error: userError } = await supabase
            .from('users_tc')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
          } else if (userData) {
            setUser(currentSession.user);
            setUserId(userData.id);
            setUserRole(userData.role);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
          setUserId(null);
        } else if (event === 'SIGNED_IN' && newSession?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users_tc')
            .select('*')
            .eq('id', newSession.user.id)
            .single();

          if (!userError && userData) {
            setUser(newSession.user);
            setUserId(userData.id);
            setUserRole(userData.role);
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [dbInitialized]);

  // Enhanced demo login function with proper UUID and simplified error handling
  const login = async (userData) => {
    if (!dbInitialized) {
      alert('Database not initialized yet. Please try again in a moment.');
      return;
    }

    try {
      setLoading(true);
      console.log('Demo login started with:', userData);

      // Generate a proper UUID for the user
      const userId = generateUUID();

      // Check if user exists by phone and role
      const { data: existingUser, error: checkError } = await supabase
        .from('users_tc')
        .select('*')
        .eq('phone_number', userData.phoneNumber)
        .eq('role', userData.role)
        .single();

      let finalUser;
      if (checkError && checkError.code === 'PGRST116') {
        // User not found, create new
        console.log('Creating new user with UUID:', userId);
        
        const { data: newUser, error: insertError } = await supabase
          .from('users_tc')
          .insert([{
            id: userId,
            phone_number: userData.phoneNumber,
            role: userData.role
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user:', insertError);
          throw new Error('Failed to create user account');
        }

        finalUser = newUser;
        console.log('Created new user:', newUser);
      } else if (checkError) {
        console.error('Error checking user:', checkError);
        throw new Error('Database error when checking for existing user');
      } else {
        finalUser = existingUser;
        console.log('Found existing user:', existingUser);
      }

      // Set user state
      setUser({
        id: finalUser.id,
        phone: finalUser.phone_number,
        phoneNumber: finalUser.phone_number
      });
      setUserId(finalUser.id);
      setUserRole(finalUser.role);

      console.log('Demo login completed successfully');
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Login failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (session) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setUserRole(null);
      setUserId(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Firestore-like queries for Supabase with simplified error handling
  const useFirestore = (tableName, queryConstraints = []) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (!dbInitialized) return;

      const fetchData = async () => {
        try {
          setLoading(true);
          console.log(`Fetching data from ${tableName} with constraints:`, queryConstraints);

          // Start query
          let query = supabase.from(tableName).select('*');

          // Apply where constraints
          queryConstraints.forEach(constraint => {
            if (constraint.type === 'where') {
              const { field, operator, value } = constraint;
              console.log(`Applying where: ${field} ${operator} ${value}`);
              switch (operator) {
                case '==':
                  query = query.eq(field, value);
                  break;
                case 'in':
                  query = query.in(field, value);
                  break;
                case '!=':
                  query = query.neq(field, value);
                  break;
                default:
                  console.warn(`Unsupported operator: ${operator}`);
                  break;
              }
            }

            // Apply orderBy constraints
            if (constraint.type === 'orderBy') {
              const { field, direction } = constraint;
              console.log(`Applying orderBy: ${field} ${direction}`);
              query = query.order(field, { ascending: direction === 'asc' });
            }
          });

          // Execute query
          const { data, error: queryError } = await query;

          if (queryError) {
            console.error(`Error querying ${tableName}:`, queryError);
            setError(queryError);
          } else {
            console.log(`Successfully fetched ${data?.length || 0} records from ${tableName}`);

            // Format data to match the expected structure
            const formattedData = (data || []).map(item => {
              // Parse JSON fields
              let addOns = [];
              let measurementData = {};
              try {
                addOns = typeof item.add_ons === 'string' ? JSON.parse(item.add_ons) : item.add_ons || [];
              } catch (e) {
                console.warn('Error parsing add_ons:', e);
                addOns = [];
              }

              try {
                measurementData = typeof item.measurement_data === 'string' ? JSON.parse(item.measurement_data) : item.measurement_data || {};
              } catch (e) {
                console.warn('Error parsing measurement_data:', e);
                measurementData = {};
              }

              return {
                ...item,
                // Include both snake_case and camelCase versions for compatibility
                customerId: item.customer_id,
                customerPhone: item.customer_phone,
                tailorId: item.tailor_id,
                assignedTailorId: item.assigned_tailor_id,
                assignmentAmount: item.assignment_amount,
                totalPrice: item.total_price,
                addOns: addOns,
                measurementData: measurementData,
                // Format dates
                createdAt: { toDate: () => new Date(item.created_at || Date.now()) },
                updatedAt: { toDate: () => new Date(item.updated_at || Date.now()) },
                deliveryDate: { toDate: () => new Date(item.delivery_date || Date.now()) }
              };
            });

            setDocuments(formattedData);
          }
        } catch (err) {
          console.error(`Error fetching ${tableName}:`, err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [tableName, JSON.stringify(queryConstraints), dbInitialized]);

    return { documents, loading, error };
  };

  const addDocument = async (tableName, data) => {
    if (!dbInitialized) {
      throw new Error('Database not initialized yet.');
    }

    try {
      console.log(`Adding document to ${tableName}:`, data);

      // Generate UUID for new document
      const docId = generateUUID();

      // Ensure deliveryDate is a valid date
      let deliveryDateString;
      if (data.delivery_date) {
        deliveryDateString = data.delivery_date instanceof Date ? data.delivery_date.toISOString() : new Date(data.delivery_date).toISOString();
      } else if (data.deliveryDate) {
        deliveryDateString = data.deliveryDate instanceof Date ? data.deliveryDate.toISOString() : new Date(data.deliveryDate).toISOString();
      } else {
        deliveryDateString = new Date().toISOString();
      }

      // Convert data to snake_case for Supabase
      const supabaseData = {
        id: docId,
        customer_id: data.customer_id || userId,
        customer_phone: data.customer_phone || user?.phone || user?.phoneNumber || 'Demo User',
        category: data.category,
        design: data.design,
        add_ons: typeof data.add_ons === 'string' ? data.add_ons : 
                 typeof data.addOns === 'string' ? data.addOns : 
                 JSON.stringify(data.add_ons || data.addOns || []),
        delivery_date: deliveryDateString,
        measurement_data: typeof data.measurement_data === 'string' ? data.measurement_data :
                          typeof data.measurementData === 'string' ? data.measurementData :
                          JSON.stringify(data.measurement_data || data.measurementData || {}),
        pickup_address_id: data.pickup_address_id || (data.pickupAddress ? data.pickupAddress.id : null),
        delivery_address_id: data.delivery_address_id || (data.deliveryAddress ? data.deliveryAddress.id : null),
        delivery_status: data.delivery_status || 'pending',
        status: data.status || 'Pending Assignment',
        total_price: parseFloat(data.total_price || data.totalPrice) || 0,
        assigned_tailor_id: data.assigned_tailor_id || data.assignedTailorId || null,
        assignment_amount: data.assignment_amount || data.assignmentAmount ? parseFloat(data.assignment_amount || data.assignmentAmount) : null
      };

      console.log('Formatted data for Supabase:', supabaseData);

      const { data: newDoc, error } = await supabase
        .from(tableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error(`Error adding document to ${tableName}:`, error);
        throw error;
      }

      console.log('Successfully added document:', newDoc);
      return newDoc.id;
    } catch (error) {
      console.error(`Error adding document to ${tableName}:`, error);
      throw error;
    }
  };

  const updateDocument = async (tableName, id, updateData) => {
    if (!dbInitialized) {
      throw new Error('Database not initialized yet.');
    }

    try {
      console.log(`Updating document in ${tableName} with ID ${id}:`, updateData);

      // Convert camelCase to snake_case for Supabase
      const supabaseData = {};

      // Map camelCase to snake_case
      if (updateData.tailorId !== undefined) supabaseData.tailor_id = updateData.tailorId;
      if (updateData.assignedTailorId !== undefined) supabaseData.assigned_tailor_id = updateData.assignedTailorId;
      if (updateData.assignmentAmount !== undefined) supabaseData.assignment_amount = parseFloat(updateData.assignmentAmount);
      if (updateData.status !== undefined) supabaseData.status = updateData.status;
      if (updateData.totalPrice !== undefined) supabaseData.total_price = parseFloat(updateData.totalPrice);
      if (updateData.customerPhone !== undefined) supabaseData.customer_phone = updateData.customerPhone;
      if (updateData.category !== undefined) supabaseData.category = updateData.category;
      if (updateData.design !== undefined) supabaseData.design = updateData.design;
      if (updateData.addOns !== undefined) supabaseData.add_ons = typeof updateData.addOns === 'string' ? updateData.addOns : JSON.stringify(updateData.addOns);
      if (updateData.deliveryDate !== undefined) {
        supabaseData.delivery_date = updateData.deliveryDate instanceof Date ? updateData.deliveryDate.toISOString() : new Date(updateData.deliveryDate).toISOString();
      }
      if (updateData.measurementData !== undefined) supabaseData.measurement_data = typeof updateData.measurementData === 'string' ? updateData.measurementData : JSON.stringify(updateData.measurementData);

      // Direct snake_case property assignment
      if (updateData.assigned_tailor_id !== undefined) supabaseData.assigned_tailor_id = updateData.assigned_tailor_id;
      if (updateData.assignment_amount !== undefined) supabaseData.assignment_amount = parseFloat(updateData.assignment_amount);
      if (updateData.delivery_status !== undefined) supabaseData.delivery_status = updateData.delivery_status;
      if (updateData.delivery_notes !== undefined) supabaseData.delivery_notes = updateData.delivery_notes;
      if (updateData.delivered_at !== undefined) supabaseData.delivered_at = updateData.delivered_at;
      if (updateData.updated_at !== undefined) supabaseData.updated_at = updateData.updated_at;

      // Always update the updated_at timestamp
      supabaseData.updated_at = new Date().toISOString();

      console.log('Formatted update data for Supabase:', supabaseData);

      const { data, error } = await supabase
        .from(tableName)
        .update(supabaseData)
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating document in ${tableName}:`, error);
        throw error;
      }

      console.log('Successfully updated document:', data);
      return data;
    } catch (error) {
      console.error(`Error updating document in ${tableName}:`, error);
      throw error;
    }
  };

  // Helper functions for creating query constraints
  const where = (field, operator, value) => {
    return { type: 'where', field: field, operator, value };
  };

  const orderBy = (field, direction = 'asc') => {
    return { type: 'orderBy', field: field, direction };
  };

  const value = {
    user,
    userRole,
    userId,
    loading,
    login,
    logout,
    useFirestore,
    addDocument,
    updateDocument,
    where,
    orderBy,
    supabase, // Expose supabase client for direct queries if needed
    dbInitialized
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};