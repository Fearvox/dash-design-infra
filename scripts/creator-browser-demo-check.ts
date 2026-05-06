#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

type BrowserState = {
  id?: string;
  button_label?: string;
  headline?: string;
  mutation?: string;
  proof?: string;
};

type CreatorBrowserDemo = {
  route?: string;
  source_capsule?: string;
  surface?: string;
  job?: string;
  format?: { canvas?: string; selector?: string; deliverables?: string[] };
  preserved_capsule_fields?: string[];
  browser_adapter?: {
    demo_id?: string;
    runtime_boundary?: string;
    open_command?: string;
    optional_deploy_boundary?: string;
    style_tokens?: Record<string, string>;
  };
  interaction_contract?: {
    initial_state?: string;
    controls?: string[];
    states?: BrowserState[];
    blocked_moves?: string[];
  };
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};

type Ledger = { winner?: string; candidates?: Array<{ id?: string; selection?: string }>; retained_routes?: Array<{ id?: string; selection?: string }> };

const routeId = 'creator-browser-demo-route';
const jsonPath = 'examples/creator-browser-demo.json';
const htmlPath = 'examples/creator-browser-demo.html';
const workflowPath = 'usecases/creator/creator-browser-demo.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const packagePath = 'package.json';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const readmePath = 'README.md';
const examplesReadmePath = 'examples/README.md';
const ciPath = '.github/workflows/ci.yml';
const agentsPath = 'AGENTS.md';
const evolutionPath = 'docs/CREATOR_EVOLUTION_ENGINE.md';
const smokePath = '.artifacts/creator-browser-demo-smoke.json';
const qaPath = '.artifacts/creator-browser-demo-qa.md';

function fail(message: string): never {
  console.error(`creator-browser-demo-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

function parseJson<T>(path: string): T {
  try {
    return JSON.parse(read(path)) as T;
  } catch (error) {
    fail(`${path} invalid JSON: ${(error as Error).message}`);
  }
}

function useful(value: unknown, field: string, min = 16): string {
  if (typeof value !== 'string' || value.trim().length < min) fail(`${field} must be useful text`);
  return value;
}

function list(value: unknown, field: string, min = 3): string[] {
  if (!Array.isArray(value) || value.length < min) fail(`${field} needs ${min}+ items`);
  for (const item of value) useful(item, field, 4);
  return value as string[];
}

function routeSelection(ledger: Ledger, id: string): string | undefined {
  return ledger.candidates?.find((candidate) => candidate.id === id)?.selection ?? ledger.retained_routes?.find((route) => route.id === id)?.selection;
}

const ledger = parseJson<Ledger>(ledgerPath);
if (!['selected', 'retained'].includes(routeSelection(ledger, routeId) ?? '')) fail(`${ledgerPath} must keep ${routeId} selected or retained`);
if (ledger.winner !== routeId) fail(`${ledgerPath} winner must be ${routeId}`);

const packageJson = parseJson<{ scripts?: Record<string, string> }>(packagePath);
if (packageJson.scripts?.['creator:browser-demo-check'] !== 'bun scripts/creator-browser-demo-check.ts') fail(`${packagePath} must expose creator:browser-demo-check`);

const route = parseJson<CreatorBrowserDemo>(jsonPath);
if (route.route !== routeId) fail(`route must be ${routeId}`);
if (route.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator frontier capsule');
useful(route.surface, 'surface');
useful(route.job, 'job', 180);
if (route.format?.canvas !== '1684x1191') fail('format.canvas must be 1684x1191');
if (route.format?.selector !== '.page') fail('format.selector must be .page');
const deliverables = list(route.format?.deliverables, 'format.deliverables', 4);
for (const deliverable of [htmlPath, smokePath, qaPath, '/tmp/dash-creator-browser-demo.pdf']) {
  if (!deliverables.includes(deliverable)) fail(`format.deliverables must include ${deliverable}`);
}

const preserved = route.preserved_capsule_fields ?? [];
for (const field of ['creator', 'intent', 'memory', 'grammar', 'inputs.blocked', 'tool_path', 'proof', 'remix_rule']) {
  if (!preserved.includes(field)) fail(`preserved_capsule_fields must include ${field}`);
}

const adapter = route.browser_adapter ?? {};
if (useful(adapter.demo_id, 'browser_adapter.demo_id', 8) !== 'CreatorCapsuleBrowserDemo') fail('browser_adapter.demo_id must be CreatorCapsuleBrowserDemo');
const runtime = useful(adapter.runtime_boundary, 'browser_adapter.runtime_boundary', 210).toLowerCase();
for (const needle of ['self-contained', 'html', 'local javascript', 'no backend', 'no network', 'no external cdn', 'no analytics', 'no automatic deployment', 'external static host', 'rollback']) {
  if (!runtime.includes(needle)) fail(`browser_adapter.runtime_boundary must mention ${needle}`);
}
if (adapter.open_command !== 'open examples/creator-browser-demo.html') fail('browser_adapter.open_command must open the repo HTML file');
const deployBoundary = useful(adapter.optional_deploy_boundary, 'browser_adapter.optional_deploy_boundary', 170).toLowerCase();
for (const needle of ['external static', 'out of scope for ci', 'do not create vercel', 'hosting config', 'screenshots', 'rollback']) {
  if (!deployBoundary.includes(needle)) fail(`optional_deploy_boundary must mention ${needle}`);
}
const tokens = adapter.style_tokens ?? {};
for (const key of ['background', 'paper', 'signal', 'accent', 'line', 'ink']) {
  if (!/^#[0-9a-f]{6}$/i.test(tokens[key] ?? '')) fail(`browser_adapter.style_tokens.${key} must be a hex color`);
}

const contract = route.interaction_contract ?? {};
if (contract.initial_state !== 'capsule') fail('interaction_contract.initial_state must be capsule');
const controls = contract.controls ?? [];
const expectedControls = ['capsule', 'artifact', 'proof', 'remix'];
if (JSON.stringify(controls) !== JSON.stringify(expectedControls)) fail('interaction_contract.controls must be capsule/artifact/proof/remix in order');
const states = contract.states ?? [];
if (states.length !== expectedControls.length) fail('interaction_contract.states must include exactly four states');
const seenStates = new Set<string>();
for (let index = 0; index < states.length; index += 1) {
  const state = states[index]!;
  const id = useful(state.id, `interaction_contract.states[${index}].id`, 4);
  if (id !== expectedControls[index]) fail(`state ${index} must be ${expectedControls[index]}`);
  if (seenStates.has(id)) fail(`duplicate state id ${id}`);
  seenStates.add(id);
  useful(state.button_label, `interaction_contract.states[${index}].button_label`, 4);
  useful(state.headline, `interaction_contract.states[${index}].headline`, 28);
  useful(state.mutation, `interaction_contract.states[${index}].mutation`, 75);
  const proof = useful(state.proof, `interaction_contract.states[${index}].proof`, 60).toLowerCase();
  if (!proof.includes(index === 1 ? 'aria-pressed' : index === 2 ? 'browser visual qa' : index === 3 ? 'smoke summary' : 'network')) {
    fail(`state ${id} proof must name its interaction/proof risk`);
  }
}
const blockedMoves = list(contract.blocked_moves, 'interaction_contract.blocked_moves', 6).join(' ').toLowerCase();
for (const needle of ['static dashboard', 'backend', 'database', 'websocket', 'analytics', 'framework', 'auto-deploying', 'hosting config', 'private', 'raw', 'local absolute paths', 'api', 'cookies', 'tokens', 'secrets', 'browser measure', 'interaction smoke']) {
  if (!blockedMoves.includes(needle)) fail(`blocked_moves must cover ${needle}`);
}

const proofList = list(route.proof, 'proof', 9).join(' ');
for (const command of ['creator:browser-demo-check', 'measure:check', 'print:render', 'browser visual QA', 'browser interaction smoke', 'security:scan', 'hackathon:score', 'typecheck', 'docs:links']) {
  if (!proofList.includes(command)) fail(`proof must include ${command}`);
}
const publicAllowed = list(route.public_boundary?.allowed, 'public_boundary.allowed', 5).join(' ').toLowerCase();
for (const needle of ['synthetic', 'html', 'local javascript', '.artifacts', 'fixed-canvas']) {
  if (!publicAllowed.includes(needle)) fail(`public_boundary.allowed must cover ${needle}`);
}
const publicBlocked = list(route.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'account screenshots', 'local absolute paths', 'cookies', 'tokens', 'secrets', 'credentials', 'network calls', 'analytics', 'backend', 'websockets', 'cdns', 'deploys']) {
  if (!publicBlocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
}
useful(route.retention, 'retention', 220);

const html = read(htmlPath);
for (const needle of [
  'Creator Browser Demo Adapter',
  routeId,
  'SELF-CONTAINED HTML',
  'NOT A DASHBOARD',
  'browser interaction smoke',
  'data-active-step',
  'aria-pressed',
  'addEventListener',
  'proof before publish',
  '@page{size:1684px 1191px',
  'width:1684px;height:1191px',
]) {
  if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
}
for (const control of expectedControls) {
  if (!html.includes(`data-step="${control}"`)) fail(`${htmlPath} missing data-step ${control}`);
  if (!html.includes(`${control}:{headline:`)) fail(`${htmlPath} missing state copy for ${control}`);
}
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov', 'fetch(', 'WebSocket', 'EventSource', 'http://', 'https://', 'localStorage']) {
  if (html.includes(forbidden) || html.toLowerCase().includes(forbidden.toLowerCase())) fail(`${htmlPath} must not include ${forbidden}`);
}

const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'Browser demo adapter contract', 'QA checks', 'Public boundary', 'Remix rule', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}
for (const [path, needles] of [
  [workflowIndexPath, ['Creator browser demo', 'creator-browser-demo.html', 'creator:browser-demo-check', 'browser interaction smoke']],
  [readmePath, ['Creator Browser Demo', 'creator-browser-demo.html', 'creator:browser-demo-check']],
  [examplesReadmePath, ['Creator Browser Demo', 'creator-browser-demo.html', 'creator:browser-demo-check']],
  [ciPath, ['Creator Browser Demo Check', 'bun creator:browser-demo-check']],
  [agentsPath, ['Creator Browser Demo', 'creator:browser-demo-check', 'creator-browser-demo.html']],
  [evolutionPath, ['creator-browser-demo-route', 'creator-browser-demo.md']],
] as const) {
  const text = read(path);
  for (const needle of needles) if (!text.includes(needle)) fail(`${path} missing ${needle}`);
}

mkdirSync('.artifacts', { recursive: true });
writeFileSync(
  smokePath,
  `${JSON.stringify({ route: routeId, demo_id: adapter.demo_id, open_command: adapter.open_command, controls, initial_state: contract.initial_state, smoke: 'browser interaction smoke must click capsule, artifact, proof, and remix controls before any external host', live_network_attempted: false, automatic_deploy_attempted: false }, null, 2)}\n`,
);
writeFileSync(
  qaPath,
  `# Creator Browser Demo QA\n\nGenerated by \`bun creator:browser-demo-check\` from ${jsonPath}.\n\nThis is a public-safe smoke note, not a deploy log.\n\n## Browser interaction smoke\n\n- Open \`${htmlPath}\`.\n- Click: ${controls.map((control) => `\`${control}\``).join(', ')}.\n- Verify \`data-active-step\`, visible copy, and \`aria-pressed\` update for every control.\n\n## Boundary\n\n- No backend, external network call, analytics, screenshots, raw media, local absolute paths, cookies, tokens, secrets, or automatic public deploy.\n- Keep rollback notes before any later static host.\n`,
);
const smokeText = read(smokePath);
for (const needle of [routeId, 'browser interaction smoke', 'automatic_deploy_attempted']) {
  if (!smokeText.includes(needle)) fail(`${smokePath} missing ${needle}`);
}
const qaText = read(qaPath);
for (const needle of ['public-safe smoke note', 'Click:', 'No backend', 'rollback notes']) {
  if (!qaText.includes(needle)) fail(`${qaPath} missing ${needle}`);
}

console.log(`creator-browser-demo-check: PASS browser demo contract + ${states.length} states + generated ${smokePath}`);
