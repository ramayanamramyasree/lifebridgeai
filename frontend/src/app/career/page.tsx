"use client";

import React, { useState, useEffect } from "react";
import { apiFetch, getStoredUser } from "@/lib/api";
import { 
  Briefcase, 
  FileText, 
  Map, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Award, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState<"resume" | "roadmaps" | "applications">("resume");
  
  // Resume Review State
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer");
  const [resumeText, setResumeText] = useState("");
  const [reviewResult, setReviewResult] = useState<any | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Roadmaps State
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  // Applications State
  const [applications, setApplications] = useState<any[]>([]);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("applied");
  const [newDeadline, setNewDeadline] = useState("");

  useEffect(() => {
    loadRoadmaps();
    loadApplications();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const data = await apiFetch("/career/roadmaps");
      setRoadmaps(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await apiFetch("/career/applications");
      setApplications(data);
    } catch (e) {
      // Ignore if unauth
    }
  };

  const handleReviewResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setEvaluating(true);
    try {
      const res = await apiFetch("/career/resume-review", {
        method: "POST",
        body: JSON.stringify({
          target_role: targetRole,
          resume_text: resumeText.trim()
        })
      });
      setReviewResult(res);
    } catch (err: any) {
      alert("Error analyzing resume: " + (err.message || "Please check credentials"));
    } finally {
      setEvaluating(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;
    try {
      const created = await apiFetch("/career/applications", {
        method: "POST",
        body: JSON.stringify({
          company: newCompany.trim(),
          role_title: newRole.trim(),
          status: newStatus,
          deadline: newDeadline || null
        })
      });
      setApplications([created, ...applications]);
      setNewCompany("");
      setNewRole("");
      setNewDeadline("");
    } catch (err: any) {
      alert("Failed to track application: " + err.message);
    }
  };

  const handleDeleteApplication = async (appId: number) => {
    try {
      await apiFetch(`/career/applications/${appId}`, { method: "DELETE" });
      setApplications(applications.filter(a => a.id !== appId));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
          <Briefcase className="w-7 h-7 text-brand-violet" />
          <span>Job Seeker & Career Growth Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          ATS resume audit, structured industry pathways, and job application pipeline tracking.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-2 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab("resume")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "resume"
              ? "border-b-2 border-brand-violet text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume Reviewer</span>
        </button>

        <button
          onClick={() => setActiveTab("roadmaps")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "roadmaps"
              ? "border-b-2 border-brand-cyan text-brand-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Career Roadmaps</span>
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "applications"
              ? "border-b-2 border-emerald-400 text-emerald-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tracked Applications ({applications.length})</span>
        </button>
      </div>

      {/* TAB 1: RESUME REVIEWER */}
      {activeTab === "resume" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white">Target Role & Resume Input</h3>
              
              <form onSubmit={handleReviewResume} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Position</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-midnight-950 border border-white/10 text-white"
                  >
                    <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                    <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                    <option value="Backend Developer (Python/FastAPI)">Backend Developer (Python/FastAPI)</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paste Resume Text or Bullet Points</label>
                  <textarea
                    required
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="e.g. Developed scalable REST APIs using FastAPI and PostgreSQL, reducing latency by 35%. Implemented React UI with Tailwind CSS and Next.js..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
                  />
                </div>

                <button
                  type="submit"
                  disabled={evaluating || !resumeText.trim()}
                  className="w-full py-2.5 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{evaluating ? "Evaluating Keywords..." : "Run Structured ATS Audit"}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-6">
            {reviewResult ? (
              <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-6">
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Estimated ATS Score</span>
                    <span className="text-3xl font-extrabold text-white">
                      {reviewResult.ats_score} <span className="text-xs text-slate-400">/ 100</span>
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    Role: {targetRole}
                  </div>
                </div>

                {/* Verdict */}
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                  {reviewResult.summary_verdict}
                </p>

                {/* Strengths */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identified Strengths</h4>
                  {reviewResult.strengths.map((s: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>

                {/* Missing Keywords */}
                {reviewResult.missing_keywords && reviewResult.missing_keywords.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recommended Keywords to Include</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {reviewResult.missing_keywords.map((kw: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono">
                          +{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Portfolio Projects */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Suggested Standout Projects</h4>
                  {reviewResult.recommended_projects.map((p: string, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white/5 text-xs text-slate-300 border border-white/5">
                      • {p}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-midnight-900 border border-white/10 text-center text-xs text-slate-400">
                Paste your resume on the left and run the structured audit to view your keyword score and improvement steps.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROADMAPS */}
      {activeTab === "roadmaps" && (
        <div className="space-y-8">
          {roadmaps.map((mapItem) => (
            <div key={mapItem.id} className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-brand-cyan font-bold uppercase tracking-wider">{mapItem.category}</span>
                  <h3 className="text-lg font-bold text-white">{mapItem.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{mapItem.description}</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/5 text-xs text-slate-300 font-mono">
                  Duration: ~{mapItem.duration_months} Months
                </div>
              </div>

              {/* Stages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {mapItem.stages.map((st: any) => (
                  <div key={st.stage} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-brand-violet/20 text-brand-cyan font-bold flex items-center justify-center text-xs mb-2">
                        {st.stage}
                      </div>
                      <h4 className="font-semibold text-white">{st.title}</h4>
                      <div className="mt-2 space-y-1">
                        {st.skills.map((sk: string, sIdx: number) => (
                          <div key={sIdx} className="text-slate-400 text-[11px]">• {sk}</div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px] text-brand-cyan">
                      Milestone: {st.milestone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: APPLICATIONS TRACKER */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          {/* Add Application Form */}
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Track New Job Application</h3>
            <form onSubmit={handleCreateApplication} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="Company Name (e.g. Google, Altrix)"
                className="px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
              />
              <input
                type="text"
                required
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Role (e.g. Junior SWE, ML Intern)"
                className="px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
              />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-midnight-950 border border-white/10 text-white"
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offer Received</option>
                <option value="saved">Saved</option>
              </select>
              <input
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                placeholder="Deadline (e.g. Nov 15)"
                className="px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
              />
              <button
                type="submit"
                className="py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-90 flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Track Application</span>
              </button>
            </form>
          </div>

          {/* List of Tracked Applications */}
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Active Applications Pipeline</h3>
            {applications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No applications tracked yet. Add your applied roles above!</p>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{app.company}</span>
                      <span>—</span>
                      <span className="text-slate-300">{app.role_title}</span>
                    </div>
                    {app.deadline && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">Deadline: {app.deadline}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      app.status === "interviewing" ? "bg-amber-500/20 text-amber-300" :
                      app.status === "offered" ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-indigo/20 text-brand-cyan"
                    }`}>
                      {app.status}
                    </span>

                    <button
                      onClick={() => handleDeleteApplication(app.id)}
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
    </div>
  );
}
