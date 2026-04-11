import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content/segments");

export interface Segment {
  slug: string;
  date: string;
  tag: string | null;
  content: string;
}

export function getAllSegments(): Segment[] {
  if (!fs.existsSync(contentDir)) return [];

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const segments = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      date: data.date || "",
      tag: data.tag || null,
      content,
    };
  });

  return segments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
