import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected route prefixes that require an authenticated session
const PROTECTED_PREFIXES = ["/dashboard", "/trips"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from the login page
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - /api/auth/* (NextAuth route handler — must not be blocked)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth).*)",
  ],
};
