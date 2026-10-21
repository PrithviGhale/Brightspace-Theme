(() => {
  'use strict';
  if (globalThis.BrightWidgetAllowed === false) return;
  const prefs = BrightPreferences;
  const embedded = typeof window !== 'undefined' && window.top !== window;
  const engine = BrightTheme.create(document, { embedded });
  let state = { ...prefs.DEFAULTS };
  const initialPatch = {};
  // Subscribe before reading so a slow initial read cannot overwrite a newer change.
  prefs.subscribe(patch => {
    Object.assign(initialPatch, patch);
    state = prefs.normalize({ ...state, ...patch });
    engine.apply(prefs.effective(state));
  });
  prefs.read().then(value => {
    state = prefs.normalize({ ...value, ...initialPatch });
    engine.apply(prefs.effective(state));
  }).catch(() => engine.apply(Object.keys(initialPatch).length ? prefs.effective(state) : 'original'));
})();
