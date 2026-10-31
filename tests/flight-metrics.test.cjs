const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const context=vm.createContext({});vm.runInContext(fs.readFileSync('flight-data.js','utf8')+'\n'+fs.readFileSync('flight-metrics.js','utf8')+'\nthis.origin=flightOrigin;',context);
const {calculateFlightMetrics:calculate,greatCircleKm:distance}=context;
const city=(name='Buenos Aires',iso='ARG',more={})=>({city:name,iso,...more});

test('great-circle distance matches known reference arcs and remains finite near the antipode',()=>{
 assert.equal(distance({lat:0,lng:0},{lat:0,lng:0}),0);
 assert(Math.abs(distance({lat:0,lng:0},{lat:0,lng:90})-10007.557)<.01);
 assert(Math.abs(distance({lat:0,lng:0},{lat:0,lng:180})-20015.114)<.01);
});
test('counts unique international cities, excluding Brazil and repeated stadiums',()=>{
 const one=calculate([city()]);const repeated=calculate([city(),city('Buenos Aires','arg',{stadium:'Outro'}),city('Santos','BRA')]);
 assert.equal(repeated.included,1);assert.equal(repeated.kilometers,one.kilometers);assert.equal(repeated.hours,one.hours);
 assert(one.kilometers>1600&&one.kilometers<1800);assert.equal(one.hours,one.kilometers/800+.5);
});
test('aliases share one destination while neighboring cities count separately',()=>{
 const same=calculate([city('Tokyo','JPN'),city('Tóquio','JPN')]);assert.equal(same.included,1);
 assert.equal(calculate([city('Washington DC','USA'),city('Landover','USA')]).included,2);
});
test('unknown cities need valid coordinates and may use a later complete record',()=>{
 const metric=calculate([city('Cidade desconhecida','ARG'),city('Cidade desconhecida','ARG',{lat:-35,lng:-58}),city('Sem localização','ARG',{lat:'',lng:0})]);
 assert.equal(metric.included,1);assert.equal(metric.totalCities,2);assert.deepEqual(Array.from(metric.missing),['Sem localização']);
 assert.equal(calculate([city('Ponto no Equador','ECU',{lat:0,lng:0})]).included,1);
});
test('calculation does not mutate personal data and empty/Brazil-only lists remain zero',()=>{
 const records=[city('Buenos Aires','ARG',{notes:'Pessoal',visitCount:4})];const before=JSON.stringify(records);calculate(records);assert.equal(JSON.stringify(records),before);
 for(const rows of [[],[city('São Paulo','BRA')]]){const m=calculate(rows);assert.equal(m.hours,0);assert.equal(m.kilometers,0);assert.equal(m.included,0)}
});
