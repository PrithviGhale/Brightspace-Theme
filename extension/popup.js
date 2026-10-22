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
  const extraThemes = new Set(['ocean','forest','rose','midnight-city','sunset','aurora','custom']);
  const names = { dark:'Dark', dim:'Dim', warm:'Warm / sepia', original:'Original', ocean:'Ocean', forest:'Forest', rose:'Rose', 'midnight-city':'Midnight City', sunset:'Sunset City', aurora:'Aurora', custom:'Custom colors' };
  let state = prefs.normalize({});
  const initialPatch = {};
  let writes = Promise.resolve();
  function setMore(open) {
    moreButton.setAttribute('aria-expanded', String(open));
    morePanel.hidden = !open;
    moreButton.querySelector('.arrow').textContent = open ? '⌃' : '⌄';
  }
  function render() {
    enabled.checked = state.enabled;
    for (const radio of radios) radio.checked = radio.value === state.theme;
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
  for (const radio of radios) radio.addEventListener('change', () => { if (radio.checked) save({ theme: radio.value }); });
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
})();
