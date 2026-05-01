#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type Finding = {
  file: string;
  line: number;
  href: string;
};

function gitMarkdownFiles(): string[] {
  const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.md'], {
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
    .filter((file) => existsSync(file));
}

function isExternalOrAnchor(href: string): boolean {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('#') ||
    href.startsWith('/en/docs')
  );
}

const findings: Finding[] = [];
const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

for (const file of gitMarkdownFiles()) {
  const text = readFileSync(file, 'utf8');
  let inFence = false;

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('````')) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    for (const match of line.matchAll(linkPattern)) {
      const rawHref = match[1]?.trim() ?? '';
      if (!rawHref || isExternalOrAnchor(rawHref)) continue;

      const pathPart = decodeURIComponent(rawHref.split('#', 1)[0] ?? '');
      if (!pathPart) continue;

      const target = resolve(dirname(file), pathPart);
      if (!existsSync(target)) {
        findings.push({ file, line: index + 1, href: rawHref });
      }
    }
  });
}

if (findings.length > 0) {
  console.error(`markdown-link-check: failed with ${findings.length} broken relative link(s)`);
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line}\t${finding.href}`);
  }
  process.exit(1);
}

console.log('markdown-link-check: clean');
