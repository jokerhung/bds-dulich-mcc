import { readFileSync, readdirSync } from "fs";
import path from "path";
import matter from "gray-matter";

const KNOWLEDGE_DIR = path.join(process.cwd(), "content", "knowledge");
const FALLBACK_SLUG = "tong-quan";
const TOP_N = 3;

interface KnowledgeDoc {
  slug: string;
  title: string;
  tags: string[];
  content: string;
}

function stripDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function tokenize(text: string): string[] {
  return stripDiacritics(text)
    .toLowerCase()
    .replace(/[-.,!?;:"'()\[\]{}]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

let cachedDocs: KnowledgeDoc[] | null = null;

function loadKnowledgeFiles(): KnowledgeDoc[] {
  if (cachedDocs) {
    return cachedDocs;
  }
  const files = readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith(".md"));
  cachedDocs = files.map((file) => {
    const raw = readFileSync(path.join(KNOWLEDGE_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.md$/, ""),
      title: typeof data.title === "string" ? data.title : file,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      content,
    };
  });
  return cachedDocs;
}

function scoreRelevance(queryTokens: string[], doc: KnowledgeDoc): number {
  const titleTokens = tokenize(doc.title);
  const tagTokens = doc.tags.flatMap((t) => tokenize(t));
  const contentTokens = tokenize(doc.content);

  let score = 0;
  for (const qt of queryTokens) {
    if (titleTokens.includes(qt)) score += 3;
    if (tagTokens.includes(qt)) score += 3;
    score += contentTokens.filter((ct) => ct === qt).length;
  }
  return score;
}

export function getRelevantKnowledge(
  query: string
): { slug: string; content: string }[] {
  const docs = loadKnowledgeFiles();
  const queryTokens = tokenize(query);

  const scored = docs
    .map((doc) => ({ doc, score: scoreRelevance(queryTokens, doc) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);

  if (scored.length === 0) {
    const fallback = docs.find((d) => d.slug === FALLBACK_SLUG);
    if (fallback) {
      return [{ slug: fallback.slug, content: fallback.content }];
    }
    return [];
  }

  return scored.map(({ doc }) => ({ slug: doc.slug, content: doc.content }));
}
