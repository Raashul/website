import { getBooks, getArticles, getPodcasts } from "@/lib/reading";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Tabs } from "@/components/tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const quarter = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${quarter} ${d.getFullYear()}`;
}

function getPodcastTagColor(tag: string): string {
  const colors: Record<string, string> = {
    business: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    tech: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    sports: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    random: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    nature: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };
  return colors[tag] || "bg-[var(--surface)] text-[var(--foreground-muted)]";
}

export default function ReadingPage() {
  const books = getBooks();
  const articles = getArticles();
  const podcasts = getPodcasts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <p className="text-[var(--foreground-muted)] mb-8">
        Digital bookmarks for myself. 
        Someone might find it useful. Who knows 
        </p>

      <Tabs tabs={["Books", "Articles", "Podcasts"]}>
        {/* Books */}
        <div>
          {books.length === 0 ? (
            <p className="text-center py-16 text-[var(--foreground-muted)]">
              No books added yet.
            </p>
          ) : (
            <div className="space-y-8">
              {books.map((book) => (
                <div
                  key={book.slug}
                  className="border-l-2 border-[var(--border)] pl-5 py-1"
                >
                  <div className="text-xs text-[var(--foreground-muted)] mb-1">
                    {formatDate(book.date)}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {book.url ? (
                      <a
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium inline-flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors"
                      >
                        {book.title}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <h3 className="font-medium">{book.title}</h3>
                    )}
                  </div>
                  <div className="prose text-sm text-[var(--foreground-muted)] leading-relaxed">
                    <MDXRemote source={book.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Articles */}
        <div>
          {articles.length === 0 ? (
            <p className="text-center py-16 text-[var(--foreground-muted)]">
              No articles or links saved yet.
            </p>
          ) : (
            <div className="space-y-8">
              {articles.map((article) => (
                <div
                  key={article.slug}
                  className="border-l-2 border-[var(--border)] pl-5 py-1"
                >
                  <div className="text-xs text-[var(--foreground-muted)] mb-1">
                    {formatDate(article.date)}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {article.url ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium inline-flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors"
                      >
                        {article.title}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <h3 className="font-medium">{article.title}</h3>
                    )}
                  </div>
                  <div className="prose text-sm text-[var(--foreground-muted)] leading-relaxed">
                    <MDXRemote source={article.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Podcasts */}
        <div>
          {podcasts.length === 0 ? (
            <p className="text-center py-16 text-[var(--foreground-muted)]">
              No podcasts added yet.
            </p>
          ) : (
            <div className="space-y-6">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.slug}
                  className="border-l-2 border-[var(--border)] pl-5 py-1"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <a
                      href={podcast.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm inline-flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors"
                    >
                      {podcast.title}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                    {podcast.tag && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getPodcastTagColor(podcast.tag)}`}
                      >
                        {podcast.tag}
                      </span>
                    )}
                  </div>
                  {podcast.description && (
                    <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                      {podcast.description}
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
