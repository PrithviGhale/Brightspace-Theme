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
const liveUpdate=process.env.AFTER_HOURS_LIVE_UPDATE_SMOKE==='1';
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
  browser=spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',...(liveUpdate?[]:['--host-resolver-rules=MAP api.github.com ~NOTFOUND']),'--enable-unsafe-extension-debugging','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
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
  async function worker() {
    for(let i=0;i<100;i++){
      const targets=await(await fetch(`${base}/json`)).json();
      const target=targets.find(t=>t.type==='service_worker'&&t.url.endsWith('/background.js'));
      if(target)return connect(target.webSocketDebuggerUrl);
      await pause(30);
    }
    throw new Error('Extension worker not found');
  }
  return {control,page,worker};
}

try{
  const {control,page,worker}=await launch();
  const {id}=await control.send('Extensions.loadUnpacked',{path:path.join(root,'extension')});
  const background=await worker();await background.until('!!globalThis.BrightUpdates');
  const source=await page();
  source.on('Fetch.requestPaused',({requestId,request})=>source.send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html'}],body:Buffer.from('<!doctype html><html><body><div class="d2l-widget">Decorative panel</div><h1>Fictional assignment</h1><p>Read the weekly chapter.</p><p hidden>HIDDEN PRIVATE TEXT</p><details><summary>Extra details</summary>CLOSED SECRET<p>HIDDEN DETAIL SECRET</p></details><input value="INPUT SECRET"><textarea>DRAFT SECRET</textarea><div contenteditable="true">EDITOR SECRET</div><demo-text></demo-text><iframe srcdoc="&lt;p&gt;Embedded reading&lt;/p&gt;"></iframe><script>customElements.define("demo-text",class extends HTMLElement{connectedCallback(){this.attachShadow({mode:"open"}).innerHTML="<p>Shadow reading</p>"}})</script></body></html>').toString('base64')}).catch(()=>{}));
  await source.send('Fetch.enable',{patterns:[{urlPattern:'*'}]});await source.send('Page.navigate',{url:'https://learn.snhu.edu/performance-fixture'});await source.until('document.readyState==="complete"');
  await source.send('Page.bringToFront');const sourceId=await background.evaluate('chrome.tabs.query({active:true,lastFocusedWindow:true}).then(t=>t[0]?.id)');
  const panel=await page('chrome-extension://'+id+'/popup.html');await panel.until('!!document.querySelector("#copy-page")');
  assert(Number.isInteger(sourceId));
  await panel.send('Emulation.setDeviceMetricsOverride',{width:440,height:600,deviceScaleFactor:1,mobile:false});
  await panel.evaluate('chrome.tabs.query=async()=>[{id:'+sourceId+'}]');
  const paste=await page('data:text/html,<body contenteditable="true"></body>');await paste.until('document.body?.isContentEditable');
  for(const enabled of [true,false]){
    await panel.evaluate('chrome.storage.local.set({enabled:'+enabled+'})');
    await panel.send('Page.bringToFront');await panel.send('Runtime.evaluate',{expression:'document.querySelector("#copy-page").click()',userGesture:true});
    await panel.until('document.querySelector("#page-copy-status").textContent.startsWith("Copied ")');
    await paste.send('Page.bringToFront');await paste.evaluate('document.body.innerHTML="";document.body.focus()');
    await paste.send('Input.dispatchKeyEvent',{type:'keyDown',key:'v',code:'KeyV',windowsVirtualKeyCode:86,modifiers:2});await paste.send('Input.dispatchKeyEvent',{type:'keyUp',key:'v',code:'KeyV',windowsVirtualKeyCode:86,modifiers:2});
    await paste.until('document.body.innerText.includes("Fictional assignment")');
    const text=await paste.evaluate('document.body.innerText');assert(text.includes('Shadow reading'));assert(text.includes('Embedded reading'));assert(!/SECRET|HIDDEN PRIVATE/.test(text));
  }
  assert.equal(await background.evaluate('chrome.tabs.sendMessage('+sourceId+',{type:"read-brightspace-page"},{frameId:0})'),undefined,'Worker cannot request page text: exact popup sender required');
  // Every active theme retains its artwork and palette while expensive effects stop.
  const themes=await panel.evaluate('BrightPreferences.THEMES');
  for(const theme of themes){
    await panel.evaluate('chrome.storage.local.set({enabled:true,performanceMode:false,theme:'+JSON.stringify(theme)+'})');
    await pause(60);
    const before=await source.evaluate('({color:getComputedStyle(document.body).color,art:getComputedStyle(document.body,"::before").backgroundImage})');
    await panel.evaluate('chrome.storage.local.set({performanceMode:true})');
    await source.until('!!document.querySelector("style[data-brightspace-performance]") || document.querySelector("style[data-brightspace-theme]")?.textContent.includes("will-change:auto!important")');
    const after=await source.evaluate('({color:getComputedStyle(document.body).color,art:getComputedStyle(document.body,"::before").backgroundImage,motion:getComputedStyle(document.body,"::before").animationName,blur:getComputedStyle(document.querySelector(".d2l-widget")).backdropFilter})');
    assert.equal(after.color,before.color,theme+': text color retained');assert.equal(after.art,before.art,theme+': artwork retained');assert.equal(after.blur,'none',theme+': glass blur disabled');
    if(theme!=='original')assert.equal(after.motion,'none',theme+': ambient animation stopped');
    assert(await source.evaluate('document.querySelector("demo-text").shadowRoot.querySelector("style[data-brightspace-theme]")?.textContent.includes("will-change:auto!important") || !!document.querySelector("style[data-brightspace-performance]")'),theme+': nested roots updated');
    await panel.evaluate('chrome.storage.local.set({performanceMode:false})');
    await source.until('!document.querySelector("style[data-brightspace-performance]") && !document.querySelector("style[data-brightspace-theme]")?.textContent.includes("will-change:auto!important")');
  }
  await panel.evaluate('chrome.storage.local.set({enabled:true,theme:"liquid-dark",performanceMode:true})');
  await source.until('document.querySelector("style[data-brightspace-theme]")?.textContent.includes("will-change:auto!important")');
  await source.evaluate('const card=document.createElement("d2l-card");card.attachShadow({mode:"open"}).innerHTML="<div class=d2l-card-container>Late card</div>";document.body.append(card)');
  await source.until('document.querySelector("d2l-card").shadowRoot.querySelector("style[data-brightspace-theme]")?.textContent.includes("will-change:auto!important")');
  assert.equal(await source.evaluate('getComputedStyle(document.querySelector("d2l-card")).backdropFilter'),'none','New shadow hosts also avoid blur');
  await panel.evaluate('chrome.storage.local.set({enabled:false,performanceMode:true})');
  await source.until('!!document.querySelector("style[data-brightspace-performance]") && !document.querySelector("style[data-brightspace-theme]")');
  await panel.evaluate('chrome.storage.local.set({performanceMode:false})');
  await source.until('!document.querySelector("style[data-brightspace-performance]") && !document.querySelector("style[data-brightspace-theme]")');
  await panel.evaluate('document.querySelector("#performance-mode").click()');
  await panel.until('chrome.storage.local.get("performanceMode").then(s=>s.performanceMode===true)');
  const persisted=await panel.evaluate('chrome.storage.local.get(null)');assert(!JSON.stringify(persisted).includes('Fictional assignment'),'Copied page text never enters storage');
  assert.equal(await panel.evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  const image=await panel.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(path.join(root,'dist','performance-popup.png'),Buffer.from(image.data,'base64'));
  console.log('PASS: real extension page copy/paste with themes on/off, hidden/editable exclusions, shadow/frame readings; all 23 appearances preserve art/colors, stop blur/motion and restore effects; off-mode cleanup and saved popup toggle.');
}finally{clearTimeout(deadline);closingBrowser=true;for(const s of sockets)s.close();browser?.kill();}
