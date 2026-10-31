// Independent one-way flight equivalents, not a reconstruction of actual journeys.
function normalizeFlightCity(value){
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
const flightCityIndex=new Map();
for(const city of flightCities){
 for(const name of [city.name,...city.aliases])flightCityIndex.set(city.iso+'|'+normalizeFlightCity(name),city);
}
function validFlightCoordinates(lat,lng){
 const present=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
 return present(lat)&&present(lng)&&Number.isFinite(Number(lat))&&Number.isFinite(Number(lng))&&Math.abs(Number(lat))<=90&&Math.abs(Number(lng))<=180;
}
function greatCircleKm(origin,destination){
 const radians=degrees=>degrees*Math.PI/180;
 const dLat=radians(destination.lat-origin.lat),dLng=radians(destination.lng-origin.lng);
 const a=Math.sin(dLat/2)**2+Math.cos(radians(origin.lat))*Math.cos(radians(destination.lat))*Math.sin(dLng/2)**2;
 return 6371.0088*2*Math.atan2(Math.sqrt(Math.min(1,Math.max(0,a))),Math.sqrt(Math.max(0,1-a)));
}
function calculateFlightMetrics(records){
 const destinations=new Map();
 for(const visit of records){
  const iso=String(visit.iso||'').trim().toUpperCase();
  if(!iso||iso==='BRA'||!String(visit.city||'').trim())continue;
  const reference=flightCityIndex.get(iso+'|'+normalizeFlightCity(visit.city));
  const name=reference?.name||String(visit.city).trim();
  const key=iso+'|'+normalizeFlightCity(name);
  if(!destinations.has(key))destinations.set(key,{iso,name,location:reference||null});
  const destination=destinations.get(key);
  if(!destination.location&&validFlightCoordinates(visit.lat,visit.lng))destination.location={lat:Number(visit.lat),lng:Number(visit.lng)};
 }
 let kilometers=0,hours=0,included=0;const missing=[];
 for(const destination of destinations.values()){
  if(!destination.location){missing.push(destination.name);continue}
  const km=greatCircleKm(flightOrigin,destination.location);
  kilometers+=km;hours+=km/800+.5;included++;
 }
 return {kilometers,hours,included,totalCities:destinations.size,missing};
}
function renderFlightMetrics(records){
 const metric=calculateFlightMetrics(records);
 const number=value=>Math.round(value).toLocaleString('pt-BR');
 document.getElementById('flightHours').textContent=number(metric.hours);
 document.getElementById('flightKilometers').textContent=number(metric.kilometers);
 document.getElementById('flightDestinations').textContent=metric.included+' '+(metric.included===1?'destino':'destinos')+' · só ida';
 const missing=document.getElementById('flightMissing');
 missing.hidden=!metric.missing.length;
 missing.textContent=metric.missing.length+' '+(metric.missing.length===1?'cidade não incluída':'cidades não incluídas')+' por falta de localização.';
 document.getElementById('flightMissingNames').textContent=metric.missing.length?'Faltam coordenadas de: '+metric.missing.join(', ')+'.':'';
}
