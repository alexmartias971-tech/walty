"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WalletCard, { cardFromConfig } from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { plans, planById } from "@/lib/offer";
import { PLAN_RANK, demoStats, emptyStats, kpiTiles, planLabel } from "@/lib/kpis";
import { isDemo, merchantSession, merchantSignIn, merchantSignOut, getMyAccount } from "@/lib/store";

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

/* ───────── Tableau de bord ───────── */
function Dashboard({ account, example, onOut }) {
  const [plan, setPlan] = useState(account.plan in PLAN_RANK ? account.plan : "essentiel");
  const [msg, setMsg] = useState("");
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

  function say(t) { setToast(t); setTimeout(() => setToast(""), 3200); }
  function send(e) {
    e.preventDefault();
    if (!msg.trim()) return say("Écrivez votre message d'abord.");
    say("Exemple : rien n'a été envoyé.");
    setMsg("");
  }

  return (
    <section className="esp">
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

      {example ? (
        <div className="esp-demo">
          <span><b>Exemple</b> avec de faux chiffres. Comparez les formules :</span>
          <div className="esp-seg" role="radiogroup" aria-label="Voir l'espace en formule">
            {plans.map((x) => (
              <label key={x.id}><input type="radio" name="esp-plan" checked={plan === x.id} onChange={() => setPlan(x.id)} /><span>{x.name}</span></label>
            ))}
          </div>
        </div>
      ) : fresh && (
        <div className="esp-welcome">
          <Mascot pose="wave" size={92} title="Walti vous souhaite la bienvenue" />
          <div>
            <b>Votre carte est prête.</b>
            <p>Posez l'affiche au comptoir : vos chiffres apparaîtront ici dès le premier tampon.</p>
          </div>
        </div>
      )}

      <div className="esp-grid">
        {/* Colonne carte */}
        <div className="esp-side">
          <div className="esp-box">
            <h2 className="esp-h">Ma carte</h2>
            <WalletCard card={card} member={example ? "Maëlys" : "Votre client"} />
            <p className="muted" style={{ fontSize: 15 }}>{card.summary}</p>
            <Link href="/contact" className="text-link" style={{ fontSize: 15 }}>Changer ma carte</Link>
          </div>
          <div className="esp-box">
            <h2 className="esp-h">Mon QR code comptoir</h2>
            <div className="counter-sign" style={{ margin: "0 auto" }}>
              <span className="counter-sign-title">Votre carte de fidélité est ici</span>
              <span className="counter-qr" />
              <span className="counter-sign-sub">Scannez avec l'appareil photo</span>
            </div>
            <p className="muted" style={{ fontSize: 14, textAlign: "center" }}>Votre affiche vous est remise à l'installation.</p>
          </div>
        </div>

        {/* Colonne chiffres */}
        <div className="esp-main">
          <div className="esp-box">
            <div className="esp-box-head">
              <h2 className="esp-h">Mes chiffres</h2>
              <span className="faint" style={{ fontSize: 13 }}>Ce mois-ci</span>
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
                      <div key={i} className={`b ${i === stats.weekly.length - 1 ? "last" : ""}`} tabIndex={0}>
                        <em>{v}</em><i style={{ height: `${(v / max) * 100}%` }} />
                      </div>
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

          {/* Envoyer un message */}
          <div className={`esp-box esp-send ${rank < 1 ? "is-locked" : ""}`}>
            <div className="esp-box-head">
              <h2 className="esp-h">Envoyer un message</h2>
              {example && rank === 1 && <span className="chip chip-orange">Reste 1 message cette semaine</span>}
              {example && rank === 2 && <span className="chip chip-orange">Illimité</span>}
              {!example && rank >= 1 && <span className="soon-tag soon-tag-lg">Bientôt disponible ici</span>}
            </div>
            {example || rank < 1 ? (
              <form onSubmit={send} className="stack" style={{ "--gap": "12px" }}>
                <textarea className="textarea" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={160} placeholder="Ex. : Ce soir on est à Bois-Jolan ! Le 2e bokit à moitié prix 🌅" disabled={rank < 1} aria-label="Votre message" style={{ minHeight: 90 }} />
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="faint" style={{ fontSize: 13 }}>{msg.length}/160 · s'affiche sur le téléphone de vos {used} clients</span>
                  <div className="row">
                    {rank === 2 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => say("Exemple : message programmé pour samedi 10 h.")}><Icon name="clock" size={16} /> Programmer</button>}
                    <button className="btn btn-primary btn-sm" disabled={rank < 1}><Icon name="bell" size={16} /> Envoyer</button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="esp-lock">
                <p><b>Bientôt, vous enverrez vos messages d'ici.</b><br />En attendant, écrivez-nous votre offre : on l'envoie à vos clients pour vous.</p>
                <Link href="/contact" className="btn btn-primary btn-sm">Nous l'envoyer</Link>
              </div>
            )}
            {rank < 1 && (
              <div className="esp-lock">
                <p><b>Prévenez vos clients en 1 clic.</b><br />Une offre, une nouveauté : elle s'affiche sur leur téléphone.</p>
                <Link href="/contact?formule=premium" className="btn btn-primary btn-sm">Débloquer avec Premium · 49 €</Link>
              </div>
            )}
          </div>

          {/* Automatismes Pro */}
          <div className={`esp-box ${rank < 2 ? "is-locked" : ""}`}>
            <div className="esp-box-head">
              <h2 className="esp-h">Ça tourne tout seul</h2>
              {rank < 2 && <span className="chip chip-violet">Pro</span>}
            </div>
            <ul className="esp-autos">
              {[
                { i: "clock", t: "Relance des clients absents", d: "Un message part tout seul après 30 jours sans visite." },
                { i: "cake", t: "Cadeau d'anniversaire", d: "Le jour J, votre client reçoit son cadeau." },
                { i: "heart", t: "Demande d'avis Google", d: "Après le 3e passage, on lui demande un avis." },
                { i: "users", t: "Parrainage", d: "Un client amène un ami : tous les deux gagnent un tampon." },
              ].map((a) => (
                <li key={a.t}>
                  <span className="esp-auto-icon"><Icon name={a.i} size={18} /></span>
                  <div><b>{a.t}</b><p>{a.d}</p></div>
                  {example || rank < 2
                    ? <span className={`esp-switch ${rank >= 2 ? "on" : ""}`} aria-label={rank >= 2 ? "Activé" : "Désactivé"} role="img" />
                    : <span className="chip chip-lagon" style={{ whiteSpace: "nowrap" }}>Inclus</span>}
                </li>
              ))}
            </ul>
            {!example && rank >= 2 && <p className="muted" style={{ fontSize: 14 }}>Notre équipe les met en place pour vous à l'installation.</p>}
            {rank < 2 && (
              <div className="esp-lock">
                <p><b>Votre carte travaille pendant que vous travaillez.</b></p>
                <Link href="/contact?formule=pro" className="btn btn-dark btn-sm">Débloquer avec Pro · 79 €</Link>
              </div>
            )}
          </div>

          {/* Derniers passages */}
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

          {/* Mon offre */}
          <div className="esp-box esp-offer">
            <div>
              <h2 className="esp-h">Mon offre</h2>
              <p><b>{p.name}</b> · {p.monthly} € / mois · sans engagement</p>
            </div>
            <div className="row">
              {up && <Link href={`/contact?formule=${up.id}`} className="btn btn-primary btn-sm">Passer en {up.name}</Link>}
              <Link href="/tarifs" className="btn btn-ghost btn-sm">Voir les formules</Link>
            </div>
          </div>
        </div>
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
      if (acc) return setState({ loading: false, session: s, account: acc });
      if (isDemo) return setState({ loading: false, session: s, account: freshAccount(s.email) });
      setState({ loading: false, session: s, account: null });
    } catch (e) {
      setState({ loading: false, session: s, account: null, error: e.message });
    }
  }
  useEffect(() => { load(); }, []);

  if (state.loading) return <section className="esp-login"><div className="esp-login-card" style={{ minHeight: 420 }} /></section>;
  if (state.example) return <Dashboard account={EXAMPLE} example onOut={async () => { await merchantSignOut(); setState({ loading: false, session: null }); }} />;
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
  return <Dashboard account={state.account} onOut={async () => { await merchantSignOut(); setState({ loading: false, session: null }); }} />;
}
