#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

type StoryFrame = { frame?: string; time?: string; composition?: string; motion?: string };
type Storyboard = { route?: string; timeline?: StoryFrame[]; public_boundary?: { blocked?: string[] }; proof?: string[] };
const sourcePath = 'examples/creator-motion-storyboard.json';
const artifactPath = '.artifacts/creator-motion-contact-sheet.html';
const workflowPath = 'usecases/creator/creator-contact-sheet-qa.md';
const gitignorePath = '.gitignore';
function fail(message: string): never { console.error(`creator-contact-sheet-check: FAIL ${message}`); process.exit(1); }
function read(path: string): string { if (!existsSync(path)) fail(`missing ${path}`); return readFileSync(path, 'utf8'); }
function esc(value: unknown): string { return String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }
const board = JSON.parse(read(sourcePath)) as Storyboard;
if (board.route !== 'creator-motion-storyboard-route') fail('source storyboard must be creator-motion-storyboard-route');
const frames = board.timeline ?? [];
if (frames.length !== 6) fail('source storyboard must provide exactly 6 frames');
for (const [i, frame] of frames.entries()) {
  for (const key of ['frame','time','composition','motion'] as const) if (typeof frame[key] !== 'string' || frame[key]!.trim().length < 5) fail(`frame ${i} missing ${key}`);
}
const blocked = (board.public_boundary?.blocked ?? []).join(' ').toLowerCase();
for (const needle of ['raw', 'generated', 'private', 'local', 'api', 'cookies', 'client']) if (!blocked.includes(needle)) fail(`public boundary must block ${needle}`);
if (!read(gitignorePath).split(/\r?\n/).includes('.artifacts')) fail('.artifacts must stay ignored');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Creator Motion Contact Sheet QA</title><style>@page{size:1684px 1191px;margin:0}*{box-sizing:border-box}body{margin:0;background:#efe5d3;color:#15120e;font-family:ui-sans-serif,system-ui}.page{width:1684px;height:1191px;padding:52px;background:linear-gradient(90deg,rgba(21,18,14,.055) 1px,transparent 1px),linear-gradient(rgba(21,18,14,.045) 1px,transparent 1px),#efe5d3;background-size:52px 52px}.shell{height:100%;border:1px solid rgba(21,18,14,.2);padding:38px;display:grid;grid-template-rows:82px 1fr 44px;gap:24px;background:rgba(255,249,237,.74)}.top,.foot{display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:.12em;font-size:13px;color:#625a50}.top b{color:#184fd6}.grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:18px;min-height:0}.card{border:1px solid rgba(21,18,14,.2);background:#fff9ed;border-radius:10px;padding:20px;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden}.num{display:flex;justify-content:space-between;color:#184fd6;font-weight:900;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.frame{display:grid;place-items:center;margin:16px 0;background:#15120e;color:#f8ecd5;min-height:185px;border-radius:8px;font-family:ui-serif,Georgia,serif;font-size:42px}.card h2{font-family:ui-serif,Georgia,serif;font-size:30px;line-height:1;margin:0 0 10px}.card p{margin:0;color:#51493f;font-size:14px;line-height:1.32}.proof{color:#2f6b50;font-weight:900}</style></head><body><main class="page"><section class="shell"><header class="top"><b>CREATOR CONTACT-SHEET QA</b><span>ignored artifact · no raw generated media in git</span><span>${frames.length} frames</span></header><section class="grid">${frames.map((f,i)=>`<article class="card"><div class="num"><span>${String(i).padStart(2,'0')}</span><span>${esc(f.time)}</span></div><div class="frame">${esc(f.frame)}</div><div><h2>${esc(String(f.frame).replace(/^\d+ \/ /,''))}</h2><p>${esc(f.motion)}</p></div></article>`).join('')}</section><footer class="foot"><span>source: ${sourcePath}</span><span class="proof">artifact path: ${artifactPath}</span></footer></section></main></body></html>`;
mkdirSync('.artifacts', { recursive: true });
writeFileSync(artifactPath, html);
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) if (html.toLowerCase().includes(forbidden)) fail(`generated contact sheet must not embed raw media via ${forbidden}`);
const workflow = read(workflowPath);
for (const needle of ['Contact-sheet QA gate','Ignored artifact','Public boundary','Verification','中文摘要']) if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
console.log(`creator-contact-sheet-check: PASS wrote ${artifactPath} from ${frames.length} public-safe frames`);
