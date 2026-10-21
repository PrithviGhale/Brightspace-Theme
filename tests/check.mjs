import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import { root } from '../tools/preview-server.mjs';
const dir = path.join(root, 'extension');
const read = file => readFile(path.join(dir, file), 'utf8');
const manifest = JSON.parse(await read('manifest.json'));
assert.equal(manifest.homepage_url,'https://github.com/PrithviGhale/Brightspace-Theme');
const popupHtml = await read('popup.html');
assert.match(popupHtml, /id="check-updates" href="https:\/\/github\.com\/PrithviGhale\/Brightspace-Theme\/releases\/latest" target="_blank" rel="noopener noreferrer"/);
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.action.default_icon,manifest.icons);
for(const size of [16,32,48,128]) {
  const icon=await readFile(path.join(dir,manifest.icons[size]));
  assert.equal(icon.subarray(1,4).toString(),'PNG');
  assert.equal(icon.readUInt32BE(16),size);assert.equal(icon.readUInt32BE(20),size);
}
assert.match(popupHtml,/class="mark" src="icons\/icon-128.png"/);
assert.deepEqual(manifest.permissions, ['storage']);
assert.equal(manifest.background, undefined);
assert.equal(manifest.host_permissions, undefined);
assert.equal(manifest.web_accessible_resources, undefined);
assert.equal(manifest.content_scripts.length, 2);
const content = manifest.content_scripts[0];
assert.deepEqual(content.matches, ['https://learn.snhu.edu/*']);
assert.equal(content.all_frames, true);
assert.equal(content.match_origin_as_fallback, true);
assert.equal(content.run_at, 'document_start');
for (const file of [...content.js, manifest.action.default_popup]) await stat(path.join(dir, file));
const widgets = manifest.content_scripts[1];
assert.deepEqual(widgets.matches, ['https://d1i6rhttasws5m.cloudfront.net/production/*','https://d1zg7b99iisfa6.cloudfront.net/production/*']);
assert.equal(widgets.all_frames,true);
assert.equal(widgets.js[0],'widget-context.js');
for(const file of widgets.js) await stat(path.join(dir,file));
for(const [nested,ancestors,allowed] of [
  [false,[],false], [true,['https://outside.invalid'],false],
  [true,['https://learn.snhu.edu'],true],
  [true,['https://learn.snhu.edu','https://outside.invalid'],false],
  [true,['https://learn.snhu.edu','https://learn.snhu.edu'],true]
]) {
  const win={};win.top=nested?{}:win;
  const ctx=vm.createContext({window:win,location:{ancestorOrigins:ancestors}});
  vm.runInContext(await read('widget-context.js'),ctx);
  assert.equal(ctx.BrightWidgetAllowed,allowed);
}
const blocked=vm.createContext({BrightWidgetAllowed:false});
vm.runInContext(await read('content.js'),blocked); // Must exit before any engine, DOM or storage access.
for (const file of await readdir(dir)) if (file.endsWith('.js')) {
  const source = await read(file);
  new vm.Script(source, { filename: file });
  assert(!/\b(fetch|XMLHttpRequest|WebSocket|eval|setInterval)\s*\(/.test(source), `${file}: unexpected network, eval or polling API`);
}
const listeners = new Set();
let stored = {};
const chrome = { storage: { local: {
  async get(defaults) { return { ...defaults, ...stored }; },
  async set(patch) { const old = stored; stored = {...stored, ...patch}; const changes = {}; for (const key of Object.keys(patch)) changes[key] = { oldValue: old[key], newValue: patch[key] }; for (const fn of listeners) fn(changes, 'local'); }
}, onChanged: {addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn)} } };
const context = vm.createContext({chrome});
vm.runInContext(await read('preferences.js'), context);
const p = context.BrightPreferences;
const plain = x => JSON.parse(JSON.stringify(x));
assert.deepEqual(plain(await p.read()), {enabled:true, theme:'dark'});
assert.deepEqual(plain(p.normalize({enabled:'yes',theme:'unknown',grade:'ignored'})), {enabled:true, theme:'dark'});
assert.equal(p.effective({enabled:false,theme:'warm'}), 'original');
assert.equal(p.effective({enabled:true,theme:'original'}), 'original');
let patch;
const unsub = p.subscribe(value => patch = value);
await p.write({theme:'warm', grade:'never persisted'});
assert.deepEqual(stored, {theme:'warm'});
assert.deepEqual(plain(patch), {theme:'warm'});
await Promise.all([p.write({enabled:false}), p.write({theme:'dim'})]);
assert.deepEqual(stored, {theme:'dim',enabled:false});
assert.equal((await p.read()).theme, 'dim');
for (const fn of listeners) fn({theme:{newValue:'dark'}}, 'sync');
assert.equal(patch.theme, 'dim');
for (const fn of listeners) fn({theme:{}}, 'local');
assert.equal(patch.theme, 'dark');
unsub(); assert.equal(listeners.size, 0);
// A newer event must win over an in-flight initial read.
let resolveRead;
let subscriber;
const applied = [];
const race = vm.createContext({ document: {}, BrightTheme: {create: () => ({apply: value => applied.push(value)})}, BrightPreferences: {
  DEFAULTS: p.DEFAULTS, normalize: p.normalize, effective: p.effective,
  subscribe: fn => subscriber = fn, read: () => new Promise(resolve => resolveRead = resolve)
} });
vm.runInContext(await read('content.js'), race);
subscriber({theme:'warm'}); resolveRead({theme:'dark',enabled:true});
await new Promise(resolve => setImmediate(resolve));
assert.deepEqual(applied, ['warm','warm']);
// A partial event must not discard the other key returned by the initial read.
vm.runInContext(await read('content.js'), race);
subscriber({enabled:true}); resolveRead({theme:'dim',enabled:false});
await new Promise(resolve => setImmediate(resolve));
assert.equal(applied.at(-1),'dim');
vm.runInContext(await read('theme-engine.js'), context);
function luminance(hex) { const c = hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4); return .2126*c[0]+.7152*c[1]+.0722*c[2]; }
function contrast(a,b) { const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
for (const [name, palette] of Object.entries(context.BrightTheme.palettes)) {
  for (const bg of ['bg','surface','raised']) for (const fg of ['text','muted','link','danger','success']) assert(contrast(palette[bg],palette[fg])>=4.5, `${name}: ${fg}/${bg} contrast`);
  assert(contrast(palette.focus,palette.surface)>=3, `${name}: focus contrast`);
  // Only navigation branding may gain a contour; photos/course media stay untouched.
  for (const shadow of [false,true]) {
    const css=context.BrightTheme.css(name,shadow);
    const filterRules=[...css.matchAll(/([^{}]+)\{[^{}]*\bfilter\s*:[^{}]*\}/g)];
    assert.equal(filterRules.length,shadow?2:1);
    for(const rule of filterRules){assert(rule[1].includes('d2l-navigation-s-logo'));assert(rule[0].includes('filter: var(--bs-logo-contour)'));}
  }
}
assert.equal(context.BrightTheme.css('original'), '');
console.log('PASS: manifest scope/assets; JavaScript syntax/privacy checks; preference defaults, validation, writes, events and read race; palette text/link/status contrast ≥4.5:1; focus contrast ≥3:1.');
