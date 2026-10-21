(() => {
  for(const tag of ['d2l-labs-navigation-dropdown-button-icon','d2l-labs-navigation-dropdown-button-custom']) {
    customElements.define(tag,class extends HTMLElement {
      connectedCallback(){if(!this.shadowRoot)this.attachShadow({mode:'open'}).innerHTML='<style>button{padding:10px;border:0;background:transparent;color:#494c4e;font:inherit}</style><button aria-label="Sample navigation control">◷</button>';}
    });
  }
  const picker=document.querySelector('select');
  BrightPreferences.read().then(prefs=>{picker.value=prefs.theme;});
  BrightPreferences.subscribe(patch=>{if(patch.theme)picker.value=patch.theme;});
  picker.addEventListener('change',event=>chrome.storage.local.set({theme:event.target.value,enabled:true}));
})();
