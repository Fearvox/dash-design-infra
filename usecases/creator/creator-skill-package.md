# Creator Skill Package Route

## What this packages

The retained creator workflow can now be consumed as a repo-local skill package:

- artifact: [`../../skill-packages/creator-workflow/SKILL.md`](../../skill-packages/creator-workflow/SKILL.md);
- route: `idea -> capsule -> artifact -> proof -> remix trail`;
- command gate: `bun creator:skill-package-check`;
- public boundary: no raw generated media, private prompts, local paths,
  account screenshots, credentials, or client copy.

This is not an external release. It is the checked local artifact that reviewers
can inspect before deciding whether a Hermes, Codex, or skills.sh-style install
path should be approved.

## Repo-local install boundary

Allowed:

- copy or symlink `skill-packages/creator-workflow` into a local skill loader for
  a private review run;
- cite the skill from local docs, issue handoffs, and workflow routes;
- update the artifact when creator checks change.

Blocked until separate review:

- publishing to skills.sh or another public registry;
- syncing the skill into live agents;
- packaging generated `.artifacts` files;
- including private prompts, local absolute paths, raw video, raw images, or
  credentials.

## Trigger description

Use the skill when the task asks for creator-facing visual output that must stay
public-safe and reproducible: frontier capsule, prompt DNA adapter, poster
surface, motion storyboard, contact-sheet proof, or a remix trail.

Do not use it for raw renderer operation, account automation, or storing model
outputs. Those stay outside the repo unless a future reviewed workflow adds a
safe adapter.

## Example task

```text
Turn this public-safe creator direction into a motion storyboard route, prove it
with a contact sheet, and leave a remix trail without committing raw video.
```

Expected command path:

```bash
bun creator:motion-storyboard-check
bun creator:contact-sheet-check
bun measure:check -- .artifacts/creator-motion-contact-sheet.html
bun print:render -- .artifacts/creator-motion-contact-sheet.html /tmp/dash-creator-motion-contact-sheet.pdf --canvas=1684x1191
bun security:scan
```

## Verification

```bash
bun creator:skill-package-check
bun docs:links
bun security:scan
bun hackathon:score
```

The skill package check validates the `SKILL.md` frontmatter, install boundary,
trigger description, example task, verification gate, workflow index route,
README entrypoint, package script, and CI hook.

## Failure modes

- The package says "published" or "installed live" without a reviewed release
  issue.
- The skill omits a verification gate or public boundary.
- The route depends on private prompts, raw generated media, account state, or
  local machine paths.
- The CI hook folds multiple creator commands into one invalid one-line `run`
  value.

## 中文摘要

这个 route 把 creator workflow 打包成 repo-local `SKILL.md` artifact：可以本地审查和试装，
但不能声称已经对外发布。每次改动都要跑 `bun creator:skill-package-check`，并继续通过
docs links、public-boundary scan 和 hackathon score。
