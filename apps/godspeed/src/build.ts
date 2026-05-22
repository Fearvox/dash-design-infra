#!/usr/bin/env bun
/* build.ts — godspeed.coffee build entrypoint.
 *
 *   bun run apps/godspeed/build
 *
 * Reads content/*.md and content/hours.json, renders all pages, writes dist/.
 * Copies public/ into dist/ at the end.
 *
 * Fail-loud philosophy: any malformed input throws with line-level detail.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

import { APP_ROOT, CONTENT_DIR, DIST_DIR, PUBLIC_DIR, STYLES_DIR } from "./lib/site";
import { excerpt, parseMarkdown, slugify } from "./lib/markdown";
import { validateHours, type HoursConfig } from "./lib/hours";
import { homePage } from "./pages/home";
import { menuPage } from "./pages/menu";
import { ourStoryPage } from "./pages/ourStory";
import { journalIndexPage, journalPostPage, type JournalIndexEntry } from "./pages/journal";
import { notFoundPage } from "./pages/notFound";
import { rssFeed } from "./pages/rss";

interface JournalFrontmatter {
  title?: string;
  /** Authored as `2026-05-22` (string) but YAML may cast to Date. We normalize. */
  date?: string | Date;
  draft?: boolean;
}

function normalizeDate(d: unknown, file: string): string {
  if (d instanceof Date) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  throw new Error(`journal/${file}: date must be YYYY-MM-DD, got ${JSON.stringify(d)}`);
}

async function readText(p: string): Promise<string> {
  return await fs.readFile(p, "utf8");
}

async function writeFile(p: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, "utf8");
}

async function copyDir(src: string, dest: string): Promise<number> {
  let count = 0;
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(src, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      count += await copyDir(s, d);
    } else if (e.isFile()) {
      await fs.mkdir(path.dirname(d), { recursive: true });
      await fs.copyFile(s, d);
      count += 1;
    }
  }
  return count;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  const month = d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" }).toLowerCase();
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

async function loadStyles(): Promise<string> {
  const tokens = await readText(path.join(STYLES_DIR, "tokens.css"));
  const base = await readText(path.join(STYLES_DIR, "base.css"));
  // crude minify: strip line comments + collapse runs of whitespace
  const combined = `${tokens}\n${base}`;
  return combined
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .trim();
}

async function loadHours(): Promise<HoursConfig> {
  const raw = await readText(path.join(CONTENT_DIR, "hours.json"));
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`hours.json: invalid JSON — ${(err as Error).message}`);
  }
  validateHours(parsed);
  return parsed;
}

async function loadJournalPosts(): Promise<{
  entries: JournalIndexEntry[];
  bodies: Map<string, { meta: JournalFrontmatter; html: string; raw: string }>;
}> {
  const journalDir = path.join(CONTENT_DIR, "journal");
  let files: string[] = [];
  try {
    files = await fs.readdir(journalDir);
  } catch {
    return { entries: [], bodies: new Map() };
  }

  const entries: JournalIndexEntry[] = [];
  const bodies = new Map<string, { meta: JournalFrontmatter; html: string; raw: string }>();

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    if (file.startsWith("_")) continue; // _drafts/ or _foo.md
    const filePath = path.join(journalDir, file);
    const src = await readText(filePath);
    const parsed = await parseMarkdown<JournalFrontmatter>(src);
    if (parsed.meta.draft) continue;
    if (!parsed.meta.title || !parsed.meta.date) {
      throw new Error(`journal/${file}: requires {title, date} in frontmatter`);
    }
    // gray-matter / YAML auto-casts unquoted `2026-05-22` to a Date object.
    // Normalize back to YYYY-MM-DD so the rest of the pipeline can trust strings.
    const date = normalizeDate(parsed.meta.date, file);
    const slug = slugify(file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""));
    const url = `/journal/${slug}`;
    entries.push({
      slug,
      url,
      title: parsed.meta.title,
      date,
      dateLabel: formatDateLabel(date),
      excerpt: excerpt(parsed.raw),
    });
    bodies.set(slug, { meta: parsed.meta, html: parsed.html, raw: parsed.raw });
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { entries, bodies };
}

async function loadContentMd(name: string): Promise<{ html: string; raw: string; meta: Record<string, unknown> }> {
  const p = path.join(CONTENT_DIR, "pages", `${name}.md`);
  const src = await readText(p);
  return parseMarkdown(src);
}

async function loadMenuMd(): Promise<string> {
  const p = path.join(CONTENT_DIR, "menu.md");
  const src = await readText(p);
  const parsed = await parseMarkdown(src);
  return parsed.html;
}

async function cleanDist(): Promise<void> {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });
}

async function main(): Promise<void> {
  const t0 = Date.now();
  console.log(`[godspeed] build start`);
  console.log(`[godspeed] app root: ${path.relative(process.cwd(), APP_ROOT)}`);

  await cleanDist();

  const [styles, hours, journal, home, ourStory, menuHtml] = await Promise.all([
    loadStyles(),
    loadHours(),
    loadJournalPosts(),
    loadContentMd("home"),
    loadContentMd("our-story"),
    loadMenuMd(),
  ]);

  console.log(`[godspeed] css bundle: ${(styles.length / 1024).toFixed(1)} kb`);
  console.log(`[godspeed] journal posts: ${journal.entries.length}`);

  // home
  await writeFile(
    path.join(DIST_DIR, "index.html"),
    homePage({
      hours,
      recentPosts: journal.entries,
      stylesInline: styles,
      bodyMarkdownHtml: home.html,
    }),
  );

  // menu
  await writeFile(
    path.join(DIST_DIR, "menu", "index.html"),
    menuPage({ hours, stylesInline: styles, bodyMarkdownHtml: menuHtml }),
  );

  // our-story
  await writeFile(
    path.join(DIST_DIR, "our-story", "index.html"),
    ourStoryPage({ stylesInline: styles, bodyMarkdownHtml: ourStory.html }),
  );

  // journal index
  await writeFile(
    path.join(DIST_DIR, "journal", "index.html"),
    journalIndexPage({ posts: journal.entries, stylesInline: styles }),
  );

  // individual journal posts
  for (const entry of journal.entries) {
    const body = journal.bodies.get(entry.slug);
    if (!body) continue;
    await writeFile(
      path.join(DIST_DIR, "journal", entry.slug, "index.html"),
      journalPostPage({
        title: entry.title,
        date: entry.date,
        dateLabel: entry.dateLabel,
        bodyMarkdownHtml: body.html,
        url: entry.url,
        excerpt: entry.excerpt,
        stylesInline: styles,
      }),
    );
  }

  // RSS
  await writeFile(
    path.join(DIST_DIR, "journal", "feed.xml"),
    rssFeed(journal.entries),
  );

  // 404
  await writeFile(
    path.join(DIST_DIR, "404.html"),
    notFoundPage({ stylesInline: styles }),
  );

  // copy public/
  const copied = await copyDir(PUBLIC_DIR, DIST_DIR);
  console.log(`[godspeed] copied ${copied} files from public/`);

  const dt = Date.now() - t0;
  console.log(`[godspeed] build done in ${dt}ms → ${path.relative(process.cwd(), DIST_DIR)}`);
}

main().catch(err => {
  console.error("[godspeed] build failed:", err);
  process.exit(1);
});
