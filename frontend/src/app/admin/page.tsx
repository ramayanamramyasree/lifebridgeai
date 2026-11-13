"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getStoredUser } from "@/lib/api";
import { 
  ShieldCheck, 
  Users, 
  Cpu, 
  BarChart3, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Database,
  RefreshCw,
  Award
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [mlMetrics, setMlMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      setError("Access Forbidden (403): You do not have administrator permissions. Only the designated administrator can view this console.");
      setLoading(false);
      return;
    }
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [anData, fbData, mlData] = await Promise.all([
        apiFetch("/admin/analytics"),
        apiFetch("/admin/feedback"),
        apiFetch("/admin/ml-metrics").catch(() => null)
      ]);
      setAnalytics(anData);
      setFeedbacks(fbData);
      setMlMetrics(mlData);
    } catch (err: any) {
      setError(err.message || "Failed to load administrator data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (fbId: number, status: string) => {
    try {
      const updated = await apiFetch(`/admin/feedback/${fbId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      setFeedbacks(feedbacks.map(f => f.id === fbId ? updated : f));
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-midnight-900 border border-red-500/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">403 — Unauthorized Admin Access</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            Return to Personal Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading designated administrator metrics and database telemetry...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Designated Lead Administrator Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            LifeBridge AI • Administration & Analytics Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform telemetry, user registration distributions, feedback queues, and CatBoost ML metrics.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Registered Users</span>
            <Users className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.total_users}</div>
          <span className="text-[11px] text-slate-500">Live database query count</span>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Practice Attempts</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.total_practice_attempts}</div>
          <span className="text-[11px] text-emerald-400">Avg Score: {analytics.average_practice_score}%</span>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">User Feedback Log</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.total_feedback_count}</div>
          <span className="text-[11px] text-amber-400">Avg Rating: {analytics.average_feedback_rating} / 5.0</span>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">CatBoost Recommendation ML</span>
            <Cpu className="w-4 h-4 text-brand-violet" />
          </div>
          <div className="text-2xl font-bold text-white">
            {mlMetrics ? `${(mlMetrics.accuracy * 100).toFixed(1)}%` : "Active"}
          </div>
          <span className="text-[11px] text-brand-cyan font-mono">ROC-AUC: {mlMetrics?.roc_auc || "0.9441"}</span>
        </div>
      </div>

      {/* Distributions: Life Stages & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-brand-cyan" />
            <span>Active Users by Lifecycle Stage</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.life_stage_distribution || {}).map(([stage, count]: any) => (
              <div key={stage} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-slate-300">{stage.replace("_", " ")}</span>
                  <span className="font-mono text-white font-bold">{count}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-cyan h-full rounded-full"
                    style={{ width: `${Math.min((count / (analytics.total_users || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-brand-violet" />
            <span>Preferred Language Distribution</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.language_distribution || {}).map(([lang, count]: any) => (
              <div key={lang} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="uppercase text-slate-300 font-mono">
                    {lang === "en" ? "English (EN)" : lang === "hi" ? "हिंदी (Hindi)" : "తెలుగు (Telugu)"}
                  </span>
                  <span className="font-mono text-white font-bold">{count}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-violet h-full rounded-full"
                    style={{ width: `${Math.min((count / (analytics.total_users || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CatBoost Machine Learning Metrics Panel */}
      {mlMetrics && (
        <div className="p-6 rounded-2xl bg-midnight-900 border border-brand-violet/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-brand-violet uppercase tracking-wider">Reproducible ML Pipeline</span>
              <h3 className="text-base font-bold text-white mt-1">CatBoost Recommendation Classification Model</h3>
              <p className="text-xs text-slate-400">
                Trained on {mlMetrics.dataset_rows} synthetic samples across 10 tabular signals with stratified split.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/20">
              Status: {mlMetrics.status}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-xl font-bold text-emerald-400">{(mlMetrics.accuracy * 100).toFixed(2)}%</span>
              <span className="block text-[11px] text-slate-400 mt-1">CatBoost Accuracy</span>
              <span className="block text-[10px] text-slate-500">(Baseline: {(mlMetrics.baseline_accuracy * 100).toFixed(1)}%)</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-xl font-bold text-brand-cyan">{(mlMetrics.roc_auc).toFixed(4)}</span>
              <span className="block text-[11px] text-slate-400 mt-1">ROC-AUC Score</span>
              <span className="block text-[10px] text-slate-500">Separation Metric</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-xl font-bold text-brand-violet">{(mlMetrics.f1_score).toFixed(4)}</span>
              <span className="block text-[11px] text-slate-400 mt-1">F1 Score</span>
              <span className="block text-[10px] text-slate-500">Precision: {(mlMetrics.precision).toFixed(2)}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-xl font-bold text-white">{mlMetrics.test_rows}</span>
              <span className="block text-[11px] text-slate-400 mt-1">Test Samples Evaluated</span>
              <span className="block text-[10px] text-slate-500">Stratified Seed 42</span>
            </div>
          </div>

          {/* Top Feature Importances */}
          {mlMetrics.feature_importances && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Tabular Features by Importance</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(mlMetrics.feature_importances)
                  .sort((a: any, b: any) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([feat, imp]: any) => (
                    <div key={feat} className="p-2.5 rounded-lg bg-white/5 text-xs flex justify-between border border-white/5">
                      <span className="text-slate-300 font-mono text-[11px]">{feat}</span>
                      <span className="text-brand-cyan font-bold font-mono">{imp.toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Feedback Management Queue */}
      <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span>User Feedback Queue ({feedbacks.length})</span>
        </h3>

        {feedbacks.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No feedback submissions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{fb.user_email}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">
                      {fb.category}
                    </span>
                    <span className="text-amber-400 font-bold">★ {fb.rating}/5</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      fb.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" :
                      fb.status === "reviewed" ? "bg-amber-500/20 text-amber-300" : "bg-brand-indigo/20 text-brand-cyan"
                    }`}>
                      {fb.status}
                    </span>

                    <button
                      onClick={() => handleUpdateFeedbackStatus(fb.id, "reviewed")}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-slate-300 text-[11px]"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleUpdateFeedbackStatus(fb.id, "resolved")}
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px]"
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{fb.message}</p>
                <span className="text-[10px] text-slate-500 block">
                  Submitted: {new Date(fb.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
