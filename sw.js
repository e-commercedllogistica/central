// Central DLL instalada como app: guarda só a "casca" do site (as páginas do próprio site)
// para abrir mesmo com a internet ruim. Busca SEMPRE a versão nova primeiro; a guardada só
// entra quando a internet falha. Dados do Supabase e fontes do Google NUNCA passam por aqui.
const CACHE = "central-dll-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const pedido = e.request;
  if (pedido.method !== "GET" || new URL(pedido.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(pedido)
      .then(resposta => {
        if (resposta.ok) { const copia = resposta.clone(); caches.open(CACHE).then(c => c.put(pedido, copia)); }
        return resposta;
      })
      .catch(() => caches.match(pedido).then(guardada => guardada || caches.match("./"))),
  );
});
