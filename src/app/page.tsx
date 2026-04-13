export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-14">
      <div className="mb-12">
        <div className="space-y-5 text-base leading-relaxed text-[var(--foreground-muted)]">
          <p>
            Yes. This is a vibe coded website.  
          </p>
          <p>
            I&apos;ll use this site to dump my thoughts. It&apos;ll be my online dictionary to save my random thoughts, finds and the ocasional insight. 
          </p>

          <p>If you&apos;re new here, my goal is to get you to know me better than a 1 pager resume. </p>

          <p>
            I&apos;m orginally from Nepal. <br/> 
            I came to the <a href="/photos/about3.png" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors">United States in 2015</a> for my undergrad <br/>
            I&apos;m currently based in Arlington, Virginia <br/>
            I work in tech where I build software for an <a href="https://www.anratechnologies.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors">aviation company</a> for my 9 to 5, but like to dabble on the side.
          </p>
         

        </div>
      </div>

      <div className="mb-12">
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
          If you want to put a face to the name, here are a couple pics of me.
        </p>
        <div className="flex gap-6">
          <a
            href="/photos/about1.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
          >
            Expresso Martini action
          </a>
          <a
            href="/photos/about2.jpg"
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
            <a
              href="https://x.com/RashulRjb"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-3 transition-colors"
            >
              Twitter
            </a>{" "}
            <a
              href="https://github.com/Raashul/website"
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
