import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-2">
        Blog
      </h1>
      <p className="text-[var(--foreground-muted)] mb-12">
        Long-form thoughts on engineering, product, and everything in between.
      </p>

      {posts.length === 0 ? (
        <p className="text-[var(--foreground-muted)]">Nothing here yet. Check back soon.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <time className="text-sm text-[var(--foreground-muted)]">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="font-serif text-xl mt-1 group-hover:text-[var(--color-accent)] transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-[var(--foreground-muted)] leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
