(() => {
  class DemoCard extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      this.attachShadow({mode: 'open'}).innerHTML = `<style>:host{display:block;margin:12px 0}section{background:white;color:black;border:1px solid #ccc;border-radius:6px;padding:12px}a{color:#006fbf}</style><section><strong>Open shadow component</strong><p>Nested controls inherit theme variables.</p><a href="#">Component link</a><button>Action</button><demo-nested></demo-nested></section>`;
    }
  }
  class Nested extends HTMLElement {
    connectedCallback() { if (!this.shadowRoot) this.attachShadow({mode: 'open'}).innerHTML = '<style>p{background:#fff;color:#000}</style><p>Nested open root</p>'; }
  }
  customElements.define('demo-nested', Nested);
  customElements.define('demo-card', DemoCard);
  document.querySelector('#add').addEventListener('click', () => document.querySelector('#dynamic').append(document.createElement('demo-card')));
  document.querySelector('#dialog-open').addEventListener('click', () => document.querySelector('#review').showModal());
  document.querySelector('#dialog-close').addEventListener('click', () => document.querySelector('#review').close());
})();
