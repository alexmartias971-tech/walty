/**
 * ─────────────────────────────────────────────────────────────
 *  WALTY — FICHIER DE CONFIGURATION UNIQUE
 *  Ces infos alimentent automatiquement : mentions légales,
 *  politique de confidentialité, CGV, page porteurs, pied de page, contact.
 * ─────────────────────────────────────────────────────────────
 */

export const TODO = "[À COMPLÉTER]";

/**
 * Visible par Google ?
 * - Sur Vercel, en production : oui, automatiquement (sauf si NEXT_PUBLIC_SITE_PUBLIC=false).
 * - Aperçus Vercel et ordinateur local : non.
 * Les adresses autres que walty.fr (ex. walty-xxx.vercel.app) restent cachées de Google (voir next.config.mjs).
 */
const publicFlag = process.env.NEXT_PUBLIC_SITE_PUBLIC;
const isProduction = process.env.VERCEL_ENV === "production";

export const site = {
  name: "Walty",
  tagline: "La carte de fidélité qui vit dans leur téléphone.",
  description:
    "La carte de fidélité digitale de votre commerce, dans Apple Wallet et Google Wallet. Une carte à tampons à vos couleurs, pour les commerces de Guadeloupe. Dès 9 €/mois, sans engagement.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://walty.fr",
  domain: "walty.fr",
  isPublic: publicFlag === "true" || (isProduction && publicFlag !== "false"),
  region: "Guadeloupe",

  contact: {
    email: "contact@walty.fr",
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
  legalFormInline: "entrepreneur individuel (EI), régime micro-entrepreneur", // dans une phrase
  tradeName: "Walty",
  address: "486 rue de l'Aviation, 97190 Le Gosier, Guadeloupe",
  siren: "103 900 692",
  siret: "103 900 692 00015",
  registry: "Inscrit au Registre national des entreprises (RNE)",
  vat: "TVA non applicable, art. 293 B du CGI",
  publicationDirector: "Alexandre MARTIAS",
  lastUpdate: "9 octobre 2026",
  court: "tribunal mixte de commerce de Pointe-à-Pitre",
};

/** Où sont stockées les données (projet Supabase « carte-fidelite », région eu-west-1). */
export const dataLocation = "Irlande (Union européenne)";

/**
 * Hébergeurs et sous-traitants (RGPD art. 28).
 * `host: true` = hébergeur du site, affiché dans les mentions légales (LCEN art. 6-III).
 */
export const processors = [
  {
    name: "Vercel Inc.",
    role: "Hébergement du site",
    host: true,
    address: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
    web: "https://vercel.com",
    contact: "privacy@vercel.com · vercel.com/contact (Vercel ne publie pas de numéro de téléphone)",
    transfer:
      "Société américaine certifiée au Data Privacy Framework UE–États-Unis ; clauses contractuelles types de la Commission européenne.",
  },
  {
    name: "Supabase Pte. Ltd.",
    role: "Base de données de l'espace commerçant et des cartes de fidélité",
    host: true,
    address: "65 Chulia Street #38-02/03, OCBC Centre, Singapour 049513",
    web: "https://supabase.com",
    contact: "privacy@supabase.com",
    transfer: `Données stockées en ${dataLocation}. Clauses contractuelles types pour tout accès depuis l'extérieur de l'UE.`,
  },
  {
    name: "Resend (Plus Five Five, Inc.)",
    role: "Envoi des e-mails du site, dont vos demandes de démo",
    address: "2261 Market Street #5039, San Francisco, CA 94114, États-Unis",
    web: "https://resend.com",
    contact: "resend.com/legal",
    transfer:
      "Envois réalisés depuis l'Irlande. Société américaine certifiée au Data Privacy Framework UE–États-Unis ; clauses contractuelles types.",
  },
  {
    name: "OVH SAS",
    role: "Nom de domaine walty.fr et messagerie contact@walty.fr",
    address: "2 rue Kellermann, 59100 Roubaix, France",
    web: "https://www.ovhcloud.com",
    contact: "ovhcloud.com/fr/support",
    transfer: "Données hébergées en France.",
  },
];
