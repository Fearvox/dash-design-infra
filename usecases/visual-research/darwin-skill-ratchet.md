# Darwin Skill Ratchet Workflow

This workflow adapts the public ideas from [`alchaincyf/darwin-skill`](https://github.com/alchaincyf/darwin-skill) into DASH Design Infra.

It does **not** install the skill, copy its assets, or run arbitrary repo code. It extracts the operating pattern: evaluate a skill-like artifact, make one narrow improvement, test it against prompts or proofshots, keep only improvements, and render the result as a public-safe board.

## Problem

Visual agent work often gets better by taste discussion but worse by process: prompts drift, skills bloat, and examples become unverified inspiration folders.

Darwin's useful move is the ratchet:

```text
baseline -> one targeted patch -> independent evaluation -> keep or revert -> result card
```

DASH uses that move for visual workflows and examples. A new visual workflow should not just look better; it should make a measurable slice stronger without leaking private material.

## Output

- A fixed-canvas ratchet board: [`examples/darwin-ratchet-board.html`](../../examples/darwin-ratchet-board.html)
- A reusable workflow doc for agents that need to optimize skills, prompts, or visual artifact routes.
- A score-gated public surface: link check, boundary scan, hackathon score, browser measure, and print render.

## Source Vetting Summary

`darwin-skill` was reviewed as an external GitHub reference before adaptation.

| Item | Result |
|---|---|
| Source | GitHub repo `alchaincyf/darwin-skill` |
| Stars at review | ~1240 |
| License | MIT |
| Last inspected commit | `2056abf` |
| Files reviewed | README, README_EN, SKILL.md, screenshot script, result-card templates |
| Red flags | No secret/token/webhook/base64/eval patterns in quick scan |
| Caution | `scripts/screenshot.mjs` contains a hard-coded local Playwright path and auto-opens output; treat as non-portable reference only |
| Verdict | Safe as a conceptual/public reference; do not install blindly into this repo |

## Pattern Extracted

| Darwin pattern | DASH adaptation |
|---|---|
| 8-dimension skill rubric | 8-lane visual workflow rubric: intent, boundary, prompt set, visual grammar, artifact, proofshot, score, rollback |
| Test prompts | Test surfaces: fixed-canvas HTML, PDF render, browser overflow, public-boundary scan |
| Independent scoring | Browser/measure tools and separate review lane, not the same prompt that created the artifact |
| Keep/revert | Git branch + narrow commit + CI gate; revert failed slices instead of stacking drift |
| Result cards | Synthetic public board that shows before/after score, lane deltas, failure modes |

## Layer Model

```text
External reference
  ↓ vet source and red flags
Reusable pattern
  ↓ strip private/assets/local assumptions
DASH workflow doc
  ↓ name commands, QA, failure modes
Fixed-canvas artifact
  ↓ measure + print + proofshot
PR ratchet
  ↓ CI decides whether the slice survives
```

## Commands

Run the board through the same fixed-canvas path as other DASH examples:

```bash
bun measure:check -- examples/darwin-ratchet-board.html
bun print:render -- examples/darwin-ratchet-board.html /tmp/dash-darwin-ratchet-board.pdf --canvas=1684x1191
bun docs:links
bun security:scan
bun hackathon:score
```

For a full branch before PR:

```bash
bun tokens:build
bun metrics:build
bun typecheck
bun audit --audit-level high
bun docs:links
bun security:scan
bun hackathon:score
```

## Rubric For Visual Skill Loops

| Lane | Question | Gate |
|---|---|---|
| Intent | What user job does this skill/workflow improve? | One sentence, no abstract fluff |
| Boundary | What cannot enter the public repo? | Secrets/private text/raw media excluded |
| Test prompts | What real prompts or surfaces prove it works? | 2-3 normal use cases, not edge-case theater |
| Visual grammar | What reusable grammar was extracted? | Layout, type, color, density, motion named |
| Artifact | What concrete file changed? | HTML/doc/package path exists |
| Proofshot | Did real rendering inspect it? | Browser/measure/print or equivalent |
| Score | Did a machine-readable gate pass? | `hackathon:score` or domain score |
| Rollback | How do we undo a bad experiment? | Git revert or documented fallback |

## Failure Modes

| Failure | Symptom | Fix |
|---|---|---|
| Blind install | Agent runs `npx skills add` or external scripts without review | Vet first; copy no executable code unless necessary |
| Self-scoring | Same agent edits and declares quality improved | Use browser/measure, subagent, or explicit dry-run label |
| Prompt bloat | Skill gets longer but less usable | One dimension per loop; reject >150% growth unless justified |
| Asset copying | Reference screenshots/templates land in public repo | Use synthetic cards and attribution only |
| Local-machine coupling | Paths like `/Users/alchain/...` appear in shipped script | Treat as non-portable; adapt with repo-native tools |

## Public Boundary

Allowed:

- public repo name, MIT attribution, conceptual mapping;
- synthetic score cards and generated labels;
- reusable commands and QA rules.

Blocked:

- Darwin assets copied into this repo;
- external install commands as an unreviewed setup step;
- private skill contents, local absolute paths, user prompts from private chats;
- generated screenshots unless deliberately small and public-safe.

## 中文摘要

Darwin 给我们的不是“装一个新 skill 就完事”，而是一个棘轮：先评估，再只改一个点，用独立证据重测，变强就保留，变弱就回滚。DASH 里把它落成公开安全的视觉 workflow：有入口 HTML、有命令、有 QA、有失败模式，也有明确边界。