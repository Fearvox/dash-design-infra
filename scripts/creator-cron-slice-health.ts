#!/usr/bin/env bun
/**
 * Creator Cron Slice Health Check
 *
 * Validates the most recent autonomous Darwin cron slice completed cleanly.
 * Queries GitHub API for recent merged Darwin PRs, verifies CI status,
 * merge evidence, and reports slice completion state.
 *
 * Slice: creator-cron-slice-health-route
 * Darwin axis: proof method
 *
 * Exit codes:
 *   0 — healthy: most recent Darwin slice merged cleanly with green CI
 *   1 — unhealthy: slice issues detected (CI failed, not merged, etc.)
 *   2 — no Darwin PRs found (first-run / idle state — informational)
 */

interface GhPr {
  number: number;
  title: string;
  headRefName: string;
  mergedAt: string | null;
  url: string;
  mergeCommit: { oid: string } | null;
}

interface CheckRun {
  name: string;
  conclusion: string | null;
  status: string;
}

interface Issue {
  severity: 'warn' | 'fail';
  detail: string;
}

const issues: Issue[] = [];

function addIssue(severity: 'warn' | 'fail', detail: string) {
  issues.push({ severity, detail });
}

async function runCommand(
  command: string,
  args: string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn([command, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    cwd: process.cwd(),
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  return { exitCode, stdout, stderr };
}

async function findMostRecentDarwinPr(): Promise<GhPr | null> {
  const { exitCode, stdout, stderr } = await runCommand('gh', [
    'pr', 'list',
    '--state', 'merged',
    '--search', 'darwin',
    '--limit', '30',
    '--json', 'number,title,mergedAt,headRefName,url,mergeCommit',
  ]);

  if (exitCode !== 0) {
    addIssue('fail', `gh pr list failed: ${stderr.trim() || 'unknown error'}`);
    return null;
  }

  let allPrs: GhPr[];
  try {
    allPrs = JSON.parse(stdout);
  } catch {
    addIssue('fail', 'could not parse gh pr list JSON output');
    return null;
  }

  // Filter to only merged PRs and sort by mergedAt descending
  const merged = allPrs
    .filter((p) => p.mergedAt !== null)
    .sort((a, b) => (b.mergedAt! > a.mergedAt! ? 1 : -1));

  if (merged.length === 0) {
    return null; // No Darwin PRs found
  }

  return merged[0];
}

async function getCiStatus(sha: string): Promise<{
  verdict: 'PASS' | 'FAIL' | 'PENDING' | 'UNKNOWN';
  checks: CheckRun[];
}> {
  const { exitCode, stdout } = await runCommand('gh', [
    'api',
    `repos/Fearvox/dash-design-infra/commits/${sha}/check-runs`,
    '--jq', '.check_runs | [.[] | {name, conclusion, status}]',
  ]);

  if (exitCode !== 0) {
    return { verdict: 'UNKNOWN', checks: [] };
  }

  let checks: CheckRun[];
  try {
    checks = JSON.parse(stdout.trim() || '[]');
  } catch {
    return { verdict: 'UNKNOWN', checks: [] };
  }

  if (checks.length === 0) {
    return { verdict: 'UNKNOWN', checks: [] };
  }

  const pending = checks.filter((c) => c.status !== 'completed');
  const failures = checks.filter(
    (c) => c.conclusion === 'failure' || c.conclusion === 'timed_out',
  );

  if (pending.length > 0) {
    return { verdict: 'PENDING', checks };
  }
  if (failures.length > 0) {
    return { verdict: 'FAIL', checks };
  }
  return { verdict: 'PASS', checks };
}

async function main() {
  console.log('creator-cron-slice-health: querying most recent Darwin slice…\n');

  const start = performance.now();

  // Step 1: Find most recent merged Darwin PR
  const pr = await findMostRecentDarwinPr();

  if (!pr) {
    const elapsed = Math.round(performance.now() - start);
    if (issues.length > 0) {
      console.log(`creator-cron-slice-health: FAIL could not query GitHub (${elapsed}ms)`);
      for (const issue of issues) {
        console.log(`  [${issue.severity}] ${issue.detail}`);
      }
      process.exit(1);
    }
    console.log(`creator-cron-slice-health: NO_DARWIN_PR no merged Darwin PRs found (${elapsed}ms)`);
    console.log('  This is expected for first-run / idle state.');
    console.log('  Next autonomous Darwin cron slice will create the first PR.');
    process.exit(2);
  }

  // Step 2: Check CI status on merge commit
  const sha = pr.mergeCommit?.oid;
  const ci = sha ? await getCiStatus(sha) : { verdict: 'UNKNOWN' as const, checks: [] };

  // Step 3: Report
  const elapsed = Math.round(performance.now() - start);

  console.log(`  Most Recent Darwin Slice: PR #${pr.number}`);
  console.log(`  Title:  ${pr.title}`);
  console.log(`  Branch: ${pr.headRefName}`);
  console.log(`  SHA:    ${sha ? sha.substring(0, 7) : 'unknown'}`);
  console.log(`  Merged: ${pr.mergedAt || 'NOT MERGED'}`);
  console.log(`  CI:     ${ci.verdict} (${ci.checks.length} checks)`);
  console.log(`  URL:    ${pr.url}`);

  // List failing / pending checks
  const failChecks = ci.checks.filter(
    (c) => c.conclusion === 'failure' || c.conclusion === 'timed_out',
  );
  const pendingChecks = ci.checks.filter((c) => c.status !== 'completed');

  if (failChecks.length > 0) {
    console.log(`\n  Failing checks:`);
    for (const c of failChecks) {
      console.log(`    ✗ ${c.name}: ${c.conclusion}`);
    }
  }
  if (pendingChecks.length > 0) {
    console.log(`\n  Pending checks:`);
    for (const c of pendingChecks) {
      console.log(`    … ${c.name}: ${c.status}`);
    }
  }

  // Step 4: Evaluate health
  if (!pr.mergedAt) {
    addIssue('fail', `PR #${pr.number} has no mergedAt — may not be merged`);
  }

  if (ci.verdict === 'FAIL') {
    addIssue('fail', `${failChecks.length} CI check(s) failed on merge commit`);
  }
  if (ci.verdict === 'PENDING') {
    addIssue('warn', `${pendingChecks.length} CI check(s) still pending on merge commit`);
  }
  if (ci.verdict === 'UNKNOWN') {
    addIssue('warn', 'No CI check data available for merge commit (may be normal for older PRs)');
  }

  const fails = issues.filter((i) => i.severity === 'fail').length;
  const warns = issues.filter((i) => i.severity === 'warn').length;

  if (fails > 0) {
    console.log(`\ncreator-cron-slice-health: FAIL ${fails} issue(s), ${warns} warning(s) (${elapsed}ms)`);
    for (const issue of issues) {
      console.log(`  [${issue.severity}] ${issue.detail}`);
    }
    process.exit(1);
  }

  if (warns > 0) {
    console.log(`\ncreator-cron-slice-health: WARN ${warns} warning(s) (${elapsed}ms)`);
    for (const issue of issues) {
      console.log(`  [${issue.severity}] ${issue.detail}`);
    }
    process.exit(0);
  }

  console.log(`\ncreator-cron-slice-health: PASS slice healthy, ${elapsed}ms`);
  process.exit(0);
}

main().catch((error) => {
  console.error('creator-cron-slice-health: unexpected error', error);
  process.exit(1);
});
