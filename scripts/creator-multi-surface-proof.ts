#!/usr/bin/env bun
/**
 * Creator Multi-Surface Proof
 *
 * Validates every retained creator surface HTML artifact against
 * measure:check (Chromium overflow) + print:render (PDF output) in one pass.
 * Reports per-surface PASS/FAIL with timing and aggregate verdict.
 *
 * Slice: creator-multi-surface-proof-route
 * Darwin axis: proof method
 */

interface Surface {
  name: string;
  file: string;
  canvas: string; // WxH
}

const SURFACES: Surface[] = [
  { name: 'poster', file: 'examples/creator-poster-surface.html', canvas: '1684x1191' },
  { name: 'prompt-dna', file: 'examples/creator-prompt-dna-adapter.html', canvas: '1684x1191' },
  { name: 'motion-storyboard', file: 'examples/creator-motion-storyboard.html', canvas: '1684x1191' },
  { name: 'social-card', file: 'examples/creator-social-card.html', canvas: '1200x630' },
  { name: 'pdf-zine', file: 'examples/creator-pdf-zine.html', canvas: '1684x1191' },
  { name: 'p5-sketch', file: 'examples/creator-p5-sketch.html', canvas: '1684x1191' },
  { name: 'remotion-scene', file: 'examples/creator-remotion-scene.html', canvas: '1684x1191' },
  { name: 'manim-scene', file: 'examples/creator-manim-scene.html', canvas: '1684x1191' },
  { name: 'touchdesigner-tox', file: 'examples/creator-touchdesigner-tox.html', canvas: '1684x1191' },
  { name: 'browser-demo', file: 'examples/creator-browser-demo.html', canvas: '1684x1191' },
  { name: 'frontier-capsule', file: 'examples/creator-frontier-capsule.html', canvas: '1684x1191' },
];

interface ProofResult {
  name: string;
  measurePass: boolean;
  measureOutput: string;
  measureMs: number;
  printPass: boolean;
  printOutput: string;
  printMs: number;
}

async function runCommand(
  cmd: string,
  args: string[],
): Promise<{ passed: boolean; output: string; durationMs: number }> {
  const start = performance.now();
  const proc = Bun.spawn([cmd, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    cwd: process.cwd(),
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  const durationMs = Math.round(performance.now() - start);
  const output = (stdout + stderr).trim();
  return { passed: exitCode === 0, output, durationMs };
}

async function proofSurface(surface: Surface): Promise<ProofResult> {
  // Measure: check overflow against canvas
  const measureArgs = ['run', 'measure:check', '--', surface.file];
  if (surface.canvas !== '1684x1191') {
    measureArgs.push(`--canvas=${surface.canvas}`);
  }
  const measureResult = await runCommand('bun', measureArgs);

  // Print: render to PDF
  const printFile = `/tmp/dash-${surface.name}-proof.pdf`;
  const printArgs = [
    'run', 'print:render', '--', surface.file, printFile,
    `--canvas=${surface.canvas}`,
  ];
  const printResult = await runCommand('bun', printArgs);

  return {
    name: surface.name,
    measurePass: measureResult.passed,
    measureOutput: measureResult.output.slice(0, 200),
    measureMs: measureResult.durationMs,
    printPass: printResult.passed,
    printOutput: printResult.output.slice(0, 200),
    printMs: printResult.durationMs,
  };
}

async function main() {
  console.log('creator-multi-surface-proof: running measure + print on all retained surfaces…\n');

  const results: ProofResult[] = [];
  const start = performance.now();

  for (const surface of SURFACES) {
    const result = await proofSurface(surface);
    results.push(result);

    const measureStatus = result.measurePass ? 'PASS' : 'FAIL';
    const printStatus = result.printPass ? 'PASS' : 'FAIL';
    console.log(
      `  ${result.name.padEnd(20)} measure:${measureStatus} (${String(result.measureMs).padStart(4)}ms)  print:${printStatus} (${String(result.printMs).padStart(4)}ms)`,
    );

    if (!result.measurePass && result.measureOutput) {
      console.log(`    measure: ${result.measureOutput.split('\n')[0]}`);
    }
    if (!result.printPass && result.printOutput) {
      console.log(`    print:   ${result.printOutput.split('\n')[0]}`);
    }
  }

  const totalMs = Math.round(performance.now() - start);
  const measurePassed = results.filter((r) => r.measurePass).length;
  const printPassed = results.filter((r) => r.printPass).length;
  const totalSurfaces = results.length;
  const allPassed = measurePassed === totalSurfaces && printPassed === totalSurfaces;

  console.log(
    `\ncreator-multi-surface-proof: measure ${measurePassed}/${totalSurfaces} pass, print ${printPassed}/${totalSurfaces} pass, ${totalMs}ms total`,
  );

  if (!allPassed) {
    console.log('\nFAILED SURFACES:');
    for (const r of results) {
      if (!r.measurePass || !r.printPass) {
        const parts: string[] = [];
        if (!r.measurePass) parts.push('measure');
        if (!r.printPass) parts.push('print');
        console.log(`  - ${r.name}: ${parts.join(', ')}`);
      }
    }
  }

  console.log(
    `\ncreator-multi-surface-proof: ${allPassed ? 'PASS all surfaces verified' : 'FAIL one or more surfaces failed'}`,
  );
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('creator-multi-surface-proof: unexpected error', error);
  process.exit(1);
});
