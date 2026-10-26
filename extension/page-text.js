/* Read only on an explicit, authenticated popup request. Never persists text. */
(() => {
  const LIMIT=300000;
  function read(doc){
    const chunks=[];let length=0,inaccessible=false,truncated=false;
    function add(value){if(length>=LIMIT){truncated=true;return;}const part=value.slice(0,LIMIT-length);chunks.push(part);length+=part.length;if(part.length<value.length)truncated=true;}
    function walk(node){
      if(length>=LIMIT){truncated=true;return;}
      if(node.nodeType===3){add((node.nodeValue||'').replace(/\s+/g,' '));return;}
      if(node.nodeType!==1&&node.nodeType!==11&&node.nodeType!==9)return;
      if(node.nodeType===1){
        if(node.matches('script,style,noscript,template,input,textarea,select,svg,canvas,[hidden],[aria-hidden="true"],[contenteditable]:not([contenteditable="false"])'))return;
        const style=node.ownerDocument.defaultView.getComputedStyle(node);
        if(style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse'||style.opacity==='0')return;
        if(node.matches('.d2l-offscreen,.sr-only,.visually-hidden'))return;
        if(style.display!=='contents'&&!node.getClientRects().length)return;
        if(node.localName==='details'&&!node.open){const summary=node.querySelector(':scope > summary');if(summary)walk(summary);return;}
        if(node.localName==='iframe'){
          try{if(node.contentDocument?.body)walk(node.contentDocument.body);else inaccessible=true;}catch{inaccessible=true;}
          add('\n');return;
        }
        if(node.localName==='br'){add('\n');return;}
        const block=!['inline','inline-block','contents'].includes(style.display);
        if(block)add('\n');
        if(node.localName==='slot'){
          const assigned=node.assignedNodes({flatten:true});
          for(const child of assigned.length?assigned:node.childNodes)walk(child);
        }else for(const child of (node.shadowRoot||node).childNodes)walk(child);
        if(block)add('\n');
        return;
      }
      for(const child of node.childNodes)walk(child);
    }
    walk(doc.body);
    return {text:chunks.join('').replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim(),truncated,inaccessible};
  }
  globalThis.BrightPageText=Object.freeze({read});
})();
