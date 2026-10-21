/* CSS-only recoloring; DOM inspection discovers element/shadow structure only. */
(() => {
  'use strict';
  const palettes = Object.freeze({
    dark: { bg: '#121820', surface: '#1c2530', raised: '#283545', text: '#e7edf5', muted: '#b5c2d2', link: '#92caff', border: '#687e95', focus: '#ffd580', danger: '#ffb2b2', success: '#a4dfb4', scheme: 'dark' },
    dim: { bg: '#252b34', surface: '#303945', raised: '#3b4756', text: '#f0f2f6', muted: '#c4ceda', link: '#a9d6ff', border: '#8291a3', focus: '#ffe19c', danger: '#ffc1c1', success: '#b5ecc3', scheme: 'dark' },
    warm: { bg: '#f3ead8', surface: '#fff7e8', raised: '#e8dcc4', text: '#382d23', muted: '#665441', link: '#235786', border: '#8b775e', focus: '#833e00', danger: '#9a2020', success: '#285f35', scheme: 'light' }
  });
  const variables = `
    --d2l-color-regolith: var(--bs-surface); --d2l-color-sylvite: var(--bs-raised);
    --d2l-color-gypsum: var(--bs-raised); --d2l-color-mica: var(--bs-border);
    --d2l-color-corundum: var(--bs-border); --d2l-color-chromite: var(--bs-muted);
    --d2l-color-galena: var(--bs-muted); --d2l-color-tungsten: var(--bs-text);
    --d2l-color-ferrite: var(--bs-text); --d2l-color-celestine: var(--bs-link);
    --d2l-color-celestine-minus-1: var(--bs-link); --d2l-color-celestine-plus-2: var(--bs-raised);
    --d2l-theme-background-color-base: var(--bs-surface);
    --d2l-theme-background-color-elevated: var(--bs-surface);
    --d2l-theme-background-color-floating: var(--bs-raised);
    --d2l-theme-background-color-sunken: var(--bs-bg);
    --d2l-theme-background-color-interactive-primary-default: var(--bs-link);
    --d2l-theme-background-color-interactive-primary-hover: var(--bs-link);
    --d2l-theme-background-color-interactive-secondary-default: var(--bs-raised);
    --d2l-theme-background-color-interactive-secondary-hover: var(--bs-surface);
    --d2l-theme-background-color-interactive-faint-default: var(--bs-surface);
    --d2l-theme-background-color-interactive-faint-hover: var(--bs-raised);
    --d2l-theme-background-color-interactive-highlighted: var(--bs-raised);
    --d2l-theme-border-color-standard: var(--bs-border);
    --d2l-theme-border-color-subtle: var(--bs-border);
    --d2l-theme-border-color-emphasized: var(--bs-border);
    --d2l-theme-border-color-focus: var(--bs-focus);
    --d2l-theme-brand-color-primary-default: var(--bs-link);
    --d2l-theme-brand-color-primary-hover: var(--bs-link);
    --d2l-theme-brand-color-highlight: var(--bs-raised);
    --d2l-theme-text-color-interactive-default: var(--bs-link);
    --d2l-theme-text-color-interactive-hover: var(--bs-link);
    --d2l-theme-text-color-static-standard: var(--bs-text);
    --d2l-theme-text-color-static-subtle: var(--bs-muted);
    --d2l-theme-text-color-static-faint: var(--bs-muted);
    --d2l-theme-text-color-static-inverted: var(--bs-bg);
    --d2l-theme-text-color-static-disabled: var(--bs-muted);
    --d2l-theme-icon-color-standard: var(--bs-text);
    --d2l-theme-status-color-error: var(--bs-danger);
    --d2l-theme-status-color-default: var(--bs-link);
    --d2l-theme-status-color-success: var(--bs-success);
    --d2l-theme-status-color-success-text: var(--bs-success);
    --d2l-theme-status-color-warning: var(--bs-focus);
    --d2l-theme-status-color-warning-text: var(--bs-focus);
  `;
  const rules = `
    :where(html) { background-color: var(--bs-bg) !important; color: var(--bs-text) !important; }
    :where(body) { background-color: var(--bs-bg) !important; color: var(--bs-text) !important; }
    :where(main, header, footer, nav, aside, article, section, dialog, [role="dialog"], [role="menu"], [role="listbox"], [role="tooltip"], .d2l-page-main, .d2l-page-header, .d2l-navigation, .d2l-navigation-s, .d2l-widget, .d2l-widget-content, .d2l-dialog, .d2l-dialog-inner, .d2l-menu, .d2l-dropdown-content, .d2l-htmlblock, .d2l-richtext, .d2l-box, .d2l-twopanelselector-side, .d2l-twopanelselector-main) {
      background-color: var(--bs-surface) !important; color: var(--bs-text) !important; border-color: var(--bs-border) !important;
    }
    /* D2L cards hardcode white on the custom-element host, outside their content div. */
    :where(d2l-card, d2l-enrollment-card, .d2l-card, .d2l-card-content, .d2l-card-footer,
      .d2l-enrollment-card, .d2l-enrollment-card-content,
      .d2l-navigation-s-main, .d2l-navigation-s-main-wrapper,
      .d2l-navigation-s-header, .d2l-navigation-s-footer,
      .d2l-navigation-main-header, .d2l-navigation-main-footer,
      .d2l-branding-navigation-background-color,
      d2l-navigation-main-header, d2l-navigation-main-footer,
      d2l-labs-navigation-main-header, d2l-labs-navigation-main-footer) {
      background-color: var(--bs-surface) !important;
      color: var(--bs-text) !important;
      border-color: var(--bs-border) !important;
    }
    :where(.d2l-navigation-s-logo, .d2l-navigation-s-logo-link, .d2l-navigation-s-logo-image) {
      background-color: transparent !important;
    }
    /* A tight contour keeps dark logo lettering readable without a rectangular plate.
       This is restricted to navigation branding, never profile photos or course media. */
    :where(.d2l-navigation-s-logo img, img.d2l-navigation-s-logo-image) {
      filter: var(--bs-logo-contour) !important;
    }
    :is(.d2l-navigation-s-main, .d2l-navigation-s-main-wrapper, .d2l-navigation-main-footer)
      :where(button, [role="button"]) {
      background-color: transparent !important;
      color: var(--bs-link) !important;
    }
    :where(h1,h2,h3,h4,h5,h6,p,span,div,label,legend,li,dt,dd,blockquote,strong,em,small,summary,caption) { color: inherit !important; }
    :where(p,span,label,legend,li,dt,dd,blockquote,strong,em,small) { background-color: transparent !important; }
    :where(h1,h2,h3,h4,h5,h6) { color: var(--bs-text) !important; }
    :where(div,p,span,section,article,td,th,font)[style*="color"], :where(font[color]) { color: var(--bs-text) !important; }
    :where(div,p,span,section,article,td,th)[style*="background"], :where([bgcolor]) { background-color: var(--bs-surface) !important; }
    :where(a, a:visited, [role="link"], .d2l-link) { color: var(--bs-link) !important; }
    :where(a:hover) { text-decoration: underline !important; }
    :where(input:not([type="image"]),select,textarea,button,[role="button"]:not(.d2l-imagelink),summary,.d2l-button) {
      background-color: var(--bs-raised) !important; color: var(--bs-text) !important;
      border-color: var(--bs-border) !important; accent-color: var(--bs-link);
    }
    :where(input,textarea)::placeholder { color: var(--bs-muted) !important; opacity: 1; }
    :where(button,[role="button"]:not(.d2l-imagelink)):hover { background-color: var(--bs-surface) !important; }
    /* Legacy profile handles are image controls, not filled action buttons. Keep
       their native photo/placeholder paint, sizing and hover/focus behavior. */
    :where(.d2l-user-profile-handle-image, .d2l-imagelink[role="button"]) {
      background-color: transparent !important;
    }
    :where(:disabled,[aria-disabled="true"]) { opacity: .65; }
    :where(table,thead,tbody,tfoot,tr,td,th) { background-color: var(--bs-surface) !important; color: var(--bs-text) !important; border-color: var(--bs-border) !important; }
    /* Brightspace uses <th> for both column headings and body row labels.
       Set the surface token on each cell so nested HTML-block shadow roots
       inherit the exact row tone instead of drawing darker text backplates. */
    :where(td, th) { --bs-surface: var(--bs-panel); }
    :where(tbody > tr:nth-child(even) > td, tbody > tr:nth-child(even) > th,
      thead > tr > td, thead > tr > th, th[scope="col"], th.d_hch) {
      --bs-surface: var(--bs-raised);
    }
    :where(pre, code, kbd) { background-color: var(--bs-raised) !important; color: var(--bs-text) !important; }
    /* Shared by embedded assignment views, feedback cards and both attachment UIs. */
    :where(.d2l-panel, .d2l-fileinput, .d2l-filedrop, .d2l-filedrop-default-style,
      .d2l-fileinput-file, .d2l-fileinput-list, .d2l-fileinput-upload-progress-container) {
      background-color: var(--bs-surface) !important;
      color: var(--bs-text) !important;
      border-color: var(--bs-border) !important;
    }
    :where(hr,fieldset) { border-color: var(--bs-border) !important; }
    :where(.d2l-validation-error,[role="alert"],[aria-invalid="true"]) { color: var(--bs-danger) !important; }
    :where(.d2l-success) { color: var(--bs-success) !important; }
    /* Observed legacy discussion and content surfaces; do not recolor arbitrary divs. */
    :where(.d2l-le-disc-post, .d2l-le-disc-post-border, .d2l-le-disc-post-unread,
      .d2l-le-disc-reply, .d2l-le-disc-topic, .d2l-discussion-post,
      .d2l-user-profile-card, .d2l-user-profile-card-content,
      .d2l-floating-container, .d2l-dialog-body, .d2l-datalist-item,
      .d2l-collapsepane-content, .d2l-le-TreeAccordionItem,
      [role="tabpanel"], [role="tablist"]) {
      background-color: var(--bs-surface) !important;
      color: var(--bs-text) !important;
      border-color: var(--bs-border) !important;
    }
    :where(.d2l-textblock-secondary, .d2l-body-small) { color: var(--bs-muted) !important; }
    :where(d2l-icon) { color: var(--bs-muted) !important; }
    :where([role="tab"]) { background-color: var(--bs-surface) !important; color: var(--bs-text) !important; border-color: var(--bs-border) !important; }
    :where([role="tab"][aria-selected="true"]) { background-color: var(--bs-raised) !important; color: var(--bs-link) !important; }
    :where(.rsbtn_play, .rsbtn_left, .rsbtn_right, .rsbtn_exp) { background-color: var(--bs-raised) !important; color: var(--bs-text) !important; border-color: var(--bs-border) !important; }
    /* Inspected Calendar, Progress, ePortfolio and settings panels. */
    :where(.d2l-column-side-bg, .d2l-column-flip-side, .d2l-column-side,
      .d2l-datalist-item-content, .d2l-box-layout, .dco_c,
      .d2l-floating-buttons-container, .d2l-editable-placeholder,
      .d2l-partial-render-shim1, .d2l-partial-render-shim2,
      .d2l-box > div > div:has(textarea.d2l-longedit-autoresize)) {
      background-color: var(--bs-surface) !important;
      color: var(--bs-text) !important;
      border-color: var(--bs-border) !important;
    }
    :where(.vui-button) { background-color: var(--bs-raised) !important; color: var(--bs-text) !important; border-color: var(--bs-border) !important; }
    .d2l-button-filter-selected { background-color: var(--bs-link) !important; color: var(--bs-bg) !important; border-color: var(--bs-link) !important; }
    /* Menu rows and panels need paired foreground/background overrides. */
    :where(d2l-menu, d2l-menu-item, d2l-menu-item-link, [role="menuitem"],
      .d2l-menu-items, .dropdown-content, .dropdown-content-layout,
      .d2l-navigation-s-personal-menu-wrapper) {
      background-color: var(--bs-surface) !important;
      color: var(--bs-link) !important;
      border-color: var(--bs-border) !important;
    }
    :where(d2l-menu-item:hover, d2l-menu-item-link:hover, [role="menuitem"]:hover) { background-color: var(--bs-raised) !important; }
    :where(.d2l-htmleditor-container, .tox, .tox-editor-header, .tox-toolbar,
      .tox-toolbar__primary, .tox-toolbar-overlord, .tox-menubar, .tox-statusbar,
      .tox-edit-area, .tox-edit-area__iframe, .tox-menu, .tox-dialog) {
      background-color: var(--bs-surface) !important;
      color: var(--bs-text) !important;
      border-color: var(--bs-border) !important;
    }
    :where(.tox-tbtn, .tox-mbtn, .tox-collection__item) { background-color: var(--bs-surface) !important; color: var(--bs-text) !important; }
    :where(.tox-tbtn:hover, .tox-mbtn:hover, .tox-collection__item--active, .tox-tbtn--enabled) { background-color: var(--bs-raised) !important; color: var(--bs-link) !important; }
    /* Only editor-control glyphs use currentColor; authored SVG/media are untouched. */
    :where(.tox-tbtn, .tox-mbtn) svg { fill: currentColor !important; }
    :focus-visible { outline: 3px solid var(--bs-focus) !important; outline-offset: 3px !important; }
    /* An inset ring remains visible inside the menu's clipping boundary. */
    [role="menuitem"]:focus-visible { outline-offset: -4px !important; }
    ::selection { background: var(--bs-link); color: var(--bs-bg); }
  `;
  function css(theme, shadow = false, embedded = false) {
    const p = palettes[theme];
    if (!p) return '';
    const tokens = `--bs-panel:${p.surface};--bs-logo-contour:${theme === 'warm' ? 'none' : 'drop-shadow(0 0 .5px #f4f6f9) drop-shadow(0 0 1px #f4f6f9)'};` + Object.entries(p).filter(([key]) => key !== 'scheme').map(([key,value]) => `--bs-${key}:${value};`).join('');
    const hostSurfaces = shadow ? `
      :host(d2l-card), :host(d2l-enrollment-card),
      :host(d2l-navigation-main-header), :host(d2l-navigation-main-footer),
      :host(d2l-labs-navigation-main-header), :host(d2l-labs-navigation-main-footer) {
        background-color: var(--bs-surface) !important;
        color: var(--bs-text) !important;
        border-color: var(--bs-border) !important;
      }
      :host(d2l-card) ::slotted([slot="content"]) { color: var(--bs-text) !important; }
      :host(d2l-menu-item), :host(d2l-menu-item-link) {
        background-color: var(--bs-surface) !important;
        color: var(--bs-link) !important;
        border-color: var(--bs-border) !important;
      }
      :host(d2l-menu-item:hover), :host(d2l-menu-item-link:hover) { background-color: var(--bs-raised) !important; }
      :host(d2l-menu-item) a, :host(d2l-menu-item-link) a { background-color: transparent !important; }
      :host(d2l-menu-item) a:hover, :host(d2l-menu-item-link) a:hover { text-decoration: none !important; }
      :host(d2l-menu-item:focus-visible), :host(d2l-menu-item-link:focus-visible) {
        outline: 3px solid var(--bs-focus) !important;
        outline-offset: -4px !important;
      }
      :host(d2l-tab) { color: var(--bs-text) !important; background-color: var(--bs-surface) !important; }
      :host(d2l-tab[selected]) { color: var(--bs-link) !important; background-color: var(--bs-raised) !important; }
      :host(d2l-labs-navigation-link-image.d2l-navigation-s-logo),
      :host(d2l-labs-navigation-link-image.d2l-navigation-s-logo) a,
      :host(d2l-labs-navigation-link-image.d2l-navigation-s-logo) .d2l-labs-navigation-link-image-container {
        background-color: transparent !important;
      }
      :host(d2l-labs-navigation-link-image.d2l-navigation-s-logo) img {
        filter: var(--bs-logo-contour) !important;
      }
      /* Navigation triggers are transparent controls, not filled action buttons. */
      :host(d2l-labs-navigation-button-icon) button,
      :host(d2l-labs-navigation-dropdown-button-icon) button,
      :host(d2l-labs-navigation-dropdown-button-custom) button,
      :host(d2l-labs-navigation-dropdown-button) button {
        background-color: transparent !important;
        color: var(--bs-text) !important;
        border-color: transparent !important;
      }
      :host(d2l-labs-navigation-button-icon) button:hover,
      :host(d2l-labs-navigation-dropdown-button-icon) button:hover,
      :host(d2l-labs-navigation-dropdown-button-custom) button:hover,
      :host(d2l-labs-navigation-dropdown-button) button:hover {
        background-color: var(--bs-raised) !important;
      }
      /* The two approved widget families expose these fixed-color surfaces. */
      :host(d2l-custom-grade-widget-main) .main-container,
      :host(d2l-discussion-activity-widget-main) .discussion-list,
      :host(d2l-discussion-activity-widget-main) .discussion-item,
      :host(d2l-discussion-activity-widget-main) .tabs-container,
      :host(d2l-discussion-activity-widget-main) .threads,
      :host(d2l-discussion-activity-widget-tab) .tab {
        background-color: var(--bs-surface) !important;
        color: var(--bs-text) !important;
        border-color: var(--bs-border) !important;
      }
      :host(d2l-discussion-activity-widget-tab) .tab.is-active {
        background-color: var(--bs-raised) !important;
        color: var(--bs-link) !important;
      }
      :host(d2l-custom-grade-widget-main) .progress { background-color: var(--bs-raised) !important; }
      :host(d2l-custom-grade-widget-main) .current-grade-progress-bar { background-color: var(--bs-link) !important; }
      :host(d2l-custom-grade-widget-main) .grade-separator { border-color: var(--bs-border) !important; }
    ` : '';
    // Nested HTML/widget documents should blend into their containing course widget.
    const frameToken = embedded && !shadow ? `--bs-bg:${p.surface};` : '';
    return `${shadow ? ':host' : ':root'} { ${shadow ? '' : tokens} ${frameToken} ${variables} color-scheme:${p.scheme}; color:var(--bs-text); }\n${rules}\n${hostSurfaces}`;
  }
  function create(doc, { embedded = false } = {}) {
    let theme = 'original';
    let queued = false;
    let readyObserver = null;
    let discoveryFrame = null;
    const pending = new Set();
    const roots = new Map();
    const waiting = new WeakSet();
    let checkedWithoutRegistry = new WeakSet();
    const deferredHosts = new Set();
    const startupHosts = new Set();
    const view = doc.defaultView;
    function checkStartupHosts() {
      const hosts = [...startupHosts];
      if (doc.readyState === 'complete') startupHosts.clear();
      if (theme === 'original') return;
      for (const host of hosts) if (host.isConnected) {
        // A definition script may finish after the initial render check. Each
        // startup event allows one fresh post-render check of unresolved hosts.
        checkedWithoutRegistry.delete(host);
        inspect(host);
      }
    }
    function checkNextFrame(element) {
      if (checkedWithoutRegistry.has(element)) return;
      checkedWithoutRegistry.add(element);
      deferredHosts.add(element);
      if (doc.readyState !== 'complete') startupHosts.add(element);
      if (discoveryFrame !== null) return;
      // Isolated extension worlds may expose no CustomElementRegistry at all.
      // One batched check after the first render frame, never a polling loop.
      discoveryFrame = view.requestAnimationFrame(() => {
        discoveryFrame = view.requestAnimationFrame(() => {
          discoveryFrame = null;
          const hosts = [...deferredHosts];
          deferredHosts.clear();
          if (theme === 'original') return;
          for (const host of hosts) if (host.isConnected) inspect(host);
        });
      });
    }
    function register(root) {
      if (roots.has(root)) return;
      const style = doc.createElement('style');
      style.dataset.brightspaceTheme = 'after-hours';
      style.textContent = css(theme, root !== doc, embedded);
      const observer = new view.MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (node.nodeType === 1 && node !== style) pending.add(node);
        }
        if (!queued && pending.size) {
          queued = true;
          view.queueMicrotask(flush);
        }
      });
      roots.set(root, { style, observer });
      (root === doc ? doc.documentElement : root).append(style);
      observer.observe(root, { childList: true, subtree: true });
    }
    function inspect(element) {
      if (element.shadowRoot) {
        startupHosts.delete(element);
        if (!roots.has(element.shadowRoot)) {
          register(element.shadowRoot);
          scan(element.shadowRoot);
        }
      } else if (element.localName.includes('-') && !waiting.has(element)) {
        const registry = view.customElements;
        if (typeof registry?.get !== 'function' || typeof registry?.whenDefined !== 'function') {
          checkNextFrame(element);
        } else if (!registry.get(element.localName)) {
          waiting.add(element);
          registry.whenDefined(element.localName).then(() => {
            waiting.delete(element);
            if (theme === 'original' || !element.isConnected) return;
            // A single post-upgrade check; never poll for roots.
            view.requestAnimationFrame(() => {
              if (theme !== 'original' && element.isConnected) inspect(element);
            });
          });
        } else {
          // A defined component may attach its root on its first asynchronous render.
          checkNextFrame(element);
        }
      }
    }
    function scan(node) {
      if (node.nodeType === 1) inspect(node);
      const walker = doc.createTreeWalker(node, 1);
      while (walker.nextNode()) inspect(walker.currentNode);
    }
    function flush() {
      queued = false;
      if (theme === 'original') { pending.clear(); return; }
      // Drop descendant entries: their added ancestor will already visit them.
      for (const node of pending) {
        if (!node.isConnected) continue;
        let parent = node.parentNode;
        while (parent && !pending.has(parent)) parent = parent.parentNode;
        if (!parent) scan(node);
      }
      pending.clear();
      for (const [root, entry] of roots) {
        if (root !== doc && !root.host.isConnected) {
          entry.observer.disconnect(); entry.style.remove(); roots.delete(root);
        }
      }
    }
    function apply(next) {
      if (readyObserver) { readyObserver.disconnect(); readyObserver = null; }
      next = palettes[next] ? next : 'original';
      if (next === theme) return;
      const wasOriginal = theme === 'original';
      theme = next;
      if (next === 'original') {
        if (discoveryFrame !== null) view.cancelAnimationFrame(discoveryFrame);
        discoveryFrame = null;
        deferredHosts.clear(); startupHosts.clear();
        checkedWithoutRegistry = new WeakSet();
        doc.removeEventListener('DOMContentLoaded', checkStartupHosts);
        view.removeEventListener('load', checkStartupHosts);
        for (const {style, observer} of roots.values()) { observer.disconnect(); style.remove(); }
        roots.clear(); pending.clear();
      } else if (wasOriginal) {
        if (!doc.documentElement) {
          theme = 'original';
          readyObserver = new view.MutationObserver(() => {
            if (!doc.documentElement) return;
            apply(next);
          });
          readyObserver.observe(doc, {childList: true});
          return;
        }
        if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', checkStartupHosts, {once:true});
        if (doc.readyState !== 'complete') view.addEventListener('load', checkStartupHosts, {once:true});
        register(doc); scan(doc);
      } else {
        for (const [root, {style}] of roots) style.textContent = css(theme, root !== doc, embedded);
      }
    }
    return Object.freeze({ apply });
  }
  globalThis.BrightTheme = Object.freeze({ create, css, palettes });
})();
