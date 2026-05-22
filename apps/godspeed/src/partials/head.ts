/* head.ts — <head> partial. Inlines the small CSS bundle. */

import { SITE } from "../lib/site";

export interface HeadOptions {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  stylesInline: string;
}

export function head(opts: HeadOptions): string {
  const title = opts.title === SITE.name
    ? `${SITE.name} — ${SITE.tagline}`
    : `${opts.title} · ${SITE.name}`;
  const description = opts.description ?? SITE.description;
  const og = opts.ogImage ?? SITE.ogImageDefault;
  const canonical = `${SITE.url}${opts.path}`;

  return /* html */ `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">

<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:image" content="${SITE.url}${og}">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap" rel="stylesheet">

<link rel="alternate" type="application/rss+xml" title="${SITE.name} — journal" href="/journal/feed.xml">

<script type="application/ld+json">${JSON.stringify(localBusinessJsonLd())}</script>

<style>${opts.stylesInline}</style>
</head>
<body>
`;
}

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: SITE.name,
    url: SITE.url,
    image: `${SITE.url}/og-image.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "US",
    },
    email: SITE.email,
    sameAs: [SITE.social.instagram, SITE.social.yelp],
  };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
