/* rss.ts — atom-style RSS 2.0 feed for /journal. */

import { SITE } from "../lib/site";
import { escapeHtml } from "../partials/head";
import type { JournalIndexEntry } from "./journal";

export function rssFeed(posts: JournalIndexEntry[]): string {
  const items = posts.map(p => `
    <item>
      <title>${escapeHtml(p.title)}</title>
      <link>${SITE.url}${p.url}</link>
      <guid isPermaLink="true">${SITE.url}${p.url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeHtml(p.excerpt)}</description>
    </item>`).join("");

  const lastBuild = posts[0]
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(SITE.name)} — journal</title>
    <link>${SITE.url}/journal</link>
    <atom:link href="${SITE.url}/journal/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeHtml(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    ${items}
  </channel>
</rss>
`;
}
