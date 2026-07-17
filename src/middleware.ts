import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Roles allowed to access admin routes
const ADMIN_ROLES = ["ADMIN", "MANAGER", "STAFF"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated — redirect to sign-in page
  if (!token) {
    const signInUrl = new URL("/account", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated but wrong role — redirect with error
  if (!token.role || !ADMIN_ROLES.includes(token.role as string)) {
    const unauthorizedUrl = new URL("/account", request.url);
    unauthorizedUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
