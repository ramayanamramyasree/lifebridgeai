"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Briefcase, 
  HeartHandshake, 
  ShieldCheck, 
  Radar, 
  Search, 
  Cpu, 
  Lock,
  Layers,
  GraduationCap,
  Clock,
  Compass
} from "lucide-react";
import { translations, SupportedLanguage } from "@/lib/i18n";
import { getStoredUser } from "@/lib/api";

export default function LandingPage() {
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [activePersona, setActivePersona] = useState<"student" | "job_seeker" | "family" | "older_adult">("student");

  useEffect(() => {
    const user = getStoredUser();
    if (user?.preferred_language) {
      setLang(user.preferred_language as SupportedLanguage);
    } else {
      const saved = localStorage.getItem("lifebridge_lang") as SupportedLanguage;
      if (saved) setLang(saved);
    }

    const handler = (e: any) => {
      if (e.detail) setLang(e.detail);
    };
    window.addEventListener("lifebridge-lang-change", handler);
    return () => window.removeEventListener("lifebridge-lang-change", handler);
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <div className="relative overflow-hidden">
      {/* Background radial aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-hero-glow pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.hero.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          One platform for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-cyan bg-clip-text text-transparent">
            life's essential needs.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {t.hero.subhead}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white font-semibold text-sm shadow-xl shadow-brand-indigo/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>{t.hero.getStarted}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <span>{t.hero.exploreFeatures}</span>
          </a>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 text-slate-400 hover:text-white font-medium text-sm transition-colors text-center"
          >
            {t.hero.signIn}
          </Link>
        </div>

        {/* Interactive Interactive Preview Card */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-white/15 bg-midnight-900/90 backdrop-blur-xl shadow-2xl p-6 text-left relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400">lifebridge.ai/dashboard — Live Persona Preview</span>
            </div>
            <div className="flex space-x-2">
              {(["student", "job_seeker", "family", "older_adult"] as const).map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActivePersona(stage)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activePersona === stage
                      ? "bg-brand-violet text-white shadow-md shadow-brand-violet/30"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {stage.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Persona Card Body */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center space-x-2 text-brand-cyan text-xs font-semibold">
                <Radar className="w-4 h-4" />
                <span>Life Radar Recommendation</span>
              </div>
              <h4 className="text-sm font-semibold text-white">
                {activePersona === "student" && "Complete Big-O Asymptotic Complexity Mastery"}
                {activePersona === "job_seeker" && "Review Resume ATS Keyword Density for ML Role"}
                {activePersona === "family" && "Renew Home Insurance Policy & Update Records"}
                {activePersona === "older_adult" && "Confirm Prescribed Blood Pressure Capsule (08:00 AM)"}
              </h4>
              <p className="text-xs text-slate-400">
                CatBoost ML Confidence: <span className="text-emerald-400 font-mono font-bold">92.4%</span> (Ranked #1 next-action)
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center space-x-2 text-brand-violet text-xs font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>Primary Hub Resource</span>
              </div>
              <h4 className="text-sm font-semibold text-white">
                {activePersona === "student" && "Searchable Concept Hub: Worked Examples & Quizzes"}
                {activePersona === "job_seeker" && "Curated 4-Stage Software Engineer Career Roadmap"}
                {activePersona === "family" && "Family Life Responsibilities & Shared Tasks"}
                {activePersona === "older_adult" && "High-Contrast Adherence Routine & Large Text"}
              </h4>
              <p className="text-xs text-slate-400">
                Deterministic verified seed database + local offline fallback.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Permissions</span>
              </div>
              <h4 className="text-sm font-semibold text-white">
                Zero Cross-Account Data Leakage
              </h4>
              <p className="text-xs text-slate-400">
                Server-side identity verification. Clinician-prescribed instructions only — never automated drug prescribing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for every stage of your journey.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            From university algorithms and interview prep to family obligations and daily health routines, LifeBridge AI provides structured, purposeful clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-midnight-900 border border-white/10 hover:border-brand-violet/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-brand-indigo mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deep Concept Search</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Real in-app learning hub covering Computer Science, Data Structures, Mathematics, AI/ML, and Physics with worked problems and prerequisites.
            </p>
            <Link href="/learning" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center space-x-1">
              <span>Try Concept Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-midnight-900 border border-white/10 hover:border-brand-violet/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interactive Practice & Quizzes</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Server-evaluated multiple-choice testing for Algorithms, Quantitative Aptitude, and Logical Reasoning with immediate feedback.
            </p>
            <Link href="/practice" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center space-x-1">
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-midnight-900 border border-white/10 hover:border-brand-violet/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Career Hub & ATS Review</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Career pathways for Software Engineers, ML Engineers, and Security Analysts paired with structured ATS resume feedback and job application tracking.
            </p>
            <Link href="/career" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center space-x-1">
              <span>Review Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-2xl bg-midnight-900 border border-white/10 hover:border-brand-violet/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Radar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Life Radar (CatBoost Engine)</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Personalized next-action engine powered by a trained CatBoost machine learning model (0.8625 accuracy, 0.9441 ROC-AUC) and behavioral urgency rules.
            </p>
            <span className="text-xs text-amber-400 font-mono">Real ML Tabular Inference</span>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-2xl bg-midnight-900 border border-white/10 hover:border-brand-violet/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Safe Wellbeing Reminders</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              User-configured medication & appointment schedules following physician instructions. Never automated prescribing, strictly user adherence tracking.
            </p>
            <span className="text-xs text-rose-400">Physician-Safe Design</span>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-2xl bg-midnight-900 border border-white/10 hover:border-brand-violet/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Single Admin & Strict Privacy</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Strict multi-tenant account isolation. Public registration can never grant admin access. Designated idempotent admin provisioning via environment.
            </p>
            <span className="text-xs text-brand-cyan">OWASP Aligned Security</span>
          </div>
        </div>
      </section>

      {/* How Life Radar Works Section */}
      <section className="py-16 bg-midnight-900/60 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold text-brand-violet uppercase tracking-wider">Recommendation Architecture</span>
            <h2 className="text-3xl font-bold text-white mt-2">How Life Radar Recommends Next Actions</h2>
            <p className="text-sm text-slate-400 mt-3">
              Explainable, privacy-preserving next-action ranking that combines deterministic constraints with gradient-boosted ML scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-brand-indigo/20 text-brand-cyan font-bold mx-auto mb-3 flex items-center justify-center text-sm">1</div>
              <h4 className="text-sm font-semibold text-white mb-1">Lifecycle Stage</h4>
              <p className="text-xs text-slate-400">Detects whether you are studying, searching for a role, or managing family wellness.</p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-brand-violet/20 text-brand-violet font-bold mx-auto mb-3 flex items-center justify-center text-sm">2</div>
              <h4 className="text-sm font-semibold text-white mb-1">Deadlines & Tasks</h4>
              <p className="text-xs text-slate-400">Scans pending personal tasks, test dates, and user-entered appointment times.</p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold mx-auto mb-3 flex items-center justify-center text-sm">3</div>
              <h4 className="text-sm font-semibold text-white mb-1">CatBoost Ranking</h4>
              <p className="text-xs text-slate-400">Evaluates 10 heterogeneous tabular features to predict candidate relevance probability.</p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold mx-auto mb-3 flex items-center justify-center text-sm">4</div>
              <h4 className="text-sm font-semibold text-white mb-1">Explainable Action</h4>
              <p className="text-xs text-slate-400">Surfaces prioritized action with explicit reasoning and one-click execution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-brand-indigo/20 via-midnight-900 to-brand-violet/20 border border-brand-violet/30 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to experience LifeBridge AI?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            Create your account in 30 seconds. Choose your life stage and unlock your personalized dashboard immediately.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white font-semibold text-sm shadow-xl shadow-brand-indigo/30 hover:scale-105 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
