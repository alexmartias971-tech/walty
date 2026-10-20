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
 *   sans pouvoir le lire ni le fabriquer. Pour les rubriques du gérant (programme, offres, messages, historique,
 *   chiffres, ma carte, actions à la main), la passerelle demande d'abord au logiciel de cartes (adresse « role »)
 *   qui est connecté, et refuse (403) un employé connecté par code PIN. Le changement de mot de passe exige une
 *   connexion par mot de passe. Les actions à la main sont AUSSI refusées par le logiciel de cartes lui-même.
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
]);
/** Adresses en lecture seule (GET). */
const GET_ONLY = new Set(["export"]);
/** Adresses qui n'acceptent que POST (jamais de mot de passe dans une adresse GET). */
const POST_ONLY = new Set(["login-password", "password", "login-gerant", "manual", "reset-complete"]);
const COOKIE = "commercant_session";
/** Preuve « gérant » (connexion par mot de passe), signée par le logiciel de cartes, liée au badge de session. */
const ROLE_COOKIE = "commercant_role";
const COOKIES = [COOKIE, ROLE_COOKIE];
/** Rubriques réservées au gérant (refusées à un employé connecté par code PIN). */
const MANAGER_ONLY = new Set(["program", "offers", "notifications", "history", "insights", "stats", "card", "manual", "export"]);
/** Changer le mot de passe : seulement une session ouverte par mot de passe (même provisoire). */
const PASSWORD_ONLY = new Set(["password"]);
const LOGIN_ROUTES = new Set(["login", "login-password", "login-gerant"]);

export const dynamic = "force-dynamic";

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

/** Les cookies du commerçant à transmettre au logiciel de cartes. */
function cookieHeader(request) {
  const out = [];
  for (const name of COOKIES) {
    const v = request.cookies.get(name)?.value;
    if (v && /^[\w.-]{1,300}$/.test(v)) out.push(`${name}=${v}`);
  }
  return out.join("; ");
}

/**
 * Qui est connecté ? (gérant / employé) — demandé au logiciel de cartes, qui seul peut vérifier la signature.
 * null = adresse « role » pas encore installée sur le logiciel de cartes (ancien comportement, sans rôles).
 */
async function whoIs(cookie) {
  const res = await fetch(`${BASE}/api/merchant/role`, {
    headers: { Accept: "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
  });
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  if (!isJson && (res.status === 404 || res.status === 405)) return null;
  const data = isJson ? await res.json().catch(() => null) : null;
  if (!data || typeof data !== "object") throw new Error("role");
  return { status: res.status, ...data };
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
  const cookie = cookieHeader(request);
  if (cookie) headers.Cookie = cookie;

  // Rubriques du gérant : un employé (code PIN) est refusé ici, côté serveur
  if (MANAGER_ONLY.has(route) || PASSWORD_ONLY.has(route)) {
    let who;
    try {
      who = await whoIs(cookie);
    } catch {
      return json({ ok: false, error: "Le service est momentanément indisponible. Vérifiez votre connexion et réessayez." }, 502);
    }
    if (who) {
      if (who.status === 401 || !who.ok) return json({ ok: false, error: vous(who.error) || "Session expirée : reconnectez-vous." }, 401);
      const allowed = PASSWORD_ONLY.has(route) ? who.password === true : who.role === "gerant";
      if (!allowed) {
        return json({
          ok: false,
          forbidden: true,
          error: PASSWORD_ONLY.has(route)
            ? "Le mot de passe se change depuis une connexion par e-mail et mot de passe."
            : "Réservé au gérant : connectez-vous avec votre e-mail et votre mot de passe.",
        }, 403);
      }
    }
  }
  let body;
  if (request.method === "POST" || request.method === "DELETE") {
    body = await request.text();
    if (body.length > 10000) return json({ ok: false, error: "Demande trop longue." }, 413);
    if (body) headers["Content-Type"] = "application/json";
  }

  let res;
  try {
    res = await fetch(`${BASE}/api/merchant/${route}${url.search.slice(0, 600)}`, {
      method: request.method,
      headers,
      body: body || undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    return json({ ok: false, error: "Le service est momentanément indisponible. Vérifiez votre connexion et réessayez." }, 502);
  }

  // « Exporter en Excel » : le fichier CSV passe tel quel (jamais mis en cache)
  if (route === "export" && res.ok && (res.headers.get("content-type") || "").startsWith("text/csv")) {
    const disposition = res.headers.get("content-disposition") || "";
    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": /^attachment; filename="walty-[a-z]+-\d{4}-\d{2}-\d{2}\.csv"$/.test(disposition) ? disposition : 'attachment; filename="walty-export.csv"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  let data = null;
  try {
    if ((res.headers.get("content-type") || "").includes("application/json")) data = await res.json();
  } catch {
    data = null;
  }
  if (!data || typeof data !== "object") {
    // Adresse pas encore installée sur le logiciel de cartes (page 404 en HTML) : l'espace s'en passe.
    if (res.status === 404 || res.status === 405) {
      return json({ ok: false, unavailable: true, error: "Cette fonction arrive bientôt." }, 501);
    }
    return json({ ok: false, error: "L'espace commerçant est en cours de mise à jour. Réessayez dans quelques minutes." }, 502);
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

  const out = json(data, status);
  // Le badge de connexion (créé ou effacé par le logiciel de cartes) est posé sur walty.fr
  const cookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  for (const c of cookies) {
    if (COOKIES.some((n) => c.startsWith(`${n}=`))) out.headers.append("Set-Cookie", c.replace(/;\s*Domain=[^;]*/gi, ""));
  }
  const secure = url.protocol === "https:" ? "; Secure" : "";
  // « Quitter » : le badge et la preuve « gérant » sont effacés sur walty.fr dans tous les cas
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
