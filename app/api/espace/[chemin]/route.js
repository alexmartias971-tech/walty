/**
 * Espace commerçant de walty.fr : passerelle vers le logiciel de cartes (cartedefid).
 *
 * Le navigateur du commerçant ne parle qu'à walty.fr ; walty.fr relaie la demande,
 * côté serveur, à l'API commerçant du logiciel de cartes (qui vérifie le code PIN,
 * ajoute les tampons et met à jour les cartes Apple / Google Wallet).
 * - Aucun secret côté walty.fr : le badge de connexion (cookie « commercant_session »)
 *   est signé par le logiciel de cartes, walty.fr se contente de le transmettre.
 * - Seules les adresses de la liste ci-dessous passent.
 * - Si une adresse n'existe pas encore sur le logiciel de cartes (ex. card, program, history,
 *   customer, insights tant que leurs fichiers ne sont pas installés), la passerelle répond
 *   { unavailable: true } (code 501) : l'espace s'en passe et affiche une version simple.
 *
 * - login-password / password (connexion du gérant par mot de passe) : POST seulement, depuis walty.fr seulement ;
 *   le mot de passe ne passe que dans le corps de la demande, jamais dans l'adresse, et n'est jamais écrit dans les journaux.
 * - reset-request / reset-complete (« Mot de passe oublié ? ») : POST depuis walty.fr seulement ;
 *   l'adresse e-mail, le jeton du lien reçu par e-mail et le nouveau mot de passe ne passent que dans le corps de la demande.
 *   GET reset-request dit seulement si l'envoi d'e-mails est configuré ({ mail: true/false }).
 * - export (« Exporter en Excel », gérant seulement) : GET seulement ; le fichier CSV du logiciel de cartes est
 *   transmis tel quel (type text/csv, nom de fichier vérifié).
 *
 * - Rôles (gérant / employé) : la preuve « gérant » est un second cookie signé par le logiciel de cartes
 *   (« commercant_role », posé par login-gerant = connexion e-mail/identifiant + mot de passe) ; walty.fr le transmet
 *   sans pouvoir le lire ni le fabriquer. Les rubriques du gérant (programme, offres, messages, historique, chiffres,
 *   ma carte, actions à la main, export) et le changement de mot de passe sont refusés (403) à un employé
 *   PAR LE LOGICIEL DE CARTES LUI-MÊME (il vérifie le rôle à chaque demande, voir requireManager dans
 *   src/lib/merchant-space.ts de cartedefid). La passerelle ne redemande donc plus « role » avant de relayer :
 *   une traversée de l'Atlantique de moins par page (avant : 2 allers-retours walty → cartedefid, maintenant 1).
 *
 * Rapidité : les fonctions de walty.fr tournent à Paris (vercel.json : "regions": ["cdg1"], comme cartedefid,
 * à côté de la base de données en Irlande) ; la passerelle et le logiciel de cartes sont alors dans la même ville.
 *
 * Walty Caisse (appareil mémorisé 90 jours) : après une bonne connexion, le logiciel de cartes pose un troisième cookie
 * signé, « commercant_appareil » (voir src/lib/merchant-device.ts de cartedefid). Quand le badge de session (12 h) a
 * expiré (le navigateur l'a effacé, ou le logiciel de cartes répond 401), la passerelle demande elle-même un nouveau
 * badge (adresse « device ») puis relaie la demande avec : le commerçant ne retape rien. Refus (code PIN ou mot de passe
 * changé, accès désactivé, « Déconnecter tous les appareils ») => le cookie de l'appareil est effacé et la réponse porte
 * deviceSignedOut: true (l'espace affiche alors pourquoi il faut se reconnecter). walty.fr ne lit ni ne fabrique ce cookie.
 * - caisse : mode caisse (scan → tampon en une demande) ; devices : « Déconnecter tous les appareils » (gérant).
 *
 * Variable facultative : CARTEDEFID_URL (par défaut https://cartedefid.vercel.app).
 */

const BASE = (process.env.CARTEDEFID_URL || "https://cartedefid.vercel.app").trim().replace(/\/+$/, "");
const ROUTES = new Set([
  // v12
  "login", "logout", "me", "scan", "customers", "stats", "offers", "notifications",
  // v13 : ma carte, mon programme, historique des passages, fiche client, chiffres détaillés
  "card", "program", "history", "customer", "insights",
  // connexion du gérant par e-mail (ou identifiant) + mot de passe, et changement du mot de passe
  "login-password", "password",
  // rôles gérant / employé, actions à la main (sans QR code) et leurs badges dans l'historique
  "login-gerant", "role", "manual", "manual-log",
  // « Mot de passe oublié ? » : demande du lien par e-mail, puis nouveau mot de passe avec ce lien
  "reset-request", "reset-complete",
  // « Exporter en Excel » (clients, passages) : fichier CSV, gérant seulement
  "export",
  // Walty Caisse : mode caisse et « Déconnecter tous les appareils » (le renouvellement de l'appareil mémorisé est fait
  // par la passerelle elle-même, voir renewSession : le navigateur ne l'appelle jamais directement)
  "caisse", "devices",
]);
/** Adresses en lecture seule (GET). */
const GET_ONLY = new Set(["export"]);
/** Adresses qui n'acceptent que POST (jamais de mot de passe dans une adresse GET). */
const POST_ONLY = new Set(["login-password", "password", "login-gerant", "manual", "reset-complete", "caisse", "devices"]);
const COOKIE = "commercant_session";
/** Preuve « gérant » (connexion par mot de passe), signée par le logiciel de cartes, liée au badge de session. */
const ROLE_COOKIE = "commercant_role";
/** Appareil mémorisé 90 jours (Walty Caisse), signé par le logiciel de cartes. */
const DEVICE_COOKIE = "commercant_appareil";
const COOKIES = [COOKIE, ROLE_COOKIE, DEVICE_COOKIE];
const LOGIN_ROUTES = new Set(["login", "login-password", "login-gerant"]);
/** Adresses qui ne déclenchent jamais le renouvellement automatique de la session. */
const NO_RENEW = new Set(["login", "login-password", "login-gerant", "logout", "reset-request", "reset-complete"]);

export const dynamic = "force-dynamic";
// Région : Paris (cdg1), réglée pour tout le site dans vercel.json (à côté du logiciel de cartes).

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

/** Les messages du logiciel de cartes tutoient : sur walty.fr, on vouvoie le commerçant. */
const VOUS = [
  [/Contacte ton prestataire\.?/g, "Contactez Walty."],
  [/retape ton code PIN/gi, "retapez votre code PIN"],
  [/Tape un code PIN/g, "Tapez un code PIN"],
  [/réessaie\b/g, "réessayez"],
  [/Il te reste/g, "Il vous reste"],
  [/Indique /g, "Indiquez "],
  [/valide-le/g, "validez-le"],
  [/Choisis /g, "Choisissez "],
  [/Tu ne peux pas/g, "Vous ne pouvez pas"],
  [/Écris /g, "Écrivez "],
  [/Vérifie ta connexion/g, "Vérifiez votre connexion"],
  [/Autorise /g, "Autorisez "],
  [/Retape /g, "Retapez "],
];
const vous = (t) => (typeof t === "string" ? VOUS.reduce((s, [a, b]) => s.replace(a, b), t) : t);

/** Le navigateur d'où vient la demande est-il bien sur walty.fr ? (contre les faux formulaires d'autres sites) */
function sameOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    return !!origin && !!host && new URL(origin).host === host.split(",")[0].trim();
  } catch {
    return false;
  }
}

/** Le logiciel de cartes a-t-il l'adresse login-password ? (demande vide : il répond 400 en JSON s'il l'a, 404 sinon) */
async function passwordAvailable() {
  try {
    const res = await fetch(`${BASE}/api/merchant/login-password`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    const available = (res.headers.get("content-type") || "").includes("application/json");
    return json({ ok: true, available });
  } catch {
    return json({ ok: true, available: true }); // réseau indisponible : on affiche quand même le formulaire
  }
}

/** Les cookies du commerçant (valeurs bien formées seulement). */
function readJar(request) {
  const jar = {};
  for (const name of COOKIES) {
    const v = request.cookies.get(name)?.value;
    jar[name] = v && /^[\w.-]{1,300}$/.test(v) ? v : null;
  }
  return jar;
}
/** Les cookies du commerçant à transmettre au logiciel de cartes. */
function cookieHeader(jar) {
  return COOKIES.filter((n) => jar[n]).map((n) => `${n}=${jar[n]}`).join("; ");
}
const setCookiesOf = (res) =>
  (typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : []).filter((c) => COOKIES.some((n) => c.startsWith(`${n}=`)));

/**
 * Nouveau badge de session à partir du cookie de l'appareil (adresse « device » du logiciel de cartes).
 * Renvoie les Set-Cookie à poser sur walty.fr et les nouvelles valeurs (null = cookie effacé).
 */
async function renewSession(device) {
  try {
    const res = await fetch(`${BASE}/api/merchant/device`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", Cookie: `${DEVICE_COOKIE}=${device}` },
      body: JSON.stringify({ action: "renew" }),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    const setCookies = setCookiesOf(res);
    const values = {};
    for (const c of setCookies) {
      const m = /^([\w-]+)=([^;]*)/.exec(c);
      if (!m) continue;
      const gone = !m[2] || /;\s*max-age=0(?:;|$)/i.test(c) || /;\s*expires=thu, 01 jan 1970/i.test(c);
      values[m[1]] = gone ? null : /^[\w.-]{1,300}$/.test(m[2]) ? m[2] : null;
    }
    const data = await res.json().catch(() => null);
    return { ok: res.ok && !!data?.ok, status: res.status, setCookies, values };
  } catch {
    return { ok: false, status: 0, setCookies: [], values: {} };
  }
}

async function relay(request, ctx) {
  const { chemin = "" } = await ctx.params;
  const route = Array.isArray(chemin) ? chemin.join("/") : String(chemin);
  if (!ROUTES.has(route)) return json({ ok: false, error: "Adresse inconnue." }, 404);
  // GET login-password : la connexion par mot de passe est-elle installée sur le logiciel de cartes ? (sans aucune donnée)
  if (route === "login-password" && request.method === "GET") return passwordAvailable();
  if (POST_ONLY.has(route) && request.method !== "POST") return json({ ok: false, error: "Méthode non autorisée." }, 405);
  if (GET_ONLY.has(route) && request.method !== "GET") return json({ ok: false, error: "Méthode non autorisée." }, 405);

  // Les actions (POST, DELETE) ne sont acceptées que depuis walty.fr lui-même
  if (request.method !== "GET" && !sameOrigin(request)) return json({ ok: false, error: "Demande refusée." }, 403);

  const url = new URL(request.url);
  const headers = { Accept: "application/json" };
  const jar = readJar(request);
  const secure = url.protocol === "https:" ? "; Secure" : "";

  // Walty Caisse : session expirée mais appareil mémorisé => nouveau badge, sans rien demander au commerçant
  const renewCookies = [];
  let renewal = null;
  const canRenew = !NO_RENEW.has(route) && !!jar[DEVICE_COOKIE];
  async function renew() {
    renewal = await renewSession(jar[DEVICE_COOKIE]);
    renewCookies.push(...renewal.setCookies);
    for (const [name, value] of Object.entries(renewal.values)) jar[name] = value;
    // appareil d'un employé : une ancienne preuve « gérant » éventuelle ne vaut plus rien, on l'efface
    if (renewal.ok && !(ROLE_COOKIE in renewal.values) && jar[ROLE_COOKIE]) {
      jar[ROLE_COOKIE] = null;
      renewCookies.push(`${ROLE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
    }
    return renewal.ok;
  }
  if (canRenew && !jar[COOKIE]) await renew();

  // Rubriques du gérant : le logiciel de cartes refuse lui-même (403) un employé connecté par code PIN.
  let body;
  if (request.method === "POST" || request.method === "DELETE") {
    body = await request.text();
    if (body.length > 10000) return json({ ok: false, error: "Demande trop longue." }, 413);
    if (body) headers["Content-Type"] = "application/json";
  }

  const send = () => {
    const cookie = cookieHeader(jar);
    if (cookie) headers.Cookie = cookie;
    else delete headers.Cookie;
    return fetch(`${BASE}/api/merchant/${route}${url.search.slice(0, 600)}`, {
      method: request.method,
      headers,
      body: body || undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(25000),
    });
  };
  let res;
  try {
    res = await send();
    // Badge refusé (expiré, ou émis avant « Déconnecter tous les appareils ») : un essai de renouvellement, puis on relaie à nouveau
    if (res.status === 401 && canRenew && !renewal && jar[DEVICE_COOKIE]) {
      if (await renew()) {
        await res.arrayBuffer().catch(() => null);
        res = await send();
      }
    }
  } catch {
    return json({ ok: false, error: "Le service est momentanément indisponible. Vérifiez votre connexion et réessayez." }, 502);
  }
  /** Les cookies du renouvellement (nouveau badge, ou appareil effacé) sont posés sur walty.fr. */
  const withRenewal = (response) => {
    for (const c of renewCookies) response.headers.append("Set-Cookie", c.replace(/;\s*Domain=[^;]*/gi, ""));
    return response;
  };

  // « Exporter en Excel » : le fichier CSV passe tel quel (jamais mis en cache)
  if (route === "export" && res.ok && (res.headers.get("content-type") || "").startsWith("text/csv")) {
    const disposition = res.headers.get("content-disposition") || "";
    return withRenewal(new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": /^attachment; filename="walty-[a-z]+-\d{4}-\d{2}-\d{2}\.csv"$/.test(disposition) ? disposition : 'attachment; filename="walty-export.csv"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }));
  }

  const readData = async (r) => {
    try {
      return (r.headers.get("content-type") || "").includes("application/json") ? await r.json() : null;
    } catch {
      return null;
    }
  };
  let data = await readData(res);
  // « Qui est connecté ? » : badge présent mais refusé (ex. émis avant « Déconnecter tous les appareils ») alors que
  // l'appareil est mémorisé => un essai de renouvellement (qui dira aussi si l'appareil a été déconnecté)
  if (route === "me" && data?.ok && data.loggedIn === false && canRenew && !renewal && jar[DEVICE_COOKIE]) {
    try {
      if (await renew()) {
        res = await send();
        data = await readData(res);
      }
    } catch {
      // réponse d'avant gardée
    }
  }
  if (!data || typeof data !== "object") {
    // Adresse pas encore installée sur le logiciel de cartes (page 404 en HTML) : l'espace s'en passe.
    if (res.status === 404 || res.status === 405) {
      return withRenewal(json({ ok: false, unavailable: true, error: "Cette fonction arrive bientôt." }, 501));
    }
    return withRenewal(json({ ok: false, error: "L'espace commerçant est en cours de mise à jour. Réessayez dans quelques minutes." }, 502));
  }
  if (data.error) data.error = vous(data.error);
  if (data.done) data.done = vous(data.done);
  if (data.warning) data.warning = vous(data.warning);

  // Mauvais identifiant / mot de passe / code PIN : réponse normale (200, ok: false) pour ne pas remplir la console du navigateur
  // d'erreurs réseau ; la session expirée (401 sur « password ») garde son code.
  let status = res.status;
  if (LOGIN_ROUTES.has(route) && !data.ok && [400, 401, 429].includes(status)) status = 200;
  if (route === "password" && !data.ok && [400, 404].includes(status)) status = 200;
  if ((route === "reset-request" || route === "reset-complete") && !data.ok && status === 400) status = 200;
  // Appareil mémorisé refusé (code PIN / mot de passe changé, accès désactivé, « Déconnecter tous les appareils »)
  if (renewal && !renewal.ok && renewal.status === 401) data.deviceSignedOut = true;

  const out = withRenewal(json(data, status));
  // Le badge de connexion (créé ou effacé par le logiciel de cartes) est posé sur walty.fr
  const cookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  for (const c of cookies) {
    if (COOKIES.some((n) => c.startsWith(`${n}=`))) out.headers.append("Set-Cookie", c.replace(/;\s*Domain=[^;]*/gi, ""));
  }
  // « Quitter » : le badge, la preuve « gérant » et l'appareil mémorisé sont effacés sur walty.fr dans tous les cas
  if (route === "logout") {
    for (const n of COOKIES) out.headers.append("Set-Cookie", `${n}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
  }
  // Connexion par code PIN ou par l'ancienne adresse login-password : l'ancienne preuve « gérant » éventuelle est effacée
  if ((route === "login" || route === "login-password") && data.ok && request.cookies.get(ROLE_COOKIE)) {
    out.headers.append("Set-Cookie", `${ROLE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
  }
  return out;
}

export const GET = relay;
export const POST = relay;
export const DELETE = relay;
