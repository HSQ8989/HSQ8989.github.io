const CACHE_NAME='haocai-v1.1.0';
const CORE=['./','./index.html','./manifest.json','./data.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE_NAME);
 await Promise.all(CORE.map(async p=>{try{const r=await fetch(p,{cache:'reload'});if(r.ok)await c.put(p,r);}catch(_){}}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);if(u.origin!==self.location.origin)return;
 if(u.pathname.endsWith('/data.json')){
  e.respondWith((async()=>{try{const net=await fetch(r,{cache:'no-store'});if(net.ok){const c=await caches.open(CACHE_NAME);await c.put('./data.json',net.clone());}return net;}
  catch(_){return (await caches.match('./data.json'))||Response.error();}})());return;
 }
 e.respondWith((async()=>{const cached=await caches.match(r);if(cached)return cached;
  try{const net=await fetch(r);if(net.ok&&net.type==='basic'){const c=await caches.open(CACHE_NAME);await c.put(r,net.clone());}return net;}
  catch(_){return (await caches.match('./index.html'))||Response.error();}})());
});
