(() => {
  // Intentional fixed-white hosts in adopted sheets: the original preview missed this.
  const templates = {
    'd2l-my-courses-v2': '<d2l-my-courses-container-v2 style="display:block;height:100%"></d2l-my-courses-container-v2>',
    'd2l-my-courses-container-v2': '<d2l-my-courses-content-v2 style="display:block;height:100%"></d2l-my-courses-content-v2>',
    'd2l-my-courses-content-v2': '<d2l-my-courses-card-grid-v2 style="display:block;height:100%"></d2l-my-courses-card-grid-v2>',
    'd2l-my-courses-card-grid-v2': '<d2l-my-courses-enrollment-card style="display:block;height:100%"></d2l-my-courses-enrollment-card>',
    'd2l-my-courses-enrollment-card': '<d2l-card style="display:block;height:100%"><img slot="header" src="color-bars.svg" alt="Course illustration"><div slot="content">Nested sample course<br><small>Practice and discovery</small></div></d2l-card>'
  };
  for (const [name, template] of Object.entries(templates)) customElements.define(name, class extends HTMLElement {
    connectedCallback() { if (!this.shadowRoot) this.attachShadow({mode:'open'}).innerHTML = template; }
  });
  customElements.define('d2l-card', class extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({mode:'open'});
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(':host{display:block;background:#fff;color:#202122;border:1px solid #ddd;border-radius:6px;overflow:hidden}.d2l-card-content{color:inherit}');
      root.adoptedStyleSheets = [sheet];
      root.innerHTML = '<div class="d2l-card-header"><slot name="header"></slot></div><div class="d2l-card-container"><div class="d2l-card-content"><slot name="content"></slot></div></div>';
    }
  });
  customElements.define('d2l-labs-navigation-main-footer', class extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({mode:'open'});
      root.innerHTML = '<style>:host{display:block;background:#fff}.d2l-navigation-main-footer{background:#fff;padding:12px}a{color:#006fbf}</style><div class="d2l-navigation-main-footer"><a href="#">Component navigation link</a></div>';
    }
  });
  document.querySelector('select').addEventListener('change', event => chrome.storage.local.set({theme:event.target.value,enabled:true}));
})();
