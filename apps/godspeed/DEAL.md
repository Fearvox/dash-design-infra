# Deal — godspeed.coffee site build

**Parties:** 0xvox (design + build) · Roger / Godspeed Coffee (client)
**Effective:** 2026-05-22

## Scope

0xvox designs and builds the godspeed.coffee website (static site + light content engine) as a sub-app inside the `dash-design-infra` open-source monorepo. Scope is defined in `PLAN.md` in this directory; V1 ships when phases P1–P8 are done.

## What 0xvox provides

- All design, code, and integration work on the site.
- Deployment to Vercel and DNS setup help.
- Help claiming the Yelp listing and Google Business Profile.
- Handoff docs (`VOICE.md`, `CONTRIBUTING.md`) and a screen recording so Roger can ship a journal post without 0xvox.

## What Roger / Godspeed provides

- Purchase of `godspeed.coffee` (~$50/yr) in Roger's name and Roger's billing account on Cloudflare Registrar or Vercel Domains. **Domain ownership stays with Godspeed.**
- Optional defensive purchase of `godspeedcoffee.com` (~$15/yr) — same terms.
- Any future hosting upgrades if traffic outgrows Vercel Hobby (currently $0/mo; Pro is $20/mo if it ever happens — Roger's call).
- Content inputs: menu items + prices, team names if any, holiday hours, vendor / collab credits, logo source file if one exists.
- Newsletter list (if importing one) and Buttondown account setup at launch.

## What 0xvox does NOT provide

- E-commerce, online ordering, accounts, or POS integration.
- Custom photography (V1 uses Instagram-pulled imagery with a grain overlay; a real shoot is V2 and not in this deal).
- A service-level agreement. Best-effort updates; no on-call.

## Ownership

- **Site code** lives in the public `dash-design-infra` repo under MIT. Anyone can read it.
- **Brand assets** — logo, photography, copy, name — remain the property of Godspeed Coffee. The site uses them under an informal license between us. 0xvox does not claim rights.
- **Domain + Vercel account + Buttondown account** — Roger owns. 0xvox is at most a collaborator on those services. The day Roger wants 0xvox off, 0xvox is off.

## Pro bono

0xvox charges $0 in labor. Roger covers domain + any future hosting. If the relationship grows into paid work later, that's a separate conversation.

## Termination

Either side can walk at any time, no questions. The site is static HTML — Roger can copy the `dist/` directory anywhere and keep it running. The build pipeline is open source under MIT and Roger can self-host the source too.

## How changes get made

- 0xvox writes code; Roger reviews on preview URLs before promotion to `godspeed.coffee`.
- Roger writes journal posts and copy edits by editing markdown files in `apps/godspeed/content/`. See `CONTRIBUTING.md` for the step-by-step.
- For larger changes, GitHub issues or DMs work. No formal ticket system.

## Signatures

- 0xvox: ______________________
- Roger: ______________________
- Date: ______________________
