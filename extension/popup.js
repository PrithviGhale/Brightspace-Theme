(() => {
  'use strict';
  const prefs = BrightPreferences;
  const version = chrome.runtime?.getManifest?.().version;
  document.querySelector('#version').textContent = version ? `v${version}` : 'Local preview';
  const enabled = document.querySelector('#enabled');
  const fieldset = document.querySelector('#themes');
  const status = document.querySelector('#status');
  const moreButton = document.querySelector('#more-themes');
  const morePanel = document.querySelector('#more-panel');
  const radios = [...document.querySelectorAll('[name="theme"]')];
  const liquidMode=document.querySelector('#liquid-mode');
  const extraThemes = new Set(['ocean','forest','rose','midnight-city','sunset','aurora','custom','modern','liquid','liquid-clear','liquid-dark']);
  const names = { dark:'Dark', dim:'Dim', warm:'Warm / sepia', original:'Original', ocean:'Ocean', forest:'Forest', rose:'Rose', 'midnight-city':'Midnight City', sunset:'Sunset City', aurora:'Aurora', custom:'Custom colors', modern:'Prism glass', liquid:'Liquid Glass · Default', 'liquid-clear':'Liquid Glass · Transparent', 'liquid-dark':'Liquid Glass · Dark', 'hello-kitty':'Hello Kitty', kuromi:'Kuromi', 'my-melody':"My Melody",'sugarbunnies':"Sugarbunnies",'attack-on-titan':"Attack on Titan",'genshin':"Genshin Impact",miffy:'Miffy',totoro:'My Neighbor Totoro' };
  let state = prefs.normalize({});
  const copyStatus=document.querySelector('#copy-status');
  function renderCopy(value) {
    if(!value||!Number.isFinite(value.at))return;
    copyStatus.dataset.result=value.status;
    const time=new Date(value.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    copyStatus.textContent=value.status==='normalized'?`Copy helper ran · v${value.version} · ${time}. Sent black text on white.`:`Copy reached v${value.version} at ${time}, but no selection was readable.`;
  }
  chrome.storage.local.get({copyStatus:null}).then(value=>renderCopy(value.copyStatus)).catch(()=>{});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.copyStatus)renderCopy(changes.copyStatus.newValue);});
  document.querySelector('#copy-clean').addEventListener('click',async()=>{
    const button=document.querySelector('#copy-clean');button.disabled=true;
    try {
      const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
      const payload=await chrome.tabs.sendMessage(tab.id,{type:'copy-clean-selection'});
      if(!payload?.text||!payload?.html)throw new Error('Select text in Brightspace first.');
      await navigator.clipboard.write([new ClipboardItem({'text/plain':new Blob([payload.text],{type:'text/plain'}),'text/html':new Blob([payload.html],{type:'text/html'})})]);
      await chrome.storage.local.set({copyStatus:{version,status:'normalized',at:Date.now()}});
      copyStatus.textContent='Copied directly: black text on white. Now paste normally.';
      copyStatus.dataset.result='normalized';
    } catch { copyStatus.textContent='Select text in Brightspace, open this popup, then try Copy selection cleanly. If blocked, use Ctrl+C and check this status.'; }
    finally {button.disabled=false;}
  });
  const initialPatch = {};
  let writes = Promise.resolve();
  function setMore(open) {
    moreButton.setAttribute('aria-expanded', String(open));
    morePanel.hidden = !open;
    moreButton.querySelector('.arrow').textContent = open ? '⌃' : '⌄';
  }
  function render() {
    enabled.checked = state.enabled;
    for (const radio of radios) radio.checked = radio.value==='liquid' ? state.theme.startsWith('liquid') : radio.value === state.theme;
    if(state.theme.startsWith('liquid'))liquidMode.value=state.theme;
    for (const input of document.querySelectorAll('[data-color]')) input.value = state.customPalette[input.dataset.color];
    if (extraThemes.has(state.theme)) setMore(true);
    status.textContent = !state.enabled ? 'Off · Your chosen theme is remembered.' : state.theme === 'original' ? 'Original appearance · No theme overrides.' : `${names[state.theme]} · Applied to open Brightspace tabs.`;
  }
  function save(patch) {
    state = prefs.normalize({ ...state, ...patch });
    render();
    writes = writes.then(() => prefs.write(patch)).catch(() => { status.textContent = 'Could not save. Reopen the popup and try again.'; });
  }
  function luminance(hex) {
    const rgb = hex.slice(1).match(/../g).map(value => parseInt(value,16)/255).map(value => value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4);
    return .2126*rgb[0] + .7152*rgb[1] + .0722*rgb[2];
  }
  function contrast(a,b) { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
  moreButton.addEventListener('click', () => setMore(moreButton.getAttribute('aria-expanded') !== 'true'));
  prefs.subscribe(patch => { Object.assign(initialPatch, patch); state = prefs.normalize({ ...state, ...patch }); render(); });
  prefs.read().then(value => {
    state = prefs.normalize({ ...value, ...initialPatch });
    render(); enabled.disabled = false; fieldset.disabled = false;
  }).catch(() => { status.textContent = 'Could not load preferences. Reopen the popup to retry.'; });
  enabled.addEventListener('change', () => save({ enabled: enabled.checked }));
  for (const radio of radios) radio.addEventListener('change', () => { if (radio.checked) save({ theme: radio.value==='liquid'?liquidMode.value:radio.value }); });
  liquidMode.addEventListener('change',()=>save({theme:liquidMode.value}));
  for (const input of document.querySelectorAll('[data-color]')) input.addEventListener('input', () => {
    const candidate = { ...state.customPalette, [input.dataset.color]: input.value };
    const readable = ['bg','surface','raised'].every(bg => contrast(candidate.text,candidate[bg]) >= 4.5 && contrast(candidate.muted,candidate[bg]) >= 4.5 && contrast(candidate.link,candidate[bg]) >= 4.5)
      && ['bg','surface','raised'].every(bg => contrast(candidate.focus,candidate[bg]) >= 3);
    if (!readable) {
      input.value = state.customPalette[input.dataset.color];
      status.textContent = 'That color would reduce text or focus contrast. Choose a higher-contrast color.';
      return;
    }
    save({ customPalette: candidate, theme: 'custom' });
  });
  setMore(false);
  const updateStatus=document.querySelector('#update-status');
  const refresh=document.querySelector('#refresh-updates');
  let updateSequence=0;
  function showUpdate(info) {
    document.querySelector('#update-dot').hidden=!info?.available;
    document.querySelector('#release-label').textContent=info?.available?`Get v${info.latestVersion} ↗`:'Releases ↗';
    updateStatus.textContent=info?.available?`New update: v${info.latestVersion}${info.failed?' · Last check offline.':''}`
      :info?.failed?'Could not check. Try again later.':info?.checkedAt?'You’re up to date.':'Checking for updates…';
    updateStatus.classList.toggle('available',info?.available===true);
  }
  async function checkUpdates(force=false) {
    if(!chrome.runtime?.sendMessage){updateStatus.textContent='Update checks are available in the installed extension.';refresh.disabled=true;return;}
    const sequence=++updateSequence;
    refresh.disabled=true;
    try { const info=await chrome.runtime.sendMessage({type:'check-updates',force});if(sequence===updateSequence)showUpdate(info); }
    catch { if(sequence===updateSequence)showUpdate({failed:true}); }
    finally { if(sequence===updateSequence)refresh.disabled=false; }
  }
  refresh.addEventListener('click',()=>checkUpdates(true));
  checkUpdates();
})();
