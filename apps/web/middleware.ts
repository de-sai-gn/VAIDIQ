import { type NextRequest } from "next/server";
import { updateSession } from "@vaidiq/db/middleware";

// Refreshes the Supabase session on every request so Server Components always
// see a valid user. No-op until NEXT_PUBLIC_SUPABASE_* are configured.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
