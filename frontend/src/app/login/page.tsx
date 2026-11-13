"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, setStoredToken, setStoredUser } from "@/lib/api";
import { Sparkles, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        })
      });

      setStoredToken(data.access_token);
      setStoredUser(data.user);
      if (data.user.preferred_language) {
        localStorage.setItem("lifebridge_lang", data.user.preferred_language);
      }
      if (data.user.high_contrast) {
        localStorage.setItem("lifebridge_contrast", "true");
        document.body.classList.add("high-contrast");
      }

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        // After login, redirect to locale‑aware stage dashboard
        const locale = (() => {
          try {
            // Extract locale from the current pathname (e.g. "/en/login")
            const path = window.location.pathname;
            const parts = path.split("/").filter(Boolean);
            return parts[0] || "en";
          } catch {
            return "en";
          }
        })();
        const target = `/${locale}/dashboard/${data.user.life_stage}`;
        router.replace(target);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickFill = () => {
    setEmail("admin@lifebridge.ai");
    setPassword("LifeBridgeAdmin2026!");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-midnight-900 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-violet flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-indigo/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to LifeBridge AI</h2>
          <p className="text-xs text-slate-400 mt-1">Access your personalized stage dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-violet"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-violet"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white font-semibold text-sm shadow-xl shadow-brand-indigo/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <span>{loading ? "Signing In..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Designated Admin Demo Helper */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <button
            onClick={handleAdminQuickFill}
            type="button"
            className="text-[11px] text-amber-400/80 hover:text-amber-300 hover:underline inline-flex items-center space-x-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Fill Designated Admin Credentials (Demo)</span>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-brand-cyan hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
