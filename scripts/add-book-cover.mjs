import fs from "fs";
import path from "path";
import matter from "gray-matter";

const repoRoot = path.resolve(import.meta.dirname, "..");
const booksDir = path.join(repoRoot, "content/reading/books");
const coversDir = path.join(repoRoot, "public/covers");
const currentlyReadingPath = path.join(repoRoot, "content/reading/currently-reading.json");

const PLACEHOLDER = "/covers/placeholder.svg";
const YAML_OPTIONS = { lineWidth: -1 };

const USAGE = `Usage:
  node scripts/add-book-cover.mjs <slug>              one book in content/reading/books
  node scripts/add-book-cover.mjs --all               every book missing a cover
  node scripts/add-book-cover.mjs --currently-reading the currently-reading entry`;

async function fetchOnce(url) {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response;
}

async function fetchWithRetry(url) {
  try {
    return await fetchOnce(url);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return fetchOnce(url);
  }
}

function shortenTitle(title) {
  const [head] = title.split(/:| - /);
  return head.trim();
}

// Amazon /dp/ ids are ISBN-10s for print books and ASINs (B...) for audio/Kindle.
function isbnFromUrl(url) {
  const match = /\/dp\/(\d{9}[\dX])(?:[/?]|$)/.exec(url ?? "");
  return match ? match[1] : null;
}

function normalizeTitle(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

// A title query happily returns a different book with a similar name, so the
// result only counts when one title is a prefix of the other (subtitle or not).
function titlesAgree(expected, candidate) {
  const a = normalizeTitle(expected);
  const b = normalizeTitle(candidate);
  return a.length > 0 && b.length > 0 && (a.startsWith(b) || b.startsWith(a));
}

async function searchCoverId(query, expectedTitle) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`;
  const response = await fetchWithRetry(url);
  if (!response) return null;
  const { docs = [] } = await response.json();
  const hit = docs.find(
    (doc) => doc.cover_i && (!expectedTitle || titlesAgree(expectedTitle, doc.title))
  );
  return hit ? { coverId: hit.cover_i, matched: hit.title, via: query } : null;
}

async function findCoverId(title, url) {
  const isbn = isbnFromUrl(url);
  const attempts = [];
  if (isbn) attempts.push([isbn, null]);
  attempts.push([title, title]);
  const shortened = shortenTitle(title);
  if (shortened && shortened !== title) attempts.push([shortened, title]);

  for (const [query, expectedTitle] of attempts) {
    const hit = await searchCoverId(query, expectedTitle);
    if (hit) return hit;
  }
  return null;
}

async function downloadCover(coverId, destination) {
  const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`;
  const response = await fetchWithRetry(url);
  if (!response) return false;

  const bytes = Buffer.from(await response.arrayBuffer());
  // Open Library sometimes answers 200 with a blank 1x1 placeholder instead of 404.
  const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isJpeg || bytes.length < 2000) return false;

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
  return true;
}

async function resolveCover({ title, url, slug }) {
  const hit = await findCoverId(title, url);
  if (!hit) return { cover: PLACEHOLDER };
  const saved = await downloadCover(hit.coverId, path.join(coversDir, `${slug}.jpg`));
  if (!saved) return { cover: PLACEHOLDER };
  return { cover: `/covers/${slug}.jpg`, matched: hit.matched, via: hit.via };
}

function report(slug, { cover, matched, via, skipped }) {
  if (cover === PLACEHOLDER) {
    console.log(`${slug} -> placeholder${skipped ? " (already set)" : " (no confident match)"}`);
    return;
  }
  const source = matched ? ` [${via} -> ${matched}]` : "";
  console.log(`${slug} -> ${cover}${skipped ? " (already set)" : source}`);
}

async function addBookCover(slug) {
  const filePath = path.join(booksDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) throw new Error(`no such book: ${filePath}`);

  const parsed = matter(fs.readFileSync(filePath, "utf-8"));
  if (parsed.data.cover) {
    report(slug, { cover: parsed.data.cover, skipped: true });
    return;
  }

  const result = await resolveCover({
    title: parsed.data.title || slug,
    url: parsed.data.url,
    slug,
  });
  parsed.data.cover = result.cover;
  fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data, YAML_OPTIONS));
  report(slug, result);
}

async function addAllBookCovers() {
  const slugs = fs
    .readdirSync(booksDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));

  for (const slug of slugs) {
    await addBookCover(slug);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function slugifyTitle(title) {
  return title
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function addCurrentlyReadingCover() {
  const entry = JSON.parse(fs.readFileSync(currentlyReadingPath, "utf-8"));
  const slug = slugifyTitle(entry.title);

  if (entry.cover) {
    report(slug, { cover: entry.cover, skipped: true });
    return;
  }

  const result = await resolveCover({ title: entry.title, url: entry.url, slug });
  entry.cover = result.cover;
  fs.writeFileSync(currentlyReadingPath, `${JSON.stringify(entry, null, 2)}\n`);
  report(slug, result);
}

const [arg] = process.argv.slice(2);

const modes = {
  "--all": addAllBookCovers,
  "--currently-reading": addCurrentlyReadingCover,
};

if (!arg || (arg.startsWith("-") && !modes[arg])) {
  console.error(USAGE);
  process.exit(1);
}

const run = modes[arg] ?? (() => addBookCover(arg));

run().catch((error) => {
  console.error(`failed: ${error.message}`);
  process.exit(1);
});
