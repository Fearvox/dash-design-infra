# Contributing

Thanks for improving `dash-design-infra`.

This repo is small on purpose. Please keep contributions surgical, readable, and easy to validate.

## Principles

- Prefer the smallest change that improves the system.
- Preserve the fixed-canvas operating model unless a change explicitly expands scope.
- Validate on a real page path when touching layout, typography, measurement, or print behavior.
- Do not reintroduce private client materials, local-only paths, or proprietary assets.

## Setup

```bash
bun install
bun x playwright install chromium
```

## Before you open a PR

Run the minimum relevant checks:

```bash
bun tokens:build
bun metrics:build
bun typecheck
```

If your change touches page fitting or print behavior, also run:

```bash
bun measure:check -- <page.html>
bun print:render -- <page.html> <out.pdf>
```

## Change guidance

### Tokens

- Edit `packages/tokens/src/tokens.json`.
- Rebuild generated artifacts before committing.
- Keep token names semantic, not page-specific.

### Scale

- Keep line-height aligned to the 8px baseline rule.
- Explain any ratio change in the PR description.

### Metrics

- Do not hardcode private filesystem paths.
- If font extraction behavior changes, keep the CLI path/env flow generic.

### Measure and print

- Prefer real-browser validation over theoretical reasoning.
- Call out any browser-specific assumptions.

### Layout

- Preserve the distinction between required constraints and soft preferences.
- Document any new solver pattern in the package README if it becomes reusable.

## What not to contribute

- Client decks, PDFs, pitch assets, videos, or internal brand collateral
- Secrets, local cache artifacts, or machine-specific config
- Large redesigns that change the repo's purpose from fixed-canvas editorial infrastructure to a general frontend framework

## Pull request notes

Good PRs here usually include:

- what changed
- why it changed
- how it was validated
- what remains intentionally out of scope

## License

By contributing, you agree that your contributions are licensed under the MIT license in this repository.
