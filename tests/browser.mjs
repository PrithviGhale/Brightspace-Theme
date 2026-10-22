// Dependency-free Chrome DevTools Protocol checks against the local fixture.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serve, root } from '../tools/preview-server.mjs';
const server = await serve();
const profile = await mkdtemp(path.join(root, 'dist', 'chrome-test-'));
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = spawn(chromePath, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], {windowsHide:true, stdio:'ignore'});
browser.on('error', error => console.error('Chrome launch:', error.message));
const deadline = setTimeout(() => { console.error('Browser verification exceeded 60 seconds.'); browser.kill(); server.close(); process.exit(1); }, 60000);
let socket;
try {
  let port;
  for (let i=0;i<100;i++) {
    try { port = (await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]; break; } catch { await new Promise(r=>setTimeout(r,100)); }
  }
  assert(port, 'Chrome debugging endpoint started');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let id=0;
  const pending = new Map();
  const errors=[];
  socket.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id){const task=pending.get(msg.id);pending.delete(msg.id);msg.error?task.reject(new Error(JSON.stringify(msg.error))):task.resolve(msg.result);} else if(msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);};
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;const timer=setTimeout(()=>reject(new Error(`CDP timeout: ${method}`)),10000);pending.set(next,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});socket.send(JSON.stringify({id:next,method,params}));});
  const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  async function until(expression) { for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,40));}throw new Error(`Timed out: ${expression}`); }
  await cdp('Runtime.enable'); await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
  try {
    await until(`document.querySelector('demo-card')?.shadowRoot?.querySelector('style[data-brightspace-theme]') && document.querySelector('.popup')?.contentDocument?.querySelector('#enabled:not(:disabled)')`);
  } catch (error) {
    console.log(await evaluate(`({url:location.href,ready:document.readyState,engine:typeof BrightTheme,prefs:typeof BrightPreferences,shadow:document.querySelector('demo-card')?.shadowRoot?.innerHTML,popup:document.querySelector('.popup')?.contentDocument?.body?.innerText})`));
    console.log('Runtime errors:',errors);
    throw error;
  }
  const set=theme=>evaluate(`chrome.storage.local.set({theme:${JSON.stringify(theme)},enabled:true})`);
  const bg=()=>evaluate(`getComputedStyle(document.body).backgroundColor`);
  await evaluate(`(()=>{const box=document.createElement('div');box.id='copy-fixture';box.innerHTML='<h2 style="color:white;background:black">Sample heading</h2><p style="color:#ff0000;font-family:fantasy"><strong>Bold</strong> and <em>italic</em> — Unicode ✓</p><ul><li>List item</li></ul><a href="https://example.com/reading">Reading link</a>';document.body.append(box)})()`);
  for(const theme of ['dark','dim','warm','ocean','forest','rose','midnight-city','sunset','aurora','custom','modern','liquid','liquid-clear','liquid-dark','original']) {
    await set(theme);
    const copied=await evaluate(`(()=>{const box=document.querySelector('#copy-fixture'),sel=document.getSelection(),r=document.createRange();r.selectNodeContents(box);sel.removeAllRanges();sel.addRange(r);const expected=sel.toString(),data=new DataTransfer(),event=new ClipboardEvent('copy',{clipboardData:data,bubbles:true,cancelable:true});box.dispatchEvent(event);return {html:data.getData('text/html'),plain:data.getData('text/plain'),expected,prevented:event.defaultPrevented,source:box.querySelector('p').getAttribute('style')}})()`);
    assert(copied.prevented,theme+': handles selected text copy');
    assert.equal(copied.plain,copied.expected);
    assert.match(copied.html,/color: #000000/);assert.match(copied.html,/<strong>Bold<\/strong>/);assert.match(copied.html,/<ul><li>List item/);assert.match(copied.html,/href="https:\/\/example.com\/reading"/);
    assert(!/fantasy|#ff0000|background:black/.test(copied.html));assert.match(copied.source,/fantasy/,'Copy must not change the page');
    assert(await evaluate(`(()=>{const d=document.querySelector('.content').contentDocument,s=d.getSelection(),r=d.createRange();r.selectNodeContents(d.querySelector('h3'));s.removeAllRanges();s.addRange(r);const data=new d.defaultView.DataTransfer(),e=new d.defaultView.ClipboardEvent('copy',{clipboardData:data,bubbles:true,cancelable:true});d.querySelector('h3').dispatchEvent(e);s.removeAllRanges();return e.defaultPrevented&&data.getData('text/html').includes('color: #000000')})()`),theme+': embedded reading copy is neutral');
  }
  await evaluate(`chrome.storage.local.set({enabled:false})`);
  assert.equal(await evaluate(`(()=>{const e=new ClipboardEvent('copy',{clipboardData:new DataTransfer(),bubbles:true,cancelable:true});document.querySelector('#copy-fixture').dispatchEvent(e);document.getSelection().removeAllRanges();document.querySelector('#copy-fixture').remove();return e.defaultPrevented})()`),false,'Off restores native copy');
  console.log('PASS: neutral rich-text copy across fourteen themes and Original; plain-text fidelity, headings/lists/emphasis/links, unchanged source and Off restoration. No system clipboard read.');
  for (const [theme,expected,frameColor] of [['dark','rgb(18, 24, 32)','rgb(28, 37, 48)'],['dim','rgb(37, 43, 52)','rgb(48, 57, 69)'],['warm','rgb(243, 234, 216)','rgb(255, 247, 232)']]) {
    await set(theme);
    await until(`getComputedStyle(document.querySelector('.content').contentDocument.body).backgroundColor === ${JSON.stringify(frameColor)}`);
    assert.equal(await bg(),expected);
    const colors=await evaluate(`(()=>{const s=document.querySelector('demo-card').shadowRoot;return [getComputedStyle(s.querySelector('section')).backgroundColor,getComputedStyle(s.querySelector('a')).color,getComputedStyle(document.querySelector('a span')).color,getComputedStyle(document.querySelector('a span').parentNode).color]})()`);
    assert.notEqual(colors[0],'rgb(255, 255, 255)');
    assert.equal(colors[2],colors[3]);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`preview-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  for(const theme of ['dark','dim','warm','ocean','forest','rose','midnight-city','sunset','aurora','custom','modern','liquid','liquid-clear','liquid-dark']) {
    await set(theme);
    await until(`(()=>{const d=document.querySelector('.content').contentDocument;const panel=d.querySelector('.intersect-content');const hex=getComputedStyle(d.documentElement).getPropertyValue('--bs-surface').trim();const parts=hex.slice(1).match(/../g)?.map(v=>parseInt(v,16));return parts&&getComputedStyle(panel).backgroundColor==='rgb('+parts.join(', ')+')'})()`);
  }
  console.log('PASS: embedded SNHU intersect-content reading panel follows all fourteen themed appearances.');
  await set('modern');
  await until(`getComputedStyle(document.body).backgroundColor==='rgb(12, 16, 33)'`);
  const modernSurface=await evaluate(`(()=>{const card=document.querySelector('.cards .d2l-widget');const reveal=getComputedStyle(card);return {radius:reveal.borderRadius,timeline:reveal.animationTimeline,frame:getComputedStyle(document.querySelector('.content').contentDocument.body).backgroundColor,media:getComputedStyle(document.querySelector('img')).filter}})()`);
  assert.equal(modernSurface.radius,'24px','Prism rounds outer dashboard panels');
  assert.equal(modernSurface.frame,'rgb(24, 31, 57)','Prism carries into supported HTML frames');
  assert.equal(modernSurface.media,'none','Prism preserves original course media');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#grades table')).borderCollapse`),'collapse','Authored/layout tables keep their existing geometry');
  if(await evaluate(`CSS.supports('animation-timeline: view()')`)) assert.notEqual(modernSurface.timeline,'auto','Prism adds native scroll-entry motion where supported');
  await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist','preview-modern.png'),Buffer.from(r.data,'base64')));
  for (const [theme,surface,text] of [['ocean','rgb(24, 49, 61)','rgb(229, 247, 250)'],['forest','rgb(34, 52, 42)','rgb(237, 245, 233)'],['rose','rgb(57, 39, 56)','rgb(255, 240, 245)']]) {
    await set(theme);
    await until(`getComputedStyle(document.querySelector('.d2l-widget')).backgroundColor === ${JSON.stringify(surface)}`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-widget h2')).color`),text,`${theme}: card title contrast`);
  }
  for (const theme of ['midnight-city','sunset','aurora']) {
    await set(theme);
    await until(`getComputedStyle(document.body,'::before').animationName === 'brightspace-ambience'`);
    const scene=await evaluate(`({animation:getComputedStyle(document.body,'::before').animationName,skyline:getComputedStyle(document.body,'::after').backgroundImage,body:getComputedStyle(document.body).backgroundColor})`);
    assert.equal(scene.animation,'brightspace-ambience');
    assert.equal(scene.body,'rgba(0, 0, 0, 0)');
    if(theme==='aurora') assert.equal(scene.skyline,'none'); else assert.match(scene.skyline,/data:image\/svg\+xml/);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`preview-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  const previewCustom={bg:'#101820',surface:'#202a30',raised:'#30414a',text:'#f0f6f8',muted:'#bfd0d6',link:'#8ee2ff',border:'#68828c',focus:'#ffd27a',danger:'#ffb6b6',success:'#a5e7c2',scheme:'dark'};
  await evaluate(`chrome.storage.local.set({theme:'custom',customPalette:${JSON.stringify(previewCustom)},enabled:true})`);
  await until(`getComputedStyle(document.documentElement).backgroundColor === 'rgb(16, 24, 32)'`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-widget')).backgroundColor`),'rgb(32, 42, 48)');
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await set('midnight-city');
  await until(`getComputedStyle(document.body,'::before').animationName === 'none'`);
  await cdp('Emulation.setEmulatedMedia',{features:[]});
  await evaluate(`document.querySelector('#add').click()`);
  await until(`document.querySelector('#dynamic demo-card')?.shadowRoot?.querySelector('style[data-brightspace-theme]')`);
  assert(await evaluate(`!!document.querySelector('demo-card').shadowRoot.querySelector('demo-nested').shadowRoot.querySelector('style[data-brightspace-theme]')`));
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('img')).filter`),'none');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('video')).filter`),'none');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.course-art b:nth-child(2)')).backgroundColor`),'rgb(237, 198, 87)');
  await evaluate(`document.querySelector('#title').focus()`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#title')).outlineWidth`),'3px');
  await evaluate(`document.querySelector('#dialog-open').click()`);
  assert(await evaluate(`document.querySelector('dialog').open`));
  await evaluate(`document.querySelector('#dialog-close').click()`);
  // Operate the actual popup DOM, backed by the preview storage adapter.
  await evaluate(`document.querySelector('.popup').contentDocument.querySelector('[value="dim"]').click()`);
  await until(`getComputedStyle(document.body).backgroundColor === 'rgb(37, 43, 52)'`);
  await evaluate(`document.querySelector('.popup').contentDocument.querySelector('#enabled').click()`);
  await until(`!document.querySelector('style[data-brightspace-theme]')`);
  assert(await evaluate(`!document.querySelector('demo-card').shadowRoot.querySelector('style[data-brightspace-theme]')`));
  await until(`!document.querySelector('.content').contentDocument.querySelector('style[data-brightspace-theme]')`);
  await evaluate(`document.querySelector('.popup').contentDocument.querySelector('#enabled').click()`);
  await until(`getComputedStyle(document.body).backgroundColor === 'rgb(37, 43, 52)'`);
  await evaluate(`document.querySelector('main').append(document.createElement('late-sample'))`);
  await evaluate(`chrome.storage.local.set({enabled:false})`);
  await evaluate(`chrome.storage.local.set({enabled:true})`);
  await evaluate(`customElements.define('late-sample',class extends HTMLElement{connectedCallback(){if(!this.shadowRoot)this.attachShadow({mode:'open'}).innerHTML='<section>Late component</section>'}})`);
  await until(`!!document.querySelector('late-sample').shadowRoot?.querySelector('style[data-brightspace-theme]')`);
  await cdp('Page.reload');
  await until(`document.readyState === 'complete' && getComputedStyle(document.body).backgroundColor === 'rgb(37, 43, 52)'`);
  await set('original');
  await until(`!document.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await bg(),'rgba(0, 0, 0, 0)');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/dashboard.html`});
  await until(`document.readyState==='complete' && !!document.querySelector('d2l-card')?.shadowRoot`);
  await until(`!!document.querySelector('d2l-my-courses-v2')?.shadowRoot?.querySelector('d2l-my-courses-container-v2')?.shadowRoot?.querySelector('d2l-my-courses-content-v2')?.shadowRoot?.querySelector('d2l-my-courses-card-grid-v2')?.shadowRoot?.querySelector('d2l-my-courses-enrollment-card')?.shadowRoot?.querySelector('d2l-card')?.shadowRoot`);
  for (const [theme,surface,text] of [['dark','rgb(28, 37, 48)','rgb(231, 237, 245)'],['dim','rgb(48, 57, 69)','rgb(240, 242, 246)'],['warm','rgb(255, 247, 232)','rgb(56, 45, 35)']]) {
    await set(theme);
    await until(`!!document.querySelector('d2l-card').shadowRoot.querySelector('style[data-brightspace-theme]')`);
    const result=await evaluate(`(()=>{const card=document.querySelector('d2l-card');const footer=document.querySelector('d2l-labs-navigation-main-footer');return {
      card:getComputedStyle(card).backgroundColor,title:getComputedStyle(card.querySelector('[slot="content"]')).color,
      navigation:getComputedStyle(document.querySelector('.d2l-navigation-s-main-wrapper')).backgroundColor,
      button:getComputedStyle(document.querySelector('.d2l-navigation-s-main button')).backgroundColor,
      footer:getComputedStyle(footer).backgroundColor,innerFooter:getComputedStyle(footer.shadowRoot.querySelector('div')).backgroundColor,
      logo:getComputedStyle(document.querySelector('.d2l-navigation-s-logo')).backgroundColor,
      image:getComputedStyle(card.querySelector('img')).filter
    }})()`);
    assert.equal(result.card,surface,`${theme}: fixed-white adopted host must be themed`);
    assert.equal(result.title,text,`${theme}: slotted course title contrast`);
    assert.equal(result.navigation,surface,`${theme}: white navigation strip`);
    assert.equal(result.button,'rgba(0, 0, 0, 0)',`${theme}: nav dropdown should blend into the strip`);
    assert.equal(result.footer,surface);assert.equal(result.innerFooter,surface);
    assert.equal(result.logo,'rgba(0, 0, 0, 0)');assert.equal(result.image,'none');
    const nested=await evaluate(`(()=>{let host=document.querySelector('d2l-my-courses-v2');for(const name of ['d2l-my-courses-container-v2','d2l-my-courses-content-v2','d2l-my-courses-card-grid-v2','d2l-my-courses-enrollment-card'])host=host.shadowRoot.querySelector(name);const enrollment=host;const card=enrollment.shadowRoot.querySelector('d2l-card');return {card:getComputedStyle(card).backgroundColor,container:getComputedStyle(card.shadowRoot.querySelector('.d2l-card-container')).backgroundColor,content:getComputedStyle(card.shadowRoot.querySelector('.d2l-card-content')).backgroundColor,title:getComputedStyle(card.querySelector('[slot="content"]')).color,roots:[document.querySelector('d2l-my-courses-v2'),document.querySelector('d2l-my-courses-v2').shadowRoot.querySelector('d2l-my-courses-container-v2'),document.querySelector('d2l-my-courses-v2').shadowRoot.querySelector('d2l-my-courses-container-v2').shadowRoot.querySelector('d2l-my-courses-content-v2'),document.querySelector('d2l-my-courses-v2').shadowRoot.querySelector('d2l-my-courses-container-v2').shadowRoot.querySelector('d2l-my-courses-content-v2').shadowRoot.querySelector('d2l-my-courses-card-grid-v2'),enrollment,card].map(e=>!!e.shadowRoot.querySelector('style[data-brightspace-theme]'))}})()`);
    assert.equal(nested.card,surface,`${theme}: nested course card host`);
    assert.equal(nested.container,surface,`${theme}: nested course card container`);
    assert.equal(nested.content,surface,`${theme}: nested course card content`);
    assert.equal(nested.title,text,`${theme}: nested slotted course title`);
    assert(nested.roots.every(Boolean),`${theme}: every nested course component root is themed`);
    assert.equal(await evaluate(`getComputedStyle(document.documentElement).backgroundColor`), await bg(),`${theme}: viewport must not retain a light background`);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`dashboard-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  await set('original');
  await until(`!document.querySelector('d2l-card').shadowRoot.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('d2l-card')).backgroundColor`),'rgb(255, 255, 255)');
  assert.equal(await evaluate(`(()=>{let h=document.querySelector('d2l-my-courses-v2');for(const n of ['d2l-my-courses-container-v2','d2l-my-courses-content-v2','d2l-my-courses-card-grid-v2','d2l-my-courses-enrollment-card'])h=h.shadowRoot.querySelector(n);return getComputedStyle(h.shadowRoot.querySelector('d2l-card')).backgroundColor})()`),'rgb(255, 255, 255)');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/course-surfaces.html`});
  await until(`document.readyState==='complete' && !!document.querySelector('iframe[title="Sample grade widget"]').contentDocument.querySelector('d2l-custom-grade-widget')?.shadowRoot`);
  for(const [theme,surface,text] of [['dark','rgb(28, 37, 48)','rgb(231, 237, 245)'],['dim','rgb(48, 57, 69)','rgb(240, 242, 246)'],['warm','rgb(255, 247, 232)','rgb(56, 45, 35)']]) {
    await set(theme);
    await until(`getComputedStyle(document.querySelector('iframe[title="Sample grade widget"]').contentDocument.body).backgroundColor===${JSON.stringify(surface)}`);
    const result=await evaluate(`(()=>{const gradeDoc=document.querySelector('iframe[title="Sample grade widget"]').contentDocument;const grade=gradeDoc.querySelector('d2l-custom-grade-widget').shadowRoot.querySelector('d2l-custom-grade-widget-main').shadowRoot;const discussionDoc=document.querySelector('iframe[title="Sample discussion widget"]').contentDocument;const discussion=discussionDoc.querySelector('d2l-discussion-activity-widget').shadowRoot.querySelector('d2l-discussion-activity-widget-main').shadowRoot;const nav=document.querySelector('d2l-labs-navigation-dropdown-button-icon').shadowRoot.querySelector('button');return {post:getComputedStyle(document.querySelector('.d2l-le-disc-post')).backgroundColor,postText:getComputedStyle(document.querySelector('.d2l-le-disc-post p:not([class])')).color,grade:getComputedStyle(grade.querySelector('.main-container')).backgroundColor,gradeText:getComputedStyle(grade.querySelector('.letter-grade')).color,discussion:getComputedStyle(discussion.querySelector('.threads')).backgroundColor,discussionText:getComputedStyle(discussion.querySelector('.threads')).color,nav:getComputedStyle(nav).backgroundColor,frame:getComputedStyle(document.querySelector('iframe[title="Sample HTML widget"]').contentDocument.body).backgroundColor}})()`);
    for(const key of ['post','grade','discussion','frame']) assert.equal(result[key],surface,`${theme}: ${key} surface`);
    for(const key of ['postText','gradeText','discussionText']) assert.equal(result[key],text,`${theme}: ${key} contrast`);
    assert.equal(result.nav,'rgba(0, 0, 0, 0)',`${theme}: navigation controls must not have filled blocks`);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`course-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  await set('original');
  await until(`!document.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-le-disc-post')).backgroundColor`),'rgb(255, 255, 255)');
  console.log('PASS: course surfaces; legacy white discussion rows, navigation shadow triggers, nested grade/discussion widget roots, and blended HTML frame backgrounds across all themes; Original cleanup. Screenshots: dist/course-{dark,dim,warm}.png');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/menu-settings.html`});
  await until(`document.readyState==='complete' && !!document.querySelector('d2l-menu-item-link')?.shadowRoot`);
  for(const [theme,surface,raised,link,text] of [
    ['dark','rgb(28, 37, 48)','rgb(40, 53, 69)','rgb(146, 202, 255)','rgb(231, 237, 245)'],
    ['dim','rgb(48, 57, 69)','rgb(59, 71, 86)','rgb(169, 214, 255)','rgb(240, 242, 246)'],
    ['warm','rgb(255, 247, 232)','rgb(232, 220, 196)','rgb(35, 87, 134)','rgb(56, 45, 35)']
  ]) {
    await set(theme);
    await until(`!!document.querySelector('d2l-menu-item-link').shadowRoot.querySelector('style[data-brightspace-theme]')`);
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:1400,y:15});
    const result=await evaluate(`(()=>{const menu=document.querySelector('d2l-menu-item-link');const style=e=>getComputedStyle(e);return {menu:style(menu).backgroundColor,menuLink:style(menu.shadowRoot.querySelector('a')).color,sidebar:style(document.querySelector('.d2l-column-side-bg')).backgroundColor,progress:style(document.querySelector('.d2l-datalist-item-content')).backgroundColor,portfolio:style(document.querySelector('.legacy-gray')).backgroundColor,settings:style(document.querySelector('.dco_c')).backgroundColor,editor:style(document.querySelector('.tox-editor-header')).backgroundColor,glyph:style(document.querySelector('.tox-tbtn svg')).fill,tab:style(document.querySelector('d2l-tab[selected]')).backgroundColor,tabText:style(document.querySelector('d2l-tab[selected]')).color,toolbar:style(document.querySelector('d2l-floating-buttons').shadowRoot.querySelector('div')).backgroundColor,selectedFilter:style(document.querySelector('.d2l-button-filter-selected')).backgroundColor}})()`);
    for(const key of ['menu','sidebar','progress','portfolio','settings','editor','toolbar'])assert.equal(result[key],surface,`${theme}: ${key}`);
    assert.equal(result.menuLink,link);assert.equal(result.tab,raised);assert.equal(result.tabText,link);assert.equal(result.selectedFilter,link);assert.equal(result.glyph,text);
    await evaluate(`document.querySelector('select[aria-label="Theme"]').focus()`);
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    assert.equal(await evaluate(`document.activeElement.localName`),'d2l-menu-item-link');
    assert.equal(await evaluate(`getComputedStyle(document.activeElement).outlineWidth`),'3px');
    assert.equal(await evaluate(`getComputedStyle(document.activeElement).outlineOffset`),'-4px');
    const hoverPoint=await evaluate(`(()=>{const r=document.querySelectorAll('d2l-menu-item-link')[1].getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...hoverPoint});
    assert.equal(await evaluate(`getComputedStyle(document.querySelectorAll('d2l-menu-item-link')[1]).backgroundColor`),raised,`${theme}: menu hover`);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`menus-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  await set('original');await until(`!document.querySelector('style[data-brightspace-theme]')`);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:1400,y:15});
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('d2l-menu-item-link')).backgroundColor`),'rgb(255, 255, 255)');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.legacy-gray')).backgroundColor`),'rgb(242, 242, 242)');
  console.log('PASS: all three themes on menu hosts/links/hover, inset keyboard focus, account tabs/forms, calendar filters/sidebar, progress panel, ePortfolio editor, rich-text toolbar icons and floating toolbar; Original restoration. Screenshots: dist/menus-{dark,dim,warm}.png');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/submission-tables.html`});
  await until(`document.readyState==='complete' && !!document.querySelector('d2l-html-block')?.shadowRoot`);
  for(const [theme,surface,raised,text] of [
    ['dark','rgb(28, 37, 48)','rgb(40, 53, 69)','rgb(231, 237, 245)'],
    ['dim','rgb(48, 57, 69)','rgb(59, 71, 86)','rgb(240, 242, 246)'],
    ['warm','rgb(255, 247, 232)','rgb(232, 220, 196)','rgb(56, 45, 35)']
  ]) {
    await set(theme);await until(`!!document.querySelector('d2l-html-block').shadowRoot.querySelector('style[data-brightspace-theme]')`);
    const result=await evaluate(`(()=>{const style=e=>getComputedStyle(e);const effective=e=>{for(let n=e;n;){const c=style(n).backgroundColor;if(c!=='rgba(0, 0, 0, 0)')return c;n=n.parentElement||(n.getRootNode().host??null);}return ''};return {panels:[...document.querySelectorAll('.d2l-panel,.d2l-filedrop')].map(e=>({bg:style(e).backgroundColor,color:style(e).color})),headers:[...document.querySelectorAll('th[scope="col"]')].map(e=>style(e).backgroundColor),rows:[...document.querySelectorAll('tr[data-data-row]')].map(row=>({cells:[...row.children].map(e=>style(e).backgroundColor),nested:[...row.querySelectorAll('.d2l-htmlblock,d2l-html-block')].map(e=>({cell:style(e.closest('td,th')).backgroundColor,paint:effective(e.shadowRoot?.querySelector('.d2l-htmlblock')||e),color:style(e.shadowRoot?.querySelector('.d2l-htmlblock')||e).color}))})),meter:style(document.querySelector('.similarity-meter')).backgroundColor}})()`);
    for(const panel of result.panels){assert.equal(panel.bg,surface,`${theme}: submission/attachment panel`);assert.equal(panel.color,text);}
    for(const header of result.headers)assert.equal(header,raised,`${theme}: column header`);
    for(const row of result.rows){assert.equal(new Set(row.cells).size,1,`${theme}: row headers and data cells must have the same surface`);for(const nested of row.nested){assert.equal(nested.paint,nested.cell,`${theme}: no text backplate, including shadow HTML blocks`);assert.equal(nested.color,text);}}
    assert.equal(result.meter,'rgb(70, 166, 97)',`${theme}: preserve semantic status color`);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`submissions-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  await set('original');await until(`!document.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-filedrop')).backgroundColor`),'rgb(255, 255, 255)');
  assert(await evaluate(`[...document.querySelectorAll('d2l-html-block')].every(e=>!e.shadowRoot.querySelector('style[data-brightspace-theme]'))`));
  console.log('PASS: three-theme submission/attachment panels; mixed th/td rows; nested light/shadow HTML block surfaces; preserved similarity-meter color; Original restoration. Screenshots: dist/submissions-{dark,dim,warm}.png');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/profiles.html`});
  await until(`document.readyState==='complete' && document.querySelector('d2l-profile-image-base')?.shadowRoot`);
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1500,deviceScaleFactor:1,mobile:false});
  await set('original');
  await evaluate(`document.body.classList.add('test-collision')`);
  assert.equal(await evaluate(`document.querySelector('.reply-row img').getBoundingClientRect().width`),0,'defensive fixture reproduces a collapsed photo before protection');
  for(const theme of ['dark','dim','warm','original']) {
    await set(theme);
    await until(`!!document.querySelector('style[data-brightspace-theme]') === ${theme!=='original'}`);
    // Defensive collision case, distinct from the still-unconfirmed live cause.
    await evaluate(`document.body.classList.toggle('test-collision',${theme!=='original'})`);
    const photos=await evaluate(`(()=>{const imgs=[...document.querySelectorAll('img'),...document.querySelector('d2l-profile-image-base').shadowRoot.querySelectorAll('img')];return imgs.map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect(),root=e.getRootNode();return {loaded:e.complete&&e.naturalWidth>0,filter:s.filter,opacity:s.opacity,visibility:s.visibility,width:r.width,height:r.height,uncovered:root.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}})})()`);
    for(const photo of photos){assert(photo.loaded&&photo.uncovered,`${theme}: loaded photo is the painted hit target`);assert(photo.width>0&&photo.height>0);assert.equal(photo.filter,'none');assert.equal(photo.opacity,'1');assert.equal(photo.visibility,'visible');}
    const replies=await evaluate(`[...document.querySelectorAll('.reply-row img')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,bg:getComputedStyle(e).backgroundColor}))`);
    for(const reply of replies){assert.equal(reply.width,36);assert.equal(reply.height,36);if(theme!=='original')assert.equal(reply.bg,'rgb(231, 237, 245)');}
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-imagelink')).backgroundColor`),'rgba(0, 0, 0, 0)',`${theme}: image control must not receive an action-button fill`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-navigation-s-logo')).backgroundColor`),'rgba(0, 0, 0, 0)');
    const filter=await evaluate(`getComputedStyle(document.querySelector('.d2l-navigation-s-logo').shadowRoot.querySelector('img')).filter`);
    assert.equal(filter.includes('drop-shadow'),theme==='dark'||theme==='dim');
    await evaluate(`document.querySelector('.d2l-imagelink').focus()`);
    if(theme!=='original')assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-imagelink')).outlineWidth`),'3px');
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`profiles-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  await set('dark');
  await evaluate(`document.querySelector('#add-profile').click()`);
  await until(`!!document.querySelector('#profiles d2l-profile-image-base')?.shadowRoot?.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#profiles d2l-profile-image-base').shadowRoot.querySelector('img')).filter`),'none');
  console.log('PASS: discussion image controls, classlist photos, profile cards, open-shadow and added profile images; loaded/uncovered photos and no filtering; transparent branding with logo-only contour; all themes/Original. Screenshots dist/profiles-{dark,dim,warm,original}.png');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/redesign.html`});
  await until(`document.readyState==='complete' && document.querySelector('.course-grid d2l-card')?.shadowRoot?.querySelector('style[data-brightspace-theme]') && getComputedStyle(document.body).backgroundColor==='rgb(12, 16, 33)'`);
  const prism=await evaluate(`(()=>{const card=document.querySelector('.course-grid d2l-card'),root=card.shadowRoot;return {cards:document.querySelectorAll('.course-grid d2l-card').length,radius:getComputedStyle(card).borderRadius,imageInset:getComputedStyle(root.querySelector('.d2l-card-header')).marginTop,innerShadow:getComputedStyle(root.querySelector('.d2l-card-container')).boxShadow,photo:getComputedStyle(card.querySelector('img')).filter,opacity:getComputedStyle(document.querySelector('.d2l-widget')).opacity,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
  assert.deepEqual(prism,{cards:6,radius:'28px',imageInset:'11px',innerShadow:'none',photo:'none',opacity:'1',overflow:false});
  async function checkPrismHeader() {
    const geometry=await evaluate(`(()=>{const row=document.querySelector('.header-inner').getBoundingClientRect();return [...document.querySelectorAll('d2l-labs-navigation-dropdown-button-icon,d2l-labs-navigation-dropdown-button-custom')].map(e=>{const b=e.shadowRoot.querySelector('button'),r=b.getBoundingClientRect();return {offset:Math.abs(r.y+r.height/2-row.y-row.height/2),contained:r.y>=row.y&&r.bottom<=row.bottom,hit:e.shadowRoot.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===b}})})()`);
    for(const control of geometry){assert(control.offset<1,'Header controls stay vertically centered within the native fixed-height row');assert(control.contained&&control.hit,'Header controls are unclipped and clickable');}
    assert(await evaluate(`[...document.querySelectorAll('.d2l-page-header,.d2l-page-header .d2l-box,.d2l-page-header .d2l-box-layout')].every(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)')`),'Page-title layout wrappers must not paint opaque rectangles over the glow');
  }
  await checkPrismHeader();
  for(const tag of ['d2l-labs-navigation-dropdown-button-icon','d2l-labs-navigation-dropdown-button-custom']) {
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${tag}').shadowRoot.querySelector('button')).height`),'44px','Header controls cannot stretch to native 88px navigation height');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${tag}').shadowRoot.querySelector('button')).backgroundColor`),'rgba(0, 0, 0, 0)','Header controls have no permanent tall filled box');
  }
  await until(`getComputedStyle(document.querySelector('nav [aria-current="page"]')).backgroundColor==='rgb(48, 64, 104)'`);
  const cardBox=await evaluate(`(()=>{const r=document.querySelector('.course-grid d2l-card').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...cardBox});
  await until(`getComputedStyle(document.querySelector('.course-grid d2l-card')).transform!=='none'`);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:4,y:4});
  await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist','prism-desktop.png'),Buffer.from(r.data,'base64')));
  await evaluate(`document.querySelector('nav [data-view="course"]').click()`);
  await until(`!document.querySelector('[data-page="course"]').hidden`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-le-disc-post')).transform`),'none','Reading surfaces stay stationary');
  const rowTones=await evaluate(`(()=>{const cell=document.querySelector('.d2l-table tbody th'),inner=cell.querySelector('.d2l-htmlblock');return [getComputedStyle(cell).backgroundColor,getComputedStyle(inner).backgroundColor]})()`);
  assert.equal(rowTones[0],rowTones[1],'Nested feedback backgrounds blend with data-table cells');
  await evaluate(`document.querySelector('#sample-comment').focus()`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#sample-comment')).outlineWidth`),'3px');
  await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist','prism-course.png'),Buffer.from(r.data,'base64')));
  await evaluate(`document.querySelector('nav [data-view="calendar"]').click()`);
  await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist','prism-calendar.png'),Buffer.from(r.data,'base64')));
  await evaluate(`document.querySelector('nav [data-view="dashboard"]').click()`);
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...cardBox});
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.course-grid d2l-card')).transform`),'none','Reduced motion removes card lift');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-widget')).animationName`),'none','Reduced motion removes scroll entry');
  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});
  assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false,'Phone layout has no horizontal overflow');
  await checkPrismHeader();
  await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist','prism-mobile.png'),Buffer.from(r.data,'base64')));
  await evaluate(`const picker=document.querySelector('#appearance');picker.value='original';picker.dispatchEvent(new Event('change'))`);
  await until(`!document.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.course-grid d2l-card')).borderRadius`),'6px','Original restores native card styling');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('d2l-labs-navigation-dropdown-button-icon').shadowRoot.querySelector('button')).height`),'72px','Original restores native full-height header controls');
  await cdp('Emulation.setEmulatedMedia',{features:[]});
  console.log('PASS: Prism glass centered/unclipped 44px header controls and transparent title wrappers at 1440px/390px; card geometry, hover lift, stationary discussions, nested table colors, focus, media, reduced motion and Original restoration. Screenshots: dist/prism-{desktop,course,calendar,mobile}.png');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await set('modern');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/late-shadow.html`});
  await until(`window.lateFixture?.ready`);
  await until(`window.lateFixture.card.shadowRoot.querySelector('style[data-brightspace-theme]')!==null`);
  await evaluate(`window.lateFixture.replace()`);
  await until(`window.lateFixture.card.shadowRoot.querySelector('style[data-brightspace-theme]')!==null`);
  assert.notEqual(await evaluate(`getComputedStyle(window.lateFixture.card).backgroundColor`),'rgb(255, 255, 255)');
  console.log('PASS: six delayed nested roots after window load with no registry; first-visit styling and recovery from template replacement.');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/preview/registry-null.html`});
  await until(`document.readyState==='complete' && !!document.querySelector('#existing')?.shadowRoot`);
  assert.equal(await evaluate(`customElements`),null);
  await set('dark');
  await until(`!!document.querySelector('#existing').shadowRoot.querySelector('style[data-brightspace-theme]')`);
  await until(`!!document.querySelector('late-registry-card').shadowRoot?.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#existing')).backgroundColor`),'rgb(28, 37, 48)');
  await evaluate(`document.querySelector('#dynamic').append(document.createElement('d2l-card'))`);
  await until(`!!document.querySelector('#dynamic d2l-card').shadowRoot.querySelector('style[data-brightspace-theme]')`);
  await set('original');
  await until(`!document.querySelector('#existing').shadowRoot.querySelector('style[data-brightspace-theme]')`);
  await set('warm');
  await until(`getComputedStyle(document.querySelector('#existing')).backgroundColor==='rgb(255, 247, 232)'`);
  console.log('PASS: null customElements registry; unknown element before cards does not abort scan; asynchronous root, dynamic card, Original cleanup and re-enable work without runtime errors.');
  assert.deepEqual(errors,[]);
  console.log('PASS: real Chrome fixture; three themes, popup selection/toggle, persistence on reload, HTML frame sync, dynamic and nested open shadows, original/off cleanup, focus, dialog, original media colors; no runtime exceptions.');
  console.log('Screenshots: dist/preview-{dark,dim,warm}.png');
  console.log('PASS: dashboard regression; hardcoded/adopted white card hosts, slotted title, navigation strip/dropdowns, shadow navigation surfaces, transparent logo backing, all three themes and Original restoration. Screenshots: dist/dashboard-{dark,dim,warm}.png');
} finally {
  clearTimeout(deadline);
  socket?.close(); browser.kill(); server.close();
  console.log(`Temporary browser profile (safe to remove after Chrome exits): ${profile}`);
}
