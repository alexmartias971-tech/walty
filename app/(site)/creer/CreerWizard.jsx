"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Phone from "@/components/Phone";
import WalletCard, { cardFromConfig, cardColors, stripStyles } from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { plans, planById, planCode, trialDays } from "@/lib/offer";
import { submitLead, COMMUNES, isDemo } from "@/lib/store";
import { SECTORS_LIST, sectorById, REWARD_KINDS, defaultRules, mix, isEmail, isPhone, isSiret, isPostal, normPhone } from "@/lib/programs";
import { PLAN_RANK } from "@/lib/kpis";

const DRAFT_KEY = "walty-creer-brouillon-v2";
const STEPS = [
  { id: "vous", title: "Vous", icon: "user", hint: "Pour vous joindre et vous envoyer vos accès." },
  { id: "commerce", title: "Votre commerce", icon: "store", hint: "Pour adapter la carte à votre activité." },
  { id: "image", title: "Votre image", icon: "palette", hint: "Logo, couleurs, photo : votre carte vous ressemble." },
  { id: "regles", title: "Le cadeau", icon: "gift", hint: "Un tampon à chaque passage. Au bout : un produit offert ou une remise." },
  { id: "design", title: "Le design", icon: "image", hint: "Le look final de votre carte." },
  { id: "formule", title: "Votre formule", icon: "sparkle", hint: `Paiement au mois, sans engagement. ${trialDays} jours gratuits, sans carte bancaire.` },
  { id: "facturation", title: "Facturation", icon: "receipt", hint: "Pour établir vos factures à votre nom." },
  { id: "recap", title: "Vérifier et envoyer", icon: "check", hint: "Un dernier coup d'œil avant d'envoyer." },
];
const STEP = Object.fromEntries(STEPS.map((x, i) => [x.id, i]));
const VOLUMES = [
  { id: "moins-50", label: "Moins de 50" },
  { id: "50-150", label: "50 à 150" },
  { id: "150-400", label: "150 à 400" },
  { id: "plus-400", label: "Plus de 400" },
  { id: "inconnu", label: "Je ne sais pas" },
];
const CHARTERS = [
  { id: "complete", title: "Oui, j'ai une charte graphique", line: "Logo, couleurs, typo : on la respecte à la lettre." },
  { id: "logo", title: "J'ai juste un logo", line: "On construit la carte autour de votre logo." },
  { id: "none", title: "Non, aidez-moi", line: "Choisissez une ambiance, on s'occupe du reste." },
];
const MOODS = [
  { id: "chaleureux", label: "Chaleureux", accent: "#ff5b1f", secondary: "#ffa23d" },
  { id: "tropical", label: "Tropical", accent: "#2de2c4", secondary: "#ff5b1f" },
  { id: "elegant", label: "Élégant", accent: "#d4a85a", secondary: "#140c1f" },
  { id: "doux", label: "Doux", accent: "#ff2e7e", secondary: "#ffc2d6" },
  { id: "nature", label: "Nature", accent: "#3fbf6b", secondary: "#f6efe6" },
  { id: "nuit", label: "Nuit", accent: "#7b3cff", secondary: "#ff2e7e" },
];
const BGS = [
  { id: "nuit", label: "Nuit", hex: "#140c1f" },
  { id: "noir", label: "Noir", hex: "#101012" },
  { id: "creme", label: "Crème", hex: "#f6efe6" },
  { id: "blanc", label: "Blanc", hex: "#ffffff" },
];
const SHAPES = [
  { id: "rond", label: "Rond" },
  { id: "etoile", label: "Étoile" },
  { id: "coeur", label: "Cœur" },
  { id: "logo", label: "Mon logo" },
];

const INITIAL = {
  firstName: "", lastName: "", email: "", phone: "", whatsapp: true,
  merchant: "", sector: "", city: "", volume: "", links: "",
  charter: "", logo: null, primary: "#ff5b1f", secondary: "#7b3cff", photo: null, fontNote: "", sendCharter: false, mood: "",
  rules: {},
  template: "sunset", accent: "", bg: "", stampShape: "rond",
  plan: "tout-compris",
  legalName: "", siret: "", address: "", postal: "", billCity: "", billEmail: "",
  consent: false, news: false,
};

/* ───────── Images : réduites dans le navigateur avant l'envoi ───────── */
function shrinkImage(file, { maxW, maxH, keepAlpha }) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Choisissez une image (JPG, PNG ou WebP)."));
    if (file.size > 12 * 1024 * 1024) return reject(new Error("Image trop lourde (12 Mo maximum)."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire cette image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Impossible de lire cette image."));
      img.onload = () => {
        const r = Math.min(1, maxW / img.width, maxH / img.height);
        const w = Math.max(1, Math.round(img.width * r)), h = Math.max(1, Math.round(img.height * r));
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        if (!keepAlpha) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(keepAlpha ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const eur = (n) => new Intl.NumberFormat("fr-FR").format(n) + " €";

/* ───────── Petits composants de formulaire ───────── */
function Field({ id, label, hint, error, optional, children }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}{optional && <span className="faint"> (facultatif)</span>}</label>
      {children}
      {error ? <p className="field-error" id={`${id}-err`}>{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
function Seg({ name, value, options, onChange, legend, render }) {
  return (
    <fieldset className="field wiz-fieldset">
      {legend && <legend>{legend}</legend>}
      <div className="wiz-seg">
        {options.map((o) => {
          const v = typeof o === "object" ? o.id : o;
          return (
            <label key={String(v)}>
              <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
              <span>{render ? render(o) : typeof o === "object" ? o.label : o}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
function Upload({ label, value, onPick, onClear, hint, wide }) {
  return (
    <div className={`wiz-upload ${wide ? "wide" : ""}`}>
      <div className="wiz-upload-thumb" style={value ? { backgroundImage: `url(${value})` } : undefined}>{!value && <Icon name={wide ? "image" : "file"} size={22} />}</div>
      <div className="stack" style={{ "--gap": "6px" }}>
        <b>{label}</b>
        <div className="row" style={{ "--gap": "8px" }}>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            <Icon name="plus" size={16} /> {value ? "Changer" : "Ajouter"}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={onPick} />
          </label>
          {value && <button type="button" className="link-btn" onClick={onClear}>Retirer</button>}
        </div>
        {hint && <p className="field-hint">{hint}</p>}
      </div>
    </div>
  );
}
function ColorField({ id, label, value, onChange }) {
  return (
    <div className="wiz-color-field">
      <label htmlFor={id}>{label}</label>
      <div className="row" style={{ "--gap": "8px" }}>
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input className="input input-sm" value={value} maxLength={7} aria-label={`${label} (code)`} onChange={(e) => { const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`; onChange(v); }} />
      </div>
    </div>
  );
}

/* ───────── Règles de la carte à tampons ───────── */
function RulesEditor({ rules, set, sector }) {
  const r = { ...defaultRules("tampons", sector), ...rules };
  const up = (patch) => set({ ...r, ...patch });
  const kind = REWARD_KINDS.find((k) => k.id === r.rewardKind) || REWARD_KINDS[0];
  const gift = sectorById[sector];
  const suggestions = [gift?.kind === kind.id ? gift.gift : null, ...kind.suggestions].filter(Boolean);
  return (
    <>
      <Seg name="total" legend="Combien de tampons pour un cadeau ?" value={r.total} options={[5, 6, 8, 10, 12]} onChange={(v) => up({ total: v })} />
      <Seg name="rewardKind" legend="Au bout des tampons, vous offrez" value={kind.id} options={REWARD_KINDS} onChange={(v) => up({ rewardKind: v, reward: v === gift?.kind ? gift.gift : REWARD_KINDS.find((k) => k.id === v).suggestions[0] })} />
      <Field id="reward" label={kind.id === "remise" ? "La remise" : "Le produit offert"}>
        <input id="reward" className="input" value={r.reward} maxLength={40} onChange={(e) => up({ reward: e.target.value })} />
        <div className="wiz-suggest">{suggestions.map((g) => <button type="button" key={g} onClick={() => up({ reward: g })}>{g}</button>)}</div>
      </Field>
    </>
  );
}

function rulesError(r) {
  if (!String(r.reward || "").trim()) return "Écrivez le cadeau offert au bout des tampons.";
  return "";
}

function notifFor(card) {
  return `+1 tampon ! Plus que ${card.total - card.filled - 1} avant : ${card.reward.toLowerCase()} 🎉`;
}

/* ═════════════ L'assistant ═════════════ */
export default function CreerWizard() {
  const params = useSearchParams();
  const fromUrl = planCode(params.get("formule"));
  const [s, setS] = useState(() => ({ ...INITIAL, plan: fromUrl || INITIAL.plan }));
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [errors, setErrors] = useState({});
  const [restored, setRestored] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [sendError, setSendError] = useState("");
  const topRef = useRef(null);
  const loaded = useRef(false);

  // Brouillon : restauré à l'ouverture, sauvegardé à chaque changement
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d?.s && (d.s.firstName || d.s.email || d.s.merchant)) { setS({ ...INITIAL, ...d.s, plan: fromUrl || planCode(d.s.plan) || INITIAL.plan }); setStep(Math.min(d.step || 0, STEPS.length - 1)); setReached(d.reached || 0); setRestored(true); }
      }
    } catch {}
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!loaded.current || done) return;
    if (!(s.firstName || s.email || s.merchant || s.phone)) return; // rien à garder
    const t = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ s, step, reached })); } catch {} }, 400);
    return () => clearTimeout(t);
  }, [s, step, reached, done]);

  const set = (patch) => setS((p) => ({ ...p, ...patch }));
  const sector = sectorById[s.sector];
  const brandAccent = s.charter && s.charter !== "none" ? s.primary : MOODS.find((m) => m.id === s.mood)?.accent;
  const accent = s.accent || brandAccent || sector?.accent || "#ff5b1f";
  const bg = s.bg || mix(accent, "#0d0a14", 0.86);
  const rules = { ...defaultRules("tampons", s.sector), ...s.rules };
  const config = { merchant: s.merchant, sector: s.sector, logo: s.logo, photo: s.photo, accent, bg, template: s.template, stampShape: s.stampShape, program: { type: "tampons", rules } };
  const card = cardFromConfig(config);
  const display = card.display;
  // La carte sur mesure (fond avec votre photo) est comprise dans Tout compris
  const minPlan = s.template === "photo" ? "tout-compris" : "essentiel";
  const recommended = "tout-compris";

  function goto(i) {
    setStep(i);
    setErrors({});
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function validate(i) {
    const e = {};
    const id = STEPS[i]?.id;
    if (id === "vous") {
      if (!s.firstName.trim()) e.firstName = "Indiquez votre prénom.";
      if (!s.lastName.trim()) e.lastName = "Indiquez votre nom.";
      if (!isEmail(s.email)) e.email = "Cette adresse e-mail n'est pas valide (ex. : nom@commerce.fr).";
      if (!isPhone(s.phone)) e.phone = "Ce numéro n'est pas valide (ex. : 0690 12 34 56).";
    }
    if (id === "commerce") {
      if (!s.merchant.trim()) e.merchant = "Indiquez le nom de votre commerce.";
      if (!s.sector) e.sector = "Choisissez votre activité.";
      if (!s.volume) e.volume = "Choisissez une réponse (même « Je ne sais pas »).";
    }
    if (id === "image" && !s.charter) e.charter = "Choisissez une réponse.";
    if (id === "regles") { const m = rulesError(rules); if (m) e.rules = m; }
    if (id === "formule" && PLAN_RANK[s.plan] < PLAN_RANK[minPlan]) e.plan = `Le fond avec votre photo est compris dans la formule ${planById[minPlan].name}. Choisissez-la, ou un autre fond à l'étape « Le design ».`;
    if (id === "facturation") {
      if (!s.legalName.trim()) e.legalName = "Indiquez le nom qui doit figurer sur la facture.";
      if (s.siret.trim() && !isSiret(s.siret)) e.siret = "Ce SIRET n'est pas valide : vérifiez les 14 chiffres.";
      if (!s.address.trim()) e.address = "Indiquez l'adresse.";
      if (!isPostal(s.postal)) e.postal = "5 chiffres (ex. : 97190).";
      if (!s.billCity.trim()) e.billCity = "Indiquez la commune.";
      if (!isEmail(s.billEmail || s.email)) e.billEmail = "Cette adresse e-mail n'est pas valide.";
    }
    if (id === "recap" && !s.consent) e.consent = "Cochez la case pour accepter les conditions de vente.";
    return e;
  }

  function next(ev) {
    ev?.preventDefault();
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      setTimeout(() => document.querySelector(".has-error input, .has-error select, .field-error, .wiz-error")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }
    // préremplissages utiles
    if (step === STEP.commerce && !s.legalName) set({ legalName: s.merchant });
    if (step === STEP.commerce && !s.billCity && s.city && s.city !== "Hors Guadeloupe") set({ billCity: s.city });
    if (step === STEP.vous && !s.billEmail) set({ billEmail: s.email });
    if (step === STEP.design && PLAN_RANK[s.plan] < PLAN_RANK[minPlan]) set({ plan: minPlan });
    const n = Math.min(STEPS.length - 1, step + 1);
    setReached((r) => Math.max(r, n));
    goto(n);
  }

  function chooseSector(id) {
    set({ sector: id });
  }
  async function pick(e, key, opts) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try { set({ [key]: await shrinkImage(f, opts) }); setErrors((x) => ({ ...x, [key]: "" })); }
    catch (err) { setErrors((x) => ({ ...x, [key]: err.message })); }
  }
  function restart() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setS({ ...INITIAL, plan: fromUrl || INITIAL.plan }); setStep(0); setReached(0); setErrors({}); setRestored(false);
  }

  const selectedPlan = planById[s.plan] || planById[INITIAL.plan];

  async function submit(ev) {
    ev.preventDefault();
    const e = validate(STEP.recap);
    setErrors(e);
    if (Object.keys(e).length) return;
    for (let i = 0; i < STEP.recap; i++) {
      const ei = validate(i);
      if (Object.keys(ei).length) { setErrors(ei); goto(i); return; }
    }
    setSending(true); setSendError("");
    const brand = { charter: s.charter, primary: s.charter !== "none" ? s.primary : null, secondary: s.charter !== "none" ? s.secondary : null, mood: s.charter === "none" ? s.mood : null, font: s.fontNote || null, sendCharter: s.sendCharter, links: s.links || null };
    const cardConfig = { ...config, merchant: card.merchant, brand, volume: s.volume };
    const billingInfo = {
      legal_name: s.legalName.trim(), siret: s.siret.replace(/\s/g, "") || null, address: s.address.trim(), postal_code: s.postal.trim(), city: s.billCity.trim(), email: (s.billEmail || s.email).trim(),
      billing: "mensuel", marketing_optin: s.news,
    };
    const message = [
      `Carte créée en ligne · carte à tampons · formule ${selectedPlan.name} (${selectedPlan.monthly} € par mois)`,
      `Règles : ${display.summary}`,
      s.sendCharter ? "Le client va envoyer sa charte graphique." : "",
      s.links ? `Liens : ${s.links}` : "",
    ].filter(Boolean).join("\n");
    try {
      await submitLead({
        business: card.merchant, contact_name: `${s.firstName.trim()} ${s.lastName.trim()}`, sector: sector?.legacy, city: s.city, phone: normPhone(s.phone), email: s.email.trim(),
        preferred_channel: s.whatsapp ? "WhatsApp" : "Appel", message, requested_plan: s.plan, card_config: cardConfig, billing_info: billingInfo,
      });
      try {
        localStorage.setItem("walty-my-card", JSON.stringify({ config: cardConfig, plan: s.plan, name: s.firstName.trim(), at: new Date().toISOString() }));
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  /* ───────── Écran de fin ───────── */
  if (done) {
    return (
      <div className="wiz-done">
        <Mascot pose="stamp" size={200} impact={false} title="Walty tamponne votre carte" />
        <h1 className="display-m">C'est envoyé, {s.firstName.trim()} !</h1>
        <p className="lead" style={{ margin: "0 auto" }}>Votre carte est entre de bonnes mains.</p>
        <WalletCard card={card} />
        <ol className="wiz-next">
          <li><b>Sous 24 h</b><span>On vérifie votre carte et on l'active.</span></li>
          <li><b>Vos accès</b><span>Vous recevez votre QR code et vos accès {s.whatsapp ? "par WhatsApp" : "par e-mail"}.</span></li>
          <li><b>Au comptoir</b><span>Vous posez la feuille avec le QR code : vos clients scannent, c'est parti.</span></li>
        </ol>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href="/espace" className="btn btn-primary btn-lg">Voir mon espace (aperçu)</Link>
          <Link href="/" className="btn btn-ghost btn-lg">Retour à l'accueil</Link>
        </div>
        {isDemo && <p className="faint" style={{ fontSize: 13 }}>Aperçu du site : la demande est gardée dans ce navigateur. Vous la retrouvez dans l'espace admin.</p>}
      </div>
    );
  }

  const cur = STEPS[step];
  const last = step === STEPS.length - 1;
  const err = (k) => errors[k];
  const inputProps = (k) => ({ id: k, value: s[k], onChange: (e) => set({ [k]: e.target.value }), "aria-invalid": err(k) ? true : undefined, "aria-describedby": err(k) ? `${k}-err` : undefined });

  return (
    <div className="wiz" ref={topRef}>
      {/* Étapes */}
      <nav className="wiz-steps" aria-label="Étapes">
        <p className="wiz-steps-title">Créer ma carte</p>
        <ol>
          {STEPS.map((st, i) => (
            <li key={st.id}>
              <button type="button" className={`${i === step ? "on" : ""} ${i !== step && i <= reached ? "ok" : ""}`} disabled={i > reached} onClick={() => goto(i)} aria-current={i === step ? "step" : undefined}>
                <span className="wiz-step-dot">{i !== step && i <= reached ? <Icon name="check" size={13} stroke={2.6} /> : i + 1}</span>
                {st.title}
              </button>
            </li>
          ))}
        </ol>
        <p className="wiz-steps-foot">Brouillon enregistré automatiquement sur cet appareil.</p>
      </nav>

      {/* Formulaire */}
      <div className="wiz-main">
        <div className="wiz-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        <p className="wiz-count">Étape {step + 1} sur {STEPS.length}</p>
        <h1 className="display-m">{cur.title}</h1>
        <p className="muted">{cur.hint}</p>
        {restored && step > 0 && (
          <p className="wiz-restored">On a gardé ce que vous aviez commencé. <button type="button" className="link-btn" onClick={restart}>Tout recommencer</button></p>
        )}

        <div className="wiz-mobile-preview" aria-hidden="true"><WalletCard card={card} compact /></div>

        <form className="wiz-form" onSubmit={last ? submit : next} noValidate>
          {/* 1. Vous */}
          {cur.id === "vous" && (
            <>
              <div className="form-row">
                <Field id="firstName" label="Prénom" error={err("firstName")}><input className="input" autoComplete="given-name" maxLength={60} {...inputProps("firstName")} /></Field>
                <Field id="lastName" label="Nom" error={err("lastName")}><input className="input" autoComplete="family-name" maxLength={60} {...inputProps("lastName")} /></Field>
              </div>
              <Field id="email" label="E-mail" error={err("email")} hint="Vos accès et vos factures arrivent ici.">
                <input className="input" type="email" autoComplete="email" inputMode="email" maxLength={160} placeholder="nom@commerce.fr" {...inputProps("email")} />
              </Field>
              <Field id="phone" label="Téléphone" error={err("phone")}>
                <input className="input" type="tel" autoComplete="tel" inputMode="tel" maxLength={20} placeholder="0690 12 34 56" {...inputProps("phone")} />
              </Field>
              <label className="consent"><input type="checkbox" checked={s.whatsapp} onChange={(e) => set({ whatsapp: e.target.checked })} /><span>C'est aussi mon numéro WhatsApp (on vous y envoie votre carte)</span></label>
            </>
          )}

          {/* 2. Commerce */}
          {cur.id === "commerce" && (
            <>
              <Field id="merchant" label="Nom de votre commerce" error={err("merchant")} hint="Tel qu'il apparaîtra sur la carte.">
                <input className="input" maxLength={40} placeholder="Ex. : Le Bokit du Lagon" autoComplete="organization" {...inputProps("merchant")} />
              </Field>
              <fieldset className={`field wiz-fieldset ${err("sector") ? "has-error" : ""}`}>
                <legend>Votre activité</legend>
                <div className="wiz-chips">
                  {SECTORS_LIST.map((x) => (
                    <label key={x.id}><input type="radio" name="sector" checked={s.sector === x.id} onChange={() => chooseSector(x.id)} /><span>{x.label}</span></label>
                  ))}
                </div>
                {err("sector") && <p className="field-error">{err("sector")}</p>}
              </fieldset>
              <div className="form-row">
                <Field id="city" label="Commune" optional>
                  <select className="select" {...inputProps("city")}>
                    <option value="">Choisir…</option>
                    {COMMUNES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field id="links" label="Instagram ou site" optional>
                  <input className="input" maxLength={120} placeholder="@moncommerce" {...inputProps("links")} />
                </Field>
              </div>
              <fieldset className={`field wiz-fieldset ${err("volume") ? "has-error" : ""}`}>
                <legend>Combien de clients par semaine, environ ?</legend>
                <div className="wiz-chips">
                  {VOLUMES.map((v) => (
                    <label key={v.id}><input type="radio" name="volume" checked={s.volume === v.id} onChange={() => set({ volume: v.id })} /><span>{v.label}</span></label>
                  ))}
                </div>
                {err("volume") ? <p className="field-error">{err("volume")}</p> : <p className="field-hint">Ça nous aide à vous conseiller la bonne formule.</p>}
              </fieldset>
            </>
          )}

          {/* 3. Image */}
          {cur.id === "image" && (
            <>
              <fieldset className={`field wiz-fieldset ${err("charter") ? "has-error" : ""}`}>
                <legend>Avez-vous une charte graphique ?</legend>
                <div className="wiz-cards">
                  {CHARTERS.map((c) => (
                    <label key={c.id} className={`wiz-card ${s.charter === c.id ? "on" : ""}`}>
                      <input type="radio" name="charter" checked={s.charter === c.id} onChange={() => set({ charter: c.id })} className="sr-only" />
                      <b>{c.title}</b><span>{c.line}</span>
                    </label>
                  ))}
                </div>
                {err("charter") && <p className="field-error">{err("charter")}</p>}
              </fieldset>

              {(s.charter === "complete" || s.charter === "logo") && (
                <div className="wiz-panel">
                  <Upload label="Votre logo" value={s.logo} onPick={(e) => pick(e, "logo", { maxW: 320, maxH: 320, keepAlpha: true })} onClear={() => set({ logo: null })} hint="PNG avec fond transparent idéalement." />
                  {err("logo") && <p className="field-error">{err("logo")}</p>}
                  <div className="form-row">
                    <ColorField id="primary" label="Couleur principale" value={s.primary} onChange={(v) => set({ primary: v, accent: "" })} />
                    <ColorField id="secondary" label="Couleur secondaire" value={s.secondary} onChange={(v) => set({ secondary: v })} />
                  </div>
                  {s.charter === "complete" && (
                    <>
                      <Field id="fontNote" label="Votre police d'écriture" optional hint="Si vous la connaissez (ex. : Montserrat).">
                        <input className="input" maxLength={60} {...inputProps("fontNote")} />
                      </Field>
                      <label className="consent"><input type="checkbox" checked={s.sendCharter} onChange={(e) => set({ sendCharter: e.target.checked })} /><span>Je vous envoie ma charte complète (PDF) par e-mail ou WhatsApp après l'envoi</span></label>
                    </>
                  )}
                </div>
              )}

              {s.charter === "none" && (
                <fieldset className="field wiz-fieldset wiz-panel">
                  <legend>Quelle ambiance vous ressemble ?</legend>
                  <div className="wiz-moods">
                    {MOODS.map((m) => (
                      <label key={m.id} className={s.mood === m.id ? "on" : ""}>
                        <input type="radio" name="mood" checked={s.mood === m.id} onChange={() => set({ mood: m.id, accent: "" })} className="sr-only" />
                        <i style={{ background: `linear-gradient(135deg, ${m.accent} 0 55%, ${m.secondary} 55%)` }} />
                        <span>{m.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="field-hint">Pas de logo ? On met vos initiales, et on peut vous dessiner un logo simple.</p>
                </fieldset>
              )}

              {s.charter && (
                <div className="wiz-panel">
                  <Upload wide label="Une photo de votre commerce ou de vos produits" value={s.photo} onPick={(e) => pick(e, "photo", { maxW: 900, maxH: 600, keepAlpha: false })} onClear={() => set({ photo: null, template: s.template === "photo" ? "sunset" : s.template })} hint="Facultatif. Elle peut servir de fond à votre carte (formule Tout compris)." />
                  {err("photo") && <p className="field-error">{err("photo")}</p>}
                </div>
              )}
            </>
          )}

          {/* 4. Le cadeau */}
          {cur.id === "regles" && (
            <>
              <p className="wiz-type-current"><span className="step-icon"><Icon name="stamp" size={18} /></span> Carte à tampons</p>
              <RulesEditor rules={s.rules} set={(r) => set({ rules: r })} sector={s.sector} />
              {err("rules") && <p className="field-error wiz-error">{err("rules")}</p>}
              <div className="wiz-says"><small>Votre carte dira</small><b>{display.summary}</b></div>
            </>
          )}

          {/* 5. Design */}
          {cur.id === "design" && (
            <>
              <fieldset className="field wiz-fieldset">
                <legend>Le fond du bandeau</legend>
                <div className="wiz-strips">
                  {Object.entries(stripStyles).map(([id, st]) => {
                    const disabled = id === "photo" && !s.photo;
                    return (
                      <label key={id} className={disabled ? "disabled" : ""} title={disabled ? "Ajoutez une photo à l'étape « Votre image »" : undefined}>
                        <input type="radio" name="template" checked={s.template === id} disabled={disabled} onChange={() => set({ template: id })} />
                        <span><i style={{ background: st.css(accent, bg, s.photo) }} />{st.label}</span>
                      </label>
                    );
                  })}
                </div>
                {!s.photo && <p className="field-hint">« Votre photo » : ajoutez une photo à l'étape « Votre image ».</p>}
              </fieldset>
              <fieldset className="field wiz-fieldset">
                <legend>Couleur principale</legend>
                <div className="wiz-colors">
                  {[...(brandAccent ? [{ id: "brand", label: "Votre couleur", accent: brandAccent }] : []), ...(s.charter && s.charter !== "none" && s.secondary ? [{ id: "brand2", label: "Votre 2e couleur", accent: s.secondary }] : []), ...cardColors]
                    .filter((c, i, a) => a.findIndex((x) => x.accent.toLowerCase() === c.accent.toLowerCase()) === i)
                    .map((col) => (
                      <label key={col.id} title={col.label}>
                        <input type="radio" name="accent" checked={accent.toLowerCase() === col.accent.toLowerCase()} onChange={() => set({ accent: col.accent })} />
                        <span style={{ background: col.accent }}><b className="sr-only">{col.label}</b></span>
                      </label>
                    ))}
                  <label className="wiz-color-custom" title="Autre couleur">
                    <input type="color" value={accent} onChange={(e) => set({ accent: e.target.value })} aria-label="Choisir une autre couleur" />
                    <span>Autre</span>
                  </label>
                </div>
              </fieldset>
              <fieldset className="field wiz-fieldset">
                <legend>Fond de la carte</legend>
                <div className="wiz-bgs">
                  {[{ id: "teinte", label: "Teinté", hex: mix(accent, "#0d0a14", 0.86) }, ...BGS, ...(s.charter && s.charter !== "none" && s.secondary ? [{ id: "secondaire", label: "Votre 2e couleur", hex: s.secondary }] : [])].map((b) => (
                    <label key={b.id}>
                      <input type="radio" name="bg" checked={bg.toLowerCase() === b.hex.toLowerCase()} onChange={() => set({ bg: b.id === "teinte" ? "" : b.hex })} />
                      <span><i style={{ background: b.hex }} />{b.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="field wiz-fieldset">
                <legend>Forme des tampons</legend>
                <div className="wiz-seg">
                  {SHAPES.filter((x) => x.id !== "logo" || s.logo).map((x) => (
                    <label key={x.id}><input type="radio" name="shape" checked={s.stampShape === x.id} onChange={() => set({ stampShape: x.id })} /><span>{x.label}</span></label>
                  ))}
                </div>
              </fieldset>
              {s.template === "photo" && <p className="field-hint">Le fond avec votre photo est compris dans la formule Tout compris.</p>}
              <p className="field-hint">On vérifie et on peaufine chaque carte avant de l'activer.</p>
            </>
          )}

          {/* 6. Formule */}
          {cur.id === "formule" && (
            <>
              <div className="wiz-plans" role="radiogroup" aria-label="Formule">
                {plans.map((p) => {
                  const locked = PLAN_RANK[p.id] < PLAN_RANK[minPlan];
                  return (
                    <label key={p.id} className={`wiz-plan ${s.plan === p.id ? "on" : ""} ${locked ? "locked" : ""}`}>
                      <input type="radio" name="plan" checked={s.plan === p.id} disabled={locked} onChange={() => set({ plan: p.id })} className="sr-only" />
                      <span className="wiz-plan-top">
                        <b>{p.name}</b>
                        {p.id === recommended && !locked && <span className="chip chip-orange">Conseillée</span>}
                        <em>{p.monthly} € / mois</em>
                      </span>
                      <span className="wiz-plan-tag">{p.for}</span>
                      <span className="wiz-plan-sub">{locked ? "Pas compatible avec le fond « Votre photo »." : `${p.pitch} ${p.setup}.`}</span>
                    </label>
                  );
                })}
              </div>
              {err("plan") && <p className="field-error">{err("plan")}</p>}
              <p className="field-hint">Passer au Tout compris, c'est immédiat. Revenir à l'Essentiel se fait au mois suivant. Pas d'options payantes.</p>
              <div className="wiz-total">
                <div><small>Aujourd'hui</small><b>0 €</b><span>{trialDays} jours gratuits, sans carte bancaire</span></div>
                <div><small>Ensuite</small><b>{selectedPlan.monthly} € / mois</b><span>Sans engagement</span></div>
              </div>
            </>
          )}

          {/* 7. Facturation */}
          {cur.id === "facturation" && (
            <>
              <Field id="legalName" label="Nom sur la facture" error={err("legalName")} hint="Raison sociale, ou votre nom si vous êtes auto-entrepreneur.">
                <input className="input" maxLength={120} autoComplete="organization" {...inputProps("legalName")} />
              </Field>
              <Field id="siret" label="Numéro SIRET" optional error={err("siret")} hint="14 chiffres, sur votre Kbis ou votre avis de situation INSEE. Vous pourrez le donner plus tard.">
                <input className="input" inputMode="numeric" maxLength={17} placeholder="123 456 789 00012" {...inputProps("siret")} />
              </Field>
              <Field id="address" label="Adresse" error={err("address")}>
                <input className="input" maxLength={160} autoComplete="street-address" placeholder="N° et rue" {...inputProps("address")} />
              </Field>
              <div className="form-row">
                <Field id="postal" label="Code postal" error={err("postal")}>
                  <input className="input" inputMode="numeric" maxLength={5} autoComplete="postal-code" placeholder="97190" {...inputProps("postal")} />
                </Field>
                <Field id="billCity" label="Commune" error={err("billCity")}>
                  <input className="input" maxLength={80} list="communes" autoComplete="address-level2" {...inputProps("billCity")} />
                  <datalist id="communes">{COMMUNES.filter((c) => c !== "Hors Guadeloupe").map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
              </div>
              <Field id="billEmail" label="E-mail pour les factures" error={err("billEmail")}>
                <input className="input" type="email" inputMode="email" maxLength={160} {...inputProps("billEmail")} />
              </Field>
              <p className="field-hint">Walty n'applique pas la TVA (article 293 B du CGI) : le prix affiché est le prix payé.</p>
            </>
          )}

          {/* 8. Récapitulatif */}
          {cur.id === "recap" && (
            <>
              <div className="wiz-recap">
                {[
                  { i: STEP.vous, t: "Vous", v: [`${s.firstName} ${s.lastName}`, s.email, `${s.phone}${s.whatsapp ? " (WhatsApp)" : ""}`] },
                  { i: STEP.commerce, t: "Votre commerce", v: [s.merchant, sector?.label, s.city, s.volume === "inconnu" ? "Clients par semaine : je ne sais pas" : `${VOLUMES.find((x) => x.id === s.volume)?.label} clients par semaine`] },
                  { i: STEP.image, t: "Votre image", v: [CHARTERS.find((c) => c.id === s.charter)?.title, s.logo ? "Logo ajouté" : "Pas de logo", s.photo ? "Photo ajoutée" : null, s.sendCharter ? "Charte envoyée après" : null] },
                  { i: STEP.regles, t: "Votre carte", v: ["Carte à tampons", display.summary] },
                  { i: STEP.design, t: "Le design", v: [stripStyles[s.template]?.label, <span key="c" className="row" style={{ "--gap": "8px" }}><span className="swatch-dot" style={{ background: accent }} /> Couleur principale <span className="swatch-dot" style={{ background: bg }} /> Fond</span>, `Tampons : ${SHAPES.find((x) => x.id === s.stampShape)?.label.toLowerCase()}`] },
                  { i: STEP.formule, t: "Votre formule", v: [`${selectedPlan.name} · ${selectedPlan.monthly} € / mois, sans engagement`, selectedPlan.setup] },
                  { i: STEP.facturation, t: "Facturation", v: [s.legalName, s.siret ? `SIRET ${s.siret}` : "SIRET à fournir plus tard", `${s.address}, ${s.postal} ${s.billCity}`, s.billEmail || s.email] },
                ].map((b) => (
                  <div className="wiz-recap-block" key={b.t}>
                    <div className="wiz-recap-head"><b>{b.t}</b><button type="button" className="link-btn" onClick={() => goto(b.i)}><Icon name="edit" size={14} /> Modifier</button></div>
                    <ul>{b.v.filter(Boolean).map((x, k) => <li key={k}>{x}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="wiz-total">
                <div><small>Aujourd'hui</small><b>0 €</b><span>{trialDays} jours gratuits</span></div>
                <div><small>À la fin de l'essai</small><b>{selectedPlan.monthly} € / mois</b><span>seulement si vous continuez</span></div>
              </div>
              <label className={`consent ${err("consent") ? "has-error" : ""}`}>
                <input type="checkbox" checked={s.consent} onChange={(e) => set({ consent: e.target.checked })} />
                <span>J'accepte les <Link href="/cgv" target="_blank">conditions de vente</Link> et que Walty utilise ces informations pour créer ma carte et me facturer (<Link href="/confidentialite" target="_blank">confidentialité</Link>).</span>
              </label>
              {err("consent") && <p className="field-error">{err("consent")}</p>}
              <label className="consent">
                <input type="checkbox" checked={s.news} onChange={(e) => set({ news: e.target.checked })} />
                <span>Je veux recevoir des idées d'offres pour mon commerce (1 message par mois maximum). Facultatif.</span>
              </label>
            </>
          )}

          {sendError && <p className="notice" role="alert">{sendError}</p>}

          <div className="wiz-nav">
            {step > 0 ? <button type="button" className="btn btn-ghost" onClick={() => goto(step - 1)}>Retour</button> : <Link href="/" className="btn btn-ghost">Annuler</Link>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
              {last ? (sending ? "Envoi…" : "Créer ma carte") : "Continuer"} <span className="arrow"><Icon name="arrow" size={16} /></span>
            </button>
          </div>
        </form>
        <p className="faint" style={{ fontSize: 14, marginTop: 18 }}>Besoin d'aide ? <Link href="/contact" className="text-link" style={{ fontSize: 14 }}>Réservez une démo : on crée votre carte avec vous</Link></p>
      </div>

      {/* Aperçu */}
      <aside className="wiz-preview" aria-label="Aperçu de votre carte">
        <p className="wiz-preview-label">Aperçu en direct</p>
        <Phone card={card} notif={{ app: card.merchant, text: notifFor(card) }} animateStamp />
      </aside>
    </div>
  );
}
