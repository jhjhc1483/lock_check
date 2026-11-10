/* 오프라인에서도 바로 열리도록 페이지를 저장해 두는 서비스 워커.
   저장된 화면을 즉시 보여 주고, 연결돼 있으면 뒤에서 최신 버전으로 바꿔 둔다(다음 실행부터 반영).
   점검 결과는 어디에도 저장하지 않는다. */
const CACHE = 'lockcheck-v1';
const ASSETS = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // ?app=soldier 같은 주소도 같은 페이지로 취급
  const key = req.mode === 'navigate' ? self.registration.scope : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(key, {ignoreSearch: true});
    const net = fetch(req).then(res => {
      if (res.ok && !res.redirected) cache.put(key, res.clone());
      return res;
    });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
