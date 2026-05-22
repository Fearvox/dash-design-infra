/* menu.ts — drinks + lil treats. */

import { head } from "../partials/head";
import { nav } from "../partials/nav";
import { footer } from "../partials/footer";
import { hoursPill, HOURS_PILL_CLIENT_JS } from "../partials/hoursPill";
import { SITE } from "../lib/site";
import type { HoursConfig } from "../lib/hours";

export function menuPage(opts: {
  hours: HoursConfig;
  stylesInline: string;
  bodyMarkdownHtml: string;
}): string {
  const { hours, stylesInline, bodyMarkdownHtml } = opts;
  return `${head({
    title: "menu",
    description: "what we're pouring and what's on the pastry counter at godspeed coffee, today.",
    path: "/menu",
    stylesInline,
  })}
${nav("/menu")}
<main>
  <article class="gs-content">
    <p>${hoursPill(hours)}</p>
    <h1>menu</h1>
    ${bodyMarkdownHtml}
  </article>
</main>
${footer()}
<script>${HOURS_PILL_CLIENT_JS}</script>
`;
}
