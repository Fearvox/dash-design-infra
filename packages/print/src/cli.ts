#!/usr/bin/env bun
/**
 * dash-print CLI — wrap renderToPDF for the shell.
 *
 * Usage:
 *   bun run src/cli.ts <input.html> <output.pdf>
 *   bun run src/cli.ts page.html out.pdf --format=A4 --wait=500
 *   bun run src/cli.ts page.html out.pdf --canvas=1684x1191
 */
import { renderToPDF, type RenderOptions } from './index.js';

interface Args {
  input: string;
  output: string;
  format?: RenderOptions['format'];
  waitMs?: number;
}

function parseArgs(argv: string[]): Args | { error: string } {
  const positional: string[] = [];
  let format: RenderOptions['format'] | undefined;
  let waitMs: number | undefined;

  for (const a of argv) {
    if (a.startsWith('--format=')) {
      const v = a.slice('--format='.length);
      if (v === 'A4' || v === 'Letter') format = v;
    } else if (a.startsWith('--canvas=')) {
      const match = /^(\d+)x(\d+)$/.exec(a.slice('--canvas='.length));
      if (!match) return { error: `Bad --canvas: ${a}. Expect WxH in px.` };
      format = { width: Number(match[1]), height: Number(match[2]) };
    } else if (a.startsWith('--wait=')) {
      waitMs = Number(a.slice('--wait='.length));
      if (!Number.isFinite(waitMs)) return { error: `Bad --wait: ${a}` };
    } else if (a.startsWith('--')) {
      return { error: `Unknown flag: ${a}` };
    } else {
      positional.push(a);
    }
  }

  if (positional.length !== 2) {
    return { error: 'Usage: dash-print <input.html> <output.pdf> [--format=A4|Letter|--canvas=WxH] [--wait=ms]' };
  }

  const result: Args = { input: positional[0]!, output: positional[1]! };
  if (format !== undefined) result.format = format;
  if (waitMs !== undefined) result.waitMs = waitMs;
  return result;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if ('error' in parsed) {
    console.error(parsed.error);
    process.exit(2);
  }

  console.log(`[dash-print] rendering ${parsed.input} → ${parsed.output}`);
  const t0 = performance.now();
  const opts: RenderOptions = { input: parsed.input, output: parsed.output };
  if (parsed.format !== undefined) opts.format = parsed.format;
  if (parsed.waitMs !== undefined) opts.waitMs = parsed.waitMs;
  const res = await renderToPDF(opts);
  const dt = Math.round(performance.now() - t0);

  if (!res.ok) {
    console.error(`[dash-print] FAILED (${dt}ms): ${res.message}`);
    process.exit(1);
  }

  console.log(`[dash-print] ok — ${res.pageCount} page(s) in ${dt}ms → ${res.output}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
