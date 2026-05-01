# Hermes Hackathon Goal: DASH Design Infra

This is the operating spec for making `dash-design-infra` useful enough for public agent adoption, not just nice enough for a README.

## Goal

Make DASH Design Infra a public, installable design infrastructure kit for AI agents:

- reusable visual workflows;
- fixed-canvas browser verification;
- print/PDF export discipline;
- p5.js and video motion grammar;
- public-safe docs and examples;
- skill-ready packaging for `skills.sh` and Hermes Agent users.

The target is not "more docs". The target is: an agent can discover the repo, understand what it gives them, install or copy the useful pieces, and produce better visual artifacts with fewer broken edges.

## Non-Negotiables

- No private local paths, raw source media, private audio, or client text in public docs.
- Every shipped workflow must include verification steps.
- Every visual workflow must state its public boundary.
- No generic AI UI defaults. Strong point of view or don't ship it.
- No fake completion. If something is not verified, say so.
- Iterations should be small enough to finish, test, commit, and push in under 30 minutes.

## 30-Minute Iteration Loop

Each loop does one complete slice:

1. Audit one surface.
2. Pick the highest-leverage defect.
3. Write or update the spec.
4. Implement the smallest useful fix.
5. Run verification.
6. Commit and push.
7. If the branch is PR-ready, open or update a PR.
8. Leave the next slice obvious.

A loop that only plans is a failed loop unless the plan itself is the shipped artifact.

## Priority Ladder

### P0: Public installability

- Clear entrypoint for agents and humans.
- A `skills.sh`-ready story: what skill/workflow this repo provides, who should install it, and what command/path they start from.
- Public-safe docs with no internal leakage.

### P1: Workflow library depth

- More reusable workflows like Windburn, each with render/check/compress or build/check/export discipline.
- Design workflows should connect to actual packages where possible.
- Every workflow should have a short checklist and a failure-mode section.

### P2: Verification harness

- Browser checks for HTML examples.
- Typecheck/build pipeline always green.
- Link/path checks for docs.
- Optional visual contact-sheet or screenshot QA for motion artifacts.

### P3: Agent packaging

- Make it easy for Hermes/Claude/OpenClaw-style agents to consume:
  - `SKILL.md` or skill-pack docs if appropriate;
  - explicit usage examples;
  - no hidden setup assumptions.

### P4: Vercel demo surface

- If the repo gains a web demo, deploy it to Vercel with a clean public landing page.
- The demo should prove the system, not decorate it.

## Current Known Assets

- `@dash/tokens`
- `@dash/scale`
- `@dash/metrics`
- `@dash/kami`
- `@dash/p5-motion`
- `@dash/measure`
- `@dash/layout`
- `@dash/print`
- p5.js usecases: Electric Archive, Memory Weather Report
- video workflow usecase: Windburn Render Workflow

## First Audit Targets

1. Add a public agent entrypoint, likely `AGENTS.md` or `SKILL.md`, without pretending the repo is already published to skills.sh.
2. Add docs link checking so markdown drift fails locally and in CI. DONE: `bun docs:links`.
3. Add a public workflow index that groups document, p5, video, and future TouchDesigner/MCP workflows.
4. Check whether packages expose enough examples for an external agent to use them without reading source.
5. Research `skills.sh` publish expectations and map the repo to that format.
6. Keep the ClawSweeper-style SDD loop green: `bun hackathon:score` should pass before a PR claims progress.

## Completion Definition

The project is hackathon-ready when a new agent can do this without extra human explanation:

1. Read the repo entrypoint.
2. Pick a workflow.
3. Run the relevant commands.
4. Verify output.
5. Know what is private/out of scope.
6. Install or reuse the workflow from the public ecosystem.

That is the game.
