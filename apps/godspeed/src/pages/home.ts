/* home.ts — landing. hero, open-now, info grid, recent journal teaser, newsletter. */

import { head } from "../partials/head";
import { nav } from "../partials/nav";
import { footer } from "../partials/footer";
import { hoursPill, HOURS_PILL_CLIENT_JS } from "../partials/hoursPill";
import { SITE } from "../lib/site";
import type { HoursConfig } from "../lib/hours";
import type { JournalIndexEntry } from "./journal";
import { DAYS } from "../lib/hours";

const DAY_LABELS: Record<string, string> = {
  sunday: "sun", monday: "mon", tuesday: "tue", wednesday: "wed",
  thursday: "thu", friday: "fri", saturday: "sat",
};

export function homePage(opts: {
  hours: HoursConfig;
  recentPosts: JournalIndexEntry[];
  stylesInline: string;
  bodyMarkdownHtml: string;
}): string {
  const { hours, recentPosts, stylesInline, bodyMarkdownHtml } = opts;

  return `${head({
    title: SITE.name,
    path: "/",
    stylesInline,
  })}
${nav("/")}
<main>
  <section class="gs-hero">
    <div class="gs-logo-mark">
      <img src="/logo.jpg" alt="godspeed coffee logo — two cream-colored geese on a brick-red background, one holding a clothespin, one holding a steaming espresso cup" loading="eager" width="180" height="180">
    </div>
    <h1>${SITE.name}</h1>
    <p class="gs-tagline">${SITE.tagline}</p>
    <div>${hoursPill(hours)}</div>
  </section>

  <article class="gs-content">
    ${bodyMarkdownHtml}
  </article>

  <section class="gs-info-grid">
    <div class="gs-block">
      <h2>where</h2>
      <p>
        ${SITE.address.street}<br>
        ${SITE.address.city}, ${SITE.address.state} ${SITE.address.zip}
      </p>
      <p>
        <a href="https://maps.google.com/?q=${encodeURIComponent(`${SITE.address.street} ${SITE.address.city} ${SITE.address.state}`)}" target="_blank" rel="noopener">open in maps →</a>
      </p>
    </div>
    <div class="gs-block">
      <h2>when</h2>
      <ul class="gs-hours-table">
        ${DAYS.map(d => {
          const w = hours.schedule[d];
          const label = w ? `${w.open}–${w.close}` : "closed";
          return `<li><span>${DAY_LABELS[d]}</span><span>${label}</span></li>`;
        }).join("")}
      </ul>
    </div>
  </section>

  ${recentPosts.length > 0 ? `
  <section class="gs-wide">
    <h2>from the journal</h2>
    <div class="gs-journal-list">
      ${recentPosts.slice(0, 3).map(p => journalCard(p)).join("\n      ")}
    </div>
    <p><a href="/journal">see all journal posts →</a></p>
  </section>
  ` : ""}

  <section class="gs-newsletter">
    <h2>the journal — straight to your inbox</h2>
    <p>monthly-ish notes on what's pouring, what's baking, and what's happening in the shop. no spam, just letters.</p>
    <form action="https://buttondown.com/api/emails/embed-subscribe/godspeed" method="post" target="popupwindow" onsubmit="window.open('https://buttondown.com/godspeed', 'popupwindow')">
      <input type="email" name="email" placeholder="you@example.com" required aria-label="email address">
      <button type="submit">subscribe</button>
    </form>
  </section>
</main>
${footer()}
<script>${HOURS_PILL_CLIENT_JS}</script>
`;
}

function journalCard(p: JournalIndexEntry): string {
  return `<a class="gs-journal-card" href="${p.url}">
    <div class="gs-date">${p.dateLabel}</div>
    <h3>${p.title}</h3>
    <p class="gs-excerpt">${p.excerpt}</p>
  </a>`;
}
