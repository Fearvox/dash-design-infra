# Godspeed Coffee — Site & Light-Community Layer

**Status:** Plan (no code yet). Author: 0xvox. Date: 2026-05-21. Branch: main.
**Restore point:** N/A (first draft).

---

## What this is

A static marketing site + lightweight content engine for **Godspeed Coffee**, 747 Saluda Ave, Columbia, SC 29205. Co-founder Roger linked up with 0xvox; deal: pro-bono design/build in exchange for Roger paying domain (~$50/yr) and any future server upgrades. Hosted as a sub-app inside `dash-design-infra` so it inherits the existing Bun + tokens + kami + metrics + Vercel pipeline.

Scope tier picked: **店面 + 轻社区层** (storefront + light community layer). Site has hours/menu/location AND a journal + manifesto + newsletter — no UGC, no accounts, no e-commerce.

## Why now

- Godspeed opened brick-and-mortar ~1–2 months ago (per IG: "week 1 in the books", "one month of godspeed being home for good"). Real shop, no real website. Yelp listing is unclaimed. They are leaving discovery and conversion on the table.
- Their IG (@godspeedcola, 6.5k followers, 53 posts) already carries voice + visual identity. The site is a consolidation move, not a brand-creation move.
- Existing infra (`dash-design-infra`) is purpose-built for this kind of editorial fixed-canvas work. Building elsewhere wastes the stack.

---

## Brand inputs (extracted from IG @godspeedcola + Yelp, 2026-05-21)

| Field | Value |
|---|---|
| Wordmark | "godspeed coffee" (lowercase, IG-canonical) |
| Tagline | "𝐬𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐟𝐨𝐫 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞" (stylized Unicode serif on IG bio) |
| Logo | Two long-necked cream birds on brick-red background; one holds clothespin, one holds steaming espresso cup. Hand-illustrated, mid-century vibe. Saved at `/tmp/godspeed-brand/logo.jpg`. |
| Address | 747 Saluda Ave, Columbia, SC 29205 |
| Hours | Wed–Fri 8a–3p · Sat–Sun 9a–4p · Mon–Tue closed |
| Signature drinks | "the nectar" (custom; can be made with matcha) |
| Food | "lil treats" (pastries) |
| Collabs | "gdspd x ppjzz" (×2), "synesthesia💿" (music/listening theme) |
| Buildout partner | @sparrowconstruction |
| Voice cues | lowercase, whimsy ("✨holiday miracle✨", "magpie gives you wings 😛", "gobsmackingly good & dangerously slurpable"), y'all-coded, uses "godspeed" as adjective ("godspeed weekend", "godspeed being home for good") |
| Adjacent scene | Red Whale Coffee, Spectra Coffee, SUM BAR, Café de Thyme, Bar Margaret, Odd Duck Market — Columbia's indie craft scene |
| Public state | IG 6.5k followers · Yelp 4.6 / 7 reviews · **Yelp unclaimed** |

## Premises (the foundation — challenge here, not later)

1. **Roger wants a real website, not a Linktree.** The IG bio currently has no clean external destination. A site replaces the "DM us for hours" pattern.
2. **The community angle is a content engine, not a platform.** A journal Roger posts to monthly (events, drinks, collabs) is enough community signal. We are not building Discourse.
3. **Site quality must match in-person quality.** They have a thoughtful physical space. A generic Squarespace template would feel cheaper than the shop. We can do better because the design infrastructure already exists.
4. **Roger is not a developer.** Handoff must be markdown + git push or markdown + GitHub web editor — nothing requiring a CLI.
5. **The brand already exists.** Earlier discovery answer was "什么都没有" — wrong. The IG is the brand book. Our job is consolidation + extension, not invention.

---

## Taste Decisions (every one of these is mine — surface for review)

| # | Decision | Pick | Principle / Why |
|---|---|---|---|
| 1 | Project location | `apps/godspeed/` inside `dash-design-infra` monorepo | Reuses `@dash/tokens`, `@dash/kami`, `@dash/metrics`, `@dash/p5-motion`, `@dash/print`, Vercel pipeline. Building elsewhere wastes infra. |
| 2 | Domain | **`godspeed.coffee`** (primary). Fallback: `godspeedcoffee.com`. | `.coffee` TLD is real (~$50/yr), self-explanatory, brand-aligned. User's "God.speed" stylization lives in on-site wordmark, not URL — the religious origin ("may God speed you") is honored by *clean* presentation, not aggressive periods. `godspeedcola.com` rejected: "cola"=Columbia is inside-baseball for outsiders. |
| 3 | Tech stack | **Static HTML + CSS + minimal vanilla JS, built from Markdown via Bun script.** Same approach as existing `apps/demo/`. No React/Next.js. | Repo philosophy: agent-built visual work that ships without breaking. 5-page coffee site doesn't need a framework. Keeps ops near $0. |
| 4 | Content engine | Markdown files in `apps/godspeed/content/` with YAML frontmatter. `journal/*.md`, `pages/*.md`, `menu.md`, `hours.json`. Bun build script → static HTML. | Roger edits a `.md` file via GitHub web UI or local editor. No CMS to host, no DB to back up. Handoff target = anyone who's used Notion. |
| 5 | IG sync | **Manual curation only in V1.** No IG API integration. | YAGNI. IG Basic Display API is deprecated; Graph API requires business account + token rotation. Curation beats broken automation. Reconsider if engagement demands it. |
| 6 | Hosting | Vercel Hobby (free tier). Deploy via existing `vercel.json` extended to handle `apps/godspeed`. | Already wired. $0/mo. Roger pays only the domain. |
| 7 | Email | `hello@godspeed.coffee` via Cloudflare Email Routing (free) → Roger's inbox. | Beats Workspace ($6/user/mo) at this stage. |
| 8 | Newsletter | Buttondown Free (≤100 subs). Embed signup form. | Beats ConvertKit / Mailchimp for design fit + cost. Migrate later if list outgrows. |
| 9 | Analytics | Vercel Web Analytics (free tier, privacy-respecting) — no GA. | Zero-cookie, no GDPR/CCPA banner needed. Matches indie brand. |
| 10 | Pages (V1) | `/`, `/menu`, `/our-story`, `/journal`, `/journal/[slug]`, `/404`. **Six total.** | Boils the lake. Anything else is V2. |
| 11 | Hero motion | Subtle CSS-only animated steam wisp over logo (or single `@dash/p5-motion` cell). No autoplay video. | Performance, on-brand whimsy without being precious. |
| 12 | Type | **Editorial serif primary** (Charter / Source Serif — already wired in `apps/demo`). Lowercase sans for nav/UI (Inter or system-ui). | Matches their stylized-serif IG bio energy. Inherits existing infra. |
| 13 | Color | Extract from logo: brick-red `oklch(~0.40 0.12 35)`, cream `oklch(~0.92 0.04 80)`, warm paper `oklch(0.96 0.01 85)` (matches `--paper-base` in `apps/demo`). | Single palette derived from the only asset that's already canonical. |
| 14 | "Open now" indicator | Compute live from `hours.json` in JS, no server. Shows "open now · closes 3p" / "closed · opens wed 8a". | Highest-signal UI element a coffee shop site can have. Free to build. |
| 15 | Photography | V1 ships with IG-pulled photos (low-res, attribution to Godspeed). V2 = curated shoot. | Don't block launch on a photoshoot. Real photos > placeholders. |
| 16 | Yelp / Google Business | **Bonus value-add:** claim both as part of launch checklist. Not blocking. | Roger is leaving discovery on the table. 30-min task. |
| 17 | Brand voice rules | Codified in `apps/godspeed/VOICE.md`. Lowercase, whimsy permitted, no corporate vocab, em-dashes OK, Unicode serif sparingly. | Gives Roger explicit rails for future journal posts. |
| 18 | Roger handoff | `CONTRIBUTING.md` in `apps/godspeed/` + 1 short Loom-style screen recording. Optional: Vercel Comments toolbar for in-browser change requests. | Lowest-friction handoff. |
| 19 | License | Site code MIT (matches repo). Brand assets reserved by Godspeed. | Standard. |
| 20 | Deal terms with Roger | Domain billed to Roger's name on his Vercel/Cloudflare account. 0xvox covers labor. No SLA, best-effort updates. Document in `apps/godspeed/DEAL.md`. | Clean paper trail. Protects friendship. |

---

## NOT in scope (V1)

- E-commerce / online ordering / Square integration
- Loyalty / rewards / accounts
- Comments, reviews, UGC of any kind
- User-facing search
- Multi-language (English only V1)
- IG auto-sync
- Custom mobile app
- Calendar/RSVP for events (use Eventbrite link if needed)
- Photoshoot (V2)

Each of these gets a one-liner in TODOS later if it becomes relevant.

## What already exists (reuse map)

| Need | Existing in dash-design-infra | Use as-is |
|---|---|---|
| Color tokens | `packages/tokens` | Extend with Godspeed palette |
| Editorial type | `packages/kami` | Use warm preset as base |
| Baseline grid | `packages/metrics` | Direct reuse |
| Layout helpers | `packages/layout` | `CanvasEditorialSolver` if hero needs fixed canvas |
| Motion | `packages/p5-motion` | Steam wisp cell |
| Print export | `packages/print` | For: menu PDF generation, future |
| Static build | `apps/demo` pattern + `vercel.json` | Extend buildCommand to also emit `apps/godspeed/dist` |

---

## Architecture

```
apps/godspeed/
├── package.json              # workspace pkg, depends on @dash/*
├── tsconfig.json
├── PLAN.md                   # this file
├── DEAL.md                   # terms with Roger
├── VOICE.md                  # brand voice rules
├── CONTRIBUTING.md           # how Roger edits content
├── content/
│   ├── hours.json            # source of truth for hours
│   ├── menu.md               # menu w/ YAML frontmatter sections
│   ├── pages/
│   │   ├── home.md
│   │   ├── our-story.md
│   │   └── 404.md
│   └── journal/
│       ├── 2026-05-21-hello-world.md
│       └── _drafts/
├── public/
│   ├── logo.svg              # vector trace of IG logo (or PNG if no source)
│   ├── photos/               # IG-pulled at first; curated later
│   ├── favicon.ico
│   └── og-image.jpg
├── src/
│   ├── build.ts              # Bun build entrypoint
│   ├── render.ts             # MD → HTML pipeline
│   ├── pages/                # page-level TS that emits HTML
│   ├── partials/             # nav, footer, hours-pill, journal-card
│   ├── styles/
│   │   ├── tokens.css        # Godspeed-specific color/type, layered on @dash/tokens
│   │   ├── base.css
│   │   └── pages/*.css
│   └── lib/
│       ├── hours.ts          # open-now logic
│       └── markdown.ts       # MD parser config (front-matter + GFM)
└── dist/                     # build output, served by Vercel
```

### Build pipeline (single Bun script)

```
bun run apps/godspeed/src/build.ts
  → read content/*.md + content/*.json
  → render via gray-matter + marked (or remark — TBD in research phase)
  → apply layout templates from src/pages/*
  → write apps/godspeed/dist/{index.html, menu/index.html, our-story/index.html,
                                journal/index.html, journal/<slug>/index.html, 404.html}
  → copy public/ → dist/
```

### Vercel deploy

Extend root `vercel.json`:

```json
{
  "buildCommand": "bun run apps/demo/build && bun run apps/godspeed/build",
  "outputDirectory": ".vercel/output/static",
  "framework": null,
  "installCommand": "bun install"
}
```

Project on Vercel: `godspeed-coffee`. Domain: `godspeed.coffee` (primary), `www.godspeed.coffee` (301 → apex).

`dash-design-infra` keeps deploying its demo separately under `docs.zonicdesign.art` (per recent commit). Multi-project Vercel setup, both reading from same monorepo. Configure via `vercel.json` per-app or use `apps/godspeed/vercel.json` override + `outputDirectory: apps/godspeed/dist`.

---

## Implementation phases

### P0 — Roger kickoff sync (blocking, ~30 min Roger + 15 min 0xvox)
Before P1 touches code, get answers to the "Open questions for Roger" list below. No assumptions about menu items, team, or holiday pattern survive into copy. Also lock the deal in `DEAL.md` and get a logo source file (or confirm we vector-trace).

**Done when:** all 7 questions answered, `DEAL.md` co-signed, logo source committed (or trace-pass confirmed).

### P1 — Scaffold + tokens (½ day CC / ~2 hours human)
- [ ] `apps/godspeed/package.json` workspace entry, depend on `@dash/tokens`, `@dash/kami`, `@dash/metrics`
- [ ] Color tokens extracted from logo, written to `src/styles/tokens.css`
- [ ] `build.ts` skeleton, emits one HTML page from one MD file
- [ ] Vercel `apps/godspeed/vercel.json` (or root extension). **Verify multi-app deploy doesn't break `apps/demo` build.**
- [ ] Verify deploy to preview URL
- [ ] Build step: JSON schema validation on `hours.json` + frontmatter validation on every MD. Fail loudly with line-level errors, never silently.
- [ ] Build step: slugify filenames + frontmatter `slug` fields (kebab-case, ASCII).

**Done when:** `bun run apps/godspeed/build` produces a working `dist/index.html` and `vercel dev` serves it.

### P2 — Content & pages (1 day CC / ~½ day human)
- [ ] `content/home.md`, `our-story.md` — drafted in Godspeed voice (lowercased, whimsy-permitted)
- [ ] `content/menu.md` — placeholder w/ structure; Roger fills the actual items
- [ ] `content/hours.json` — Wed–Fri 8–3, Sat–Sun 9–4
- [ ] `lib/hours.ts` — `getOpenStatus(now, hours)` → `{ open: bool, label: string }`. All times `America/New_York` via `Intl.DateTimeFormat`. DST transitions (March + November weekends) included in unit tests.
- [ ] Partials: nav, footer, hours-pill
- [ ] Page templates render all 5 pages
- [ ] 404 page

**Done when:** all 5 pages render with real (drafted) copy, hours pill is correct against actual time.

### P3 — Journal engine (½ day CC)
- [ ] MD → journal post pipeline
- [ ] Journal index lists posts by date desc
- [ ] One real seed post: "hello, world — godspeed.coffee is live" in Godspeed voice
- [ ] RSS feed at `/journal/feed.xml`

**Done when:** adding `content/journal/YYYY-MM-DD-slug.md` and re-running build emits a new post + updates the index + RSS.

### P4 — Visual polish + motion (½ day CC)
- [ ] Logo: SVG trace from IG logo (or use Roger's source from P0 — fallback PNG only if vector blocked).
- [ ] Hero animation: CSS-only steam wisp (preferred) or single `@dash/p5-motion` cell. Respects `prefers-reduced-motion`. Drops below 768px viewport.
- [ ] Photography: pull 8–12 IG photos, optimize via `sharp`, emit responsive `srcset` + `loading="lazy"`. Contrast / grain overlay to mask IG compression.
- [ ] Typography: pick **Source Serif 4** (open license) for editorial, **Inter** for UI. Subset to glyphs used.
- [ ] OG image generation per-page via Satori in `apps/godspeed/src/og.ts`.
- [ ] Favicon set (16, 32, 180 apple-touch, 192 + 512 maskable).
- [ ] Color contrast verified WCAG AA at body-text size for every brick-red ↔ cream / paper combination.
- [ ] Tablet breakpoint (768) explicitly tested alongside mobile (390) + desktop (1440).

**Done when:** site visually matches the IG mood, hero has motion, OG previews render in IG / iMessage / Slack.

### P5 — Newsletter + analytics (¼ day CC)
- [ ] Buttondown account, embed signup form on `/` and `/journal`
- [ ] Vercel Web Analytics enabled
- [ ] Test signup → confirm email arrives

**Done when:** subscribing sends a Buttondown confirmation; first analytics event shows in Vercel.

### P6 — Domain + production (¼ day CC + 1–2 days Roger blocking)
- [ ] Roger buys `godspeed.coffee` via Cloudflare Registrar or Vercel Domains (Roger's account, Roger's name on the bill — see DEAL.md).
- [ ] **Defensive registration of `godspeedcoffee.com`** (≤$15/yr) → 301 redirect to apex. Catches typos and protects the brand.
- [ ] DNS to Vercel
- [ ] Cloudflare Email Routing: `hello@godspeed.coffee` → Roger's existing inbox.
- [ ] Email auth: SPF + DKIM + DMARC records configured for `godspeed.coffee` (so newsletter sends and replies don't land in spam).
- [ ] HTTPS verified
- [ ] Uptime check: UptimeRobot free monitor on `https://godspeed.coffee/` (5-min interval, email Roger on outage).
- [ ] Update IG bio link.

**Done when:** `https://godspeed.coffee` resolves to the site and `hello@godspeed.coffee` reaches Roger.

### P7 — Digital footprint claim (¼ day CC)
- [ ] Claim Yelp listing
- [ ] Create / claim Google Business Profile
- [ ] Cross-link site ↔ IG ↔ Yelp ↔ Google Business
- [ ] Add structured data (`LocalBusiness` JSON-LD) for Google rich results

**Done when:** searching "godspeed coffee columbia sc" on Google shows the Knowledge Panel.

### P8 — Handoff (¼ day CC + ½ day Roger)
- [ ] `CONTRIBUTING.md` walks Roger through: edit `.md`, push, watch Vercel deploy
- [ ] Short screen recording: "how to add a journal post"
- [ ] Optional: Vercel Comments enabled so Roger can request changes in-browser
- [ ] Final review with Roger; sign-off

**Done when:** Roger can ship a new journal post without 0xvox in the loop.

**Total CC effort:** ~3.5 days. **Total human/Roger blocking:** ~2 days (mostly content + domain + claim listings).

---

## Test plan

| Codepath / surface | Test |
|---|---|
| `hours.ts::getOpenStatus` | Unit: 8 cases — open mid-day, closed Mon, closed before opening, closed after closing, transition minutes, Sun late, Tue (closed all day), edge of close |
| Build pipeline | Smoke: `bun run apps/godspeed/build` exits 0 and emits expected file count |
| Markdown rendering | Snapshot: each page MD renders to deterministic HTML |
| Link integrity | Run `bun scripts/markdown-link-check.ts` (already in repo) across new content |
| Public boundary | Run `bun run security:scan` (already in repo) — ensure no Roger-private content leaks |
| Visual regression | Playwright screenshot per page at 1440×900 + 390×844, diff vs baseline |
| Lighthouse | ≥95 Performance, ≥95 Accessibility, ≥95 Best Practices, ≥95 SEO on `/` and `/menu` |
| OG previews | Manual: paste deploy URL into iMessage + Slack + Discord; verify image + title |
| Email delivery | Manual: send to `hello@godspeed.coffee`, confirm Roger receives within 60s |
| 404 | Visit `/banana` → custom 404 renders |
| Analytics | Visit each page once with Vercel Web Analytics on; confirm pageviews show up in dashboard |

## Failure modes registry

| Mode | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Logo source file lost (we only have a 320px IG profile pic) | High | High — small logo on hero | Request source file from Roger early in P1. If unobtainable, commission vector trace. |
| Hours change & site doesn't update | Med | Med — most common complaint vector | `hours.json` is one file. CONTRIBUTING.md highlights it. Holiday hours block in copy. |
| Roger never writes a journal post | High | Low — site still works, just static | Seed 2–3 posts at launch. Add `_drafts/` folder. Don't force the cadence. |
| Photos look low-res because they came from IG | Med | Med — visual quality dip | V1 accept it; V2 commissioned shoot. Use `@dash/print`-style controlled crops + grain texture overlay to hide compression. |
| Domain `.coffee` not available | Low | Med — pivot to fallback | Buy `godspeedcoffee.com` simultaneously as defense. |
| Yelp listing has a different owner / can't be claimed | Med | Low — bonus task | Skip if blocked; revisit. |
| Vercel costs exceed Hobby tier | Very low at V1 traffic | Med | Roger upgrades to Pro at $20/mo if it happens. Documented in DEAL.md. |
| Roger wants to add e-commerce in V2 | Med | High — wrong stack | Honest conversation: at that point, evaluate Shopify Lite or Square Online over building it ourselves. |

## Security / privacy

- No accounts, no PII collection beyond newsletter email (Buttondown handles).
- No cookies → no banner needed (Vercel Analytics is privacy-respecting).
- Email forwarding via Cloudflare — Roger's actual inbox never exposed.
- All build assets are public, no secrets in repo.
- `bun run security:scan` enforces public boundary (already wired in repo).

## Accessibility

- Semantic HTML throughout (no div-soup).
- All photos have alt text (write during P4).
- WCAG AA color contrast verified for brick-red on cream + reverse.
- Keyboard nav: all interactive elements reachable via tab.
- Reduced-motion: hero animation respects `prefers-reduced-motion`.
- Lighthouse Accessibility ≥95 gates P5 done.

## Open questions for Roger (queue for first sync)

1. Vector logo source file? (PDF / AI / SVG)
2. Real menu items + prices?
3. Names + roles for "our story" team section, or skip the team for V1?
4. Holiday hours pattern?
5. Vendor / roaster shoutouts to include?
6. Existing email list to import to Buttondown?
7. Anyone else (PPJZZ, Sparrow Construction) we want to credit / link?

These don't block scaffolding. They block "real copy ready to ship."

---

## Decision Audit Trail

| # | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|
| 1 | Storefront + light community layer (not full UGC platform) | Taste | P3 Pragmatic | UGC platform overbuilt for a 1-shop indie coffee. Content engine is enough community. | Storefront-only (too thin); Full community (overbuilt) |
| 2 | Live inside `dash-design-infra` monorepo at `apps/godspeed/` | Mechanical | P4 DRY | Existing tokens/kami/metrics/motion/Vercel infra. New repo = waste. | New repo; Sub-repo |
| 3 | Static HTML+CSS+vanilla JS, no framework | Taste | P5 Explicit | 5 pages, no interactivity beyond hours pill + newsletter form. Next.js/React is fashion, not need. | Next.js (over-engineered); Astro (closer call — could be V2 if we add MDX) |
| 4 | Markdown content engine with Bun build | Taste | P5 Explicit | Roger edits a `.md` via GitHub web. No CMS to host. | Notion CMS (Notion API rate limits, lock-in); Sanity (hosted CMS overkill); Decap (works but extra runtime) |
| 5 | Domain: `godspeed.coffee` | Taste | P5 Explicit | Cleanest. `.coffee` TLD exists. User's "God.speed" stylization lives in wordmark not URL — keeps it clean and respectful. | `godspeedcola.com` (cola=Columbia is too inside-baseball); `god.speed.X` (not a real TLD pattern, also feels gimmicky vs the religious roots of the word); period-styled marks (too tryhard) |
| 6 | Vercel Hobby + free everything | Mechanical | P3 Pragmatic | $0/mo. Roger pays only domain. Upgrade later only if traffic warrants. | Cloudflare Pages (also fine, but Vercel already wired); Netlify (extra account); self-host (zero benefit at this scale) |
| 7 | No IG auto-sync in V1 | Mechanical | P3 Pragmatic | IG Basic Display API deprecated; Graph API needs business account + token rotation. Manual curation > broken automation. | Auto-pull (high failure mode); Buffer/Later integration (cost) |
| 8 | Newsletter: Buttondown free | Taste | P3 Pragmatic | Best brand fit + design + price for indie. | ConvertKit (overkill UX); Mailchimp (brand mismatch); Substack (wrong tool for newsletter-as-newsletter) |
| 9 | Analytics: Vercel Web Analytics | Mechanical | P3 Pragmatic | Free, privacy-respecting, no cookie banner. | GA4 (cookie banner, GDPR drag); Plausible (cost not needed) |
| 10 | Manual claim of Yelp + Google Business as bonus | Taste | P2 Boil the lake | In blast radius (digital footprint). <½ day. Compounds the site's value. | Skip (leaves obvious discovery value unclaimed) |
| 11 | Voice rules codified in `VOICE.md` | Taste | P1 Completeness | Roger writes future journal posts. Without rails, drift is inevitable. | Skip (drift); Style guide PDF (less editable) |
| 12 | Deal terms in `DEAL.md` (Roger pays domain in his name) | Taste | P5 Explicit | Protects the friendship. Paper trail. | Verbal agreement only (lost in time); Invoice (wrong vibe for pro-bono) |

---

## What I'd want a second opinion on

1. **Decision #3 (static vs Astro/MDX):** Astro would buy us nicer journal post authoring (MDX with embedded components) for ~½ day extra work. If we expect journal posts to ever embed gallery widgets, audio embeds, or interactive elements, Astro pays for itself. Sticking with static + plain MD for V1; flag for V2.
2. **Decision #4 (markdown vs Sanity-lite):** If Roger pushes back on git-as-CMS, a hosted CMS like Sanity (free tier) avoids the GitHub-web-UI hurdle. Defer until we hear from him.
3. **Decision #5 (domain):** `godspeed.coffee` is my pick. Honor the user's "respect for God" by *not* doing period-styling in the URL. The brand wordmark on-site can preserve any stylization the user wants. If user wants the literal `god.speed.X` look, options narrow to subdomain on a domain they own (e.g., `god.speed.coffee` as `god` subdomain of `speed.coffee`) which is more gimmick than worth.
4. **Logo source:** P1 risk. Get vector from Roger early.

These four are surfaced at the approval gate.

---

## Review (autoplan compressed pass, 2026-05-21, single-decider)

Per user instruction "decide all your self with tastes" — ran a compressed CEO/Design/Eng/DX inline review. **No Codex dual-voice this round** (skipped to honor the single-decider directive and stay within budget). One-shot review by author.

### CEO findings
- **Premise #4 ("Roger is not a developer") unverified.** Assumes GitHub-web-UI handoff. If Roger doesn't have a GitHub account or balks at it, fallback to a hosted CMS conversation (Sanity free tier, ~1 day extra). Surfaced at gate.
- **Missing P0 (Roger kickoff sync).** Added inline — without his answers, P2 content is blocked.
- **Linktree-style V0.5** was the alternative dismissed without exploration. Could ship in 1 day. Not picking it: doesn't move the needle on discovery, doesn't build the content engine. Documented here for record.
- **6-month regret scenarios:** Astro migration (if journal goes embed-heavy), e-commerce (if Roger sells beans), photoshoot (if IG-pulled photos look obviously low-res). All survivable. None blocking.
- **Competitive risk:** a Squarespace template is the floor. P4 visual polish is load-bearing — the site has to be obviously better than a template, or the build effort wasn't justified.

### Design findings
- **Hero info-hierarchy risk:** single-CTA per fold rule needs to hold. Plan implies multiple CTAs above the fold; rein it in during P2.
- **Empty states added inline:** journal seed + newsletter form states + hours-pill malformed-data handling.
- **Color contrast:** brick-red ↔ cream at body-text 14px may fail WCAG AA. Mechanical fix added to P4 checklist.
- **Logo source:** 320px IG profile pic is too small for desktop hero. Surfaced as P0 ask from Roger.
- **Typography:** locked to Source Serif 4 + Inter (was ambiguous "Charter / Source Serif" before).

### Eng findings
- **DST handling on `hours.ts`:** explicit `America/New_York` + Intl + DST test cases added.
- **Build-time validation:** JSON schema + frontmatter validation added — fail loudly, never silently.
- **Slugification:** added to build step.
- **Trusted markdown:** documented; not sanitizing HTML output since author is trusted. If we ever open content authoring beyond Roger, sanitize.
- **Image strategy:** `loading="lazy"` + responsive `srcset` added to P4.
- **Multi-app Vercel deploy:** verification step added to P1 — risk that the new build command breaks `apps/demo` deploy.
- **Snapshot tests:** scope narrowed to structural HTML, not content prose, to avoid noisy diffs on copy edits.

### DX findings
- **Roger's TTHW for new journal post:** ~10 min first time, ~3 min after. Acceptable. CONTRIBUTING.md needs screenshots, not just text.
- **Build failure UX:** Roger needs to know how to read Vercel's failure email. Add a "when the deploy fails" section to CONTRIBUTING.md.
- **VOICE.md needs do/don't pairs**, not just bullet rules. Adding examples is ~30 min.
- **Defensive `godspeedcoffee.com` registration added to P6** — catches the muscle-memory typo.
- **Uptime monitor added to P6** — Roger gets paged before customers complain.

### Cross-phase concerns (raised in 2+ phases)
- **Logo source quality** (CEO + Design + Eng): single highest-leverage P0 ask. Without vector, P4 visual polish is capped at "mid".
- **Roger's technical literacy** (CEO + DX): determines whether markdown+GitHub stays or pivots to hosted CMS. Block on a sync, not a guess.
- **Visual quality bar** (CEO + Design): P4 is where this project lives or dies. Don't compress it.

### Issues flagged at gate (not auto-decided)

| ID | Issue | Author's pick | Why this matters |
|---|---|---|---|
| G1 | Domain stylization: `godspeed.coffee` (clean) vs honoring user's "God.speed" literally somewhere | Clean URL; "God.speed" stylization on the on-site wordmark only | The religious origin of "godspeed" is honored *better* by clean presentation than by aggressive punctuation. But it's a taste call. |
| G2 | Static MD vs Astro/MDX from day one | Static MD (V1); Astro if journal goes embed-heavy in V2 | Astro = ½-day extra now for richer authoring later. Bet that V2 trigger arrives. |
| G3 | Markdown-as-CMS vs hosted (Sanity) | Markdown; pivot only if Roger pushes back at P0 sync | Saves cost + complexity. Risk: Roger never adopts the workflow. |
| G4 | IG photo quality acceptance | Ship V1 with IG photos + grain overlay; commission shoot for V2 | Don't block launch on a photoshoot. |
| G5 | Pre-buy `godspeedcoffee.com` as defense | Yes (~$15/yr from Roger) | Cheap insurance against typos. Marginal cost. |
| G6 | Yelp + Google Business claim as part of scope | Yes — bonus value-add in P7 | Roger leaves discovery on the table without these. ½ day work. |

### Premises (gate)
1. Roger wants a real website, not a Linktree. ✓ confirm at sync
2. Community = content engine, not platform. ✓ confirm with Roger
3. Visual quality must match the shop. ✓
4. Roger is not a developer. ⚠️ **Verify at P0 sync, not before.** Hosted-CMS fallback if false.
5. Brand already exists. ✓

### Single-decider review score
- CEO: 8/10 (strong premises, alternatives explored, missing only one — Linktree V0.5)
- Design: 7/10 (good direction, hero hierarchy risk, color contrast TBD)
- Eng: 9/10 (small surface area, tests covered, build hardening added)
- DX: 8/10 (Roger journey mapped, error UX has gaps)
- **Overall: 8/10.** Ready for execution once P0 unblocks.

---

## Approval gate

This plan is ready unless you want to override one of these:

**Premises** (confirm or change):
- P4: "Roger is not a developer" — verify at sync.

**Taste calls** (override any with a one-liner):
- G1 domain stylization
- G2 static vs Astro
- G3 markdown vs hosted CMS
- G4 IG photos vs photoshoot timing
- G5 defensive `.com` registration
- G6 Yelp + Google Business claim in scope

Default: accept all author picks above. Next step on approval: invoke `superpowers:writing-plans` to produce per-phase implementation plans, then execute.

