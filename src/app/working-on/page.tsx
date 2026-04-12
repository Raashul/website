import { getCurrentProject, getHistory } from "@/lib/working-on";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Tabs } from "@/components/tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Working On",
};

export default function WorkingOnPage() {
  const current = getCurrentProject();
  const history = getHistory();

  return (
    <div className="max-w-3xl mx-auto px-6 py-5">
      <p className="text-[var(--foreground-muted)] mb-8">
        What I&apos;m building now and everything I&apos;ve built before.
      </p>

      <Tabs tabs={["Currently working on", "History"]}>
        {/* Currently working on */}
        <div>
          {current ? (
            <div className="border-l-2 border-[var(--border)] pl-5 py-1">
              {current.url ? (
                <a
                  href={current.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-xl mb-3 inline-flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  {current.title}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <h2 className="font-serif text-xl mb-3">{current.title}</h2>
              )}
              <div className="prose leading-relaxed">
                <MDXRemote source={current.content} />
              </div>
            </div>
          ) : (
            <p className="text-center py-16 text-[var(--foreground-muted)]">
              Nothing active right now.
            </p>
          )}
        </div>

        {/* History */}
        <div>
          {history.length === 0 ? (
            <p className="text-center py-16 text-[var(--foreground-muted)]">
              No history yet.
            </p>
          ) : (
            <div className="relative border-l-2 border-[var(--border)] ml-2">
              {history.map((project) => (
                <div key={project.slug} className="relative pl-8 pb-10 last:pb-0">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[var(--foreground-muted)]" />
                  <div className="text-sm text-[var(--foreground-muted)] mb-1">
                    {project.period}
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium inline-flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                      >
                        {project.title}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <h3 className="font-medium">{project.title}</h3>
                    )}
                  </div>
                  {project.tagline && (
                    <span className="text-xs text-[var(--foreground-muted)] italic">
                      {project.tagline}
                    </span>
                  )}
                  {project.content.trim() ? (
                    <div className="prose text-sm text-[var(--foreground-muted)] leading-relaxed mt-1">
                      <MDXRemote source={project.content} />
                    </div>
                  ) : (
                    <p className="text-[var(--foreground-muted)] leading-relaxed text-sm mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
