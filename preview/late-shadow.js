/* Fixture only. Attaching a root does not mutate the containing light DOM. */
(() => {
  const names=['d2l-my-courses-v2','d2l-my-courses-container-v2','d2l-my-courses-content-v2','d2l-my-courses-card-grid-v2','d2l-my-courses-enrollment-card','d2l-card'];
  const nativeAttach=Element.prototype.attachShadow;
  window.lateFixture={nativeAttach,ready:false};
  function populate(root,next){
    root.innerHTML='<style>:host{display:block;'+(next?'':'background:white;color:#202122;')+'padding:12px}</style>'+(next?'<'+next+'></'+next+'>':'<div class="d2l-card-container"><div class="d2l-card-content">Fictional late course</div></div>');
  }
  names.forEach((name,index)=>fixtureRegistry.define(name,class extends HTMLElement{
    connectedCallback(){
      if(this.started)return;this.started=true;
      const start=()=>setTimeout(()=>{
        const root=this.attachShadow({mode:'open'});
        populate(root,names[index+1]);
        if(index===names.length-1){window.lateFixture.card=this;window.lateFixture.ready=true;}
      },80);
      if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
    }
  }));
  window.lateFixture.replace=()=>populate(window.lateFixture.card.shadowRoot);
})();
