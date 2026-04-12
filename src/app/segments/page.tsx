import { getAllSegments } from "@/lib/segments";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Segments",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    til: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    thought: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "hot-take": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    tool: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    snippet: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  };
  return colors[tag] || "bg-[var(--surface)] text-[var(--foreground-muted)]";
}

export default function SegmentsPage() {
  const segments = getAllSegments();

  return (
    <div className="max-w-3xl mx-auto px-6 py-5">
      <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-2">
        Segments
      </h1>
      <p className="text-[var(--foreground-muted)] mb-12">
        Just random and short dump of things I learned and tools I found interesting worth saving in my personal dictonary.
      </p>

      {segments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--foreground-muted)]">
            Nothing here yet. Segments will appear as I add them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {segments.map((segment) => (
            <div
              key={segment.slug}
              className="border-l-2 border-[var(--border)] pl-5 py-1"
            >
              <div className="flex items-center gap-3 mb-2">
                <time className="text-sm text-[var(--foreground-muted)]">
                  {formatDate(segment.date)}
                </time>
                {segment.tag && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(segment.tag)}`}
                  >
                    {segment.tag}
                  </span>
                )}
              </div>
              <div className="prose text-sm leading-relaxed">
                <MDXRemote source={segment.content} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
