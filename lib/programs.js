/**
 * Les types de cartes de fidélité, les secteurs et ce que la carte affiche.
 * Source unique pour « Créer ma carte », l'aperçu de la carte, l'admin et l'espace commerçant.
 */

/* ───────── Secteurs ───────── */
// `legacy` = libellé enregistré dans la fiche (compatible avec l'admin et les anciennes demandes)
export const SECTORS_LIST = [
  { id: "snack", label: "Roulotte, snack", legacy: "Roulotte / food truck", gift: "1 bokit offert", programs: ["tampons", "coupon"], accent: "#ff5b1f" },
  { id: "restaurant", label: "Restaurant", legacy: "Snack / restaurant", gift: "1 dessert offert", programs: ["points", "tampons"], accent: "#ffa23d" },
  { id: "cafe", label: "Café, bar", legacy: "Coffee shop / bar", gift: "1 café offert", programs: ["tampons", "cashback"], accent: "#2de2c4" },
  { id: "boulangerie", label: "Boulangerie, pâtisserie", legacy: "Boulangerie / pâtisserie", gift: "1 viennoiserie offerte", programs: ["tampons", "points"], accent: "#ffa23d" },
  { id: "beaute", label: "Onglerie, institut, spa", legacy: "Onglerie / institut", gift: "-50 % sur la prochaine pose", programs: ["tampons", "niveaux"], accent: "#ff2e7e" },
  { id: "coiffure", label: "Barbier, coiffure", legacy: "Barbier / coiffure", gift: "1 coupe offerte", programs: ["tampons", "multipass"], accent: "#7b3cff" },
  { id: "sport", label: "Coach, salle de sport", legacy: "Coach / salle de sport", gift: "1 séance offerte", programs: ["multipass", "niveaux"], accent: "#ff5b1f" },
  { id: "loisirs", label: "Loisirs (karting, padel…)", legacy: "Loisirs (karting, padel…)", gift: "1 session offerte", programs: ["niveaux", "tampons"], accent: "#ffa23d" },
  { id: "boutique", label: "Boutique, prêt-à-porter", legacy: "Boutique / commerce", gift: "-10 € sur votre achat", programs: ["points", "cashback"], accent: "#ff2e7e" },
  { id: "epicerie", label: "Épicerie, supérette", legacy: "Épicerie / supérette", gift: "5 € offerts", programs: ["cashback", "points"], accent: "#3fbf6b" },
  { id: "lavage", label: "Lavage auto, garage", legacy: "Lavage auto / garage", gift: "1 lavage offert", programs: ["tampons", "multipass"], accent: "#2de2c4" },
  { id: "hotel", label: "Hôtel, location", legacy: "Hôtel / hébergement", gift: "1 nuit offerte", programs: ["niveaux", "cadeau"], accent: "#7b3cff" },
  { id: "autre", label: "Autre activité", legacy: "Autre", gift: "1 produit offert", programs: ["tampons", "points"], accent: "#ff5b1f" },
];
export const sectorById = Object.fromEntries(SECTORS_LIST.map((s) => [s.id, s]));

/* ───────── Types de carte ───────── */
// `plan` = formule minimale. Les 4 premiers sont dans toutes les formules.
export const PROGRAMS = [
  { id: "tampons", name: "Tampons", icon: "stamp", plan: "essentiel", line: "Un tampon à chaque passage. Carte pleine : cadeau.", example: "10 bokits achetés = 1 offert" },
  { id: "points", name: "Points", icon: "sparkle", plan: "essentiel", line: "Chaque euro dépensé rapporte des points.", example: "1 € = 1 point · 100 points = 5 € offerts" },
  { id: "remise", name: "Remise fidélité", icon: "percent", plan: "essentiel", line: "Plus il revient, plus sa remise grandit.", example: "-5 % dès 3 visites, -10 % dès 10 visites" },
  { id: "coupon", name: "Coupon", icon: "ticket", plan: "essentiel", line: "Une offre à utiliser une fois, pour faire venir.", example: "-20 % sur le premier achat" },
  { id: "cashback", name: "Cashback", icon: "coins", plan: "premium", line: "Une part de chaque achat va dans sa cagnotte.", example: "5 % reversés, cagnotte utilisable dès 10 €" },
  { id: "niveaux", name: "Niveaux VIP", icon: "crown", plan: "premium", line: "Il monte de niveau et débloque des avantages.", example: "Bronze → Argent → Or" },
  { id: "multipass", name: "Multipass", icon: "layers", plan: "premium", line: "Un carnet de séances payé d'avance.", example: "10 séances pour le prix de 9" },
  { id: "cadeau", name: "Carte cadeau", icon: "gift", plan: "premium", line: "Un montant à offrir, à dépenser chez vous.", example: "Cartes de 20, 50 ou 100 €" },
];
export const programById = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

/** Règles par défaut d'un type de carte, adaptées au secteur. */
export function defaultRules(type, sectorId) {
  const s = sectorById[sectorId] || sectorById.autre;
  switch (type) {
    case "tampons": return { total: 10, reward: s.gift, earn: "passage", minAmount: 10, welcome: false };
    case "points": return { perEuro: 1, tiers: [{ points: 100, reward: "5 € offerts" }, { points: 250, reward: s.gift }, { points: 500, reward: "20 € offerts" }] };
    case "remise": return { tiers: [{ visits: 3, pct: 5 }, { visits: 10, pct: 10 }, { visits: 20, pct: 15 }] };
    case "coupon": return { offer: "-20 % sur votre premier achat", days: 30, condition: "Une fois par client" };
    case "cashback": return { pct: 5, minUse: 10 };
    case "niveaux": return { levels: [{ name: "Bronze", visits: 0, perk: "Bienvenue au club" }, { name: "Argent", visits: 5, perk: "-5 % sur tout" }, { name: "Or", visits: 15, perk: `-10 % + ${s.gift.toLowerCase()} par an` }] };
    case "multipass": return { sessions: 10, price: 90, bonus: 1, item: s.id === "sport" ? "séance de coaching" : s.id === "lavage" ? "lavage" : s.id === "coiffure" ? "coupe" : "séance" };
    case "cadeau": return { amounts: [20, 50, 100], months: 12 };
    default: return {};
  }
}

const eur = (n, d = 0) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(n) || 0) + " €";
const plural = (n, w) => `${n} ${w}${Number(n) > 1 ? "s" : ""}`;
const pl = (item, n) => (Number(n) > 1 ? String(item || "séance").replace(/^(\S+)/, "$1s") : String(item || "séance"));

/**
 * Ce que la carte affiche pour un type et ses règles (valeurs d'exemple pour l'aperçu).
 * kind "stamps" : une grille de tampons ; kind "value" : une grande valeur au centre.
 */
export function programDisplay(program) {
  const type = program?.type || "tampons";
  const r = { ...defaultRules(type), ...(program?.rules || {}) };
  switch (type) {
    case "points": {
      const tiers = (r.tiers || []).filter((t) => t.points > 0 && t.reward).sort((a, b) => a.points - b.points);
      const first = tiers[0] || { points: 100, reward: "5 € offerts" };
      const pts = Math.round(first.points * 0.72);
      const rate = r.perEuro === 1 ? "1 € dépensé = 1 point" : `1 € dépensé = ${r.perEuro} points`;
      return { kind: "value", head: ["POINTS", String(pts)], big: String(pts), unit: "points", sub: `Plus que ${first.points - pts} points : ${first.reward.toLowerCase()}`, field: ["PROCHAIN CADEAU", first.reward], summary: rate + tiers.map((t) => ` · ${t.points} pts = ${t.reward}`).join("") };
    }
    case "remise": {
      const tiers = (r.tiers || []).filter((t) => t.visits > 0 && t.pct > 0).sort((a, b) => a.visits - b.visits);
      const cur = tiers[0] || { visits: 3, pct: 5 };
      const next = tiers[1];
      const visits = cur.visits + 2;
      return { kind: "value", head: ["VISITES", String(visits)], big: `-${cur.pct} %`, unit: "votre remise", sub: next ? `Plus que ${next.visits - visits} visites pour -${next.pct} %` : "Votre remise maximale", field: ["PROCHAIN PALIER", next ? `-${next.pct} % dès ${next.visits} visites` : "Atteint"], summary: tiers.map((t) => `-${t.pct} % dès ${plural(t.visits, "visite")}`).join(", ") };
    }
    case "coupon":
      return { kind: "value", head: ["OFFRE", "1 fois"], big: r.offer || "-20 %", unit: "", sub: `Valable ${plural(r.days, "jour")}`, field: ["CONDITION", r.condition || "Une fois par client"], summary: `${r.offer} · valable ${plural(r.days, "jour")}`, long: (r.offer || "").length > 12 };
    case "cashback":
      return { kind: "value", head: ["CAGNOTTE", eur(12.4, 2)], big: eur(12.4, 2), unit: "dans votre cagnotte", sub: `${r.pct} % de chaque achat · utilisable dès ${eur(r.minUse)}`, field: ["CASHBACK", `${r.pct} %`], summary: `${r.pct} % de chaque achat reversés, cagnotte utilisable dès ${eur(r.minUse)}` };
    case "niveaux": {
      const lv = (r.levels || []).filter((l) => l.name).sort((a, b) => a.visits - b.visits);
      const cur = lv[1] || lv[0] || { name: "Argent", perk: "-5 %" };
      const next = lv[2];
      const visits = (cur.visits || 0) + 3;
      return { kind: "value", head: ["NIVEAU", cur.name], big: cur.name, unit: "votre niveau", sub: next ? `Plus que ${Math.max(1, next.visits - visits)} visites pour ${next.name}` : "Niveau maximum", field: ["AVANTAGE", cur.perk || "—"], summary: lv.map((l, i) => (i === 0 ? l.name : `${l.name} (${plural(l.visits, "visite")})`)).join(" → ") };
    }
    case "multipass": {
      const tot = Number(r.sessions) + Number(r.bonus || 0);
      const left = Math.max(1, Math.round(tot * 0.7));
      const items = pl(r.item, tot);
      return { kind: "value", head: ["RESTANT", `${left}/${tot}`], big: String(left), unit: `restantes sur ${tot}`, sub: r.bonus ? `${r.sessions} payées + ${r.bonus} en cadeau` : `Carnet de ${tot} ${items}`, field: ["CARNET", `${tot} ${items} · ${eur(r.price)}`], summary: `Carnet de ${r.sessions} ${pl(r.item, r.sessions)} pour ${eur(r.price)}${r.bonus ? ` + ${r.bonus} en cadeau` : ""}` };
    }
    case "cadeau": {
      const am = (r.amounts || []).filter((a) => a > 0).sort((a, b) => a - b);
      const show = am[1] || am[0] || 50;
      return { kind: "value", head: ["SOLDE", eur(show)], big: eur(show, 2), unit: "à dépenser chez nous", sub: `Valable ${r.months} mois`, field: ["MONTANTS", am.map((a) => eur(a)).join(" · ")], summary: `Cartes cadeaux de ${am.map((a) => eur(a)).join(", ")} · valables ${r.months} mois` };
    }
    case "tampons":
    default: {
      const total = Math.min(12, Math.max(4, Number(r.total) || 10));
      const reward = (r.reward || "1 produit offert").trim() || "1 produit offert";
      const rule = r.earn === "montant" ? `1 tampon dès ${eur(r.minAmount)} d'achat` : "1 tampon par passage";
      return { kind: "stamps", head: ["TAMPONS", null], total, reward, field: ["RÉCOMPENSE", reward], summary: `${total} tampons = ${reward.toLowerCase()} · ${rule}${r.welcome ? " · 1 tampon offert à l'inscription" : ""}` };
    }
  }
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
