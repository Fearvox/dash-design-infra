/* nav.ts — site navigation. */

import { SITE } from "../lib/site";

export interface NavLink {
  href: string;
  label: string;
}

const LINKS: NavLink[] = [
  { href: "/menu", label: "menu" },
  { href: "/our-story", label: "our story" },
  { href: "/journal", label: "journal" },
];

export function nav(currentPath: string): string {
  return /* html */ `
<nav class="gs-nav" aria-label="primary">
  <a href="/" class="gs-logo">${SITE.name}</a>
  <ul>
    ${LINKS.map(link => {
      const isCurrent = currentPath === link.href || currentPath.startsWith(link.href + "/");
      return `<li><a href="${link.href}"${isCurrent ? ' aria-current="page"' : ""}>${link.label}</a></li>`;
    }).join("\n    ")}
  </ul>
</nav>
`;
}
