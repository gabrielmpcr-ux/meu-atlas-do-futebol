// Optional first-visit introduction. This preference is separate from atlas records.
const introStorageKey='my-football-atlas-intro-v1';
const introDialog=document.getElementById('atlasIntro');
const introMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let introTimer=null;
function closeAtlasIntro(){
 clearTimeout(introTimer);introTimer=null;
 if(introDialog.open)introDialog.close();
}
function rememberAtlasIntro(){
 clearTimeout(introTimer);introTimer=null;
 try{localStorage.setItem(introStorageKey,'seen')}catch{}
}
function openAtlasIntro(replay=false){
 if(introDialog.open||typeof introDialog.showModal!=='function')return;
 if(introMotion.matches&&!replay)return;
 introDialog.showModal();
 if(!introMotion.matches)introTimer=setTimeout(closeAtlasIntro,4200);
}
introDialog.addEventListener('close',rememberAtlasIntro);
introDialog.addEventListener('cancel',()=>{clearTimeout(introTimer)});
introMotion.addEventListener?.('change',event=>{if(event.matches)closeAtlasIntro()});
let introSeen=false;
try{introSeen=localStorage.getItem(introStorageKey)==='seen'}catch{}
if(!introSeen&&!introMotion.matches)openAtlasIntro();
