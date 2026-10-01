/**
 * L'offre Walti — source unique : accueil, tarifs, Créer ma carte, espace commerçant, CGV, admin.
 * Trois marches : la carte (29 €) → la carte qui parle (49 €) → la carte qui travaille toute seule (79 €).
 */

export const trialDays = 14; // essai gratuit du parcours « Créer ma carte ». Mettre 0 pour le retirer.

export const plans = [
  {
    id: "essentiel",
    name: "Essentiel",
    tagline: "La carte",
    monthly: 29,
    yearly: 290,
    clients: 200,
    for: "Je remplace mes cartons",
    pitch: "Votre carte de fidélité dans le téléphone de vos clients.",
    setup: "Vous créez votre carte en ligne (gratuit), ou on vient l'installer : 90 €",
    setupFee: 0,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "La carte qui parle",
    monthly: 49,
    yearly: 490,
    clients: 1000,
    featured: true,
    for: "Je veux faire revenir mes clients",
    pitch: "Vous envoyez vos offres directement sur leur téléphone.",
    setup: "Installation sur place offerte",
    setupFee: 0,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "La carte qui travaille toute seule",
    monthly: 79,
    yearly: 790,
    clients: null, // illimité
    for: "Je veux que tout tourne sans moi",
    pitch: "Relances, anniversaires et avis Google partent tout seuls.",
    setup: "Installation sur place + formation de l'équipe offertes",
    setupFee: 0,
  },
];

/** Comparatif : chaque ligne montre clairement ce qui manque dans la formule du dessous. */
export const features = [
  { label: "Clients sur la carte", values: ["200", "1 000", "Illimité"] },
  { label: "Carte Apple + Google Wallet", values: ["Modèle à vos couleurs", "Sur mesure, vos photos", "Sur mesure + visuels de saison"] },
  { label: "Tampons sécurisés", values: [true, true, true] },
  { label: "Messages automatiques de la carte (« +1 tampon », « cadeau prêt »)", values: [true, true, true] },
  { label: "Envoyer vos offres sur leur téléphone", values: [false, "2 par semaine", "Illimité + programmé"], key: true },
  { label: "Relance auto des clients qui ne viennent plus", values: [false, false, true], key: true },
  { label: "Cadeau d'anniversaire automatique", values: [false, false, true] },
  { label: "Demande d'avis Google automatique", values: [false, false, true], key: true },
  { label: "Parrainage : un client amène un ami", values: [false, false, true] },
  { label: "Vos chiffres", values: ["3 chiffres", "6 chiffres", "Tous + argent rapporté"] },
  { label: "Accès équipe (caisse)", values: ["1", "3", "Illimité"] },
  { label: "Boutiques", values: ["1", "1", "Jusqu'à 3"] },
  { label: "Installation sur place", values: ["90 €", "Offerte", "Offerte + formation"] },
  { label: "Accompagnement", values: ["WhatsApp", "WhatsApp + bilan tous les 3 mois", "Bilan mensuel + 1 campagne/mois écrite pour vous"] },
  { label: "Engagement", values: ["Aucun", "Aucun", "Aucun"] },
];

/** 4 points clés par formule (cartes de prix). `false` = affiché barré, pour montrer ce qui manque. */
export const highlights = {
  essentiel: [
    [true, "Carte Apple & Google Wallet à vos couleurs"],
    [true, "Jusqu'à 200 clients"],
    [false, "Envoyer vos offres sur leur téléphone"],
    [false, "Relances automatiques"],
  ],
  premium: [
    [true, "Tout Essentiel, jusqu'à 1 000 clients"],
    [true, "Envoyez vos offres : 2 messages par semaine"],
    [true, "Carte sur mesure avec vos photos"],
    [false, "Relances automatiques"],
  ],
  pro: [
    [true, "Tout Premium, clients illimités"],
    [true, "Relances et anniversaires automatiques"],
    [true, "Demande d'avis Google automatique"],
    [true, "Parrainage + 1 campagne par mois écrite pour vous"],
  ],
};

export const addons = [
  { name: "Plaque NFC avis Google", price: "Sur demande" },
  { name: "Installation sur place (Essentiel)", price: "90 €" },
  { name: "Visuel de saison supplémentaire", price: "25 €" },
  { name: "Message promo rédigé pour vous", price: "15 €" },
  { name: "Affiche ou chevalet supplémentaire", price: "15 €" },
  { name: "Formation d'un nouvel employé sur place", price: "25 €" },
  { name: "Import de votre fichier client (inclus en Pro)", price: "49 €" },
];

export const founderOffer = "Tarif fondateur : les 10 premiers commerces gardent leur prix à vie.";
export const vatNotice = "Prix nets, TVA non applicable (art. 293 B du CGI).";

export const planById = Object.fromEntries(plans.map((p) => [p.id, p]));
// compatibilité avec les anciennes demandes enregistrées
planById.enseigne = planById.pro;
