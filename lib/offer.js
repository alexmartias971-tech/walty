/** L'offre Walti — source unique utilisée par la page Tarifs, l'accueil, les CGV et l'admin. */

export const plans = [
  {
    id: "essentiel",
    name: "Essentiel",
    monthly: 29,
    yearly: 290,
    setup: "90 € de mise en place, offerte en paiement annuel",
    setupFee: 90,
    for: "Roulottes, snacks, coachs, barbiers, ongleries",
    pitch: "Remplacer vos cartons par une carte propre, sans rien à gérer.",
    features: [
      "Carte Apple Wallet + Google Wallet sur mesure (vos photos, logo, couleurs)",
      "Tampons sécurisés, scannés par votre équipe",
      "2 notifications push par semaine",
      "Relance automatique « tu nous manques » après 30 jours",
      "Kit comptoir : 2 affiches QR plastifiées + autocollant vitrine",
      "3 accès caisse pour le personnel",
      "Bilan chiffré tous les 3 mois, par WhatsApp",
    ],
    commitment: "Sans engagement",
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 49,
    yearly: 490,
    setup: "Mise en place offerte",
    setupFee: 0,
    featured: true,
    for: "Loisirs, restaurants, instituts, commerces avec équipe",
    pitch: "Quelqu'un fait revenir vos clients à votre place.",
    features: [
      "Tout Essentiel, plus :",
      "Design premium + 4 visuels saisonniers par an (Noël, Carnaval…)",
      "1 campagne par mois écrite pour vous",
      "Kit comptoir complet + chevalet",
      "Accès caisse illimités",
      "Bilan chiffré chaque mois + rendez-vous de 15 min",
      "Plaque NFC avis Google offerte",
    ],
    commitment: "Sans engagement",
  },
  {
    id: "enseigne",
    name: "Enseigne",
    monthly: 79,
    yearly: null,
    fromPrice: true,
    setup: "Sur devis",
    setupFee: null,
    for: "Enseignes avec fichier client, plusieurs boutiques",
    pitch: "Rendre utile le fichier client qui dort dans votre caisse.",
    features: [
      "Tout Premium, plus :",
      "Une seule carte pour toutes vos boutiques (jusqu'à 3 incluses)",
      "Import de votre fichier client existant",
      "Bilan par boutique, chaque mois",
      "Accès caisse par boutique",
      "Interlocuteur dédié",
    ],
    commitment: "Engagement 12 mois",
  },
];

export const addons = [
  { name: "Visuel saisonnier supplémentaire", price: "25 €" },
  { name: "Campagne de notification rédigée pour vous", price: "15 €" },
  { name: "Affiche ou chevalet supplémentaire", price: "15 €" },
  { name: "Formation d'un nouvel employé sur place", price: "25 €" },
  { name: "Import d'un fichier client existant", price: "49 €" },
  { name: "Plaque NFC avis Google", price: "Sur demande" },
];

export const founderOffer =
  "Offre fondateurs : les 10 premiers commerces gardent leur prix à vie, tant qu'ils restent abonnés.";

export const vatNotice = "Prix nets. TVA non applicable, art. 293 B du CGI.";

export const planById = Object.fromEntries(plans.map((p) => [p.id, p]));
