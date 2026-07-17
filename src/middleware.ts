import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 1. Unauthenticated users -> redirect to auth/login
    if (!token) {
      const loginUrl = new URL("/api/auth/signin", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token.role as string) || "CUSTOMER";

    // 2. Customers -> 403 Forbidden
    if (role === "CUSTOMER") {
      const unauthorizedUrl = new URL("/", req.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // 3. Sensitive financial/reporting routes -> Admin or Manager only
    if (pathname.startsWith("/admin/reports") || pathname.startsWith("/admin/billing")) {
      if (role !== "ADMIN" && role !== "MANAGER") {
        const forbiddenUrl = new URL("/admin/orders", req.url);
        return NextResponse.redirect(forbiddenUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
