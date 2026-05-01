# Refero Visual Research Workflow

Source researched: https://refero.design/

Reference repo inspected: https://github.com/Fearvox/multica-ultimate-workbench

This workflow adds a research-before-generation loop for visual agents. It does not copy Refero product screenshots. It extracts the reusable grammar: taxonomy-first browsing, dark preview boards, serif/sans hierarchy, pattern chips, proofshot QA, and public boundary discipline.

## Why this matters

Most agent-generated UI fails before code quality matters. It starts from memory soup instead of real interface references. Refero's strong lesson is simple: study real product screens and flows before generating.

For this repo, the reusable version is:

```text
research taxonomy -> extract visual grammar -> create public-safe board -> browser proofshot -> score gate
```

## Refero patterns extracted

| Pattern | What Refero does | DASH adaptation |
|---|---|---|
| Editorial hero + functional archive | Emotional serif hero, then dense browsable database | Large serif promise plus compact workflow matrix |
| Taxonomy chips | Page type, flow, UX pattern, UI element, site, font filters | Pattern tags for dashboard, onboarding, pricing, cards, modal, table |
| Dark preview surfaces | Dark cards, skeleton states, subtle borders | Public-safe synthetic preview cards with no copied screenshots |
| White active state | Selected chips and primary CTAs invert to white | Cream active chips and CTA states |
| Color micro-accents | Small icons carry section identity | Mint/coral/violet/cyan micro palette |
| MCP for agents | Design research becomes agent-accessible | Repo workflow index + score gate becomes local agent-accessible |

## Multica workbench patterns imported

From `multica-ultimate-workbench`, the relevant operating patterns are:

- **Proofshot QA**: test the actual screen or artifact, not only source code.
- **Frontend design QA**: verify hierarchy, text fit, responsive state, interaction states, and visual consistency.
- **Evidence gates**: no done claim without file, command, screenshot, log, or other concrete evidence.
- **Two-ring thinking**: separate orchestration/review from bounded specialist execution.

DASH adaptation: visual workflows now require a rendered artifact plus browser/measure verification before claiming quality.

## Example artifact

Public-safe example:

- [`examples/refero-research-board.html`](../../examples/refero-research-board.html)

It is a fixed-canvas board designed for browser measurement and print-style review. It contains synthetic copy and synthetic preview cards only.

Run:

```bash
bun measure:check -- examples/refero-research-board.html
bun print:render -- examples/refero-research-board.html /tmp/dash-refero-board.pdf --canvas=1684x1191
```

## Browser proofshot QA

Use this checklist before claiming a visual artifact is good:

1. Render the actual HTML or app surface.
2. Check 1684x1191 fixed canvas or the intended responsive viewport.
3. Verify no clipping, horizontal overflow, broken text fit, or incoherent overlap.
4. Check console for critical errors if running as an app.
5. Capture or name the evidence path.
6. Re-run public-boundary checks if reference material was involved.

## Public boundary

Allowed:

- public observations from Refero's homepage;
- category names and pattern taxonomy;
- synthetic examples inspired by the observed grammar;
- public links and attribution.

Not allowed:

- copied Refero screenshots or paid-library screen assets;
- private customer references;
- local screenshots containing account data;
- raw browser cache dumps;
- proprietary product images unless separately licensed.

## Chinese summary

这个 workflow 的核心是：不要让 agent 凭空“想象高级 UI”。先研究真实产品界面的分类、flow、pattern 和元素，再把它抽象成我们自己的公开安全视觉语法。Refero 给的是研究方式，Multica workbench 给的是 proofshot QA 纪律；DASH 里落地成一个可测量 HTML board 和 score gate。
