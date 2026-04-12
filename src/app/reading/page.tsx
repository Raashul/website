import { getBooks, getArticles } from "@/lib/reading";
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

export default function ReadingPage() {
  const books = getBooks();
  const articles = getArticles();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <p className="text-[var(--foreground-muted)] mb-8">
        This is mostly for future me. <br /> Anything insightful I read,
        I&apos;ll try to summarize it in 5 sentences or less so that I can come
        back to it to rejog my memory. My memory for save information has a
        short TTL so coming back to this will be helpful.
      </p>

      <Tabs tabs={["Books", "Articles"]}>
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
      </Tabs>
    </div>
  );
}
