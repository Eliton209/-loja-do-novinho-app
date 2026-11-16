// Garimpador LDN legado: desativa o service worker antigo e limpa seu cache.
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.registration.unregister();
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('garimpador-ldn-')).map(key => caches.delete(key)));
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) client.navigate(client.url);
  })());
});
