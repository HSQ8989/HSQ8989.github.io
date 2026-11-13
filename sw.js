self.addEventListener('install', function(e) {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', function(e) {
  // 不拦截API请求，其他静态资源缓存
  if (e.request.url.includes('webapi.sporttery.cn') || e.request.url.includes('data.json')) return;
});