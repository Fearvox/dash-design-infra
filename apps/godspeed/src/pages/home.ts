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
    <h1>godspeed<span class="gs-wordmark-coffee">coffee</span></h1>
    <p class="gs-tagline">${SITE.tagline}</p>
    <div>${hoursPill(hours)}</div>
  </section>

  <article class="gs-content">
    ${bodyMarkdownHtml}
  </article>

  <figure class="gs-photo-wide">
    <picture>
      <source srcset="/photos/exterior-sign.webp" type="image/webp">
      <img src="/photos/exterior-sign.jpg" alt="the godspeed sign — wordmark in stacked rounded type with two cream birds, mounted on the brick exterior" loading="lazy" decoding="async" width="640" height="800">
    </picture>
    <figcaption>the sign on saluda ave</figcaption>
  </figure>

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

  <section class="gs-photo-strip">
    ${photoStripCard("the-nectar-matcha", "the nectar with matcha — purple powder being sifted over an iced drink with frothy crema", "the nectar, matcha edition")}
    ${photoStripCard("espresso-machine", "the slayer espresso machine on the bar, glasses lined on top, warm grid lighting overhead", "the slayer")}
    ${photoStripCard("interior-fresh", "a smiling face latte-art reveal in dark espresso crema", "some mornings the espresso smiles back")}
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
    <form class="gs-newsletter-form" data-newsletter>
      <input type="email" name="email" placeholder="you@example.com" required aria-label="email address" autocomplete="email">
      <button type="submit">subscribe</button>
    </form>
    <p class="gs-newsletter-fineprint" data-newsletter-help>opens your email so you can send your address to <a href="mailto:hello@godspeed.coffee">hello@godspeed.coffee</a>.</p>
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

function photoStripCard(slug: string, alt: string, caption: string): string {
  return `<figure>
    <picture>
      <source srcset="/photos/${slug}.webp" type="image/webp">
      <img src="/photos/${slug}.jpg" alt="${alt}" loading="lazy" decoding="async" width="640" height="800">
    </picture>
    <figcaption>${caption}</figcaption>
  </figure>`;
}
