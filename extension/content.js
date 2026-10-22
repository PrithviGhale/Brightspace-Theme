(() => {
  'use strict';
  if (globalThis.BrightWidgetAllowed === false) return;
  const prefs = BrightPreferences;
  const embedded = typeof window !== 'undefined' && window.top !== window;
  const engine = BrightTheme.create(document, { embedded });
  let state = { ...prefs.DEFAULTS };
  // Only handle a user's ordinary text copy. Never read existing clipboard data
  // or change the live page/styles to produce a document-friendly selection.
  document.addEventListener?.('copy', event => {
    if (!state.enabled || event.defaultPrevented || !event.clipboardData) return;
    const active=document.activeElement;
    if(active?.matches('input,textarea'))return; // Native controls already copy plain text.
    const selection=document.getSelection();
    if(!selection || selection.isCollapsed || !selection.rangeCount)return;
    const text=selection.toString();
    if(!text)return; // Preserve normal image/file copy behavior.
    try {
      const wrapper=document.createElement('div');
      const allowed=new Set(['P','DIV','SPAN','BR','H1','H2','H3','H4','H5','H6','STRONG','B','EM','I','U','S','DEL','SUB','SUP','UL','OL','LI','BLOCKQUOTE','PRE','CODE','TABLE','THEAD','TBODY','TFOOT','TR','TH','TD','CAPTION','A','HR']);
      for(let i=0;i<selection.rangeCount;i++)wrapper.append(selection.getRangeAt(i).cloneContents());
      for(const node of [...wrapper.querySelectorAll('*')]) {
        if(['SCRIPT','STYLE','LINK','META','NOSCRIPT','IFRAME','OBJECT','EMBED'].includes(node.tagName)){node.remove();continue;}
        const href=node.tagName==='A'?node.getAttribute('href'):null;
        const numeric={};
        for(const attr of ['colspan','rowspan','start','value'])if(node.hasAttribute(attr)&&/^\d{1,4}$/.test(node.getAttribute(attr)))numeric[attr]=node.getAttribute(attr);
        for(const attr of [...node.attributes])node.removeAttribute(attr.name);
        if(!allowed.has(node.tagName)){node.replaceWith(...node.childNodes);continue;}
        if(href){try{const url=new URL(href,document.baseURI);if(['https:','http:','mailto:'].includes(url.protocol))node.setAttribute('href',url.href);}catch{}}
        for(const [key,value] of Object.entries(numeric))node.setAttribute(key,value);
      }
      // Explicit neutral ink prevents the themed foreground from being captured
      // by rich-paste serializers. The destination chooses the font family.
      wrapper.setAttribute('style','color: #000000; background-color: transparent; font-family: inherit;');
      event.clipboardData.setData('text/html',wrapper.outerHTML);
      event.clipboardData.setData('text/plain',text);
      event.preventDefault();
    } catch { /* Leave the browser's native copy intact if selection cloning fails. */ }
  });
  const initialPatch = {};
  // Subscribe before reading so a slow initial read cannot overwrite a newer change.
  prefs.subscribe(patch => {
    Object.assign(initialPatch, patch);
    state = prefs.normalize({ ...state, ...patch });
    engine.apply(prefs.effective(state), state.customPalette);
  });
  // Paint the default theme at document_start while the saved choice loads.
  // This avoids showing the unthemed dashboard on a fresh navigation. The
  // storage read below immediately replaces it with the user's saved setting.
  engine.apply(prefs.effective(state), state.customPalette);
  prefs.read().then(value => {
    state = prefs.normalize({ ...value, ...initialPatch });
    engine.apply(prefs.effective(state), state.customPalette);
  }).catch(() => engine.apply(Object.keys(initialPatch).length ? prefs.effective(state) : 'original', state.customPalette));
})();
