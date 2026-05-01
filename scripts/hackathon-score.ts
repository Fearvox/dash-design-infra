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
    label: 'Usecase library covers document, p5, and video workflows',
    points: 8,
    pass:
      existsSync('examples/one-pager.html') &&
      existsSync('usecases/p5js/electric-archive.md') &&
      existsSync('usecases/p5js/weather-report.md') &&
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
    label: 'Workflow index covers document, fixed-canvas, p5, video, hardening, and SDD loop routes',
    points: 10,
    pass: has('docs/WORKFLOW_INDEX.md', [
      'One-page brief / report',
      'Fixed-canvas HTML',
      'Kinetic poster',
      'Evidence weather map',
      'Dense generative video',
      'Public repo hardening',
      'Hackathon SDD loop',
    ]),
    evidence: 'docs/WORKFLOW_INDEX.md workflow matrix',
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
    label: 'CI gates build, typecheck, audit, link check, boundary scan, and hackathon score',
    points: 12,
    pass: has('.github/workflows/ci.yml', [
      'bun tokens:build',
      'bun metrics:build',
      'bun typecheck',
      'bun audit --audit-level high',
      'bun docs:links',
      'bun security:scan',
      'bun hackathon:score',
    ]),
    evidence: '.github/workflows/ci.yml',
  },
  {
    id: 'package-scripts',
    label: 'Package scripts expose the SDD score loop',
    points: 8,
    pass: scripts['hackathon:score'] === 'bun scripts/hackathon-score.ts',
    evidence: 'package.json scripts.hackathon:score',
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
