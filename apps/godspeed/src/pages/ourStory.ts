/* ourStory.ts — brand story + manifesto. */

import { head } from "../partials/head";
import { nav } from "../partials/nav";
import { footer } from "../partials/footer";
import { SITE } from "../lib/site";

export function ourStoryPage(opts: {
  stylesInline: string;
  bodyMarkdownHtml: string;
}): string {
  return `${head({
    title: "our story",
    description: "where godspeed came from, what we mean by it, and who's behind the counter.",
    path: "/our-story",
    stylesInline: opts.stylesInline,
  })}
${nav("/our-story")}
<main>
  <article class="gs-content">
    <h1>our story</h1>
    ${opts.bodyMarkdownHtml}
  </article>
</main>
${footer()}
`;
}
