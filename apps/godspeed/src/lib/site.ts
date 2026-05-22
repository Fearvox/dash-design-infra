/* site.ts — shared site config + path helpers used by every page template. */

import * as path from "node:path";
import { fileURLToPath } from "node:url";

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  address: { street: string; city: string; state: string; zip: string };
  social: { instagram: string; yelp: string; google?: string };
  ogImageDefault: string;
}

export const SITE: SiteConfig = {
  name: "godspeed coffee",
  tagline: "something for everyone",
  description: "godspeed coffee — coffee, lil treats, and slow afternoons on Saluda Ave in Columbia, SC.",
  url: "https://godspeed.coffee",
  email: "hello@godspeed.coffee",
  address: { street: "747 Saluda Ave", city: "Columbia", state: "SC", zip: "29205" },
  social: {
    instagram: "https://www.instagram.com/godspeedcola/",
    yelp: "https://www.yelp.com/biz/godspeed-coffee-columbia",
  },
  ogImageDefault: "/og-image.jpg",
};

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP_ROOT = path.resolve(HERE, "..", "..");
export const CONTENT_DIR = path.join(APP_ROOT, "content");
export const PUBLIC_DIR = path.join(APP_ROOT, "public");
export const DIST_DIR = path.join(APP_ROOT, "dist");
export const STYLES_DIR = path.join(APP_ROOT, "src", "styles");
