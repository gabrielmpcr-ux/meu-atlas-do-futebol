// Shared original photo collection for the cover and the welcome globe.
const photoCloud=document.querySelector('.intro-photo-cloud');
let introPhotoTimer=null,introPhotoGeneration=0,introPhotoStep=0;
function travelPhotoElement(photo){
 const image=new Image();
 image.src=photo.src;image.alt=photo.alt;image.decoding='async';
 image.className='travel-photo';
 image.style.objectPosition=photo.position;
 image.style.setProperty('--photo-brightness',photo.brightness);
 return image;
}
function renderTravelMosaic(){
 const mosaic=document.getElementById('heroMosaic');
 const fragment=document.createDocumentFragment();
 for(const photo of travelPhotos){
  const tile=document.createElement('div');tile.className='hero-memory-tile';
  tile.append(travelPhotoElement(photo));fragment.append(tile);
 }
 const signature=document.createElement('div');signature.className='hero-memory-signature';
 signature.innerHTML='<span aria-hidden="true">✈︎</span><span>Memórias de<br>arquibancada</span>';
 fragment.append(signature);mosaic.replaceChildren(fragment);
}
function setIntroPhoto(card,photo,generation){
 const image=travelPhotoElement(photo);image.alt='';
 const previous=card.querySelector('img:not(.photo-outgoing)');
 if(previous&&previous.getAttribute('src')===photo.src)return;
 const reveal=()=>{
  if(generation!==introPhotoGeneration)return;
  for(const stale of card.querySelectorAll('.photo-outgoing'))stale.remove();
  if(previous){previous.classList.remove('photo-arriving');previous.classList.add('photo-outgoing');previous.style.opacity='1';image.classList.add('photo-arriving')}
  card.append(image);
 };
 if(image.complete&&image.naturalWidth)reveal();
 else image.addEventListener('load',reveal,{once:true});
}
function prepareIntroPhotos(){
 const fragment=document.createDocumentFragment();
 for(let i=0;i<Math.min(4,travelPhotos.length);i++){
  const card=document.createElement('div');card.className='intro-photo-card photo-card-'+i;
  card.append(travelPhotoElement(travelPhotos[i]));fragment.append(card);
 }
 photoCloud.replaceChildren(fragment);
}
function stopIntroPhotos(){
 clearInterval(introPhotoTimer);introPhotoTimer=null;introPhotoGeneration++;
}
function startIntroPhotos(){
 stopIntroPhotos();introPhotoStep=0;
 const generation=introPhotoGeneration;
 const cards=[...photoCloud.children];
 cards.forEach((card,index)=>card.replaceChildren(travelPhotoElement(travelPhotos[index%travelPhotos.length])));
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||travelPhotos.length<=cards.length)return;
 introPhotoTimer=setInterval(()=>{
  introPhotoStep++;
  cards.forEach((card,index)=>setIntroPhoto(card,travelPhotos[(introPhotoStep*cards.length+index)%travelPhotos.length],generation));
 },1600);
}
renderTravelMosaic();prepareIntroPhotos();
