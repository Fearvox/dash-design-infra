#!/usr/bin/env bun
/**
 * Creator Script Health Check
 *
 * Reads package.json scripts, filters for creator:* entries,
 * verifies each referenced source file exists, and reports
 * PASS/FAIL per entry. Catches stale script entries pointing
 * to deleted or renamed files before they cause silent failures
 * in autonomous Darwin runs.
 *
 * Handles:
 * - Direct script paths: "bun scripts/creator-foo.ts"
 * - Through-run paths: "bun run creator:foo"
 * - Scripts with additional arguments
 *
 * Slice: creator-script-health-route
 * Darwin axis: proof method (script source file validation)
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PACKAGE_JSON_PATH = 'package.json';
const CREATOR_PREFIX = 'creator:';

interface ScriptEntry {
  name: string;
  command: string;
}

interface ScriptResult {
  name: string;
  sourceFile: string | null;
  exists: boolean;
  detail: string;
}

/**
 * Extract source file path from a bun script command.
 * Handles: "bun scripts/foo.ts", "bun run scripts/foo.ts",
 * "bun run creator:foo" (indirect — resolved via package.json scripts).
 */
function extractSourceFile(command: string, pkgScripts: Record<string, string>): string | null {
  let cmd = command.trim();

  // Strip "bun " prefix
  if (!cmd.startsWith('bun ')) return null;
  cmd = cmd.slice(4).trim();

  // Strip "run " prefix
  if (cmd.startsWith('run ')) cmd = cmd.slice(4).trim();

  // If it's a direct file path (scripts/foo.ts or packages/foo/...)
  if (cmd.endsWith('.ts') || cmd.endsWith('.js')) {
    // Strip any remaining args after the path
    const parts = cmd.split(/\s+/);
    return parts[0] || null;
  }

  // If it references another package.json script (e.g., "creator:foo")
  // resolve it recursively (one level deep to avoid infinite loops)
  if (pkgScripts[cmd]) {
    return extractSourceFile(pkgScripts[cmd], pkgScripts);
  }

  return null;
}

function parsePackageJson(): { scripts: ScriptEntry[]; raw: Record<string, string> } | null {
  try {
    const raw = JSON.parse(
      require('fs').readFileSync(PACKAGE_JSON_PATH, 'utf-8')
    ) as any;

    const scriptEntries = raw.scripts as Record<string, string> | undefined;
    if (!scriptEntries) return null;

    const scripts: ScriptEntry[] = [];
    for (const [name, command] of Object.entries(scriptEntries)) {
      if (name.startsWith(CREATOR_PREFIX)) {
        scripts.push({ name, command });
      }
    }

    return { scripts, raw: scriptEntries };
  } catch {
    return null;
  }
}

async function main() {
  console.log('creator-script-health: scanning package.json scripts…\n');

  const parsed = parsePackageJson();
  if (!parsed) {
    console.log('creator-script-health: FAIL — cannot parse package.json scripts');
    process.exit(1);
  }

  const { scripts, raw } = parsed;

  if (scripts.length === 0) {
    console.log('creator-script-health: WARN — no creator:* scripts found in package.json');
    process.exit(0);
  }

  const results: ScriptResult[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let unresolvableCount = 0;

  for (const { name, command } of scripts) {
    const sourceFile = extractSourceFile(command, raw);

    if (!sourceFile) {
      unresolvableCount++;
      results.push({
        name,
        sourceFile: null,
        exists: false,
        detail: `cannot resolve source file from command: ${command}`,
      });
      console.log(`  MISS  ${name}  (unresolvable command: ${command})`);
      continue;
    }

    const resolved = resolve(sourceFile);
    const fileExists = existsSync(resolved);

    if (fileExists) {
      passedCount++;
      results.push({ name, sourceFile, exists: true, detail: 'source file exists' });
      console.log(`  PASS  ${name}  → ${sourceFile}`);
    } else {
      failedCount++;
      results.push({
        name,
        sourceFile,
        exists: false,
        detail: `source file not found: ${sourceFile}`,
      });
      console.log(`  FAIL  ${name}  → ${sourceFile} (file not found)`);
    }
  }

  const total = scripts.length;

  console.log(
    `\ncreator-script-health: ${passedCount}/${total} passed, ${failedCount} failed, ${unresolvableCount} unresolvable`,
  );

  if (failedCount > 0) {
    console.log('\nFAILED SCRIPTS:');
    for (const r of results.filter((r) => !r.exists)) {
      console.log(`  - ${r.name}: ${r.detail}`);
    }
  }

  if (unresolvableCount > 0) {
    console.log('\nUNRESOLVABLE SCRIPTS:');
    for (const r of results.filter((r) => r.sourceFile === null)) {
      console.log(`  - ${r.name}: ${r.detail}`);
    }
  }

  const allPassed = failedCount === 0 && unresolvableCount === 0;
  console.log(
    `\ncreator-script-health: ${allPassed ? 'PASS all scripts healthy' : 'FAIL one or more scripts unhealthy'}`,
  );
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('creator-script-health: unexpected error', error);
  process.exit(1);
});
