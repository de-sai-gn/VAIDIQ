import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

/**
 * Refreshes the Supabase auth session in Next.js middleware and forwards the
 * rotated cookies onto both the request and the response (the @supabase/ssr
 * pattern). Wire it from apps/web/middleware.ts.
 *
 * If Supabase env isn't configured yet, this is a no-op pass-through so the app
 * still runs pre-integration — it activates automatically once NEXT_PUBLIC_* are set.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() (not getSession()) revalidates the token with the auth
  // server and triggers the cookie refresh. Do not run code between client
  // creation and this call.
  await supabase.auth.getUser();

  return response;
}
