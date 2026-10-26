/**
 * Petits outils partagés par les écrans de l'espace commerçant (walty.fr/espace).
 * Toutes les données passent par /api/espace/… (passerelle vers le logiciel de cartes).
 */

export const TZ = "America/Guadeloupe";

/**
 * Le commerce affiché par CET onglet (donné par « me »). Il part avec chaque action (en-tête X-Walty-Commerce) : si une autre
 * connexion a eu lieu entre-temps dans le navigateur (un autre commerce, entrée Walty), le logiciel de cartes refuse l'action
 * comme une session expirée et l'espace se recharge sur le bon commerce, au lieu d'agir sur l'autre.
 */
let commerce = null;
export function setCommerce(id) {
  commerce = typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;
}

export async function api(path, init = {}) {
  try {
    const write = !!init.method && init.method !== "GET";
    const res = await fetch(`/api/espace/${path}`, {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(write && commerce ? { "X-Walty-Commerce": commerce } : {}),
        ...(init.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({ ok: false, error: "Réponse illisible. Réessayez." }));
    return { ...data, status: res.status, unavailable: !!data.unavailable || res.status === 501 };
  } catch {
    return { ok: false, status: 0, error: "Pas de connexion internet. Vérifiez le réseau et réessayez." };
  }
}
export const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body || {}) });

/* ─────────────── Mémoire des rubriques (plus d'écran blanc en passant d'une rubrique à l'autre) ───────────────
 * « Stale-while-revalidate », en mémoire seulement (jamais sur le disque de l'appareil) :
 * - on affiche TOUT DE SUITE la dernière réponse connue de la rubrique, puis on la remet à jour en arrière-plan ;
 * - une rubrique pré-chargée il y a moins de FRESH_MS n'est pas redemandée ;
 * - deux demandes de la même adresse en même temps n'en font qu'une ;
 * - seules les réponses réussies (ok) sont gardées ; tout est effacé à la connexion, à la déconnexion
 *   et quand la session expire (clearCache) ;
 * - après une action (tampon, offre, message, réglages…), invalidate() marque les rubriques concernées à recharger. */
const FRESH_MS = 4000;
const memo = new Map(); // adresse -> { at, data }
const inflight = new Map(); // adresse -> Promise
let generation = 0; // change à chaque clearCache : une réponse arrivée après une déconnexion n'est pas gardée

/** Dernière réponse connue (ou null). */
export const peek = (path) => memo.get(path)?.data ?? null;

/** Demande l'adresse (une seule fois si plusieurs écrans la veulent en même temps) et garde la réponse si elle est réussie. */
export function fetchFresh(path) {
  if (inflight.has(path)) return inflight.get(path);
  const gen = generation;
  const p = api(path).then((r) => {
    if (gen !== generation) return r;
    inflight.delete(path);
    if (r && r.ok) memo.set(path, { at: Date.now(), data: r });
    return r;
  });
  inflight.set(path, p);
  return p;
}

/** La réponse en mémoire si elle vient d'être chargée (moins de FRESH_MS), sinon une demande fraîche. */
export function getFresh(path) {
  const hit = memo.get(path);
  if (hit && Date.now() - hit.at < FRESH_MS) return Promise.resolve(hit.data);
  return fetchFresh(path);
}

/**
 * Affiche d'abord la réponse en mémoire (onData(réponse, true)), puis la réponse fraîche (onData(réponse, false)).
 * Renvoie la réponse fraîche (ou la réponse en mémoire si elle vient d'être chargée).
 */
export async function swr(path, onData) {
  const hit = memo.get(path);
  if (hit) {
    onData(hit.data, true);
    if (Date.now() - hit.at < FRESH_MS) return hit.data;
  }
  const r = await fetchFresh(path);
  // une réponse identique à celle déjà affichée ne redessine rien
  if (!hit || hit.data !== r) onData(r, false);
  return r;
}

/** Pré-charge des rubriques en arrière-plan (sans rien afficher). */
export function prefetch(paths) {
  for (const p of paths) {
    const hit = memo.get(p);
    if (!hit || Date.now() - hit.at >= FRESH_MS) fetchFresh(p).catch(() => {});
  }
}

/** Marque à recharger toutes les adresses qui commencent par l'un de ces débuts (elles restent affichées en attendant). */
export function invalidate(...prefixes) {
  for (const [key, v] of memo) if (prefixes.some((p) => key.startsWith(p))) memo.set(key, { ...v, at: 0 });
}

/** Oublie tout (connexion, déconnexion, session expirée) : rien d'un compte ne reste pour le suivant. */
export function clearCache() {
  generation++;
  memo.clear();
  inflight.clear();
}

/** Après un passage (tampon, cadeau, offre utilisée, annulation, tampon retiré) : ce qui change à l'écran. */
export const afterVisitChange = () => invalidate("history", "manual-log", "customers", "customer?", "stats", "insights");

/** « Exporter en Excel » : télécharge le fichier CSV préparé par le logiciel de cartes (clients ou passages). */
export async function downloadExport(type) {
  try {
    const res = await fetch(`/api/espace/export?type=${encodeURIComponent(type)}`, { cache: "no-store", credentials: "same-origin" });
    if (res.ok && (res.headers.get("content-type") || "").includes("text/csv")) {
      const blob = await res.blob();
      const m = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") || "");
      const name = m ? m[1] : `walty-${type}.csv`;
      const url = URL.createObjectURL(blob);
      download(url, name);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return { ok: true, name };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, unavailable: !!data.unavailable || res.status === 501, error: data.error };
  } catch {
    return { ok: false, status: 0, error: "Pas de connexion internet. Vérifiez le réseau et réessayez." };
  }
}

export const euro = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
export const fmtDateTime = (iso) =>
  iso ? new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "—";
export const fmtDate = (iso) => (iso ? new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric", month: "short" }).format(new Date(iso)) : "—");
export const fmtLongDate = (iso) => (iso ? new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)) : "—");
export const fmtTime = (iso) => (iso ? new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "—");
/** "2026-10-15" → « jeudi 15 octobre » */
export const fmtDay = (day) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(`${day}T12:00:00Z`));
export function fmtAgo(iso) {
  if (!iso) return "Pas encore de passage";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} j`;
  return fmtDate(iso);
}
export const initials = (name) => (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

/** Le jour (AAAA-MM-JJ) en heure de Guadeloupe (UTC-4, sans heure d'été). */
export const gpToday = () => new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10);
export function shiftDay(day, n) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Copie un texte (avec repli pour les vieux navigateurs). */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const t = document.createElement("textarea");
      t.value = text;
      t.setAttribute("readonly", "");
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      const ok = document.execCommand("copy");
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Télécharge un fichier à partir d'une adresse data: ou blob:. */
export function download(href, name) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** « Boulangerie du Port » → « boulangerie-du-port » (noms de fichiers). */
export const fileSlug = (text) =>
  (text || "commerce").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "commerce";

export const MODE_NAMES = { stamps: "Tampons", points: "Points", cashback: "Cagnotte (cashback)" };

/** Phrase courte du programme (« 10 passages = 1 café offert »), à partir des infos de « me ». */
export function programLine(p) {
  if (!p) return "";
  if (p.mode === "points") return `${Number(p.points_per_euro) || 1} point${Number(p.points_per_euro) > 1 ? "s" : ""} par euro, échangeables contre des cadeaux`;
  if (p.mode === "cashback") return `${Number(p.cashback_percent) || 0} % des achats sur la cagnotte`;
  return `${p.reward_threshold} passages = ${p.reward_description}`;
}
