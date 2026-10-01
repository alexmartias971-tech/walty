"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import WalletCard, { cardThemes } from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { planById } from "@/lib/offer";
import { submitLead, isDemo } from "@/lib/store";
import { isEmail, isPhone, normPhone } from "@/lib/programs";

/* Ce que le commerçant « dit » à l'agent, et la carte qui en sort */
const SCENES = [
  { theme: "plage", prompt: "Mon snack à Sainte-Anne, en orange. 10 bokits achetés = 1 offert." },
  { theme: "lagon", prompt: "Coffee shop sur la plage, tons turquoise. 8 cafés = 1 matcha offert." },
  { theme: "hibiscus", prompt: "Onglerie au Gosier, en rose. -50 % sur la 6e pose." },
  { theme: "kart", prompt: "Karting, noir et orange. 5 sessions = 1 offerte." },
];

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const on = () => setR(m.matches);
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return r;
}

/** La petite scène animée : on tape une phrase, l'agent « réfléchit », la carte apparaît. */
function AgentScene() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState("type"); // type → think → show
  const scene = SCENES[i];

  useEffect(() => {
    if (reduced) { setTyped(scene.prompt.length); setPhase("show"); return; }
    let t;
    if (phase === "type") {
      if (typed < scene.prompt.length) t = setTimeout(() => setTyped((n) => n + 1), 34);
      else t = setTimeout(() => setPhase("think"), 350);
    } else if (phase === "think") {
      t = setTimeout(() => setPhase("show"), 1100);
    } else {
      t = setTimeout(() => { setI((n) => (n + 1) % SCENES.length); setTyped(0); setPhase("type"); }, 2600);
    }
    return () => clearTimeout(t);
  }, [phase, typed, scene.prompt.length, reduced]);

  return (
    <div className="soon-scene" aria-hidden="true">
      <div className="soon-glow" />
      <div className="soon-prompt">
        <span className="soon-prompt-label"><Icon name="sparkle" size={14} /> Décrivez votre commerce</span>
        <p>{scene.prompt.slice(0, typed)}<span className={`soon-caret ${phase !== "type" ? "off" : ""}`} /></p>
      </div>
      <div className={`soon-think ${phase === "think" ? "on" : ""}`}>
        <span /><span /><span />
        <em>L'IA crée votre carte…</em>
      </div>
      <div className="soon-card-slot">
        <div key={`${i}-${phase === "show"}`} className={`soon-card ${phase === "show" ? "on" : ""}`}>
          <WalletCard card={cardThemes[scene.theme]} />
          <i className="soon-spark s1" /><i className="soon-spark s2" /><i className="soon-spark s3" />
        </div>
      </div>
      <div className="soon-mascot">
        <span className="soon-bubble">Bientôt !</span>
        <Mascot pose="wave" size={170} title="Walti vous fait signe" />
      </div>
    </div>
  );
}

function Waitlist({ plan }) {
  const [business, setBusiness] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState({ status: "idle", error: "" });

  async function submit(e) {
    e.preventDefault();
    const c = contact.trim();
    const mail = isEmail(c), tel = isPhone(c);
    if (!mail && !tel) return setState({ status: "idle", error: "Indiquez un e-mail ou un numéro de téléphone valide." });
    setState({ status: "sending", error: "" });
    try {
      await submitLead({
        business: business.trim() || "Liste d'attente IA",
        contact_name: "",
        email: mail ? c : "",
        phone: tel ? normPhone(c) : "",
        preferred_channel: tel ? "WhatsApp" : "E-mail",
        message: `Liste d'attente « Créer ma carte » (agent IA)${plan ? ` · formule envisagée : ${plan.name}` : ""}`,
        requested_plan: plan?.id,
      });
      setState({ status: "sent", error: "" });
    } catch (err) {
      setState({ status: "idle", error: err.message });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="soon-done" role="status">
        <span className="check"><Icon name="check" size={13} stroke={2.6} /></span>
        <p><b>C'est noté !</b> On vous prévient dès que l'agent IA est prêt. {isDemo && <span className="faint">(Aperçu : gardé dans ce navigateur.)</span>}</p>
      </div>
    );
  }
  return (
    <form className="soon-form" onSubmit={submit} noValidate>
      <p className="soon-form-title">Être prévenu du lancement</p>
      <div className="soon-form-row">
        <label className="sr-only" htmlFor="wl-business">Votre commerce</label>
        <input id="wl-business" className="input input-sm" placeholder="Votre commerce (facultatif)" value={business} onChange={(e) => setBusiness(e.target.value)} maxLength={120} autoComplete="organization" />
        <label className="sr-only" htmlFor="wl-contact">E-mail ou téléphone</label>
        <input id="wl-contact" className="input input-sm" placeholder="E-mail ou téléphone" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={160} autoComplete="email" aria-invalid={state.error ? true : undefined} />
        <button className="btn btn-dark btn-sm" disabled={state.status === "sending"}>{state.status === "sending" ? "Envoi…" : "Me prévenir"}</button>
      </div>
      {state.error ? <p className="field-error" role="alert">{state.error}</p> : (
        <p className="field-hint">Un seul message, au lancement. <Link href="/confidentialite" className="text-link" style={{ fontSize: 13 }}>Confidentialité</Link></p>
      )}
    </form>
  );
}

export default function ComingSoon() {
  const params = useSearchParams();
  const fid = params.get("formule");
  const plan = planById[fid] && fid !== "enseigne" ? planById[fid] : null;
  const demoHref = plan ? `/contact?formule=${plan.id}` : "/contact";

  return (
    <div className="soon">
      <div className="soon-copy">
        <span className="soon-kicker"><i className="soon-dot" /> Créer ma carte en ligne</span>
        <h1 className="soon-title">Bientôt <span className="grad-text">disponible</span>.</h1>
        <p className="lead">Bientôt, vous créerez votre carte vous-même : vous décrivez votre commerce en une phrase, notre agent IA la crée en 2 minutes.</p>
        <div className="soon-now">
          <p><b>En attendant, on la crée pour vous.</b> Réservez une démo gratuite : on vient chez vous, on crée votre carte et on l'installe.</p>
          {plan && <p className="faint" style={{ fontSize: 14 }}>Formule choisie : <b style={{ color: "var(--ink)" }}>{plan.name}</b> ({plan.monthly} € / mois)</p>}
          <div className="row">
            <Link href={demoHref} className="btn btn-primary btn-lg">Réserver une démo <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
            <Link href="/tarifs" className="text-link" style={{ fontSize: 15 }}>Voir les tarifs</Link>
          </div>
        </div>
        <Waitlist plan={plan} />
      </div>
      <AgentScene />
    </div>
  );
}
