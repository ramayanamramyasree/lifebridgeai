"use client";

import React, { useState, useEffect } from "react";
import { apiFetch, getStoredUser } from "@/lib/api";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Filter, 
  Trophy,
  BrainCircuit
} from "lucide-react";

export default function PracticePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  useEffect(() => {
    loadQuestions();
    loadHistory();
  }, []);

  const loadQuestions = async (subject = selectedSubject, difficulty = selectedDifficulty) => {
    setLoading(true);
    setSubmissionResult(null);
    setSelectedOption(null);
    setCurrentIndex(0);
    try {
      const params = new URLSearchParams();
      if (subject !== "all") params.append("subject", subject);
      if (difficulty !== "all") params.append("difficulty", difficulty);

      const data = await apiFetch(`/practice/questions?${params.toString()}`);
      setQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await apiFetch("/practice/history");
      setStats(data);
    } catch (e) {
      // Ignore if unauth
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || submitting) return;
    const currentQ = questions[currentIndex];
    setSubmitting(true);
    try {
      const res = await apiFetch("/practice/submit", {
        method: "POST",
        body: JSON.stringify({
          question_id: currentQ.id,
          selected_option: selectedOption
        })
      });
      setSubmissionResult(res);
      loadHistory();
    } catch (err: any) {
      alert("Submission error: " + (err.message || "Please sign in to record test scores."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setSubmissionResult(null);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setSubmissionResult(null);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <BrainCircuit className="w-7 h-7 text-emerald-400" />
            <span>Interactive Practice & Assessment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Server-scored diagnostic testing across Algorithms, Data Structures, and Reasoning.
          </p>
        </div>

        {stats && (
          <div className="flex items-center space-x-3 bg-midnight-900 border border-white/10 px-4 py-2 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Answered</span>
              <span className="font-bold text-white">{stats.total_attempts}</span>
            </div>
            <div className="border-l border-white/10 pl-3">
              <span className="text-slate-400 block text-[10px]">Accuracy</span>
              <span className="font-bold text-emerald-400">{stats.accuracy_percentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-midnight-900 border border-white/10 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-1 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            loadQuestions(e.target.value, selectedDifficulty);
          }}
          className="px-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-white cursor-pointer"
        >
          <option value="all">All Subjects</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Aptitude & Reasoning">Aptitude & Reasoning</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
            loadQuestions(selectedSubject, e.target.value);
          }}
          className="px-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-white cursor-pointer"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Question Card */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading verified practice problems...</div>
      ) : !currentQ ? (
        <div className="p-12 rounded-2xl bg-midnight-900 border border-white/10 text-center text-xs text-slate-400">
          No practice questions match the selected filter. Try another subject.
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-midnight-900 border border-white/10 shadow-xl space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-brand-cyan uppercase tracking-wider">{currentQ.subject}</span>
              <span>•</span>
              <span className="text-slate-400">{currentQ.topic}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                currentQ.difficulty === "easy" ? "bg-emerald-500/20 text-emerald-400" :
                currentQ.difficulty === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-purple-500/20 text-purple-300"
              }`}>
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question_text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((optionText: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const hasSubmitted = submissionResult !== null;
              const isCorrectAnswer = hasSubmitted && submissionResult.correct_option_index === idx;
              const isWrongSelection = hasSubmitted && isSelected && !submissionResult.is_correct;

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                    isCorrectAnswer
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                      : isWrongSelection
                      ? "bg-red-500/20 border-red-500 text-red-200"
                      : isSelected
                      ? "bg-brand-violet/20 border-brand-violet text-white"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optionText}</span>
                  </div>

                  {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isWrongSelection && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Submit / Next Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {!submissionResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null || submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white text-xs font-semibold hover:opacity-95 disabled:opacity-40 transition-all ml-auto"
              >
                {submitting ? "Scoring..." : "Submit Answer"}
              </button>
            ) : (
              <div className="w-full space-y-4">
                {/* Result Feedback Banner */}
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  submissionResult.is_correct
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}>
                  <div className="font-bold mb-1 flex items-center space-x-1.5">
                    {submissionResult.is_correct ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correct! Server-calculated score: +1.0</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Incorrect. Review the detailed explanation below:</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 mt-2">{submissionResult.explanation}</p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:opacity-95 flex items-center space-x-1.5 ml-auto"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-400 font-semibold ml-auto flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>Set Completed! Great practice session.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
