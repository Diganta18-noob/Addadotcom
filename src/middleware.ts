import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const secret = process.env.NEXTAUTH_SECRET || "addadotcom-secret-key-2026-super-secure-jwt";

    // Try retrieving token with default, secureCookie=true, and secureCookie=false for Vercel proxy compatibility
    let token = await getToken({ req, secret });
    if (!token) {
      token = await getToken({ req, secret, secureCookie: true });
    }
    if (!token) {
      token = await getToken({ req, secret, secureCookie: false });
    }

    if (!token) {
      const url = new URL("/account", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const role = (token.role as string | undefined)?.toUpperCase();
    const email = token.email as string | undefined;

    const isAdminOrStaff =
      role === "ADMIN" ||
      role === "MANAGER" ||
      role === "STAFF" ||
      email === "admin@addadotcom.cafe";

    if (!isAdminOrStaff) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
