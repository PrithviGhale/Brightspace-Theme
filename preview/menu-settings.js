(() => {
  customElements.define('d2l-menu-item-link',class extends HTMLElement{
    connectedCallback(){if(this.shadowRoot)return;const root=this.attachShadow({mode:'open'});const sheet=new CSSStyleSheet();sheet.replaceSync(':host{display:block;background:white;color:#202122;border-top:1px solid #e3e9f1}:host(:hover){background:#f1f5fb}a{display:block;padding:12px 16px;color:#006fbf;text-decoration:none}.d2l-menu-item-text{color:inherit}');root.adoptedStyleSheets=[sheet];const a=document.createElement('a');a.href='#';a.tabIndex=-1;const text=document.createElement('div');text.className='d2l-menu-item-text';text.textContent=this.getAttribute('text');a.append(text);root.append(a);}
  });
  customElements.define('d2l-menu',class extends HTMLElement{connectedCallback(){if(!this.shadowRoot)this.attachShadow({mode:'open'}).innerHTML='<div class="d2l-menu-items"><slot></slot></div>';}});
  customElements.define('d2l-tab',class extends HTMLElement{connectedCallback(){if(this.shadowRoot)return;this.tabIndex=0;const root=this.attachShadow({mode:'open'});root.innerHTML='<style>:host{display:block;background:white;color:#202122;border:1px solid #ccc;padding:10px}</style>';root.append(document.createTextNode(this.getAttribute('text')));}});
  customElements.define('d2l-floating-buttons',class extends HTMLElement{connectedCallback(){if(!this.shadowRoot)this.attachShadow({mode:'open'}).innerHTML='<style>.d2l-floating-buttons-container{background:rgba(255,255,255,.88);padding:12px;border-top:1px solid #ddd}</style><div class="d2l-floating-buttons-container"><button disabled>Example save button (disabled)</button></div>';}});
  const picker=document.querySelector('select[aria-label="Theme"]');
  BrightPreferences.read().then(p=>{picker.value=p.theme;});
  BrightPreferences.subscribe(p=>{if(p.theme)picker.value=p.theme;});
  picker.addEventListener('change',event=>chrome.storage.local.set({theme:event.target.value,enabled:true}));
})();
