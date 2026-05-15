#!/usr/bin/env bun
/**
 * Creator Cache Integrity Check
 *
 * Cross-checks every cached measure-print entry's SHA-256 against current
 * file content — catching stale cache entries when surfaces are modified
 * but the cache wasn't invalidated.
 *
 * Slice: creator-cache-integrity-route
 * Darwin axis: proof method
 *
 * Exit codes:
 *   0 — all entries valid (cache is clean)
 *   1 — stale entries detected (one or more hashes don't match)
 *   2 — no cache directory (first-run, nothing to validate)
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CWD = process.cwd();
const CACHE_DIR = join(CWD, '.cache', 'measure-print');

interface CacheEntry {
  hash: string;
  source: string;
  canvas: string;
  measurePass: boolean;
  measureOutput: string;
  printPass: boolean;
  printOutput: string;
  timestamp: string;
}

function sha256(filePath: string): string {
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

function readCache(hashFile: string): CacheEntry | null {
  try {
    const raw = readFileSync(join(CACHE_DIR, hashFile), 'utf-8');
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

interface IntegrityResult {
  name: string;
  hash: string;
  source: string;
  status: 'valid' | 'stale' | 'orphan' | 'corrupt';
  detail: string;
}

function main() {
  console.log('creator-cache-integrity: SHA-256 cross-check of cached measure-print entries…\n');

  if (!existsSync(CACHE_DIR)) {
    console.log('  No cache directory at .cache/measure-print/');
    console.log('\ncreator-cache-integrity: IDLE (no cache to validate, first-run)');
    process.exit(2);
  }

  const hashFiles = readdirSync(CACHE_DIR).filter((f) => f.endsWith('.json'));
  if (hashFiles.length === 0) {
    console.log('  Empty cache directory — nothing to validate');
    console.log('\ncreator-cache-integrity: IDLE (empty cache)');
    process.exit(2);
  }

  const results: IntegrityResult[] = [];

  for (const hashFile of hashFiles) {
    const entry = readCache(hashFile);
    if (!entry) {
      results.push({
        name: hashFile.replace('.json', ''),
        hash: hashFile.replace('.json', ''),
        source: 'unknown',
        status: 'corrupt',
        detail: `Failed to parse cache entry: ${hashFile}`,
      });
      continue;
    }

    const sourcePath = join(CWD, entry.source);
    if (!existsSync(sourcePath)) {
      results.push({
        name: entry.source.replace('examples/creator-', '').replace('.html', ''),
        hash: entry.hash,
        source: entry.source,
        status: 'orphan',
        detail: `Source file missing: ${entry.source}`,
      });
      continue;
    }

    const currentHash = sha256(sourcePath);
    if (currentHash !== entry.hash) {
      results.push({
        name: entry.source.replace('examples/creator-', '').replace('.html', ''),
        hash: entry.hash,
        source: entry.source,
        status: 'stale',
        detail: `Hash mismatch — cached: ${entry.hash.slice(0, 12)}, current: ${currentHash.slice(0, 12)}`,
      });
    } else {
      results.push({
        name: entry.source.replace('examples/creator-', '').replace('.html', ''),
        hash: entry.hash,
        source: entry.source,
        status: 'valid',
        detail: `Hash match — ${currentHash.slice(0, 12)}`,
      });
    }
  }

  const validCount = results.filter((r) => r.status === 'valid').length;
  const staleCount = results.filter((r) => r.status === 'stale').length;
  const orphanCount = results.filter((r) => r.status === 'orphan').length;
  const corruptCount = results.filter((r) => r.status === 'corrupt').length;

  for (const r of results) {
    const icon = r.status === 'valid' ? '✓' : '✗';
    const name = r.name.padEnd(24);
    console.log(`  ${icon} ${name} ${r.status.toUpperCase().padEnd(8)} ${r.detail}`);
  }

  console.log(
    `\ncreator-cache-integrity: ${validCount} valid, ${staleCount} stale, ${orphanCount} orphan, ${corruptCount} corrupt — ${results.length} total`,
  );

  if (staleCount + orphanCount + corruptCount === 0) {
    console.log('\ncreator-cache-integrity: PASS all cache entries valid');
    process.exit(0);
  } else {
    console.log('\ncreator-cache-integrity: FAIL stale or invalid cache entries detected');
    if (staleCount > 0) {
      console.log('  Tip: re-run `bun creator:measure-print-cache --no-cache` to regenerate stale entries');
    }
    process.exit(1);
  }
}

main();
