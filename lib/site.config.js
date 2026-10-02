/**
 * ─────────────────────────────────────────────────────────────
 *  WALTY — FICHIER DE CONFIGURATION UNIQUE
 *  Tout ce qui est marqué  [À COMPLÉTER]  doit être rempli
 *  AVANT de rendre le site public (NEXT_PUBLIC_SITE_PUBLIC=true).
 *  Ces infos alimentent automatiquement : mentions légales,
 *  politique de confidentialité, CGV, pied de page, contact.
 * ─────────────────────────────────────────────────────────────
 */

export const TODO = "[À COMPLÉTER]";

export const site = {
  name: "Walty",
  tagline: "La carte de fidélité qui vit dans leur téléphone.",
  description:
    "Walty crée et installe la carte de fidélité digitale de votre commerce, dans Apple Wallet et Google Wallet. Tampons sécurisés, notifications push, installé sur place en Guadeloupe. Dès 29 €/mois.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://walty.fr",
  isPublic: process.env.NEXT_PUBLIC_SITE_PUBLIC === "true",
  region: "Guadeloupe",

  contact: {
    email: TODO, // ex. contact@walty.fr (à remplir dès que l'adresse existe)
    phone: "0690 51 36 46",
    phoneHref: "tel:+590690513646",
    whatsapp: "", // ex. 590690000000 (format international sans +). Vide = bouton masqué
    zone: "Toute la Guadeloupe (Grande-Terre, Basse-Terre, Marie-Galante sur rendez-vous)",
    hours: "Du lundi au samedi, 8 h – 18 h",
  },

  social: {
    instagram: "", // ex. https://instagram.com/walty.fr
    tiktok: "",
    facebook: "",
  },
};

/** Éditeur du site — obligatoire (art. 6-III de la loi n° 2004-575 « LCEN ») */
export const legal = {
  // Walty est un nom commercial de l'entreprise individuelle d'Alexandre MARTIAS,
  // immatriculée sous le SIRET de Karaya Conciergerie (vérifié le 1er octobre 2026).
  ownerName: "Alexandre MARTIAS",
  sharedSiretNote: "Walty est exploité au sein de l'entreprise individuelle d'Alexandre MARTIAS, également connue sous le nom commercial Karaya Conciergerie.",
  legalForm: "Entrepreneur individuel (EI), régime micro-entrepreneur",
  tradeName: "Walty",
  address: "486 rue de l'Aviation, 97190 Le Gosier, Guadeloupe",
  siren: "103 900 692",
  siret: "103 900 692 00015",
  registry: "Inscrit au Registre national des entreprises (RNE)",
  vat: "TVA non applicable, art. 293 B du CGI",
  publicationDirector: "Alexandre MARTIAS",
  lastUpdate: "1er octobre 2026",
  court: "tribunal mixte de commerce de Pointe-à-Pitre",
};

/** Hébergeurs et sous-traitants (RGPD art. 28) */
export const processors = [
  {
    name: "Vercel Inc.",
    role: "Hébergement du site",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    web: "https://vercel.com",
    transfer:
      "Transfert encadré par le Data Privacy Framework UE–États-Unis et les clauses contractuelles types de la Commission européenne.",
  },
  {
    name: "Supabase Inc.",
    role: "Base de données (formulaire de contact, espace administrateur)",
    address: "970 Toa Payoh North #07-04, Singapour 318992",
    web: "https://supabase.com",
    transfer:
      "Données hébergées dans l'Union européenne (région Francfort, à choisir à la création du projet). Clauses contractuelles types pour tout accès hors UE.",
  },
];
