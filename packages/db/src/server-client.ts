import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ENV_KEYS, requireEnv } from "@vaidiq/config";
import type { Database } from "./types";

/**
 * Supabase client for the Next.js App Router (Server Components, Server Actions,
 * Route Handlers). Backed by `@supabase/ssr` so each request gets its own
 * cookie-bound session — sessions are never shared across users.
 *
 * NOTE: In Next.js 15 `cookies()` is async, so this factory is async too. Await it:
 *   const supabase = await createDbServerClient();
 */
export async function createDbServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv(ENV_KEYS.web.supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireEnv(ENV_KEYS.web.supabaseAnonKey, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` is called from a Server Component, where mutating cookies
            // throws. This is safe to ignore as long as middleware refreshes the
            // session (see apps/web middleware, wired in Step 5).
          }
        },
      },
    },
  );
}
