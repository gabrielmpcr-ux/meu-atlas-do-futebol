// Public behaviour only. Personal flight records are imported and stored locally.
const AVIATION_KEY='my-football-atlas-aviation-v1';
function aviationText(value,max=5000){return String(value??'').trim().slice(0,max)}
function aviationNormalize(value){return aviationText(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function aviationPositive(value,max){if(value===null||value===undefined||String(value).trim()==='')return null;const n=Number(value);if(!Number.isFinite(n)||n<0||n>max)throw Error('Valor numérico de voo inválido.');return n}
function aviationAirport(code){return aviationAirports[String(code||'').toUpperCase()]||null}
function aviationHasRoute(f){return !!(aviationAirport(f.origin)&&aviationAirport(f.destination)&&f.origin!==f.destination)}
function aviationDistance(a,b){const r=x=>x*Math.PI/180,dLat=r(b.lat-a.lat),dLng=r(b.lng-a.lng),q=Math.sin(dLat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLng/2)**2;return 6371.0088*2*Math.asin(Math.sqrt(Math.min(1,q)))}
function aviationFlight(raw,index=0){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Registro de voo inválido.');
 const origin=aviationText(raw.origin,8).toUpperCase(),destination=aviationText(raw.destination,8).toUpperCase(),a=aviationAirport(origin),b=aviationAirport(destination);
 const year=raw.year==null||raw.year===''?null:Number(raw.year);
 if(year!==null&&(!Number.isInteger(year)||year<1900||year>2200))throw Error('Ano do voo inválido.');
 const dayMonth=aviationText(raw.dayMonth,5);if(dayMonth){const match=/^(\d{2})\/(\d{2})$/.exec(dayMonth),y=year||2000;if(!match||new Date(Date.UTC(y,Number(match[2])-1,Number(match[1]))).toISOString().slice(0,10)!==`${y}-${match[2]}-${match[1]}`)throw Error('Dia e mês do voo inválidos.');}
 const time=value=>{const s=aviationText(value,5);if(s&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))throw Error('Horário de voo inválido.');return s};
 const kind=raw.kind==='presumed'?'presumed':'card';
 const f={id:aviationText(raw.id||'flight-'+index,100),code:aviationText(raw.code,30),carrier:aviationText(raw.carrier,120),origin,destination,originCity:a?.city||aviationText(raw.originCity,160),destinationCity:b?.city||aviationText(raw.destinationCity,160),originCountry:a?.country||aviationText(raw.originCountry,160),destinationCountry:b?.country||aviationText(raw.destinationCountry,160),dayMonth,year,yearStatus:year===null?'unknown':raw.yearStatus==='visible'?'visible':'estimated',kind,boardTime:time(raw.boardTime),departureTime:time(raw.departureTime),arrivalTime:time(raw.arrivalTime),minutes:aviationPositive(raw.minutes,1440),minutesKind:aviationText(raw.minutesKind,300),source:aviationText(raw.source,160),notes:aviationText(raw.notes),dateNote:aviationText(raw.dateNote,300),yearNote:aviationText(raw.yearNote,1000)};
 if(!f.origin&&!f.originCity||!f.destination&&!f.destinationCity)throw Error('Informe a origem e o destino do voo.');
 if(kind==='presumed')f.minutes=null;
 f.km=aviationHasRoute(f)?Math.round(aviationDistance(a,b)):null;
 return f;
}
function aviationValidate(raw){
 if(!raw||typeof raw!=='object'||!Array.isArray(raw.flights)||raw.flights.length>20000)throw Error('Arquivo de voos inválido.');
 const flights=raw.flights.map(aviationFlight);if(new Set(flights.map(f=>f.id)).size!==flights.length)throw Error('O arquivo tem identificadores de voo repetidos.');
 const ids=new Set(flights.map(f=>f.id)),tripIds=new Set();
 if(raw.trips!==undefined&&!Array.isArray(raw.trips)||raw.trips?.length>5000)throw Error('Lista de viagens inválida.');
 const trips=(raw.trips||[]).map((t,i)=>{if(!t||typeof t!=='object'||!Array.isArray(t.flightIds))throw Error('Viagem inválida.');const id=aviationText(t.id||'trip-'+i,100);if(tripIds.has(id))throw Error('Identificador de viagem repetido.');tripIds.add(id);return{id,name:aviationText(t.name,160)||'Minha viagem',flightIds:[...new Set(t.flightIds.map(String))].filter(id=>ids.has(id)),notes:aviationText(t.notes)}}).filter(t=>t.flightIds.length);
 return{version:1,flights,trips};
}
function aviationEmpty(){return{version:1,flights:[],trips:[]}}
function aviationIdentity(f){return f.kind==='card'&&f.yearStatus==='visible'&&f.year&&f.dayMonth&&f.code&&aviationHasRoute(f)?[f.code.replace(/\s/g,'').toUpperCase(),f.origin,f.destination,f.year,f.dayMonth].join('|'):''}
function aviationMerge(current,incoming){
 const result=aviationValidate(current),added=[],skipped=[],idMap=new Map();
 for(const f of incoming.flights){
  const identity=aviationIdentity(f),same=result.flights.find(old=>old.id===f.id||identity&&aviationIdentity(old)===identity);
  if(same){idMap.set(f.id,same.id);skipped.push(f.id);continue}
  result.flights.push(f);added.push(f.id);idMap.set(f.id,f.id);
 }
 for(const t of incoming.trips){if(result.trips.some(old=>old.id===t.id))continue;result.trips.push({...t,flightIds:[...new Set(t.flightIds.map(id=>idMap.get(id)||id))]})}
 return{data:aviationValidate(result),added,skipped};
}
function aviationDateKey(f){return f.year&&f.dayMonth?`${f.year}-${f.dayMonth.slice(3)}-${f.dayMonth.slice(0,2)}T${f.departureTime||'12:00'}`:''}
function aviationDateLabel(f){return f.dayMonth?`${f.dayMonth}${f.year?'/'+f.year:''}${f.yearStatus==='estimated'?' · ano estimado':''}`:f.dateNote||'Data a confirmar'}
function aviationEntries(data,state){
 const terms=aviationNormalize(state.q).split(/\s+/).filter(Boolean),trip=data.trips.find(t=>t.id===state.trip),allowed=trip?new Set(trip.flightIds):null;
 return data.flights.filter(f=>{
  if((state.origin||state.destination||state.airport||state.country)&&!aviationHasRoute(f))return false;
  if(allowed&&!allowed.has(f.id)||state.year&&String(f.year||'unknown')!==state.year||state.carrier&&f.carrier!==state.carrier||state.country&&f.destinationCountry!==state.country||state.origin&&f.origin!==state.origin||state.destination&&f.destination!==state.destination||state.airport&&f.origin!==state.airport&&f.destination!==state.airport)return false;
  if(state.quick==='international'&&(!f.originCountry||!f.destinationCountry||f.originCountry===f.destinationCountry))return false;
  if(state.quick==='gru'&&(!aviationHasRoute(f)||f.origin!=='GRU'))return false;
  if(state.quick==='bridge'&&![['São Paulo','Rio de Janeiro'],['Rio de Janeiro','São Paulo']].some(([a,b])=>f.originCity===a&&f.destinationCity===b))return false;
  const text=aviationNormalize([f.code,f.carrier,f.origin,f.destination,f.originCity,f.destinationCity,f.originCountry,f.destinationCountry].join(' '));return terms.every(t=>text.includes(t));
 }).sort((a,b)=>{const x=aviationDateKey(a),y=aviationDateKey(b);if(!x||!y)return Number(!x)-Number(!y)||a.id.localeCompare(b.id);return (state.sort==='oldest'?x.localeCompare(y):y.localeCompare(x))||a.id.localeCompare(b.id)});
}
function aviationMetrics(flights){const routes=flights.filter(f=>aviationHasRoute(f)),durations=flights.filter(f=>f.minutes!==null);return{count:flights.length,cards:flights.filter(f=>f.kind==='card').length,presumed:flights.filter(f=>f.kind==='presumed').length,km:routes.reduce((s,f)=>s+f.km,0),kmCount:routes.length,minutes:durations.reduce((s,f)=>s+f.minutes,0),durationCount:durations.length,estimated:flights.filter(f=>f.yearStatus==='estimated').length}}
function aviationRanking(flights,key){const counts=new Map();for(const f of flights){const name=key(f);if(name)counts.set(name,(counts.get(name)||0)+1)}return[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt'))}
function aviationArc(a,b){
 const r=x=>x*Math.PI/180,d=x=>x*180/Math.PI,v=p=>[Math.cos(r(p.lat))*Math.cos(r(p.lng)),Math.cos(r(p.lat))*Math.sin(r(p.lng)),Math.sin(r(p.lat))],u=v(a),w=v(b),angle=Math.acos(Math.max(-1,Math.min(1,u.reduce((s,n,i)=>s+n*w[i],0))));
 if(Math.sin(angle)<1e-6)return[[a.lat,a.lng],[b.lat,b.lng]];
 return Array.from({length:33},(_,i)=>{const t=i/32,A=Math.sin((1-t)*angle)/Math.sin(angle),B=Math.sin(t*angle)/Math.sin(angle),q=u.map((n,j)=>A*n+B*w[j]);return[d(Math.atan2(q[2],Math.hypot(q[0],q[1]))),d(Math.atan2(q[1],q[0]))]});
}
