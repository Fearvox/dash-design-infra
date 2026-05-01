#!/usr/bin/env bun
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

type Check = {
  id: string;
  label: string;
  points: number;
  pass: boolean;
  evidence: string;
};

function read(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function has(path: string, needles: string[]): boolean {
  const text = read(path);
  return needles.every((needle) => text.includes(needle));
}

function commandPass(command: string, args: string[]): boolean {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: 'pipe' });
  return result.status === 0;
}

const packageJson = JSON.parse(read('package.json') || '{}') as { scripts?: Record<string, string> };
const scripts = packageJson.scripts ?? {};

const checks: Check[] = [
  {
    id: 'readme-positioning',
    label: 'README explains why the repo exists, what to run, and the trust boundary',
    points: 10,
    pass: has('README.md', ['Why This Exists', 'Quick Start', 'Use Cases', 'Public Trust Boundary']),
    evidence: 'README.md core public sections',
  },
  {
    id: 'zh-entrypoint',
    label: 'Chinese README mirrors the public entrypoint',
    points: 6,
    pass: has('README-zh.md', ['为什么存在', '快速开始', '公开信任边界']),
    evidence: 'README-zh.md bilingual public surface',
  },
  {
    id: 'agent-contract',
    label: 'Agent handoff contract exists and names verification commands',
    points: 8,
    pass: has('AGENTS.md', ['Default Commands', 'Public Boundary', 'Quality Bar']),
    evidence: 'AGENTS.md',
  },
  {
    id: 'public-security',
    label: 'Public security path and CSO audit exist',
    points: 10,
    pass: existsSync('SECURITY.md') && existsSync('docs/PUBLIC_CSO_AUDIT.md'),
    evidence: 'SECURITY.md + docs/PUBLIC_CSO_AUDIT.md',
  },
  {
    id: 'sdd-loop',
    label: 'Hackathon SDD loop is documented as executable operating model',
    points: 12,
    pass: has('docs/HACKATHON_SDD_LOOP.md', ['Review lane', 'Apply lane', 'Score lane', '30-minute loop']),
    evidence: 'docs/HACKATHON_SDD_LOOP.md',
  },
  {
    id: 'reference-map',
    label: 'ClawSweeper reference is attributed and mapped to safe adaptations',
    points: 8,
    pass: has('docs/CLAW_SWEEPER_REFERENCE.md', ['MIT', 'Adapted pattern', 'Do not copy blindly']),
    evidence: 'docs/CLAW_SWEEPER_REFERENCE.md',
  },
  {
    id: 'workflow-library',
    label: 'Usecase library covers creator, document, p5, visual research, and video workflows',
    points: 8,
    pass:
      existsSync('examples/one-pager.html') &&
      existsSync('examples/creator-frontier-capsule.html') &&
      existsSync('examples/creator-evolution-loop.json') &&
      existsSync('examples/creator-mutation-candidates.json') &&
      existsSync('examples/creator-poster-surface.html') &&
      existsSync('examples/creator-prompt-dna-adapter.json') &&
      existsSync('examples/creator-motion-storyboard.html') &&
      existsSync('usecases/creator/creator-contact-sheet-qa.md') &&
      existsSync('examples/refero-research-board.html') &&
      existsSync('usecases/creator/creator-frontier-capsule.md') &&
      existsSync('usecases/p5js/electric-archive.md') &&
      existsSync('usecases/p5js/weather-report.md') &&
      existsSync('usecases/visual-research/refero-visual-research.md') &&
      existsSync('usecases/video/windburn-render-workflow.md'),
    evidence: 'examples/ + usecases/',
  },

  {
    id: 'workflow-index-contract',
    label: 'Workflow index routes artifact jobs through entry, layer, command, QA, and boundary',
    points: 10,
    pass: has('docs/WORKFLOW_INDEX.md', [
      'entry file',
      'package layer',
      'command path',
      'QA gate',
      'public boundary',
      'Workflow Matrix',
    ]),
    evidence: 'docs/WORKFLOW_INDEX.md contract',
  },
  {
    id: 'workflow-index-coverage',
    label: 'Workflow index covers creator, document, fixed-canvas, p5, video, hardening, and SDD loop routes',
    points: 10,
    pass: has('docs/WORKFLOW_INDEX.md', [
      'One-page brief / report',
      'Fixed-canvas HTML',
      'Kinetic poster',
      'Evidence weather map',
      'Dense generative video',
      'Creator frontier capsule',
      'Creator evolution engine',
      'Creator mutation ledger',
      'Creator poster surface',
      'Creator prompt DNA adapter',
      'Creator motion storyboard',
      'Creator contact-sheet QA',
      'Public repo hardening',
      'Hackathon SDD loop',
    ]),
    evidence: 'docs/WORKFLOW_INDEX.md workflow matrix',
  },

  {
    id: 'visual-research-board',
    label: 'Refero-inspired visual research board is documented, synthetic, and measurable',
    points: 12,
    pass:
      existsSync('examples/refero-research-board.html') &&
      has('usecases/visual-research/refero-visual-research.md', [
        'Refero patterns extracted',
        'Multica workbench patterns imported',
        'Browser proofshot QA',
        'Public boundary',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Visual research board', 'refero-research-board.html']),
    evidence: 'Refero visual research workflow + example board',
  },
  {
    id: 'darwin-skill-ratchet',
    label: 'Darwin-inspired skill ratchet workflow is vetted, synthetic, and measurable',
    points: 12,
    pass:
      existsSync('examples/darwin-ratchet-board.html') &&
      has('usecases/visual-research/darwin-skill-ratchet.md', [
        'Source Vetting Summary',
        'Pattern Extracted',
        'Rubric For Visual Skill Loops',
        'Public Boundary',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Skill ratchet board', 'darwin-ratchet-board.html']),
    evidence: 'Darwin skill ratchet workflow + example board',
  },
  {
    id: 'creator-frontier-capsule',
    label: 'Creator capsule workflow is minimal, public-safe, machine-checked, and measurable',
    points: 12,
    pass:
      scripts['creator:capsule-check'] === 'bun scripts/creator-capsule-check.ts' &&
      commandPass('bun', ['creator:capsule-check']) &&
      existsSync('docs/CREATOR_OS.md') &&
      existsSync('examples/creator-frontier-capsule.json') &&
      existsSync('examples/creator-frontier-capsule.html') &&
      has('usecases/creator/creator-frontier-capsule.md', [
        'Capsule schema',
        'Tool adapter rules',
        'Public boundary',
        '中文摘要',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Creator frontier capsule', 'creator-frontier-capsule.html']),
    evidence: 'Creator OS + capsule JSON + workflow + board',
  },
  {
    id: 'creator-evolution-engine',
    label: 'Creator evolution engine encodes Darwin-style self-evolution, not dashboard theater',
    points: 12,
    pass:
      scripts['creator:evolution-check'] === 'bun scripts/creator-evolution-check.ts' &&
      commandPass('bun', ['creator:evolution-check']) &&
      existsSync('docs/CREATOR_EVOLUTION_ENGINE.md') &&
      existsSync('examples/creator-evolution-loop.json') &&
      has('docs/CREATOR_EVOLUTION_ENGINE.md', [
        'Anti-dashboard rule',
        '30-day self-evolution plan',
        'Fitness rubric',
        '中文摘要',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Creator evolution engine', 'creator:evolution-check']),
    evidence: 'Creator evolution doctrine + JSON runbook + machine check',
  },
  {
    id: 'creator-mutation-ledger',
    label: 'Creator mutation ledger compares candidates before retaining Darwin winners',
    points: 10,
    pass:
      scripts['creator:mutation-check'] === 'bun scripts/creator-mutation-check.ts' &&
      commandPass('bun', ['creator:mutation-check']) &&
      existsSync('examples/creator-mutation-candidates.json') &&
      has('usecases/creator/creator-mutation-candidates.md', [
        'Anti-dashboard pressure',
        'Current retained winner',
        'Selection rule',
        '中文摘要',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Creator mutation ledger', 'creator:mutation-check']),
    evidence: 'Creator mutation candidate ledger + machine check',
  },
  {
    id: 'creator-poster-surface',
    label: 'Creator poster surface turns capsule memory into a measured publishable artifact',
    points: 12,
    pass:
      scripts['creator:poster-check'] === 'bun scripts/creator-poster-check.ts' &&
      commandPass('bun', ['creator:poster-check']) &&
      existsSync('examples/creator-poster-surface.json') &&
      existsSync('examples/creator-poster-surface.html') &&
      has('usecases/creator/creator-poster-surface.md', [
        'Mutation selected',
        'Public boundary',
        'Remix rule',
        '中文摘要',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Creator poster surface', 'creator-poster-surface.html']),
    evidence: 'Creator poster surface contract + HTML artifact + machine check',
  },
  {
    id: 'creator-prompt-dna-adapter',
    label: 'Creator prompt DNA adapter preserves model-ready creative genetics without raw media',
    points: 12,
    pass:
      scripts['creator:prompt-dna-check'] === 'bun scripts/creator-prompt-dna-check.ts' &&
      commandPass('bun', ['creator:prompt-dna-check']) &&
      existsSync('examples/creator-prompt-dna-adapter.json') &&
      existsSync('examples/creator-prompt-dna-adapter.html') &&
      has('usecases/creator/creator-prompt-dna-adapter.md', [
        'Mutation selected',
        'Public boundary',
        'Remix rule',
        '中文摘要',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Creator prompt DNA adapter', 'creator-prompt-dna-adapter.html']),
    evidence: 'Creator prompt DNA adapter contract + proof card + machine check',
  },

  {
    id: 'creator-motion-storyboard',
    label: 'Creator motion storyboard bridges capsule memory to video direction without raw media',
    points: 12,
    pass:
      scripts['creator:motion-storyboard-check'] === 'bun scripts/creator-motion-storyboard-check.ts' &&
      commandPass('bun', ['creator:motion-storyboard-check']) &&
      existsSync('examples/creator-motion-storyboard.json') &&
      existsSync('examples/creator-motion-storyboard.html') &&
      existsSync('usecases/creator/creator-contact-sheet-qa.md') &&
      has('README.md', ['Creator Motion Storyboard', 'creator:motion-storyboard-check']) &&
      has('examples/README.md', ['Creator Storyboard', 'creator-motion-storyboard.html']) &&
      has('docs/HACKATHON_SDD_LOOP.md', ['creator:motion-storyboard-check', 'creator-motion-storyboard.html']) &&
      has('usecases/creator/creator-motion-storyboard.md', [
        'Mutation selected',
        'Public boundary',
        'Remix rule',
        'Contact-sheet bridge',
        '中文摘要',
      ]) &&
      has('docs/WORKFLOW_INDEX.md', ['Creator motion storyboard', 'creator-motion-storyboard.html']),
    evidence: 'Creator motion storyboard contract + fixed-canvas artifact + machine check',
  },

  {
    id: 'creator-contact-sheet-qa',
    label: 'Creator contact-sheet QA regenerates ignored proof artifacts before video work',
    points: 10,
    pass:
      scripts['creator:contact-sheet-check'] === 'bun scripts/creator-contact-sheet-check.ts' &&
      commandPass('bun', ['creator:contact-sheet-check']) &&
      existsSync('scripts/creator-contact-sheet-check.ts') &&
      existsSync('usecases/creator/creator-contact-sheet-qa.md') &&
      has('.gitignore', ['.artifacts']) &&
      has('docs/WORKFLOW_INDEX.md', ['Creator contact-sheet QA', 'creator-motion-contact-sheet.html']),
    evidence: 'Creator contact-sheet QA script + ignored artifact contract',
  },
  {
    id: 'docs-links',
    label: 'Markdown relative links are machine-checked',
    points: 8,
    pass: scripts['docs:links'] === 'bun scripts/markdown-link-check.ts' && commandPass('bun', ['docs:links']),
    evidence: 'bun docs:links',
  },
  {
    id: 'boundary-scan',
    label: 'Public-boundary scan is first-class and clean',
    points: 10,
    pass: scripts['security:scan'] === 'bun scripts/public-boundary-scan.ts' && commandPass('bun', ['security:scan']),
    evidence: 'bun security:scan',
  },
  {
    id: 'ci-gates',
    label: 'CI gates build, typecheck, audit, capsule check, link check, boundary scan, and hackathon score',
    points: 12,
    pass: has('.github/workflows/ci.yml', [
      'bun tokens:build',
      'bun metrics:build',
      'bun typecheck',
      'bun audit --audit-level high',
      'bun creator:capsule-check',
      'bun creator:evolution-check',
      'bun creator:mutation-check',
      'bun creator:poster-check',
      'bun creator:prompt-dna-check',
      '- name: Creator Motion Storyboard Check',
      'bun creator:motion-storyboard-check',
      'bun creator:contact-sheet-check',
      'bun docs:links',
      'bun security:scan',
      'bun hackathon:score',
    ]),
    evidence: '.github/workflows/ci.yml',
  },
  {
    id: 'package-scripts',
    label: 'Package scripts expose the creator capsule and SDD score loop',
    points: 8,
    pass:
      scripts['creator:capsule-check'] === 'bun scripts/creator-capsule-check.ts' &&
      scripts['creator:evolution-check'] === 'bun scripts/creator-evolution-check.ts' &&
      scripts['creator:mutation-check'] === 'bun scripts/creator-mutation-check.ts' &&
      scripts['creator:poster-check'] === 'bun scripts/creator-poster-check.ts' &&
      scripts['creator:prompt-dna-check'] === 'bun scripts/creator-prompt-dna-check.ts' &&
      scripts['creator:motion-storyboard-check'] === 'bun scripts/creator-motion-storyboard-check.ts' &&
      scripts['creator:contact-sheet-check'] === 'bun scripts/creator-contact-sheet-check.ts' &&
      scripts['hackathon:score'] === 'bun scripts/hackathon-score.ts',
    evidence: 'package.json scripts.creator:capsule-check + scripts.creator:evolution-check + scripts.creator:mutation-check + scripts.creator:poster-check + scripts.creator:prompt-dna-check + scripts.creator:motion-storyboard-check + scripts.creator:contact-sheet-check + scripts.hackathon:score',
  },
];

const earned = checks.filter((check) => check.pass).reduce((sum, check) => sum + check.points, 0);
const total = checks.reduce((sum, check) => sum + check.points, 0);
const percent = Math.round((earned / total) * 1000) / 10;
const report = {
  score: earned,
  total,
  percent,
  verdict: earned === total ? 'MAXXED' : percent >= 90 ? 'STRONG' : 'NEEDS_NEXT_LOOP',
  checks,
};

mkdirSync('.artifacts', { recursive: true });
writeFileSync('.artifacts/hackathon-score.json', `${JSON.stringify(report, null, 2)}\n`);

console.log(`hackathon-score: ${earned}/${total} (${percent}%) ${report.verdict}`);
for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'}\t${check.id}\t${check.points}\t${check.evidence}`);
}

if (earned < total) {
  process.exit(1);
}
