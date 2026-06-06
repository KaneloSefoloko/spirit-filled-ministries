import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rjlgidivlpqgdlafxplb.supabase.co";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = "sb_publishable_lN3e_x083cUnEBDapTbmZA_3X26fQSn";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);