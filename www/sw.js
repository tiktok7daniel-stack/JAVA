/* CodeForge — Service worker: app shell offline (cache-first) e font in cache a runtime. */
const VERSION = 'codeforge-v4';
const SHELL = [
  './',
  './index.html',
  './css/style.css',
  './css/fonts.css',
  './fonts/Cairo-arabic-f8c8bb.woff2',
  './fonts/Cairo-latin-c4b7a0.woff2',
  './fonts/Inter-latin-1ab1ad.woff2',
  './fonts/JetBrainsMono-latin-1cd702.woff2',
  './js/app.js',
  './js/interpreter.js',
  './js/linter.js',
  './js/explainer.js',
  './js/verifica.js',
  './js/data/livelli/livello-0.js',
  './js/data/livelli/livello-1.js',
  './js/data/livelli/livello-2.js',
  './js/data/livelli/livello-3.js',
  './js/data/livelli/livello-4.js',
  './js/data/livelli/livello-5.js',
  './js/data/livelli/livello-6.js',
  './js/data/livelli/livello-7.js',
  './js/data/livelli/livello-8.js',
  './js/data/percorso.js',
  './js/data/glossary.js',
  './js/data/esame.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: !isFont }).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    }),
  );
});
