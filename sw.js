/* 好彩今日 Service Worker - v4
 * 变更：
 *  - CACHE 版本升级 hc-v4
 *  - install 时逐个缓存资源（addAll → Promise.all + 独立 catch），单个失败不影响其他
 *  - fetch 数据类请求只缓存 r.ok === true 的成功响应，404/500 不写入缓存
 *  - data.json 请求统一忽略搜索参数（?t=...），按路径缓存
 *  - 静态资源缓存优先；data.json 与官方 API 网络优先，失败回退缓存
 *  - 激活时 skipWaiting + clients.claim，并通知所有打开页面刷新
 */
const CACHE='hc-v4';
const ASSETS=['/','/index.html','/manifest.json','/icon-192.PNG','/icon-512.PNG','/haocai.png'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // 逐个缓存，单个资源失败不影响其他（避免 addAll 原子操作整体失败）
      return Promise.all(ASSETS.map(function(url){
        return c.add(url).catch(function(){/* 忽略单个资源失败 */});
      }));
    }).then(function(){return self.skipWaiting();})
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
      .then(()=>{
        // 通知所有受控页面：新版本已激活，请刷新
        return self.clients.matchAll({type:'window'});
      })
      .then(clients=>{
        clients.forEach(c=>{
          try{c.postMessage({type:'SW_UPDATED',cache:CACHE});}catch(e){}
        });
      })
  );
});

// 把带搜索参数的 URL 归一成无搜索参数的 key（用于 data.json?t=...）
function cacheKeyOf(request){
  const url=new URL(request.url);
  // 仅对同源 data.json 做 key 归一；其他按原请求缓存
  if(url.origin===self.location.origin && url.pathname.endsWith('/data.json')){
    return new Request(url.origin+'/data.json',{method:'GET'});
  }
  return request;
}

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET')return;

  // 1) 数据类：data.json（同源）+ 官方体彩 API → 网络优先，失败回退缓存
  if(url.pathname.endsWith('/data.json') || url.hostname.includes('sporttery')){
    e.respondWith(
      fetch(e.request,{cache:'no-store'}).then(r=>{
        // 只缓存成功响应（r.ok === true），404/500 等错误不写入缓存
        if(r&&r.ok){
          const cp=r.clone();
          caches.open(CACHE).then(c=>c.put(cacheKeyOf(e.request),cp));
        }
        return r;
      }).catch(()=>caches.match(cacheKeyOf(e.request)))
    );
    return;
  }

  // 2) 静态资源：缓存优先，未命中再网络并写入
  e.respondWith(
    caches.match(e.request).then(c=>{
      if(c)return c;
      return fetch(e.request).then(r=>{
        if(!r||r.status!==200||r.type!=='basic')return r;
        const cp=r.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,cp));
        return r;
      }).catch(()=>caches.match('/index.html'));
    })
  );
});

// 接收页面发来的 SKIP_WAITING 消息（可选：页面主动触发更新）
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SKIP_WAITING'){
    self.skipWaiting();
  }
});
