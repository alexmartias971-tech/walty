"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { site } from "@/lib/site.config";
import { euro, invalidate, MODE_NAMES, post, programLine, swr } from "./outils";
import Squelette from "./Squelette";

/**
 * Nouveau nombre de tampons : ce que ça change pour les cartes DÉJÀ installées (montré AVANT d'enregistrer).
 * cards = { total, installed, byStamps: { "8": 3, … } } (renvoyé par le logiciel de cartes, totaux seulement).
 */
function thresholdImpact(cards, oldT, newT) {
  if (!cards || !(newT >= 2) || newT === oldT) return null;
  const between = (lo, hi) => Object.entries(cards.byStamps || {}).reduce((sum, [k, n]) => (Number(k) >= lo && Number(k) < hi ? sum + Number(n) : sum), 0);
  const total = Number(cards.total) || 0;
  const clients = (n) => `${n} client${n > 1 ? "s" : ""}`;
  const first = `Cette modification s'applique aussi aux cartes déjà installées (${clients(total)}).`;
  if (newT > oldT) {
    const m = between(oldT, newT);
    return {
      first,
      second: m > 0
        ? `${clients(m)} ${m > 1 ? "ont" : "a"} déjà ${oldT} tampons ou plus : avec ${newT}, ${m > 1 ? "leur" : "son"} cadeau ne sera plus prêt.`
        : `Aucun client n'a aujourd'hui son cadeau prêt : personne ne perd de cadeau.`,
      strong: m > 0,
    };
  }
  const m = between(newT, oldT);
  return {
    first,
    second: m > 0
      ? `${clients(m)} ${m > 1 ? "ont" : "a"} déjà ${newT} tampons ou plus : avec ${newT}, ${m > 1 ? "leur" : "son"} cadeau sera prêt tout de suite.`
      : `Aucun client n'a encore ${newT} tampons : rien ne change tout de suite.`,
    strong: m > 0,
  };
}

const LABELS = {
  reward_description: "Le cadeau",
  reward_threshold: "Le nombre de passages",
  points_per_euro: "Les points par euro",
  cashback_percent: "Le pourcentage de cagnotte",
  max_purchase_amount: "Le montant maximum d'un achat",
  max_stamps_per_day: "Les passages par jour",
  welcome_offer: "L'offre de bienvenue",
  signup_bonus: "Le bonus d'inscription",
  referral_bonus: "Le bonus de parrainage",
  bonus_multiplier: "Les heures boostées",
  bonus_start_hour: "Les heures boostées",
  bonus_end_hour: "Les heures boostées",
  streak_goal: "La série",
  streak_bonus: "La série",
  phone: "Votre téléphone",
  address: "Votre adresse",
  google_review_url: "Votre lien d'avis Google",
  instagram_url: "Votre lien Instagram",
  catalog: "Le catalogue de cadeaux",
};
const HOURS = Array.from({ length: 25 }, (_, h) => h);
const mailWalty = (biz) =>
  `mailto:${site.contact.email}?subject=${encodeURIComponent(`Modification de ma carte de fidélité${biz ? ` – ${biz}` : ""}`)}&body=${encodeURIComponent("Bonjour Walty,\n\nJe voudrais modifier : \n\nMerci !")}`;

/**
 * « Mon programme » : les règles de la carte, à lire et à modifier (ce qui est risqué reste chez Walty).
 * Formule Essentiel : pas de parrainage ni de lien d'avis Google ici (Tout compris).
 * Carte à tampons (la seule vendue aujourd'hui) : rien sur les points, la cagnotte, les niveaux ni le catalogue.
 */
export default function Programme({ me, guard, say, onSaved }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [soon, setSoon] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);

  // version des réglages affichée dans le formulaire (date de dernière modification)
  const shown = useRef(null);
  const fill = (r) => {
    shown.current = r.updated_at;
    setData(r);
    setForm({ settings: { ...r.settings }, business: { ...r.business }, catalog: r.catalog.map((c) => ({ ...c })) });
  };
  const load = useCallback(async () => {
    setError("");
    setConflict(false);
    // en mémoire (pré-chargé à la connexion) : affiché tout de suite, puis remis à jour. Le formulaire n'est
    // rempli à nouveau que si les réglages ont changé ailleurs entre-temps (sinon : seuls les chiffres se mettent à jour).
    const r = await swr("program", (x) => {
      if (!x.ok) return;
      if (shown.current && shown.current === x.updated_at) setData((cur) => (cur ? { ...cur, cards: x.cards } : x));
      else fill(x);
    });
    if (!guard(r)) return;
    if (r.unavailable) return setSoon(true);
    if (!r.ok) return setError(r.error || "Impossible de charger votre programme.");
  }, [guard]);
  useEffect(() => { load(); }, [load]);

  const changes = useMemo(() => {
    if (!data || !form) return [];
    const out = new Set();
    for (const [k, v] of Object.entries(form.settings)) if (String(v ?? "") !== String(data.settings[k] ?? "")) out.add(LABELS[k] || k);
    for (const [k, v] of Object.entries(form.business)) if (String(v ?? "") !== String(data.business[k] ?? "")) out.add(LABELS[k] || k);
    if (JSON.stringify(form.catalog) !== JSON.stringify(data.catalog)) out.add(LABELS.catalog);
    return [...out];
  }, [data, form]);

  if (soon) {
    const p = me.program;
    return (
      <div className="ec-panel">
        <section className="ec-box">
          <h2 className="ec-h">Mon programme</h2>
          {p ? (
            <ul className="ec-facts">
              <li><span>Fonctionnement</span><b>{MODE_NAMES[p.mode] || p.mode}</b></li>
              <li><span>Récompense</span><b>{programLine(p)}</b></li>
              <li><span>Offre de bienvenue</span><b>{p.welcome_offer || "Aucune"}</b></li>
            </ul>
          ) : <p className="muted">Les règles de votre carte s'afficheront ici.</p>}
          <p className="ec-info">Bientôt, vous pourrez modifier ici votre cadeau, vos offres et vos heures boostées. En attendant, Walty le fait pour vous : {site.contact.phone}.</p>
          <a className="btn btn-dark" href={mailWalty(me.business?.name)}><Icon name="mail" size={18} /> Demander à Walty</a>
        </section>
      </div>
    );
  }
  if (error && !data) return <div className="ec-panel"><p className="ec-alert">{error}</p></div>;
  if (!data || !form) return <Squelette kpis={0} rows={3} boxes={2} />;

  const L = data.locked;
  const mode = L.mode;
  const essentiel = (data.plan || me.plan) === "essentiel";
  const s = form.settings;
  const ro = !data.canEdit;
  const set = (k) => (e) => { const v = e.target.type === "checkbox" ? e.target.checked : e.target.value; setForm((f) => ({ ...f, settings: { ...f.settings, [k]: v } })); setError(""); };
  const setB = (k) => (e) => { const v = e.target.value; setForm((f) => ({ ...f, business: { ...f.business, [k]: v } })); setError(""); };
  const setCat = (i, k, v) => setForm((f) => ({ ...f, catalog: f.catalog.map((r, j) => (j === i ? { ...r, [k]: v } : r)) }));
  const boosted = Number(s.bonus_multiplier) > 1;
  // Nouveau nombre de tampons : ce que ça change pour les cartes déjà installées (avant d'enregistrer)
  const impact = mode === "stamps" ? thresholdImpact(data.cards, Number(data.settings.reward_threshold), Number(s.reward_threshold)) : null;

  function check(e) {
    e.preventDefault();
    setError("");
    if (mode === "stamps" && String(s.reward_description).trim().length < 2) return setError("Indiquez le cadeau obtenu avec les passages.");
    const t = Number(s.reward_threshold);
    if (mode === "stamps" && !(t >= 2 && t <= 50)) return setError("Le nombre de passages doit être entre 2 et 50.");
    if (boosted && !(Number(s.bonus_end_hour) > Number(s.bonus_start_hour))) return setError("Heures boostées : l'heure de fin doit être après l'heure de début.");
    if (changes.length === 0) return setError("Vous n'avez rien modifié.");
    setConfirm(true);
  }
  async function save() {
    setBusy(true);
    setError("");
    const r = await post("program", {
      updated_at: data.updated_at,
      settings: form.settings,
      business: form.business,
      catalog: mode === "points" ? form.catalog : undefined,
    });
    setBusy(false);
    if (!guard(r)) return;
    setConfirm(false);
    if (r.conflict) { setConflict(true); return setError(r.error); }
    if (!r.ok) return setError(r.error || "Enregistrement impossible.");
    fill(r);
    say(r.done || "Enregistré ✓");
    // l'aperçu de la carte, les soldes des clients (« 5 / 10 ») et la mémoire du programme changent
    invalidate("program", "card", "customers", "customer?");
    onSaved?.(r);
  }

  return (
    <form className="ec-panel ec-prog" onSubmit={check}>
      <section className="ec-box ec-prog-head">
        <div className="ec-box-head">
          <div>
            <p className="ec-kicker">Votre carte</p>
            <h2 className="ec-h">{L.name}</h2>
          </div>
          <span className={`chip ${L.is_active ? "chip-lagon" : "chip-orange"}`}>{L.is_active ? "Active" : "En pause"}</span>
        </div>
        <p className="muted ec-small">Fonctionnement : <b>{MODE_NAMES[mode] || mode}</b>. Vos changements arrivent sur la carte de tous vos clients en quelques minutes.</p>
        {ro && <p className="ec-info">Lecture seule : les réglages se modifient avec l'accès du gérant (celui qui peut envoyer des messages). Demandez-le à Walty si besoin.</p>}
      </section>

      <fieldset className="ec-box ec-fs" disabled={ro}>
        <legend className="ec-h"><Icon name="gift" size={18} /> La récompense</legend>
        {mode === "stamps" && (
          <>
            <div className="field">
              <label htmlFor="p-reward">Le cadeau</label>
              <input id="p-reward" className="input" maxLength={120} value={s.reward_description} onChange={set("reward_description")} placeholder="Ex. : 1 café offert" />
            </div>
            <div className="field">
              <label htmlFor="p-threshold">Nombre de passages pour l'obtenir</label>
              <input id="p-threshold" className="input ec-num" type="number" inputMode="numeric" min={2} max={50} value={s.reward_threshold} onChange={set("reward_threshold")} />
              {impact ? (
                <div className="ec-impact" role="status" aria-live="polite">
                  <p>{impact.first} Vos clients gardent leurs tampons.</p>
                  <p>{impact.strong ? <strong>{impact.second}</strong> : impact.second}</p>
                </div>
              ) : Number(s.reward_threshold) !== Number(data.settings.reward_threshold) && (
                <span className="field-hint ec-warn">Vos clients gardent leurs tampons.{Number(s.reward_threshold) < Number(data.settings.reward_threshold) ? " En baissant le nombre, certains peuvent débloquer leur cadeau tout de suite." : ""}</span>
              )}
            </div>
          </>
        )}
        {mode === "points" && (
          <>
            <div className="ec-grid2">
              <div className="field">
                <label htmlFor="p-ppe">Points gagnés par euro</label>
                <input id="p-ppe" className="input ec-num" inputMode="decimal" value={s.points_per_euro} onChange={set("points_per_euro")} />
              </div>
              <div className="field">
                <label htmlFor="p-max">Achat maximum (€)</label>
                <input id="p-max" className="input ec-num" inputMode="decimal" value={s.max_purchase_amount} onChange={set("max_purchase_amount")} />
                <span className="field-hint">Protège contre les fautes de frappe en caisse.</span>
              </div>
            </div>
            <div className="ec-catalog">
              <p className="ec-label">Les cadeaux à échanger</p>
              {form.catalog.map((r, i) => (
                <div key={r.id || `n${i}`} className={`ec-cat-row ${r.is_active ? "" : "off"}`}>
                  <input className="input" aria-label="Nom du cadeau" maxLength={60} value={r.name} onChange={(e) => setCat(i, "name", e.target.value)} placeholder="Ex. : 1 boisson offerte" />
                  <label className="ec-cat-cost"><input className="input ec-num" aria-label="Prix en points" inputMode="numeric" value={r.cost} onChange={(e) => { const d = e.target.value.replace(/\D/g, ""); setCat(i, "cost", d ? Number(d) : ""); }} /><span>pts</span></label>
                  <label className="ec-check ec-cat-on"><input type="checkbox" checked={r.is_active} onChange={(e) => setCat(i, "is_active", e.target.checked)} /><span>Proposé</span></label>
                </div>
              ))}
              {form.catalog.length < 20 && (
                <button type="button" className="ec-linkbtn" onClick={() => setForm((f) => ({ ...f, catalog: [...f.catalog, { name: "", cost: "", is_active: true }] }))}><Icon name="plus" size={16} /> Ajouter un cadeau</button>
              )}
              <span className="field-hint">Pour retirer un cadeau, décochez « Proposé » (l'historique est gardé).</span>
            </div>
          </>
        )}
        {mode === "cashback" && (
          <div className="ec-grid2">
            <div className="field">
              <label htmlFor="p-cb">Pourcentage reversé sur la cagnotte (%)</label>
              <input id="p-cb" className="input ec-num" inputMode="decimal" value={s.cashback_percent} onChange={set("cashback_percent")} />
              <span className="field-hint">Ex. : 5 % → {euro(Number(String(s.cashback_percent).replace(",", ".")) || 0)} pour 100 € d'achats.</span>
            </div>
            <div className="field">
              <label htmlFor="p-max">Achat maximum (€)</label>
              <input id="p-max" className="input ec-num" inputMode="decimal" value={s.max_purchase_amount} onChange={set("max_purchase_amount")} />
            </div>
          </div>
        )}
        <div className="field">
          <label htmlFor="p-day">Passages comptés par jour et par client (maximum)</label>
          <select id="p-day" className="input ec-num" value={s.max_stamps_per_day} onChange={set("max_stamps_per_day")}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="field-hint">Évite les tampons en double. 1 conseillé.</span>
        </div>
      </fieldset>

      <fieldset className="ec-box ec-fs" disabled={ro}>
        <legend className="ec-h"><Icon name="sparkle" size={18} /> Offres automatiques</legend>
        <div className="field">
          <label htmlFor="p-welcome">Offre de bienvenue (à l'inscription)</label>
          <input id="p-welcome" className="input" maxLength={120} value={s.welcome_offer} onChange={set("welcome_offer")} placeholder="Ex. : -10 % sur votre premier achat (vide = aucune)" />
        </div>
        {mode !== "cashback" && (
          <div className="field">
            <label htmlFor="p-signup">Bonus d'inscription ({mode === "stamps" ? "tampons" : "points"} offerts)</label>
            <input id="p-signup" className="input ec-num" type="number" inputMode="numeric" min={0} max={1000} value={s.signup_bonus} onChange={set("signup_bonus")} />
          </div>
        )}
        {!essentiel && (
          <div className="field">
            <label htmlFor="p-ref">Bonus de parrainage ({mode === "stamps" ? "tampons" : mode === "points" ? "points" : "€"} pour le parrain)</label>
            <input id="p-ref" className="input ec-num" type="number" inputMode="numeric" min={0} max={1000} value={s.referral_bonus} onChange={set("referral_bonus")} />
            <span className="field-hint">0 = pas de parrainage.</span>
          </div>
        )}
        {essentiel && <p className="field-hint">Parrainage et lien d'avis Google : avec la formule Tout compris (15 €/mois). Appelez Walty au {site.contact.phone}.</p>}
      </fieldset>

      <fieldset className="ec-box ec-fs" disabled={ro}>
        <legend className="ec-h"><Icon name="clock" size={18} /> Heures boostées</legend>
        <p className="muted ec-small">Attirez du monde aux heures creuses : les gains sont multipliés pendant ce créneau, tous les jours.</p>
        <div className="ec-grid3">
          <div className="field">
            <label htmlFor="p-mult">Gains</label>
            <select id="p-mult" className="input" value={s.bonus_multiplier} onChange={(e) => { const v = e.target.value; setForm((f) => ({ ...f, settings: { ...f.settings, bonus_multiplier: v, bonus_start_hour: f.settings.bonus_start_hour ?? 14, bonus_end_hour: f.settings.bonus_end_hour ?? 16 } })); setError(""); }}>
              <option value={1}>Pas de boost</option>
              <option value={2}>× 2</option>
              <option value={3}>× 3</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-start">De</label>
            <select id="p-start" className="input" disabled={!boosted} value={s.bonus_start_hour ?? 14} onChange={set("bonus_start_hour")}>
              {HOURS.slice(0, 24).map((h) => <option key={h} value={h}>{h} h</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-end">À</label>
            <select id="p-end" className="input" disabled={!boosted} value={s.bonus_end_hour ?? 16} onChange={set("bonus_end_hour")}>
              {HOURS.slice(1).map((h) => <option key={h} value={h}>{h} h</option>)}
            </select>
          </div>
        </div>
      </fieldset>

      {L.streak_enabled && (
        <fieldset className="ec-box ec-fs" disabled={ro}>
          <legend className="ec-h">🔥 Série</legend>
          <div className="ec-grid2">
            <div className="field">
              <label htmlFor="p-sg">Semaines d'affilée pour le bonus</label>
              <input id="p-sg" className="input ec-num" type="number" min={2} max={52} value={s.streak_goal} onChange={set("streak_goal")} />
            </div>
            <div className="field">
              <label htmlFor="p-sb">Bonus gagné</label>
              <input id="p-sb" className="input ec-num" type="number" min={0} max={1000} value={s.streak_bonus} onChange={set("streak_bonus")} />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="ec-box ec-fs" disabled={ro}>
        <legend className="ec-h"><Icon name="store" size={18} /> Vos coordonnées (au dos de la carte)</legend>
        <div className="ec-grid2">
          <div className="field">
            <label htmlFor="p-phone">Téléphone du commerce</label>
            <input id="p-phone" className="input" inputMode="tel" maxLength={30} value={form.business.phone} onChange={setB("phone")} />
          </div>
          <div className="field">
            <label htmlFor="p-address">Adresse</label>
            <input id="p-address" className="input" maxLength={200} value={form.business.address} onChange={setB("address")} />
          </div>
          {!essentiel && (
            <div className="field">
              <label htmlFor="p-google">Lien pour laisser un avis Google</label>
              <input id="p-google" className="input" inputMode="url" value={form.business.google_review_url} onChange={setB("google_review_url")} placeholder="https://g.page/…" />
            </div>
          )}
          <div className="field">
            <label htmlFor="p-insta">Lien Instagram</label>
            <input id="p-insta" className="input" inputMode="url" value={form.business.instagram_url} onChange={setB("instagram_url")} placeholder="https://instagram.com/…" />
          </div>
        </div>
      </fieldset>

      <section className="ec-box ec-locked">
        <h2 className="ec-h"><Icon name="shield" size={18} /> Réglé avec Walty</h2>
        <p className="muted ec-small">Ces réglages touchent toutes les cartes déjà installées : Walty s'en occupe avec vous, pour ne rien casser.</p>
        <ul className="ec-facts">
          <li><span>{mode === "stamps" ? "Fonctionnement" : "Fonctionnement (tampons, points, cagnotte)"}</span><b>{MODE_NAMES[mode] || mode}</b></li>
          <li><span>Nom et design de la carte</span><b>{L.name}</b></li>
          {(mode !== "stamps" || L.tiers_enabled) && <li><span>Niveaux</span><b>{L.tiers_enabled && L.tiers.length ? L.tiers.map((t) => t.name).join(" → ") : "Non"}</b></li>}
          <li><span>Série de semaines</span><b>{L.streak_enabled ? "Oui" : "Non"}</b></li>
          {L.lap_times_enabled && <li><span>Chrono et classement</span><b>Oui</b></li>}
          {!essentiel && <li><span>Messages par semaine</span><b>{L.max_notifications_per_week}</b></li>}
          <li><span>Carte active ou en pause</span><b>{L.is_active ? "Active" : "En pause"}</b></li>
        </ul>
        <div className="ec-actions">
          <a className="btn btn-dark" href={mailWalty(L.business_name)}><Icon name="mail" size={18} /> Demander à Walty</a>
          <a className="btn btn-ghost" href={site.contact.phoneHref}><Icon name="phone" size={18} /> {site.contact.phone}</a>
        </div>
      </section>

      {data.rules?.length > 0 && (
        <details className="ec-box ec-details">
          <summary className="ec-h">Ce que lisent vos clients</summary>
          <ul className="ec-rules">
            {data.rules.map((r) => <li key={r.title}><span aria-hidden="true">{r.icon}</span><div><b>{r.title}</b><p>{r.text}</p></div></li>)}
          </ul>
        </details>
      )}

      {!ro && (
        <div className={`ec-savebar ${changes.length || confirm || error ? "is-dirty" : ""}`} role="region" aria-label="Enregistrer">
          {error && <p className="field-error" role="alert">{error}</p>}
          {conflict && <button type="button" className="btn btn-ghost" onClick={load}>Recharger les réglages</button>}
          {confirm ? (
            <div className="ec-confirm" role="alertdialog" aria-label="Confirmer les modifications">
              <p>Enregistrer ces changements ? Ils s'appliquent à la carte de tous vos clients.</p>
              <ul className="ec-changes">{changes.map((c) => <li key={c}>{c}</li>)}</ul>
              {impact && (
                <div className="ec-impact">
                  <p>{impact.first}</p>
                  <p>{impact.strong ? <strong>{impact.second}</strong> : impact.second}</p>
                </div>
              )}
              <div className="ec-inline">
                <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Enregistrement…" : "Oui, enregistrer"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={busy}>Revenir</button>
              </div>
            </div>
          ) : (
            <div className="ec-inline">
              <button className="btn btn-primary btn-lg" disabled={changes.length === 0}><Icon name="check" size={18} /> Enregistrer{changes.length ? ` (${changes.length})` : ""}</button>
              {changes.length > 0 && <button type="button" className="btn btn-ghost" onClick={() => { fill(data); setError(""); }}>Annuler les changements</button>}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
