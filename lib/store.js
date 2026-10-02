/**
 * Couche de données de Walty (formulaire de contact + espace admin).
 * - Si Supabase est configuré (variables NEXT_PUBLIC_SUPABASE_*), tout passe par Supabase.
 * - Sinon : MODE DÉMO. Les données restent dans ce navigateur (localStorage),
 *   rien n'est envoyé nulle part. Parfait pour l'aperçu sur Vercel.
 */
import { hasSupabase, supabase } from "./supabase";
import { planById } from "./offer";

export const isDemo = !hasSupabase;

export const STAGES = [
  { id: "nouveau", label: "Nouveau", color: "#c9b8ef" },
  { id: "contacte", label: "Contacté", color: "#ffa23d" },
  { id: "demo", label: "Démo faite", color: "#ff5b1f" },
  { id: "proposition", label: "Proposition", color: "#ff2e7e" },
  { id: "client", label: "Client", color: "#2de2c4" },
  { id: "perdu", label: "Perdu", color: "#6b6480" },
];
export const stageById = Object.fromEntries(STAGES.map((s) => [s.id, s]));

export const SECTORS = ["Roulotte / food truck", "Snack / restaurant", "Coffee shop / bar", "Boulangerie / pâtisserie", "Onglerie / institut", "Barbier / coiffure", "Coach / salle de sport", "Loisirs (karting, padel…)", "Boutique / commerce", "Épicerie / supérette", "Lavage auto / garage", "Hôtel / hébergement", "Enseigne multi-boutiques", "Autre"];

export const COMMUNES = ["Anse-Bertrand", "Baie-Mahault", "Baillif", "Basse-Terre", "Bouillante", "Capesterre-Belle-Eau", "Capesterre-de-Marie-Galante", "Deshaies", "Gourbeyre", "Goyave", "Grand-Bourg", "La Désirade", "Lamentin", "Le Gosier", "Le Moule", "Les Abymes", "Morne-à-l'Eau", "Petit-Bourg", "Petit-Canal", "Pointe-à-Pitre", "Pointe-Noire", "Port-Louis", "Saint-Claude", "Saint-François", "Saint-Louis", "Sainte-Anne", "Sainte-Rose", "Terre-de-Bas", "Terre-de-Haut", "Trois-Rivières", "Vieux-Fort", "Vieux-Habitants", "Hors Guadeloupe"];

const LS_KEY = "walty-demo-accounts-v1";
const LS_AUTH = "walty-demo-auth";

const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const today = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
const ago = (days) => new Date(Date.now() - days * 864e5).toISOString();

/** Données fictives du mode démo */
function seed() {
  const a = (o) => ({ id: uid(), created_at: ago(o.age ?? 5), updated_at: ago(o.age ?? 5), source: "terrain", notes: [], founder: false, mrr: 0, ...o });
  return [
    a({ business: "Le Bokit du Lagon", contact_name: "Démo · Gérant", sector: "Roulotte / food truck", city: "Sainte-Anne", phone: "0690 00 00 01", stage: "client", plan: "essentiel", billing: "annuel", mrr: 24.17, client_since: today(-40), client_status: "actif", founder: true, age: 60, next_action: "Bilan des 3 mois", next_action_date: today(50), notes: [{ at: ago(40), text: "Carte installée, 2 affiches posées. Premier tampon le jour même." }] }),
    a({ business: "Coffee Plage", contact_name: "Démo · Responsable", sector: "Coffee shop / bar", city: "Le Gosier", email: "demo@exemple.fr", stage: "client", plan: "premium", billing: "mensuel", mrr: 49, client_since: today(-25), client_status: "actif", founder: true, age: 45, next_action: "Envoyer la campagne du mois", next_action_date: today(0) }),
    a({ business: "Studio Hibiscus", contact_name: "Démo · Gérante", sector: "Onglerie / institut", city: "Les Abymes", phone: "0690 00 00 03", stage: "client", plan: "essentiel", billing: "mensuel", mrr: 29, client_since: today(-12), client_status: "actif", founder: true, age: 30 }),
    a({ business: "Circuit Grand Prix", contact_name: "Démo · Directeur", sector: "Loisirs (karting, padel…)", city: "Baie-Mahault", stage: "proposition", plan: "premium", age: 9, next_action: "Relancer la proposition Premium", next_action_date: today(-1), notes: [{ at: ago(6), text: "Démo faite sur place, très intéressé par les niveaux Rookie → Légende." }] }),
    a({ business: "Coach Kévin Fit", contact_name: "Démo · Coach", sector: "Coach / salle de sport", city: "Petit-Bourg", phone: "0690 00 00 05", stage: "demo", age: 6, next_action: "Envoyer le devis Essentiel", next_action_date: today(1) }),
    a({ business: "Barber Shop du Port", contact_name: "Démo · Barbier", sector: "Barbier / coiffure", city: "Pointe-à-Pitre", stage: "demo", age: 4, next_action: "Rappeler après le week-end", next_action_date: today(3) }),
    a({ business: "Boulangerie des Alizés", contact_name: "Démo · Gérant", sector: "Boulangerie / pâtisserie", city: "Le Moule", stage: "contacte", age: 3, next_action: "Passer avec la carte de démo", next_action_date: today(2) }),
    a({ business: "Snack Bord de Mer", contact_name: "Démo · Gérante", sector: "Snack / restaurant", city: "Deshaies", stage: "contacte", age: 2 }),
    a({ business: "Salle Énergie", contact_name: "Démo · Manager", sector: "Coach / salle de sport", city: "Baie-Mahault", source: "site", stage: "nouveau", age: 1, message: "Bonjour, on a 300 adhérents, est-ce que ça marche pour les abonnements ?", preferred_channel: "WhatsApp" }),
    a({ business: "Glaces Coco", contact_name: "Démo · Gérant", sector: "Roulotte / food truck", city: "Saint-François", source: "site", stage: "nouveau", age: 0, message: "Je veux remplacer mes cartons avant la saison.", preferred_channel: "Appel" }),
    a({ business: "Pizzeria Soleil", contact_name: "Démo · Gérant", sector: "Snack / restaurant", city: "Lamentin", stage: "perdu", age: 20, notes: [{ at: ago(15), text: "Trop tôt, rappeler en janvier." }], next_action: "Rappeler en janvier", next_action_date: today(95) }),
  ];
}

function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  lsWrite(s);
  return s;
}
function lsWrite(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

/* ─────────────── Formulaire public ─────────────── */
export async function submitLead(form) {
  const row = {
    stage: "nouveau",
    source: "site",
    business: String(form.business || "").slice(0, 120),
    contact_name: String(form.contact_name || "").slice(0, 120),
    sector: form.sector || null,
    city: form.city || null,
    phone: String(form.phone || "").slice(0, 30) || null,
    email: String(form.email || "").slice(0, 160) || null,
    preferred_channel: form.preferred_channel || null,
    message: [form.plan ? `Formule souhaitée : ${form.plan}` : "", String(form.message || "")].filter(Boolean).join("\n").slice(0, 2000) || null,
    requested_plan: ["essentiel", "premium", "pro"].includes(form.requested_plan) ? form.requested_plan : null,
    card_config: form.card_config || null,
    billing_info: form.billing_info || null,
    consent_at: new Date().toISOString(),
  };
  if (hasSupabase) {
    const { error } = await supabase().from("accounts").insert(row);
    if (error) throw new Error("Envoi impossible pour le moment. Réessayez ou écrivez-nous directement.");
    return { demo: false };
  }
  const list = lsRead();
  list.unshift({ id: uid(), created_at: row.consent_at, updated_at: row.consent_at, notes: [], mrr: 0, founder: false, ...row });
  lsWrite(list);
  return { demo: true };
}

/* ─────────────── Authentification admin ─────────────── */
export async function getSession() {
  if (hasSupabase) {
    const { data } = await supabase().auth.getSession();
    return data.session ? { email: data.session.user.email } : null;
  }
  try { return sessionStorage.getItem(LS_AUTH) ? { email: "demo@walty", demo: true } : null; } catch { return null; }
}

export async function signIn(email, password) {
  if (hasSupabase) {
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error("E-mail ou mot de passe incorrect.");
    return;
  }
  try { sessionStorage.setItem(LS_AUTH, "1"); } catch {}
}

export async function signOut() {
  if (hasSupabase) await supabase().auth.signOut();
  try { sessionStorage.removeItem(LS_AUTH); } catch {}
}

/* ─────────────── CRUD admin ─────────────── */
export async function listAccounts() {
  if (hasSupabase) {
    const { data, error } = await supabase().from("accounts").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }
  return lsRead();
}

export async function saveAccount(acc) {
  const now = new Date().toISOString();
  const clean = { ...acc, updated_at: now };
  if (clean.stage === "client") {
    clean.client_status = clean.client_status || "actif";
    clean.client_since = clean.client_since || today(0);
    if (clean.plan && (!clean.mrr || Number(clean.mrr) === 0)) clean.mrr = computeMrr(clean.plan, clean.billing);
  }
  if (hasSupabase) {
    const { id, created_at, ...rest } = clean;
    if (id) {
      const { data, error } = await supabase().from("accounts").update(rest).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const { data, error } = await supabase().from("accounts").insert({ ...rest, source: rest.source || "terrain" }).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  const list = lsRead();
  if (clean.id) {
    const i = list.findIndex((x) => x.id === clean.id);
    if (i >= 0) list[i] = { ...list[i], ...clean };
  } else {
    clean.id = uid();
    clean.created_at = now;
    clean.source = clean.source || "terrain";
    clean.notes = clean.notes || [];
    list.unshift(clean);
  }
  lsWrite(list);
  return clean;
}

export async function deleteAccount(id) {
  if (hasSupabase) {
    const { error } = await supabase().from("accounts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  lsWrite(lsRead().filter((x) => x.id !== id));
}

export function resetDemo() {
  const s = seed();
  lsWrite(s);
  return s;
}

export function computeMrr(planId, billing) {
  const p = planById[planId];
  if (!p) return 0;
  if (billing === "annuel" && p.yearly) return Math.round((p.yearly / 12) * 100) / 100;
  return p.monthly;
}

export function toCsv(list) {
  const cols = ["business", "contact_name", "sector", "city", "phone", "email", "stage", "plan", "requested_plan", "legal_name", "siret", "billing_address", "billing", "mrr", "client_since", "client_status", "next_action", "next_action_date", "source", "created_at"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const val = (r, c) => {
    const b = r.billing_info || {};
    if (c === "legal_name") return b.legal_name;
    if (c === "siret") return b.siret;
    if (c === "billing_address") return b.address ? `${b.address}, ${b.postal_code || ""} ${b.city || ""}`.trim() : "";
    return r[c];
  };
  return "﻿" + [cols.join(";"), ...list.map((r) => cols.map((c) => esc(val(r, c))).join(";"))].join("\n");
}

/* ─────────────── Espace commerçant ─────────────── */
const LS_MERCHANT = "walty-merchant-auth";
const LS_MY_CARD = "walty-my-card";

export async function merchantSession() {
  if (hasSupabase) {
    const { data } = await supabase().auth.getSession();
    return data.session ? { email: data.session.user.email } : null;
  }
  try { const v = sessionStorage.getItem(LS_MERCHANT); return v ? { email: v, demo: true } : null; } catch { return null; }
}

export async function merchantSignIn(email, password) {
  if (hasSupabase) {
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error("E-mail ou mot de passe incorrect.");
    return;
  }
  try { sessionStorage.setItem(LS_MERCHANT, email || "exemple"); } catch {}
}

export async function merchantSignOut() {
  if (hasSupabase) await supabase().auth.signOut();
  try { sessionStorage.removeItem(LS_MERCHANT); } catch {}
}

/**
 * La carte du commerçant connecté : nom, formule, configuration de la carte.
 * Supabase : fonction my_account() (ne renvoie jamais les notes internes).
 * Démo : la carte créée dans « Créer ma carte » sur ce navigateur, sinon null.
 */
export async function getMyAccount() {
  if (hasSupabase) {
    const { data, error } = await supabase().rpc("my_account");
    if (error) throw new Error("Impossible de charger votre carte pour le moment.");
    const row = Array.isArray(data) ? data[0] : data;
    return row ? { business: row.business, plan: row.plan || row.requested_plan || "essentiel", card_config: row.card_config, contact_name: row.contact_name } : null;
  }
  try {
    const raw = localStorage.getItem(LS_MY_CARD);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return { business: v.config?.merchant, plan: v.plan || "premium", card_config: v.config, contact_name: v.name };
  } catch { return null; }
}

/* ─────────────── Notifications push du commerçant ───────────────
 * Le commerçant écrit sa notification dans son espace ; elle arrive dans l'admin
 * (onglet « Notifications ») où vous l'envoyez depuis l'application de cartes, puis
 * vous la marquez « envoyée ». Supabase : table push_requests (voir schema.sql).
 */
const LS_PUSH = "walty-demo-pushes";
function pushRead() { try { return JSON.parse(localStorage.getItem(LS_PUSH) || "[]"); } catch { return []; } }
function pushWrite(list) { try { localStorage.setItem(LS_PUSH, JSON.stringify(list)); } catch {} }
const cleanError = (error, fallback) => {
  const m = String(error?.message || "");
  return /notification|Premium|Pro|semaine/i.test(m) ? m.replace(/^.*?: /, "") : fallback;
};

export async function listMyPushes(email) {
  if (hasSupabase) {
    const { data, error } = await supabase().from("push_requests").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw new Error("Impossible de charger vos notifications.");
    return data;
  }
  const me = String(email || "").toLowerCase();
  return pushRead().filter((p) => p.account_email === me);
}

export async function requestPush({ email, business, message, send_at }) {
  const row = {
    account_email: String(email || "").toLowerCase(),
    business: String(business || "").slice(0, 120),
    message: String(message || "").trim().slice(0, 160),
    send_at: send_at || null,
    status: "a_envoyer",
  };
  if (hasSupabase) {
    const { data, error } = await supabase().from("push_requests").insert(row).select().single();
    if (error) throw new Error(cleanError(error, "Envoi impossible pour le moment. Réessayez dans un instant."));
    return data;
  }
  const saved = { id: uid(), created_at: new Date().toISOString(), sent_at: null, ...row };
  pushWrite([saved, ...pushRead()]);
  return saved;
}

export async function cancelPush(id) {
  if (hasSupabase) {
    const { error } = await supabase().from("push_requests").delete().eq("id", id).eq("status", "a_envoyer");
    if (error) throw new Error("Annulation impossible : la notification est peut-être déjà partie.");
    return;
  }
  pushWrite(pushRead().filter((p) => !(p.id === id && p.status === "a_envoyer")));
}

/* Admin */
export async function listPushRequests() {
  if (hasSupabase) {
    const { data, error } = await supabase().from("push_requests").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) throw new Error(error.message);
    return data;
  }
  return pushRead();
}

export async function markPushSent(id) {
  const patch = { status: "envoye", sent_at: new Date().toISOString() };
  if (hasSupabase) {
    const { data, error } = await supabase().from("push_requests").update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  const list = pushRead().map((p) => (p.id === id ? { ...p, ...patch } : p));
  pushWrite(list);
  return list.find((p) => p.id === id);
}
