"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role?.toUpperCase();
      if (["ADMIN", "MANAGER", "STAFF"].includes(role)) {
        router.replace(callbackUrl);
      } else {
        router.replace(callbackUrl.startsWith("/admin") ? "/account" : callbackUrl);
      }
    }
  }, [status, session, router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.ok) {
        window.location.href = callbackUrl;
      } else {
        setError(result?.error || "Invalid email or password");
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred during login.");
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-card border border-border/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-full bg-espresso flex items-center justify-center group-hover:bg-espresso-500 transition-colors shadow-md">
            <Coffee className="w-6 h-6 text-caramel" />
          </div>
          <span className="font-serif text-2xl font-bold text-foreground">AddaDotCom</span>
        </Link>
        <h2 className="text-2xl font-serif font-bold text-foreground mt-2">
          Portal Access
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to manage orders, kitchen, billing & dashboard
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 flex items-center gap-2 animate-shake">
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@addadotcom.cafe"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-espresso text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-espresso text-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-espresso hover:bg-espresso-500 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-caramel" />
          Secure Enterprise Authentication
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-warm flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 noise-bg">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-2xl shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-caramel mb-2" />
            <p className="text-sm text-muted-foreground">Loading Login Portal...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
