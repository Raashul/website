"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BookCover } from "./book-cover";
import type { CurrentlyReadingEntry } from "@/lib/reading";

export interface GalleryBook {
  slug: string;
  title: string;
  url: string | null;
  date: string;
  cover: string | null;
  recommend: boolean;
}

interface BookGalleryProps {
  books: GalleryBook[];
  currentlyReading: CurrentlyReadingEntry | null;
  reviewContent: Record<string, ReactNode>;
}

const GRID_SIZES = "(max-width: 640px) 30vw, 112px";

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function AmazonLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium inline-flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors"
    >
      {label}
      <ExternalLinkIcon />
    </a>
  );
}

// A "YYYY-MM-DD" frontmatter date parses as UTC midnight, so formatting it in the
// viewer's local time would show the previous month everywhere west of UTC.
function formatMonth(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl tracking-tight mb-4">{children}</h2>;
}

function BookCard({
  book,
  onOpen,
  topPick,
}: {
  book: GalleryBook;
  onOpen: (book: GalleryBook) => void;
  topPick?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(book)}
      aria-label={`Read notes on ${book.title}`}
      className="group relative block w-full text-left rounded-md transition duration-200 ease-out hover:z-10 hover:-translate-y-0.5 hover:scale-[1.07] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      <BookCover cover={book.cover} title={book.title} sizes={GRID_SIZES} />
      {topPick && (
        <span className="absolute top-2 right-2 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-white shadow-sm">
          Top Pick
        </span>
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-md bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2.5 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="block text-xs font-medium leading-snug text-white line-clamp-3">
          {book.title}
        </span>
      </span>
    </button>
  );
}

function BookGrid({
  books,
  onOpen,
  topPick,
}: {
  books: GalleryBook[];
  onOpen: (book: GalleryBook) => void;
  topPick?: boolean;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(108px,1fr))] gap-3.5">
      {books.map((book) => (
        <BookCard key={book.slug} book={book} topPick={topPick} onOpen={onOpen} />
      ))}
    </div>
  );
}

function CurrentlyReadingHero({ entry }: { entry: CurrentlyReadingEntry }) {
  return (
    <section className="mb-14">
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-center">
        <div className="w-28 shrink-0 sm:w-30">
          <BookCover
            cover={entry.cover}
            title={entry.title}
            sizes="(max-width: 640px) 32vw, 120px"
            priority
          />
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Currently Reading
          </span>
          <h2 className="font-serif text-xl md:text-2xl tracking-tight mt-2">
            {entry.title}
          </h2>
          {entry.url && (
            <div className="mt-2 text-sm">
              <AmazonLink url={entry.url} label="View on Amazon" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BookModal({
  book,
  review,
  onClose,
}: {
  book: GalleryBook;
  review: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const month = formatMonth(book.date);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rounded-full p-1.5 text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex gap-4">
          <div className="w-24 shrink-0">
            <BookCover cover={book.cover} title={book.title} sizes="96px" />
          </div>
          <div className="pr-6">
            <h3 className="font-serif text-xl tracking-tight">{book.title}</h3>
            {month && (
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">{month}</p>
            )}
          </div>
        </div>

        <div className="prose text-sm text-[var(--foreground-muted)] leading-relaxed mt-5">
          {review}
        </div>

        {book.url && (
          <div className="mt-5 border-t border-[var(--border)] pt-4 text-sm">
            <AmazonLink url={book.url} label="View on Amazon" />
          </div>
        )}
      </div>
    </div>
  );
}

export function BookGallery({ books, currentlyReading, reviewContent }: BookGalleryProps) {
  const [openBook, setOpenBook] = useState<GalleryBook | null>(null);
  const recommended = books.filter((book) => book.recommend);

  if (books.length === 0 && !currentlyReading) {
    return (
      <p className="text-center py-16 text-[var(--foreground-muted)]">
        No books added yet.
      </p>
    );
  }

  return (
    <>
      {currentlyReading && (
        <CurrentlyReadingHero entry={currentlyReading} />
      )}

      {recommended.length > 0 && (
        <section className="mb-14 rounded-xl bg-[var(--color-accent)]/[0.07] ring-1 ring-[var(--color-accent)]/20 p-6">
          <SectionHeading>Top Recommends</SectionHeading>
          <BookGrid books={recommended} onOpen={setOpenBook} topPick />
        </section>
      )}

      {books.length > 0 && (
        <section>
          <SectionHeading>Library</SectionHeading>
          <BookGrid books={books} onOpen={setOpenBook} />
        </section>
      )}

      {openBook && (
        <BookModal
          book={openBook}
          review={reviewContent[openBook.slug]}
          onClose={() => setOpenBook(null)}
        />
      )}
    </>
  );
}
