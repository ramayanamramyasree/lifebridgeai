"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, setStoredToken, setStoredUser } from "@/lib/api";
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, User, GraduationCap, Briefcase, UserCheck, Users, UserRound, HelpCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lifeStage, setLifeStage] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [highContrast, setHighContrast] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          life_stage: lifeStage,
          preferred_language: preferredLanguage,
          high_contrast: highContrast,
          font_size_preference: "normal"
        })
      });

      setStoredToken(data.access_token);
      setStoredUser(data.user);
      localStorage.setItem("lifebridge_lang", data.user.preferred_language);
      // After successful registration, redirect to locale‑aware stage dashboard
        const locale = (() => {
          try {
            const path = window.location.pathname;
            const parts = path.split("/").filter(Boolean);
            return parts[0] || "en";
          } catch {
            return "en";
          }
        })();
        const target = `/${locale}/dashboard/${data.user.life_stage}`;
        router.replace(target);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-midnight-900 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-violet flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-indigo/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h2>
          <p className="text-xs text-slate-400 mt-1">One platform. Support for every stage of life.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-violet"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-violet"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-violet"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Life Stage Selection Cards */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {[ 
                { value: "school_student", label: "School Student", icon: User, desc: "Learn subjects, practice questions, and improve study skills." },
                { value: "college_student", label: "College Student", icon: GraduationCap, desc: "Explore advanced learning, projects, internships, and placements." },
                { value: "job_seeker", label: "Job Seeker", icon: Briefcase, desc: "Prepare resumes, interviews, and job applications." },
                { value: "employee", label: "Employee", icon: UserCheck, desc: "Improve professional skills, manage goals, and organize work." },
                { value: "parent_caregiver", label: "Parent / Caregiver", icon: Users, desc: "Organize family activities and caregiving responsibilities." },
                { value: "older_adult", label: "Older Adult", icon: UserRound, desc: "Access simple digital assistance, everyday services, and optional cultural learning." },
                { value: "other", label: "Other", icon: HelpCircle, desc: "Get general assistance and select relevant interests." }
              ].map(opt => (
                <label key={opt.value} className="flex items-center p-3 rounded-xl bg-midnight-800 border border-white/10 cursor-pointer hover:border-brand-cyan/30">
                  <input
                    type="radio"
                    name="lifeStage"
                    value={opt.value}
                    checked={lifeStage === opt.value}
                    onChange={() => setLifeStage(opt.value)}
                    className="mr-3 h-4 w-4 text-brand-cyan focus:ring-brand-cyan border-white/30"
                  />
                  <opt.icon className="w-5 h-5 mr-2 text-white" />
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{opt.label}</span>
                    <span className="text-xs text-slate-400">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-midnight-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-violet"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-2">
            <input
              type="checkbox"
              id="contrast"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-brand-violet focus:ring-0"
            />
            <label htmlFor="contrast" className="text-xs text-slate-300 cursor-pointer">
              Enable accessible high-contrast layout
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white font-semibold text-sm shadow-xl shadow-brand-indigo/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 mt-4"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-cyan hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
