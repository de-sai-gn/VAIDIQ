import { createBrowserClient } from "@supabase/ssr";
import { ENV_KEYS, requireEnv } from "@vaidiq/config";
import type { Database } from "./types";

/**
 * Supabase client for Next.js Client Components ("use client").
 * Cookie-based, so it shares the session established by the server/middleware
 * clients. Create one per component (it's cheap and memoized internally).
 */
export function createDbBrowserClient() {
  return createBrowserClient<Database>(
    requireEnv(ENV_KEYS.web.supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireEnv(ENV_KEYS.web.supabaseAnonKey, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}
