/**
 * Petits outils partagés par les écrans de l'espace commerçant (walty.fr/espace).
 * Toutes les données passent par /api/espace/… (passerelle vers le logiciel de cartes).
 */

export const TZ = "America/Guadeloupe";

export async function api(path, init = {}) {
  try {
    const res = await fetch(`/api/espace/${path}`, {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers || {}) },
    });
    const data = await res.json().catch(() => ({ ok: false, error: "Réponse illisible. Réessayez." }));
    return { ...data, status: res.status, unavailable: !!data.unavailable || res.status === 501 };
  } catch {
    return { ok: false, status: 0, error: "Pas de connexion internet. Vérifiez le réseau et réessayez." };
  }
}
export const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body || {}) });

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
