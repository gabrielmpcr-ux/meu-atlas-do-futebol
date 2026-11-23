/* Merge only the requested flights and trip. Keep all other collection fields. */
const AtlasFlightImport=(()=>{
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const carrier=v=>norm(v).startsWith('latam')?'latam':norm(v);
const empty=v=>v===null||v===undefined||v==='';
const code=v=>String(v||'').replace(/\s/g,'').toUpperCase();
function plan(current,batch){
 aviationValidate(current);const incoming=AtlasTransfer.flightData(batch),working={...current,flights:current.flights.slice(),trips:(current.trips||[]).map(t=>({...t,flightIds:[...t.flightIds]}))},mapping=new Map(),pending=[];let existing=0,updated=0;
 for(const f of incoming.flights){
  const sameRoute=g=>g.origin===f.origin&&g.destination===f.destination&&Number(g.year)===f.year&&g.dayMonth===f.dayMonth;
  const candidates=working.flights.map((g,i)=>({g,i})).filter(({g})=>g.id===f.id||sameRoute(g)&&carrier(g.carrier)===carrier(f.carrier));
  if(candidates.length>1)throw Error('Há mais de um voo que pode corresponder a '+f.code+'. Confira os registros antes de incluir.');
  if(!candidates.length){pending.push(f);continue}
  const {g,i}=candidates[0];if(!sameRoute(g)||!empty(g.code)&&code(g.code)!==code(f.code))throw Error('Há um registro conflitante para '+f.code+'. Confira o número, a data e a rota antes de incluir.');
  existing++;mapping.set(f.id,g.id);const merged={...g};
  for(const field of ['code','carrier','boardTime','departureTime','arrivalTime','minutes','minutesKind','source','dateNote','yearNote'])if(empty(merged[field])&&!empty(f[field]))merged[field]=f[field];
  if(JSON.stringify(merged)!==JSON.stringify(g)){working.flights[i]=merged;updated++}
 }
 const remapped=incoming.trips.map(t=>({...t,flightIds:t.flightIds.map(id=>mapping.get(id)||id)}));
 const trips=remapped.filter(t=>!working.trips.some(old=>old.id!==t.id&&old.flightIds.length===t.flightIds.length&&t.flightIds.every(id=>old.flightIds.includes(id))));
 const result=AtlasTransfer.merge(working,{...incoming,flights:pending,trips});
 return {...result,existing:existing+result.skipped,updated,changed:JSON.stringify(result.data)!==JSON.stringify(current)};
}
return {plan};})();
