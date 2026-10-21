/* Shared by isolated content scripts and the popup. No page data is accessed. */
(() => {
  'use strict';
  const THEMES = Object.freeze(['dark', 'dim', 'warm', 'original']);
  const DEFAULTS = Object.freeze({ enabled: true, theme: 'dark' });
  function normalize(value) {
    return {
      enabled: typeof value?.enabled === 'boolean' ? value.enabled : DEFAULTS.enabled,
      theme: THEMES.includes(value?.theme) ? value.theme : DEFAULTS.theme
    };
  }
  globalThis.BrightPreferences = Object.freeze({
    THEMES, DEFAULTS, normalize,
    effective: value => { const p = normalize(value); return p.enabled ? p.theme : 'original'; },
    async read() { return normalize(await chrome.storage.local.get(DEFAULTS)); },
    async write(patch) {
      // Separate keys avoid overwriting an unrelated simultaneous toggle/theme change.
      const safe = {};
      if (typeof patch.enabled === 'boolean') safe.enabled = patch.enabled;
      if (THEMES.includes(patch.theme)) safe.theme = patch.theme;
      await chrome.storage.local.set(safe);
    },
    subscribe(callback) {
      const listener = (changes, area) => {
        if (area !== 'local') return;
        const patch = {};
        for (const key of ['enabled', 'theme']) {
          if (Object.hasOwn(changes, key)) patch[key] = changes[key].newValue ?? DEFAULTS[key];
        }
        if (Object.keys(patch).length) callback(patch);
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  });
})();
