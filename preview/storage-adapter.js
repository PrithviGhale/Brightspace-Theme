/* Preview only. This file is never included in the extension ZIP. */
(() => {
  const key = 'after-hours-preview';
  const listeners = new Set();
  function read() { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
  function notify(old, next) {
    const changes = {};
    for (const name of ['enabled', 'theme']) if (old[name] !== next[name]) changes[name] = { oldValue: old[name], newValue: next[name] };
    if (Object.keys(changes).length) for (const listener of listeners) listener(changes, 'local');
  }
  window.chrome = { storage: {
    local: {
      async get(defaults) { return { ...defaults, ...read() }; },
      async set(patch) { const old = read(); const next = { ...old, ...patch }; localStorage.setItem(key, JSON.stringify(next)); notify(old, next); }
    },
    onChanged: { addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn) }
  } };
  window.addEventListener('storage', event => {
    if (event.key === key) notify(JSON.parse(event.oldValue || '{}'), JSON.parse(event.newValue || '{}'));
  });
})();
