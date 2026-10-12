import Link from "next/link";
import { BriefingChat } from "@/components/briefing-chat";
import { getBriefing, getBriefingDates, TOPIC_META } from "@/lib/briefing";
import type { BriefingItem, Topic } from "@/lib/briefing";
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

// Splits at the first sentence end that follows a lowercase letter/digit and leaves a
// reasonably long lede, so "U.S." and similar abbreviations don't cut it short.
function splitLede(summary: string): [string, string] {
  const boundary = /[a-z0-9%)"”'’][.!?]["”’']?\s+(?=[A-Z0-9"“‘'])/g;
  for (const match of summary.matchAll(boundary)) {
    const end = match.index + match[0].trimEnd().length;
    if (end >= 50) return [summary.slice(0, end), summary.slice(end).trim()];
  }
  return [summary, ""];
}

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

  const groups: { topic: Topic; items: BriefingItem[] }[] = [];
  for (const item of briefing.items) {
    const group = groups.find((g) => g.topic === item.topic);
    if (group) group.items.push(item);
    else groups.push({ topic: item.topic, items: [item] });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:grid md:grid-cols-[200px_1fr] md:gap-10">
      <nav aria-label="Past briefings" className="md:sticky md:top-20 self-start mb-8 md:mb-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-text)] mb-3">
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
                      ? "bg-[var(--surface)] text-[var(--accent-text)] font-medium"
                      : "text-[var(--foreground-strong-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {shortDate(d)}
                  {d === dates[0] && (
                    <span className="ml-2 text-[0.625rem] uppercase tracking-wide text-[var(--foreground-strong-muted)]">
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
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-text)] mb-2">
            Daily morning briefings
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
            {dateLabel}
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-strong-muted)]">
            Delivered {deliveredLabel} · {briefing.items.length} stories
          </p>
        </header>

        <nav aria-label="Topics" className="mb-4 flex flex-wrap gap-2">
          {groups.map((group) => {
            const meta = TOPIC_META[group.topic];
            return (
              <a
                key={group.topic}
                href={`#topic-${group.topic}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--foreground-body)] hover:border-[var(--accent-text)] hover:text-[var(--accent-text)] transition-colors"
              >
                <span aria-hidden>{meta.emoji}</span> {meta.label}
                <span className="ml-1 text-[var(--foreground-strong-muted)]">{group.items.length}</span>
              </a>
            );
          })}
        </nav>

        <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-[var(--accent-text)]">
            Today at a glance · {briefing.items.length} headlines
          </summary>
          <nav aria-label="Today's headlines" className="mt-3">
            <ol className="space-y-0.5">
              {briefing.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex gap-3 py-1 text-[0.9375rem] leading-snug hover:text-[var(--accent-text)] transition-colors"
                  >
                    <span aria-hidden className="w-5 shrink-0 text-center">
                      {TOPIC_META[item.topic].emoji}
                    </span>
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </details>

        {groups.map((group) => {
          const meta = TOPIC_META[group.topic];
          return (
            <section key={group.topic} id={`topic-${group.topic}`} aria-label={meta.label} className="scroll-mt-24">
              <h2 className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-text)] after:h-px after:flex-1 after:bg-[var(--border)]">
                <span aria-hidden>{meta.emoji}</span> {meta.label}
                <span className="font-normal normal-case tracking-normal text-[var(--foreground-strong-muted)]">
                  · {group.items.length}
                </span>
              </h2>
              {group.items.map((item) => {
                const [lede, rest] = splitLede(item.summary);
                return (
                  <article
                    key={item.id}
                    id={item.id}
                    className="scroll-mt-24 border-b border-[var(--border)] py-6 last:border-b-0"
                  >
                    <h3 className="max-w-[36ch] text-balance font-sans text-2xl font-bold leading-tight tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-[62ch] text-lg leading-relaxed">{lede}</p>
                    {rest && (
                      <p className="mt-3 max-w-[62ch] text-[1.0625rem] leading-[1.7] text-[var(--foreground-body)]">
                        {rest}
                      </p>
                    )}
                    {item.whyItMatters && (
                      <p className="mt-4 max-w-[62ch] rounded-lg bg-[var(--accent-surface)] px-4 py-3 text-[0.9375rem] leading-relaxed text-[var(--foreground-body)]">
                        {item.whyItMatters}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-3 text-sm">
                      <a
                        href={item.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--foreground-strong-muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent-text)] hover:decoration-current transition-colors"
                      >
                        Read source · {item.source.name}
                      </a>
                      <BriefingChat date={briefing.date} itemId={item.id} />
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </main>
    </div>
  );
}
