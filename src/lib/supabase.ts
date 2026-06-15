import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.example to .env.local and fill in your project keys.",
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
