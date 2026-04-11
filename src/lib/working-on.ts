import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content/working-on");

export interface CurrentProject {
  title: string;
  url: string | null;
  content: string;
}

export interface HistoryProject {
  slug: string;
  title: string;
  tagline: string;
  period: string;
  year: number;
  description: string;
  content: string;
  url: string | null;
}

export function getCurrentProject(): CurrentProject | null {
  const filePath = path.join(contentDir, "current.mdx");
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    title: data.title || "",
    url: data.url || null,
    content,
  };
}

export function getHistory(): HistoryProject[] {
  const historyDir = path.join(contentDir, "history");
  if (!fs.existsSync(historyDir)) return [];

  const files = fs.readdirSync(historyDir).filter((f) => f.endsWith(".mdx"));

  const projects = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(historyDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || slug,
      tagline: data.tagline || "",
      period: data.period || "",
      year: data.year || 0,
      description: data.description || "",
      content,
      url: data.url || null,
    };
  });

  return projects.sort((a, b) => a.year - b.year);
}
