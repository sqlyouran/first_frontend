import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register"];
const PROTECTED_PAGES = ["/posts/create", "/profile", "/messages"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has("refresh_token");

  // Already logged in → redirect away from auth pages
  if (hasRefreshToken && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Not logged in → redirect to login for protected pages only
  if (!hasRefreshToken && PROTECTED_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - / (homepage is public)
     * - /_next (Next.js internals)
     * - /api (API proxy routes)
     * - Static files (favicon, images, etc.)
     */
    "/((?!_next|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$)(?!$).*)",
  ],
};
