import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anon key is missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.");
}

if (supabaseAnonKey.startsWith("sb_secret_")) {
  throw new Error("Supabase secret key cannot be used in the browser. Use the anon public key.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
