# Public CSO Audit

Date: 2026-05-01
Scope: public repository surface for `Fearvox/dash-design-infra`
Mode: public-facing release audit, not a private penetration test

## Executive Read

This repository is safe to present publicly as a design-infrastructure kit if the current boundary stays enforced.

The important thing: this repo should publish reusable design machinery and workflow discipline, not raw lab material. The current public surface follows that rule.

## Audit Scope

Reviewed surfaces:

- README.md and README-zh.md
- AGENTS.md
- SECURITY.md
- docs/
- docs/WORKFLOW_INDEX.md
- examples/
- usecases/
- package metadata
- .gitignore
- dependency audit output
- CI/typecheck path
- ClawSweeper-derived SDD loop docs

Not in scope:

- private source videos, private audio, or local render directories;
- deployment credentials;
- non-public project material;
- GitHub organization policy outside this repo.

## Results

| Control | Status | Evidence |
|---|---:|---|
| No private local paths in public docs | PASS | repo text scan excludes local user paths, private lab names, private render directories, and private audio names |
| No hardcoded secrets in repo text | PASS | regex scan for secret assignments and key-like values returned 0 repo findings |
| Env files ignored | PASS | `.env`, `.env.local`, `.env.*.local` in `.gitignore` |
| Raw media excluded by policy | PASS | AGENTS.md and README trust boundary explicitly block raw video/audio and internal lab dumps |
| Dependency high-severity audit | PASS | `bun audit --audit-level high` returned no vulnerabilities |
| Markdown link check | PASS | `bun docs:links` returned clean |
| Public-boundary scan | PASS | `bun security:scan` returned clean |
| Hackathon score gate | PASS | `bun hackathon:score` returned max score |
| Type safety | PASS | `bun typecheck` passed across all packages |
| CI enforcement | PASS | `.github/workflows/ci.yml` now runs token build, metrics build, typecheck, dependency audit, creator gates, docs link check, public-boundary scan, and hackathon score |
| Public security reporting path | PASS | SECURITY.md added |
| Agent contribution boundary | PASS | AGENTS.md states public boundary and verification commands |
| Workflow index | PASS | `docs/WORKFLOW_INDEX.md` maps artifact jobs to entry file, package layer, command path, QA gate, and public boundary |

## Findings

### P0 / P1

None found in this audit pass.

### P2: Local ignored cache directory exists

A local ignored `~/` directory exists in the working tree, containing Bun cache material. It is ignored and not part of the public repo. It should not be committed.

Impact: low, because `.gitignore` already ignores `~`, and the public scan excludes ignored local cache directories.

Recommendation: leave ignored locally or delete manually outside the repo if it becomes annoying. Do not add it to commits.

## Public Boundary Policy

Public docs and examples may include:

- package purpose;
- sanitized workflows;
- command patterns;
- pseudocode;
- small intentional preview assets;
- failure modes and QA checks.

Public docs and examples must not include:

- local machine paths;
- private audio/video names;
- raw generated media from private projects;
- client text;
- credentials;
- API keys;
- `.env` values;
- internal task notes that depend on private context.

## Required Release Checks

Run before public-facing PRs:

```bash
bun typecheck
bun creator:prompt-dna-check
bun docs:links
bun audit --audit-level high
bun security:scan
bun hackathon:score
```

The public-boundary scan is first-class and lives at [`scripts/public-boundary-scan.ts`](../scripts/public-boundary-scan.ts). It checks tracked and unignored files for private local paths, private lab names, private media names, secret-shaped assignments, and env-style secret values. It skips binary media and fenced educational examples to avoid false positives from intentionally fake snippets.

## CSO Decision

Approved for public presentation with current controls.

Next hardening step: add a workflow index and package-level examples so the score gate measures deeper adoption surfaces, not only repo entrypoint quality.
