/* Cátedra — modo sin conexión. © Carlo · Dev */
const V = "catedra-v3", BASE = ["./", "index.html", "aula.html", "panel.html", "certificado.html", "estilo.css", "datos.js", "logica.js", "store.js", "tema.js", "app.js", "aula.js", "panel.js", "qr.js", "pwa.js", "nav-sec.js", "efectos.js", "icono-192.png", "icono-512.png", "icono.svg", "manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
