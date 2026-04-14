export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-[var(--foreground-muted)]">
        <span>&copy; {new Date().getFullYear()} Rashul</span>
        <div className="flex gap-4">
          <a
            href="https://github.com/Raashul"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://x.com/RashulRjb"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            X
          </a>
        </div>
      </div>
    </footer>
  );
}
