(() => {
  fixtureRegistry.define('d2l-card', class extends HTMLElement {
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({mode:'open'}).innerHTML = '<style>:host{display:block;background:white}</style><section>Card reached after an unknown custom element</section>';
    }
  });
  fixtureRegistry.define('late-registry-card', class extends HTMLElement {
    connectedCallback() {
      // Root attachment alone emits no light-DOM child mutation.
      requestAnimationFrame(() => {
        if (!this.shadowRoot) this.attachShadow({mode:'open'}).innerHTML = '<section>First-render root</section>';
      });
    }
  });
})();
