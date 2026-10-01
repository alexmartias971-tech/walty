/**
 * Les chiffres de l'espace commerçant, écrits avec des mots de commerçant.
 * `plan` = formule minimale qui débloque le chiffre.
 * Tant que l'espace n'est pas branché à l'application de cartes, on affiche des données d'exemple.
 */

export const PLAN_RANK = { essentiel: 0, premium: 1, pro: 2 };

export const demoStats = {
  clients: 186,
  newClients: 23,
  visits: 412,
  rewards: 31,
  loyalRate: 64,
  toWinBack: 27,
  afterMessage: 18,
  basket: 5,          // panier moyen saisi par le commerçant, en €
  googleReviews: 14,
  weekly: [62, 71, 68, 80, 77, 94, 88, 103],
  weeks: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"],
  recent: [
    { name: "Maëlys", stamps: "8/10", when: "il y a 12 min" },
    { name: "Jordan", stamps: "3/10", when: "il y a 40 min" },
    { name: "Sandrine", stamps: "10/10 · cadeau", when: "il y a 1 h" },
    { name: "Kévin", stamps: "1/10", when: "hier" },
    { name: "Laura", stamps: "6/10", when: "hier" },
  ],
};

/** Un commerçant qui vient d'être activé : tout est à zéro. */
export const emptyStats = {
  clients: 0, newClients: 0, visits: 0, rewards: 0, loyalRate: 0, toWinBack: 0, afterMessage: 0, basket: 0, googleReviews: 0,
  weekly: [0, 0, 0, 0, 0, 0, 0, 0],
  weeks: demoStats.weeks,
  recent: [],
};

const eur = (n) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";

export function kpiTiles(s = demoStats) {
  const fresh = !s.visits;
  return [
    { id: "clients", plan: "essentiel", label: "Clients sur votre carte", value: s.clients, note: fresh ? "Dès le premier scan" : `+${s.newClients} ce mois`, up: !fresh },
    { id: "visits", plan: "essentiel", label: "Passages ce mois", value: s.visits, note: "1 passage = 1 tampon" },
    { id: "rewards", plan: "essentiel", label: "Cadeaux offerts", value: s.rewards, note: "ce mois" },
    { id: "loyal", plan: "premium", label: "Clients fidèles", value: `${s.loyalRate} %`, note: "reviennent au moins 2 fois" },
    { id: "winback", plan: "premium", label: "Clients à relancer", value: s.toWinBack, note: "pas venus depuis 30 jours" },
    { id: "after", plan: "premium", label: "Venus après un message", value: s.afterMessage, note: "dans les 3 jours" },
    { id: "money", plan: "pro", label: "Argent rapporté (estimé)", value: eur(s.visits * s.basket), note: s.basket ? `passages × panier moyen de ${s.basket} €` : "passages × votre panier moyen" },
    { id: "reviews", plan: "pro", label: "Avis Google obtenus", value: s.googleReviews, note: "grâce aux demandes automatiques" },
  ];
}

export const planLabel = { essentiel: "Essentiel", premium: "Premium", pro: "Pro" };
