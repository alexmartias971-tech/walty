"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import WalletCard, { cardFromConfig } from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { plans, planById, highlights, pushRules } from "@/lib/offer";
import { site } from "@/lib/site.config";
import { PLAN_RANK, demoStats, emptyStats, kpiTiles, planLabel } from "@/lib/kpis";
import { isDemo, merchantSession, merchantSignIn, merchantSignOut, getMyAccount, listMyPushes, requestPush, cancelPush } from "@/lib/store";

const EXAMPLE = {
  business: "Le Bokit du Lagon",
  plan: "premium",
  contact_name: "Démo",
  card_config: { merchant: "Le Bokit du Lagon", color: "flamboyant", strip: "sunset", total: 10, reward: "1 bokit offert" },
};
const nextPlan = { essentiel: "premium", premium: "pro", pro: null };
/** Compte d'aperçu du site (sans base de données branchée) : un commerçant tout juste activé. */
const freshAccount = (email) => ({
  business: "Mon commerce",
  plan: "premium",
  contact_name: (email || "").split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  card_config: { merchant: "Mon commerce", color: "flamboyant", strip: "sunset", program: { type: "tampons", rules: { total: 10, reward: "1 produit offert" } } },
});

/* ───────── Connexion ───────── */
function Login({ onIn, onExample }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!isDemo && (!email || !password)) return setError("Indiquez votre e-mail et votre mot de passe.");
    setBusy(true);
    try { await merchantSignIn(email, password); onIn(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return (
    <section className="esp-login">
      <div className="esp-login-card">
        <Mascot pose="wave" size={150} title="Walti vous dit bonjour" />
        <h1 className="display-m">Mon espace</h1>
        <p className="muted">Votre carte, vos clients, vos chiffres.</p>
        <form onSubmit={submit} className="stack" style={{ "--gap": "14px", width: "100%" }}>
          <div className="field">
            <label htmlFor="esp-email">E-mail</label>
            <input id="esp-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="esp-pass">Mot de passe</label>
            <input id="esp-pass" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="notice" role="alert">{error}</p>}
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
        </form>
        <button type="button" className="btn btn-ghost" onClick={onExample} style={{ width: "100%" }}>Voir un exemple</button>
        <p className="faint" style={{ fontSize: 14, textAlign: "center" }}>
          Pas encore de carte ? <Link href="/contact" className="text-link" style={{ fontSize: 14 }}>Réserver une démo</Link><br />
          Mot de passe oublié ? <Link href="/contact" className="text-link" style={{ fontSize: 14 }}>Écrivez-nous</Link>
        </p>
        {isDemo && <p className="faint" style={{ fontSize: 12.5, textAlign: "center" }}>Aperçu du site : n'importe quel e-mail fonctionne.</p>}
      </div>
    </section>
  );
}

/* ───────── Petits outils ───────── */
const TABS = [
  { id: "accueil", label: "Accueil", icon: "grid" },
  { id: "notifications", label: "Notifications", short: "Notifs", icon: "bell" },
  { id: "carte", label: "Ma carte", icon: "wallet" },
  { id: "chiffres", label: "Mes chiffres", short: "Chiffres", icon: "chart" },
  { id: "offre", label: "Mon offre", short: "Offre", icon: "sparkle" },
];
const TEMPLATES = [
  { label: "Offre du jour", text: "Aujourd'hui seulement : -20 % sur tout ! On vous attend 🎉" },
  { label: "Nouveauté", text: "Nouveau chez nous : venez goûter avant tout le monde 😍" },
  { label: "Créneau libre", text: "Il reste des places cet après-midi. On vous garde un créneau ?" },
  { label: "Double tampon", text: "Ce week-end, chaque passage vous rapporte 2 tampons ✌️" },
  { label: "Fermeture", text: "Info : nous serons fermés lundi. À très vite !" },
];
const fmtDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const fmtDateTime = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
function weekStart() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // lundi = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}
function pushStatus(p) {
  if (p.status === "envoye") return { label: `Envoyée${p.sent_at ? ` le ${fmtDate(p.sent_at)}` : ""}`, cls: "chip-lagon" };
  if (p.status === "annule") return { label: "Annulée", cls: "" };
  if (p.send_at && new Date(p.send_at) > new Date()) return { label: `Programmée · ${fmtDateTime(p.send_at)}`, cls: "chip-violet" };
  return { label: "En cours d'envoi", cls: "chip-orange" };
}
const exampleHistory = () => [
  { id: "ex1", created_at: new Date(Date.now() - 9 * 864e5).toISOString(), message: "Ce soir on est à Bois-Jolan ! Votre 10e bokit est offert 🌅", status: "envoye", sent_at: new Date(Date.now() - 9 * 864e5).toISOString() },
  { id: "ex2", created_at: new Date(Date.now() - 16 * 864e5).toISOString(), message: "Nouveau : le bokit morue-avocat. Le 1er à -50 % pour vous.", status: "envoye", sent_at: new Date(Date.now() - 16 * 864e5).toISOString() },
];

/* Aperçu : la notification telle qu'elle s'affiche sur l'écran verrouillé */
function LockPreview({ card, text }) {
  return (
    <div className="esp-lockscreen" aria-label="Aperçu sur le téléphone de vos clients">
      <div className="esp-lock-time">18:42</div>
      <div className="esp-lock-date">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
      <div className={`esp-lock-notif ${text ? "" : "empty"}`}>
        <span className="esp-lock-icon" style={card.logo ? { backgroundImage: `url(${card.logo})`, backgroundColor: "#fff" } : { background: card.accent }}>{card.logo ? "" : card.initials}</span>
        <div>
          <div className="esp-lock-head"><b>{card.merchant}</b><span>maintenant</span></div>
          <p>{text || "Votre message apparaîtra ici."}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Onglet Notifications ───────── */
function Notifications({ card, plan, rank, clients, example, email, say }) {
  const [history, setHistory] = useState(example ? exampleHistory() : []);
  const [loaded, setLoaded] = useState(example);
  const [msg, setMsg] = useState("");
  const [when, setWhen] = useState("now");
  const [at, setAt] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const perWeek = pushRules.perWeek[plan];
  const canSchedule = pushRules.schedule[plan];
  const used = history.filter((p) => p.status !== "annule" && new Date(p.created_at) >= weekStart()).length;
  const left = perWeek === Infinity ? Infinity : Math.max(0, perWeek - used);
  const minAt = new Date(Date.now() + 15 * 60e3 - new Date().getTimezoneOffset() * 60e3).toISOString().slice(0, 16);

  useEffect(() => {
    if (example) { setHistory(exampleHistory()); setLoaded(true); return; }
    listMyPushes(email).then((h) => { setHistory(h || []); setLoaded(true); }).catch((e) => { setError(e.message); setLoaded(true); });
  }, [example, email]);

  function check() {
    setError("");
    if (!msg.trim()) return setError("Écrivez votre message d'abord.");
    if (left <= 0) return setError("Vous avez utilisé vos notifications de la semaine.");
    if (when === "later" && (!at || new Date(at) <= new Date())) return setError("Choisissez une date et une heure à venir.");
    setConfirm(true);
  }
  async function send() {
    setBusy(true); setError("");
    const send_at = when === "later" ? new Date(at).toISOString() : null;
    try {
      if (example) {
        setHistory((h) => [{ id: `ex${Date.now()}`, created_at: new Date().toISOString(), message: msg.trim(), status: "a_envoyer", send_at }, ...h]);
        say("Exemple : rien n'a été envoyé.");
      } else {
        const saved = await requestPush({ email, business: card.merchant, message: msg, send_at });
        setHistory((h) => [saved, ...h]);
        say(send_at ? "Notification programmée ✓" : "Notification reçue ✓ Elle part aujourd'hui.");
      }
      setMsg(""); setAt(""); setWhen("now"); setConfirm(false);
    } catch (e) {
      setError(e.message); setConfirm(false);
    } finally { setBusy(false); }
  }
  async function cancel(p) {
    try {
      if (!example) await cancelPush(p.id);
      setHistory((h) => h.filter((x) => x.id !== p.id));
      say("Notification annulée.");
    } catch (e) { say(e.message); }
  }

  if (rank < 1) {
    return (
      <div className="esp-tabpanel">
        <div className="esp-notif-grid">
          <div className="esp-box">
            <span className="chip chip-violet" style={{ justifySelf: "start" }}>Avec Premium et Pro</span>
            <h2 className="esp-h-lg">Prévenez vos clients en 1 clic</h2>
            <p className="muted">Une offre, une nouveauté, un créneau libre : votre message s'affiche sur le téléphone de vos clients, même écran éteint. Comme un SMS, sans payer chaque envoi.</p>
            <ul className="list">
              <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Premium : 2 notifications par semaine</li>
              <li><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>Pro : illimité, et vous pouvez les programmer</li>
            </ul>
            <Link href="/contact?formule=premium" className="btn btn-primary" style={{ justifySelf: "start" }}>Débloquer avec Premium · 49 €</Link>
          </div>
          <LockPreview card={card} text="Aujourd'hui seulement : -20 % sur tout ! On vous attend 🎉" />
        </div>
        <AutoMessages rank={rank} example={example} />
      </div>
    );
  }

  return (
    <div className="esp-tabpanel">
      <div className="esp-notif-grid">
        <div className="esp-box">
          <div className="esp-box-head">
            <h2 className="esp-h-lg">Nouvelle notification</h2>
            <span className={`chip ${left === 0 ? "" : "chip-orange"}`}>{left === Infinity ? "Illimité" : `Il vous en reste ${left} cette semaine`}</span>
          </div>

          {!confirm ? (
            <>
              <div className="field">
                <label htmlFor="push-msg">1. Votre message</label>
                <textarea id="push-msg" className="textarea" value={msg} onChange={(e) => { setMsg(e.target.value.slice(0, pushRules.maxLength)); setError(""); }} maxLength={pushRules.maxLength} placeholder="Ex. : Ce soir, le 2e bokit à moitié prix 🌅" style={{ minHeight: 96 }} disabled={left === 0} />
                <span className="field-hint">{msg.length}/{pushRules.maxLength} caractères · court et direct, ça marche mieux</span>
              </div>
              <div className="field">
                <span className="esp-label">Besoin d'une idée ?</span>
                <div className="wiz-suggest">{TEMPLATES.map((t) => <button type="button" key={t.label} onClick={() => { setMsg(t.text); setError(""); }} disabled={left === 0}>{t.label}</button>)}</div>
              </div>
              <fieldset className="field wiz-fieldset">
                <legend>2. Quand ?</legend>
                <div className="wiz-seg">
                  <label><input type="radio" name="push-when" checked={when === "now"} onChange={() => setWhen("now")} /><span>Maintenant</span></label>
                  <label className={canSchedule ? "" : "is-off"} title={canSchedule ? undefined : "Avec la formule Pro"}>
                    <input type="radio" name="push-when" checked={when === "later"} disabled={!canSchedule} onChange={() => setWhen("later")} />
                    <span>Programmer {!canSchedule && <em className="esp-mini-lock">Pro</em>}</span>
                  </label>
                </div>
                {when === "later" && (
                  <input type="datetime-local" className="input input-sm" value={at} min={minAt} onChange={(e) => setAt(e.target.value)} aria-label="Date et heure d'envoi" style={{ maxWidth: 260, marginTop: 8 }} />
                )}
              </fieldset>
              {error && <p className="field-error" role="alert">{error}</p>}
              <button type="button" className="btn btn-primary btn-lg" onClick={check} disabled={left === 0} style={{ justifySelf: "start" }}>
                <Icon name="bell" size={18} /> {when === "later" ? "Programmer la notification" : `Envoyer à ${clients > 0 ? `mes ${clients} clients` : "mes clients"}`}
              </button>
              {left === 0 && (
                <div className="esp-lock">
                  <p><b>Vous avez utilisé vos 2 notifications de la semaine.</b><br />Les compteurs repartent lundi. Avec Pro, c'est illimité.</p>
                  <Link href="/contact?formule=pro" className="btn btn-dark btn-sm">Passer en Pro · 79 €</Link>
                </div>
              )}
              <p className="field-hint">{pushRules.delay}</p>
            </>
          ) : (
            <div className="esp-confirm" role="alertdialog" aria-label="Confirmer l'envoi">
              <p className="esp-confirm-q">{when === "later" ? `Programmer cette notification pour le ${fmtDateTime(new Date(at).toISOString())} ?` : `Envoyer cette notification à ${clients > 0 ? `vos ${clients} clients` : "vos clients"} ?`}</p>
              <blockquote>{msg}</blockquote>
              {error && <p className="field-error" role="alert">{error}</p>}
              <div className="row">
                <button type="button" className="btn btn-primary" onClick={send} disabled={busy}>{busy ? "Envoi…" : "Oui, envoyer"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={busy}>Modifier</button>
              </div>
            </div>
          )}
        </div>
        <div className="esp-preview-col">
          <p className="esp-label">Aperçu sur le téléphone de vos clients</p>
          <LockPreview card={card} text={msg.trim()} />
        </div>
      </div>

      <div className="esp-box">
        <h2 className="esp-h">Mes notifications</h2>
        {!loaded ? <p className="muted">Chargement…</p> : history.length === 0 ? (
          <div className="esp-empty"><Icon name="bell" size={22} /><p>Aucune notification pour l'instant. Écrivez votre première offre ci-dessus.</p></div>
        ) : (
          <ul className="esp-history">
            {history.map((p) => {
              const st = pushStatus(p);
              return (
                <li key={p.id}>
                  <div><p>{p.message}</p><small>Écrite le {fmtDate(p.created_at)}</small></div>
                  <div className="esp-history-side">
                    <span className={`chip ${st.cls}`}>{st.label}</span>
                    {p.status === "a_envoyer" && <button type="button" className="link-btn" onClick={() => cancel(p)}>Annuler</button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AutoMessages rank={rank} example={example} />
    </div>
  );
}

function AutoMessages({ rank, example }) {
  const rows = [
    { i: "stamp", t: "« +1 tampon ! »", d: "À chaque passage, avec le nombre de tampons restants.", min: 0 },
    { i: "gift", t: "« Votre cadeau est prêt ! »", d: "Quand la carte est pleine.", min: 0 },
    { i: "clock", t: "Relance des clients absents", d: "Un message part tout seul après 30 jours sans visite.", min: 2 },
    { i: "cake", t: "Cadeau d'anniversaire", d: "Le jour J, votre client reçoit son cadeau.", min: 2 },
    { i: "heart", t: "Demande d'avis Google", d: "Après le 3e passage, on lui demande un avis.", min: 2 },
  ];
  return (
    <div className="esp-box">
      <div className="esp-box-head">
        <h2 className="esp-h">Messages automatiques</h2>
        <span className="faint" style={{ fontSize: 13 }}>Vous n'avez rien à faire</span>
      </div>
      <ul className="esp-autos">
        {rows.map((a) => {
          const on = rank >= a.min;
          return (
            <li key={a.t} className={on ? "" : "off"}>
              <span className="esp-auto-icon"><Icon name={a.i} size={18} /></span>
              <div><b>{a.t}</b><p>{a.d}</p></div>
              {on ? <span className="chip chip-lagon" style={{ whiteSpace: "nowrap" }}>Activé</span> : <Link href="/contact?formule=pro" className="chip chip-violet" style={{ whiteSpace: "nowrap" }}>Avec Pro</Link>}
            </li>
          );
        })}
      </ul>
      {!example && rank >= 2 && <p className="field-hint">Les automatismes Pro sont réglés avec vous à l'installation.</p>}
    </div>
  );
}

/* ───────── Tableau de bord à onglets ───────── */
function Dashboard({ account, example, email, onOut }) {
  const [plan, setPlan] = useState(account.plan in PLAN_RANK ? account.plan : "essentiel");
  const [tab, setTab] = useState("accueil");
  const [toast, setToast] = useState("");
  const stats = example ? demoStats : emptyStats; // vrais chiffres : branchés à l'application de cartes
  const fresh = !stats.visits;
  const rank = PLAN_RANK[plan];
  const p = planById[plan];
  const card = useMemo(() => cardFromConfig({ ...account.card_config, ...(example ? {} : { filled: 0 }) }), [account, example]);
  const tiles = kpiTiles(stats);
  const max = Math.max(1, ...stats.weekly);
  const cap = p.clients;
  const used = stats.clients;
  const nearFull = cap && used / cap >= 0.85;
  const up = nextPlan[plan] ? planById[nextPlan[plan]] : null;
  const firstName = account.contact_name && account.contact_name !== "Démo" ? account.contact_name.split(" ")[0] : "";
  const topRef = useRef(null);

  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (TABS.some((t) => t.id === h)) setTab(h);
  }, []);
  function go(id) {
    setTab(id);
    try { history.replaceState(null, "", `#${id}`); } catch {}
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function say(t) { setToast(t); setTimeout(() => setToast(""), 3200); }

  return (
    <section className="esp" ref={topRef}>
      <div className="esp-top">
        <div>
          <p className="esp-hello">Bonjour{firstName ? ` ${firstName}` : ""} 👋</p>
          <h1 className="display-m">{card.merchant}</h1>
        </div>
        <div className="esp-top-right">
          <span className="chip chip-violet">Formule {planLabel[plan]}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onOut}><Icon name="logout" size={16} /> {example ? "Quitter l'exemple" : "Se déconnecter"}</button>
        </div>
      </div>

      {example && (
        <div className="esp-demo">
          <span><b>Exemple</b> avec de faux chiffres. Comparez les formules :</span>
          <div className="esp-seg" role="radiogroup" aria-label="Voir l'espace en formule">
            {plans.map((x) => (
              <label key={x.id}><input type="radio" name="esp-plan" checked={plan === x.id} onChange={() => setPlan(x.id)} /><span>{x.name}</span></label>
            ))}
          </div>
        </div>
      )}

      <nav className="esp-tabs" role="tablist" aria-label="Mon espace">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-label={t.label} aria-selected={tab === t.id} aria-controls={`esp-${t.id}`} id={`esp-tab-${t.id}`} className={tab === t.id ? "on" : ""} onClick={() => go(t.id)}>
            <Icon name={t.icon} size={18} /><span className="esp-tab-long">{t.label}</span><span className="esp-tab-short" aria-hidden="true">{t.short || t.label}</span>
          </button>
        ))}
      </nav>

      <div id={`esp-${tab}`} role="tabpanel" aria-labelledby={`esp-tab-${tab}`}>
        {/* ── Accueil ── */}
        {tab === "accueil" && (
          <div className="esp-tabpanel">
            {!example && fresh && (
              <div className="esp-welcome">
                <Mascot pose="wave" size={92} title="Walti vous souhaite la bienvenue" />
                <div>
                  <b>Votre carte est prête.</b>
                  <p>Posez l'affiche au comptoir : vos chiffres apparaîtront ici dès le premier tampon.</p>
                </div>
              </div>
            )}
            <div className="tiles t3">
              {tiles.slice(0, 3).map((t) => (
                <div key={t.id} className="tile"><small>{t.label}</small><b>{t.value}</b><span className={t.up ? "up" : ""}>{t.note}</span></div>
              ))}
            </div>
            <h2 className="esp-h">Que voulez-vous faire ?</h2>
            <div className="esp-actions">
              <button type="button" className="esp-action main" onClick={() => go("notifications")}>
                <span className="esp-action-icon"><Icon name="bell" size={22} /></span>
                <b>Envoyer une notification</b>
                <span>Une offre sur le téléphone de vos clients{rank < 1 ? " · avec Premium" : ""}</span>
              </button>
              <button type="button" className="esp-action" onClick={() => go("carte")}>
                <span className="esp-action-icon"><Icon name="wallet" size={22} /></span>
                <b>Voir ma carte</b><span>Et mon QR code comptoir</span>
              </button>
              <button type="button" className="esp-action" onClick={() => go("chiffres")}>
                <span className="esp-action-icon"><Icon name="chart" size={22} /></span>
                <b>Voir mes chiffres</b><span>Clients, passages, cadeaux</span>
              </button>
              <a className="esp-action" href={site.contact.phoneHref}>
                <span className="esp-action-icon"><Icon name="phone" size={22} /></span>
                <b>Besoin d'aide ?</b><span>Appelez-nous : {site.contact.phone}</span>
              </a>
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === "notifications" && <Notifications card={card} plan={plan} rank={rank} clients={used} example={example} email={email} say={say} />}

        {/* ── Ma carte ── */}
        {tab === "carte" && (
          <div className="esp-tabpanel esp-two">
            <div className="esp-box">
              <h2 className="esp-h">Ma carte</h2>
              <WalletCard card={card} member={example ? "Maëlys" : "Votre client"} />
              <p className="muted" style={{ fontSize: 15 }}>{card.summary}</p>
              <Link href="/contact" className="btn btn-ghost btn-sm" style={{ justifySelf: "start" }}><Icon name="edit" size={16} /> Demander un changement</Link>
            </div>
            <div className="esp-box">
              <h2 className="esp-h">Mon QR code comptoir</h2>
              <div className="counter-sign" style={{ margin: "0 auto" }}>
                <span className="counter-sign-title">Votre carte de fidélité est ici</span>
                <span className="counter-qr" />
                <span className="counter-sign-sub">Scannez avec l'appareil photo</span>
              </div>
              <ol className="esp-steps">
                <li>Le client scanne le QR code avec son téléphone.</li>
                <li>Il ajoute la carte à son Wallet en 1 touche.</li>
                <li>À chaque passage, votre équipe tamponne sa carte.</li>
              </ol>
              <p className="field-hint">Votre affiche vous est remise à l'installation. Besoin d'une autre ? <Link href="/contact" className="text-link" style={{ fontSize: 13 }}>Demandez-la</Link></p>
            </div>
          </div>
        )}

        {/* ── Mes chiffres ── */}
        {tab === "chiffres" && (
          <div className="esp-tabpanel">
            <div className="esp-box">
              <div className="esp-box-head">
                <h2 className="esp-h">Ce mois-ci</h2>
                {!example && <span className="faint" style={{ fontSize: 13 }}>Mis à jour à chaque tampon</span>}
              </div>
              <div className="tiles t4">
                {tiles.map((t) => {
                  const locked = PLAN_RANK[t.plan] > rank;
                  return (
                    <div key={t.id} className={`tile ${locked ? "locked" : ""}`}>
                      <small>{t.label}</small>
                      <b aria-hidden={locked}>{locked && !example ? "—" : t.value}</b>
                      {locked
                        ? <Link href={`/contact?formule=${t.plan}`} className="tile-lock"><Icon name="sparkle" size={14} /> Avec {planLabel[t.plan]}</Link>
                        : <span className={t.up ? "up" : ""}>{t.note}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="esp-two">
              <div className="esp-box">
                <h2 className="esp-h">Passages par semaine</h2>
                {fresh ? (
                  <div className="esp-empty"><Icon name="chart" size={22} /><p>Vos passages s'afficheront ici, semaine après semaine.</p></div>
                ) : (
                  <>
                    <div className="bars" role="img" aria-label={`Passages par semaine : ${stats.weekly.join(", ")}`}>
                      {stats.weekly.map((v, i) => (
                        <div key={i} className={`b ${i === stats.weekly.length - 1 ? "last" : ""}`} tabIndex={0}><em>{v}</em><i style={{ height: `${(v / max) * 100}%` }} /></div>
                      ))}
                    </div>
                    <div className="bars-x">{stats.weeks.map((w) => <span key={w}>{w}</span>)}</div>
                  </>
                )}
              </div>
              <div className="esp-box">
                <h2 className="esp-h">Place sur ma carte</h2>
                <div className="meter">
                  <div className="esp-meter-num"><b>{used}</b> <span>client{used > 1 ? "s" : ""} {cap ? `sur ${new Intl.NumberFormat("fr-FR").format(cap)}` : "· illimité"}</span></div>
                  <div className="meter-track"><span className="meter-fill" style={{ width: cap ? `${Math.min(100, (used / cap) * 100)}%` : used ? "18%" : "0%", background: nearFull ? "var(--hibiscus)" : undefined }} /></div>
                </div>
                {nearFull && up
                  ? <p className="esp-warn">Votre carte est presque pleine. Avec {up.name}, jusqu'à {up.clients ? new Intl.NumberFormat("fr-FR").format(up.clients) : "un nombre illimité de"} clients.</p>
                  : <p className="muted" style={{ fontSize: 14 }}>{cap ? "Encore de la place pour de nouveaux clients." : "Pas de limite : ajoutez autant de clients que vous voulez."}</p>}
                {nearFull && up && <Link href={`/contact?formule=${up.id}`} className="btn btn-primary btn-sm" style={{ justifySelf: "start" }}>Passer en {up.name}</Link>}
              </div>
            </div>
            <div className="esp-box">
              <h2 className="esp-h">Derniers passages</h2>
              {stats.recent.length ? (
                <ul className="esp-recent">
                  {stats.recent.map((r) => (
                    <li key={r.name + r.when}><span className="esp-avatar">{r.name[0]}</span><b>{r.name}</b><span>{r.stamps}</span><em>{r.when}</em></li>
                  ))}
                </ul>
              ) : (
                <div className="esp-empty"><Icon name="stamp" size={22} /><p>Aucun passage pour l'instant. Le premier tampon apparaîtra ici.</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── Mon offre ── */}
        {tab === "offre" && (
          <div className="esp-tabpanel esp-two">
            <div className="esp-box">
              <h2 className="esp-h">Ma formule</h2>
              <p className="esp-plan-name">{p.name} <span>{p.monthly} € / mois · sans engagement</span></p>
              <ul className="list">
                {highlights[plan].map(([on, txt]) => (
                  <li key={txt} className={on ? "" : "off"}><span className={`check ${on ? "" : "x"}`}><Icon name={on ? "check" : "x"} size={12} stroke={2.6} /></span>{txt}</li>
                ))}
              </ul>
              <Link href="/tarifs" className="btn btn-ghost btn-sm" style={{ justifySelf: "start" }}>Comparer les formules</Link>
            </div>
            {up ? (
              <div className="esp-box esp-upsell">
                <span className="chip chip-orange" style={{ justifySelf: "start" }}>Passer en {up.name} · {up.monthly} € / mois</span>
                <h2 className="esp-h-lg">{up.tagline}</h2>
                <ul className="list">
                  {highlights[up.id].filter(([on]) => on).map(([, txt]) => (
                    <li key={txt}><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>{txt}</li>
                  ))}
                </ul>
                <Link href={`/contact?formule=${up.id}`} className="btn btn-primary" style={{ justifySelf: "start" }}>Passer en {up.name}</Link>
              </div>
            ) : (
              <div className="esp-box">
                <h2 className="esp-h">Vous avez tout</h2>
                <p className="muted">La formule Pro inclut toutes les fonctions. Une idée, une question ? On est là.</p>
              </div>
            )}
            <div className="esp-box esp-help">
              <h2 className="esp-h">Une question ?</h2>
              <p className="muted">On vous répond du lundi au samedi, de 8 h à 18 h.</p>
              <div className="row">
                <a href={site.contact.phoneHref} className="btn btn-dark btn-sm"><Icon name="phone" size={16} /> {site.contact.phone}</a>
                <Link href="/contact" className="btn btn-ghost btn-sm">Nous écrire</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="esp-toast" role="status">{toast}</div>}
    </section>
  );
}

export default function EspaceApp() {
  const [state, setState] = useState({ loading: true });

  async function load() {
    const s = await merchantSession();
    if (!s) return setState({ loading: false, session: null });
    try {
      const acc = await getMyAccount();
      if (acc) return setState({ loading: false, session: s, account: acc, email: s.email });
      if (isDemo) return setState({ loading: false, session: s, account: freshAccount(s.email), email: s.email });
      setState({ loading: false, session: s, account: null });
    } catch (e) {
      setState({ loading: false, session: s, account: null, error: e.message });
    }
  }
  useEffect(() => { load(); }, []);

  if (state.loading) return <section className="esp-login"><div className="esp-login-card" style={{ minHeight: 420 }} /></section>;
  if (state.example) return <Dashboard account={EXAMPLE} example email="exemple@walti" onOut={async () => { await merchantSignOut(); setState({ loading: false, session: null }); }} />;
  if (!state.session) return <Login onIn={load} onExample={() => setState({ loading: false, session: null, example: true })} />;
  if (!state.account) {
    return (
      <section className="esp-login">
        <div className="esp-login-card">
          <Mascot pose="lost" size={150} title="Walti cherche votre carte" />
          <h1 className="display-m">Carte introuvable</h1>
          <p className="muted" style={{ textAlign: "center" }}>{state.error || "Aucune carte active avec cet e-mail. Votre carte est peut-être en cours d'activation."}</p>
          <Link href="/contact" className="btn btn-primary">Nous écrire</Link>
          <button type="button" className="btn btn-ghost" onClick={async () => { await merchantSignOut(); setState({ loading: false, session: null }); }}>Se déconnecter</button>
        </div>
      </section>
    );
  }
  return <Dashboard account={state.account} email={state.email} onOut={async () => { await merchantSignOut(); setState({ loading: false, session: null }); }} />;
}
