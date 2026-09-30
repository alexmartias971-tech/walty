"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { submitLead, SECTORS, COMMUNES, isDemo } from "@/lib/store";

const PLAN_LABELS = { essentiel: "Essentiel (29 €/mois)", premium: "Premium (49 €/mois)", enseigne: "Enseigne (dès 79 €/mois)", fondateur: "Offre fondateurs" };

export default function ContactForm() {
  const params = useSearchParams();
  const plan = PLAN_LABELS[params.get("formule")] || "";
  const [state, setState] = useState({ status: "idle", error: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // pot de miel anti-robots
    const data = Object.fromEntries(fd.entries());
    if (!data.phone && !data.email) {
      setState({ status: "idle", error: "Laissez au moins un téléphone ou un e-mail pour qu'on puisse vous répondre." });
      return;
    }
    setState({ status: "sending", error: "" });
    try {
      const r = await submitLead({ ...data, plan });
      setState({ status: "sent", error: "", demo: r.demo });
    } catch (err) {
      setState({ status: "idle", error: err.message });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="form-card glass success">
        <Mascot pose="stamp" size={200} title="Walti tamponne votre demande" />
        <h2 className="display-s">Demande bien reçue !</h2>
        <p className="muted" style={{ maxWidth: 420 }}>On vous recontacte sous 24 h ouvrées, par le moyen que vous avez choisi. À très vite.</p>
        {state.demo && (
          <p className="notice" style={{ maxWidth: 460 }}>Mode démo : la demande est enregistrée dans ce navigateur uniquement. Vous pouvez la voir dans l'<Link href="/admin" style={{ textDecoration: "underline" }}>espace admin</Link>.</p>
        )}
      </div>
    );
  }

  return (
    <form className="form-card glass" onSubmit={onSubmit} noValidate={false}>
      {plan && <span className="chip chip-orange" style={{ justifySelf: "start" }}>Formule : {plan}</span>}
      <div className="form-row">
        <div className="field">
          <label htmlFor="contact_name">Votre prénom et nom *</label>
          <input id="contact_name" name="contact_name" className="input" required autoComplete="name" maxLength={120} placeholder="Maëlys Durand" />
        </div>
        <div className="field">
          <label htmlFor="business">Nom du commerce *</label>
          <input id="business" name="business" className="input" required autoComplete="organization" maxLength={120} placeholder="Le Bokit du Lagon" />
        </div>
      </div>
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
      <div className="form-row">
        <div className="field">
          <label htmlFor="phone">Téléphone</label>
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" maxLength={30} placeholder="0690 00 00 00" />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" maxLength={160} placeholder="vous@commerce.fr" />
        </div>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>On vous répond comment ?</legend>
        <div className="radio-row">
          {["WhatsApp", "Appel", "E-mail"].map((c, i) => (
            <label key={c}><input type="radio" name="preferred_channel" value={c} defaultChecked={i === 0} /><span>{c}</span></label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="message">Votre message</label>
        <textarea id="message" name="message" className="textarea" maxLength={2000} placeholder="Ex. : j'ai une roulotte à Sainte-Anne, je veux remplacer mes cartons avant la saison." />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>J'accepte que Walti utilise ces informations pour me recontacter au sujet de ma demande. *</span>
      </label>
      {state.error && <p className="notice" role="alert">{state.error}</p>}
      <button type="submit" className="btn btn-primary" disabled={state.status === "sending"} style={{ justifySelf: "start" }}>
        {state.status === "sending" ? "Envoi…" : <>Envoyer ma demande <span className="arrow"><Icon name="arrow" size={16} /></span></>}
      </button>
      <p className="form-legal">
        * Champs obligatoires. Les informations recueillies sont destinées uniquement à Walti pour répondre à votre demande et, si vous devenez client, gérer la relation commerciale. Elles sont conservées 3 ans après notre dernier échange. Vous pouvez à tout moment y accéder, les rectifier, les effacer ou vous opposer à leur utilisation. En savoir plus dans notre <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
      {isDemo && <p className="faint" style={{ fontSize: 12 }}>Aperçu en mode démo : les demandes restent dans votre navigateur.</p>}
    </form>
  );
}
