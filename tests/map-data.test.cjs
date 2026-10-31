const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('data/countries.geojson','utf8'));

test('local map preserves all country features and small visited countries',()=>{
 assert.equal(data.type,'FeatureCollection');assert.equal(data.features.length,258);
 const codes=new Set(data.features.map(f=>f.properties['ISO3166-1-Alpha-3']));
 const context=vm.createContext({});
 vm.runInContext(fs.readFileSync('stadium-catalog.js','utf8')+'\nthis.catalog=stadiumCatalog;',context);
 for(const stadium of context.catalog)assert(codes.has(stadium.iso),stadium.iso);
 for(const iso of ['MCO','AUT','URY','PRY'])assert(codes.has(iso),iso);
 assert(fs.statSync('data/countries.geojson').size<2_000_000);
});

test('simplified country rings remain closed and coordinates stay on Earth',()=>{
 for(const feature of data.features){
  const geometry=feature.geometry;
  assert(['Polygon','MultiPolygon'].includes(geometry.type));
  const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
  for(const polygon of polygons)for(const ring of polygon){
   assert(ring.length>=4);assert.deepEqual(ring[0],ring[ring.length-1]);
   for(const [lng,lat] of ring){assert(Number.isFinite(lng)&&Math.abs(lng)<=180);assert(Number.isFinite(lat)&&Math.abs(lat)<=90)}
  }
 }
});
