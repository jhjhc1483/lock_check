/* 예전 버전(PWA)이 깔아 둔 오프라인 저장을 지우는 파일.
   이미 이 사이트를 열어 본 휴대폰에서 낡은 화면이 계속 뜨지 않도록,
   저장해 둔 화면을 모두 지우고 스스로 해제한 뒤 새 화면으로 다시 연다.
   모든 휴대폰에서 정리가 끝난 뒤(몇 달 뒤)에는 이 파일을 지워도 된다. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({type: 'window'});
    clients.forEach(c => c.navigate(c.url).catch(() => {}));
  })());
});
