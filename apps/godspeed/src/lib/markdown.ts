/* markdown.ts — front-matter + GFM markdown → HTML.
 *
 * We trust author markdown (only Roger and 0xvox write it). If we ever open
 * authoring to untrusted users, swap this for a sanitizing renderer.
 */

import matter from "gray-matter";
import { marked } from "marked";

export interface ParsedDoc<TMeta = Record<string, unknown>> {
  meta: TMeta;
  html: string;
  raw: string;
}

marked.setOptions({
  gfm: true,
  breaks: false,
});

export async function parseMarkdown<TMeta = Record<string, unknown>>(
  source: string,
): Promise<ParsedDoc<TMeta>> {
  const parsed = matter(source);
  const html = await marked.parse(parsed.content);
  return {
    meta: parsed.data as TMeta,
    html,
    raw: parsed.content,
  };
}

/** Excerpt the first paragraph of a parsed body, plain text, capped to ~180 chars. */
export function excerpt(raw: string, max = 180): string {
  const firstPara = raw
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .find(Boolean) ?? "";
  const plain = firstPara
    .replace(/[#>*_`~]+/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

/** Slugify a filename or string: lowercase, ASCII, hyphenated. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
