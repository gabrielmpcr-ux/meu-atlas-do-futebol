// Collection filters are view state only: they never change personal records.
const collectionState={iso:'',city:'',query:'',sort:'name',limit:12};
const collectionPageSize=12;
function collectionCountries(records){
 const countries=new Map();
 records.forEach((visit,index)=>{
  const iso=String(visit.iso||'').toUpperCase();
  if(!iso)return;
  if(!countries.has(iso))countries.set(iso,{iso,name:visit.country,count:0,firstIndex:index});
  if(visit.stadium)countries.get(iso).count++;
 });
 return [...countries.values()];
}
function collectionEntries(records,state){
 const terms=normalizeStadiumName(state.query).split(' ').filter(Boolean);
 const entries=records.map((visit,index)=>({...visit,_index:index})).filter(visit=>{
  if(!visit.stadium||(state.iso&&String(visit.iso).toUpperCase()!==state.iso)||(state.city&&normalizeStadiumName(visit.city)!==normalizeStadiumName(state.city)))return false;
  const text=normalizeStadiumName([visit.stadium,visit.city,visit.country,visit.club].join(' '));
  return terms.every(term=>text.includes(term));
 });
 const byName=(a,b)=>a.stadium.localeCompare(b.stadium,'pt',{numeric:true,sensitivity:'base'})||a._index-b._index;
 entries.sort((a,b)=>state.sort==='country'?a.country.localeCompare(b.country,'pt')||byName(a,b):state.sort==='visits'?collectionVisitCount(b)-collectionVisitCount(a)||byName(a,b):byName(a,b));
 return entries;
}
function collectionVisitCount(visit){const n=Number(visit.visitCount);return Number.isInteger(n)&&n>0?n:1}
function renderCollectionCard(visit){
 const photo=stadiumPhoto(visit),index=visit._index,count=collectionVisitCount(visit);
 const open=`openStadiumDetails(${index})`;
 return `<article class="stadium collection-card" data-record="${index}"><div class="stadium-cover">${stadiumCover(visit)}${photo?'':'<span class="collection-no-photo">Fotografia a adicionar</span>'}<button class="collection-cover-open" type="button" onclick="${open}" aria-label="Ver detalhes de ${escapeHtml(visit.stadium)}"></button><span class="collection-country-tag">${escapeHtml(visit.country)}</span><button class="collection-more" type="button" onclick="${open}" aria-label="Opções de ${escapeHtml(visit.stadium)}">⋯</button><span class="photo-note" hidden></span></div><div class="stadium-body"><h3><button class="collection-title" type="button" onclick="${open}">${escapeHtml(visit.stadium)}</button></h3><p class="collection-city">⌖ ${escapeHtml(visit.city)}</p>${photo?.source?`<a class="photo-credit" href="${escapeHtml(photo.source)}" target="_blank" rel="noopener noreferrer">Foto: ${escapeHtml(photo.credit)} ↗</a>`:'<span class="collection-credit-spacer"></span>'}<div class="collection-card-footer"><span>↻ ${count} ${count===1?'visita':'visitas'}</span><button type="button" onclick="${open}">Ver detalhes ↗</button></div></div></article>`;
}
function syncCollectionPanel(){
 const visit=visits.find(v=>String(v.iso).toUpperCase()===collectionState.iso);
 document.getElementById('countrySearch').value=visit?.country||'';
 renderCountries();if(geo)drawGeo();
}
function selectCollectionCountry(iso,options={}){
 collectionState.iso=String(iso||'').toUpperCase();collectionState.city='';collectionState.limit=collectionPageSize;
 if(options.clearQuery)collectionState.query='';
 renderCollection();syncCollectionPanel();
}
function selectCollectionCity(iso,city){
 collectionState.iso=String(iso).toUpperCase();collectionState.city=city;collectionState.query='';collectionState.limit=collectionPageSize;
 renderCollection();syncCollectionPanel();
}
function clearCollectionFilters(){
 Object.assign(collectionState,{iso:'',city:'',query:'',limit:collectionPageSize});
 renderCollection();syncCollectionPanel();
}
function clearCollectionCity(){collectionState.city='';collectionState.limit=collectionPageSize;renderCollection();syncCollectionPanel()}
function renderCollection(){
 const countries=collectionCountries(visits);
 if(collectionState.iso&&!countries.some(country=>country.iso===collectionState.iso)){
  collectionState.iso='';collectionState.city='';document.getElementById('countrySearch').value='';renderCountries();
 }
 if(collectionState.city&&!visits.some(v=>String(v.iso).toUpperCase()===collectionState.iso&&normalizeStadiumName(v.city)===normalizeStadiumName(collectionState.city)))collectionState.city='';
 const entries=collectionEntries(visits,collectionState);
 const countrySelect=document.getElementById('collectionCountry');
 countrySelect.innerHTML='<option value="">Todos os países</option>'+[...countries].sort((a,b)=>a.name.localeCompare(b.name,'pt')).map(country=>`<option value="${escapeHtml(country.iso)}">${escapeHtml(country.name)} (${country.count})</option>`).join('');
 countrySelect.value=collectionState.iso;
 const search=document.getElementById('collectionSearch');
 if(search.value!==collectionState.query)search.value=collectionState.query;
 document.getElementById('collectionSort').value=collectionState.sort;
 const total=visits.filter(v=>v.stadium).length;
 const quick=countries.filter(c=>c.count).sort((a,b)=>b.count-a.count||a.firstIndex-b.firstIndex).slice(0,3);
 const selected=countries.find(c=>c.iso===collectionState.iso);
 if(selected&&!quick.some(c=>c.iso===selected.iso))quick.push(selected);
 document.getElementById('collectionChips').innerHTML=`<button type="button" class="collection-chip${!collectionState.iso?' active':''}" data-iso="" aria-pressed="${!collectionState.iso}">Todos <span>${total}</span></button>`+quick.map(country=>`<button type="button" class="collection-chip${country.iso===collectionState.iso?' active':''}" data-iso="${escapeHtml(country.iso)}" aria-pressed="${country.iso===collectionState.iso}">${escapeHtml(country.name)} <span>${country.count}</span></button>`).join('')+'<button class="collection-chip collection-more-countries" type="button" data-more-countries>Mais países ⌄</button>';
 document.getElementById('stadiumCaption').textContent=collectionState.city?collectionState.city+' · '+(selected?.name||''):selected?.name||'Todos os países';
 document.getElementById('collectionResultCount').textContent=entries.length+' '+(entries.length===1?'estádio encontrado':'estádios encontrados');
 const cityTag=document.getElementById('collectionCityTag');cityTag.hidden=!collectionState.city;cityTag.textContent=collectionState.city?'Cidade: '+collectionState.city+' ×':'';
 const clear=document.getElementById('collectionClear');clear.disabled=!(collectionState.iso||collectionState.city||collectionState.query);
 const shown=entries.slice(0,collectionState.limit);
 const empty=collectionState.city&&!entries.length?escapeHtml(collectionState.city)+' está na sua lista de cidades visitadas, sem estádio cadastrado.':selected?.count===0?escapeHtml(selected.name)+' tem cidades visitadas, mas nenhum estádio cadastrado. Use “Nova visita” para adicionar um.':total?'Nenhum estádio encontrado. Tente outra busca ou limpe os filtros.':'Sua coleção começa com uma visita. Clique em “Nova visita” para cadastrar um estádio.';
 document.getElementById('stadiumList').innerHTML=shown.length?shown.map(renderCollectionCard).join(''):`<div class="collection-empty">${empty}</div>`;
 document.getElementById('collectionLoadMore').hidden=shown.length>=entries.length;
 document.getElementById('collectionPageCount').textContent=entries.length?'Mostrando '+shown.length+' de '+entries.length+' estádios':'';
}
function renderStadiums(country,city){
 if(arguments.length){
  collectionState.iso=country?(visits.find(v=>v.country===country)?.iso||'').toUpperCase():'';
  collectionState.city=city||'';collectionState.query='';collectionState.limit=collectionPageSize;
 }
 renderCollection();
}
function loadMoreStadiums(){
 const previous=collectionState.limit;collectionState.limit+=collectionPageSize;renderCollection();
 const next=document.querySelectorAll('#stadiumList .collection-card')[previous];
 if(next)requestAnimationFrame(()=>next.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
}
function openStadiumDetails(index){
 const visit=visits[index];if(!visit?.stadium)return;
 const photo=stadiumPhoto(visit),count=collectionVisitCount(visit);
 const actions=`<button class="btn" type="button" data-detail-action="photo" data-record="${index}">📷 Alterar foto</button><button class="btn" type="button" data-detail-action="games" data-record="${index}">⚽ Jogos (${getRecordMatches(index).length})</button><button class="btn primary" type="button" data-detail-action="edit" data-record="${index}">Editar estádio</button>`;
 document.getElementById('stadiumDetailContent').innerHTML=`<div class="stadium-cover collection-detail-cover">${stadiumCover(visit)}<span class="photo-note" hidden></span></div><div class="collection-detail-body"><span class="collection-detail-country">${escapeHtml(visit.country)}</span><h2 id="stadiumDetailTitle">${escapeHtml(visit.stadium)}</h2><p class="collection-detail-city">⌖ ${escapeHtml(visit.city)} · ${count} ${count===1?'visita':'visitas'}</p>${visit.club?`<p>⚽ ${escapeHtml(visit.club)}</p>`:''}${visit.date?`<p>Data da visita: ${escapeHtml(visit.date)}</p>`:''}${visit.notes?`<p class="collection-detail-notes">${escapeHtml(visit.notes)}</p>`:''}${photo?.source?`<a class="photo-credit" href="${escapeHtml(photo.source)}" target="_blank" rel="noopener noreferrer">Foto: ${escapeHtml(photo.credit)} ↗</a>`:''}${photo?.licenseUrl?`<a class="photo-credit" href="${escapeHtml(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">Licença: ${escapeHtml(photo.license)} ↗</a>`:''}${aviationStadiumLinks(index)}<div class="collection-detail-actions">${actions}</div></div>`;
 document.getElementById('stadiumDetails').showModal();
}
function initializeCollection(){
 document.getElementById('collectionSearch').addEventListener('input',event=>{collectionState.query=event.target.value;collectionState.limit=collectionPageSize;renderCollection()});
 document.getElementById('collectionCountry').addEventListener('change',event=>selectCollectionCountry(event.target.value));
 document.getElementById('collectionSort').addEventListener('change',event=>{collectionState.sort=event.target.value;collectionState.limit=collectionPageSize;renderCollection()});
 document.getElementById('collectionChips').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-more-countries')){const select=document.getElementById('collectionCountry');select.focus();try{select.showPicker?.()}catch{};return}
  selectCollectionCountry(button.dataset.iso);
 });
 document.getElementById('collectionClear').addEventListener('click',clearCollectionFilters);
 document.getElementById('collectionCityTag').addEventListener('click',clearCollectionCity);
 document.getElementById('collectionLoadMore').addEventListener('click',loadMoreStadiums);
 document.getElementById('stadiumDetailContent').addEventListener('click',event=>{
  const button=event.target.closest('[data-detail-action]');if(!button)return;
  const index=Number(button.dataset.record);document.getElementById('stadiumDetails').close();
  if(button.dataset.detailAction==='photo')openPhoto(index);
  else if(button.dataset.detailAction==='games')showMatches(index);
  else openEdit(index);
 });
}
