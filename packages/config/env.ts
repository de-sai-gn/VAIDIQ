/**
 * Single source of truth for the public environment variable *names* VaidIQ uses,
 * plus a strict guard for reading them.
 *
 * Why per-runtime keys: Next.js statically inlines `NEXT_PUBLIC_*` and Expo inlines
 * `EXPO_PUBLIC_*` at build time. That inlining only works when the bundler sees a
 * *literal* `process.env.SOME_KEY` access — a dynamic `process.env[key]` lookup is
 * NOT inlined and breaks in the browser/native bundle. So we never read env here;
 * we only centralize the key names and provide `requireEnv()` for callers to wrap
 * their own literal access (see @vaidiq/db server-client / mobile-client).
 */
export const ENV_KEYS = {
  web: {
    supabaseUrl: "NEXT_PUBLIC_SUPABASE_URL",
    supabaseAnonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  },
  mobile: {
    supabaseUrl: "EXPO_PUBLIC_SUPABASE_URL",
    supabaseAnonKey: "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  },
} as const;

/**
 * Fail fast (at client construction) with an actionable message when a required
 * public env var is missing, instead of surfacing a cryptic Supabase auth error later.
 * Returns the value narrowed to `string`.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (value === undefined || value.length === 0) {
    throw new Error(
      `[@vaidiq/config] Missing required environment variable "${name}". ` +
        `Add it to the app's environment (see the app's .env.example).`,
    );
  }
  return value;
}
