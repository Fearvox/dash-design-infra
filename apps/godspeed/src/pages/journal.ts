/* journal.ts — index of journal posts. */

import { head } from "../partials/head";
import { nav } from "../partials/nav";
import { footer } from "../partials/footer";

export interface JournalIndexEntry {
  slug: string;
  url: string;
  title: string;
  date: string;       // ISO date YYYY-MM-DD
  dateLabel: string;  // "may 22, 2026"
  excerpt: string;
}

export function journalIndexPage(opts: {
  posts: JournalIndexEntry[];
  stylesInline: string;
}): string {
  const { posts, stylesInline } = opts;
  return `${head({
    title: "journal",
    description: "monthly-ish notes from godspeed — what's pouring, what's baking, what's happening.",
    path: "/journal",
    stylesInline,
  })}
${nav("/journal")}
<main>
  <article class="gs-content">
    <h1>journal</h1>
    <p>monthly-ish notes from the shop. ${posts.length === 0 ? "first post coming soon — y'all hang tight." : ""}</p>
    <div class="gs-journal-list">
      ${posts.map(p => `
      <a class="gs-journal-card" href="${p.url}">
        <div class="gs-date">${p.dateLabel}</div>
        <h3>${p.title}</h3>
        <p class="gs-excerpt">${p.excerpt}</p>
      </a>`).join("")}
    </div>
  </article>

  <section class="gs-newsletter">
    <h2>get the journal in your inbox</h2>
    <form action="https://buttondown.com/api/emails/embed-subscribe/godspeed" method="post" target="popupwindow" onsubmit="window.open('https://buttondown.com/godspeed', 'popupwindow')">
      <input type="email" name="email" placeholder="you@example.com" required aria-label="email address">
      <button type="submit">subscribe</button>
    </form>
  </section>
</main>
${footer()}
`;
}

export function journalPostPage(opts: {
  title: string;
  date: string;
  dateLabel: string;
  bodyMarkdownHtml: string;
  url: string;
  excerpt: string;
  stylesInline: string;
}): string {
  return `${head({
    title: opts.title,
    description: opts.excerpt,
    path: opts.url,
    stylesInline: opts.stylesInline,
  })}
${nav("/journal")}
<main>
  <article class="gs-content">
    <p><a href="/journal">← journal</a></p>
    <p class="gs-date" style="font-family: var(--gs-font-ui); font-size: var(--gs-size-label); text-transform: lowercase; color: var(--gs-ink-muted);">${opts.dateLabel}</p>
    <h1>${opts.title}</h1>
    ${opts.bodyMarkdownHtml}
  </article>
</main>
${footer()}
`;
}
