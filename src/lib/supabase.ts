import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create dummy client if missing, so the app doesn't crash on load with a blank screen.
// We will show a warning in the UI if it's missing.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({ 
      auth: { 
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      } 
    } as any);
