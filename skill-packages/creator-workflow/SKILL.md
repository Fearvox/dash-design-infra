---
name: dash-creator-workflow
description: Use when an agent needs to turn a public-safe creator idea into a DASH creator capsule, measured artifact, proof route, and remix trail without committing raw generated media or private prompts.
---

# DASH Creator Workflow

## When To Use

Use this skill for creator-facing visual work that should move from idea to
capsule to artifact to proof to remix trail. It is useful for poster surfaces,
prompt DNA adapters, motion storyboards, and contact-sheet review before raw
video or renderer work.

Do not use it for private client copy, raw model output archival, live account
automation, or external skill publishing.

## Inputs

- A public-safe creator idea or retained mutation.
- Any existing capsule, prompt DNA, poster, storyboard, or contact-sheet route
  that should remain synthetic and reproducible.
- A target proof path: browser measure, print render, contact sheet, or all
  relevant creator checks.

## Workflow

1. Start with `docs/CREATOR_OS.md` and the workflow table in
   `docs/WORKFLOW_INDEX.md`.
2. Pick the narrow creator route that matches the task:
   `creator:capsule-check`, `creator:poster-check`,
   `creator:prompt-dna-check`, `creator:motion-storyboard-check`, or
   `creator:contact-sheet-check`.
3. Keep frontier model or renderer tools at the adapter edge. The repo artifact
   should be a checked capsule, JSON contract, HTML proof, or ignored
   `.artifacts` contact sheet.
4. Run the route check before browser or print proof. Use `measure:check` and
   `print:render` for fixed-canvas HTML surfaces.
5. Run `security:scan`, `docs:links`, and `hackathon:score` before claiming the
   route is public-safe.

## Verification Gate

```bash
bun creator:skill-package-check
bun creator:capsule-check
bun creator:motion-storyboard-check
bun creator:contact-sheet-check
bun docs:links
bun security:scan
bun hackathon:score
```

For a specific HTML output, also run:

```bash
bun measure:check -- <file.html>
bun print:render -- <file.html> /tmp/dash-creator-proof.pdf --canvas=1684x1191
```

## Install Boundary

This directory is a repo-local skill package artifact. A human or reviewer may
copy or symlink `skill-packages/creator-workflow` into a local Hermes, Codex, or
skills.sh-compatible loader after `bun creator:skill-package-check` passes.

Do not publish this skill externally, sync it to live agents, or treat it as a
released skills.sh package until a separate review issue approves that release
path.

## Public Boundary

Allowed:

- synthetic capsule copy;
- checked JSON contracts;
- fixed-canvas HTML examples;
- ignored `.artifacts` proof files;
- reusable route instructions and command names.

Blocked:

- raw generated media in git;
- private prompts or client copy;
- local absolute media paths;
- API keys, cookies, account screenshots, or credentials;
- claims that an external skill release happened.

## Example Task

"Turn this public-safe creator direction into a motion storyboard route, prove
it with a contact sheet, and leave a remix trail without committing raw video."

Expected path:

```bash
bun creator:motion-storyboard-check
bun creator:contact-sheet-check
bun measure:check -- .artifacts/creator-motion-contact-sheet.html
bun security:scan
```

## Failure Modes

- The idea needs private source media or client text: stop and request a
  sanitized capsule.
- The output only describes a workflow but has no command gate: add or choose a
  check before calling it shipped.
- The artifact requires live model credentials: keep those outside this repo
  and record only the public-safe adapter contract.
- The skill is being installed or published externally: stop unless a reviewed
  release issue explicitly authorizes it.

## 中文摘要

这个本地 skill package 把 creator 工作固定成
`idea -> capsule -> artifact -> proof -> remix trail`。它可以被本地试装，但不代表已经发布到
skills.sh，也不能把 raw media、私有 prompt、本地素材路径或凭据提交进仓库。
