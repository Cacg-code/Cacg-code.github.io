/* Cátedra — modo sin conexión. © Carlo · Dev */
const V = "catedra-v1", BASE = ["./", "index.html", "aula.html", "panel.html", "certificado.html", "estilo.css", "datos.js", "logica.js", "store.js", "tema.js", "app.js", "aula.js", "panel.js", "qr.js", "pwa.js", "icono.svg", "manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const red = fetch(e.request).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; }).catch(() => hit);
    return hit || red;
  }));
});
