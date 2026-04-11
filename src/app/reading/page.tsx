"use client";

import { useState } from "react";

type Tab = "books" | "articles";

export default function ReadingPage() {
  const [tab, setTab] = useState<Tab>("books");

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-2">
        Reading
      </h1>
      <p className="text-[var(--foreground-muted)] mb-8">
        Books I&apos;ve read and articles worth sharing.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-10 border-b border-[var(--border)]">
        {(["books", "articles"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[var(--color-accent)] text-[var(--foreground)]"
                : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "books" ? (
        <p className="text-center py-16 text-[var(--foreground-muted)]">
          No books added yet.
        </p>
      ) : (
        <p className="text-center py-16 text-[var(--foreground-muted)]">
          No articles or links saved yet.
        </p>
      )}
    </div>
  );
}
