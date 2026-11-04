/* The opening mark never depends on cloud data and cannot block a failed load. */
(()=>{'use strict';
const intro=document.getElementById('grIntro'),app=document.getElementById('previewApp');
const started=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));let finishPromise;
if(app)app.inert=true;
const safety=setTimeout(()=>{intro?.remove();if(app)app.inert=false},10000);
window.finishBrandIntro=(immediate=false)=>{
 if(app)app.setAttribute('aria-busy','false');
 if(finishPromise)return finishPromise;
 finishPromise=(async()=>{if(!immediate&&!reduced.matches)await delay(Math.max(0,1200-(performance.now()-started)));clearTimeout(safety);if(app)app.inert=false;if(!intro?.isConnected)return;intro.classList.add('is-leaving');if(!immediate&&!reduced.matches)await delay(240);intro.remove()})();
 return finishPromise;
};
})();
