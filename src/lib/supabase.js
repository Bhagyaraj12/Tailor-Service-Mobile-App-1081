import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://laeadiuxgjbutsbtqkth.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZWFkaXV4Z2pidXRzYnRxa3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODM1NzEsImV4cCI6MjA2NzY1OTU3MX0.8uLY7B8n1HaoNTJaGFOr02V8u--QP-rJI1pnP2FWoww';

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;