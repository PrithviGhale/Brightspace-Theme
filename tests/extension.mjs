// Installs the actual unpacked extension into an isolated Chrome test profile.
// CDP fulfills fake learn.snhu.edu documents locally; no SNHU request is sent.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root} from '../tools/preview-server.mjs';
const profile=await mkdtemp(path.join(root,'dist','chrome-test-'));
let browser;
let closingBrowser=false;
const sockets=[];
const deadline=setTimeout(()=>{browser?.kill();process.exit(1);},60000);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(url) {
  const socket=new WebSocket(url); sockets.push(socket);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=()=>reject(new Error(`Unable to connect to isolated Chrome debugger: ${url}`));});
  const waiting=new Map(); let id=0; const handlers=new Map();
  socket.onmessage=event=>{const msg=JSON.parse(event.data); if(msg.id){const task=waiting.get(msg.id); if(!task)return;waiting.delete(msg.id);clearTimeout(task.timer);msg.error?task.reject(new Error(JSON.stringify(msg.error))):task.resolve(msg.result);}else handlers.get(msg.method)?.(msg.params);};
  socket.onclose=()=>{for(const task of waiting.values()){clearTimeout(task.timer);task.reject(new Error('Browser connection closed'));}waiting.clear();};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;const timer=setTimeout(()=>reject(new Error(`CDP timeout ${method}`)),10000);waiting.set(next,{resolve,reject,timer});socket.send(JSON.stringify({id:next,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const until=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(30);}throw new Error(`Timeout: ${expression}`);};
  return {send,evaluate,until,on:(event,fn)=>handlers.set(event,fn)};
}
async function launch() {
  closingBrowser=false;
  browser=spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--enable-unsafe-extension-debugging','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let data,version;
  for(let i=0;i<100;i++){try{data=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/);const response=await fetch(`http://127.0.0.1:${data[0]}/json/version`);if(response.ok){version=await response.json();if(version.webSocketDebuggerUrl)break;}}catch{}await pause(100);}
  assert(version?.webSocketDebuggerUrl,'isolated Chrome debugger started');
  const base=`http://127.0.0.1:${data[0]}`;
  // Restart can leave an old browser GUID in DevToolsActivePort briefly. Use
  // the live server's advertised endpoint rather than that stale second line.
  const control=await connect(version.webSocketDebuggerUrl);
  async function page(url='about:blank') {
    const {targetId}=await control.send('Target.createTarget',{url});
    const targets=await(await fetch(`${base}/json`)).json();
    return connect(targets.find(t=>t.id===targetId).webSocketDebuggerUrl);
  }
  return {control,page};
}
const widgetHosts=['d1i6rhttasws5m.cloudfront.net','d1zg7b99iisfa6.cloudfront.net'];
const widgetFrames=widgetHosts.map(host=>`<iframe class="external-widget" src="https://${host}/production/index.html"></iframe>`).join('');
const html=`<!doctype html><html><head><title>Local intercepted fixture</title><style>body{background:white;color:black}</style></head><body><main><h1>Fictional course</h1><a href="#">Course link</a><input placeholder="Sample"><unregistered-first></unregistered-first><demo-card></demo-card><d2l-card>Course title</d2l-card><iframe src="https://learn.snhu.edu/local-frame"></iframe><iframe srcdoc="<p>Inherited-origin frame</p>"></iframe>${widgetFrames}</main><script>window.widgetReports={};addEventListener('message',e=>{if(e.data?.fixtureReport)window.widgetReports[e.data.host]=e.data.fixtureReport;});customElements.define('demo-card',class extends HTMLElement{connectedCallback(){if(!this.shadowRoot)this.attachShadow({mode:'open'}).innerHTML='<section>Open root</section>'}});customElements.define('d2l-card',class extends HTMLElement{connectedCallback(){if(!this.shadowRoot)this.attachShadow({mode:'open'}).innerHTML='<style>:host{display:block;background:white}</style><slot></slot>'}})</script></body></html>`;
const widgetHtml=`<!doctype html><html><head><title>Fictional widget</title><style>body{background:white;color:black}</style></head><body><d2l-custom-grade-widget-main></d2l-custom-grade-widget-main><script>customElements.define('d2l-custom-grade-widget-main',class extends HTMLElement{connectedCallback(){if(!this.shadowRoot)this.attachShadow({mode:'open'}).innerHTML='<style>.main-container{background:white;color:black}</style><div class="main-container">Fictional widget</div>'}});addEventListener('message',e=>{if(e.data!=='fixture-report')return;const root=document.querySelector('d2l-custom-grade-widget-main').shadowRoot;e.source.postMessage({host:location.hostname,fixtureReport:{styled:!!document.querySelector('style[data-brightspace-theme]'),shadowStyled:!!root.querySelector('style[data-brightspace-theme]'),bg:getComputedStyle(document.body).backgroundColor,surface:getComputedStyle(root.querySelector('div')).backgroundColor}},e.origin);});</script></body></html>`;
async function fixture(page,url) {
  page.on('Fetch.requestPaused', ({requestId,request})=>{
    const body=widgetHosts.includes(new URL(request.url).hostname)?widgetHtml:request.url.includes('local-frame')?'<!doctype html><html><body><p>Sample frame</p></body></html>':html;
    page.send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html'}],body:Buffer.from(body).toString('base64')}).catch(error=>{if(!closingBrowser)console.error(error);});
  });
  await page.send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await page.send('Page.navigate',{url});
  await page.until(`document.readyState==='complete' && !!document.querySelector(${JSON.stringify(widgetHosts.includes(new URL(url).hostname)?'d2l-custom-grade-widget-main':'demo-card')})?.shadowRoot`);
}
async function reportWidgets(p) {
  await p.evaluate(`window.widgetReports={};for(const frame of document.querySelectorAll('iframe.external-widget'))frame.contentWindow.postMessage('fixture-report',new URL(frame.src).origin);`);
  await p.until(`Object.keys(window.widgetReports).length===2`);
  return p.evaluate('window.widgetReports');
}
try {
  let {control,page}=await launch();
  const {id}=await control.send('Extensions.loadUnpacked',{path:path.join(root,'extension')});
  assert(id,'Chrome accepted the manifest and unpacked extension');
  const popup=await page(`chrome-extension://${id}/popup.html`);
  await popup.until(`!!document.querySelector('#enabled:not(:disabled)')`);
  await popup.until(`document.querySelector('img.mark')?.complete && document.querySelector('img.mark').naturalWidth===128`);
  const manifest=JSON.parse(await readFile(path.join(root,'extension','manifest.json'),'utf8'));
  const updateInfo=await popup.evaluate(`(()=>{const a=document.querySelector('#check-updates');return {version:document.querySelector('#version').textContent,href:a.href,target:a.target,rel:a.rel}})()`);
  assert.deepEqual(updateInfo,{version:`v${manifest.version}`,href:'https://github.com/PrithviGhale/Brightspace-Theme/releases/latest',target:'_blank',rel:'noopener noreferrer'});
  await popup.send('Emulation.setDeviceMetricsOverride',{width:360,height:600,deviceScaleFactor:1,mobile:false});
  assert(await popup.evaluate(`document.documentElement.scrollHeight<=600`),'popup controls and update link fit within 600px');
  const popupImage=await popup.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile(path.join(root,'dist','popup.png'),Buffer.from(popupImage.data,'base64'));
  const first=await page(), second=await page();
  await fixture(first,'https://learn.snhu.edu/local-test');
  await fixture(second,'https://learn.snhu.edu/another-local-test');
  for(const p of [first,second]) await p.until(`getComputedStyle(document.body).backgroundColor==='rgb(18, 24, 32)'`);
  await first.until(`!!document.querySelector('demo-card').shadowRoot.querySelector('style[data-brightspace-theme]')`);
  await first.until(`!!document.querySelector('d2l-card').shadowRoot.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await first.evaluate(`getComputedStyle(document.querySelector('d2l-card')).backgroundColor`),'rgb(28, 37, 48)');
  await first.until(`[...document.querySelectorAll('iframe:not(.external-widget)')].every(f=>f.contentDocument?.querySelector('style[data-brightspace-theme]'))`);
  for(const value of Object.values(await reportWidgets(first))) {
    assert(value.styled && value.shadowStyled);assert.equal(value.bg,'rgb(28, 37, 48)');assert.equal(value.surface,'rgb(28, 37, 48)');
  }
  await popup.evaluate(`document.querySelector('#more-themes').click();document.querySelector('[value="ocean"]').click()`);
  for(const p of [first,second]) await p.until(`getComputedStyle(document.body).backgroundColor==='rgb(16, 33, 43)'`);
  assert(await popup.evaluate(`document.querySelector('#more-themes').getAttribute('aria-expanded')==='true'`));
  await popup.evaluate(`document.querySelector('[value="midnight-city"]').click()`);
  for(const p of [first,second]) await p.until(`getComputedStyle(document.body,'::before').animationName==='brightspace-ambience'`);
  await popup.evaluate(`const color=document.querySelector('[data-color="bg"]');color.value='#101820';color.dispatchEvent(new Event('input',{bubbles:true}))`);
  for(const p of [first,second]) await p.until(`getComputedStyle(document.documentElement).backgroundColor==='rgb(16, 24, 32)'`);
  await popup.evaluate(`document.querySelector('[value="warm"]').click()`);
  for(const p of [first,second]) await p.until(`getComputedStyle(document.body).backgroundColor==='rgb(243, 234, 216)'`);
  await first.until(`[...document.querySelectorAll('iframe:not(.external-widget)')].every(f=>getComputedStyle(f.contentDocument.body).backgroundColor==='rgb(255, 247, 232)')`);
  for(const value of Object.values(await reportWidgets(first))) assert.equal(value.bg,'rgb(255, 247, 232)');
  await popup.evaluate(`document.querySelector('#enabled').click()`);
  for(const p of [first,second]) await p.until(`!document.querySelector('style[data-brightspace-theme]')`);
  for(const value of Object.values(await reportWidgets(first))) assert(!value.styled && !value.shadowStyled);
  await popup.evaluate(`document.querySelector('#enabled').click()`);
  for(const p of [first,second]) await p.until(`getComputedStyle(document.body).backgroundColor==='rgb(243, 234, 216)'`);
  const outside=await page(); await fixture(outside,'https://outside.invalid/local-test');
  assert.equal(await outside.evaluate(`!!document.querySelector('style[data-brightspace-theme]')`),false);
  for(const value of Object.values(await reportWidgets(outside))) assert(!value.styled && !value.shadowStyled,'approved host must stay unthemed below an unrelated top-level site');
  const direct=await page();await fixture(direct,`https://${widgetHosts[0]}/production/index.html`);
  assert.equal(await direct.evaluate(`!!document.querySelector('style[data-brightspace-theme]')`),false,'direct widget visits must stay unthemed');
  const exited=new Promise(resolve=>browser.once('exit',resolve));
  closingBrowser=true;
  await control.send('Browser.close').catch(()=>{}); await exited;
  for(const s of sockets) s.close(); sockets.length=0;
  await pause(300);
  ({control,page}=await launch());
  // CDP loadUnpacked is session-scoped; reuse the profile and stable extension ID.
  const reloaded=await control.send('Extensions.loadUnpacked',{path:path.join(root,'extension')});
  assert.equal(reloaded.id,id);
  const restoredPopup=await page(`chrome-extension://${id}/popup.html`);
  await restoredPopup.until(`!!document.querySelector('#enabled:not(:disabled)')`);
  assert(await restoredPopup.evaluate(`document.querySelector('[value="warm"]').checked && document.querySelector('#enabled').checked`));
  const restored=await page(); await fixture(restored,'https://learn.snhu.edu/restart-local-test');
  await restored.until(`getComputedStyle(document.body).backgroundColor==='rgb(243, 234, 216)'`);
  console.log('PASS: Chrome loaded actual MV3 extension; real chrome.storage.local; popup and two-tab synchronization; matching and srcdoc frames; open shadow root; off/on cleanup; outside host excluded; saved preferences and content theme survived full browser restart. All site responses were local fixtures.');
  console.log('PASS: both approved widget origins theme only below the SNHU top-level origin; nested root and frame surface colors synchronize; off removes styles; direct visits and unrelated embeddings remain unchanged.');
  console.log('PASS: installed version and safe latest-release link; popup fits 360×600; no GitHub request made by the test. Screenshot: dist/popup.png.');
} finally {
  closingBrowser=true;
  clearTimeout(deadline);for(const s of sockets)s.close();browser?.kill();
  console.log(`Isolated test profile: ${profile}`);
}
