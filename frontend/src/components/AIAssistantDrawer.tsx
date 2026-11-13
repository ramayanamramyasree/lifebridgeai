"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { apiFetch, getStoredUser } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  provider?: string;
}

export default function AIAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your LifeBridge AI Assistant. I can explain complex academic concepts, assess your career roadmaps, explain quiz answers, or guide you through life administration tasks.",
      provider: "LifeBridge Engine"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const user = getStoredUser();
      const res = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          language: user?.preferred_language || "en"
        })
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          provider: res.provider
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error communicating with the AI service. " + (err.message || ""),
          provider: "Error"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-cyan text-white shadow-xl shadow-brand-indigo/30 hover:scale-105 transition-all flex items-center space-x-2.5 font-medium text-sm group"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span>Ask LifeBridge AI</span>
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-midnight-900 border-l border-white/10 h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-midnight-950/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-violet/20 border border-brand-violet/40 flex items-center justify-center text-brand-cyan">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">LifeBridge Assistant</h3>
                  <p className="text-[11px] text-slate-400">Context-aware • Safe guidance</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="p-3 bg-midnight-950/40 border-b border-white/5 flex gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => handleSend("Explain Big-O time complexity with examples")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5"
              >
                Explain Big-O
              </button>
              <button
                onClick={() => handleSend("How can I optimize my software engineer resume?")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5"
              >
                Resume Tips
              </button>
              <button
                onClick={() => handleSend("How does Life Radar recommend actions?")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5"
              >
                Life Radar
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${
                    m.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      m.role === "user"
                        ? "bg-brand-indigo text-white"
                        : "bg-brand-violet/20 text-brand-cyan border border-brand-violet/30"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-brand-indigo text-white rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.provider && (
                      <span className="block mt-1 text-[10px] text-slate-400 font-mono">
                        via {m.provider}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-brand-violet animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-brand-indigo animate-bounce [animation-delay:0.4s]" />
                  <span>Synthesizing response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-midnight-950/90">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question or request guidance..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-xl bg-brand-violet text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
