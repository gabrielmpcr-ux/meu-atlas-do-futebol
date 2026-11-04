/* The opening mark never depends on cloud data and cannot block a failed load. */
(()=>{'use strict';
const intro=document.getElementById('grIntro'),app=document.getElementById('previewApp');
const started=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));let finishPromise;
// Decorative backdrop: no changes to the original mosaic or its photos.
if(intro){const mosaic=document.createElement('div');mosaic.className='gr-intro-mosaic';mosaic.setAttribute('aria-hidden','true');const photos=[{"src":"assets/memories/memoria-50.webp","position":"50% 45%"},{"src":"assets/memories/memoria-58.webp","position":"50% 48%"},{"src":"assets/memories/memoria-59.webp","position":"50% 45%"},{"src":"assets/memories/memoria-03.webp","position":"50% 45%"},{"src":"assets/memories/memoria-08.webp","position":"50% 45%"},{"src":"assets/memories/memoria-61.webp","position":"50% 64%"},{"src":"assets/memories/memoria-12.webp","position":"50% 45%"},{"src":"assets/memories/memoria-38.webp","position":"50% 45%"},{"src":"assets/memories/memoria-11.webp","position":"50% 45%"},{"src":"assets/memories/memoria-48.webp","position":"50% 45%"},{"src":"assets/memories/memoria-36.webp","position":"50% 45%"},{"src":"assets/memories/memoria-68.webp","position":"50% 30%"},{"src":"assets/memories/memoria-66.webp","position":"50% 36%"},{"src":"assets/memories/memoria-02.webp","position":"50% 45%"},{"src":"assets/memories/memoria-29.webp","position":"50% 45%"},{"src":"assets/memories/memoria-67.webp","position":"50% 45%"},{"src":"assets/memories/memoria-14.webp","position":"50% 45%"},{"src":"assets/memories/memoria-25.webp","position":"50% 44%"},{"src":"assets/memories/memoria-51.webp","position":"50% 45%"},{"src":"assets/memories/memoria-31.webp","position":"50% 55%"},{"src":"assets/memories/memoria-18.webp","position":"50% 45%"},{"src":"assets/memories/memoria-35.webp","position":"50% 35%"},{"src":"assets/memories/memoria-07.webp","position":"50% 45%"},{"src":"assets/memories/memoria-27.webp","position":"50% 45%"}];for(const photo of photos){const image=document.createElement('img');image.src=photo.src;image.alt='';image.decoding='async';image.fetchPriority='low';image.style.objectPosition=photo.position;mosaic.append(image)}intro.prepend(mosaic)}
if(app)app.inert=true;
const safety=setTimeout(()=>{intro?.remove();if(app)app.inert=false},15000);
window.finishBrandIntro=(immediate=false)=>{
 if(app)app.setAttribute('aria-busy','false');
 if(finishPromise)return finishPromise;
 finishPromise=(async()=>{if(!immediate)await delay(Math.max(0,5000-(performance.now()-started)));clearTimeout(safety);if(app)app.inert=false;if(!intro?.isConnected)return;intro.classList.add('is-leaving');if(!immediate&&!reduced.matches)await delay(600);intro.remove()})();
 return finishPromise;
};
})();
