import Link from "next/link";
import { getBriefing, getBriefingDates, TOPIC_META } from "@/lib/briefing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Briefing",
};

const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default async function BriefingPage(props: PageProps<"/briefing">) {
  const { date } = await props.searchParams;
  const dates = await getBriefingDates();

  if (dates.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-center py-16 text-[var(--foreground-muted)]">
          No briefing yet. Check back after 8 AM ET.
        </p>
      </div>
    );
  }

  const selected = typeof date === "string" && dates.includes(date) ? date : dates[0];
  const briefing = await getBriefing(selected);

  if (!briefing) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-center py-16 text-[var(--foreground-muted)]">
          No briefing yet. Check back after 8 AM ET.
        </p>
      </div>
    );
  }

  const dateLabel = new Date(briefing.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const deliveredLabel = new Date(briefing.generatedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:grid md:grid-cols-[200px_1fr] md:gap-10">
      <nav aria-label="Past briefings" className="md:sticky md:top-20 self-start mb-8 md:mb-0">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-accent)] mb-3">
          Past briefings
        </p>
        <ul className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {dates.map((d) => {
            const active = d === selected;
            return (
              <li key={d} className="shrink-0 md:shrink">
                <Link
                  href={`/briefing?date=${d}`}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-[var(--surface)] text-[var(--color-accent)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {shortDate(d)}
                  {d === dates[0] && (
                    <span className="ml-2 text-[0.625rem] uppercase tracking-wide text-[var(--foreground-muted)]">
                      Today
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="min-w-0">
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-accent)] mb-2">
            Your morning briefing
          </p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
            {dateLabel}
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Delivered {deliveredLabel} · {briefing.items.length} stories
          </p>
        </header>

        <div>
          {briefing.items.map((item) => {
            const meta = TOPIC_META[item.topic];
            return (
              <article
                key={item.id}
                className="border-b border-[var(--border)] py-7 first:pt-0"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)] mb-2">
                  {meta.emoji} {meta.label}
                </p>
                <h2 className="font-serif text-xl md:text-2xl tracking-tight">
                  {item.title}
                </h2>
                <p className="mt-2 text-[var(--foreground-muted)] leading-relaxed">
                  {item.summary}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <a
                    href={item.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm inline-flex items-center gap-1.5 text-[var(--foreground-muted)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    Read source · {item.source.name}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <span
                    title="Chat connects in a later phase"
                    className="text-sm text-[var(--foreground-muted)]/60 cursor-default select-none"
                  >
                    💬 Ask
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
