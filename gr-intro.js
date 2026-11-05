/* The opening mark never depends on cloud data and cannot block a failed load. */
(()=>{'use strict';
const intro=document.getElementById('grIntro'),app=document.getElementById('previewApp');
const started=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));let finishPromise,skipRequested=false,signalSkip;const skipSignal=new Promise(resolve=>signalSkip=resolve);let returning=false;try{returning=sessionStorage.getItem('gr-intro-seen-v2')==='true'}catch{}const openingUrl=new URL(location.href),replay=openingUrl.searchParams.get('intro')==='replay';
if(replay){returning=false;openingUrl.searchParams.delete('intro');openingUrl.hash='';history.replaceState(null,'',openingUrl.href);scrollTo({top:0,behavior:'instant'})}
if(returning)intro?.classList.add('is-returning');
// Decorative backdrop: no changes to the original mosaic or its photos.
if(intro&&!returning){const mosaic=document.createElement('div');mosaic.className='gr-intro-mosaic';mosaic.setAttribute('aria-hidden','true');const photos=[{"src":"assets/memories/intro/memoria-50.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-58.webp","position":"50% 48%"},{"src":"assets/memories/intro/memoria-59.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-03.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-08.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-61.webp","position":"50% 64%"},{"src":"assets/memories/intro/memoria-12.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-38.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-11.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-48.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-36.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-68.webp","position":"50% 30%"},{"src":"assets/memories/intro/memoria-66.webp","position":"50% 36%"},{"src":"assets/memories/intro/memoria-02.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-29.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-67.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-14.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-25.webp","position":"50% 44%"},{"src":"assets/memories/intro/memoria-51.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-31.webp","position":"50% 55%"},{"src":"assets/memories/intro/memoria-18.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-35.webp","position":"50% 35%"},{"src":"assets/memories/intro/memoria-07.webp","position":"50% 45%"},{"src":"assets/memories/intro/memoria-27.webp","position":"50% 45%"}];for(const photo of photos){const image=document.createElement('img');image.src=photo.src;image.alt='';image.decoding='async';image.fetchPriority='low';image.style.objectPosition=photo.position;mosaic.append(image)}intro.prepend(mosaic)}
if(intro&&!returning){const skip=document.createElement('button');skip.type='button';skip.className='gr-intro-skip';skip.textContent='Pular abertura';skip.onclick=()=>{skipRequested=true;signalSkip();skip.textContent='Carregando…';skip.disabled=true};intro.append(skip)}
// Lift the flat vector onto a sphere for a brief, real depth rotation.
// Coordinates settle exactly on the approved static mark; no perpetual render loop.
let motionFrame=0;
if(intro&&!returning&&!reduced.matches){
 const pieces=[...intro.querySelectorAll('[data-geometry]')].map(e=>({e,points:JSON.parse(e.dataset.geometry),closed:e.classList.contains('gr-panel')}));
 const stops=[...intro.querySelectorAll('[data-point]')].map(e=>({e,point:JSON.parse(e.dataset.point)}));
 const ease=t=>t*t*(3-2*t);
 const draw=now=>{
  const elapsed=now-started,t=Math.min(1,Math.max(0,(elapsed-1050)/1900));
  const yaw=(-24*(1-ease(t))+7*Math.sin(t*Math.PI))*Math.PI/180,pitch=7*(1-ease(t))*Math.PI/180,roll=-7*(1-ease(t))*Math.PI/180;
  const project=([x,y])=>{const z=Math.sqrt(Math.max(0,112*112-x*x-y*y)),a=x*Math.cos(yaw)+z*Math.sin(yaw),depth=-x*Math.sin(yaw)+z*Math.cos(yaw),b=y*Math.cos(pitch)-depth*Math.sin(pitch);return [120+a*Math.cos(roll)-b*Math.sin(roll),120+a*Math.sin(roll)+b*Math.cos(roll)]};
  for(const {e,points,closed}of pieces)e.setAttribute('d',points.map((p,i)=>(i?'L':'M')+project(p).map(n=>n.toFixed(3)).join(',')).join(' ')+(closed?' Z':''));
  for(const {e,point}of stops){const p=project(point);e.setAttribute('cx',p[0]);e.setAttribute('cy',p[1])}
  if(elapsed<3000&&intro.isConnected)motionFrame=requestAnimationFrame(draw);
 };
 motionFrame=requestAnimationFrame(draw);
 reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(motionFrame);for(const {e,points,closed}of pieces)e.setAttribute('d',points.map((p,i)=>(i?'L':'M')+p.map(n=>n+120).join(',')).join(' ')+(closed?' Z':''));for(const {e,point}of stops){e.setAttribute('cx',point[0]+120);e.setAttribute('cy',point[1]+120)}}});
}
if(app)app.inert=true;
const safety=setTimeout(()=>{cancelAnimationFrame(motionFrame);intro?.remove();if(app)app.inert=false},15000);
window.finishBrandIntro=(immediate=false)=>{
 if(app)app.setAttribute('aria-busy','false');
 if(finishPromise)return finishPromise;
 finishPromise=(async()=>{if(!immediate&&!returning&&!skipRequested&&!reduced.matches)await Promise.race([delay(Math.max(0,5000-(performance.now()-started))),skipSignal]);if(!immediate){try{sessionStorage.setItem('gr-intro-seen-v2','true')}catch{}}clearTimeout(safety);if(app)app.inert=false;if(!intro?.isConnected)return;cancelAnimationFrame(motionFrame);if(replay)scrollTo({top:0,behavior:'instant'});intro.classList.add('is-leaving');if(!immediate&&!reduced.matches)await delay(returning?180:600);intro.remove()})();
 return finishPromise;
};
})();
