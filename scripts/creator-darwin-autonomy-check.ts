#!/usr/bin/env bun
/**
 * Creator Darwin Autonomy Pre-Flight Check
 *
 * Validates the execution environment before an autonomous Darwin slice
 * begins: repo anchor, git cleanliness, MCP connectivity, and baseline
 * gates. Prevents recurring failure modes documented in hermes-gsd-evolution
 * pitfalls (wrong-repo anchor, dirty worktree, missing MCP).
 *
 * Slice: creator-darwin-autonomy-route
 * Darwin axis: proof method
 */

interface PreflightResult {
  name: string;
  passed: boolean;
  durationMs: number;
  output: string;
  fatal: boolean; // if true, a failure blocks execution
}

async function runCommand(
  command: string,
  args: string[],
  opts?: { env?: Record<string, string> },
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn([command, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    cwd: process.cwd(),
    env: opts?.env ? { ...process.env, ...opts.env } : process.env,
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  return { exitCode, stdout, stderr };
}

async function checkRepoAnchor(): Promise<PreflightResult> {
  const start = performance.now();
  const issues: string[] = [];

  // Check we're in a git repo
  const { exitCode, stdout } = await runCommand('git', [
    'rev-parse',
    '--show-toplevel',
  ]);
  if (exitCode !== 0) {
    const durationMs = Math.round(performance.now() - start);
    return {
      name: 'repo-anchor',
      passed: false,
      durationMs,
      output: 'not a git repository',
      fatal: true,
    };
  }
  const toplevel = stdout.trim();

  // Verify repo name
  if (!toplevel.endsWith('dash-design-infra')) {
    issues.push(`unexpected repo: ${toplevel}`);
  }

  // Verify remote origin
  const { stdout: remoteOut } = await runCommand('git', [
    'remote',
    'get-url',
    'origin',
  ]);
  const remote = remoteOut.trim();
  if (!remote.includes('github.com/Fearvox/dash-design-infra')) {
    issues.push(`unexpected remote: ${remote}`);
  }

  const durationMs = Math.round(performance.now() - start);
  return {
    name: 'repo-anchor',
    passed: issues.length === 0,
    durationMs,
    output:
      issues.length === 0
        ? `repo: ${toplevel}\n  remote: ${remote}`
        : issues.join('\n'),
    fatal: true,
  };
}

async function checkGitCleanliness(): Promise<PreflightResult> {
  const start = performance.now();
  const { exitCode, stdout } = await runCommand('git', [
    'status',
    '--short',
    '--branch',
  ]);
  const durationMs = Math.round(performance.now() - start);

  // git status exits 0 even with dirty files — check output
  const lines = stdout
    .trim()
    .split('\n')
    .filter((l) => l.trim() !== '');
  const statusLine = lines[0] || '';
  const hasChanges = lines.length > 1;

  // We pass even when dirty — we just report it. The cron job should BLOCKED
  // if there are unknown changes.
  let output = statusLine;
  if (hasChanges) {
    output += `\n  dirty: ${lines.length - 1} uncommitted changes (BLOCK if not self-created)`;
    // List changed files (public-safe — no secrets in filenames)
    const changed = lines.slice(1).map((l) => `    ${l.trim()}`);
    if (changed.length <= 15) {
      output += '\n' + changed.join('\n');
    } else {
      output +=
        '\n' + changed.slice(0, 10).join('\n') + `\n    ... and ${changed.length - 10} more`;
    }
  }

  // WARNING if dirty, but not fatal unless the caller decides
  return {
    name: 'git-cleanliness',
    passed: true, // informational — caller interprets dirty state
    durationMs,
    output,
    fatal: false,
  };
}

async function checkMcp(): Promise<PreflightResult> {
  const start = performance.now();

  // Try hermes MCP first
  const { exitCode, stdout, stderr } = await runCommand('hermes', [
    'mcp',
    'test',
    'research_vault',
  ]);

  const durationMs = Math.round(performance.now() - start);
  const output = (stdout + stderr).trim();

  if (exitCode === 0 && output.includes('Connected')) {
    return {
      name: 'mcp-connectivity',
      passed: true,
      durationMs,
      output: output.split('\n')[0] || 'research_vault connected',
      fatal: false,
    };
  }

  // MCP unavailable — non-fatal warning
  const reason = output
    ? output.split('\n')[0]
    : 'hermes MCP not available';
  return {
    name: 'mcp-connectivity',
    passed: false,
    durationMs,
    output: `WARN: ${reason}`,
    fatal: false,
  };
}

async function checkBaselineGates(): Promise<PreflightResult> {
  const start = performance.now();

  // Run mutation-check as the quickest baseline gate
  const { exitCode, stdout } = await runCommand('bun', [
    'run',
    'creator:mutation-check',
  ]);

  const durationMs = Math.round(performance.now() - start);
  const output = stdout.trim();

  return {
    name: 'baseline-gates',
    passed: exitCode === 0,
    durationMs,
    output: output
      ? output.split('\n')[0]
      : exitCode === 0
        ? 'creator:mutation-check PASS'
        : 'creator:mutation-check FAIL',
    fatal: false,
  };
}

async function main() {
  console.log(
    'creator-darwin-autonomy: pre-flight environment validation…\n',
  );

  const overallStart = performance.now();

  const checks: Array<() => Promise<PreflightResult>> = [
    checkRepoAnchor,
    checkGitCleanliness,
    checkMcp,
    checkBaselineGates,
  ];

  const results: PreflightResult[] = [];
  let blocked = false;

  for (const checkFn of checks) {
    const result = await checkFn();
    results.push(result);

    const status = result.passed ? 'PASS' : result.fatal ? 'FATAL' : 'WARN';
    console.log(
      `  ${status}\t${result.name}\t(${result.durationMs}ms)`,
    );
    if (!result.passed && result.output) {
      const indicator = result.fatal ? '  ! ' : '  ~ ';
      console.log(`         ${indicator}${result.output}`);
    }

    if (!result.passed && result.fatal) {
      blocked = true;
    }
  }

  const totalMs = Math.round(performance.now() - overallStart);
  const passed = results.filter((r) => r.passed).length;
  const warnings = results.filter((r) => !r.passed && !r.fatal).length;
  const fatals = results.filter((r) => !r.passed && r.fatal).length;

  console.log(
    `\ncreator-darwin-autonomy: ${passed}/${results.length} passed, ${warnings} warnings, ${fatals} fatals, ${totalMs}ms total`,
  );

  if (blocked) {
    console.log('\nBLOCKED: fatal pre-flight failures — cannot proceed');
    process.exit(1);
  }

  const verdict = warnings > 0 ? 'READY_WITH_WARNINGS' : 'READY';
  console.log(`\ncreator-darwin-autonomy: ${verdict}`);
  process.exit(0);
}

main().catch((error) => {
  console.error('creator-darwin-autonomy: unexpected error', error);
  process.exit(1);
});
