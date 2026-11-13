"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, getStoredUser } from "@/lib/api";
import { translations, SupportedLanguage } from "@/lib/i18n";
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  Filter
} from "lucide-react";

function LearningPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [lang, setLang] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const u = getStoredUser();
    if (u?.preferred_language) setLang(u.preferred_language as SupportedLanguage);
    performSearch(initialQuery, selectedSubject, selectedDifficulty);
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const bms = await apiFetch("/learning/bookmarks").catch(() => []);
      setBookmarkedIds(bms.map((b: any) => b.id));
    } catch (e) {
      // Ignore if not logged in
    }
  };

  const performSearch = async (q: string, subject: string, difficulty: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.append("q", q.trim());
      if (subject !== "all") params.append("subject", subject);
      if (difficulty !== "all") params.append("difficulty", difficulty);

      const data = await apiFetch(`/learning/search?${params.toString()}`);
      setResources(data);
      if (data.length > 0 && !selectedResource) {
        setSelectedResource(data[0]);
      } else if (data.length === 0) {
        setSelectedResource(null);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, selectedSubject, selectedDifficulty);
  };

  const handleToggleBookmark = async (resId: number) => {
    try {
      const res = await apiFetch(`/learning/bookmarks/${resId}`, { method: "POST" });
      if (res.bookmarked) {
        setBookmarkedIds([...bookmarkedIds, resId]);
      } else {
        setBookmarkedIds(bookmarkedIds.filter(id => id !== resId));
      }
    } catch (e: any) {
      alert("Please sign in to bookmark learning topics.");
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
          <BookOpen className="w-7 h-7 text-brand-cyan" />
          <span>Student Learning & Knowledge Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Explore structured foundational breakdowns, worked examples, prerequisites, and practice problems directly within the application.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-2xl bg-midnight-900 border border-white/10 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.learning.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            {t.common.search}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center space-x-1 text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              performSearch(searchQuery, e.target.value, selectedDifficulty);
            }}
            className="px-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-slate-300 text-xs cursor-pointer"
          >
            <option value="all">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Aptitude & Reasoning">Aptitude & Reasoning</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              performSearch(searchQuery, selectedSubject, e.target.value);
            }}
            className="px-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-slate-300 text-xs cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </form>

      {/* Main Two-Column View: Topic List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Matching Topics ({resources.length})
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Searching seed database...</div>
          ) : resources.length === 0 ? (
            <div className="p-6 rounded-xl bg-midnight-900 border border-white/10 text-center text-xs text-slate-400 space-y-2">
              <p>{t.learning.noResults}</p>
            </div>
          ) : (
            resources.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedResource(item)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedResource?.id === item.id
                    ? "bg-brand-violet/15 border-brand-violet/50 shadow-lg shadow-brand-violet/10"
                    : "bg-midnight-900 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                    {item.subject}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                    item.difficulty === "beginner" ? "bg-emerald-500/20 text-emerald-400" :
                    item.difficulty === "intermediate" ? "bg-amber-500/20 text-amber-300" : "bg-purple-500/20 text-purple-300"
                  }`}>
                    {item.difficulty}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
              </button>
            ))
          )}
        </div>

        {/* Detailed Explanation Panel (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedResource ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-midnight-900 border border-white/10 shadow-xl space-y-6">
              {/* Header */}
              <div className="border-b border-white/10 pb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-brand-cyan mb-1">
                    <span>{selectedResource.subject}</span>
                    <span>•</span>
                    <span className="text-slate-400">{selectedResource.topic}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedResource.title}
                  </h2>
                </div>

                <button
                  onClick={() => handleToggleBookmark(selectedResource.id)}
                  title="Bookmark topic"
                  className={`p-2.5 rounded-xl border transition-colors ${
                    bookmarkedIds.includes(selectedResource.id)
                      ? "bg-brand-violet text-white border-brand-violet"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Prerequisites */}
              {selectedResource.prerequisites && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="font-semibold text-brand-cyan block mb-1">Recommended Prerequisites:</span>
                  <p className="text-slate-300">{selectedResource.prerequisites}</p>
                </div>
              )}

              {/* Detailed Explanation */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
                  Concept Explanation
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedResource.explanation}
                </p>
              </div>

              {/* Key Concepts */}
              {selectedResource.key_concepts && selectedResource.key_concepts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
                    {t.learning.keyConcepts}
                  </h3>
                  <div className="space-y-2">
                    {selectedResource.key_concepts.map((kc: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{kc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Worked Examples */}
              {selectedResource.worked_examples && selectedResource.worked_examples.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
                    {t.learning.workedExamples}
                  </h3>
                  {selectedResource.worked_examples.map((ex: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-midnight-950 border border-brand-cyan/20 space-y-2 text-xs">
                      <div className="font-semibold text-brand-cyan">Problem: {ex.problem}</div>
                      <div className="text-slate-300 leading-relaxed">Solution: {ex.solution}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Curated Study Plan */}
              {selectedResource.study_plan && selectedResource.study_plan.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
                    {t.learning.studyPlan}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedResource.study_plan.map((step: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-brand-violet/20 text-brand-cyan flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Resources */}
              {selectedResource.external_resources && selectedResource.external_resources.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
                    {t.learning.externalResources}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedResource.external_resources.map((link: any, idx: number) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-brand-cyan flex items-center space-x-1.5 transition-colors"
                      >
                        <span>{link.name}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Attribution */}
              {selectedResource.source_attribution && (
                <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500">
                  <span>Source Attribution: </span>
                  <span className="font-medium text-slate-400">{selectedResource.source_attribution}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-midnight-900 border border-white/10 text-center text-xs text-slate-400">
              Select any topic on the left to view the interactive breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Learning Hub...</div>}>
      <LearningPageContent />
    </Suspense>
  );
}

