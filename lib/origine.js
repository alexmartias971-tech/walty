/**
 * D'où vient une visite (Instagram, TikTok, Google…), sans cookie ni identifiant.
 * Gardé en mémoire le temps de la visite seulement : rien n'est écrit dans le navigateur.
 */
let entree = null;

/** Notée une seule fois, à la première page de la visite. */
export function noterEntree(referrer, utm) {
  if (!entree) entree = { referrer: referrer || "", utm_source: (utm && utm.utm_source) || "" };
}
export function entreeVisite() {
  return entree;
}

/** Nom du site d'origine, sans « www. » ; vide si la visite vient de walty.fr lui-même. */
export function hoteReferent(ref) {
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    return /(^|\.)walty\.fr$|\.vercel\.app$|^localhost$/.test(h) ? "" : h;
  } catch {
    return "";
  }
}

/** instagram | tiktok | facebook | google | direct | autre */
export function provenance(utmSource, hote) {
  const s = `${utmSource || ""} ${hote || ""}`.toLowerCase();
  if (/instagram|(^|\W)ig(\W|$)/.test(s)) return "instagram";
  if (/tiktok/.test(s)) return "tiktok";
  if (/facebook|messenger|(^|\W)fb(\W|$)|fb\.me/.test(s)) return "facebook";
  if (/google/.test(s)) return "google";
  if (!utmSource && !hote) return "direct";
  return "autre";
}
