import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = (token?.role as string) || "";
    const { pathname } = req.nextUrl;

    // 1. Restrict sensitive financial & report routes to ADMIN or MANAGER
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
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token }) => {
        const role = (token?.role as string) || "";
        // Only allow ADMIN, MANAGER, or STAFF roles into /admin
        return role === "ADMIN" || role === "MANAGER" || role === "STAFF";
      },
    },
    pages: {
      signIn: "/account",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
