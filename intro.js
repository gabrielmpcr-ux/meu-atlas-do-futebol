// Optional first-visit introduction. This preference is separate from atlas records.
const introStorageKey='my-football-atlas-intro-v1';
const introDialog=document.getElementById('atlasIntro');
const introMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let introTimer=null;
function closeAtlasIntro(){
 clearTimeout(introTimer);introTimer=null;
 stopIntroPhotos();
 if(introDialog.open)introDialog.close();
}
function rememberAtlasIntro(){
 stopIntroPhotos();
 clearTimeout(introTimer);introTimer=null;
 try{localStorage.setItem(introStorageKey,'seen')}catch{}
}
function openAtlasIntro(replay=false){
 if(introDialog.open||typeof introDialog.showModal!=='function')return;
 if(introMotion.matches&&!replay)return;
 introDialog.style.setProperty('--intro-duration','6800ms');
 introDialog.showModal();startIntroPhotos();
 if(!introMotion.matches)introTimer=setTimeout(closeAtlasIntro,6800);
}
introDialog.addEventListener('close',rememberAtlasIntro);
introDialog.addEventListener('cancel',()=>{clearTimeout(introTimer);stopIntroPhotos()});
introMotion.addEventListener?.('change',event=>{if(event.matches)closeAtlasIntro()});
let introSeen=false;
try{introSeen=localStorage.getItem(introStorageKey)==='seen'}catch{}
if(!introSeen&&!introMotion.matches)openAtlasIntro();
