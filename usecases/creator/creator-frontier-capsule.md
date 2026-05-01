# Creator Frontier Capsule Workflow

A Creator Capsule is the smallest durable memory unit for frontier visual work.

It helps a creator resume an idea without asking the agent to remember vibes. The capsule stores intent, visual grammar, output surface, allowed inputs, tool route, proof path, and remix rule. Any frontier tool can plug in later because the contract is about creative work, not about one renderer.

## Problem

Creators do not lose because they lack generation tools. They lose because each tool creates a new island:

- prompts are separated from visual proof;
- screenshots are separated from why the piece exists;
- remixes lose the seed;
- one-off demos cannot become reusable workflows;
- private source material accidentally leaks into public examples.

The capsule fixes the handoff:

```text
creator intent -> compact capsule -> rendered artifact -> proof -> remix trail
```

## Output

- Machine-readable capsule: [`examples/creator-frontier-capsule.json`](../../examples/creator-frontier-capsule.json)
- Fixed-canvas creator board: [`examples/creator-frontier-capsule.html`](../../examples/creator-frontier-capsule.html)
- Validation script: `bun creator:capsule-check`

## Capsule schema

```json
{
  "creator": "founder / artist / researcher / content creator / agent builder",
  "intent": "what the artifact must do",
  "memory": ["what must survive remix"],
  "surface": "poster | board | deck | short | pdf | tox | web | skill",
  "grammar": {
    "layout": "composition rule",
    "type": "typographic personality",
    "color": "palette logic",
    "motion": "motion or stillness rule"
  },
  "inputs": {
    "allowed": ["public or synthetic inputs"],
    "blocked": ["private/source/secrets/raw media"]
  },
  "tool_path": ["research", "render", "measure", "publish"],
  "proof": ["measure", "print", "browser", "contact-sheet", "score"],
  "remix_rule": "what may change while preserving identity"
}
```

## Layer model

```text
Capsule JSON
  ↓ names creator memory and output target
Synthetic board / artifact
  ↓ renders the capsule for human review
DASH proof path
  ↓ measure, print, browser, scan, score
Remix trail
  ↓ future tools can regenerate or adapt without copying private source
```

## Commands

```bash
bun creator:capsule-check
bun measure:check -- examples/creator-frontier-capsule.html
bun print:render -- examples/creator-frontier-capsule.html /tmp/dash-creator-frontier-capsule.pdf --canvas=1684x1191
bun docs:links
bun security:scan
bun hackathon:score
```

## Tool adapter rules

Any future visual tool can enter if it can fill the capsule fields and name proof.

| Tool family | What the capsule stores | Proof |
|---|---|---|
| HTML / browser boards | layout, copy hierarchy, synthetic cards | browser measure + visual QA |
| p5.js / creative coding | seed, layers, motion grammar, frame size | deterministic frame contract + preview |
| Remotion / video | beats, scenes, duration, delivery target | render + contact sheet + compression target |
| Manim | concept, scene graph, narration beats | frame render + text fit |
| TouchDesigner / twozero | network intent, operators, exported public tox/screenshot | running TD contract + port note |
| Image/video models | prompt DNA, style boundary, negative prompt, seed when available | preview sheet + public asset policy |
| Skills / agents | trigger, expected task, test prompts, rollback | Darwin ratchet + score gate |

## Failure modes

| Failure | Symptom | Fix |
|---|---|---|
| Vibes-only memory | “Make it like last time” with no recoverable fields | Write the capsule before rendering |
| Tool lock-in | Workflow only works for one renderer | Move renderer details to `tool_path`, keep intent/grammar tool-neutral |
| Private leakage | Capsule points at private paths or raw source media | Replace with synthetic/public inputs and boundary notes |
| No proof | Artifact looks good in chat but clips or fails export | Require measure/print/browser/contact sheet before merge |
| Overbuilt schema | Capsule becomes a CMS | Keep only fields that help resume, render, or verify |

## Public boundary

Allowed:

- synthetic examples;
- public visual grammar;
- public-safe prompt DNA;
- tool routing and verification commands.

Blocked:

- private creator source files;
- real client copy unless explicitly sanitized;
- local absolute paths;
- raw videos/audio/models;
- secrets, API keys, cookies, account screenshots.

## 中文摘要

Creator Capsule 是给创作者用的最小记忆单元。它不绑定某个工具，而是保存创意意图、视觉语法、输出表面、允许输入、工具路径、验证方式和 remix 规则。以后 TouchDesigner、p5、Remotion、Manim、image/video model 都可以接进来，但核心 repo 仍然保持小而清楚。