(() => {
  'use strict';
  const prefs = BrightPreferences;
  const version = chrome.runtime?.getManifest?.().version;
  document.querySelector('#version').textContent = version ? `v${version}` : 'Local preview';
  const enabled = document.querySelector('#enabled');
  const fieldset = document.querySelector('#themes');
  const status = document.querySelector('#status');
  const radios = [...document.querySelectorAll('[name="theme"]')];
  let state = { ...prefs.DEFAULTS };
  const initialPatch = {};
  let writes = Promise.resolve();
  const names = { dark: 'Dark', dim: 'Dim', warm: 'Warm / sepia', original: 'Original' };
  function render() {
    enabled.checked = state.enabled;
    for (const radio of radios) radio.checked = radio.value === state.theme;
    status.textContent = !state.enabled ? 'Off · Your chosen theme is remembered.' : state.theme === 'original' ? 'Original appearance · No theme overrides.' : `${names[state.theme]} · Applied to open Brightspace tabs.`;
  }
  function save(patch) {
    state = prefs.normalize({ ...state, ...patch });
    render();
    // Serialize rapid keyboard changes without dropping the last selection.
    writes = writes.then(() => prefs.write(patch)).catch(() => {
      status.textContent = 'Could not save. Reopen the popup and try again.';
    });
  }
  prefs.subscribe(patch => { Object.assign(initialPatch, patch); state = prefs.normalize({ ...state, ...patch }); render(); });
  prefs.read().then(value => {
    state = prefs.normalize({ ...value, ...initialPatch });
    render(); enabled.disabled = false; fieldset.disabled = false;
  }).catch(() => { status.textContent = 'Could not load preferences. Reopen the popup to retry.'; });
  enabled.addEventListener('change', () => save({ enabled: enabled.checked }));
  for (const radio of radios) radio.addEventListener('change', () => {
    if (radio.checked) save({ theme: radio.value });
  });
})();
