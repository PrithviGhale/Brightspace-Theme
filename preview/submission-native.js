// Fictional visual fixture only; no upload, submit or account actions.
(() => {
  history.replaceState({},'', '/d2l/lms/dropbox/user/folder_submit_files.d2l');
  dispatchEvent(new PopStateEvent('popstate'));
  const dialog=document.querySelector('.ddial_o'),scrim=document.querySelector('.scrim');
  function close(){dialog.hidden=true;scrim.hidden=true;document.querySelector('#add-file').focus();}
  document.querySelector('#add-file').onclick=()=>{dialog.hidden=false;scrim.hidden=false;document.querySelector('#close-file').focus();};
  document.querySelector('#close-file').onclick=close;document.querySelector('#cancel-file').onclick=close;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)close();});
  document.querySelector('#toggle-info').onclick=e=>{const open=e.target.getAttribute('aria-expanded')==='true';e.target.setAttribute('aria-expanded',!open);document.querySelector('#assignment-info').hidden=open;};
})();
