/* notFound.ts — 404 page. */

import { head } from "../partials/head";
import { nav } from "../partials/nav";
import { footer } from "../partials/footer";

export function notFoundPage(opts: { stylesInline: string }): string {
  return `${head({
    title: "not found",
    description: "this page doesn't exist. yet.",
    path: "/404",
    stylesInline: opts.stylesInline,
  })}
${nav("/404")}
<main>
  <article class="gs-content" style="text-align: center;">
    <h1>404</h1>
    <p>well, this page doesn't exist. yet.</p>
    <p>maybe try the <a href="/">home page</a>, or read up on <a href="/our-story">our story</a>, or come by the shop on saluda ave.</p>
  </article>
</main>
${footer()}
`;
}
