"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar, AdminTopbar } from "@/components/layout/AdminSidebar";
import { cn } from "@/lib/utils";
import { ShieldAlert, LogIn } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // 1. Loading Session State
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-caramel border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  // 2. Role Check
  const userRole = (session?.user as any)?.role;
  const isAdminOrStaff = userRole === "ADMIN" || userRole === "MANAGER" || userRole === "STAFF";

  // 3. Unauthorized State -> Show Access Denied Card
  if (status === "unauthenticated" || !isAdminOrStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold">Admin Access Required</h2>
            <p className="text-sm text-muted-foreground">
              You must be logged in with an Admin or Staff account (`admin@addadotcom.cafe`) to view this panel.
            </p>
          </div>
          <button
            onClick={() => router.push("/account?callbackUrl=/admin")}
            className="w-full py-3 bg-espresso text-cream rounded-xl text-sm font-bold hover:bg-espresso-500 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin Layout
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <AdminTopbar sidebarCollapsed={collapsed} />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
