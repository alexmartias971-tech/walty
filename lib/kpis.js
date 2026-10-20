/**
 * Les statistiques de l'espace commerçant (formule Tout compris), écrites avec des mots de commerçant.
 * Sur le site, on affiche des données d'exemple.
 */

/** Rang des formules (les anciens codes comptent comme Tout compris). */
export const PLAN_RANK = { essentiel: 0, "tout-compris": 1, premium: 1, pro: 1, enseigne: 1 };

export const demoStats = {
  clients: 186,
  newClients: 23,
  visits: 412,
  rewards: 31,
  loyalRate: 64,
  basket: 5,          // panier moyen saisi par le commerçant, en €
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
  clients: 0, newClients: 0, visits: 0, rewards: 0, loyalRate: 0, basket: 0,
  weekly: [0, 0, 0, 0, 0, 0, 0, 0],
  weeks: demoStats.weeks,
  recent: [],
};

const eur = (n) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";

export function kpiTiles(s = demoStats) {
  const fresh = !s.visits;
  return [
    { id: "clients", label: "Clients sur votre carte", value: s.clients, note: fresh ? "Dès le premier scan" : `+${s.newClients} ce mois`, up: !fresh },
    { id: "visits", label: "Passages ce mois", value: s.visits, note: "1 passage = 1 tampon" },
    { id: "rewards", label: "Cadeaux offerts", value: s.rewards, note: "ce mois" },
    { id: "loyal", label: "Clients qui reviennent", value: `${s.loyalRate} %`, note: "au moins 2 passages" },
    { id: "money", label: "Argent rapporté (estimé)", value: eur(s.visits * s.basket), note: s.basket ? `passages × panier moyen de ${s.basket} €` : "passages × votre panier moyen" },
  ];
}

export const planLabel = { essentiel: "Essentiel", "tout-compris": "Tout compris", premium: "Tout compris", pro: "Tout compris", enseigne: "Tout compris" };
