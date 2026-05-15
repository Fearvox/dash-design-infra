#!/usr/bin/env bun
/**
 * Creator Regression Orchestrator
 *
 * Runs every surface check + mutation-check + capsule-check +
 * evolution-check + hackathon:score in one pass. Now 22 checks
 * including pre-flight gate chain.
 * Reports per-surface PASS/FAIL with timing.
 * Aggregate verdict: all surfaces must pass.
 */

const CHECKS: Array<{ name: string; command: string; args: string[] }> = [
  { name: 'creator:playwright-health-check', command: 'bun', args: ['run', 'creator:playwright-health-check'] },
  { name: 'creator:darwin-autonomy-check', command: 'bun', args: ['run', 'creator:darwin-autonomy-check'] },
  { name: 'creator:cron-slice-health', command: 'bun', args: ['run', 'creator:cron-slice-health'] },
  { name: 'creator:docs-surface-parity', command: 'bun', args: ['run', 'creator:docs-surface-parity'] },
  { name: 'creator:agent-context-health', command: 'bun', args: ['run', 'creator:agent-context-health'] },
  { name: 'creator:surface-health', command: 'bun', args: ['run', 'creator:surface-health'] },
  { name: 'creator:script-health', command: 'bun', args: ['run', 'creator:script-health'] },
  { name: 'creator:orphan-script', command: 'bun', args: ['run', 'creator:orphan-script'] },
  { name: 'creator:workflow-gate-health', command: 'bun', args: ['run', 'creator:workflow-gate-health'] },
  { name: 'creator:capsule-check', command: 'bun', args: ['run', 'creator:capsule-check'] },
  { name: 'creator:evolution-check', command: 'bun', args: ['run', 'creator:evolution-check'] },
  { name: 'creator:mutation-check', command: 'bun', args: ['run', 'creator:mutation-check'] },
  { name: 'creator:poster-check', command: 'bun', args: ['run', 'creator:poster-check'] },
  { name: 'creator:prompt-dna-check', command: 'bun', args: ['run', 'creator:prompt-dna-check'] },
  { name: 'creator:motion-storyboard-check', command: 'bun', args: ['run', 'creator:motion-storyboard-check'] },
  { name: 'creator:social-card-check', command: 'bun', args: ['run', 'creator:social-card-check'] },
  { name: 'creator:pdf-zine-check', command: 'bun', args: ['run', 'creator:pdf-zine-check'] },
  { name: 'creator:p5-sketch-check', command: 'bun', args: ['run', 'creator:p5-sketch-check'] },
  { name: 'creator:remotion-scene-check', command: 'bun', args: ['run', 'creator:remotion-scene-check'] },
  { name: 'creator:manim-scene-check', command: 'bun', args: ['run', 'creator:manim-scene-check'] },
  { name: 'creator:touchdesigner-tox-check', command: 'bun', args: ['run', 'creator:touchdesigner-tox-check'] },
  { name: 'creator:browser-demo-check', command: 'bun', args: ['run', 'creator:browser-demo-check'] },
  { name: 'creator:skill-package-check', command: 'bun', args: ['run', 'creator:skill-package-check'] },
  { name: 'hackathon:score', command: 'bun', args: ['scripts/hackathon-score.ts'] },
];

interface CheckResult {
  name: string;
  passed: boolean;
  durationMs: number;
  output: string;
}

async function runCheck(
  name: string,
  command: string,
  args: string[],
): Promise<CheckResult> {
  const start = performance.now();
  const proc = Bun.spawn([command, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    cwd: process.cwd(),
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  const durationMs = Math.round(performance.now() - start);

  const output = stdout.trim() || stderr.trim();
  const passed = exitCode === 0;

  return { name, passed, durationMs, output };
}

async function main() {
  console.log('creator-regression: starting full surface regression…\n');

  const results: CheckResult[] = [];
  const start = performance.now();

  for (const check of CHECKS) {
    const result = await runCheck(check.name, check.command, check.args);
    results.push(result);

    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`  ${status}\t${result.name}\t(${result.durationMs}ms)`);
    if (!result.passed && result.output) {
      console.log(`         \t${result.output.split('\n')[0]}`);
    }
  }

  const totalMs = Math.round(performance.now() - start);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const allPassed = failed === 0;

  console.log(`\ncreator-regression: ${passed}/${results.length} passed, ${failed} failed, ${totalMs}ms total`);

  if (!allPassed) {
    console.log('\nFAILED SURFACES:');
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  - ${r.name}`);
      if (r.output) console.log(`    ${r.output.split('\n')[0]}`);
    }
  }

  console.log(`\ncreator-regression: ${allPassed ? 'PASS all surfaces verified' : 'FAIL one or more surfaces failed'}`);
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('creator-regression: unexpected error', error);
  process.exit(1);
});
