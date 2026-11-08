/* Spreadsheet import planning: pure merge, no network, no writes, no replacement of collections. */
(function(root){'use strict';
const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases={'atletico mg':'atletico mineiro','clube atletico mineiro':'atletico mineiro','barcelona de guayaquil':'barcelona sc','barcelona equ':'barcelona sc','del valle':'independiente del valle','santos fc':'santos','se palmeiras':'palmeiras','sociedade esportiva palmeiras':'palmeiras','cr flamengo':'flamengo','clube de regatas do flamengo':'flamengo','fluminense fc':'fluminense','gremio fbpa':'gremio','ldu quito':'ldu','liga de quito':'ldu','liga deportiva universitaria':'ldu','ca penarol':'penarol','club atletico penarol':'penarol','olympiakos':'olympiacos','argentinos jrs':'argentinos juniors','ca boca juniors':'boca juniors','athletico pr':'athletico paranaense','atletico pr':'athletico paranaense','atletico paranaense':'athletico paranaense','rb bragantino':'red bull bragantino','bragantino':'red bull bragantino','junior':'junior barranquilla','atletico junior':'junior barranquilla','sao paulo fc':'sao paulo','club atletico rosario central':'rosario central'};
const team=value=>aliases[norm(value)]||norm(value);
const competitionAliases={'libertadores':'CONMEBOL Libertadores','copa libertadores':'CONMEBOL Libertadores','libertadores da america':'CONMEBOL Libertadores','copa libertadores da america':'CONMEBOL Libertadores','conmebol libertadores':'CONMEBOL Libertadores','copa sul americana':'CONMEBOL Sudamericana','copa sudamericana':'CONMEBOL Sudamericana','sul americana':'CONMEBOL Sudamericana','conmebol sudamericana':'CONMEBOL Sudamericana','conmebol sul americana':'CONMEBOL Sudamericana','recopa sul americana':'CONMEBOL Recopa','recopa sudamericana':'CONMEBOL Recopa','conmebol recopa':'CONMEBOL Recopa','campeonato brasileiro':'Campeonato Brasileiro','campeonato brasileiro serie a':'Campeonato Brasileiro','brasileirao':'Campeonato Brasileiro','campeonato paulista':'Campeonato Paulista','paulistao':'Campeonato Paulista','jogos olimpicos':'Jogos Olímpicos','olimpiadas':'Jogos Olímpicos'};
const competition=value=>competitionAliases[norm(value).replace(/ \d{4}$/,'')]||value;
function date(value){const s=String(value??'').trim();let m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/),y,mo,d;if(m){y=+m[1];mo=+m[2];d=+m[3]}else{m=s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);if(!m)return '';y=+m[3];mo=+m[2];d=+m[1]}const parsed=new Date(Date.UTC(y,mo-1,d));return parsed.getUTCFullYear()===y&&parsed.getUTCMonth()===mo-1&&parsed.getUTCDate()===d?String(y).padStart(4,'0')+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0'):''}

const pair=g=>[team(g.homeTeam),team(g.awayTeam)].sort().join('|');
const key=g=>date(g.date)&&team(g.homeTeam)&&team(g.awayTeam)?date(g.date)+'|'+pair(g):'';
const empty=v=>v===undefined||v===null||v==='';
const score=v=>!empty(v)&&Number.isInteger(Number(v))&&Number(v)>=0?Number(v):null;
const sourceUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
function plan(visits,batch){
 if(!Array.isArray(visits)||batch?.version!==1||!Array.isArray(batch.stadiums))throw Error('Dados de importação inválidos.');
 const next=visits.slice(),rows=[],issues=[],counts={added:0,updated:0,existing:0,conflicts:0,possible:0},targets=new Set();
 for(const stadium of batch.stadiums){
  const names=new Set([stadium.name,...(stadium.aliases||[])].map(norm)),city=norm(stadium.city);
  const indices=visits.map((v,i)=>({v,i})).filter(({v})=>String(v.iso).toUpperCase()===stadium.iso&&names.has(norm(v.stadium))&&(norm(v.city)===city||norm(v.city).startsWith(city+' '))).map(({i})=>i);
  if(indices.length!==1){issues.push(indices.length?'Há mais de um cadastro para '+stadium.name+'.':'Não foi encontrado o cadastro de '+stadium.name+'.');continue}
  const index=indices[0];if(targets.has(index)){issues.push('Dois estádios da planilha apontam para o mesmo cadastro.');continue}targets.add(index);
  const record=visits[index];if(record.matches!=null&&(!Array.isArray(record.matches)||record.matches.some(g=>!g||typeof g!=='object'||Array.isArray(g)))){issues.push('Confira o formato dos jogos já cadastrados em '+stadium.name+'.');continue}const games=Array.isArray(record.matches)?record.matches.slice():[];let changed=false;const seen=new Set();
  for(const incoming of stadium.matches){
   const id=key(incoming);if(!id||score(incoming.homeScore)===null||score(incoming.awayScore)===null||!incoming.competition)throw Error('Jogo incompleto na planilha de '+stadium.name+'.');
   if(seen.has(id))throw Error('Jogo repetido na planilha de '+stadium.name+'.');seen.add(id);
   const candidates=games.map((g,i)=>({g,i})).filter(({g})=>key(g)===id||g.id&&g.id===incoming.id);
   let status;
   if(candidates.length>1){status='conflicts'}
   else if(candidates.length===1){
    const {g,i}=candidates[0],reverse=team(g.homeTeam)===team(incoming.awayTeam),aligned={...incoming,homeScore:reverse?incoming.awayScore:incoming.homeScore,awayScore:reverse?incoming.homeScore:incoming.awayScore};
    if(key(g)&&key(g)!==id||['homeScore','awayScore'].some(k=>score(g[k])!==null&&score(g[k])!==score(aligned[k])))status='conflicts';
    else{const merged={...g};for(const field of ['id','homeScore','awayScore','competition','notes','sourceUrl','importSource'])if(empty(merged[field])&&!empty(aligned[field]))merged[field]=aligned[field];if(batch.normalizeCompetitionNames&&competition(merged.competition)===aligned.competition)merged.competition=aligned.competition;if(JSON.stringify(merged)!==JSON.stringify(g)){games[i]=merged;changed=true;status='updated'}else status='existing'}
   }else if(games.some(g=>!date(g.date)&&pair(g)===pair(incoming)&&String(g.date||'').includes(id.slice(0,4))))status='possible';
   else{games.push({...incoming});changed=true;status='added'}
   counts[status]++;rows.push({stadium:stadium.name,status,game:incoming});
  }
  if(changed)next[index]={...record,matches:games};
 }
 return {visits:next,rows,issues,counts,total:rows.length,changed:counts.added+counts.updated>0,blocked:issues.length>0||counts.conflicts>0||counts.possible>0};
}
const api={plan,sourceUrl};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasMatchImport=api;
})(typeof window!=='undefined'?window:globalThis);
