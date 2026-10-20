/**
 * La carte à tampons, les secteurs et ce que la carte affiche.
 * Source unique pour « Créer ma carte », l'aperçu de la carte et l'admin.
 * Walty ne fait qu'une sorte de carte : un tampon à chaque passage ; au bout des tampons,
 * un produit offert ou une remise.
 */

/* ───────── Secteurs ───────── */
// `legacy` = libellé enregistré dans la fiche (compatible avec l'admin et les anciennes demandes)
// `gift` = cadeau conseillé au bout des tampons ; `kind` = "produit" (produit offert) ou "remise".
export const SECTORS_LIST = [
  { id: "snack", label: "Roulotte, snack", legacy: "Roulotte / food truck", gift: "1 bokit offert", kind: "produit", accent: "#ff5b1f" },
  { id: "restaurant", label: "Restaurant", legacy: "Snack / restaurant", gift: "1 dessert offert", kind: "produit", accent: "#ffa23d" },
  { id: "cafe", label: "Café, bar", legacy: "Coffee shop / bar", gift: "1 café offert", kind: "produit", accent: "#2de2c4" },
  { id: "boulangerie", label: "Boulangerie, pâtisserie", legacy: "Boulangerie / pâtisserie", gift: "1 viennoiserie offerte", kind: "produit", accent: "#ffa23d" },
  { id: "beaute", label: "Onglerie, institut, spa", legacy: "Onglerie / institut", gift: "-50 % sur la prochaine pose", kind: "remise", accent: "#ff2e7e" },
  { id: "coiffure", label: "Barbier, coiffure", legacy: "Barbier / coiffure", gift: "1 coupe offerte", kind: "produit", accent: "#7b3cff" },
  { id: "sport", label: "Coach, salle de sport", legacy: "Coach / salle de sport", gift: "1 séance offerte", kind: "produit", accent: "#ff5b1f" },
  { id: "loisirs", label: "Loisirs (karting, padel…)", legacy: "Loisirs (karting, padel…)", gift: "1 session offerte", kind: "produit", accent: "#ffa23d" },
  { id: "boutique", label: "Boutique, prêt-à-porter", legacy: "Boutique / commerce", gift: "-10 € sur votre achat", kind: "remise", accent: "#ff2e7e" },
  { id: "epicerie", label: "Épicerie, supérette", legacy: "Épicerie / supérette", gift: "-5 € sur vos courses", kind: "remise", accent: "#3fbf6b" },
  { id: "lavage", label: "Lavage auto, garage", legacy: "Lavage auto / garage", gift: "1 lavage offert", kind: "produit", accent: "#2de2c4" },
  { id: "hotel", label: "Hôtel, location", legacy: "Hôtel / hébergement", gift: "1 nuit offerte", kind: "produit", accent: "#7b3cff" },
  { id: "autre", label: "Autre activité", legacy: "Autre", gift: "1 produit offert", kind: "produit", accent: "#ff5b1f" },
];
export const sectorById = Object.fromEntries(SECTORS_LIST.map((s) => [s.id, s]));

/* ───────── Le cadeau au bout des tampons ───────── */
export const REWARD_KINDS = [
  { id: "produit", label: "Un produit offert", suggestions: ["1 boisson offerte", "1 dessert offert"] },
  { id: "remise", label: "Une remise", suggestions: ["-20 % sur le prochain achat", "-5 € sur le prochain achat"] },
];

/* ───────── La carte ───────── */
export const PROGRAMS = [
  { id: "tampons", name: "Carte à tampons", icon: "stamp", plan: "essentiel", line: "Un tampon à chaque passage. Carte pleine : un produit offert ou une remise.", example: "10 bokits achetés = 1 offert" },
];
export const programById = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

/** Règles par défaut de la carte, adaptées au secteur. */
export function defaultRules(_type, sectorId) {
  const s = sectorById[sectorId] || sectorById.autre;
  return { total: 10, rewardKind: s.kind, reward: s.gift };
}

/**
 * Ce que la carte affiche pour ses règles (valeurs d'exemple pour l'aperçu) : une grille de tampons.
 */
export function programDisplay(program) {
  const r = { ...defaultRules(), ...(program?.rules || {}) };
  const total = Math.min(12, Math.max(4, Number(r.total) || 10));
  const reward = String(r.reward || "1 produit offert").trim() || "1 produit offert";
  return { kind: "stamps", head: ["TAMPONS", null], total, reward, field: ["RÉCOMPENSE", reward], summary: `${total} tampons = ${reward.toLowerCase()} · 1 tampon par passage` };
}

/* ───────── Couleurs ───────── */
export function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const n = parseInt(v, 16);
  return Number.isNaN(n) ? [255, 91, 31] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const isHex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || "").trim());
export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return "#" + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, "0")).join("");
}
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* ───────── Validations ───────── */
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
export function normPhone(v) { return String(v || "").replace(/[^\d+]/g, ""); }
export function isPhone(v) {
  const p = normPhone(v);
  return /^0\d{9}$/.test(p) || /^\+\d{10,14}$/.test(p) || /^00\d{10,14}$/.test(p);
}
/** SIRET : 14 chiffres, clé de Luhn (exception La Poste, SIREN 356000000). */
export function isSiret(v) {
  const s = String(v || "").replace(/\s/g, "");
  if (!/^\d{14}$/.test(s)) return false;
  if (s.startsWith("356000000")) return s.split("").reduce((a, c) => a + Number(c), 0) % 5 === 0;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = Number(s[13 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}
export const isPostal = (v) => /^\d{5}$/.test(String(v || "").trim());
