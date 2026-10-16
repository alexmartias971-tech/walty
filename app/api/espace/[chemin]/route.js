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
 * Variable facultative : CARTEDEFID_URL (par défaut https://cartedefid.vercel.app).
 */

const BASE = (process.env.CARTEDEFID_URL || "https://cartedefid.vercel.app").trim().replace(/\/+$/, "");
const ROUTES = new Set([
  // v12
  "login", "logout", "me", "scan", "customers", "stats", "offers", "notifications",
  // v13 : ma carte, mon programme, historique des passages, fiche client, chiffres détaillés
  "card", "program", "history", "customer", "insights",
]);
const COOKIE = "commercant_session";

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

async function relay(request, ctx) {
  const { chemin = "" } = await ctx.params;
  const route = Array.isArray(chemin) ? chemin.join("/") : String(chemin);
  if (!ROUTES.has(route)) return json({ ok: false, error: "Adresse inconnue." }, 404);

  // Les actions (POST, DELETE) ne sont acceptées que depuis walty.fr lui-même
  if (request.method !== "GET" && !sameOrigin(request)) return json({ ok: false, error: "Demande refusée." }, 403);

  const url = new URL(request.url);
  const headers = { Accept: "application/json" };
  const badge = request.cookies.get(COOKIE)?.value;
  if (badge && /^[\w.-]{1,300}$/.test(badge)) headers.Cookie = `${COOKIE}=${badge}`;
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

  const out = json(data, res.status);
  // Le badge de connexion (créé ou effacé par le logiciel de cartes) est posé sur walty.fr
  const cookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  for (const c of cookies) {
    if (c.startsWith(`${COOKIE}=`)) out.headers.append("Set-Cookie", c.replace(/;\s*Domain=[^;]*/gi, ""));
  }
  // « Quitter » : le badge est effacé sur walty.fr dans tous les cas
  if (route === "logout") {
    const secure = url.protocol === "https:" ? "; Secure" : "";
    out.headers.append("Set-Cookie", `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
  }
  return out;
}

export const GET = relay;
export const POST = relay;
export const DELETE = relay;
