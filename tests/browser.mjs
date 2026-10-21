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
  for (const [theme,expected,frameColor] of [['dark','rgb(18, 24, 32)','rgb(28, 37, 48)'],['dim','rgb(37, 43, 52)','rgb(48, 57, 69)'],['warm','rgb(243, 234, 216)','rgb(255, 247, 232)']]) {
    await set(theme);
    await until(`getComputedStyle(document.querySelector('.content').contentDocument.body).backgroundColor === ${JSON.stringify(frameColor)}`);
    assert.equal(await bg(),expected);
    const colors=await evaluate(`(()=>{const s=document.querySelector('demo-card').shadowRoot;return [getComputedStyle(s.querySelector('section')).backgroundColor,getComputedStyle(s.querySelector('a')).color,getComputedStyle(document.querySelector('a span')).color,getComputedStyle(document.querySelector('a span').parentNode).color]})()`);
    assert.notEqual(colors[0],'rgb(255, 255, 255)');
    assert.equal(colors[2],colors[3]);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`preview-${theme}.png`),Buffer.from(r.data,'base64')));
  }
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
    assert.equal(await evaluate(`getComputedStyle(document.documentElement).backgroundColor`), await bg(),`${theme}: viewport must not retain a light background`);
    await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>writeFile(path.join(root,'dist',`dashboard-${theme}.png`),Buffer.from(r.data,'base64')));
  }
  await set('original');
  await until(`!document.querySelector('d2l-card').shadowRoot.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('d2l-card')).backgroundColor`),'rgb(255, 255, 255)');
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
  for(const theme of ['dark','dim','warm','original']) {
    await set(theme);
    await until(`!!document.querySelector('style[data-brightspace-theme]') === ${theme!=='original'}`);
    const photos=await evaluate(`(()=>{const imgs=[...document.querySelectorAll('img'),...document.querySelector('d2l-profile-image-base').shadowRoot.querySelectorAll('img')];return imgs.map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect(),root=e.getRootNode();return {loaded:e.complete&&e.naturalWidth>0,filter:s.filter,opacity:s.opacity,visibility:s.visibility,width:r.width,height:r.height,uncovered:root.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}})})()`);
    for(const photo of photos){assert(photo.loaded&&photo.uncovered,`${theme}: loaded photo is the painted hit target`);assert(photo.width>0&&photo.height>0);assert.equal(photo.filter,'none');assert.equal(photo.opacity,'1');assert.equal(photo.visibility,'visible');}
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
