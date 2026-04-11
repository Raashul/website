export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-14">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-6">
          I&apos;m Rashul.
        </h1>
        <div className="space-y-5 text-lg leading-relaxed text-[var(--foreground-muted)]">
          <p>
            Yes. I vibe-coded this website. 
          </p>
          <p>
            I use this site to keep my thoughts organized. If I learn something interesting, I'll dump it here. If I find something cool, I'll dump it here. Its X meets Medium meets Linked(lol jk never linkedin).
          </p>

          <p>If you're new here, my goal is to allow me to get you to know me more than a 1 pager resume. </p>

          <p>
            I'm orginally from Nepal. But I'm currently based in Arlington, VA. I work in tech. I currently build software for an aviation company for my 9 to 5, but like to dabble on the side.
          </p>


        </div>
      </div>

      <div className="mb-12">
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
          If you want to put a face to the name, here are a couple pics of me.
        </p>
        <div className="flex gap-6">
          <a
            href="/photos/about1.png"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
          >
            Expresso Martini + Vibe Coding during Christmas week. 
          </a>
          <a
            href="/photos/about2.png"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
          >
            Hiking in Mt Rainier
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl mb-3">Currently</h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed">
            Building, reading, and writing. Check out what I&apos;m{" "}
            <a
              href="/working-on"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
            >
              working on
            </a>{" "}
            or browse my latest{" "}
            <a
              href="/segments"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
            >
              segments
            </a>
            .
          </p>
        </div>
        <div>
          <h2 className="font-serif text-xl mb-3">Get in touch</h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed">
            I&apos;m always happy to chat. Find me on{" "}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
            >
              Twitter
            </a>{" "}
            or{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
