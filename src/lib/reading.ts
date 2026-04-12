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
