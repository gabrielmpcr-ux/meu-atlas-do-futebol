// Optional match memories live inside each stadium record and travel with JSON backups.
let currentMatchEdit=null;
function getRecordMatches(index){
 const games=visits[index]?.matches;
 return Array.isArray(games)?games.filter(game=>game&&typeof game==='object'&&!Array.isArray(game)):[];
}
function matchKey(game,index){return typeof game.id==='string'&&game.id?game.id:'legacy:'+index}
function findRecordMatch(index,key){
 const games=getRecordMatches(index);
 const position=games.findIndex((game,i)=>matchKey(game,i)===key);
 return {games,position,game:games[position]};
}
function matchScore(value){
 if(value===null||value===undefined||String(value).trim()==='')return null;
 const number=Number(value);return Number.isInteger(number)&&number>=0&&number<=999?number:null;
}
function validateMatchFields(values){
 const score=value=>{
  if(value===null||value===undefined||String(value).trim()==='')return null;
  const number=Number(value);
  if(!Number.isInteger(number)||number<0||number>999)throw Error('O placar deve ser um número inteiro a partir de zero, ou ficar em branco.');
  return number;
 };
 const game={date:String(values.date||'').trim(),homeTeam:String(values.homeTeam||'').trim(),awayTeam:String(values.awayTeam||'').trim(),homeScore:score(values.homeScore),awayScore:score(values.awayScore),competition:String(values.competition||'').trim(),notes:String(values.notes||'').trim()};
 if(game.date){
  const parsed=new Date(game.date+'T12:00:00Z');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(game.date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==game.date)throw Error('Confira a data do jogo ou deixe esse campo em branco.');
 }
 if(!game.date&&!game.homeTeam&&!game.awayTeam&&game.homeScore===null&&game.awayScore===null&&!game.competition&&!game.notes)throw Error('Preencha ao menos uma lembrança: um time, placar, data, competição ou nota.');
 return game;
}
function matchDateLabel(value){
 const date=String(value||'');return /^\d{4}-\d{2}-\d{2}$/.test(date)?date.split('-').reverse().join('/'):'Data não informada';
}
function stadiumMatchOptions(selected=''){
 return visits.map((visit,index)=>({visit,index})).filter(item=>item.visit.stadium).sort((a,b)=>a.visit.stadium.localeCompare(b.visit.stadium,'pt')).map(({visit,index})=>`<option value="${index}"${String(index)===String(selected)?' selected':''}>${escapeHtml(visit.stadium)} · ${escapeHtml(visit.city)}</option>`).join('');
}
function renderMatchSection(){
 const filter=document.getElementById('matchStadiumFilter');
 if(!filter)return;
 const previous=filter.value;
 filter.innerHTML='<option value="">Todos os estádios</option>'+stadiumMatchOptions(previous);
 const selected=filter.value;
 const rows=[];
 visits.forEach((visit,index)=>{
  if(!visit.stadium||(selected!==''&&String(index)!==selected))return;
  getRecordMatches(index).forEach((game,gameIndex)=>rows.push({visit,index,game,key:matchKey(game,gameIndex)}));
 });
 rows.sort((a,b)=>String(b.game.date||'').localeCompare(String(a.game.date||'')));
 const counter=document.getElementById('matchSectionCount');
 counter.textContent=rows.length+' '+(rows.length===1?'jogo registrado':'jogos registrados');
 const score=value=>{const n=matchScore(value);return n===null?'<span class="unknown-score">?</span>':String(n)};
 document.getElementById('matchList').innerHTML=rows.length?rows.map(({visit,index,game,key})=>`<article class="match-card"><div class="match-card-meta"><span>${escapeHtml(matchDateLabel(game.date))}</span><span>${escapeHtml(game.competition||'Competição não informada')}</span></div><div class="match-scoreboard"><div class="match-team">${escapeHtml(game.homeTeam||'Time não informado')}</div><div class="match-score" aria-label="Placar: ${matchScore(game.homeScore)??'não informado'} a ${matchScore(game.awayScore)??'não informado'}">${score(game.homeScore)} <span aria-hidden="true">×</span> ${score(game.awayScore)}</div><div class="match-team">${escapeHtml(game.awayTeam||'Time não informado')}</div></div><p class="match-place">🏟 ${escapeHtml(visit.stadium)}<br>${escapeHtml(visit.city)} · ${escapeHtml(visit.country)}</p>${game.notes?`<p class="match-notes">${escapeHtml(game.notes)}</p>`:''}<div class="match-actions"><button type="button" class="match-action" data-match-action="edit" data-record="${index}" data-game="${escapeHtml(key)}" aria-label="Editar jogo em ${escapeHtml(visit.stadium)}">Editar</button><button type="button" class="match-action danger" data-match-action="delete" data-record="${index}" data-game="${escapeHtml(key)}" aria-label="Excluir jogo em ${escapeHtml(visit.stadium)}">Excluir</button></div></article>`).join(''):'<div class="matches-empty"><strong>As histórias também fazem parte da coleção.</strong>Ainda não há jogos registrados'+(selected!==''?' neste estádio':'')+'. Você pode preencher apenas o que lembrar.</div>';
}
function showMatches(index){
 activateNavigation('matches');
 if(index!==undefined&&visits[index]?.stadium)document.getElementById('matchStadiumFilter').value=String(index);
 else document.getElementById('matchStadiumFilter').value='';
 renderMatchSection();
 document.getElementById('matchesSection').scrollIntoView({behavior:'smooth',block:'start'});
}
function openMatchDialog(index,key){
 const dialog=document.getElementById('matchDialog'),form=document.getElementById('matchForm');
 form.reset();document.getElementById('matchError').textContent='';
 currentMatchEdit=null;
 const preferred=index!==undefined?String(index):document.getElementById('matchStadiumFilter').value;
 form.elements.stadiumIndex.innerHTML='<option value="">Escolha o estádio</option>'+stadiumMatchOptions(preferred);
 document.getElementById('matchDialogTitle').textContent='Registrar uma lembrança';
 if(key!==undefined){
  const found=findRecordMatch(Number(index),key);
  if(!found.game)return;
  currentMatchEdit={recordIndex:Number(index),key};
  document.getElementById('matchDialogTitle').textContent='Editar jogo';
  for(const name of ['date','homeTeam','awayTeam','competition','notes'])form.elements[name].value=found.game[name]||'';
  for(const name of ['homeScore','awayScore'])form.elements[name].value=matchScore(found.game[name])??'';
 }
 dialog.showModal();
}
function closeMatchDialog(){document.getElementById('matchDialog').close()}
function saveMatch(event){
 event.preventDefault();
 const form=event.target,error=document.getElementById('matchError');error.textContent='';
 const rawIndex=form.elements.stadiumIndex.value,index=Number(rawIndex);
 if(rawIndex===''||!Number.isInteger(index)||!visits[index]?.stadium){error.textContent='Escolha o estádio deste jogo.';return}
 let fields;
 try{fields=validateMatchFields(Object.fromEntries(new FormData(form)))}catch(exception){error.textContent=exception.message;return}
 const edit=currentMatchEdit;
 const found=edit?findRecordMatch(edit.recordIndex,edit.key):null;
 if(edit&&!found.game){error.textContent='Este jogo não está mais no cadastro. Feche e tente novamente.';return}
 const id=found?.game.id||globalThis.crypto?.randomUUID?.()||'game-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const game={...(found?.game||{}),...fields,id};
 const previous=visits;
 visits=visits.map((visit,i)=>{
  if(i!==index&&i!==edit?.recordIndex)return visit;
  let games=[...getRecordMatches(i)];
  if(edit&&i===edit.recordIndex)games=games.filter((_,position)=>position!==found.position);
  if(i===index)games.push(game);
  return {...visit,matches:games};
 });
 try{persist()}catch(exception){visits=previous;error.textContent='Não foi possível salvar neste navegador. Seus dados anteriores foram preservados. Exporte um backup ou libere espaço e tente novamente.';return}
 closeMatchDialog();render();
 document.getElementById('matchStadiumFilter').value=String(index);renderMatchSection();
 document.getElementById('matchStatus').textContent=edit?'Jogo atualizado e salvo neste navegador.':'Jogo registrado e salvo neste navegador.';
 showMatches(index);
}
function deleteMatch(index,key){
 const found=findRecordMatch(index,key);
 if(!found.game||!confirm('Excluir somente este jogo? O estádio e as outras lembranças serão mantidos.'))return;
 const previous=visits;
 visits=visits.map((visit,i)=>i===index?{...visit,matches:found.games.filter((_,position)=>position!==found.position)}:visit);
 try{persist()}catch{
  visits=previous;document.getElementById('matchStatus').textContent='Não foi possível excluir. O jogo foi preservado.';return;
 }
 render();document.getElementById('matchStatus').textContent='Jogo excluído. O estádio foi mantido.';
}
function initializeMatches(){
 document.getElementById('matchForm').addEventListener('submit',saveMatch);
 document.getElementById('matchDialog').addEventListener('close',()=>{currentMatchEdit=null});
 document.getElementById('matchStadiumFilter').addEventListener('change',renderMatchSection);
 document.getElementById('matchList').addEventListener('click',event=>{
  const button=event.target.closest('[data-match-action]');
  if(!button)return;
  const index=Number(button.dataset.record),key=button.dataset.game;
  if(button.dataset.matchAction==='edit')openMatchDialog(index,key);
  else if(button.dataset.matchAction==='delete')deleteMatch(index,key);
 });
}
