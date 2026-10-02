"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { submitLead, SECTORS, COMMUNES } from "@/lib/store";
import { site } from "@/lib/site.config";

const PLAN_LABELS = { essentiel: "Essentiel (29 €/mois)", premium: "Premium (49 €/mois)", pro: "Pro (79 €/mois)", enseigne: "Pro (79 €/mois)", fondateur: "Tarif fondateur" };

/** Formulaire de demande de démo. `compact` = version courte de la page d'accueil. */
export default function ContactForm({ compact = false }) {
  const params = useSearchParams();
  const plan = PLAN_LABELS[params.get("formule")] || "";
  const [state, setState] = useState({ status: "idle", error: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // pot de miel anti-robots
    const data = Object.fromEntries(fd.entries());
    if (!data.phone && !data.email) {
      setState({ status: "idle", error: "Laissez au moins un numéro ou un e-mail pour qu'on puisse vous répondre." });
      return;
    }
    setState({ status: "sending", error: "" });
    try {
      const fid = params.get("formule");
      const r = await submitLead({ ...data, plan, requested_plan: fid === "enseigne" ? "pro" : fid });
      setState({ status: "sent", error: "", demo: r.demo });
    } catch (err) {
      setState({ status: "idle", error: err.message });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="form-card glass success">
        <Mascot pose="stamp" size={190} impact={false} title="Walty tamponne votre demande" />
        <h2 className="display-s">C'est noté !</h2>
        <p className="muted" style={{ maxWidth: 420 }}>On vous rappelle sous 24 h ouvrées pour caler le rendez-vous. À très vite.</p>
        {state.demo && (
          <>
            <p className="notice" style={{ maxWidth: 460 }}>Pour fixer votre rendez-vous tout de suite, appelez-nous : c'est le plus rapide.</p>
            <a className="btn btn-primary" href={site.contact.phoneHref}><Icon name="phone" size={18} /> {site.contact.phone}</a>
          </>
        )}
      </div>
    );
  }

  return (
    <form className="form-card glass" onSubmit={onSubmit}>
      {plan && <span className="chip chip-orange" style={{ justifySelf: "start" }}>Formule : {plan}</span>}
      <div className="form-row">
        <div className="field">
          <label htmlFor="contact_name">Prénom et nom *</label>
          <input id="contact_name" name="contact_name" className="input" required autoComplete="name" maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="business">Votre commerce *</label>
          <input id="business" name="business" className="input" required autoComplete="organization" maxLength={120} placeholder="Ex. : snack, onglerie, karting…" />
        </div>
      </div>
      {!compact && (
        <div className="form-row">
          <div className="field">
            <label htmlFor="sector">Activité</label>
            <select id="sector" name="sector" className="select" defaultValue="">
              <option value="" disabled>Choisir…</option>
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="city">Commune</label>
            <select id="city" name="city" className="select" defaultValue="">
              <option value="" disabled>Choisir…</option>
              {COMMUNES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}
      <div className="form-row">
        <div className="field">
          <label htmlFor="phone">Téléphone{compact ? " *" : ""}</label>
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" maxLength={30} placeholder="0690 00 00 00" required={compact} />
        </div>
        {compact ? (
          <div className="field">
            <label htmlFor="city">Commune</label>
            <select id="city" name="city" className="select" defaultValue="">
              <option value="" disabled>Choisir…</option>
              {COMMUNES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" maxLength={160} placeholder="vous@commerce.fr" />
          </div>
        )}
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>On vous recontacte par</legend>
        <div className="radio-row">
          {["WhatsApp", "Appel", "E-mail"].map((c, i) => (
            <label key={c}><input type="radio" name="preferred_channel" value={c} defaultChecked={i === 0} /><span>{c}</span></label>
          ))}
        </div>
      </fieldset>
      {!compact && (
        <div className="field">
          <label htmlFor="message">Un mot sur votre commerce ?</label>
          <textarea id="message" name="message" className="textarea" maxLength={2000} placeholder="Ex. : j'ai une roulotte à Sainte-Anne, je veux remplacer mes cartons avant la saison." />
        </div>
      )}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>J'accepte que Walty utilise ces informations pour me recontacter au sujet de ma demande. *</span>
      </label>
      {state.error && <p className="notice" role="alert">{state.error}</p>}
      <button type="submit" className="btn btn-primary btn-lg" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Envoi…" : <>Réserver ma démo gratuite <span className="arrow"><Icon name="arrow" size={16} /></span></>}
      </button>
      <p className="form-legal">
        Vos informations servent uniquement à vous recontacter, et sont conservées 3 ans au plus après notre dernier échange. Vous pouvez les consulter, les corriger ou les faire effacer à tout moment. Détails dans la <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </form>
  );
}
