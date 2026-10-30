/**
 * L'offre Walty (décidée le 20 octobre 2026) — source unique : accueil, tarifs, produit,
 * Créer ma carte, contact, CGV, admin.
 * Deux abonnements, au mois uniquement : Essentiel (9 €) et Tout compris (15 €).
 * Pas d'options payantes, pas de tarif à l'année, pas de tarif fondateur.
 * Clients (porteurs) illimités dans les deux formules (décidé le 29 octobre 2026).
 */

export const trialDays = 14; // essai gratuit : la carte est préparée avant la démo et montrée au rendez-vous. Mettre 0 pour le retirer.

export const plans = [
  {
    id: "essentiel",
    name: "Essentiel",
    monthly: 9,
    tagline: "La carte à tampons",
    for: "Pour remplacer vos cartes en carton, simplement.",
    pitch: "Votre carte à tampons, à votre logo et à vos couleurs.",
    setup: "Installation offerte",
    support: "Aide par WhatsApp ou e-mail, sans délai garanti",
    teamAccess: 1,
  },
  {
    id: "tout-compris",
    name: "Tout compris",
    monthly: 15,
    featured: true,
    tagline: "Toutes les options",
    for: "Toutes les options, et un SAV sous 48 h garanti. Pour faire revenir vos clients plus souvent.",
    pitch: "Statistiques, notifications, avis Google. Et un SAV sous 48 h garanti.",
    setup: "Installation offerte",
    support: "SAV sous 48 h garanti, du lundi au samedi",
    teamAccess: null, // illimité
  },
];

/** Comparatif (page Tarifs). `true` = inclus, `false` = non inclus, texte = précision. */
export const features = [
  { label: "Carte Apple Wallet et Google Wallet", values: ["À votre logo et à vos couleurs", "Sur mesure : vos photos, des visuels de saison"] },
  { label: "Nombre de clients", values: ["Illimité", "Illimité"], key: true },
  { label: "Au bout des tampons : un produit offert ou une remise", values: [true, true] },
  { label: "Tampons sécurisés", values: [true, true] },
  { label: "Messages de la carte (« +1 tampon », « cadeau prêt »)", values: [true, true] },
  { label: "Accès équipe pour tamponner", values: ["1", "Illimités"] },
  { label: "Statistiques : clients qui reviennent, passages, cadeaux, argent rapporté (estimé)", values: [false, true], key: true },
  { label: "Notifications sur le téléphone de vos clients", values: [false, "Jusqu'à 4 par semaine"], key: true },
  { label: "Lien d'avis Google sur la carte", values: [false, true] },
  { label: "Export de vos clients en Excel, depuis votre espace", values: [true, true] },
  { label: "Installation", values: ["Offerte", "Offerte"] },
  { label: "Aide", values: ["WhatsApp ou e-mail, sans délai garanti", "SAV sous 48 h garanti"], key: true },
  { label: "Engagement", values: ["Aucun", "Aucun"] },
  { label: "Essai gratuit", values: [`${trialDays} jours`, `${trialDays} jours`] },
];

/** Points clés par formule (cartes de prix). `false` = affiché barré, pour montrer ce qui manque. */
export const highlights = {
  essentiel: [
    [true, "Carte Apple Wallet et Google Wallet à vos couleurs"],
    [true, "Clients illimités"],
    [true, "Un produit offert ou une remise au bout des tampons"],
    [true, "Tampons sécurisés, 1 accès équipe"],
    [true, "Installation offerte"],
    [false, "Statistiques et notifications"],
  ],
  "tout-compris": [
    [true, "Tout l'Essentiel, avec une carte sur mesure"],
    [true, "Clients illimités"],
    [true, "Statistiques : clients qui reviennent, passages, cadeaux"],
    [true, "Jusqu'à 4 notifications par semaine"],
    [true, "Lien d'avis Google sur la carte"],
    [true, "Installation offerte"],
    [true, "SAV sous 48 h garanti"],
  ],
};

/** SAV de la formule Tout compris. */
export const sav = {
  delay: "48 h",
  hours: "du lundi au samedi, de 8 h à 18 h",
  sunday: "Une demande envoyée le dimanche est traitée le lundi.",
};

export const vatNotice = "Prix nets, TVA non applicable (art. 293 B du CGI).";
export const priceLine = `Dès 9 € par mois, sans engagement, ${trialDays} jours d'essai gratuit`;

export const planById = Object.fromEntries(plans.map((p) => [p.id, p]));
// compatibilité avec les anciennes demandes et fiches enregistrées
planById.premium = planById["tout-compris"];
planById.pro = planById["tout-compris"];
planById.enseigne = planById["tout-compris"];

/** Code de formule à jour (« premium », « pro », « enseigne » → « tout-compris »), ou null. */
export const planCode = (id) => planById[id]?.id || null;

/** Notifications envoyées à la demande du commerçant (formule Tout compris). */
export const pushRules = {
  perWeek: { essentiel: 0, "tout-compris": 4, premium: 4, pro: 4, enseigne: 4 },
  advice: "Notre conseil : une notification par semaine suffit.",
  maxLength: 160,
  delay: "Votre notification est vérifiée puis envoyée par l'équipe Walty le jour même, entre 8 h et 18 h.",
};
