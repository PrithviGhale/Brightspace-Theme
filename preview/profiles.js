(() => {
  customElements.define('d2l-labs-navigation-link-image',class extends HTMLElement{
    connectedCallback(){this.attachShadow({mode:'open'}).innerHTML='<a href="#" aria-label="Fictional university home"><span class="d2l-labs-navigation-link-image-container"><img src="demo-logo.svg" width="170" height="48" alt="Example University"></span></a>';}
  });
  customElements.define('d2l-profile-image-base',class extends HTMLElement{
    connectedCallback(){this.attachShadow({mode:'open'}).innerHTML='<style>:host{display:inline-block}img{display:block;border-radius:5px}</style><img src="demo-avatar.svg" width="50" height="50" alt="Fictional shared profile photo">';}
  });
  const picker=document.querySelector('select');
  BrightPreferences.read().then(p=>{picker.value=p.theme;});
  BrightPreferences.subscribe(p=>{if(p.theme)picker.value=p.theme;});
  picker.addEventListener('change',e=>chrome.storage.local.set({theme:e.target.value,enabled:true}));
  document.querySelector('#add-profile').addEventListener('click',()=>document.querySelector('#profiles').append(document.createElement('d2l-profile-image-base')));
})();
