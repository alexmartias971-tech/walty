"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Phone from "@/components/Phone";
import WalletCard, { cardFromConfig, cardColors, stripStyles } from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { plans, trialDays } from "@/lib/offer";
import { submitLead, COMMUNES, isDemo } from "@/lib/store";

const ACTIVITIES = [
  { id: "Roulotte / food truck", label: "Roulotte, snack", gift: "1 bokit offert" },
  { id: "Snack / restaurant", label: "Restaurant", gift: "1 dessert offert" },
  { id: "Coffee shop / bar", label: "Café, bar", gift: "1 café offert" },
  { id: "Boulangerie / pâtisserie", label: "Boulangerie", gift: "1 viennoiserie offerte" },
  { id: "Onglerie / institut", label: "Onglerie, institut", gift: "-50 % sur la prochaine pose" },
  { id: "Barbier / coiffure", label: "Barbier, coiffure", gift: "1 coupe offerte" },
  { id: "Coach / salle de sport", label: "Coach, sport", gift: "1 séance offerte" },
  { id: "Loisirs (karting, padel…)", label: "Loisirs", gift: "1 session offerte" },
  { id: "Boutique / commerce", label: "Boutique", gift: "-10 € sur votre achat" },
  { id: "Autre", label: "Autre", gift: "1 produit offert" },
];
const STEPS = ["Votre commerce", "Votre carte", "Votre cadeau", "Votre formule", "Vos coordonnées"];

/** Réduit le logo à 160 px pour garder une demande légère. */
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 160, c = document.createElement("canvas");
        c.width = size; c.height = size;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
        const r = Math.min(size / img.width, size / img.height);
        const w = img.width * r, h = img.height * r;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function CreerWizard() {
  const params = useSearchParams();
  const initialPlan = ["essentiel", "premium", "pro"].includes(params.get("formule")) ? params.get("formule") : "premium";
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [c, setC] = useState({ merchant: "", sector: "", city: "", color: "flamboyant", strip: "sunset", logo: null, total: 10, reward: "", plan: initialPlan, contact_name: "", phone: "", email: "", consent: false });
  const set = (k, v) => setC((p) => ({ ...p, [k]: v }));

  const activity = ACTIVITIES.find((a) => a.id === c.sector);
  const card = useMemo(() => cardFromConfig({ ...c, reward: c.reward || activity?.gift, filled: Math.max(1, Math.round(c.total * 0.6)) }), [c, activity]);
  const notif = { app: card.merchant, text: `+1 tampon ! Plus que ${card.total - card.filled - 1} avant : ${card.reward.toLowerCase()} 🎉` };

  function next() {
    setError("");
    if (step === 0 && (!c.merchant.trim() || !c.sector)) return setError("Indiquez le nom de votre commerce et votre activité.");
    if (step === 2 && !(c.reward || activity?.gift)) return setError("Choisissez le cadeau offert.");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() { setError(""); setStep((s) => Math.max(0, s - 1)); }

  async function onLogo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Choisissez une image (JPG ou PNG).");
    try { set("logo", await shrinkImage(f)); setError(""); } catch { setError("Impossible de lire cette image."); }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!c.contact_name.trim()) return setError("Indiquez votre prénom et votre nom.");
    if (!c.phone.trim() && !c.email.trim()) return setError("Laissez un téléphone ou un e-mail pour recevoir votre carte.");
    if (!c.consent) return setError("Cochez la case pour accepter les conditions.");
    setSending(true);
    const config = { merchant: card.merchant, sector: c.sector, color: c.color, strip: c.strip, logo: c.logo, total: card.total, reward: card.reward };
    const p = plans.find((x) => x.id === c.plan);
    try {
      await submitLead({
        business: card.merchant, contact_name: c.contact_name, sector: c.sector, city: c.city, phone: c.phone, email: c.email,
        preferred_channel: c.phone ? "WhatsApp" : "E-mail",
        message: `Carte créée en ligne. Formule ${p.name}. Cadeau : ${card.reward} au bout de ${card.total} passages.`,
        requested_plan: c.plan, card_config: config,
      });
      try { localStorage.setItem("walti-my-card", JSON.stringify({ config, plan: c.plan, name: c.contact_name, at: new Date().toISOString() })); } catch {}
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="wiz-shell wiz-done">
        <Mascot pose="stamp" size={220} impact={false} title="Walti tamponne votre carte" />
        <h1 className="display-m">C'est envoyé !</h1>
        <p className="lead" style={{ margin: "0 auto" }}>On vérifie votre carte et on l'active sous 24 h. Vous recevez ensuite votre QR code et vos accès{c.phone ? " par WhatsApp" : " par e-mail"}.</p>
        <WalletCard card={card} />
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href="/espace" className="btn btn-primary btn-lg">Voir mon espace (aperçu)</Link>
          <Link href="/" className="btn btn-ghost btn-lg">Retour à l'accueil</Link>
        </div>
        {isDemo && <p className="faint" style={{ fontSize: 13 }}>Aperçu : la demande est gardée dans ce navigateur. Vous la retrouvez dans l'espace admin.</p>}
      </div>
    );
  }

  return (
    <div className="wiz-shell">
      <div className="wiz-main">
        <div className="wiz-progress" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>
          {STEPS.map((s, i) => <span key={s} className={i <= step ? "on" : ""} />)}
        </div>
        <p className="wiz-count">Étape {step + 1} sur {STEPS.length}</p>
        <h1 className="display-m">{STEPS[step]}</h1>

        <div className="wiz-mobile-preview" aria-hidden="true"><WalletCard card={card} compact /></div>

        <form className="wiz-form" onSubmit={step === STEPS.length - 1 ? submit : (e) => { e.preventDefault(); next(); }}>
          {step === 0 && (
            <>
              <div className="field">
                <label htmlFor="merchant">Nom de votre commerce</label>
                <input id="merchant" className="input" value={c.merchant} onChange={(e) => set("merchant", e.target.value)} placeholder="Ex. : Le Bokit du Lagon" maxLength={40} autoFocus />
              </div>
              <fieldset className="field wiz-fieldset">
                <legend>Votre activité</legend>
                <div className="wiz-chips">
                  {ACTIVITIES.map((a) => (
                    <label key={a.id}><input type="radio" name="sector" checked={c.sector === a.id} onChange={() => set("sector", a.id)} /><span>{a.label}</span></label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="city">Votre commune <span className="faint">(facultatif)</span></label>
                <select id="city" className="select" value={c.city} onChange={(e) => set("city", e.target.value)}>
                  <option value="">Choisir…</option>
                  {COMMUNES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <fieldset className="field wiz-fieldset">
                <legend>Couleur</legend>
                <div className="wiz-colors">
                  {cardColors.map((col) => (
                    <label key={col.id} title={col.label}>
                      <input type="radio" name="color" checked={c.color === col.id} onChange={() => set("color", col.id)} />
                      <span style={{ background: col.accent }}><b className="sr-only">{col.label}</b></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="field wiz-fieldset">
                <legend>Fond de la carte</legend>
                <div className="wiz-strips">
                  {Object.entries(stripStyles).map(([id, st]) => (
                    <label key={id}>
                      <input type="radio" name="strip" checked={c.strip === id} onChange={() => set("strip", id)} />
                      <span><i style={{ background: st.css((cardColors.find((x) => x.id === c.color) || cardColors[0]).accent) }} />{st.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <span style={{ fontSize: 14, fontWeight: 800 }}>Votre logo <span className="faint">(facultatif)</span></span>
                <div className="row">
                  <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
                    <Icon name="plus" size={16} /> {c.logo ? "Changer de logo" : "Ajouter mon logo"}
                    <input type="file" accept="image/*" onChange={onLogo} className="sr-only" />
                  </label>
                  {c.logo && <button type="button" className="text-link" style={{ background: "none", border: 0, fontSize: 14 }} onClick={() => set("logo", null)}>Retirer</button>}
                </div>
                <p className="faint" style={{ fontSize: 13 }}>Pas de logo ? On met vos initiales. On peut aussi en faire un pour vous.</p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <fieldset className="field wiz-fieldset">
                <legend>Combien de passages pour un cadeau ?</legend>
                <div className="wiz-seg">
                  {[5, 6, 8, 10, 12].map((n) => (
                    <label key={n}><input type="radio" name="total" checked={c.total === n} onChange={() => set("total", n)} /><span>{n}</span></label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="reward">Le cadeau</label>
                <input id="reward" className="input" value={c.reward} onChange={(e) => set("reward", e.target.value)} placeholder={activity?.gift || "1 produit offert"} maxLength={40} />
                <div className="wiz-suggest">
                  {[activity?.gift, "1 boisson offerte", "-20 % sur le prochain achat"].filter(Boolean).map((g) => (
                    <button type="button" key={g} onClick={() => set("reward", g)}>{g}</button>
                  ))}
                </div>
              </div>
              <p className="muted" style={{ fontSize: 15 }}>Votre carte dira : <b style={{ color: "var(--ink)" }}>{card.total} passages = {card.reward.toLowerCase()}</b></p>
            </>
          )}

          {step === 3 && (
            <>
              <div className="wiz-plans" role="radiogroup" aria-label="Formule">
                {plans.map((p) => (
                  <label key={p.id} className={`wiz-plan ${c.plan === p.id ? "on" : ""}`}>
                    <input type="radio" name="plan" checked={c.plan === p.id} onChange={() => set("plan", p.id)} className="sr-only" />
                    <span className="wiz-plan-top"><b>{p.name}</b>{p.featured && <span className="chip chip-orange">Conseillée</span>}<em>{p.monthly} € / mois</em></span>
                    <span className="wiz-plan-tag">{p.tagline}</span>
                    <span className="wiz-plan-sub">{p.pitch}</span>
                  </label>
                ))}
              </div>
              <p className="wiz-trial"><Icon name="check" size={18} stroke={2.4} /> {trialDays > 0 ? `${trialDays} jours gratuits, sans carte bancaire. Vous ne payez rien aujourd'hui.` : "Sans engagement."}</p>
              <Link href="/tarifs" className="text-link" style={{ fontSize: 15 }} target="_blank">Comparer les formules en détail</Link>
            </>
          )}

          {step === 4 && (
            <>
              <div className="field">
                <label htmlFor="contact_name">Prénom et nom</label>
                <input id="contact_name" className="input" value={c.contact_name} onChange={(e) => set("contact_name", e.target.value)} autoComplete="name" maxLength={120} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="phone">Téléphone</label>
                  <input id="phone" type="tel" className="input" value={c.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="0690 00 00 00" maxLength={30} />
                </div>
                <div className="field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" className="input" value={c.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="vous@commerce.fr" maxLength={160} />
                </div>
              </div>
              <label className="consent">
                <input type="checkbox" checked={c.consent} onChange={(e) => set("consent", e.target.checked)} />
                <span>J'accepte les <Link href="/cgv" target="_blank">conditions de vente</Link> et que Walti utilise ces informations pour activer ma carte (<Link href="/confidentialite" target="_blank">confidentialité</Link>).</span>
              </label>
            </>
          )}

          {error && <p className="notice" role="alert">{error}</p>}

          <div className="wiz-nav">
            {step > 0 ? <button type="button" className="btn btn-ghost" onClick={back}>Retour</button> : <Link href="/" className="btn btn-ghost">Annuler</Link>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
              {step === STEPS.length - 1 ? (sending ? "Envoi…" : "Créer ma carte") : "Continuer"} <span className="arrow"><Icon name="arrow" size={16} /></span>
            </button>
          </div>
        </form>
        <p className="faint" style={{ fontSize: 14, marginTop: 18 }}>Besoin d'aide ? <Link href="/contact" className="text-link" style={{ fontSize: 14 }}>On vient vous l'installer</Link></p>
      </div>

      <aside className="wiz-preview" aria-label="Aperçu de votre carte">
        <p className="wiz-preview-label">Aperçu en direct</p>
        <Phone card={card} notif={notif} animateStamp />
      </aside>
    </div>
  );
}
