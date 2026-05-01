#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { spawnSync } from 'node:child_process';

type Finding = {
  kind: string;
  file: string;
  line: number;
  text: string;
};

const binaryExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.mp4',
  '.mov',
  '.mp3',
  '.wav',
  '.zip',
  '.gz',
  '.tgz',
]);

const localUserPath = '/Users/' + '0xvox';
const privateLabName = 'hermes' + '-creative-lab';
const privateSmokeDir = 'td' + '_max_smoke';
const privateAudioName = '7' + 'Eighth';

const patterns: Array<[string, RegExp]> = [
  ['private-local-path', new RegExp(localUserPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))],
  ['private-lab-name', new RegExp(privateLabName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')],
  ['private-render-dir', new RegExp(privateSmokeDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')],
  ['private-audio-name', new RegExp(privateAudioName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')],
  ['openai-style-secret', /sk-(?:proj-|live-|test-)?[A-Za-z0-9_-]{24,}/],
  ['secret-assignment', /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i],
  ['env-secret-value', /^[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*=/i],
];

function gitFiles(): string[] {
  const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(result.stderr || 'git ls-files failed');
    process.exit(result.status ?? 1);
  }
  return result.stdout
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => existsSync(file))
    .filter((file) => !binaryExtensions.has(extname(file).toLowerCase()));
}

const findings: Finding[] = [];

for (const file of gitFiles()) {
  const text = readFileSync(file, 'utf8');
  let inFence = false;

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('````')) {
      inFence = !inFence;
      return;
    }

    // The repo contains public educational snippets. Scan prose, config, and source;
    // skip fenced examples to avoid rejecting deliberately fake teaching values.
    if (inFence) return;

    for (const [kind, pattern] of patterns) {
      if (pattern.test(line)) {
        findings.push({ kind, file, line: index + 1, text: line.slice(0, 180) });
      }
    }
  });
}

if (findings.length > 0) {
  console.error(`public-boundary-scan: failed with ${findings.length} finding(s)`);
  for (const finding of findings) {
    console.error(`${finding.kind}\t${finding.file}:${finding.line}\t${finding.text}`);
  }
  process.exit(1);
}

console.log('public-boundary-scan: clean');
