import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content/reading");

export interface ReadingEntry {
  slug: string;
  title: string;
  url: string | null;
  date: string;
  content: string;
}

export interface PodcastEntry {
  slug: string;
  title: string;
  episode: string;
  tag: string | null;
  description: string;
  url: string;
  thumbnail: string | null;
}

function getEntries(subdir: string): ReadingEntry[] {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const entries = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(dir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || slug,
      url: data.url || null,
      date: data.date || "",
      content,
    };
  });

  return entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBooks(): ReadingEntry[] {
  return getEntries("books");
}

export function getArticles(): ReadingEntry[] {
  return getEntries("articles");
}

export function getPodcasts(): PodcastEntry[] {
  const dir = path.join(contentDir, "podcasts");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(dir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      slug,
      title: data.title || slug,
      episode: data.episode || "",
      tag: data.tag || null,
      description: data.description || "",
      url: data.url || "",
      thumbnail: data.thumbnail || null,
    };
  });
}
