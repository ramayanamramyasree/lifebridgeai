"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getStoredToken, getStoredUser, clearStoredToken } from "@/lib/api";
import { translations, SupportedLanguage } from "@/lib/i18n";
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  Briefcase, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon,
  Sun,
  Moon,
  Globe
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    if (u?.preferred_language) {
      setLang(u.preferred_language as SupportedLanguage);
    } else {
      const savedLang = localStorage.getItem("lifebridge_lang") as SupportedLanguage;
      if (savedLang) setLang(savedLang);
    }

    const savedContrast = localStorage.getItem("lifebridge_contrast") === "true";
    if (savedContrast) {
      setHighContrast(true);
      document.body.classList.add("high-contrast");
    }
  }, [pathname]);

  const changeLanguage = (newLang: SupportedLanguage) => {
    setLang(newLang);
    localStorage.setItem("lifebridge_lang", newLang);
    window.dispatchEvent(new CustomEvent("lifebridge-lang-change", { detail: newLang }));
  };

  const toggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    localStorage.setItem("lifebridge_contrast", String(nextVal));
    if (nextVal) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  };

  const handleLogout = () => {
    clearStoredToken();
    setUser(null);
    router.push("/");
  };

  const t = translations[lang] || translations.en;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-midnight-950/80 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-violet flex items-center justify-center shadow-lg shadow-brand-indigo/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-cyan bg-clip-text text-transparent">
              LifeBridge <span className="text-brand-violet">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Unified Life Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          <Link
            href="/learning"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              pathname.startsWith("/learning")
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4 text-brand-cyan" />
            <span>{t.nav.learning}</span>
          </Link>

          <Link
            href="/practice"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              pathname.startsWith("/practice")
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.nav.practice}</span>
          </Link>

          <Link
            href="/career"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              pathname.startsWith("/career")
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-4 h-4 text-brand-violet" />
            <span>{t.nav.career}</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                pathname === "/dashboard"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{t.nav.dashboard}</span>
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-brand-violet/20 text-brand-violet border border-brand-violet/30"
                  : "text-amber-300 hover:text-white hover:bg-amber-500/10"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{t.nav.admin}</span>
            </Link>
          )}
        </nav>

        {/* Right Controls: High Contrast, Language Selector, Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            title="Toggle Accessible High Contrast"
            className={`p-2 rounded-lg border transition-all ${
              highContrast
                ? "bg-white text-black border-white"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Multilingual Selector */}
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-brand-cyan mr-1.5" />
            <select
              value={lang}
              aria-label="Preferred Language"
              onChange={(e) => changeLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-midnight-900 text-white">English</option>
              <option value="hi" className="bg-midnight-900 text-white">हिंदी (Hindi)</option>
              <option value="te" className="bg-midnight-900 text-white">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Auth State Buttons */}
          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200"
              >
                <div className="w-6 h-6 rounded-full bg-brand-indigo/30 flex items-center justify-center text-brand-cyan font-bold">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <span className="max-w-[100px] truncate">{user.full_name}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-brand-indigo to-brand-violet text-white shadow-md shadow-brand-indigo/25 hover:opacity-95 transition-opacity"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
