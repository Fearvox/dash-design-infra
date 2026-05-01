# ClawSweeper Reference Map

Reference repo: https://github.com/openclaw/clawsweeper

ClawSweeper is MIT licensed. This repo does not vendor ClawSweeper code. We use it as an architectural reference for operating loops, guardrails, and verification posture.

## Attribution

ClawSweeper copyright belongs to Peter Steinberger and contributors under the MIT License.

If a future patch copies a substantial portion of ClawSweeper source code, include the MIT copyright notice for that copied portion. Current adaptation is conceptual and does not copy implementation code.

## Do not copy blindly

ClawSweeper is a conservative GitHub maintenance bot. `dash-design-infra` is a public design-infrastructure kit. The useful transfer is operating discipline, not repo-specific automation.

Do not copy:

- GitHub mutation paths for closing issues/PRs;
- bot identity and command router assumptions;
- OpenClaw-specific repository profiles;
- state repository layout that only makes sense for ClawSweeper;
- repair-worker credentials or live mutation gates.

## Evidence inspected in ClawSweeper

- `README.md`: review/apply lane split, durable reports, marker-backed comments, guarded apply.
- `AGENTS.md`: shard-level concurrency, generated state separation, safety rules.
- `docs/repair/operations.md`: plan/execute/autonomous modes, execution gates, security boundary, bounded comment routing.
- `schema/repair/job.schema.json`: explicit modes, allowed actions, `security_sensitive: false` constraint.
- `src/repair/review-results.ts`: merge preflight validation and security-sensitive mutation blocking.

## Adapted pattern matrix

| ClawSweeper pattern | Why it matters | DASH adaptation |
|---|---|---|
| Review lane is proposal-only | Separates judgment from mutation | Use review pass to identify weak public surfaces before editing |
| Apply lane is deterministic | Prevents agent drift and unsafe side effects | Only mutate narrow selected files, then verify locally and in CI |
| Durable generated state | Makes long loops inspectable | Write score output to `.artifacts/hackathon-score.json` locally, not committed |
| Marker-backed comments | Avoids duplicate public noise | Use stable docs/scripts/CI gates instead of repeated untracked notes |
| Security boundary | Keeps risky work out of autonomous repair | Public-boundary scan + SECURITY.md + CSO audit stay mandatory |
| Bounded repair iterations | Prevents infinite loops | 30-minute slice; score must improve or the loop stops |
| Review-result validation | Prevents bad fixes from shipping | `bun docs:links`, `bun security:scan`, `bun hackathon:score`, typecheck, audit |
| Commit/report queryability | Makes progress reviewable | README, HACKATHON_GOAL, and SDD loop tell the next agent where to continue |

## What this means for the hackathon

The leaderboard can reward volume, but volume without closure is waste. ClawSweeper's lesson is that high-output agents win when they make every review/action auditable and replayable.

For this repo, each second-round pass should leave one of these behind:

- a new executable workflow;
- a stronger package example;
- a CI gate;
- a public-boundary rule;
- a score check;
- a clearer agent entrypoint.

## Public boundary

This document references ClawSweeper's public architecture only. It does not include private credentials, workflow secrets, generated state, or copied source chunks.
