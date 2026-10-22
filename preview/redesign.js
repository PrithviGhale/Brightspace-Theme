/* Fictional fixture controls only; never packaged with the extension. */
(() => {
  chrome.storage.local.set({enabled:true,theme:'modern'});
  const picker=document.querySelector('#appearance');
  picker.value='modern';
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area==='local'&&changes.theme&&[...picker.options].some(o=>o.value===changes.theme.newValue))picker.value=changes.theme.newValue;
  });
  document.querySelectorAll('[data-view]').forEach(control=>control.addEventListener('click',event=>{
    event.preventDefault();
    const view=control.dataset.view;
    document.querySelectorAll('[data-page]').forEach(page=>page.hidden=page.dataset.page!==view);
    document.querySelectorAll('nav [data-view]').forEach(button=>{
      if(button.dataset.view===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
    window.scrollTo({top:0,behavior:'instant'});
  }));
  customElements.define('d2l-icon',class extends HTMLElement{
    connectedCallback(){if(this.shadowRoot)return;this.attachShadow({mode:'open'}).innerHTML='<style>:host{display:inline-flex;width:32px;height:32px}svg{width:100%;height:100%}</style><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>';}
  });
  customElements.define('d2l-labs-navigation-dropdown-button-icon',class extends HTMLElement{
    connectedCallback(){
      if(this.shadowRoot)return;
      this.attachShadow({mode:'open'}).innerHTML='<style>:host{display:inline-block;height:100%;position:relative}button{width:42px;height:100%;min-height:40px;margin:0;padding:0;border:0;background:transparent;color:#263046;display:inline-flex;align-items:center;justify-content:center;position:relative;vertical-align:middle;cursor:pointer}svg{width:20px;height:20px}</style><button aria-label="Notifications"><span class="icon-container"><d2l-icon></d2l-icon></span></button>';
    }
  });
  customElements.define('d2l-labs-navigation-dropdown-button-custom',class extends HTMLElement{
    connectedCallback(){
      if(this.shadowRoot)return;
      this.attachShadow({mode:'open'}).innerHTML='<style>:host{display:inline-block;height:100%;position:relative}button{height:100%;min-height:40px;margin:0;padding:0;display:inline-flex;align-items:center;position:relative;vertical-align:middle;gap:8px;background:transparent;border:0;color:#263046}img{width:32px;height:32px;border-radius:9px}.label{font:12px system-ui}@media(max-width:650px){.label{display:none}}</style><button aria-label="Example profile"><img src="demo-avatar.svg" alt="Fictional profile"><span class="label">Alex Sample</span></button>';
    }
  });
  const month=document.querySelector('#month');
  for(const day of ['MON','TUE','WED','THU','FRI','SAT','SUN']){
    const label=document.createElement('div');label.className='month-weekday';label.textContent=day;month.append(label);
  }
  for(let i=0;i<35;i++){
    const cell=document.createElement('div');cell.className='d2l-calendar-day';cell.setAttribute('role','gridcell');
    const date=i-2;
    if(date<1||date>31){cell.classList.add('empty');cell.textContent='·';}
    else {cell.textContent=date;if(date===21)cell.setAttribute('aria-current','date');
      if([8,15,22,25,29].includes(date)){const event=document.createElement('div');event.className='d2l-calendar-event';event.textContent=date===25?'Weekly reflection':'Module discussion';cell.append(event);}}
    month.append(cell);
  }
})();
