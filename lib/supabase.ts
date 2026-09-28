import { createClient, SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* values are baked in at build time, so they must be referenced literally.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.trim();

export const supabaseConfigured = !!(url && key);

let client: SupabaseClient | null = null;

/** Browser Supabase client. Returns null when the env vars aren't set (the UI shows a setup notice). */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured || typeof window === "undefined") return null;
  if (!client) client = createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}
