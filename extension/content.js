(() => {
  'use strict';
  if (globalThis.BrightWidgetAllowed === false) return;
  const prefs = BrightPreferences;
  const embedded = typeof window !== 'undefined' && window.top !== window;
  const engine = BrightTheme.create(document, { embedded });
  let state = { ...prefs.DEFAULTS };
  function selectedText(event) {
    const active=document.activeElement;
    if(active?.matches('input[type="password"]'))return '';
    if(active?.matches('iframe'))return '';
    if(active?.matches('input,textarea')) {
      const start=active.selectionStart,end=active.selectionEnd;
      return typeof start==='number'&&typeof end==='number'&&end>start?active.value.slice(start,end):'';
    }
    const scopes=[document,...(event?.composedPath?.()||[]).map(node=>node?.shadowRoot).filter(Boolean)];
    for(const scope of scopes){
      const selection=scope.getSelection?.();
      if(selection&&!selection.isCollapsed&&selection.rangeCount&&selection.toString())return selection.toString();
    }
    return '';
  }
  function recordCopy(status) {
    // Metadata only: never retain copied text, source URLs or names.
    chrome.storage.local.set({copyStatus:{version:chrome.runtime?.getManifest?.().version||'preview',status,at:Date.now()}}).catch(()=>{});
  }
  function cleanHtml(text) {
    const ink='color:#000000!important;background-color:#ffffff!important;-webkit-text-fill-color:#000000!important;text-shadow:none!important;font-family:inherit;mso-highlight:none;mso-shading:white;';
    const wrapper=document.createElement('div');wrapper.setAttribute('style',ink);
    for(const line of text.split(/\r\n|\r|\n/)) {
      const p=document.createElement('div'),span=document.createElement('span'),font=document.createElement('font');
      for(const node of [p,span,font])node.setAttribute('style',ink);
      font.setAttribute('color','#000000');
      if(line)font.textContent=line;else font.append(document.createElement('br'));
      span.append(font);p.append(span);wrapper.append(p);
    }
    return wrapper.outerHTML;
  }
  globalThis.chrome?.runtime?.onMessage?.addListener((message,sender,reply)=>{
    if(sender.id===chrome.runtime.id&&sender.url===chrome.runtime.getURL('popup.html')&&message?.type==='read-brightspace-page'){
      if(!embedded&&location.hostname==='learn.snhu.edu')reply(BrightPageText.read(document));
      return;
    }
    if(sender.id!==chrome.runtime.id||sender.url!==chrome.runtime.getURL('popup.html')||message?.type!=='copy-clean-selection'||!state.enabled)return;
    const text=selectedText();
    if(text)reply({text,html:cleanHtml(text)});
  });
  // Stop later editor keyboard serializers, but allow the native Copy action.
  (document.defaultView || document).addEventListener?.('keydown',event=>{
    if(state.enabled&&(event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&event.key?.toLowerCase()==='c'&&selectedText(event))event.stopImmediatePropagation();
  },true);
  // Explicit ink on every text run also resets an already-colored destination.
  // Plain text remains available for applications that request that format.
  (document.defaultView || document).addEventListener?.('copy', event => {
    if (!state.enabled || !event.clipboardData) return;
    const text=selectedText(event);
    if(!text){recordCopy('no-selection');return;}
    try {
      event.clipboardData.clearData();
      event.clipboardData.setData('text/plain',text);
      event.clipboardData.setData('text/html',cleanHtml(text));
      event.preventDefault();
      event.stopImmediatePropagation();
      recordCopy('normalized');
    } catch { /* Preserve native copy if the browser rejects clipboard writes. */ }
  }, true);
  const initialPatch = {};
  // Subscribe before reading so a slow initial read cannot overwrite a newer change.
  prefs.subscribe(patch => {
    Object.assign(initialPatch, patch);
    state = prefs.normalize({ ...state, ...patch });
    engine.apply(prefs.effective(state), state.customPalette, state.performanceMode);
  });
  // Paint the default theme at document_start while the saved choice loads.
  // This avoids showing the unthemed dashboard on a fresh navigation. The
  // storage read below immediately replaces it with the user's saved setting.
  engine.apply(prefs.effective(state), state.customPalette, state.performanceMode);
  prefs.read().then(value => {
    state = prefs.normalize({ ...value, ...initialPatch });
    engine.apply(prefs.effective(state), state.customPalette, state.performanceMode);
  }).catch(() => engine.apply(Object.keys(initialPatch).length ? prefs.effective(state) : 'original', state.customPalette, state.performanceMode));
})();
