#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type PackageJson = { scripts?: Record<string, string> };

const skillPath = 'skill-packages/creator-workflow/SKILL.md';
const workflowPath = 'usecases/creator/creator-skill-package.md';
const packagePath = 'package.json';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const readmePath = 'README.md';
const agentPath = 'AGENTS.md';
const ciPath = '.github/workflows/ci.yml';

function fail(message: string): never {
  console.error(`creator-skill-package-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

function requireAll(path: string, needles: string[]): string {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${path} missing ${needle}`);
  }
  return text;
}

const packageJson = JSON.parse(read(packagePath) || '{}') as PackageJson;
if (packageJson.scripts?.['creator:skill-package-check'] !== 'bun scripts/creator-skill-package-check.ts') {
  fail(`${packagePath} must expose creator:skill-package-check`);
}

const skill = requireAll(skillPath, [
  'name: dash-creator-workflow',
  'description:',
  'When To Use',
  'Workflow',
  'Verification Gate',
  'Install Boundary',
  'Public Boundary',
  'Example Task',
  'Failure Modes',
  '中文摘要',
  'idea -> capsule -> artifact -> proof -> remix trail',
  'bun creator:skill-package-check',
  'bun creator:capsule-check',
  'bun creator:motion-storyboard-check',
  'bun creator:contact-sheet-check',
  'bun docs:links',
  'bun security:scan',
  'bun hackathon:score',
  'Do not publish this skill externally',
  'raw generated media',
  'private prompts',
  'local absolute',
  'API keys',
]);

const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
if (!frontmatter) fail(`${skillPath} must start with YAML frontmatter`);
const description = frontmatter[1]?.match(/^description:\s*(.+)$/m)?.[1] ?? '';
for (const needle of ['creator', 'capsule', 'artifact', 'proof', 'raw generated media', 'private prompts']) {
  if (!description.toLowerCase().includes(needle)) fail(`${skillPath} description must trigger on ${needle}`);
}

requireAll(workflowPath, [
  'Creator Skill Package Route',
  '../../skill-packages/creator-workflow/SKILL.md',
  'Repo-local install boundary',
  'Trigger description',
  'Example task',
  'Verification',
  'bun creator:skill-package-check',
  'not an external release',
  'publishing to skills.sh',
  '中文摘要',
]);

requireAll(workflowIndexPath, [
  'Creator skill package',
  '../skill-packages/creator-workflow/SKILL.md',
  'creator:skill-package-check',
  'repo-local skill artifact',
  'no external publish',
]);

requireAll(readmePath, [
  'Creator Skill Package',
  'skill-packages/creator-workflow/SKILL.md',
  'creator:skill-package-check',
  'repo-local skill package',
]);

requireAll(agentPath, [
  'creator:skill-package-check',
  'skill-packages/creator-workflow/SKILL.md',
  'Do not publish or sync the skill package externally',
]);

const ci = requireAll(ciPath, [
  '- name: Creator Contact Sheet Check',
  'run: bun creator:contact-sheet-check',
  '- name: Creator Skill Package Check',
  'run: bun creator:skill-package-check',
]);

if (ci.includes('run: bun creator:motion-storyboard-check\n          bun creator:contact-sheet-check')) {
  fail(`${ciPath} must not fold contact-sheet into the motion-storyboard step`);
}

console.log(`creator-skill-package-check: PASS ${skillPath} + ${workflowPath} are repo-local and verified`);
