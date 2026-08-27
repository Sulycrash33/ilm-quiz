import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { MIDDLEWARE_MATCHER } from "@/lib/auth-routes";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// The pattern lives in `@/lib/auth-routes` so `npm run test:middleware` checks
// the same string this config uses, rather than a copy of it.
export const config = {
  matcher: [MIDDLEWARE_MATCHER],
};
