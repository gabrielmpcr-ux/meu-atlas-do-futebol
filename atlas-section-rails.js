/* Move the initialized rails into their corresponding one-page sections. */
(()=>{'use strict';
const placements=[['competitions','#stadiumGallery'],['carriers','#journeys .flight-indicators'],['countries','#memories .memories-mosaic']];
for(const [kind,selector] of placements){const rail=document.querySelector(`[data-rail-kind="${kind}"]`),target=document.querySelector(selector);if(rail&&target)target.before(rail);}
const previous=document.querySelector('.passport-strip');if(previous&&!previous.querySelector('.section-rail'))previous.remove();
window.dispatchEvent(new Event('scroll'));
})();
