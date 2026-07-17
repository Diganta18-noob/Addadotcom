import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = (token?.role as string) || "CUSTOMER";
    const { pathname } = req.nextUrl;

    // 1. Customers cannot access /admin routes -> redirect to /account
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/account", req.url));
    }

    // 2. Sensitive routes -> Admin or Manager only
    if (
      (pathname.startsWith("/admin/reports") || pathname.startsWith("/admin/billing")) &&
      role !== "ADMIN" &&
      role !== "MANAGER"
    ) {
      return NextResponse.redirect(new URL("/admin/orders", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/account",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
