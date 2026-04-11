"use client";

import { useState } from "react";

interface TabsProps {
  tabs: string[];
  children: React.ReactNode[];
}

export function Tabs({ tabs, children }: TabsProps) {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="flex gap-1 mb-10 border-b border-[var(--border)]">
        {tabs.map((label, i) => (
          <button
            key={label}
            onClick={() => setActive(i)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              active === i
                ? "border-[var(--color-accent)] text-[var(--foreground)]"
                : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {children[active]}
    </>
  );
}
