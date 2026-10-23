// Render the real theme engine on fictional versions of every supported surface family.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {serve,root} from '../tools/preview-server.mjs';
const server=await serve();
const profile=await mkdtemp(path.join(root,'dist','chrome-test-'));
const browser=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const deadline=setTimeout(()=>{browser.kill();server.close();process.exit(1);},90000);
let socket;
try {
  let port;
  for(let i=0;i<100;i++){try{port=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await new Promise(r=>setTimeout(r,100));}}
  assert(port);
  const targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let id=0;const pending=new Map(),errors=[];
  socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});
  const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  async function until(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,30));}throw new Error(`Timed out: ${expression}`);}
  async function go(file){await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/${file}.html`});await until(`document.readyState==='complete'&&!!window.BrightTheme`);}
  async function set(theme){await evaluate(`chrome.storage.local.set({enabled:true,theme:'${theme}'})`);await until(`getComputedStyle(document.documentElement).getPropertyValue('--bs-liquid-glass').trim()!==''`);await until(`getComputedStyle(document.documentElement).getPropertyValue('--bs-bg').trim()==='${theme==='liquid'?'#e8effb':theme==='liquid-clear'?'#e2eefa':'#0c1625'}'`);}
  const shot=async name=>{await evaluate(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(root,'dist',`${name}.png`),Buffer.from(r.data,'base64'));};
  await cdp('Runtime.enable');await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await go('redesign');
  for(const theme of ['liquid','liquid-clear','liquid-dark']) {
    await set(theme);
    await until(`document.querySelector('d2l-card').shadowRoot.querySelector('style[data-brightspace-theme]').textContent.includes('bs-liquid-jelly')`);
    for(const view of ['dashboard','course','calendar']) {
      await evaluate(`document.querySelector('nav [data-view="${view}"]').click()`);
      assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false,`${theme}/${view} must fit desktop`);
      assert(await evaluate(`(()=>{const h=document.querySelector('[data-page="${view}"] h1'),s=getComputedStyle(h);return h.getBoundingClientRect().height>0&&s.visibility==='visible'&&s.opacity==='1'})()`),'Page title is visible');
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-page-header .d2l-box')).backgroundColor`),'rgba(0, 0, 0, 0)');
      if(view==='course') {
        await evaluate(`document.querySelector('#sample-comment').focus()`);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('#sample-comment')).outlineWidth`),'3px');
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-le-disc-post')).animationName`),'none','Reading surfaces stay still');
      }
      await shot(`${theme}-${view}`);
    }
    await evaluate(`document.querySelector('nav [data-view="dashboard"]').click()`);
    const controls=await evaluate(`[...document.querySelectorAll('d2l-labs-navigation-dropdown-button-icon,d2l-labs-navigation-dropdown-button-custom')].map(e=>{const b=e.shadowRoot.querySelector('button'),r=b.getBoundingClientRect(),p=document.querySelector('.header-inner').getBoundingClientRect();return {height:r.height,offset:Math.abs(r.y+r.height/2-p.y-p.height/2)}})`);
    for(const c of controls){assert.equal(c.height,44);assert(c.offset<1);}
    assert.equal(await evaluate(`document.querySelector('d2l-labs-navigation-dropdown-button-icon').shadowRoot.querySelector('d2l-icon').getBoundingClientRect().height`),32,'Enlarged header icons fit inside compact controls');
    assert.equal(await evaluate(`getComputedStyle(document.body,'::before').animationName`),'bs-liquid-drift');
    const box=await evaluate(`(()=>{const r=document.querySelector('d2l-card').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...box});
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('d2l-card')).animationName`),'bs-liquid-jelly');
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    assert.equal(await evaluate(`getComputedStyle(document.body,'::before').animationName`),'none');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('d2l-card')).animationName`),'none');
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});
    assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false,`${theme}: mobile overflow`);
    await shot(`${theme}-mobile`);
    await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
    await cdp('Emulation.setEmulatedMedia',{features:[]});
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  }
  for(const file of ['course-surfaces','menu-settings','submission-tables','profiles']) {
    await go(file);
    for(const theme of ['liquid','liquid-clear','liquid-dark']) {
      await set(theme);
      const surfaces=await evaluate(`(()=>{const selectors='.d2l-le-disc-post,.d2l-panel,.d2l-filedrop,.d2l-menu,.d2l-table td,.d2l-table th,input,textarea';return [...document.querySelectorAll(selectors)].map(e=>({bg:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color}))})()`);
      for(const s of surfaces){assert.notEqual(s.bg,'rgb(255, 255, 255)',`${file}/${theme}: native white leaked`);assert.notEqual(s.color,s.bg,'Text must not match its surface');}
      const photos=await evaluate(`[...document.querySelectorAll('img:not(.d2l-navigation-s-logo-image)')].filter(e=>!e.closest('.d2l-navigation-s-logo')).map(e=>({filter:getComputedStyle(e).filter,loaded:e.complete&&e.naturalWidth>0,width:e.getBoundingClientRect().width}))`);
      for(const p of photos){assert.equal(p.filter,'none');assert(p.loaded&&p.width>0,`${file}/${theme}: photo visible`);}
      if(file==='submission-tables')assert(await evaluate(`[...document.querySelectorAll('.mixed-table tr[data-data-row]')].every(r=>new Set([...r.children].map(e=>getComputedStyle(e).backgroundColor)).size===1)`),'Row headings and cells match');
      await shot(`${theme}-${file}`);
    }
    await evaluate(`chrome.storage.local.set({theme:'original'})`);
    await until(`!document.querySelector('style[data-brightspace-theme]')`);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: all three Liquid Glass modes on dashboard/course/calendar, discussions, submission/feedback/dropzones, grade/classlist tables, menus/settings/progress, images, keyboard focus, desktop/mobile, jelly hover, reduced motion, Original cleanup. Screenshots dist/liquid-*.png.');
}finally{clearTimeout(deadline);socket?.close();browser.kill();await new Promise(r=>server.close(r));}
