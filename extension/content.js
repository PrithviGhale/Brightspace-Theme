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
  // Paint the default theme at document_start while the saved choice loads.
  // This avoids showing the unthemed dashboard on a fresh navigation. The
  // storage read below immediately replaces it with the user's saved setting.
  engine.apply(prefs.effective(state));
  prefs.read().then(value => {
    state = prefs.normalize({ ...value, ...initialPatch });
    engine.apply(prefs.effective(state));
  }).catch(() => engine.apply(Object.keys(initialPatch).length ? prefs.effective(state) : 'original'));
})();
