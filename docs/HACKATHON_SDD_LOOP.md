# Hackathon SDD Loop

This is the operating loop for the 24-hour push. It adapts the useful parts of ClawSweeper's repair architecture to `dash-design-infra` without copying its repo-specific automation.

The goal is not to spend more tokens. The goal is to convert tokens into merged, verified public surface.

## Strategic Read

Our leaderboard shape is asymmetric:

- we have far more threads than the current first-place profile;
- they have far deeper turns per thread, longer streak, and roughly 5.5x monthly credits;
- if their token count is about 5x ours, the gap is roughly 4.64B tokens.

So the winning move is not random burn. It is dense loop closure: every high-token thread must leave behind a durable repo artifact, score signal, or CI gate.

## Loop Model

Borrowed pattern from ClawSweeper:

```text
Review lane  -> proposal only, no mutation
Apply lane   -> deterministic, narrow repo mutation
Score lane   -> machine-readable proof that the slice improved
Publish lane -> PR, CI, merge, next slice
```

Translated for this repo:

1. Review one surface: README, AGENTS, package, workflow, usecase, or public boundary.
2. Convert review into one narrow patch.
3. Run local verification.
4. Run `bun hackathon:score`.
5. Commit and PR.
6. Let CI re-run the same proof.
7. Merge only when the proof is green.
8. Pick the next lowest-scoring surface.

A loop that produces only discussion is a failed loop unless the discussion is itself a merged operating spec.

## 30-minute loop

Use this exact loop under pressure:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/<slice-name>

bun tokens:build
bun metrics:build
bun typecheck
bun audit --audit-level high
bun docs:links
bun security:scan
bun hackathon:score
```

Then commit, PR, wait for CI, merge if green.

## Review lane

Review lane is allowed to say:

- this surface is weak;
- this claim is unsupported;
- this workflow is not executable;
- this doc leaks private context;
- this example is not installable;
- this would score badly with a new evaluator.

Review lane is not allowed to mutate broad surfaces at once. It proposes one slice.

## Apply lane

Apply lane mutates only the selected slice. Good slices:

- add one missing script;
- add one missing workflow doc;
- add one package example;
- add one CI gate;
- tighten one public-boundary rule;
- improve one README section with real links and commands.

Bad slices:

- rewrite the entire repo because it feels messy;
- add unverified claims;
- add private paths or source media;
- create generated artifact noise;
- copy another repo's code without attribution and adaptation.

## Score lane

`bun hackathon:score` is the local scoreboard proxy. It checks for:

- public README clarity;
- bilingual entrypoint;
- agent contract;
- public CSO/security posture;
- executable SDD loop;
- ClawSweeper reference attribution;
- workflow library depth;
- markdown link hygiene;
- public-boundary scan;
- CI gate coverage;
- package scripts.
- retained creator motion storyboard route before raw media or renderer work.

The score is intentionally blunt. It is not a beauty contest; it is a guardrail against fake progress.

Current retained creator slice:

```bash
bun creator:motion-storyboard-check
bun measure:check -- examples/creator-motion-storyboard.html
bun print:render -- examples/creator-motion-storyboard.html /tmp/dash-creator-motion-storyboard.pdf --canvas=1684x1191
```

This route is the allowed bridge from capsule memory to future video/contact-sheet work. Do not commit raw generated video, private prompts, local source paths, account screenshots, or client copy.

## Review-fitting without overfitting

Fit to evaluator signals, not to evaluator theater.

Likely positive signals:

- a new agent can start without asking Nolan what this is;
- commands are real and CI-backed;
- public/private boundary is explicit;
- workflows include failure modes and QA;
- reference repos are credited and transformed into our operating model;
- every PR leaves the next loop obvious.

Likely negative signals:

- token burn with no merged artifact;
- generic AI design wording;
- claims not backed by commands;
- broken relative links;
- hidden local assumptions;
- public docs that require private context.

## Bounded autonomy

Autonomy is allowed only inside gates:

- no secrets;
- no private media;
- no destructive GitHub mutation without PR + CI;
- no broad rewrite without a narrower score-backed reason;
- no merge unless CI passes;
- no security-sensitive automation beyond audit/reporting.

## Chinese summary

打法不是“狂烧 token”。打法是把 token 变成可合并资产：review 出一个缺口，apply 一个窄修复，score 证明变强，CI 复验，merge，然后下一轮。ClawSweeper 给我们的核心启发是：review 和 apply 分离，状态可追踪，动作有边界，循环有限制。我们把这个改造成设计基础设施 repo 的 SDD loop。
