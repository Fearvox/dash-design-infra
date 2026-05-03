/**
 * Agent CLI detection and spawning.
 *
 * Detects coding-agent CLIs on PATH (Claude Code, Codex, Hermes, Gemini CLI,
 * OpenCode, Cursor Agent, Copilot CLI, Qwen, Kimi, Pi) and provides a unified
 * spawn interface for chat/design sessions.
 *
 * This is a Bun-native rewrite of the open-design PATH scanner pattern.
 */

import { spawn, type Subprocess } from 'bun';
import { existsSync } from 'node:fs';

// ── Agent Definition ──────────────────────────────────────

export interface AgentDef {
  name: string;
  bin: string;
  /** Command-line args that start a chat/agent session */
  chatArgs: string[];
  /** Args that produce structured (JSON/JSONL) output */
  jsonHeader: string[];
  installed: boolean;
  version: string | null;
}

export interface AgentSpawnOpts {
  agentName: string;
  prompt: string;
  cwd?: string;
  timeoutMs?: number;
}

// ── Detection ─────────────────────────────────────────────

const AGENT_TABLE: Array<{
  name: string;
  bin: string;
  chatArgs: string[];
  jsonHeader: string[];
}> = [
  { name: 'Claude Code',  bin: 'claude',   chatArgs: ['-p'],          jsonHeader: ['-p', '--output-format', 'stream-json'] },
  { name: 'Codex',        bin: 'codex',    chatArgs: ['exec'],        jsonHeader: ['exec', '--json'] },
  { name: 'Hermes',       bin: 'hermes',   chatArgs: ['ask'],         jsonHeader: ['ask', '--json'] },
  { name: 'Gemini CLI',   bin: 'gemini',   chatArgs: ['-p'],          jsonHeader: ['-p', '--output-format', 'json'] },
  { name: 'OpenCode',     bin: 'opencode', chatArgs: ['run'],         jsonHeader: ['run', '--json'] },
  { name: 'Cursor Agent', bin: 'cursor-agent', chatArgs: ['-p'],      jsonHeader: ['-p', '--json'] },
  { name: 'Copilot CLI',  bin: 'gh-copilot',   chatArgs: ['suggest'], jsonHeader: ['suggest', '--json'] },
  { name: 'Qwen',         bin: 'qwen',     chatArgs: ['run'],         jsonHeader: ['run', '--json'] },
  { name: 'Kimi',         bin: 'kimi',     chatArgs: ['chat'],        jsonHeader: ['chat', '--json'] },
  { name: 'Pi',           bin: 'pi',       chatArgs: ['ask'],         jsonHeader: ['ask', '--json'] },
];

/** Check if a command exists on PATH */
function commandExists(cmd: string): boolean {
  const paths = (process.env.PATH ?? '').split(':');
  for (const dir of paths) {
    if (existsSync(`${dir}/${cmd}`)) return true;
  }
  return false;
}

/** Get version string for a CLI tool */
function getVersion(bin: string): string | null {
  try {
    const proc = Bun.spawnSync([bin, '--version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    return proc.stdout.toString().trim().split('\n')[0] || null;
  } catch {
    return null;
  }
}

export function detectAgents(): AgentDef[] {
  return AGENT_TABLE.map((def) => ({
    ...def,
    installed: commandExists(def.bin),
    version: commandExists(def.bin) ? getVersion(def.bin) : null,
  }));
}

export function getAgent(name: string): AgentDef | undefined {
  const def = AGENT_TABLE.find((a) => a.name === name);
  if (!def) return undefined;
  return {
    ...def,
    installed: commandExists(def.bin),
    version: commandExists(def.bin) ? getVersion(def.bin) : null,
  };
}

// ── Spawning ──────────────────────────────────────────────

export function spawnAgent(opts: AgentSpawnOpts): Subprocess<'pipe', 'pipe', 'pipe'> {
  const def = AGENT_TABLE.find((a) => a.name === opts.agentName);
  if (!def) throw new Error(`Unknown agent: ${opts.agentName}`);
  if (!commandExists(def.bin)) throw new Error(`Agent not installed: ${def.bin}`);

  const proc = spawn({
    cmd: [def.bin, ...def.chatArgs, opts.prompt],
    cwd: opts.cwd ?? process.cwd(),
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
  });

  if (opts.timeoutMs) {
    setTimeout(() => {
      if (proc.exitCode === null) proc.kill();
    }, opts.timeoutMs);
  }

  return proc;
}

/**
 * Spawn an agent and collect full output (not streaming).
 * Returns stdout as string.
 */
export async function runAgent(opts: AgentSpawnOpts): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = spawnAgent(opts);
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}
