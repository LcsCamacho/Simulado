import type { PublicQuestion } from "./types";

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;

export function extractMarkdownImageUrls(text: string | null): string[] {
  if (!text) return [];
  const urls: string[] = [];
  for (const match of text.matchAll(MARKDOWN_IMAGE_RE)) {
    urls.push(match[1]);
  }
  return urls;
}

export function getQuestionImageUrls(question: PublicQuestion): string[] {
  const urls = new Set<string>();

  for (const file of question.files) {
    urls.add(file);
  }

  for (const url of extractMarkdownImageUrls(question.context)) {
    urls.add(url);
  }

  for (const alt of question.alternatives) {
    if (alt.file) urls.add(alt.file);
  }

  return [...urls];
}

export function getExtraFileUrls(question: PublicQuestion): string[] {
  const inContext = new Set(extractMarkdownImageUrls(question.context));
  return question.files.filter((file) => !inContext.has(file));
}

export function prefetchQuestionImages(question: PublicQuestion | undefined) {
  if (!question || typeof window === "undefined") return;

  for (const url of getQuestionImageUrls(question)) {
    const img = new Image();
    img.src = url;
  }
}
