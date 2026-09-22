# scripts

## add-book-cover.mjs

Fetches book cover art from [Open Library](https://openlibrary.org) and records the
resulting path in each book's frontmatter.

Open Library is free, needs no API key, and needs no account. That is the whole reason
it is used here. The script depends only on Node built-ins plus `gray-matter`, which the
site already uses to read MDX frontmatter. Installing nothing new keeps the reading page
buildable on a clean checkout.

### Usage

Run from anywhere. The script resolves paths relative to its own location.

```bash
node scripts/add-book-cover.mjs <slug>              # one book
node scripts/add-book-cover.mjs --all               # every book missing a cover
node scripts/add-book-cover.mjs --currently-reading # the currently-reading entry
```

`<slug>` is the filename in `content/reading/books/` without the `.mdx` extension, so
`hard-things.mdx` is `hard-things`.

Covers land in `public/covers/<slug>.jpg`. The frontmatter gains a `cover` field holding
the public path.

### How a book is matched

The script tries up to three queries in order and stops at the first usable hit.

1. The ISBN-10 taken from the entry's Amazon `url`, when that URL contains one. Amazon
   `/dp/` ids are ISBN-10s for print editions and ASINs for Kindle and audio editions.
   Only the former are usable.
2. The full `title` from the frontmatter.
3. The title truncated at the first `:` or ` - `, since a long subtitle often stops the
   search from matching anything.

An ISBN identifies one edition exactly, so its result is trusted. A title does not, so
results from steps 2 and 3 are only accepted when the matched title and the frontmatter
title agree, with one being a prefix of the other. Without that check, a title search
returns a different book with a similar name and the page shows the wrong cover.

Each line of output names the query that matched and the title it matched, so you can
scan a run for anything suspicious.

### Idempotency

Re-running is safe. Any book whose `cover` field is already set is skipped, and the
script reports it as `(already set)`. Nothing is re-downloaded and nothing is
overwritten. Add a new book, run `--all`, and only the new book is fetched.

### When no cover is found

The script writes `cover: /covers/placeholder.svg` and downloads nothing. That file is a
generic book graphic checked into `public/covers/`. Pages render it in place of a real
cover, so a miss degrades quietly instead of leaving a broken image.

A miss happens when Open Library does not hold the book, which is common for recent
releases, or when it holds no cover image for the edition it does have.

### When the match is wrong

Some titles are ambiguous enough that the automatic match lands on a real but different
book. A generic title shared with another book is the usual cause, and so is a title
typed slightly differently from the published one.

Fix it by hand. Put the correct image at `public/covers/<slug>.jpg` and set the `cover`
field in the book's frontmatter to that path. The script never overwrites an existing
`cover` value, so your correction survives every later run. If no correct image is
available, set the field to `/covers/placeholder.svg`, which also pins the entry and
stops the script from re-matching it wrongly.

The same applies to `content/reading/currently-reading.json`, where `cover` is an
ordinary JSON field you can edit directly.

### When the image itself is bad

Rarely, Open Library serves a cover that is structurally a valid JPEG (so the script's
checks pass) but is visibly corrupted or redacted at the source, such as a real cover
with a block of green pixels stamped over part of it. This has been observed on Internet
Archive's own CDN, independent of anything this script does, and it affects every size
variant (`S`/`M`/`L`) of that cover, so re-running the script does not fix it. `supremacy`
hit this and now points at `/covers/placeholder.svg` by hand. If a newly-fetched cover
looks wrong when you view it, treat it the same as a wrong match above: fix it by hand.
