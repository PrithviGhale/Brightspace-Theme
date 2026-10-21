(() => {
  customElements.define('d2l-html-block',class extends HTMLElement{
    connectedCallback(){if(this.shadowRoot)return;const root=this.attachShadow({mode:'open'});root.innerHTML='<style>:host{display:block}.d2l-htmlblock{background:white;color:#202122}</style><div class="d2l-htmlblock"><slot></slot></div>';}
  });
  const picker=document.querySelector('select[aria-label="Theme"]');
  BrightPreferences.read().then(p=>{picker.value=p.theme;});
  BrightPreferences.subscribe(p=>{if(p.theme)picker.value=p.theme;});
  picker.addEventListener('change',event=>chrome.storage.local.set({theme:event.target.value,enabled:true}));
})();
