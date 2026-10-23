// Render the real theme engine on fictional versions of every supported surface family.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {serve,root} from '../tools/preview-server.mjs';
const worldBackgrounds={"hello-kitty":"#fce8ee","kuromi":"#151020","my-melody":"#f8eaf0","sugarbunnies":"#f5eddf","attack-on-titan":"#171d19","genshin":"#20182f","miffy":"#f4ead8","totoro":"#dfe4d3"};
const themes=Object.keys(worldBackgrounds);
const server=await serve();
const profile=await mkdtemp(path.join(root,'dist','chrome-test-'));
const browser=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const deadline=setTimeout(()=>{browser.kill();server.close();process.exit(1);},150000);
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
  async function set(theme){await evaluate(`chrome.storage.local.set({enabled:true,theme:'${theme}'})`);await until(`getComputedStyle(document.documentElement).getPropertyValue('--bs-liquid-glass').trim()!==''`);await until(`getComputedStyle(document.documentElement).getPropertyValue('--bs-bg').trim()==='${worldBackgrounds[theme]}'`);
    assert(await evaluate(`(async()=>{const root=document.querySelector('style[data-brightspace-theme]');const urls=[...root.textContent.matchAll(/url\\("([^"\\n]+)"\\)/g)].map(m=>m[1]).filter(u=>u.includes('/extension/art/'));return (await Promise.all([...new Set(urls)].map(u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i.naturalWidth>0);i.onerror=()=>r(false);i.src=u})))).every(Boolean)})()`),`${theme}: all document artwork loads`);
  }
  const shot=async name=>{await evaluate(`document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(root,'dist',`${name}.png`),Buffer.from(r.data,'base64'));};
  await cdp('Runtime.enable');await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await go('redesign');
  for(const theme of themes) {
    await set(theme);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[aria-labelledby="native-photo-heading"]')).display`),'none','Native photo banner hidden without removing course images');
    assert(await evaluate(`document.querySelector('.d2l-homepage-pageheader').getBoundingClientRect().height<230`),'Welcome is compact');
    if(['hello-kitty','kuromi'].includes(theme)) {
      assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.d2l-homepage-pageheader')).backgroundImage`),'none','Cute welcome has a card backing');
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-homepage-pageheader'),'::after').width`),'144px','Character art sits inside the welcome card');
    }
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
      if(theme==='genshin'&&view==='calendar'){
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-widget:has(.month-grid)'),'::after').pointerEvents`),'none','Paimon cannot block calendar interaction');
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-widget:has(.month-grid)'),'::after').height`),'150px');
        await evaluate(`scrollTo(0,document.documentElement.scrollHeight)`);
        await shot('genshin-calendar-footer');
        await evaluate(`scrollTo(0,0)`);
      }
    }
    await evaluate(`document.querySelector('nav [data-view="dashboard"]').click()`);
    const controls=await evaluate(`[...document.querySelectorAll('d2l-labs-navigation-dropdown-button-icon,d2l-labs-navigation-dropdown-button-custom')].map(e=>{const b=e.shadowRoot.querySelector('button'),r=b.getBoundingClientRect(),p=document.querySelector('.header-inner').getBoundingClientRect();return {height:r.height,offset:Math.abs(r.y+r.height/2-p.y-p.height/2)}})`);
    for(const c of controls){assert.equal(c.height,44);assert(c.offset<1);}
    assert.equal(await evaluate(`document.querySelector('d2l-labs-navigation-dropdown-button-icon').shadowRoot.querySelector('d2l-icon').getBoundingClientRect().height`),32,'Native header icons are consistently enlarged');
    if(['genshin','attack-on-titan','sugarbunnies','totoro'].includes(theme)){
      assert(await evaluate(`getComputedStyle(document.querySelector('.d2l-homepage-pageheader'),'::after').maskImage.includes('linear-gradient')`),'Photo welcome art fades into the panel color');
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-homepage-pageheader'),'::after').pointerEvents`),'none');
    }
    assert.equal(await evaluate(`getComputedStyle(document.body,'::before').animationName`),'none');
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
  // Reproduce native course-home markup: the h1 exists but is offscreen.
  // Its wrappers have zero native height and must never acquire banner spacing.
  await go('redesign');
  await evaluate(`(()=>{const s=document.createElement('style');s.textContent='.d2l-offscreen{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important}';document.head.append(s);document.querySelector('.d2l-homepage-pageheader').innerHTML='<div class="d2l-box-layout"><div class="d2l-box"><h1 class="d2l-page-title d2l-offscreen">Example course</h1></div></div>';history.pushState({},'','/d2l/home/12345');dispatchEvent(new PopStateEvent('popstate'));})()`);
  for(const theme of await evaluate(`BrightPreferences.THEMES.filter(t=>t!=='original')`)){
    await evaluate(`chrome.storage.local.set({enabled:true,theme:'${theme}'})`);
    await until(`document.querySelector('style[data-brightspace-theme]').textContent===BrightTheme.css('${theme}',false,false,BrightPreferences.DEFAULTS.customPalette)`);
    assert.equal(await evaluate(`document.querySelector('.d2l-homepage-pageheader').getBoundingClientRect().height`),0,`${theme}: offscreen course heading must not create a box or gap`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-homepage-pageheader'),'::after').display`),'none',`${theme}: no decorative course header`);
    assert.equal(await evaluate(`document.querySelector('h1.d2l-offscreen').textContent`),'Example course','Accessible title retained');
    if(['genshin','hello-kitty','warm','dark','miffy'].includes(theme))await shot(`${theme}-course-home`);
  }
  // Switching to ordinary appearances restores the native dashboard image.
  await go('redesign');
  for(const theme of await evaluate(`BrightPreferences.THEMES.filter(t=>t!=='original')`)){
    await evaluate(`chrome.storage.local.set({enabled:true,theme:'${theme}'})`);
    await until(`document.querySelector('style[data-brightspace-theme]').textContent===BrightTheme.css('${theme}',false,false,BrightPreferences.DEFAULTS.customPalette)`);
    const character=themes.includes(theme);
    assert(await evaluate(`(()=>{const h=document.querySelector('d2l-labs-navigation-link-icon').shadowRoot.querySelector('a').getBoundingClientRect(),row=document.querySelector('.header-inner').getBoundingClientRect();return Math.abs(h.y+h.height/2-row.y-row.height/2)<1})()`),theme+': home link centered in the full native header height');

    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[aria-labelledby="native-photo-heading"]')).display==='none'`),character,`${theme}: native image hidden only for character themes`);
    if(!character)assert(await evaluate(`document.querySelector('.d2l-homepage-pageheader').getBoundingClientRect().height<150`),'Ordinary greeting has natural height');
    assert(await evaluate(`[...document.querySelectorAll('d2l-labs-navigation-dropdown-button-icon,d2l-labs-navigation-link-icon')].every(host=>{const icon=host.shadowRoot.querySelector('d2l-icon').getBoundingClientRect(),button=host.shadowRoot.querySelector('button,a').getBoundingClientRect();return icon.width===32&&icon.height===32&&icon.left>=button.left&&icon.right<=button.right&&icon.top>=button.top&&icon.bottom<=button.bottom})`),`${theme}: equally sized, visible navigation glyphs stay inside their controls`);
  }
  // Actual navigation component attributes, nested glyph roots, and alert badge.
  await set('genshin');
  for(const [icon,file] of [['tier3:email','mail'],['tier3:discussions','chat'],['tier3:notification-bell','notices']]){
    assert(await evaluate(`(()=>{const host=document.querySelector('d2l-labs-navigation-dropdown-button-icon[icon="${icon}"]'),glyph=host.shadowRoot.querySelector('d2l-icon');return getComputedStyle(glyph).backgroundImage.includes('genshin-${file}.png')&&getComputedStyle(glyph.shadowRoot.querySelector('svg')).opacity==='0'})()`),`${icon}: game glyph replaces only the original artwork`);
    await evaluate(`document.querySelector('d2l-labs-navigation-dropdown-button-icon[icon="${icon}"]').shadowRoot.querySelector('button').click()`);
    assert.equal(await evaluate(`document.querySelector('d2l-labs-navigation-dropdown-button-icon[icon="${icon}"]').shadowRoot.querySelector('button').getAttribute('aria-expanded')`),'true','Native opener remains clickable');
  }
  assert(await evaluate(`(()=>{const host=document.querySelector('d2l-labs-navigation-link-icon'),g=host.shadowRoot.querySelector('d2l-icon');return getComputedStyle(g).backgroundImage.includes('genshin-home.png')&&!!host.shadowRoot.querySelector('a[aria-label="My Home"]')})()`),'Paimon home keeps native link');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[has-alert]').shadowRoot.querySelector('.alert')).display`),'block','Native alert badge retained');
  await shot('genshin-navigation');
  await set('miffy');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[icon="tier3:email"]').shadowRoot.querySelector('d2l-icon').shadowRoot.querySelector('svg')).opacity`),'1','Switching themes restores the native glyph');
  // Observed legacy submission tables and ddial_o2 shell, using fictional text.
  await go('submission-native');
  await until(`document.querySelector('iframe').contentDocument?.querySelector('style[data-brightspace-theme]')`);
  const formMarkup=await evaluate(`document.querySelector('#d2l_form').innerHTML`);
  await evaluate(`document.querySelector('#comments').value='Fictional draft retained across themes';`);
  for(const theme of await evaluate(`BrightPreferences.THEMES.filter(t=>t!=='original')`)){
    await evaluate(`chrome.storage.local.set({enabled:true,theme:'${theme}'})`);
    await until(`document.querySelector('style[data-brightspace-theme]').textContent===BrightTheme.css('${theme}',false,false,BrightPreferences.DEFAULTS.customPalette)`);
    assert.equal(await evaluate(`document.documentElement.dataset.bsPage`),'submission');
    assert(await evaluate(`(()=>{const a=document.querySelector('.d2l-dropbox-submissiontext').getBoundingClientRect(),b=document.querySelector('#d2l_form > div > table.d_FG').getBoundingClientRect();return Math.abs(a.width-b.width)<1&&Math.abs(a.left-b.left)<1})()`),`${theme}: instruction and submission panels align`);
    assert(await evaluate(`[...document.querySelectorAll('#d2l_form table.d_FG td')].every(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(e).getPropertyValue('--bs-surface')===getComputedStyle(document.documentElement).getPropertyValue('--bs-panel'))`),`${theme}: no zebra striping on native form tables`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-page-header'),'::after').display`),'none','No floating character beside assignment title');
    assert.equal(await evaluate(`document.querySelector('#comments').value`),'Fictional draft retained across themes');
    assert.equal(await evaluate(`document.querySelector('#d2l_form').innerHTML`),formMarkup,'Theming leaves form contents unchanged');
    if(['kuromi','genshin','warm','liquid-dark'].includes(theme)){
      await evaluate(`scrollTo(0,0)`);
      await shot(`${theme}-submission-native`);
      const {cssContentSize}=await cdp('Page.getLayoutMetrics');
      const full=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:cssContentSize.width,height:cssContentSize.height,scale:1}});
      await writeFile(path.join(root,'dist',`${theme}-submission-full.png`),Buffer.from(full.data,'base64'));
    }
    await evaluate(`document.querySelector('#add-file').click()`);
    await until(`document.querySelector('iframe').contentDocument.querySelector('style[data-brightspace-theme]').textContent===BrightTheme.css('${theme}',false,true,BrightPreferences.DEFAULTS.customPalette)`);
    assert(await evaluate(`(()=>{const shell=document.querySelector('.ddial_o2'),frame=document.querySelector('iframe').contentDocument;return getComputedStyle(shell).backgroundColor===frame.defaultView.getComputedStyle(frame.body).backgroundColor&&getComputedStyle(shell).backgroundColor===getComputedStyle(document.querySelector('.d2l-dropbox-submissiontext')).backgroundColor})()`),`${theme}: file dialog shell, frame and page share the correct surface`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.ddial_o2')).borderTopColor`),await evaluate(`getComputedStyle(document.querySelector('.d2l-dropbox-submissiontext')).borderTopColor`),'Dialog rim follows the theme border');
    if(['kuromi','genshin','warm','liquid-dark'].includes(theme))await shot(`${theme}-file-dialog`);
    await evaluate(`document.querySelector('#cancel-file').click()`);
    assert(await evaluate(`document.querySelector('.ddial_o').hidden&&document.activeElement.id==='add-file'`),'Closing restores focus to the native opener');
  }
  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});
  assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false,'Native submission panels fit narrow screens');
  assert(await evaluate(`[...document.querySelectorAll('.fl_n label')].every(e=>e.getBoundingClientRect().height<30)`),'Mobile form labels remain on one line');
  await shot('submission-native-mobile');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await evaluate(`chrome.storage.local.set({theme:'original'})`);
  await until(`!document.querySelector('style[data-brightspace-theme]')&&!document.querySelector('iframe').contentDocument.querySelector('style[data-brightspace-theme]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.ddial_o2')).backgroundColor`),'rgb(255, 255, 255)','Original restores the native dialog shell');
  for(const file of ['course-surfaces','menu-settings','submission-tables','profiles']) {
    await go(file);
    for(const theme of themes) {
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
  // Mirror observed Brightspace widget selectors, without preview-only names.
  await go('redesign');await set('genshin');
  await evaluate(`(()=>{const courses=document.querySelector('.courses-widget');courses.classList.remove('courses-widget');courses.append(document.createElement('d2l-my-courses-v2'));const cal=document.querySelector('.d2l-widget:has(.week-strip)');cal.querySelector('.week-strip').className='';cal.querySelectorAll('.d2l-calendar-event').forEach(e=>e.className='');cal.querySelector('h2').innerHTML='<a href="/d2l/le/calendar/6606">Calendar</a>';})()`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-widget:has(d2l-my-courses-v2)'),'::before').height`),'auto','Removed character strip stays absent');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.d2l-widget:has(a[href*="/calendar/"])'),'::after').height`),'150px','Actual calendar link identifies Paimon widget');
  await shot('genshin-native-widgets');
  await evaluate(`(()=>{const h=document.querySelector('.d2l-page-header');h.classList.remove('d2l-homepage-pageheader');h.innerHTML='<div class="d2l-box-layout" style="display:flex;align-items:center;justify-content:space-between;width:100%"><h1>Assignments</h1><button id="native-help">Help</button></div>';history.pushState({},'', '/d2l/lms/dropbox/user/folders_list.d2l');document.dispatchEvent(new Event('fixture-route'));h.append(document.createElement('span'));})()`);
  await until(`document.documentElement.dataset.bsPage==='assignments'`);
  assert(await evaluate(`document.querySelector('.d2l-page-header').getBoundingClientRect().height<110`),'Tool heading must not become a huge banner');
  assert(await evaluate(`(()=>{const h=document.querySelector('.d2l-page-header').getBoundingClientRect(),b=document.querySelector('#native-help').getBoundingClientRect();return b.top>=h.top&&b.bottom<=h.bottom&&b.right<=h.right})()`),'Help remains contained beside title');
  assert(await evaluate(`getComputedStyle(document.documentElement).getPropertyValue('--bs-page-art').includes('genshin-fontaine')`));
  await evaluate(`document.querySelector('.dashboard-columns').innerHTML='<section class="d2l-widget" style="grid-column:1/-1"><div class="d2l-widget-content"><table class="d2l-table" style="width:100%"><thead><tr><th>Assignment</th><th>Status</th><th>Score</th></tr></thead><tbody><tr><td>Sample short paper</td><td>Submitted</td><td>60 / 60</td></tr><tr><td>Sample project draft</td><td>Feedback available</td><td>135 / 135</td></tr></tbody></table></div></section>'`);
  await shot('genshin-assignments-native');
  await evaluate(`history.pushState({},'', '/d2l/le/1/discussions/List');dispatchEvent(new PopStateEvent('popstate'))`);
  assert(await evaluate(`getComputedStyle(document.documentElement).getPropertyValue('--bs-page-art').includes('genshin-archons')`),'Discussion background differs from assignments');
  await evaluate(`chrome.storage.local.set({theme:'original'})`);
  await until(`!document.documentElement.hasAttribute('data-bs-page')`);
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('[aria-labelledby="native-photo-heading"]')).display`),'none','Original restores native banner');
  assert.deepEqual(errors,[]);
  console.log('PASS: 22-theme enlarged navigation, native submission/form preservation and file-dialog/frame surfaces; eight character worlds, photo banner fades, dashboard/course/calendar, discussions, grade/classlist tables, menus, photos, focus, desktop/mobile, reduced motion and Original cleanup. Screenshots dist/<theme>-*.png.');
}finally{clearTimeout(deadline);socket?.close();browser.kill();await new Promise(r=>server.close(r));}
