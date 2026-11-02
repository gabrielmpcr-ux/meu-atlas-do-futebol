const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('aviation-airports.js','utf8')+'\n'+fs.readFileSync('aviation-model.js','utf8'),c);
const {aviationFlight:flight,aviationValidate:validate,aviationMerge:merge,aviationEntries:entries,aviationMetrics:metrics,aviationArc:arc,aviationAirport:airport}=c;
const raw={id:'one',origin:'GRU',destination:'SDU',dayMonth:'01/04',year:2024,yearStatus:'visible',code:'LA100',carrier:'Companhia',minutes:60};
test('keeps unknown values unknown and rejects malformed data before persistence',()=>{const f=flight(raw);assert.equal(f.minutes,60);assert(f.km>300&&f.km<500);assert.equal(f.yearStatus,'visible');const p=flight({id:'p',originCity:'Córdoba',destinationCity:'São Paulo',kind:'presumed',minutes:180});assert.equal(p.km,null);assert.equal(p.minutes,null);assert.equal(p.year,null);assert.equal(p.yearStatus,'unknown');assert.throws(()=>flight({...raw,dayMonth:'31/02'}),/Dia/);assert.throws(()=>flight({...raw,year:1}),/Ano/);assert.throws(()=>flight({...raw,minutes:'oops'}),/numérico/);assert.throws(()=>validate({flights:[raw,raw]}),/repetidos/)});
test('merge is idempotent and matches confirmed identity without guessing from estimated years',()=>{const a=validate({flights:[raw],trips:[]});const same=validate({flights:[{...raw,id:'two'}]});assert.equal(merge(a,same).added.length,0);const uncertain=validate({flights:[{...raw,id:'other',yearStatus:'estimated'}]});assert.equal(merge(a,uncertain).added.length,1);assert.equal(merge(a,a).skipped.length,1);assert.equal(a.flights.length,1)});
test('filters combine, preserve IDs and distinguish departures from arrivals',()=>{const a=validate({flights:[raw,{...raw,id:'return',origin:'SDU',destination:'GRU'},{id:'foreign',origin:'ASU',destination:'GRU',carrier:'Outra',year:2023,dayMonth:'02/03',yearStatus:'estimated'}],trips:[{id:'t',name:'Rio',flightIds:['one','return']}]});assert.equal(entries(a,{origin:'GRU'}).length,1);assert.equal(entries(a,{destination:'GRU'}).length,2);assert.equal(entries(a,{q:'sao paulo',quick:'international',year:'2023'})[0].id,'foreign');assert.equal(entries(a,{trip:'t',origin:'GRU'})[0].id,'one');assert.equal(entries(a,{quick:'bridge'}).length,2)});
test('route-inconsistent cards count once and never add distance or airports',()=>{const f=flight({...raw,origin:'GRU',destination:'GRU',minutes:''}),p=flight({id:'p',kind:'presumed',origin:'COR',destinationCity:'São Paulo'}),m=metrics([f,p]);assert.equal(m.count,2);assert.equal(m.km,0);assert.equal(m.kmCount,0);assert.equal(m.durationCount,0);assert.equal(m.presumed,1);assert.equal(entries({flights:[f,p],trips:[]},{origin:'GRU'}).length,0)});
test('great-circle paths end at the actual airports',()=>{const a=airport('GRU'),b=airport('LHR'),path=arc(a,b);assert.equal(path.length,33);assert(Math.abs(path[0][0]-a.lat)<1e-8);assert(Math.abs(path.at(-1)[1]-b.lng)<1e-8);assert(path.every(p=>p.every(Number.isFinite)))});

test('fills duration gaps from known airports without mutating recorded flight data',()=>{
 const recorded=flight({...raw,minutes:67}),missing=flight({...raw,id:'missing',minutes:null}),before=JSON.stringify(missing);
 assert.equal(c.aviationDuration(recorded),67);
 assert.equal(c.aviationDuration(missing),55);
 assert.equal(JSON.stringify(missing),before);
 const long=flight({...raw,id:'long',destination:'LHR',minutes:null});
 assert(c.aviationDuration(long)>600&&c.aviationDuration(long)<850);
 const total=metrics([recorded,missing,long]);
 assert.equal(total.durationCount,3);assert.equal(total.minutes,122+c.aviationDuration(long));
 assert.equal(c.aviationDuration(flight({...raw,origin:'GRU',destination:'GRU',minutes:null})),null);
 assert.equal(c.aviationDuration(flight({id:'p',kind:'presumed',origin:'ASU',destinationCity:'São Paulo'})),null);
});

test('recognizes added destinations and separates the two Istanbul airport locations',()=>{
 for(const code of ['UIO','OPO','MEX','NRT','BSB','IST','ISL']){
  const a=airport(code);assert(a,code);assert(Number.isFinite(a.lat)&&Math.abs(a.lat)<=90);assert(Number.isFinite(a.lng)&&Math.abs(a.lng)<=180);
  assert.doesNotThrow(()=>new Intl.DateTimeFormat('en',{timeZone:a.timezone}).format(0));
  const f=flight({...raw,id:code,destination:code});assert(f.km>0);assert(f.destinationCity);assert(f.destinationCountry);
 }
 const domestic=flight({...raw,origin:'UIO',destination:'GYE'});assert.equal(domestic.originCountry,domestic.destinationCountry);assert(domestic.km>200&&domestic.km<350);
 const old=airport('ISL'),current=airport('IST');assert(old.lat<41&&current.lat>41);assert.notEqual(old.lng,current.lng);
});
