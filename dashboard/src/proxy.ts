import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/clients", "/settings"];
const AUTH_ROUTES = ["/login", "/onboarding"];

/**
 * Optimistic auth check (Proxy / middleware).
 * The backend is the source of truth for the JWT; here we only check the
 * presence of the httpOnly `authToken` cookie to redirect unauthenticated
 * users away from protected routes and authenticated users away from auth pages.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("authToken")?.value);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
