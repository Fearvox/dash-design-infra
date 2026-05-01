# Creator Prompt DNA Adapter Route

This route keeps frontier image/video model work from becoming raw prompt soup.

It turns the Creator Frontier Capsule into a public-safe prompt DNA contract before any model run. The adapter stores reusable creative genetics: core intent, visual grammar, composition, palette, motion memory, remix handles, negative space, and blocked outputs. It deliberately uses a synthetic HTML proof card instead of raw generated media.

## Output

- Adapter contract: [`examples/creator-prompt-dna-adapter.json`](../../examples/creator-prompt-dna-adapter.json)
- Proof card: [`examples/creator-prompt-dna-adapter.html`](../../examples/creator-prompt-dna-adapter.html)
- Validation command: `bun creator:prompt-dna-check`

## JSON contract

The adapter JSON is the public-safe handoff between a creator capsule and an external image/video model. It must name:

- `source_capsule`: the capsule that supplied intent, memory, grammar, proof, and blocked-input rules.
- `adapter`: route id, adapter kind, job, and supported surface targets.
- `input_contract`: required capsule fields plus optional model controls such as seed, aspect ratio, duration, or delivery channel.
- `prompt_dna`: reusable creative genetics: core intent, visual grammar, composition, palette, motion memory, remix handles, negative space, and blocked outputs.
- `preview`: the synthetic proof card and PDF preview path, plus prohibited media.
- `public_boundary`: allowed public-safe material and blocked private/raw material.

## Preview instructions

1. Start from the capsule, not from a private prompt dump.
2. Convert only public-safe intent, grammar, surface target, and boundary rules into prompt DNA.
3. Render the synthetic HTML proof card before any model run.
4. If a model run is needed, keep raw images/videos outside git and review a contact sheet first.
5. Commit only the adapter JSON, proof card, or a deliberately reviewed public-safe preview.

## Script gate

`bun creator:prompt-dna-check` validates the JSON contract, proof card, public boundary, and workflow doc. The route is not retained unless this gate passes with `measure`, `print`, `security`, and browser proof commands named in the contract.

## Mutation selected

| Field | Value |
|---|---|
| Candidate | `adapter-prompt-dna-route` |
| Axis | `tool adapter` |
| Phenotype | JSON prompt DNA contract + fixed-canvas preview artifact |
| Retention | adapter example + script gate |
| Not retained | raw generated image/video media |

## Adapter contract

The adapter consumes the creator capsule plus a target surface and model family. It must preserve:

| Field | Meaning |
|---|---|
| `core_intent` | the job the model output must do |
| `visual_grammar` | tool-neutral style DNA that should survive model changes |
| `composition` | stable arrangement rule for generated variants |
| `palette` | color logic, not a copied asset |
| `motion_memory` | still or motion behavior that future video variants can reuse |
| `remix_handles` | parameters the creator may change safely |
| `negative_space` | quiet area reserved for captions, overlays, or print marks |
| `blocked_outputs` | outputs that should be rejected before publish |

The contract records a seed only when the model exposes one. If there is no seed, the retained memory is the prompt DNA plus preview notes.

## Preview artifact

The preview is [`examples/creator-prompt-dna-adapter.html`](../../examples/creator-prompt-dna-adapter.html), a fixed-canvas synthetic proof card. It visualizes the adapter fields and proof path without embedding model output images, video renders, account screenshots, or private source frames.

## Script gate

`bun creator:prompt-dna-check` validates the selected ledger candidate, prompt DNA contract, synthetic preview artifact, proof commands, and public boundary. It also rejects preview HTML that embeds generated media files.

## Commands

```bash
bun creator:prompt-dna-check
bun measure:check -- examples/creator-prompt-dna-adapter.html
bun print:render -- examples/creator-prompt-dna-adapter.html /tmp/dash-creator-prompt-dna-adapter.pdf --canvas=1684x1191
bun security:scan
bun hackathon:score
```

## Public boundary

Allowed:

- synthetic creator intent;
- public-safe prompt DNA;
- model-independent adapter notes;
- synthetic preview cards.

Blocked:

- private prompts;
- raw creator media;
- local absolute paths;
- API keys, cookies, account screenshots;
- client copy or unreleased brand assets;
- raw generated media before contact-sheet QA exists.

## Remix rule

Change model family, seed, aspect ratio, target surface, or accent freely. Preserve core intent, visual grammar, blocked outputs, preview policy, public boundary, and proof path.

## 中文摘要

这是 frontier image/video model 的 prompt DNA adapter。它不提交原始生成媒体，而是先保存可复用的创意基因：core intent、visual grammar、composition、palette、motion memory、remix handles、negative space 和 blocked outputs。这样 creator 可以安全 remix，而 repo 核心仍然保持小。
