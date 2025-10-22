import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Note: The app will not function correctly until these environment variables are set.
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Please check your .env file.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
