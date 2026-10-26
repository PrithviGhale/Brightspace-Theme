/* Shared by isolated content scripts and the popup. No page data is accessed. */
(() => {
  'use strict';
  const THEMES = Object.freeze(['dark', 'dim', 'warm', 'original', 'ocean', 'forest', 'rose', 'midnight-city', 'sunset', 'aurora', 'custom', 'modern', 'liquid', 'liquid-clear', 'liquid-dark', 'hello-kitty', 'kuromi', 'my-melody','sugarbunnies','attack-on-titan','genshin','miffy','totoro']);
  const DEFAULT_PALETTE = Object.freeze({ bg:'#171b2c', surface:'#222943', raised:'#303a5c', text:'#f2f2ff', muted:'#c2c6dc', link:'#9ad9ff', border:'#7382a8', focus:'#ffd27a', danger:'#ffb6b6', success:'#a5e7c2', scheme:'dark' });
  const DEFAULTS = Object.freeze({ enabled: true, performanceMode: false, theme: 'dark', customPalette: DEFAULT_PALETTE });
  const COLORS = Object.freeze(['bg','surface','raised','text','muted','link','border','focus','danger','success']);
  function normalizePalette(value) {
    const result = {};
    for (const key of COLORS) result[key] = /^#[\da-f]{6}$/i.test(value?.[key] || '') ? value[key].toLowerCase() : DEFAULT_PALETTE[key];
    result.scheme = 'dark';
    return result;
  }
  function normalize(value) {
    return {
      enabled: typeof value?.enabled === 'boolean' ? value.enabled : DEFAULTS.enabled,
      performanceMode: value?.performanceMode === true,
      theme: THEMES.includes(value?.theme) ? value.theme : DEFAULTS.theme,
      customPalette: normalizePalette(value?.customPalette)
    };
  }
  globalThis.BrightPreferences = Object.freeze({
    THEMES, DEFAULTS, normalize,
    effective: value => { const p = normalize(value); return p.enabled ? p.theme : 'original'; },
    async read() { return normalize(await chrome.storage.local.get(DEFAULTS)); },
    async write(patch) {
      // Separate keys avoid overwriting an unrelated simultaneous toggle/theme change.
      const safe = {};
      if (typeof patch.performanceMode === 'boolean') safe.performanceMode = patch.performanceMode;
      if (typeof patch.enabled === 'boolean') safe.enabled = patch.enabled;
      if (THEMES.includes(patch.theme)) safe.theme = patch.theme;
      if (patch.customPalette && typeof patch.customPalette === 'object') safe.customPalette = normalizePalette(patch.customPalette);
      await chrome.storage.local.set(safe);
    },
    subscribe(callback) {
      const listener = (changes, area) => {
        if (area !== 'local') return;
        const patch = {};
        for (const key of ['enabled', 'theme', 'customPalette', 'performanceMode']) {
          if (Object.hasOwn(changes, key)) patch[key] = changes[key].newValue ?? DEFAULTS[key];
        }
        if (Object.keys(patch).length) callback(patch);
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  });
})();
