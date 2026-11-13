"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch, getStoredUser, setStoredUser, clearStoredToken } from "@/lib/api";
import { translations, SupportedLanguage } from "@/lib/i18n";
import { 
  Radar, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  BookOpen, 
  Briefcase, 
  HeartHandshake, 
  ShieldCheck, 
  AlertCircle, 
  Star, 
  Check, 
  X,
  ExternalLink,
  Calendar,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [activeTab, setActiveTab] = useState<"overview" | "radar" | "tasks" | "reminders" | "feedback">("overview");

  // State data
  const [radarItems, setRadarItems] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [practiceStats, setPracticeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");

  // New reminder form state
  const [newRemTitle, setNewRemTitle] = useState("");
  const [newRemInstructions, setNewRemInstructions] = useState("");
  const [newRemTime, setNewRemTime] = useState("08:00 AM");
  const [newRemType, setNewRemType] = useState("medication");

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState("General");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    if (u.preferred_language) setLang(u.preferred_language as SupportedLanguage);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [rItems, tItems, remItems, pStats] = await Promise.all([
        apiFetch("/radar").catch(() => []),
        apiFetch("/tasks").catch(() => []),
        apiFetch("/reminders").catch(() => []),
        apiFetch("/practice/history").catch(() => null),
      ]);
      setRadarItems(rItems);
      setTasks(tItems);
      setReminders(remItems);
      setPracticeStats(pStats);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
    // After loading user profile, redirect based on life_stage if needed
    if (user && !user.redirectHandled) {
      const pathname = usePathname(); // locale‑aware path, e.g. "/en/dashboard"
      const localeMatch = pathname.match(/^\/([^\/]+)\/dashboard(\/.*)?$/);
      if (localeMatch) {
        const locale = localeMatch[1];
        const rest = localeMatch[2] || "";
        if (rest === "" || rest === "/") {
          const target = `/${locale}/dashboard/${user.life_stage}`;
          router.replace(target);
          // Mark to avoid loop
          user.redirectHandled = true;
          setUser({ ...user });
        }
      }
    }
    if (user && !user.redirectHandled) {
      const pathname = window.location.pathname; // locale-aware path
      const localeMatch = pathname.match(/^\/([^\/]+)\/dashboard(\/.*)?$/);
      if (localeMatch) {
        const locale = localeMatch[1];
        const rest = localeMatch[2] || "";
        if (rest === "" || rest === "/") {
          const target = `/${locale}/dashboard/${user.life_stage}`;
          router.replace(target);
          // Mark to avoid loop
          user.redirectHandled = true;
          setUser({ ...user });
        }
      }
    }
  } {
    setLoading(true);
    try {
      const [rItems, tItems, remItems, pStats] = await Promise.all([
        apiFetch("/radar").catch(() => []),
        apiFetch("/tasks").catch(() => []),
        apiFetch("/reminders").catch(() => []),
        apiFetch("/practice/history").catch(() => null),
      ]);
      setRadarItems(rItems);
      setTasks(tItems);
      setReminders(remItems);
      setPracticeStats(pStats);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const created = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          category: newTaskCategory,
          priority: newTaskPriority
        })
      });
      setTasks([created, ...tasks]);
      setNewTaskTitle("");
      loadDashboardData(); // Refresh Life Radar
    } catch (err: any) {
      alert("Error creating task: " + err.message);
    }
  };

  const handleToggleTask = async (taskId: number, currentCompleted: boolean) => {
    try {
      const updated = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !currentCompleted })
      });
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemTitle.trim()) return;
    try {
      const created = await apiFetch("/reminders", {
        method: "POST",
        body: JSON.stringify({
          title: newRemTitle.trim(),
          reminder_type: newRemType,
          prescribed_instructions: newRemInstructions.trim(),
          schedule_time: newRemTime,
          frequency: "Daily"
        })
      });
      setReminders([created, ...reminders]);
      setNewRemTitle("");
      setNewRemInstructions("");
      loadDashboardData();
    } catch (err: any) {
      alert("Error creating reminder: " + err.message);
    }
  };

  const handleReminderAction = async (remId: number, action: "taken" | "skipped") => {
    try {
      const updated = await apiFetch(`/reminders/${remId}/action`, {
        method: "POST",
        body: JSON.stringify({ action })
      });
      setReminders(reminders.map(r => r.id === remId ? updated : r));
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const handleDeleteReminder = async (remId: number) => {
    try {
      await apiFetch(`/reminders/${remId}`, { method: "DELETE" });
      setReminders(reminders.filter(r => r.id !== remId));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    try {
      await apiFetch("/feedback", {
        method: "POST",
        body: JSON.stringify({
          rating: feedbackRating,
          category: feedbackCategory,
          message: feedbackMsg.trim()
        })
      });
      setFeedbackSuccess(true);
      setFeedbackMsg("");
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (err: any) {
      alert("Error submitting feedback: " + err.message);
    }
  };

  const t = translations[lang] || translations.en;
  const stage = user?.life_stage || "student";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-midnight-900 via-midnight-850 to-midnight-800 border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-cyan mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 uppercase tracking-wide">
              {stage.replace("_", " ")}
            </span>
            <span>•</span>
            <span className="text-slate-400">{user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {stage === "student" && "Your academic mastery, quizzes, and concept recommendations are ready."}
            {stage === "job_seeker" && "Your career roadmap, ATS resume evaluation, and target milestones are ready."}
            {stage === "family" && "Your household responsibilities, schedules, and document milestones are tracked."}
            {stage === "older_adult" && "Your clinician-prescribed medication schedules and wellbeing routines are active."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {stage === "student" && (
            <Link
              href="/learning"
              className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-90 flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Search Concepts</span>
            </Link>
          )}
          {stage === "job_seeker" && (
            <Link
              href="/career"
              className="px-4 py-2 rounded-xl bg-brand-indigo text-white text-xs font-semibold hover:opacity-90 flex items-center space-x-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Resume Reviewer</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "overview"
              ? "border-b-2 border-brand-violet text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Stage Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("radar")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "radar"
              ? "border-b-2 border-amber-400 text-amber-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>Life Radar ({radarItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "tasks"
              ? "border-b-2 border-brand-cyan text-brand-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reminders")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "reminders"
              ? "border-b-2 border-rose-400 text-rose-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Wellbeing Reminders ({reminders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "feedback"
              ? "border-b-2 border-emerald-400 text-emerald-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Feedback</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Life Radar Quick Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Radar className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <h3 className="text-base font-bold text-white">Life Radar • Recommended Next Actions</h3>
              </div>
              <button
                onClick={() => setActiveTab("radar")}
                className="text-xs text-brand-cyan hover:underline"
              >
                View Details & Machine Learning Signals →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radarItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-midnight-900 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.priority}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        Score: {Math.round(item.confidence_score * 100)}%
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.reason}</p>
                  </div>
                  <Link
                    href={item.action_target}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-xs font-semibold text-brand-cyan transition-colors"
                  >
                    {item.next_action}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Stage Hub Panels */}
          {stage === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-brand-violet" />
                  <span>Student Learning Fast-Access</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Search comprehensive topic breakdowns across Computer Science, Data Structures, Mathematics, and Aptitude.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Link href="/learning?q=Big-O" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200">
                    Big-O Complexity →
                  </Link>
                  <Link href="/learning?q=Normalization" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200">
                    Database Normalization →
                  </Link>
                  <Link href="/learning?q=Gradient" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200">
                    Backpropagation →
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Practice & Assessment Stats</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-white/5">
                    <span className="text-2xl font-bold text-white">{practiceStats?.total_attempts || 0}</span>
                    <span className="block text-[11px] text-slate-400 mt-1">Questions Attempted</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <span className="text-2xl font-bold text-emerald-400">{practiceStats?.accuracy_percentage || 0}%</span>
                    <span className="block text-[11px] text-slate-400 mt-1">Verified Accuracy</span>
                  </div>
                </div>
                <Link
                  href="/practice"
                  className="block text-center py-2 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  Take Daily Practice Quiz
                </Link>
              </div>
            </div>
          )}

          {stage === "job_seeker" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-brand-indigo" />
                  <span>Career Hub & ATS Audit</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Test your resume content against ATS keywords and view customized engineering roadmaps.
                </p>
                <Link
                  href="/career"
                  className="inline-block px-4 py-2 rounded-xl bg-brand-indigo text-white text-xs font-semibold hover:opacity-90"
                >
                  Open Resume Reviewer
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-brand-cyan" />
                  <span>Tracked Job Applications</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Keep track of applied companies, interview deadlines, and feedback.
                </p>
                <Link
                  href="/career#applications"
                  className="inline-block px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"
                >
                  Manage Job Applications
                </Link>
              </div>
            </div>
          )}

          {(stage === "family" || stage === "older_adult") && (
            <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <HeartHandshake className="w-5 h-5 text-rose-400" />
                  <span>Wellbeing & Daily Adherence Protocol</span>
                </h3>
                <button
                  onClick={() => setActiveTab("reminders")}
                  className="text-xs text-brand-cyan hover:underline"
                >
                  Add Reminder →
                </button>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                Medical Disclosure: LifeBridge AI does not prescribe medications. Reminders strictly follow user-entered clinician schedules.
              </div>
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No active reminders configured yet.</p>
                ) : (
                  reminders.map((rem) => (
                    <div key={rem.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{rem.title}</span>
                        <span className="block text-[11px] text-slate-400">Scheduled: {rem.schedule_time} • {rem.prescribed_instructions || "Routine"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rem.status === "taken" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {rem.status}
                        </span>
                        {rem.status !== "taken" && (
                          <button
                            onClick={() => handleReminderAction(rem.id, "taken")}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 text-[11px] font-medium"
                          >
                            Mark Taken
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "older_adult" && (
  <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
    <h3 className="text-base font-bold text-white flex items-center space-x-2">
      <BookOpen className="w-5 h-5 text-brand-violet" />
      <span>Spiritual Library</span>
    </h3>
    <p className="text-xs text-slate-300">
      Explore verified Bhagavad Gita verses and Puranic stories with authentic translations.
    </p>
    <div className="flex flex-col space-y-2">
      <Link href="/spiritual/gita" className="px-4 py-2 rounded-xl bg-brand-indigo text-white text-xs font-semibold hover:opacity-90">
        Bhagavad Gita
      </Link>
      <Link href="/spiritual/puranas" className="px-4 py-2 rounded-xl bg-brand-indigo text-white text-xs font-semibold hover:opacity-90">
        Puranas
      </Link>
    </div>
  </div>
)}
{/* 2. LIFE RADAR TAB */}
      {activeTab === "radar" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 text-sm font-bold">
              <Radar className="w-5 h-5" />
              <span>Life Radar Machine Learning Recommendation Engine</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Life Radar evaluates your lifecycle state, upcoming milestones, past quiz retrieval accuracy, pending tasks, and urgency signals. 
              Candidate actions are ranked using our trained CatBoost classification model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {radarItems.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-midnight-900 border border-white/10 hover:border-brand-violet/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {item.priority} Priority
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      CatBoost Confidence: {Math.round(item.confidence_score * 100)}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300">{item.reason}</p>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
                    <div><span className="font-semibold text-slate-300">Category:</span> {item.category}</div>
                    <div><span className="font-semibold text-slate-300">Origin Rule:</span> {item.source_rule}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <Link
                    href={item.action_target}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white text-xs font-semibold hover:opacity-95 flex items-center space-x-1.5"
                  >
                    <span>{item.next_action}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Add Task Form */}
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Add Personal Task / Responsibility</h3>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Complete chapter 4 practice questions"
                className="sm:col-span-2 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-midnight-950 border border-white/10 text-white"
              >
                <option value="Academic">Academic</option>
                <option value="Career">Career</option>
                <option value="Wellbeing">Wellbeing</option>
                <option value="Personal">Personal</option>
              </select>
              <button
                type="submit"
                className="py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-90 flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Tracked Personal Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No tasks recorded. Add your first goal above!</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <span className={task.completed ? "line-through text-slate-500" : "text-white font-medium"}>
                      {task.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400">
                      {task.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. REMINDERS TAB */}
      {activeTab === "reminders" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            <strong>Clinical Safety Protocol:</strong> LifeBridge AI does not prescribe medication, adjust dosages, or diagnose diseases. 
            All reminders are configured strictly according to clinician-prescribed schedules entered by the user.
          </div>

          {/* Add Reminder Form */}
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Configure User-Prescribed Routine Schedule</h3>
            <form onSubmit={handleCreateReminder} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={newRemTitle}
                onChange={(e) => setNewRemTitle(e.target.value)}
                placeholder="Schedule Name (e.g. Vitamin D3, Cardiologist Checkup)"
                className="px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
              />
              <input
                type="text"
                value={newRemInstructions}
                onChange={(e) => setNewRemInstructions(e.target.value)}
                placeholder="Prescribed instructions (e.g. 1 tab after breakfast)"
                className="px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
              />
              <input
                type="text"
                required
                value={newRemTime}
                onChange={(e) => setNewRemTime(e.target.value)}
                placeholder="Time (e.g. 08:00 AM)"
                className="px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
              />
              <button
                type="submit"
                className="py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-90 flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Save Schedule</span>
              </button>
            </form>
          </div>

          {/* Reminders List */}
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Configured Schedules & Adherence</h3>
            {reminders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No schedules recorded. Configure your routine above.</p>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{rem.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-brand-indigo/20 text-brand-cyan">
                        {rem.schedule_time}
                      </span>
                    </div>
                    {rem.prescribed_instructions && (
                      <p className="text-slate-400 mt-1 text-[11px]">
                        Prescription note: {rem.prescribed_instructions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rem.status === "taken"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : rem.status === "skipped"
                        ? "bg-slate-500/20 text-slate-400"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {rem.status}
                    </span>

                    <button
                      onClick={() => handleReminderAction(rem.id, "taken")}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px]"
                    >
                      Taken
                    </button>
                    <button
                      onClick={() => handleReminderAction(rem.id, "skipped")}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-300 text-[11px]"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. FEEDBACK TAB */}
      {activeTab === "feedback" && (
        <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-white">Share Your Feedback</h3>
          <p className="text-xs text-slate-400">
            Your feedback directly informs our platform features and is monitored in the administrator console.
          </p>

          {feedbackSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you! Your feedback has been persisted and transmitted to the administration team.</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rating</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= feedbackRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600 hover:text-slate-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-midnight-950 border border-white/10 text-white text-xs"
              >
                <option value="Learning">Learning & Concept Hub</option>
                <option value="Career">Career & ATS Reviewer</option>
                <option value="Reminders">Reminders & Wellbeing</option>
                <option value="Radar">Life Radar</option>
                <option value="General">General Platform</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
              <textarea
                required
                rows={3}
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="What did you like or what can we improve?"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-violet"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-90"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
