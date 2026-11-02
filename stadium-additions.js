/* Explicit, local addition requested by the owner. Loaded only by the inclusion page. */
function addVigoStadiums(records){
 if(!Array.isArray(records)||!records.every(v=>v&&typeof v==='object'&&!Array.isArray(v)))throw Error('A coleção de estádios deste navegador não está disponível. Abra este link no navegador em que você usa seu Atlas.');
 const names=['Estádio O Vao','Campo Municipal de Bouzas–Baltasar Pujales'];
 const additions=names.map(stadium=>findStadiumDetails({iso:'ESP',stadium}));
 if(additions.some(s=>!s))throw Error('Não foi possível carregar o catálogo atualizado. Atualize esta página.');
 const missing=additions.filter(s=>!records.some(v=>String(v.iso||'').toUpperCase()==='ESP'&&findStadiumDetails(v)?.name===s.name));
 return {records:[...records,...missing.map(s=>({country:'Espanha',iso:'ESP',city:'Vigo',stadium:s.name,club:s.club,lat:s.lat,lng:s.lng,coordinateSource:s.coordinateSource,visitCount:1,date:'',notes:'',photoUrl:''}))],added:missing.length};
}
function includeVigoInThisBrowser(){const status=document.querySelector('#inclusionStatus');try{const raw=localStorage.getItem('my-football-atlas-v1');if(!raw)throw Error('Seus registros não estão neste navegador. Abra este link no mesmo navegador em que usa seu Atlas.');const result=addVigoStadiums(JSON.parse(raw));if(result.added)localStorage.setItem('my-football-atlas-v1',JSON.stringify(result.records));status.textContent=result.added?`${result.added} ${result.added===1?'estádio incluído':'estádios incluídos'} na sua coleção. Os registros anteriores e os voos foram preservados.`:'Os dois estádios já estão na sua coleção. Nenhum registro foi duplicado.';document.querySelector('#openUpdatedAtlas').hidden=false;}catch(error){status.textContent=error.message;document.querySelector('#retryInclusion').hidden=false;}}
if(typeof document!=='undefined'){document.querySelector('#retryInclusion').onclick=()=>location.reload();includeVigoInThisBrowser();}
