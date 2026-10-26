/* CSS-only recoloring; DOM inspection discovers element/shadow structure only. */
(() => {
  'use strict';
  const palettes = Object.freeze({
    dark: { bg: '#121820', surface: '#1c2530', raised: '#283545', text: '#e7edf5', muted: '#b5c2d2', link: '#92caff', border: '#687e95', focus: '#ffd580', danger: '#ffb2b2', success: '#a4dfb4', scheme: 'dark' },
    dim: { bg: '#252b34', surface: '#303945', raised: '#3b4756', text: '#f0f2f6', muted: '#c4ceda', link: '#a9d6ff', border: '#8291a3', focus: '#ffe19c', danger: '#ffc1c1', success: '#b5ecc3', scheme: 'dark' },
    warm: { bg: '#f3ead8', surface: '#fff7e8', raised: '#e8dcc4', text: '#382d23', muted: '#665441', link: '#235786', border: '#8b775e', focus: '#833e00', danger: '#9a2020', success: '#285f35', scheme: 'light' },
    ocean: { bg:'#10212b', surface:'#18313d', raised:'#244552', text:'#e5f7fa', muted:'#b1d0d6', link:'#77d9f5', border:'#5b929e', focus:'#ffd27a', danger:'#ffb3aa', success:'#a5e7c2', scheme:'dark' },
    forest: { bg:'#17231d', surface:'#22342a', raised:'#304637', text:'#edf5e9', muted:'#c3d3bd', link:'#a8e0b1', border:'#718e76', focus:'#f5ce73', danger:'#ffb6a9', success:'#b6e6a9', scheme:'dark' },
    rose: { bg:'#281b27', surface:'#392738', raised:'#4b3548', text:'#fff0f5', muted:'#e1c7d4', link:'#ffb4d2', border:'#9b7890', focus:'#ffe08a', danger:'#ffb0aa', success:'#a8e4c2', scheme:'dark' },
    modern: { bg:'#0c1021', surface:'#181f39', raised:'#283453', text:'#f3f4ff', muted:'#c0c9e2', link:'#b6cbff', border:'#7588b0', focus:'#9ff2e0', danger:'#ffb5c9', success:'#a2ebcc', scheme:'dark' },
    liquid: { bg:'#e8effb', surface:'#f8faff', raised:'#dce6f6', text:'#18253c', muted:'#425571', link:'#174b8a', border:'#7185a3', focus:'#1556a0', danger:'#9d2544', success:'#1e6049', scheme:'light' },
    'liquid-clear': { bg:'#e2eefa', surface:'#f3f8ff', raised:'#d6e3f3', text:'#18253c', muted:'#3b4f6b', link:'#174b8a', border:'#7185a3', focus:'#1556a0', danger:'#9d2544', success:'#1e6049', scheme:'light' },
    'liquid-dark': { bg:'#0c1625', surface:'#18293d', raised:'#263e56', text:'#eff7ff', muted:'#b9ccdf', link:'#b0dcff', border:'#7994b0', focus:'#8cf4de', danger:'#ffbecd', success:'#a3ebca', scheme:'dark' },
    'hello-kitty': { bg:'#fce8ee', surface:'#fff8f9', raised:'#f5dce5', text:'#492839', muted:'#714555', link:'#8c2850', border:'#ad7087', focus:'#9b2454', danger:'#a51d35', success:'#28634b', scheme:'light' },
    kuromi: { bg:'#151020', surface:'#241b36', raised:'#39294f', text:'#fbf1ff', muted:'#d2bce5', link:'#efb9eb', border:'#a38abb', focus:'#e5bcff', danger:'#ffb3ce', success:'#afe2cf', scheme:'dark' },
    'my-melody': { bg:'#f8eaf0',surface:'#fff9f6',raised:'#f1dde6',text:'#4e3145',muted:'#705064',link:'#863458',border:'#a67d90',focus:'#8e3864',danger:'#a02f49',success:'#34634b',scheme:'light' },
    sugarbunnies: { bg:'#f5eddf',surface:'#fffbf1',raised:'#ecdfc9',text:'#4a3527',muted:'#705441',link:'#80502b',border:'#a28466',focus:'#804a76',danger:'#9c3345',success:'#346248',scheme:'light' },
    'attack-on-titan': { bg:'#171d19',surface:'#252c25',raised:'#373f34',text:'#f7f1df',muted:'#d6d0b9',link:'#efcc8f',border:'#9a9d7c',focus:'#f5cd80',danger:'#ffb4a0',success:'#b9e2b1',scheme:'dark' },
    miffy: { bg:'#f4ead8',surface:'#fffaf0',raised:'#e8dfcf',text:'#292c30',muted:'#55575b',link:'#975025',border:'#53565a',focus:'#235482',danger:'#9d2834',success:'#35603d',scheme:'light' },
    totoro: { bg:'#dfe4d3',surface:'#f7f0dd',raised:'#dce0cc',text:'#293d32',muted:'#4c6151',link:'#395e39',border:'#849177',focus:'#7e4c26',danger:'#9a3540',success:'#335d3b',scheme:'light' },
    genshin: { bg:'#20182f',surface:'#30243f',raised:'#45344f',text:'#fff1f7',muted:'#e1c6df',link:'#b4ebf2',border:'#aa8db6',focus:'#f4d59b',danger:'#ffc1d0',success:'#b4e4cf',scheme:'dark' }
  });
  const customDefaults = { bg:'#171b2c', surface:'#222943', raised:'#303a5c', text:'#f2f2ff', muted:'#c2c6dc', link:'#9ad9ff', border:'#7382a8', focus:'#ffd27a', danger:'#ffb6b6', success:'#a5e7c2', scheme:'dark' };
  const themeScenes = Object.freeze({ 'midnight-city':'city-night', sunset:'city-sunset', aurora:'aurora' });
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
  const modernRules = `
    /* Prism glass: stable Brightspace surfaces, never layout tables or authored media. */
    :root, :host {
      --bs-design-line: rgba(164,181,255,.22); --bs-design-hover:#263452;
      --bs-design-glass:rgba(24,31,57,.88); --bs-design-shadow:0 16px 45px rgba(3,7,22,.24);
      --bs-nav-glass:rgba(24,31,57,.88); --bs-nav-line:rgba(164,181,255,.22);
      --bs-design-font:"Segoe UI Variable Text","Segoe UI",system-ui,sans-serif;
      font-family:var(--bs-design-font);
    }
    :where(body,.d2l-typography,button,input,select,textarea) { font-family:var(--bs-design-font)!important; }
    :where(h1,h2,h3,h4) { letter-spacing:-.025em!important; font-weight:650!important; }
    :where(h1.d2l-heading-1,.d2l-page-header h1,.d2l-page-title) {
      font-size:clamp(1.8rem,3.2vw,2.65rem)!important; letter-spacing:-.045em!important; line-height:1.15!important;
    }
    /* Native navigation order, labels, keyboard behavior and responsive collapse are retained. */
    :where(.d2l-navigation-s-main-wrapper,.d2l-navigation-s-header,.d2l-navigation-s-footer,
      .d2l-navigation-main-header,.d2l-navigation-main-footer) {
      background-color:var(--bs-design-glass)!important; border-color:var(--bs-design-line)!important;
    }
    :where(.d2l-navigation-s-main) { background-color:transparent!important; }
    :is(.d2l-navigation-s-main) :where(a:not(.d2l-navigation-s-logo-link),button) {
      display:inline-flex; align-items:center; gap:8px; padding:10px 14px!important;
      border-radius:12px!important; font-weight:600!important; text-decoration:none!important;
      transition:background-color .18s ease,box-shadow .18s ease;
    }
    :is(.d2l-navigation-s-main) :where(a:not(.d2l-navigation-s-logo-link):hover,button:hover) {
      background-color:var(--bs-design-hover)!important; box-shadow:inset 0 0 0 1px var(--bs-design-line);
    }
    :is(.d2l-navigation-s-main) [aria-current="page"] { background-color:#304068!important; color:#e5eaff!important; box-shadow:inset 0 0 0 1px #8299e2; }
    /* One glass surface per widget; internal wrappers do not gain nested shadows. */
    :where(.d2l-widget,.d2l-panel,.d2l-user-profile-card,dialog,.d2l-dialog-inner,[role="dialog"]) {
      background-color:var(--bs-design-glass)!important; border:1px solid var(--bs-design-line)!important;
      border-radius:24px!important; box-shadow:var(--bs-design-shadow)!important;
      background-image:linear-gradient(140deg,rgba(141,160,255,.07),transparent 58%)!important;
    }
    :where(.d2l-widget-content) {
      background-color:transparent!important; border:0!important; border-radius:0 0 24px 24px!important;
      box-shadow:none!important; padding:18px 22px 22px!important;
    }
    :where(.d2l-widget-header) { padding:20px 22px 0!important; }
    :where(.d2l-widget-header h2,.d2l-widget-header h3) { font-size:1.05rem!important; letter-spacing:-.015em!important; }
    :where(.d2l-le-disc-post,.d2l-le-disc-post-border,.d2l-le-disc-topic,.d2l-discussion-post) {
      border:1px solid var(--bs-design-line)!important; border-radius:20px!important; box-shadow:none!important;
    }
    :where(.d2l-le-disc-post:hover,.d2l-le-disc-topic:hover) { border-color:#738ec8!important; }
    :where(.d2l-le-disc-reply,.d2l-datalist-item-content,.d2l-box) { box-shadow:none!important; }
    :where(.d2l-user-profile-handle-image img,.d2l-badge-userprofile) { border-radius:12px!important; }
    :where(button,.d2l-button,.vui-button,[role="button"]:not(.d2l-imagelink),
      input[type="button"],input[type="submit"],select) {
      border-radius:12px!important;
      transition:background-color .18s ease,border-color .18s ease,box-shadow .18s ease!important;
    }
    :where(button:hover,.d2l-button:hover,.vui-button:hover,[role="button"]:not(.d2l-imagelink):hover,
      input[type="button"]:hover,input[type="submit"]:hover) {
      border-color:#9caff0!important; box-shadow:0 0 0 3px rgba(139,146,255,.1);
    }
    :where(.d2l-button-primary,d2l-button[primary]) {
      background:linear-gradient(115deg,#b6d8ff,#c8b6ff)!important; color:#10182e!important; border-color:transparent!important;
    }
    :where(input[type="text"],input[type="search"],input[type="email"],input[type="url"],
      input[type="password"],input[type="number"],textarea) {
      border-radius:12px!important; border-color:#697da7!important; box-shadow:inset 0 1px 3px rgba(0,0,0,.12);
    }
    :where(.d2l-filedrop,.d2l-filedrop-default-style) {
      border:1px dashed #8499ce!important; border-radius:18px!important; background-color:#1c2945!important;
    }
    :where(.d2l-menu,.d2l-dropdown-content,.dropdown-content,
      .d2l-navigation-s-personal-menu-wrapper:not([slot="opener"]),[role="menu"],[role="listbox"]) {
      border:1px solid var(--bs-design-line)!important; border-radius:18px!important;
      box-shadow:0 18px 50px rgba(0,3,18,.42)!important;
    }
    :where(d2l-menu-item,d2l-menu-item-link,[role="menuitem"]) {
      border-radius:10px!important; transition:background-color .16s ease!important;
    }
    :where([role="tablist"]) { border-radius:14px!important; padding:4px!important; gap:4px; }
    :where([role="tab"],d2l-tab) { border-radius:10px!important; }
    :where([role="tab"][aria-selected="true"],d2l-tab[selected]) {
      color:#e8e6ff!important; background-color:#34466c!important; box-shadow:inset 0 0 0 1px #7c8dce!important;
    }
    /* Data tables only. Layout tables and authored course tables keep their geometry. */
    :where(table.d2l-table,table.d_table) {
      border-collapse:separate!important; border-spacing:0!important;
      border:1px solid var(--bs-design-line)!important; border-radius:18px!important;
    }
    :where(table.d2l-table,table.d_table)>:is(thead,tbody,tfoot)>tr>:is(th,td) {
      border-color:var(--bs-design-line)!important; padding:15px 17px!important; vertical-align:top;
    }
    :where(table.d2l-table,table.d_table)>:is(thead,tbody)>tr>th[scope="col"],
    :where(table.d2l-table,table.d_table) .d_hch {
      color:#c5d3f5!important; font-size:.78rem!important; font-weight:650!important; letter-spacing:.035em;
    }
    :where(table.d2l-table,table.d_table)>tbody>tr>:is(td,th:not([scope="col"])) { --bs-surface:var(--bs-panel); }
    :where(table.d2l-table,table.d_table)>tbody>tr:hover>:is(td,th:not([scope="col"])) { --bs-surface:var(--bs-design-hover); }
    :where(.d2l-calendar-event,.d2l-notification-item) {
      border:1px solid var(--bs-design-line)!important; border-radius:14px!important; box-shadow:none!important;
    }
    :where(.d2l-calendar-event) { border-inline-start:3px solid #b9a5ff!important; }
    :where(.d2l-calendar-day,.d2l-calendar-day-cell,.d2l-calendar-date) { border-radius:10px!important; }
    :where(.d2l-calendar-day[aria-current="date"],.d2l-calendar-date[aria-current="date"]) {
      background-color:#34466c!important; box-shadow:inset 0 0 0 1px #8da5ef;
    }
    /* Full text opacity. Scroll entry and hover use separate transform properties. */
    @keyframes bs-prism-arrive { from { translate:0 12px; } to { translate:0 0; } }
    @supports (animation-timeline:view()) {
      @media (prefers-reduced-motion:no-preference) {
        :where(.d2l-widget) { animation:bs-prism-arrive linear both; animation-timeline:view(); animation-range:entry 0% entry 24%; }
      }
    }
    @media (prefers-reduced-motion:reduce) {
      :where(button,input,select,textarea,.d2l-button,.vui-button,[role="button"],
        .d2l-navigation-s-main a,d2l-menu-item,d2l-menu-item-link) { transition:none!important; }
      :where(.d2l-widget) { animation:none!important; translate:none!important; }
    }
  `;
  /* Shared navigation polish without changing native ordering or row heights. */
  const navigationRules = `
    :where(.d2l-navigation-s-header,.d2l-navigation-s-main-wrapper,.d2l-navigation-s-footer,
      .d2l-navigation-main-header,.d2l-navigation-main-footer) {
      background-color:var(--bs-nav-glass,var(--bs-surface))!important;
      border-color:var(--bs-nav-line,var(--bs-border))!important;
      box-shadow:none!important;
    }
    :where(.d2l-navigation-s-main,.d2l-branding-navigation-background-color) { background-color:transparent!important; }
    .d2l-navigation-s-main :where(a:not(.d2l-navigation-s-logo-link),button) {
      border-radius:999px!important; padding:10px 16px!important; font-weight:600!important;
      text-decoration:none!important; border-color:transparent!important;
      transition:box-shadow .2s ease!important;
    }
    .d2l-navigation-s-main :where(a:not(.d2l-navigation-s-logo-link):hover,button:hover,[aria-current="page"]) {
      background-color:var(--bs-raised)!important; box-shadow:inset 0 0 0 1px var(--bs-nav-line,var(--bs-border))!important;
    }
    :where(.d2l-navigation-s-notifications-wrapper,.d2l-navigation-s-course-menu,.d2l-navigation-s-personal-menu) {
      background-color:transparent!important; border-color:var(--bs-nav-line,var(--bs-border))!important;
    }
    :where(.d2l-navigation-s-separator) { opacity:.35; }
    /* This span is the profile opener, not the dropdown menu panel. */
    .d2l-navigation-s-personal-menu-wrapper[slot="opener"] {
      background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;
    }
    .d2l-page-header,
    .d2l-page-header :where(.d2l-box,.d2l-box-layout,.d2l-page-title-c,.d2l-page-title) {
      background-color:transparent!important; box-shadow:none!important;
      transition:box-shadow .2s ease,border-color .2s ease!important;
    }
    @supports (backdrop-filter:blur(20px)) {
      :where(.d2l-navigation-s-header,.d2l-navigation-s-main-wrapper) { backdrop-filter:blur(20px) saturate(1.3); }
    }
    @media(prefers-reduced-motion:reduce) { .d2l-navigation-s-main :where(a,button) { transition:none!important; } }
  `;
  const navigationHostRules = `
    :host(d2l-labs-navigation-main-header),:host(d2l-labs-navigation-main-footer),
    :host(d2l-navigation-main-header),:host(d2l-navigation-main-footer) {
      background-color:var(--bs-nav-glass,var(--bs-surface))!important; border-color:var(--bs-nav-line,var(--bs-border))!important;
    }
    :host(d2l-labs-navigation-button-icon),:host(d2l-labs-navigation-dropdown-button-icon),
    :host(d2l-labs-navigation-dropdown-button-custom),:host(d2l-labs-navigation-dropdown-button) {
      display:inline-flex!important; align-items:center!important; height:100%!important;
    }
    :host(d2l-labs-navigation-button-icon) button,:host(d2l-labs-navigation-dropdown-button-icon) button,
    :host(d2l-labs-navigation-dropdown-button-custom) button,:host(d2l-labs-navigation-dropdown-button) button {
      box-sizing:border-box!important; height:44px!important; min-height:44px!important; margin-block:auto!important;
      border:0!important; border-radius:999px!important; padding:6px 12px!important;
      background-color:transparent!important; box-shadow:none!important;
    }
    :host(d2l-labs-navigation-dropdown-button) button { box-shadow:none!important;border:0!important; }
    :host(d2l-labs-navigation-dropdown-button-custom) ::slotted([slot="opener"]) {
      background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;
    }
    :host(d2l-labs-navigation-button-icon) button,:host(d2l-labs-navigation-dropdown-button-icon) button {
      width:44px!important; min-width:44px!important; padding:6px!important; justify-content:center!important;
    }
    :host(d2l-labs-navigation-button-icon) button d2l-icon,:host(d2l-labs-navigation-dropdown-button-icon) button d2l-icon {
      width:32px!important;height:32px!important;flex-shrink:0!important;
    }
    :host(d2l-labs-navigation-link-icon[icon="tier1:home"]) { display:inline-flex!important;align-items:center!important;justify-content:center!important;height:100%!important;vertical-align:middle!important;box-sizing:border-box!important; }
    :host(d2l-labs-navigation-link-icon[icon="tier1:home"]) a { display:inline-flex!important;align-items:center!important;justify-content:center!important;width:44px!important;height:44px!important;margin-block:auto!important;flex:0 0 auto!important; }
    :host(d2l-labs-navigation-link-icon[icon="tier1:home"]) d2l-icon { width:32px!important;height:32px!important; }
    :host(d2l-labs-navigation-dropdown-button-icon) .icon-container { display:inline-flex!important;align-items:center!important;line-height:0; }
    :host(d2l-labs-navigation-button-icon) button:hover,:host(d2l-labs-navigation-dropdown-button-icon) button:hover,
    :host(d2l-labs-navigation-dropdown-button-custom) button:hover,:host(d2l-labs-navigation-dropdown-button) button:hover {
      background-color:var(--bs-raised)!important; border-color:var(--bs-nav-line,var(--bs-border))!important;
    }
  `;
  const modernCanvas = `
    body {
      background-image:radial-gradient(ellipse at 6% 2%,rgba(83,105,230,.25),transparent 48%),
        radial-gradient(ellipse at 94% 18%,rgba(157,77,218,.22),transparent 44%),
        radial-gradient(ellipse at 45% 100%,rgba(40,130,182,.13),transparent 50%)!important;
      background-attachment:fixed;
    }
    :where(.d2l-page-main,.d2l-page-header,.d2l-column-side,.d2l-column-main) { background-color:transparent!important; border-color:transparent!important; box-shadow:none!important; }
    /* The legacy title uses nested table-like layout boxes. They are spacing
       wrappers, not panels; keep the canvas visible behind every title row. */
    .d2l-page-header,
    .d2l-page-header :where(.d2l-box,.d2l-box-layout,.d2l-page-title-c,.d2l-page-title) {
      background-color:transparent!important; box-shadow:none!important;
    }
    @supports (backdrop-filter:blur(16px)) {
      :where(.d2l-navigation-s-header,.d2l-navigation-s-main-wrapper) { backdrop-filter:blur(16px); }
    }
  `;
  const modernHostRules = `
    :host(d2l-card) {
      border:1px solid var(--bs-design-line)!important; border-radius:28px!important;
      background-color:var(--bs-design-glass)!important; box-shadow:0 12px 32px rgba(3,7,22,.18)!important;
      background-image:linear-gradient(145deg,rgba(141,160,255,.09),transparent 62%)!important;
      transition:transform .26s cubic-bezier(.2,.8,.2,1),box-shadow .26s ease,border-color .26s ease!important;
    }
    :host(d2l-card:hover),:host(d2l-card:focus-within) {
      border-color:#99a8ec!important;
      box-shadow:0 20px 44px rgba(3,7,22,.3),0 0 22px rgba(123,115,239,.13)!important;
    }
    @media (hover:hover) and (prefers-reduced-motion:no-preference) {
      :host(d2l-card:hover) { transform:translateY(-5px) scale(1.012); }
    }
    :host(d2l-card) .d2l-card-header { margin:11px 11px 0!important; border-radius:19px!important; overflow:hidden; }
    :host(d2l-card) .d2l-card-container,:host(d2l-card) .d2l-card-content {
      background-color:transparent!important; border:0!important; border-radius:0!important; box-shadow:none!important;
    }
    :host(d2l-card) .d2l-card-content { padding:18px 21px 22px!important; }
    :host(d2l-card) ::slotted([slot="content"]) {
      padding:0!important; font-family:var(--bs-design-font)!important; color:var(--bs-text)!important; font-weight:600; line-height:1.5;
    }
    :host(d2l-my-courses-enrollment-card) .d2l-enrollment-card-content-flex { border-radius:0!important; box-shadow:none!important; }
    :host(d2l-menu-item),:host(d2l-menu-item-link),:host(d2l-menu-item) a,:host(d2l-menu-item-link) a { border-radius:10px!important; }
    :host(d2l-tab),:host(d2l-discussion-activity-widget-tab) .tab { border-radius:10px!important; }
    :host(d2l-labs-navigation-button-icon),:host(d2l-labs-navigation-dropdown-button-icon),
    :host(d2l-labs-navigation-dropdown-button-custom),:host(d2l-labs-navigation-dropdown-button) {
      /* Native notification/profile wrappers fill the header. Keep that height
         so compact buttons center within it instead of moving to its top. */
      display:inline-flex!important; align-items:center!important; align-self:center!important; height:100%!important;
    }
    :host(d2l-labs-navigation-button-icon) button,:host(d2l-labs-navigation-dropdown-button-icon) button,
    :host(d2l-labs-navigation-dropdown-button-custom) button,:host(d2l-labs-navigation-dropdown-button) button {
      box-sizing:border-box!important; height:44px!important; min-height:44px!important;
      border-radius:12px!important; border:1px solid transparent!important; margin-block:auto!important;
      background-color:transparent!important; transition:background-color .18s ease,border-color .18s ease!important;
    }
    :host(d2l-labs-navigation-button-icon) button,:host(d2l-labs-navigation-dropdown-button-icon) button {
      width:44px!important; min-width:44px!important; padding:10px!important;
    }
    :host(d2l-labs-navigation-dropdown-button-custom) button,:host(d2l-labs-navigation-dropdown-button) button {
      padding:4px 10px!important;
    }
    :host(d2l-labs-navigation-button-icon) button:hover,:host(d2l-labs-navigation-dropdown-button-icon) button:hover,
    :host(d2l-labs-navigation-dropdown-button-custom) button:hover,:host(d2l-labs-navigation-dropdown-button) button:hover { background-color:#304068!important; }
    :host(d2l-button) button { border-radius:12px!important; }
    :host(d2l-button[primary]) button { background:linear-gradient(115deg,#b6d8ff,#c8b6ff)!important; color:#10182e!important; border-color:transparent!important; }
    :host(d2l-custom-grade-widget-main) .main-container,:host(d2l-discussion-activity-widget-main) .threads {
      border:1px solid var(--bs-design-line)!important; border-radius:18px!important;
    }
    @media (prefers-reduced-motion:reduce) { :host(d2l-card) { transition:none!important; transform:none!important; } }
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
      background-color:var(--bs-logo-canvas,transparent)!important;border-radius:8px;
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
    /* Small discussion avatars must paint above recolored post surfaces. Limit
       sizing/visibility protection to profile controls and the profile endpoint. */
    .d2l-user-profile-handle-image {
      display: inline-block !important;
      position: relative !important;
      z-index: 1;
      isolation: isolate;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .d2l-user-profile-handle-image .d2l-imagelink {
      display: inline-flex !important;
      flex: 0 0 auto !important;
      align-items: center;
      justify-content: center;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .d2l-user-profile-handle-image .d2l-imagelink > img,
    img.d2l-badge-userprofile,
    img[src*="/d2l/common/viewprofileimage.d2l"] {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      flex-shrink: 0 !important;
      max-width: none !important;
      /* Transparent default silhouettes need a contrasting image canvas. */
      background-color: #e7edf5 !important;
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
      .d2l-navigation-s-personal-menu-wrapper:not([slot="opener"])) {
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
  function liquidCss(theme, shadow, embedded) {
    const dark=theme==='liquid-dark', clear=theme==='liquid-clear';
    const glass=dark?'rgba(24,41,61,.86)':clear?'rgba(243,248,255,.76)':'rgba(248,250,255,.92)';
    const line=dark?'rgba(185,213,241,.36)':'rgba(90,119,154,.38)';
    const shine=dark?'rgba(228,245,255,.16)':'rgba(255,255,255,.92)';
    const shadowTone=dark?'rgba(0,5,14,.32)':'rgba(42,72,115,.14)';
    const material=`background-color:var(--bs-liquid-glass)!important;border:1px solid var(--bs-nav-line)!important;
      box-shadow:inset 0 1px 0 var(--bs-liquid-shine),0 12px 36px ${shadowTone}!important;`;
    return `
      :root,:host { --bs-liquid-glass:${glass};--bs-nav-glass:${glass};--bs-nav-line:${line};--bs-liquid-shine:${shine};
        --bs-liquid-font:"Segoe UI Variable Text","Segoe UI",system-ui,sans-serif; }
      :where(body,.d2l-typography,button,input,select,textarea) { font-family:var(--bs-liquid-font)!important; }
      :where(h1,h2,h3) { letter-spacing:-.025em!important;font-weight:650!important; }
      :where(h1.d2l-heading-1,.d2l-page-title) { font-size:clamp(1.7rem,3vw,2.4rem)!important;line-height:1.2!important; }
      :where(.d2l-widget,.d2l-panel,.d2l-user-profile-card,dialog,.d2l-dialog-inner,[role="dialog"]) {
        ${material}border-radius:26px!important;
      }
      :where(.d2l-widget-content,.d2l-widget-header) { background-color:transparent!important;box-shadow:none!important; }
      :where(.d2l-le-disc-post,.d2l-le-disc-topic,.d2l-calendar-event,.d2l-notification-item) {
        background-color:var(--bs-surface)!important;border:1px solid var(--bs-nav-line)!important;border-radius:18px!important;
      }
      :where(button,.d2l-button,.vui-button,select,[role="button"]:not(.d2l-imagelink),input[type="submit"],input[type="button"]) {
        border-radius:999px!important;box-shadow:inset 0 1px 0 var(--bs-liquid-shine);
        transition:box-shadow .2s ease!important;
      }
      :where(input:not([type="checkbox"]):not([type="radio"]),textarea) { border-radius:14px!important; }
      :where(.d2l-filedrop,.d2l-filedrop-default-style) { background-color:var(--bs-surface)!important;border:1px dashed var(--bs-border)!important;border-radius:20px!important; }
      :where(.d2l-menu,.d2l-dropdown-content,[role="menu"],[role="listbox"],.d2l-navigation-s-personal-menu-wrapper:not([slot="opener"])) {
        background-color:var(--bs-surface)!important;border:1px solid var(--bs-border)!important;border-radius:20px!important;
        box-shadow:0 14px 40px ${shadowTone}!important;
      }
      :where([role="tab"]) { border-radius:999px!important; }
      :where([role="tab"][aria-selected="true"],.d2l-calendar-day[aria-current="date"]) { background-color:var(--bs-raised)!important; }
      :where(.d2l-user-profile-handle-image img,.d2l-badge-userprofile) { border-radius:12px!important; }
      :where(table.d2l-table,table.d_table) { border-collapse:separate!important;border-spacing:0!important;border-radius:20px!important;border:1px solid var(--bs-border)!important; }
      :where(table.d2l-table,table.d_table)>:is(thead,tbody,tfoot)>tr>:is(td,th) { padding:14px 16px!important;border-color:var(--bs-nav-line)!important; }
      /* Cell tokens keep nested feedback aligned with each alternating row. */
      :where(table.d2l-table,table.d_table)>tbody>tr:hover>:is(td,th) { --bs-surface:var(--bs-raised); }
      @keyframes bs-liquid-jelly { 0%,100%{transform:scale(1)} 35%{transform:scale(1.035,.975)} 65%{transform:scale(.99,1.02)} }
      @media(hover:hover) and (prefers-reduced-motion:no-preference) {
        :where(button,.d2l-button):hover { animation:bs-liquid-jelly .55s ease-out; }
      }
      @supports(backdrop-filter:blur(24px)) {
        :where(.d2l-widget,.d2l-panel,dialog,.d2l-dialog-inner) { backdrop-filter:blur(24px) saturate(1.3); }
      }
      ${shadow ? `
        :host(d2l-card) { ${material}border-radius:30px!important;overflow:hidden;transition:box-shadow .25s ease,border-color .25s ease!important; }
        :host(d2l-card) .d2l-card-header { margin:10px 10px 0!important;border-radius:21px!important;overflow:hidden; }
        :host(d2l-card) .d2l-card-container,:host(d2l-card) .d2l-card-content { background-color:transparent!important;border:0!important;box-shadow:none!important; }
        :host(d2l-card) .d2l-card-content { padding:20px!important; }
        :host(d2l-card) ::slotted([slot="content"]) { padding:0!important;color:var(--bs-text)!important; }
        :host(d2l-menu-item),:host(d2l-menu-item-link),:host(d2l-tab) { border-radius:12px!important; }
        :host(d2l-button) button { border-radius:999px!important; }
        :host(d2l-custom-grade-widget-main) .main-container,:host(d2l-discussion-activity-widget-main) .threads { border-radius:20px!important; }
        @supports(backdrop-filter:blur(24px)) { :host(d2l-card) { backdrop-filter:blur(24px) saturate(1.3); } }
        @media(hover:hover) and (prefers-reduced-motion:no-preference) { :host(d2l-card:hover) { animation:bs-liquid-jelly .65s ease-out;box-shadow:inset 0 1px 0 var(--bs-liquid-shine),0 20px 44px ${shadowTone}!important; } }
      ` : !embedded ? `
        html { isolation:isolate; }
        body { background-color:transparent!important; }
        body::before { content:"";position:fixed;pointer-events:none;z-index:-1;inset:-8%;
          background:${dark?'radial-gradient(ellipse at 18% 18%,#173d60,transparent 60%),radial-gradient(ellipse at 88% 50%,#34355d,transparent 60%),linear-gradient(140deg,#101d30,#12283a)':'radial-gradient(ellipse at 12% 16%,#a9d8ff,transparent 58%),radial-gradient(ellipse at 88% 45%,#d5c5fa,transparent 60%),radial-gradient(ellipse at 40% 95%,#b3ebe4,transparent 62%),linear-gradient(140deg,#e9f3ff,#e1e7fa)'};
          animation:bs-liquid-drift 26s ease-in-out infinite alternate; }
        @keyframes bs-liquid-drift { from{transform:translate3d(-1%,0,0) scale(1)} to{transform:translate3d(1%,1%,0) scale(1.035)} }
        :where(.d2l-page-main,.d2l-column-main,.d2l-column-side) { background-color:transparent!important; }
      ` : ''}
      @supports not (backdrop-filter:blur(24px)) { :where(.d2l-widget,.d2l-panel,dialog,.d2l-dialog-inner),:host(d2l-card) { background-color:var(--bs-surface)!important; } }
      @media(prefers-reduced-motion:reduce) { body::before,:where(button,.d2l-button),:host(d2l-card) { animation:none!important;transition:none!important;transform:none!important; } }
      @media(prefers-reduced-transparency:reduce) { :root,:host { --bs-liquid-glass:var(--bs-surface);--bs-nav-glass:var(--bs-surface); } }
      @media(forced-colors:active) { body::before { display:none; } :where(.d2l-widget,.d2l-panel),:host(d2l-card) { background:Canvas!important;color:CanvasText!important;border:1px solid CanvasText!important;box-shadow:none!important; } }
    `;
  }
  function characterCss(theme,shadow,embedded) {
    const kitty=theme==='hello-kitty';
    const file=kitty?'hello-kitty.png':'kuromi.png';
    const asset=globalThis.chrome?.runtime?.getURL?.(`art/${file}`)||`/extension/art/${file}`;
    const picture=`url("${asset}")`;
    const panel=kitty?'rgba(255,248,249,.97)':'rgba(36,27,54,.97)';
    const accent=kitty?'#c45b7f':'#ba8dde';
    const line=kitty?'#dfb2c2':'#70558c';
    const motif=kitty?'<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88"><g fill="#de91a7" opacity=".28"><path d="M32 36Q20 29 22 43T36 48L44 44L52 48Q66 55 66 43T54 36L44 40Z"/><circle cx="44" cy="43" r="4"/></g></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88"><g fill="#b792d5" opacity=".22"><path d="M44 28L47 40L59 43L47 46L44 58L41 46L29 43L41 40Z"/><circle cx="12" cy="13" r="1.5"/><circle cx="74" cy="70" r="1.5"/></g></svg>';
    const pattern=`url("data:image/svg+xml,${encodeURIComponent(motif)}")`;
    return `
      :root,:host { --bs-liquid-glass:${panel};--bs-nav-glass:${panel};--bs-nav-line:${line};--bs-liquid-shine:${kitty?'#ffffff':'#635078'}; }
      :where(.d2l-widget,.d2l-panel,dialog,.d2l-dialog-inner) { border:1px solid ${line}!important;box-shadow:0 8px 0 ${kitty?'#e8bbc955':'#0d081e88'},0 16px 36px ${kitty?'#985c7920':'#05010f55'}!important; }
      :where(h1,h2,h3) { font-family:"Trebuchet MS","Segoe UI",sans-serif!important; }
      :where(.d2l-widget-header) { position:relative;min-height:66px;padding-inline-end:82px!important; }
      .d2l-widget-header::after { content:"";position:absolute;right:12px;top:6px;width:53px;height:53px;background-image:${picture};background-size:contain;background-repeat:no-repeat;background-position:center;pointer-events:none; }
      :where(.d2l-calendar-event,.d2l-notification-item) { border-inline-start:3px solid ${accent}!important; }
      :where(.d2l-filedrop) { border-color:${accent}!important; }
      :where(.d2l-button-primary) { background-color:var(--bs-raised)!important;color:var(--bs-text)!important; }
      ${shadow?`
        :host(d2l-card) { border:1px solid ${line}!important;border-radius:28px!important; }
        :host(d2l-card) .d2l-card-header { position:relative; }
        :host(d2l-card) .d2l-card-header::after { content:"";position:absolute;right:7px;bottom:6px;width:48px;height:48px;border-radius:16px;background:${picture} center/44px no-repeat,var(--bs-surface);border:1px solid ${line};pointer-events:none; }
      `:!embedded?`
        body::before { inset:0!important;animation:none!important;
          background-image:${picture},${pattern},linear-gradient(145deg,${kitty?'#fff0e6,#fce5ef 65%,#f8dbe6':'#151020,#241536 65%,#191127'})!important;
          background-position:left 1% bottom 5%,0 0,center;
          background-size:185px auto,88px 88px,cover;background-repeat:no-repeat,repeat,no-repeat; }
        .d2l-page-header { position:relative;padding-inline-end:94px; }
        .d2l-page-header::after { content:"";position:absolute;right:0;top:0;width:84px;height:84px;background:${picture} center/contain no-repeat;pointer-events:none; }
        :where(.d2l-widget) { background-image:linear-gradient(115deg,${kitty?'#fff4e7':'#392346'}66,transparent 60%)!important; }
        @media(max-width:650px) { body::before { background-size:100px auto,88px 88px,cover; } .d2l-page-header { padding-inline-end:60px; } .d2l-page-header::after { width:55px;height:55px; } }
      `:''}
      /* Decorative accents are never selectable or placed inside authored text. */
      @media(forced-colors:active) { .d2l-page-header::after,.d2l-widget-header::after,.d2l-widget-header::before { display:none; } }
    `;
  }
  // Each world has independent art composition, geometry, typography and ornament.
  const worlds = {
    'my-melody': {hero:'my-melody.png',detail:'my-melody.png',radius:'38px 38px 18px 38px',accent:'#a75b83',line:'#cc9fb4',font:'"Trebuchet MS","Segoe UI",sans-serif',label:'A LITTLE GARDEN OF JOY',motif:'flower'},
    sugarbunnies: {hero:'sugarbunnies-sweets.jpg',detail:'sugarbunnies.png',radius:'20px',accent:'#9a6c40',line:'#c3a886',font:'"Georgia","Times New Roman",serif',label:'SOMETHING SWEET FOR YOUR DAY',motif:'gingham'},
    'attack-on-titan': {hero:'titan-wall.jpg',detail:'titan-scouts.jpg',radius:'3px',accent:'#c7aa6c',line:'#818569',font:'"Georgia","Times New Roman",serif',label:'BEYOND THE WALLS',motif:'stone'},
    miffy: {hero:'miffy-friends.svg',detail:null,radius:'12px',accent:'#bf6b32',line:'#53565a',font:'"Trebuchet MS",sans-serif',label:'A SMALL MOMENT OF HAPPINESS',motif:'blocks'},
    totoro: {hero:'totoro-forest.jpg',detail:null,radius:'6px 24px 6px 6px',accent:'#6a7d50',line:'#9aab85',font:'"Georgia",serif',label:'A QUIET DAY IN THE COUNTRYSIDE',motif:'leaves'},
    genshin: {hero:'genshin-festival.jpg',detail:'genshin-primogem.png',radius:'24px 6px 24px 6px',accent:'#dc9fcf',line:'#a17eaf',font:'"Georgia","Times New Roman",serif',label:'MOONLIGHT AMIDST DREAMS',motif:'constellation'}
  };
  function worldRevisionCss(theme,asset,shadow,embedded) {
    if(theme==='genshin') {
      if(shadow)return `
        :host(d2l-card) .d2l-card-header::after { width:42px!important;height:42px!important;border:0!important;background:${asset('genshin-primogem.png')} center/38px no-repeat!important; }
        /* Glyphs only: preserve native links, labels, dropdowns and alert dots. */
        :host(d2l-labs-navigation-link-icon[icon="tier1:home"]) d2l-icon { --bs-genshin-glyph:${asset('genshin-home.png')};--bs-genshin-native-opacity:0;--bs-genshin-glyph-size:28px; }
        :host(d2l-labs-navigation-dropdown-button-icon[icon="tier3:email"]) d2l-icon { --bs-genshin-glyph:${asset('genshin-mail.png')};--bs-genshin-native-opacity:0;--bs-genshin-glyph-size:48px; }
        :host(d2l-labs-navigation-dropdown-button-icon[icon="tier3:discussions"]) d2l-icon { --bs-genshin-glyph:${asset('genshin-chat.png')};--bs-genshin-native-opacity:0;--bs-genshin-glyph-size:38px; }
        :host(d2l-labs-navigation-dropdown-button-icon[icon="tier3:notification-bell"]) d2l-icon { --bs-genshin-glyph:${asset('genshin-notices.png')};--bs-genshin-native-opacity:0;--bs-genshin-glyph-size:48px; }
        :host(d2l-icon) { background:var(--bs-genshin-glyph,none) center/var(--bs-genshin-glyph-size,contain) no-repeat!important; }
        :host(d2l-icon) svg { opacity:var(--bs-genshin-native-opacity,1)!important; }
      `;
      if(embedded)return '';
      const calendar=':is(.d2l-widget:has(.week-strip,.month-grid,.d2l-calendar,.d2l-calendar-event,d2l-calendar),.d2l-widget-calendar,.d2l-widget:has(a[href*="/calendar/"]))';
      return `
        :root { --bs-page-art:${asset('genshin-festival.jpg')}; }
        :root[data-bs-page="assignments"],:root[data-bs-page="submission"],:root[data-bs-page="content"] { --bs-page-art:${asset('genshin-fontaine.jpg')}; }
        :root[data-bs-page="discussions"],:root[data-bs-page="calendar"],:root[data-bs-page="course"] { --bs-page-art:${asset('genshin-archons.jpg')}; }
        :root[data-bs-page="grades"] { --bs-page-art:${asset('genshin-furina.png')}; }
        :root[data-bs-page="classlist"] { --bs-page-art:${asset('genshin-nahida.png')}; }
        :root:has([data-page="course"]:not([hidden])) { --bs-page-art:${asset('genshin-fontaine.jpg')}; }
        :root:has([data-page="calendar"]:not([hidden])) { --bs-page-art:${asset('genshin-archons.jpg')}; }
        body::before { background-image:linear-gradient(#20182f66,#20182fc9),var(--bs-page-art,${asset('genshin-festival.jpg')})!important;background-size:cover!important;background-position:center!important; }
        .d2l-page-header { min-height:320px;background-image:linear-gradient(90deg,#30243ff5 2%,#30243fd0 35%,transparent 85%),${asset('genshin-archons.jpg')}!important;background-size:cover!important;background-position:center!important; }
        .d2l-widget { background-color:#30243ff5!important;outline:1px solid #d8a7d333;outline-offset:-6px; }
        .d2l-widget-header { border-bottom:1px solid #b69bc144!important;background-image:linear-gradient(100deg,#8c557a44,#7297bd22)!important; }
        ${calendar} { position:relative; }
        ${calendar}::after { content:'';display:block;height:150px;margin:4px 16px 12px;background:${asset('genshin-paimon.png')} right center/auto 140px no-repeat;pointer-events:none; }
        :where(.d2l-calendar-event,.d2l-notification-item) { border-inline-start:3px solid #b6dcf0!important; }
        @media(max-width:650px) { .d2l-page-header { min-height:300px;padding-bottom:100px!important;background-image:linear-gradient(#30243fee 5%,#30243f55),${asset('genshin-archons.jpg')}!important; } }
        @media(forced-colors:active) { :where(.courses-widget,.d2l-widget:has(d2l-my-courses))::before,${calendar}::after { display:none; } }
      `;
    }
    if(theme==='miffy'&&shadow)return `:host(d2l-card) { border:3px solid #292c30!important;border-radius:22px!important;box-shadow:3px 4px 0 #292c30!important; }`;
    if(shadow||embedded)return '';
    if(theme==='miffy')return `
      :where(.d2l-widget,.d2l-panel,.d2l-user-profile-card) { border:3px solid #292c30!important;border-radius:24px!important;box-shadow:5px 6px 0 #292c30!important; }
      :where(.d2l-widget-header h2,.d2l-widget-header h3) { font-weight:800!important;letter-spacing:0!important; }
      :where(.d2l-button,.vui-button,button:not([role="menuitem"])) { border-radius:16px!important; }
      body::before { background-image:${asset('miffy-faces.svg')}!important;background-size:440px 440px!important;background-repeat:repeat!important;background-position:0 0!important; }
      .d2l-page-header.d2l-homepage-pageheader { border:2px solid #53565a!important;min-height:280px;background-color:#fffaf0!important;background-image:${asset('miffy-friends.svg')}!important;background-size:260px auto!important;background-position:right 16px center!important; }
      .d2l-widget-header { border-bottom:3px solid #292c30!important;background:#f9d166!important;border-radius:20px 20px 0 0!important; }
      .d2l-widget:nth-of-type(2) .d2l-widget-header { background:#f2b47c!important; }
      .d2l-widget:nth-of-type(3) .d2l-widget-header { background:#b5d2c3!important; }
      @media(max-width:650px) { .d2l-page-header { padding-bottom:155px!important;background-size:160px auto!important;background-position:right 8px bottom!important; } }
    `;
    if(theme==='totoro')return `
      body::before { background-image:linear-gradient(#dfe4d3aa,#dfe4d3ee),${asset('totoro-rain.jpg')}!important;background-size:cover!important; }
      .d2l-page-header { min-height:320px;background-image:linear-gradient(90deg,#f7f0dd 2%,#f7f0dded 35%,transparent 78%),${asset('totoro-forest.jpg')}!important;background-size:cover!important;background-position:center!important; }
      .d2l-widget-header { border-bottom:1px solid #9aab85!important;background-image:linear-gradient(90deg,#e0e5cf,transparent)!important; }
      .d2l-widget { box-shadow:0 3px 0 #93a28044,0 15px 30px #324b3620!important; }
      .d2l-widget:nth-of-type(2)::after { content:"";display:block;height:145px;margin:12px;border-radius:3px;background:${asset('totoro-rain.jpg')} center/cover no-repeat;pointer-events:none; }
      @media(max-width:650px) { .d2l-page-header { padding-bottom:150px!important;background-image:linear-gradient(#f7f0dd 5%,#f7f0dd33 85%),${asset('totoro-forest.jpg')}!important; } }
    `;
    return '';
  }
  function worldCss(theme,shadow,embedded) {
    const w=worlds[theme],p=palettes[theme];
    const asset=file=>file?`url("${globalThis.chrome?.runtime?.getURL?.(`art/${file}`)||`/extension/art/${file}`}")`:'none';
    const motifs={
      web:'<g fill="none" stroke="#8cb8e7" opacity=".2"><path d="M0 0L144 144M0 0L144 48M0 0L48 144M0 32Q28 20 32 0M0 72Q60 48 72 0M0 120Q100 85 120 0"/></g>',
      circuit:'<g fill="none" stroke="#65d9e5" opacity=".16"><path d="M0 30H44L70 56H144M0 105H82L105 80H144M26 0V65L55 95V144"/><circle cx="70" cy="56" r="3"/><circle cx="55" cy="95" r="3"/></g>',
      flower:'<g fill="#dbabc4" opacity=".35"><circle cx="72" cy="54" r="10"/><circle cx="90" cy="72" r="10"/><circle cx="72" cy="90" r="10"/><circle cx="54" cy="72" r="10"/></g><circle cx="72" cy="72" r="9" fill="#edd397" opacity=".65"/>',
      gingham:'<path d="M0 30H144M0 102H144M30 0V144M102 0V144" stroke="#c29a70" stroke-width="16" opacity=".09"/>',
      stone:'<g fill="none" stroke="#acaf91" opacity=".13"><path d="M0 0H144V144H0ZM0 48H144M0 96H144M60 0V48M112 48V96M38 96V144"/></g>',
      constellation:'<g fill="none" stroke="#af9c61" opacity=".25"><path d="M25 35L70 64L113 22M70 64L104 119"/><circle cx="25" cy="35" r="3"/><circle cx="70" cy="64" r="4"/><circle cx="113" cy="22" r="3"/><path d="M104 110L107 116L113 119L107 122L104 128L101 122L95 119L101 116Z"/></g>'
    };
    const pattern=`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">${motifs[w.motif]||''}</svg>`)}")`;
    const dark=p.scheme==='dark',soft=theme==='my-melody'||theme==='sugarbunnies';
    const border=theme==='sugarbunnies'?'1px dashed':'1px solid';
    const shadowTone=theme==='attack-on-titan'?'inset 0 0 0 3px #424936,0 12px 26px #06090555':soft?'0 8px 0 #ba8c9e20,0 16px 34px #755c6120':'0 12px 32px #0c273326';
    let special='';
    if(theme==='sugarbunnies') special=`
      .d2l-widget-header { background-image:repeating-linear-gradient(90deg,#e6c8b666 0 18px,transparent 18px 36px)!important;border-radius:19px 19px 0 0!important;border-bottom:1px dashed ${w.line}!important; }
      :where(.d2l-button,.vui-button,button) { border-radius:14px!important; }
    `;
    if(theme==='my-melody') special=`
      .d2l-page-header { background-size:215px auto,cover!important;background-position:right 15px center,center!important;background-image:${asset(w.hero)},linear-gradient(90deg,#f9ecf0 35%,#e6efdf88)!important; }
      .d2l-widget-header::after { content:"";width:56px;height:56px;position:absolute;right:14px;top:8px;background:${asset(w.detail)} center/contain no-repeat;pointer-events:none; }
      .d2l-widget-header { position:relative;padding-inline-end:82px!important; }
      :where(.d2l-button,.vui-button,button) { border-radius:24px!important; }
    `;
    if(theme==='attack-on-titan') special=`
      :where(.d2l-widget-header) { border-bottom:3px double #8f936c!important; }
      :where(h1,h2,h3) { letter-spacing:.025em!important; }
      :where(button,.d2l-button,.vui-button,select) { border-radius:3px!important; }
    `;
    return `
      :root,:host { --bs-world:${theme};--bs-liquid-glass:${p.surface};--bs-nav-glass:${p.surface};--bs-nav-line:${w.line};--bs-liquid-shine:${dark?'#ffffff12':'#ffffffcc'}; }
      :where(h1,h2,h3) { font-family:${w.font}!important; }
      :where(.d2l-widget,.d2l-panel,.d2l-user-profile-card,dialog,.d2l-dialog-inner) { border:${border} ${w.line}!important;border-radius:${w.radius}!important;box-shadow:${shadowTone}!important; }
      :where(.d2l-le-disc-post,.d2l-le-disc-post-border,.d2l-discussion-post,.d2l-filedrop) { border-radius:${soft?'22px':'8px'}!important; }
      :where(.d2l-filedrop) { border-color:${w.accent}!important; }
      :where(.d2l-widget-header) { padding-block:22px 14px!important; }
      ${shadow?`
        :host(d2l-card) { border:${border} ${w.line}!important;border-radius:${w.radius}!important;box-shadow:${shadowTone}!important; }
        :host(d2l-card) .d2l-card-container,:host(d2l-card) .d2l-card-header { border-radius:${soft?'18px':'6px'}!important; }
        :host(d2l-card) .d2l-card-header { position:relative; }
        :host(d2l-card) .d2l-card-header::after { content:"";position:absolute;right:8px;bottom:8px;width:${soft?'64px':'76px'};height:48px;border:1px solid ${w.line};border-radius:${soft?'18px':'3px'};background:${asset(w.detail)} center/${soft?'contain':'cover'} no-repeat,${p.surface};pointer-events:none; }
      `:!embedded?`
        body::before { inset:0!important;animation:none!important;background-image:${pattern},linear-gradient(${p.bg}dd,${p.bg}ee),${asset(w.hero)}!important;background-size:144px 144px,cover,cover;background-position:0 0,center,center;background-repeat:repeat,no-repeat,no-repeat; }
        .d2l-page-header { position:relative;box-sizing:border-box;min-height:232px;padding:42px 38% 30px 32px!important;margin-bottom:28px!important;border:1px solid ${w.line}!important;border-radius:${w.radius}!important;
          background-color:${p.surface}!important;background-image:linear-gradient(90deg,${p.surface} 12%,${p.surface}ed 46%,${p.surface}00 88%),${asset(w.hero)}!important;background-size:cover,${theme==='attack-on-titan'?'auto 440px':theme==='sugarbunnies'?'auto 560px':'cover'};background-position:center,${theme==='attack-on-titan'?'right top':'right center'};background-repeat:no-repeat; }
        .d2l-page-header::before { content:"${w.label}";position:absolute;left:32px;top:15px;font:600 10px/1.5 "Segoe UI",sans-serif;letter-spacing:.18em;color:var(--bs-muted);pointer-events:none; }
        .d2l-page-header h1 { font-size:clamp(1.7rem,3vw,2.7rem)!important; }
        .d2l-page-header a { position:relative;z-index:1; }
        ${special}
        @media(max-width:650px) { .d2l-page-header { min-height:210px;padding:40px 18px 22px!important;background-image:linear-gradient(90deg,${p.surface} 40%,${p.surface}c9 70%,${p.surface}88),${asset(w.hero)}!important; } .d2l-page-header::before { left:18px;top:14px;font-size:8px;letter-spacing:.08em; } .d2l-page-header h1 { font-size:1.65rem!important; } ${theme==='my-melody'?'.d2l-page-header { background-size:cover,125px auto!important;background-position:center,right -20px center!important; }':''} }
      `:''}
      ${['miffy','totoro'].includes(theme)?':host(d2l-card) .d2l-card-header::after { display:none!important; }':''}
      ${worldRevisionCss(theme,asset,shadow,embedded)}
      ${!shadow&&!embedded?`
        /* Native tool-page headings keep their own title/action layout. */
        .d2l-page-header:not(.d2l-homepage-pageheader) { min-height:0!important;height:auto!important;padding:12px 16px!important;margin-bottom:20px!important;background:var(--bs-surface)!important;border:0!important;border-radius:12px!important;box-shadow:none!important;outline:0!important; }
        .d2l-page-header:not(.d2l-homepage-pageheader)::before,.d2l-page-header:not(.d2l-homepage-pageheader)::after { display:none!important; }
        .d2l-page-header:not(.d2l-homepage-pageheader) h1 { font-size:clamp(1.65rem,2.6vw,2.25rem)!important; }
      `:''}

      @media(forced-colors:active) { .d2l-page-header { background-image:none!important;border:1px solid CanvasText!important; } .d2l-page-header::before,.d2l-widget-header::after { display:none; } }
    `;
  }
  function welcomeCss(theme,shadow,embedded) {
    const character=theme==='hello-kitty'||theme==='kuromi'||!!worlds[theme];
    const cute=theme==='hello-kitty'||theme==='kuromi';
    const fontFile=theme==='genshin'?'marcellus':theme==='attack-on-titan'?'pirataone':['hello-kitty','kuromi','my-melody','sugarbunnies','miffy'].includes(theme)?'nunito':theme==='totoro'?'bitter':null;
    const font=fontFile?(theme==='genshin'?'local("HYWenHei-85W"),local("HYWenHei 85W"),':theme==='attack-on-titan'?'local("Ditty"),local("Cloister Black"),':'')+'url("'+(globalThis.chrome?.runtime?.getURL?.('fonts/'+fontFile+'.ttf')||'/extension/fonts/'+fontFile+'.ttf')+'") format("truetype")':null;
    const home=':root[data-bs-page="home"] .d2l-page-header.d2l-homepage-pageheader';
    const course=':root[data-bs-page="course"] .d2l-page-header.d2l-homepage-pageheader';
    const picture='url("'+(globalThis.chrome?.runtime?.getURL?.('art/'+theme+'.png')||'/extension/art/'+theme+'.png')+'")';
    const photo={genshin:['genshin-archons.jpg','70%','760px','center 5%'],'attack-on-titan':['titan-wall.jpg','48%','440px','center top'],sugarbunnies:['sugarbunnies-sweets.jpg','62%','640px','center'],totoro:['totoro-forest.jpg','65%','720px','center']}[theme];
    const photoUrl=photo?'url("'+(globalThis.chrome?.runtime?.getURL?.('art/'+photo[0])||'/extension/art/'+photo[0])+'")':null;
    return `
      ${font?'@font-face { font-family:"After Hours Heading";src:'+font+';font-display:swap;font-weight:'+(fontFile==='nunito'||fontFile==='bitter'?'100 900':'400')+'; }':''}
      :root,:host { --bs-welcome-font:${font?'"After Hours Heading",':''}"Segoe UI",system-ui,sans-serif; }
      :where(.d2l-widget-header h2,.d2l-widget-header h3,.d2l-page-title) { font-family:var(--bs-welcome-font)!important; }
      ${!shadow&&!embedded?`
        [data-bs-home-banner="true"] { display:none!important; }
        ${home} { box-sizing:border-box;display:flex!important;align-items:center!important;min-height:${character?'180px':'0'}!important;height:auto!important;padding:${character?'28px 32px':'16px 0'}!important;margin-block:18px 24px!important; }
        ${home}::before { display:none!important; }
        .d2l-homepage-pageheader h1 { margin:0!important;font-family:var(--bs-welcome-font)!important;font-size:clamp(1.85rem,3vw,2.75rem)!important;line-height:1.2!important;letter-spacing:-.015em!important;font-weight:${['marcellus','pirataone'].includes(fontFile)?'400':'650'}!important;text-wrap:balance;max-width:24ch; }
        .d2l-homepage-pageheader .overline { display:none!important; }
        .d2l-homepage-pageheader a { background:var(--bs-surface)!important;color:var(--bs-link)!important;padding:8px 12px;border-radius:12px; }
        ${theme==='genshin'?home+' { background-size:cover,auto 340px!important;background-position:center,right top!important; }':theme==='miffy'?home+' { background-size:auto 150px!important;background-position:right 24px center!important;padding-inline-end:200px!important; }':''}
        ${cute?`
          ${home} { position:relative;border:1px solid var(--bs-border)!important;border-radius:${theme==='hello-kitty'?'32px':'28px 28px 10px 28px'}!important;background:linear-gradient(110deg,var(--bs-surface) 30%,var(--bs-raised))!important;box-shadow:0 6px 0 ${theme==='hello-kitty'?'#e8bbc955':'#0d081e88'}!important;padding-inline-end:210px!important; }
          ${home}::after { content:"";position:absolute;inset:18px 32px 18px auto;width:144px;height:auto;background:${picture} center/contain no-repeat;pointer-events:none; }
        `:''}
        ${photo?`
          ${home} { position:relative;isolation:isolate;background:linear-gradient(110deg,var(--bs-surface),var(--bs-raised))!important; }
          ${home} > * { position:relative;z-index:1; }
          ${home}::after { content:"";position:absolute;inset:0 0 0 auto;width:${photo[1]};max-width:${photo[2]};height:100%;z-index:0;border-radius:inherit;background:${photoUrl} ${photo[3]}/cover no-repeat;mask-image:linear-gradient(90deg,transparent 0%,#000 48%);pointer-events:none; }
        `:''}
        .d2l-homepage-pageheader .d2l-page-title-c { width:auto!important;max-width:100%; }
        /* Native course titles are offscreen headings. Keep them accessible,
           but do not turn their zero-height wrappers into decorative banners. */
        ${course} { display:block!important;min-height:0!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;outline:0!important;border-radius:0!important;background:none!important;box-shadow:none!important; }
        ${course}::before,${course}::after { display:none!important; }
        ${course} :where(.d2l-box,.d2l-box-layout,.d2l-page-title-c) { min-height:0!important;padding:0!important;margin:0!important; }
        ${course}:has(h1:not(.d2l-offscreen)) { padding-block:16px!important; }
        ${course} h1:not(.d2l-offscreen) { font-size:clamp(1.5rem,2.5vw,2rem)!important; }
        @media(max-width:650px) {
          ${home} { min-height:${character?'160px':'0'}!important;padding:${character?'24px 20px':'12px 0'}!important; }
          .d2l-homepage-pageheader h1 { font-size:clamp(1.7rem,6vw,2rem)!important;max-width:18ch; }
          ${cute||theme==='miffy'?`${home} { padding-inline-end:116px!important; } ${home}::after { right:12px;width:90px; }`:''}
          ${theme==='miffy'?home+' { background-size:auto 90px!important;background-position:right 12px center!important; }':''}
          ${photo?home+'::after { width:100%;max-width:none;opacity:.55;mask-image:linear-gradient(90deg,transparent 12%,#000 90%); }':''}
        }
      `:''}
    `;
  }
  function submissionCss(shadow,embedded) {
    if(shadow)return '';
    return `
      /* Legacy Add a File dialogs use ddial_* wrappers outside the iframe. */
      .ddial_o[role="dialog"] { background:transparent!important;box-shadow:none!important; }
      .ddial_o2 { background:var(--bs-surface)!important;color:var(--bs-text)!important;border:1px solid var(--bs-border)!important;border-radius:16px!important;box-shadow:0 18px 60px #0004!important; }
      :where(.ddial_i,.ddial_t,.ddial_c,.ddial_c_frame,.d2l-dialog-footer,.d2l-dialog-buttons) { background-color:var(--bs-surface)!important;color:var(--bs-text)!important;border-color:var(--bs-border)!important; }
      .ddial_c_frame { border:0!important; }
      :is(.ddial_t,.d2l-dialog-buttons) :where(table,tbody,tr,td) { --bs-surface:var(--bs-panel);background-color:transparent!important;border:0!important; }
      .ddial_t h1 { font:600 1.1rem/1.4 "Segoe UI",system-ui,sans-serif!important;margin:0!important; }
      ${!embedded?`
        :root[data-bs-page="submission"] .d2l-page-main { min-width:0!important; }
        :root[data-bs-page="submission"] .d2l-page-header { min-height:0!important;height:auto!important;padding:20px 24px!important;margin:0 0 24px!important;border:1px solid var(--bs-border)!important;border-radius:16px!important;background:var(--bs-surface)!important;box-shadow:none!important; }
        :root[data-bs-page="submission"] .d2l-page-header::before,:root[data-bs-page="submission"] .d2l-page-header::after { display:none!important; }
        :root[data-bs-page="submission"] .d2l-page-header h1 { font-family:var(--bs-welcome-font)!important;font-size:clamp(1.6rem,2.8vw,2.35rem)!important;line-height:1.25!important; }
        :root[data-bs-page="submission"] #d2l_form { max-width:100%; }
        :root[data-bs-page="submission"] .d2l-dropbox-submissiontext,
        :root[data-bs-page="submission"] #d2l_form > div > table.d_FG { box-sizing:border-box;width:100%!important;max-width:none!important;padding:24px!important;border:1px solid var(--bs-border)!important;border-radius:16px!important;background:var(--bs-surface)!important; }
        :root[data-bs-page="submission"] .d2l-dropbox-submissiontext > .dco_c { width:100%!important;max-width:none!important;background:transparent!important; }
        /* d_FG is a form layout, not a data table. Never stripe its rows. */
        :root[data-bs-page="submission"] #d2l_form table.d_FG { width:100%!important;border-collapse:separate!important;border-spacing:0!important; }
        :root[data-bs-page="submission"] #d2l_form table.d_FG :where(thead,tbody,tfoot,tr,td,th) { --bs-surface:var(--bs-panel);background-color:transparent!important;border:0!important; }
        :root[data-bs-page="submission"] #d2l_form table.d_FG > tbody > tr > :is(td,th) { padding-block:10px!important;padding-inline:0!important; }
        :root[data-bs-page="submission"] .d2l-htmlblock-untrusted { max-width:80ch!important;line-height:1.65; }
        :root[data-bs-page="submission"] #d2l_form > div > h2 { margin-block:28px 0!important;padding:16px 24px!important;background:var(--bs-surface)!important;border:1px solid var(--bs-border)!important;border-bottom:0!important;border-radius:16px 16px 0 0!important; }
        :root[data-bs-page="submission"] #d2l_form > div > h2 + table.d_FG { border-top:0!important;border-radius:0 0 16px 16px!important;padding-top:8px!important; }
        :root[data-bs-page="submission"] .d2l-floating-buttons-container { border-top:1px solid var(--bs-border)!important;padding-block:18px!important;margin-top:20px!important; }
        @media(max-width:650px) {
          :root[data-bs-page="submission"] .d2l-page-header,
          :root[data-bs-page="submission"] .d2l-dropbox-submissiontext,
          :root[data-bs-page="submission"] #d2l_form > div > table.d_FG { padding:16px!important; }
          :root[data-bs-page="submission"] #d2l_form table.d_FG :is(td,th) { overflow-wrap:anywhere; }
          :root[data-bs-page="submission"] #d2l_form table.d_FG > tbody > tr > .fl_n { width:auto!important;min-width:12ch;white-space:nowrap!important; }
        }
      `:''}
    `;
  }
  function baseCss(theme, shadow = false, embedded = false, customPalette) {
    const p = palettes[theme] || (theme === 'custom' ? { ...customDefaults, ...Object.fromEntries(Object.entries(customPalette || {}).filter(([key,value]) => key !== 'scheme' && /^#[\da-f]{6}$/i.test(value))) } : theme === 'sunset' ? { ...palettes.rose, bg:'#2b1c2b', surface:'#3a2938', raised:'#51394a', link:'#ffd0a1' } : themeScenes[theme] ? palettes.dark : null);
    if (!p) return '';
    const liquid=theme.startsWith('liquid');
    const world=!!worlds[theme];
    const character=theme==='hello-kitty'||theme==='kuromi'||world;
    const polished=theme==='modern'||liquid||character;
    const logo=p.scheme==='light'?'none':'drop-shadow(0 0 .5px #f4f6f9) drop-shadow(0 0 1px #f4f6f9)';
    const tokens = `--bs-panel:${p.surface};--bs-logo-canvas:transparent;--bs-logo-contour:${logo};` + Object.entries(p).filter(([key]) => key !== 'scheme').map(([key,value]) => `--bs-${key}:${value};`).join('');
    const hostSurfaces = shadow ? `
      :host(d2l-card), :host(d2l-enrollment-card),
      :host(d2l-my-courses-enrollment-card) d2l-card,
      :host(d2l-navigation-main-header), :host(d2l-navigation-main-footer),
      :host(d2l-labs-navigation-main-header), :host(d2l-labs-navigation-main-footer) {
        background-color: var(--bs-surface) !important;
        color: var(--bs-text) !important;
        border-color: var(--bs-border) !important;
      }
      :host(d2l-card) ::slotted([slot="content"]) { color: var(--bs-text) !important; }
      /* Brightspace's dashboard nests each white d2l-card inside an
         enrollment-card shadow root. Paint its actual card container as well
         as the host so the surface does not depend on inherited D2L tokens. */
      :host(d2l-card) .d2l-card-container,
      :host(d2l-card) .d2l-card-content {
        background-color: var(--bs-surface) !important;
        color: var(--bs-text) !important;
        border-color: var(--bs-border) !important;
      }
      :host(d2l-my-courses-enrollment-card) .d2l-enrollment-card-content-flex,
      :host(d2l-my-courses-enrollment-card) .d2l-organization-name {
        color: var(--bs-text) !important;
      }
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
        background-color:var(--bs-logo-canvas,transparent)!important;border-radius:8px;
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
    const scene = !shadow && !embedded && themeScenes[theme] ? sceneCss(themeScenes[theme]) : '';
    const redesign = (theme === 'modern' ? modernRules + (!shadow && !embedded ? modernCanvas : '') : liquid ? liquidCss(theme,shadow,embedded) : character ? liquidCss(p.scheme==='dark'?'liquid-dark':'liquid',shadow,embedded)+(world?worldCss(theme,shadow,embedded):characterCss(theme,shadow,embedded)) : '')
      + (polished ? navigationRules : '') + welcomeCss(theme,shadow,embedded) + submissionCss(shadow,embedded);
    const redesignHosts = (shadow && theme === 'modern' ? modernHostRules : '') + (shadow ? navigationHostRules : '');
    const reading = embedded && !shadow ? `
      /* Observed SNHU module template: preserve banner artwork and geometry. */
      body.content .intersect-content,body.content .intersect-wrapper,
      body.content .container-fluid { background-color:var(--bs-surface)!important;color:var(--bs-text)!important; }
    ` : '';
    return `${shadow ? ':host' : ':root'} { ${shadow ? '' : tokens} ${frameToken} ${variables} color-scheme:${p.scheme}; color:var(--bs-text); }\n${rules}\n${hostSurfaces}${scene}${redesign}${redesignHosts}${reading}`;
  }
  function sceneCss(scene) {
    const city = scene.startsWith('city-');
    const cityColor = scene === 'city-sunset' ? '#291d36' : '#090f20';
    const windowColor = scene === 'city-sunset' ? '#ffc36b' : '#83bfff';
    const skyline = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360" preserveAspectRatio="none"><path fill="${cityColor}" d="M0 360V230h70v-48h52v48h36v-88h70v-42h42v130h54v-170h80v52h44v118h69v-74h60v-98h66v-54h72v152h62v-118h74v-39h62v157h58v-76h55v-54h60v130h72v-112h46v-46h72v158h64v-70h64v-46h80v116h70v-94h58v-56h64v150h55v130z"/><path fill="${windowColor}" opacity=".55" d="M92 220h9v15h-9zm62 30h10v16h-10zm91-52h9v13h-9zm59 22h9v14h-9zm111-104h10v15h-10zm22 27h10v15h-10zm25 27h10v15h-10zm112 79h10v14h-10zm155-111h10v14h-10zm34 25h10v14h-10zm92-69h10v13h-10zm57 43h10v14h-10zm108-4h10v14h-10zm59 29h10v14h-10zm81-39h10v14h-10zm93 72h10v14h-10zm72-12h10v14h-10z"/></svg>`;
    const artwork = `url("data:image/svg+xml,${encodeURIComponent(skyline)}")`;
    const sky = scene === 'city-sunset'
      ? 'radial-gradient(ellipse at 78% 68%,rgba(255,157,93,.31),transparent 42%),linear-gradient(180deg,rgba(95,69,109,.14),rgba(233,125,96,.20) 74%,transparent)'
      : scene === 'aurora'
        ? 'radial-gradient(ellipse at 18% 12%,rgba(49,220,189,.24),transparent 38%),radial-gradient(ellipse at 74% 24%,rgba(99,111,241,.24),transparent 43%),radial-gradient(ellipse at 48% 58%,rgba(58,190,169,.12),transparent 50%)'
        : 'radial-gradient(ellipse at 80% 16%,rgba(62,119,207,.22),transparent 38%),radial-gradient(ellipse at 18% 44%,rgba(110,91,200,.12),transparent 42%)';
    const art = city ? `body::after{content:"";position:fixed;z-index:-1;pointer-events:none;inset:0;background-image:${artwork};background-position:center bottom;background-size:100% min(42vh,420px);background-repeat:repeat-x;opacity:.62}` : '';
    return `html{isolation:isolate}body{background-color:transparent!important}body::before{content:"";position:fixed;z-index:-1;pointer-events:none;inset:-3%;background:${sky};animation:brightspace-ambience 32s ease-in-out infinite alternate;will-change:transform,opacity}${art}@keyframes brightspace-ambience{from{transform:translate3d(-.7%,0,0) scale(1);opacity:.76}to{transform:translate3d(.7%,.5%,0) scale(1.025);opacity:1}}@media(prefers-reduced-motion:reduce){body::before{animation:none!important;will-change:auto}}`;
  }
  // Only decorative UI is simplified: media, progress indicators and editors stay functional.
  function performanceCss(themed, shadow = false) {
    const surfaces='.d2l-navigation-s-header,.d2l-navigation-s-main-wrapper,.d2l-panel,dialog,.d2l-dialog-inner,.d2l-widget,.d2l-page-header,.d2l-navigation-s,.d2l-navigation-header,.d2l-navigation-main-header,.d2l-navigation-main-footer,d2l-navigation-main-header,d2l-navigation-main-footer,d2l-card,.d2l-card-container,.d2l-card-content,.d2l-enrollment-card,.d2l-dialog,.ddial_o2';
    const hosts=shadow?',:host(d2l-card:hover),:host(d2l-card),:host(d2l-enrollment-card),:host(d2l-my-courses-enrollment-card),:host(d2l-navigation-main-header),:host(d2l-navigation-main-footer),:host(d2l-labs-navigation-main-header),:host(d2l-labs-navigation-main-footer)':'';
    return surfaces+hosts+'{transition:none!important;animation:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none!important;will-change:auto!important;'+(themed?'background-color:var(--bs-surface)!important;':'')+'}'+
      'button,.d2l-button{transition:none!important;animation:none!important}'+(themed?'body::before,body::after{animation:none!important;transform:none!important;will-change:auto!important}'+'.d2l-widget,d2l-card,.d2l-enrollment-card'+(shadow?',:host(d2l-card),:host(d2l-card:hover)':'')+'{animation:none!important;transform:none!important;translate:none!important}':'');
  }
  function css(theme, shadow = false, embedded = false, customPalette, performanceMode = false) {
    const base=baseCss(theme,shadow,embedded,customPalette);
    return base+(performanceMode?performanceCss(!!base,shadow):'');
  }
  function create(doc, { embedded = false } = {}) {
    let theme = 'original';
    let performanceMode = false;
    let performanceStyle = null;
    function syncPerformance() {
      if(!doc.documentElement)return;
      if(performanceMode && theme==='original') {
        if(!performanceStyle){performanceStyle=doc.createElement('style');performanceStyle.dataset.brightspacePerformance='true';}
        performanceStyle.textContent=performanceCss(false);
        if(!performanceStyle.isConnected)doc.documentElement.append(performanceStyle);
      } else {performanceStyle?.remove();performanceStyle=null;}
    }
    doc.addEventListener('DOMContentLoaded',syncPerformance,{once:true});
    let customPalette = null;
    let queued = false;
    let readyObserver = null;
    let discoveryFrame = null;
    const pending = new Set();
    const damagedRoots = new Set();
    const roots = new Map();
    const waiting = new WeakSet();
    let checkedWithoutRegistry = new WeakSet();
    const deferredHosts = new Set();
    const startupHosts = new Set();
    const view = doc.defaultView;
    const rootEvent = 'brightspace-after-hours:shadow-attached';
    function syncPageContext() {
      if(!embedded&&doc.documentElement){
        for(const widget of doc.querySelectorAll('.d2l-widget[aria-labelledby],.d2l-widget[data-bs-home-banner]')){
          const ids=(widget.getAttribute('aria-labelledby')||'').split(/\s+/);
          const banner=ids.some(id=>doc.getElementById(id)?.textContent?.trim()==='Homepage Header Image');
          if((theme==='hello-kitty'||theme==='kuromi'||!!worlds[theme])&&banner)widget.setAttribute('data-bs-home-banner','true');else widget.removeAttribute('data-bs-home-banner');
        }
      }
      if(!doc.documentElement||embedded)return;
      if(theme==='original'){doc.documentElement.removeAttribute('data-bs-page');return;}
      const path=doc.location?.pathname||'';
      const page=/\/dropbox\/user\/folder_submit_files\.d2l$/i.test(path)?'submission':/\/(dropbox|assignments)(\/|$)/i.test(path)?'assignments':/\/discussions(\/|$)/i.test(path)?'discussions':/\/grades(\/|$)/i.test(path)?'grades':/\/classlist(\/|$)/i.test(path)?'classlist':/\/calendar(\/|$)/i.test(path)?'calendar':/\/content(\/|$)/i.test(path)?'content':/\/home\/\d+/i.test(path)?'course':'home';
      if(doc.documentElement.getAttribute('data-bs-page')!==page)doc.documentElement.setAttribute('data-bs-page',page);
    }
    view.addEventListener('popstate',syncPageContext);
    function signalBridge() {
      doc.dispatchEvent(new view.CustomEvent(theme === 'original'
        ? 'brightspace-after-hours:shadow-stop' : 'brightspace-after-hours:shadow-start'));
    }
    function queueFlush() {
      if (queued) return;
      queued = true;
      view.queueMicrotask(flush);
    }
    function onShadowAttached(event) {
      if (theme === 'original') return;
      // Open-root event paths expose the real host even inside nested components.
      // No event details or page data are accepted by this bridge.
      const host = event.composedPath().find(node => node?.nodeType === 1 && node.ownerDocument === doc && node.shadowRoot);
      if (!host?.isConnected) return;
      pending.add(host);
      queueFlush();
    }
    doc.addEventListener('brightspace-after-hours:shadow-ready', signalBridge);
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
      style.textContent = css(theme, root !== doc, embedded, customPalette, performanceMode);
      const observer = new view.MutationObserver(records => {
        if(root===doc)syncPageContext();
        for (const record of records) for (const node of record.addedNodes) {
          if (node.nodeType === 1 && node !== style) pending.add(node);
        }
        const mount = root === doc ? doc.documentElement : root;
        if (style.parentNode !== mount) damagedRoots.add(root);
        if (pending.size || damagedRoots.size) queueFlush();
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
      if (theme === 'original') { pending.clear(); damagedRoots.clear(); return; }
      // Framework replaceChildren/innerHTML renders can remove our owned style.
      // Repair only affected registered roots, rather than rescanning the page.
      for (const root of damagedRoots) {
        const entry = roots.get(root);
        const mount = root === doc ? doc.documentElement : root;
        if (entry && mount && (root === doc || root.host.isConnected) && entry.style.parentNode !== mount) mount.append(entry.style);
      }
      damagedRoots.clear();
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
    function apply(next, custom, performance = false) {
      if (readyObserver) { readyObserver.disconnect(); readyObserver = null; }
      next = palettes[next] || next === 'custom' || next === 'midnight-city' || next === 'sunset' || next === 'aurora' ? next : 'original';
      const normalizedCustom = next === 'custom' ? { ...customDefaults, ...Object.fromEntries(Object.entries(custom || {}).filter(([key,value]) => key !== 'scheme' && /^#[\da-f]{6}$/i.test(value))) } : null;
      const customChanged = JSON.stringify(normalizedCustom) !== JSON.stringify(customPalette);
      const modeChanged=performanceMode !== (performance === true);
      performanceMode=performance === true;
      if (next === theme && !customChanged && !modeChanged) return;
      const wasOriginal = theme === 'original';
      theme = next;
      syncPerformance();
      syncPageContext();
      customPalette = normalizedCustom;
      if (next === 'original') {
        doc.removeEventListener(rootEvent, onShadowAttached, true);
        signalBridge();
        if (discoveryFrame !== null) view.cancelAnimationFrame(discoveryFrame);
        discoveryFrame = null;
        deferredHosts.clear(); startupHosts.clear();
        checkedWithoutRegistry = new WeakSet();
        doc.removeEventListener('DOMContentLoaded', checkStartupHosts);
        view.removeEventListener('load', checkStartupHosts);
        for (const {style, observer} of roots.values()) { observer.disconnect(); style.remove(); }
        roots.clear(); pending.clear(); damagedRoots.clear();
      } else if (wasOriginal) {
        if (!doc.documentElement) {
          theme = 'original';
          readyObserver = new view.MutationObserver(() => {
            if (!doc.documentElement) return;
            apply(next, normalizedCustom, performanceMode);
          });
          readyObserver.observe(doc, {childList: true});
          return;
        }
        if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', checkStartupHosts, {once:true});
        if (doc.readyState !== 'complete') view.addEventListener('load', checkStartupHosts, {once:true});
        doc.addEventListener(rootEvent, onShadowAttached, true);
        signalBridge();
        register(doc); scan(doc);
      } else {
        for (const [root, {style}] of roots) style.textContent = css(theme, root !== doc, embedded, customPalette, performanceMode);
      }
    }
    return Object.freeze({ apply });
  }
  globalThis.BrightTheme = Object.freeze({ create, css, palettes, themeScenes });
})();
