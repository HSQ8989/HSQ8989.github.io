const CACHE='hc-v2';
const ASSETS=['/','/index.html','/manifest.json','/icon-192.PNG','/icon-512.PNG','/data.json'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>clients.claim()));
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // API和数据：网络优先，失败用缓存
  if(url.pathname.includes('data.json')||url.hostname.includes('sporttery')){
    e.respondWith(fetch(e.request).then(r=>{
      const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  // 静态资源：缓存优先
  if(e.request.method==='GET'){
    e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
      const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r;
    })));
  }
});
