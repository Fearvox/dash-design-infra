#!/usr/bin/env bun
/**
 * Creator Orphan Script Check
 *
 * Discovers all scripts/creator-*.ts files and cross-references
 * against package.json creator:* entries. Reports scripts that
 * exist on the filesystem but have no corresponding package.json
 * entry — catching orphan source files that waste agent attention
 * or harbor stale/abandoned work.
 *
 * This is the inverse of creator-script-health (which checks that
 * package.json entries have existing source files). Together they
 * ensure perfect 1:1 correspondence.
 *
 * Slice: creator-orphan-script-route
 * Darwin axis: proof method (orphan source file detection)
 */

import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SCRIPTS_DIR = 'scripts';
const PACKAGE_JSON_PATH = 'package.json';
const CREATOR_PREFIX = 'creator:';
const FILE_GLOB = /^creator-.+\.ts$/;

/**
 * Extract the source file path from a package.json script command.
 * Mirrors the extractSourceFile logic from creator-script-health.
 */
function extractSourceFile(command: string, pkgScripts: Record<string, string>): string | null {
  let cmd = command.trim();
  if (!cmd.startsWith('bun ')) return null;
  cmd = cmd.slice(4).trim();
  if (cmd.startsWith('run ')) cmd = cmd.slice(4).trim();

  if (cmd.endsWith('.ts') || cmd.endsWith('.js')) {
    const parts = cmd.split(/\s+/);
    return parts[0] || null;
  }

  if (pkgScripts[cmd]) {
    return extractSourceFile(pkgScripts[cmd], pkgScripts);
  }

  return null;
}

function parsePackageJson(): { scripts: Record<string, string> } | null {
  try {
    const raw = JSON.parse(
      require('fs').readFileSync(PACKAGE_JSON_PATH, 'utf-8'),
    ) as any;
    const scripts = raw.scripts as Record<string, string> | undefined;
    if (!scripts) return null;
    return { scripts };
  } catch {
    return null;
  }
}

function discoverCreatorFiles(): string[] {
  try {
    const files = readdirSync(SCRIPTS_DIR);
    return files
      .filter((f) => FILE_GLOB.test(f))
      .sort();
  } catch {
    return [];
  }
}

async function main() {
  console.log('creator-orphan-script: scanning scripts/ for orphan creator files…\n');

  const parsed = parsePackageJson();
  if (!parsed) {
    console.log('creator-orphan-script: FAIL — cannot parse package.json');
    process.exit(1);
  }

  const creatorFiles = discoverCreatorFiles();
  if (creatorFiles.length === 0) {
    console.log('creator-orphan-script: WARN — no creator-*.ts files found in scripts/');
    process.exit(0);
  }

  // Build a set of source files referenced by package.json creator:* entries
  const pkgsScripts = parsed.scripts;
  const referencedFiles = new Set<string>();

  for (const [name, command] of Object.entries(pkgsScripts)) {
    if (!name.startsWith(CREATOR_PREFIX)) continue;
    const sourceFile = extractSourceFile(command, pkgsScripts);
    if (sourceFile) {
      referencedFiles.add(sourceFile);
    }
  }

  // Cross-reference: files in scripts/ not in referencedFiles
  const orphans: string[] = [];
  const matched: string[] = [];

  for (const file of creatorFiles) {
    const path = `${SCRIPTS_DIR}/${file}`;
    if (referencedFiles.has(path)) {
      matched.push(file);
    } else {
      orphans.push(file);
    }
  }

  // Report
  for (const file of matched) {
    console.log(`  MATCH  ${SCRIPTS_DIR}/${file}`);
  }

  if (orphans.length > 0) {
    console.log('');
    for (const file of orphans) {
      console.log(`  ORPHAN  ${SCRIPTS_DIR}/${file}  (no package.json entry)`);
    }
  }

  const totalFiles = creatorFiles.length;
  const orphanCount = orphans.length;
  const matchedCount = matched.length;

  console.log(
    `\ncreator-orphan-script: ${matchedCount}/${totalFiles} files matched, ${orphanCount} orphans found`,
  );

  if (orphanCount > 0) {
    console.log('\nORPHAN FILES (no package.json creator:* entry):');
    for (const file of orphans) {
      console.log(`  - ${SCRIPTS_DIR}/${file}`);
    }
    console.log('');
    console.log(
      'To fix: add a package.json script entry pointing to the orphan file,',
    );
    console.log(
      'or delete the file if it is abandoned work.',
    );
    console.log(
      `\ncreator-orphan-script: FAIL — ${orphanCount} orphan(s) detected`,
    );
    process.exit(1);
  }

  console.log(
    `\ncreator-orphan-script: PASS no orphans — all ${totalFiles} creator-*.ts files have package.json entries`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error('creator-orphan-script: unexpected error', error);
  process.exit(1);
});
