/* footer.ts — site footer with location, hours summary, socials. */

import { SITE } from "../lib/site";

export function footer(): string {
  const year = new Date().getFullYear();
  return /* html */ `
<footer class="gs-footer">
  <p>
    ${SITE.address.street} · ${SITE.address.city}, ${SITE.address.state} ${SITE.address.zip}<br>
    <a href="mailto:${SITE.email}">${SITE.email}</a>
  </p>
  <ul>
    <li><a href="${SITE.social.instagram}" rel="noopener" target="_blank">instagram</a></li>
    <li><a href="${SITE.social.yelp}" rel="noopener" target="_blank">yelp</a></li>
    <li><a href="/journal/feed.xml">rss</a></li>
  </ul>
  <p style="margin-top: var(--gs-2); font-size: var(--gs-size-label); opacity: 0.7;">
    © ${year} godspeed coffee · built with care
  </p>
</footer>
</body>
</html>
`;
}
