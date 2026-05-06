#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

type NodeSpec = { id?: string; family?: string; purpose?: string };
type TouchDesignerRoute = {
  route?: string;
  source_capsule?: string;
  surface?: string;
  job?: string;
  format?: { canvas?: string; preview_canvas?: string; selector?: string; deliverables?: string[] };
  preserved_capsule_fields?: string[];
  touchdesigner_adapter?: {
    project_name?: string;
    runtime_boundary?: string;
    operator_contract?: string[];
    twozero_mcp_boundary?: { allowed?: string[]; blocked?: string[]; smoke_command?: string };
    style_tokens?: Record<string, string>;
  };
  network_contract?: { duration_seconds?: number; resolution?: string; nodes?: NodeSpec[]; remix_handles?: string[]; blocked_moves?: string[] };
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};
type Ledger = { winner?: string; candidates?: Array<{ id?: string; selection?: string }>; retained_routes?: Array<{ id?: string; selection?: string }> };

const routeId = 'creator-touchdesigner-tox-route';
const jsonPath = 'examples/creator-touchdesigner-tox.json';
const htmlPath = 'examples/creator-touchdesigner-tox.html';
const workflowPath = 'usecases/creator/creator-touchdesigner-tox.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const packagePath = 'package.json';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const readmePath = 'README.md';
const examplesReadmePath = 'examples/README.md';
const ciPath = '.github/workflows/ci.yml';
const agentsPath = 'AGENTS.md';
const evolutionPath = 'docs/CREATOR_EVOLUTION_ENGINE.md';
const topologyPath = '.artifacts/creator-touchdesigner-network.md';
const contractPath = '.artifacts/creator-touchdesigner-twozero-contract.json';

function fail(message: string): never { console.error(`creator-touchdesigner-tox-check: FAIL ${message}`); process.exit(1); }
function read(path: string): string { if (!existsSync(path)) fail(`missing ${path}`); return readFileSync(path, 'utf8'); }
function parseJson<T>(path: string): T { try { return JSON.parse(read(path)) as T; } catch (error) { fail(`${path} invalid JSON: ${(error as Error).message}`); } }
function useful(value: unknown, field: string, min = 16): string { if (typeof value !== 'string' || value.trim().length < min) fail(`${field} must be useful text`); return value; }
function list(value: unknown, field: string, min = 3): string[] { if (!Array.isArray(value) || value.length < min) fail(`${field} needs ${min}+ items`); for (const item of value) useful(item, field, 4); return value as string[]; }
function routeSelection(ledger: Ledger, id: string): string | undefined { return ledger.candidates?.find((candidate) => candidate.id === id)?.selection ?? ledger.retained_routes?.find((route) => route.id === id)?.selection; }

const ledger = parseJson<Ledger>(ledgerPath);
if (!['selected', 'retained'].includes(routeSelection(ledger, routeId) ?? '')) fail(`${ledgerPath} must keep ${routeId} selected or retained`);

const packageJson = parseJson<{ scripts?: Record<string, string> }>(packagePath);
if (packageJson.scripts?.['creator:touchdesigner-tox-check'] !== 'bun scripts/creator-touchdesigner-tox-check.ts') fail(`${packagePath} must expose creator:touchdesigner-tox-check`);

const route = parseJson<TouchDesignerRoute>(jsonPath);
if (route.route !== routeId) fail(`route must be ${routeId}`);
if (route.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator frontier capsule');
useful(route.surface, 'surface');
useful(route.job, 'job', 160);
if (route.format?.canvas !== '1920x1080') fail('format.canvas must be 1920x1080');
if (route.format?.preview_canvas !== '1684x1191') fail('format.preview_canvas must be 1684x1191');
if (route.format?.selector !== '.page') fail('format.selector must be .page');
const deliverables = list(route.format?.deliverables, 'format.deliverables', 4);
for (const deliverable of [htmlPath, topologyPath, contractPath, '/tmp/dash-creator-touchdesigner-tox.pdf']) {
  if (!deliverables.includes(deliverable)) fail(`format.deliverables must include ${deliverable}`);
}

const preserved = route.preserved_capsule_fields ?? [];
for (const field of ['creator', 'intent', 'memory', 'grammar', 'inputs.blocked', 'tool_path', 'proof', 'remix_rule']) {
  if (!preserved.includes(field)) fail(`preserved_capsule_fields must include ${field}`);
}

const adapter = route.touchdesigner_adapter ?? {};
if (!/^[A-Z][A-Za-z0-9_]*$/.test(useful(adapter.project_name, 'touchdesigner_adapter.project_name', 6))) fail('project_name must be PascalCase-like');
const runtime = useful(adapter.runtime_boundary, 'touchdesigner_adapter.runtime_boundary', 180).toLowerCase();
for (const needle of ['touchdesigner', 'twozero', 'external', 'does not open ports', '.tox', 'screenshots']) if (!runtime.includes(needle)) fail(`runtime_boundary must mention ${needle}`);
const operator = list(adapter.operator_contract, 'touchdesigner_adapter.operator_contract', 5).join(' ');
for (const node of ['noiseField_TOP', 'palette_COMP', 'pulse_CHOP', 'proof_TEXT', 'out1_TOP']) if (!operator.includes(node)) fail(`operator_contract must mention ${node}`);
const boundary = adapter.twozero_mcp_boundary ?? {};
if (boundary.smoke_command !== 'twozero status --expect-local-operator --no-capture') fail('twozero smoke command must be safe and non-capturing');
const allowed = list(boundary.allowed, 'twozero_mcp_boundary.allowed', 3).join(' ').toLowerCase();
for (const needle of ['operator', 'local', 'reviewed']) if (!allowed.includes(needle)) fail(`twozero allowed boundary must mention ${needle}`);
const mcpBlocked = list(boundary.blocked, 'twozero_mcp_boundary.blocked', 4).join(' ').toLowerCase();
for (const needle of ['port', 'unverified', 'screenshots', '.tox', 'paths', 'api', 'cookies', 'tokens', 'secrets']) if (!mcpBlocked.includes(needle)) fail(`twozero blocked boundary must cover ${needle}`);
const tokens = adapter.style_tokens ?? {};
for (const key of ['background', 'paper', 'accent', 'warning', 'line']) if (!/^#[0-9a-f]{6}$/i.test(tokens[key] ?? '')) fail(`style_tokens.${key} must be a hex color`);

const contract = route.network_contract ?? {};
if (contract.duration_seconds !== 20) fail('network_contract.duration_seconds must be 20');
if (contract.resolution !== '1920x1080') fail('network_contract.resolution must be 1920x1080');
const nodes = contract.nodes ?? [];
if (nodes.length !== 5) fail('network_contract.nodes must contain exactly 5 nodes');
const nodeIds = new Set<string>();
for (let index = 0; index < nodes.length; index += 1) {
  const node = nodes[index]!;
  const id = useful(node.id, `network_contract.nodes[${index}].id`, 5);
  if (!/^[A-Za-z0-9_]+_(TOP|CHOP|COMP)$/.test(id) && id !== 'proof_TEXT') fail(`node id ${id} must name a TD family suffix`);
  if (nodeIds.has(id)) fail(`duplicate node id ${id}`);
  nodeIds.add(id);
  useful(node.family, `network_contract.nodes[${index}].family`, 3);
  useful(node.purpose, `network_contract.nodes[${index}].purpose`, 50);
}
list(contract.remix_handles, 'network_contract.remix_handles', 6);
const blockedMoves = list(contract.blocked_moves, 'network_contract.blocked_moves', 5).join(' ').toLowerCase();
for (const needle of ['touchdesigner', 'twozero', 'core dependency', 'ports', '.tox', 'private', 'browser measure']) if (!blockedMoves.includes(needle)) fail(`blocked_moves must cover ${needle}`);

const proof = list(route.proof, 'proof', 7).join(' ');
for (const command of ['creator:touchdesigner-tox-check', 'measure:check', 'print:render', 'browser visual QA', 'security:scan', 'hackathon:score', 'typecheck']) if (!proof.includes(command)) fail(`proof must include ${command}`);
const publicBlocked = list(route.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'screenshots', 'tox', 'local', 'api', 'cookies', 'tokens', 'secrets', 'ports']) if (!publicBlocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
list(route.public_boundary?.allowed, 'public_boundary.allowed', 5);
useful(route.retention, 'retention', 180);

const html = read(htmlPath);
for (const needle of ['Creator TouchDesigner TOX Adapter', routeId, 'NO LIVE PORT IN CI', 'twozero MCP boundary', 'twozero status --expect-local-operator --no-capture', '@page{size:1684px 1191px', 'width:1684px;height:1191px', 'not a dashboard']) {
  if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
}
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) {
  if (html.toLowerCase().includes(forbidden)) fail(`${htmlPath} must not embed raw media via ${forbidden}`);
}

const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'TouchDesigner/twozero adapter contract', 'QA checks', 'Public boundary', 'Remix rule', '中文摘要']) if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
for (const [path, needles] of [
  [workflowIndexPath, ['Creator TouchDesigner TOX', 'creator-touchdesigner-tox.html', 'creator:touchdesigner-tox-check', 'twozero MCP']],
  [readmePath, ['Creator TouchDesigner TOX', 'creator-touchdesigner-tox.html', 'creator:touchdesigner-tox-check']],
  [examplesReadmePath, ['Creator TouchDesigner TOX', 'creator-touchdesigner-tox.html', 'creator:touchdesigner-tox-check']],
  [ciPath, ['Creator TouchDesigner TOX Check', 'bun creator:touchdesigner-tox-check']],
  [agentsPath, ['Creator TouchDesigner TOX', 'creator:touchdesigner-tox-check', 'creator-touchdesigner-tox.html']],
  [evolutionPath, ['creator-touchdesigner-tox-route', 'creator-touchdesigner-tox.md']],
] as const) {
  const text = read(path);
  for (const needle of needles) if (!text.includes(needle)) fail(`${path} missing ${needle}`);
}

mkdirSync('.artifacts', { recursive: true });
writeFileSync(topologyPath, `# Creator TouchDesigner Network Handoff\n\nGenerated by \`bun creator:touchdesigner-tox-check\` from ${jsonPath}.\n\nThis is a public-safe topology note, not a proprietary .tox export. Build it in an operator-owned local TouchDesigner workspace only after the operator starts TD.\n\n## Nodes\n\n${nodes.map((node) => `- \`${node.id}\` (${node.family}): ${node.purpose}`).join('\n')}\n\n## Safe smoke\n\n\`twozero status --expect-local-operator --no-capture\`\n\n## Boundary\n\n- No live port opened by CI.\n- No screenshots, raw media, .tox/.toe exports, local paths, cookies, tokens, secrets, or account UI in git.\n`);
writeFileSync(contractPath, `${JSON.stringify({ route: routeId, project_name: adapter.project_name, smoke_command: boundary.smoke_command, nodes: nodes.map((node) => node.id), generated: topologyPath, live_connection_attempted: false }, null, 2)}\n`);
const generated = read(topologyPath);
for (const needle of ['public-safe topology note', 'operator-owned local TouchDesigner', 'twozero status --expect-local-operator --no-capture', 'No live port opened by CI']) if (!generated.includes(needle)) fail(`${topologyPath} missing ${needle}`);

console.log(`creator-touchdesigner-tox-check: PASS TouchDesigner/twozero contract + ${nodes.length} nodes + generated ${topologyPath}`);
