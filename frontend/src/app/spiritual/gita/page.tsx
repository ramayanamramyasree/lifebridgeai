"use client";
import React from 'react';
import Link from 'next/link';

export default function GitaPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bhagavad Gita</h1>
      <p className="text-sm text-slate-400">Verified verses from the Bhagavad Gita with translations.</p>
      <div className="mt-4 p-4 border border-white/10 rounded">
        <p className="text-slate-300">Content coming soon. Stay tuned for verified verses and commentary.</p>
      </div>
      <Link href="/dashboard" className="text-brand-indigo underline">← Back to Dashboard</Link>
    </div>
  );
}
