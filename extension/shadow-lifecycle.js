/* MAIN-world lifecycle bridge. No preferences, content, input values or network access. */
(() => {
  'use strict';
  const widgetHosts=['d1i6rhttasws5m.cloudfront.net','d1zg7b99iisfa6.cloudfront.net'];
  if(widgetHosts.includes(location.hostname)) {
    const ancestors=Array.from(location.ancestorOrigins || []);
    if(!ancestors.length || ancestors.some(origin=>origin!=='https://learn.snhu.edu'))return;
  }
  const startEvent='brightspace-after-hours:shadow-start';
  const stopEvent='brightspace-after-hours:shadow-stop';
  const rootEvent='brightspace-after-hours:shadow-attached';
  const readyEvent='brightspace-after-hours:shadow-ready';
  const dispatch=EventTarget.prototype.dispatchEvent;
  const enqueue=queueMicrotask.bind(window);
  const PageEvent=CustomEvent;
  const announced=new WeakSet();
  let active=false;
  let descriptor=null;
  let wrapper=null;
  function start() {
    if(active)return;
    active=true;
    const previous=Object.getOwnPropertyDescriptor(Element.prototype,'attachShadow');
    if(typeof previous?.value!=='function')return;
    const native=previous.value;
    function attachShadow(init) {
      const root=Reflect.apply(native,this,arguments);
      if(active && root.mode==='open' && !announced.has(root)) {
        announced.add(root);
        const host=this;
        // Deliver after synchronous template setup, before the next browser paint.
        enqueue(()=>{
          if(active && host.isConnected)dispatch.call(host,new PageEvent(rootEvent,{bubbles:true,composed:true}));
        });
      }
      return root;
    }
    try {
      Object.defineProperty(Element.prototype,'attachShadow',{...previous,value:attachShadow});
      descriptor=previous;wrapper=attachShadow;
    } catch { /* A locked prototype keeps its native behavior; bounded fallback discovery still runs. */ }
  }
  function stop() {
    active=false;
    // Never replace another library's newer wrapper.
    if(wrapper && Element.prototype.attachShadow===wrapper) {
      try {
        Object.defineProperty(Element.prototype,'attachShadow',descriptor);
        wrapper=null;descriptor=null;
      } catch { /* A later prototype lock still leaves notifications disabled. */ }
    }
  }
  document.addEventListener(startEvent,start);
  document.addEventListener(stopEvent,stop);
  // Handles either injection order between MAIN and isolated content scripts.
  dispatch.call(document,new PageEvent(readyEvent));
})();
