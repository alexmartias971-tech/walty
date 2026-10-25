/*
 * Walty Caisse — service worker de l'espace commerçant (portée /espace seulement).
 * Rôle unique : rendre l'application installable et afficher une page « Pas de réseau » si le téléphone est hors ligne.
 * Il ne garde RIEN : aucune page, aucune réponse de l'API (/api/espace/… n'est jamais touché), aucune donnée client.
 */
const OFFLINE = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Walty Caisse · Pas de réseau</title><meta name="theme-color" content="#110c18">
<style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:#110c18;color:#f3ece3;font:600 18px/1.5 system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box}
b{display:block;font-size:26px;margin:16px 0 8px}button{margin-top:22px;min-height:56px;padding:0 28px;border:0;border-radius:16px;background:#ff5b1f;color:#fff;font:800 18px system-ui,sans-serif}</style></head>
<body><div><div style="font-size:54px">📶</div><b>Pas de réseau</b>Vérifiez le Wi-Fi ou les données mobiles.<br>La caisse revient toute seule dès que le réseau revient.<br><button onclick="location.reload()">Réessayer</button></div>
<script>addEventListener("online",function(){location.reload()});setInterval(function(){if(navigator.onLine)location.reload()},15000)</script></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Seulement l'ouverture des pages de l'espace (navigation) ; tout le reste (API, images, scripts) passe sans détour.
  if (req.mode !== "navigate" || req.method !== "GET") return;
  event.respondWith(
    fetch(req).catch(() => new Response(OFFLINE, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } })),
  );
});
