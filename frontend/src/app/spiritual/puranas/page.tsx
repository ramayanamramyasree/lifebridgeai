"use client";
import React from 'react';
import Link from 'next/link';

export default function PuranasPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Puranic Stories</h1>
      <p className="text-sm text-slate-400">Verified passages from the Puranas with translations.</p>
      <div className="mt-4 p-4 border border-white/10 rounded">
        <p className="text-slate-300">Content coming soon. Stay tuned for verified stories and commentary.</p>
      </div>
      <Link href="/dashboard" className="text-brand-indigo underline">← Back to Dashboard</Link>
    </div>
  );
}
