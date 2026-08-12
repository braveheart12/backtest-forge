/* Backtest Forge — optional offline shell cache [DR-36]. Host beside backtest_forge.html. */
const CACHE = 'btforge-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin && e.request.mode === 'navigate') {
    // network-first for the shell, cache fallback for offline relaunch
    e.respondWith(fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put('./', r.clone())); return r; }).catch(() => caches.match('./')));
  }
  // API calls (Binance/ccxt CDN) pass through untouched — market data is never served stale.
});
