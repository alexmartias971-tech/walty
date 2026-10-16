"use client";

/**
 * Espace commerçant de Walty (walty.fr/espace), version 13 + connexion par mot de passe.
 * Connexion :
 * - le gérant : adresse e-mail (ou identifiant) + mot de passe, compte créé par Walty (mot de passe provisoire
 *   à changer à la première connexion) ;
 * - « connexion rapide » (employé en caisse) : le lien d'accès remis par Walty + code PIN, comme avant
 *   (un lien walty.fr/espace?acces=… ouvre directement le code PIN).
 * Puis : Accueil · Scanner · Clients (et fiche client) · Historique · Ma carte (QR du comptoir) · Mon programme
 * · Chiffres · Offres · Messages · Changer mon mot de passe.
 * Toutes les données passent par /api/espace/… (passerelle vers le logiciel de cartes).
 *
 * Versions plus simples, automatiques, si le logiciel de cartes n'a pas encore certaines adresses :
 * - sans login-password / password : seulement le lien + code PIN (comme avant) ;
 * - sans card / program / history / customer / insights : l'espace de la v12 (pas d'historique, fiche client simple…) ;
 * - sans me / stats / offers : le mode « de base » (login, scan, customers et notifications seulement).
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import Icon from "@/components/Icon";
import Mascot from "@/components/Mascot";
import { site } from "@/lib/site.config";
import Accueil from "./Accueil";
import ClientFiche from "./ClientFiche";
import Historique from "./Historique";
import MaCarte from "./MaCarte";
import Programme from "./Programme";
import { api, euro, fmtAgo, fmtDate, fmtDateTime, initials, post, TZ } from "./outils";

const LS = "walty-espace-acces";
/** Comment cet appareil s'est connecté la dernière fois : « password » (gérant) ou « pin » (caisse). */
const LS_MODE = "walty-espace-mode";
/** L'identifiant (jamais le mot de passe) gardé sur l'appareil pour la prochaine connexion. */
const LS_LOGIN = "walty-espace-identifiant";
/** Mot de passe provisoire pas encore changé (survit à un rechargement de la page, pas à la fermeture de l'onglet). */
const SS_MUST = "walty-espace-mdp-a-changer";

/** Retrouve le code d'accès (48 caractères) dans un lien collé, dans l'adresse, ou tel quel. */
const readToken = (text) => {
  const m = /(?:^|[^0-9a-f])([0-9a-f]{48})(?![0-9a-f])/i.exec(text || "");
  return m ? m[1].toLowerCase() : null;
};
const store = (key, session = false) => ({
  get: () => { try { return (session ? sessionStorage : localStorage).getItem(key); } catch { return null; } },
  set: (v) => { try { const s = session ? sessionStorage : localStorage; v ? s.setItem(key, v) : s.removeItem(key); } catch {} },
});
const lsToken = store(LS);
const lsMode = store(LS_MODE);
const lsLogin = store(LS_LOGIN);
const ssMust = store(SS_MUST, true);
const lsGet = lsToken.get;
const lsSet = lsToken.set;

/** "38,412" / "1:02.345" → millisecondes */
function parseLap(text) {
  const m = /^(?:(\d{1,2}):)?(\d{1,3})(?:\.(\d{1,3}))?$/.exec(text.trim().replace(",", "."));
  if (!m) return null;
  const ms = (Number(m[1] || 0) * 60 + Number(m[2])) * 1000 + Number((m[3] || "0").padEnd(3, "0"));
  return ms > 0 ? ms : null;
}
/** Le QR code d'une carte contient son numéro de série (format UUID). */
const readSerial = (text) => {
  const m = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.exec(text || "");
  return m ? m[0].toLowerCase() : null;
};

const EXPIRED = "Votre session a expiré (12 heures) : retapez votre code PIN.";
const EXPIRED_PW = "Votre session a expiré (12 heures) : reconnectez-vous.";

/* ═════════════════════════════ Entrée ═════════════════════════════ */
export default function EspaceApp() {
  const [phase, setPhase] = useState("loading"); // loading | login | access | pin | change | app | error
  const [token, setToken] = useState(null);
  const [business, setBusiness] = useState(null);
  const [me, setMe] = useState(null);
  const [notice, setNotice] = useState("");
  // Connexion par mot de passe installée sur le logiciel de cartes ? null = on vérifie, false = lien + code PIN seulement
  const [pwOk, setPwOk] = useState(null);
  const pwProbe = useRef(null);
  // « password » (gérant) ou « pin » (caisse) : comment cet appareil se connecte
  const [via, setVia] = useState("pin");
  // Mot de passe provisoire tapé à la connexion (gardé en mémoire seulement, pour le changer tout de suite)
  const tempPw = useRef("");

  /** Une seule vérification : la connexion par mot de passe est-elle installée sur le logiciel de cartes ? */
  const probe = useCallback(() => {
    if (!pwProbe.current) {
      pwProbe.current = api("login-password").then((r) => {
        const ok = r.ok ? r.available !== false : !r.unavailable;
        setPwOk(ok);
        return ok;
      });
    }
    return pwProbe.current;
  }, []);

  /** Pas (ou plus) connecté : quel écran de connexion montrer ? */
  const gate = useCallback(async (tk, mode) => {
    if (tk && mode !== "password") return setPhase("pin");
    const ok = await probe();
    if (ok) return setPhase("login");
    setPhase(tk ? "pin" : "access");
  }, [probe]);

  /** Lien d'accès refusé par le logiciel de cartes : on l'oublie sur cet appareil. */
  const invalidLink = useCallback(() => {
    lsSet(null);
    setToken(null);
    setBusiness(null);
    setNotice("Ce lien d'accès n'est plus valable. Demandez un nouveau lien à Walty.");
    setPhase("access");
  }, []);

  /** Connecté : l'espace, ou d'abord le choix du mot de passe si le provisoire n'est pas encore changé. */
  const enter = useCallback((r) => {
    setMe(r);
    setPhase(ssMust.get() ? "change" : "app");
  }, []);

  /** Mode de base (adresse « me » pas encore installée) : on devine l'état avec les adresses existantes. */
  const loadBasic = useCallback(async (tk, mode) => {
    const c = await api("customers?q=");
    if (c.ok) {
      const n = await api("notifications");
      return enter({
        basic: true,
        business: { name: "", logo_url: null },
        label: "",
        canNotify: n.status !== 403,
        program: null,
      });
    }
    if (c.status === 401) {
      setBusiness(null);
      return gate(tk, mode);
    }
    setNotice(c.error || "Le service ne répond pas.");
    setPhase("error");
  }, [enter, gate]);

  /** mode « password » : la session du gérant ne dépend d'aucun lien d'accès (on n'envoie pas le lien). */
  const load = useCallback(async (tk, mode = "pin") => {
    setPhase("loading");
    const withToken = tk && mode !== "password";
    const r = await api(`me${withToken ? `?token=${tk}` : ""}`);
    if (r.unavailable) return loadBasic(tk, mode);
    if (!r.ok) {
      if (r.status === 404 && withToken) return invalidLink();
      setNotice(r.error || "Le service ne répond pas.");
      return setPhase("error");
    }
    if (r.loggedIn) return enter(r);
    if (withToken) setBusiness(r.business || null);
    return gate(tk, mode);
  }, [enter, gate, invalidLink, loadBasic]);

  useEffect(() => {
    // Le lien d'accès peut arriver dans l'adresse : walty.fr/espace?acces=… ou #acces=…
    // On le garde sur cet appareil (jamais le code PIN), puis on l'efface de l'adresse : il ouvre le code PIN.
    const { search, hash, pathname } = window.location;
    const fromUrl = readToken(`${search} ${hash}`);
    if (fromUrl) {
      lsSet(fromUrl);
      window.history.replaceState(null, "", pathname);
    }
    const tk = fromUrl || readToken(lsGet());
    const mode = fromUrl ? "pin" : lsMode.get() === "password" ? "password" : "pin";
    setToken(tk);
    setVia(mode);
    load(tk, mode);
    // Lien d'accès ouvert alors que la page était déjà affichée (seul le « #acces=… » change)
    const onHash = () => {
      const t = readToken(window.location.hash);
      if (!t) return;
      lsSet(t);
      window.history.replaceState(null, "", window.location.pathname);
      setToken(t);
      setVia("pin");
      setNotice("");
      load(t, "pin");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [load]);

  // La connexion par mot de passe est-elle disponible ? (pour proposer le lien depuis l'écran du code PIN)
  useEffect(() => { probe(); }, [probe]);

  // Changement d'écran (code PIN, espace…) : on repart du haut de la page
  useEffect(() => { try { window.scrollTo({ top: 0 }); } catch {} }, [phase]);

  function openLink(tk) {
    lsSet(tk);
    setToken(tk);
    setVia("pin");
    setNotice("");
    load(tk, "pin");
  }
  async function forget() {
    // Changer de commerce : on oublie le lien ET on ferme la session éventuelle
    await post("logout");
    lsSet(null);
    setToken(null);
    setBusiness(null);
    setMe(null);
    setNotice("");
    setPhase("access");
  }
  async function logout() {
    await post("logout");
    ssMust.set(null);
    tempPw.current = "";
    setMe(null);
    setNotice("");
    load(token, via);
  }
  const expired = useCallback(() => {
    setMe(null);
    setNotice(via === "password" ? EXPIRED_PW : EXPIRED);
    load(token, via);
  }, [load, token, via]);

  /** Connexion réussie par mot de passe. */
  function passwordIn(login, password, mustChange) {
    lsMode.set("password");
    lsLogin.set(login);
    setVia("password");
    setNotice("");
    if (mustChange) {
      ssMust.set("1");
      tempPw.current = password;
    } else {
      ssMust.set(null);
      tempPw.current = "";
    }
    load(token, "password");
  }
  /** Connexion réussie par code PIN. */
  function pinIn() {
    lsMode.set("pin");
    ssMust.set(null);
    setVia("pin");
    setNotice("");
    load(token, "pin");
  }
  /** Depuis l'écran de connexion : passer au lien + code PIN. */
  function quick() {
    setNotice("");
    setPhase(token ? "pin" : "access");
  }
  function toPassword() {
    setNotice("");
    setPhase("login");
  }

  return (
    <div className="ec">
      {phase === "loading" && (
        <div className="ec-center" aria-busy="true">
          <div className="ec-spinner" aria-label="Chargement" />
        </div>
      )}
      {phase === "error" && (
        <div className="ec-center">
          <div className="ec-gate">
            <Mascot pose="lost" size={130} title="Walty cherche le réseau" />
            <h1 className="ec-title">Petit souci de connexion</h1>
            <p className="muted">{notice}</p>
            <button className="btn btn-primary btn-lg ec-full" onClick={() => load(token, via)}>Réessayer</button>
          </div>
        </div>
      )}
      {phase === "login" && <LoginScreen notice={notice} onIn={passwordIn} onQuick={quick} />}
      {phase === "access" && <AccessScreen notice={notice} onLink={openLink} onPassword={pwOk ? toPassword : null} />}
      {phase === "pin" && (
        <PinScreen
          token={token}
          business={business}
          notice={notice === EXPIRED ? notice : ""}
          onIn={pinIn}
          onInvalid={invalidLink}
          onForget={forget}
          onPassword={pwOk ? toPassword : null}
        />
      )}
      {phase === "change" && (
        <ChangePasswordScreen
          initialOld={tempPw.current}
          onDone={() => { ssMust.set(null); tempPw.current = ""; setPhase("app"); }}
          onLogout={logout}
          onExpired={expired}
        />
      )}
      {phase === "app" && me && <Dashboard me={me} onLogout={logout} onExpired={expired} />}
    </div>
  );
}

/* ═════════════════════════ Champ mot de passe (avec l'œil afficher / masquer) ═════════════════════════ */
function Eye({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M4 4l16 16" />}
    </svg>
  );
}
function PasswordField({ id, label, value, onChange, autoComplete = "current-password", autoFocus = false, hint, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="ec-pw">
        <input
          id={id}
          className="input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          minLength={minLength}
          maxLength={72}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <button type="button" className="ec-pw-eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show}>
          <Eye open={show} />
        </button>
      </div>
      {hint && <span id={`${id}-hint`} className="field-hint">{hint}</span>}
    </div>
  );
}

/* ═════════════════════════ Connexion : e-mail (ou identifiant) + mot de passe ═════════════════════════ */
function LoginScreen({ notice, onIn, onQuick }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const pwRef = useRef(null);
  // L'identifiant de la dernière connexion sur cet appareil (jamais le mot de passe)
  useEffect(() => { const l = lsLogin.get(); if (l) setLogin(l); }, []);

  async function submit(e) {
    e.preventDefault();
    const l = login.trim().toLowerCase();
    if (!l || !password || busy) return;
    setBusy(true);
    setError("");
    const r = await post("login-password", { login: l, password });
    setBusy(false);
    if (!r.ok) {
      setPassword("");
      if (r.unavailable) return setError("La connexion par mot de passe arrive bientôt : utilisez la connexion rapide (lien + code PIN) ci-dessous.");
      return setError(r.error || "Identifiant ou mot de passe incorrect.");
    }
    onIn(l, password, !!r.mustChangePassword);
  }
  return (
    <div className="ec-center">
      <div className="ec-gate">
        <Mascot pose="wave" size={130} title="Walty vous dit bonjour" />
        <p className="ec-kicker">Espace commerçant</p>
        <h1 className="ec-title">Connectez-vous à votre espace</h1>
        {notice && <p className="ec-info" role="status">{notice}</p>}
        <form onSubmit={submit} className="ec-form" noValidate>
          <div className="field">
            <label htmlFor="ec-login">Adresse e-mail ou identifiant</label>
            <input
              id="ec-login"
              className="input"
              type="text"
              inputMode="email"
              name="username"
              value={login}
              onChange={(e) => { setLogin(e.target.value); setError(""); }}
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={120}
              autoFocus={!lsLogin.get()}
              onKeyDown={(e) => { if (e.key === "Enter" && login.trim() && !password) { e.preventDefault(); pwRef.current?.querySelector("input")?.focus(); } }}
            />
          </div>
          <div ref={pwRef}>
            <PasswordField id="ec-password" label="Mot de passe" value={password} onChange={(v) => { setPassword(v); setError(""); }} autoFocus={!!lsLogin.get()} />
          </div>
          {error && <p className="ec-alert" role="alert">{error}</p>}
          <button className="btn btn-primary btn-lg ec-full" disabled={busy || !login.trim() || !password}>{busy ? "Connexion…" : "Se connecter"}</button>
        </form>
        <button type="button" className="ec-linkbtn" aria-expanded={forgot} onClick={() => setForgot((f) => !f)}>Mot de passe oublié ?</button>
        {forgot && (
          <p className="ec-info" role="status">
            Appelez Walty au <a href={site.contact.phoneHref}>{site.contact.phone}</a> ou écrivez à <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> : on vous en donne un nouveau.
          </p>
        )}
        <button type="button" className="ec-linkbtn ec-quick" onClick={onQuick}>Connexion rapide (employé en caisse) : lien + code PIN</button>
        <p className="faint ec-help">
          Pas encore client ? <Link href="/contact" className="text-link">Réserver une démo</Link>
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════ Mot de passe provisoire : le gérant choisit le sien ═════════════════════════ */
function ChangePasswordScreen({ initialOld, onDone, onLogout, onExpired }) {
  return (
    <div className="ec-center">
      <div className="ec-gate">
        <Mascot pose="wave" size={110} title="Walty vous accueille" />
        <p className="ec-kicker">Première connexion</p>
        <h1 className="ec-title">Choisissez votre mot de passe</h1>
        <p className="muted">Le mot de passe que Walty vous a donné est provisoire. Choisissez le vôtre : 8 caractères au moins.</p>
        <PasswordForm initialOld={initialOld} submitLabel="Enregistrer et entrer" onDone={onDone} onExpired={onExpired} />
        <button type="button" className="ec-linkbtn" onClick={onLogout}>Quitter</button>
      </div>
    </div>
  );
}

/** Formulaire de changement du mot de passe (première connexion, ou « Changer mon mot de passe » dans le menu). */
function PasswordForm({ initialOld = "", submitLabel = "Changer mon mot de passe", onDone, onExpired }) {
  const [old, setOld] = useState(initialOld);
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const knowsOld = !!initialOld;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!old) return setError("Tapez votre mot de passe actuel.");
    if (next.length < 8) return setError("Le nouveau mot de passe doit faire au moins 8 caractères.");
    if (next !== again) return setError("Les deux nouveaux mots de passe ne sont pas identiques.");
    if (next === old) return setError("Choisissez un mot de passe différent de l'actuel.");
    setBusy(true);
    setError("");
    const r = await post("password", { old, new: next });
    setBusy(false);
    if (!r.ok) {
      if (r.status === 401) return onExpired?.();
      if (r.unavailable) return setError("Le changement de mot de passe arrive bientôt. Appelez Walty si besoin.");
      if (r.error && /actuel/i.test(r.error) && knowsOld) setOld("");
      return setError(r.error || "Mot de passe non modifié. Réessayez.");
    }
    setNext("");
    setAgain("");
    setOld("");
    onDone?.();
  }
  return (
    <form onSubmit={submit} className="ec-form" noValidate>
      {/* champ caché pour les gestionnaires de mots de passe (identifiant du compte) */}
      <input type="text" name="username" autoComplete="username" value={lsLogin.get() || ""} readOnly hidden />
      {(!knowsOld || !old) && (
        <PasswordField id="ec-pw-old" label="Mot de passe actuel" value={old} onChange={(v) => { setOld(v); setError(""); }} autoFocus />
      )}
      <PasswordField id="ec-pw-new" label="Nouveau mot de passe" value={next} onChange={(v) => { setNext(v); setError(""); }} autoComplete="new-password" autoFocus={knowsOld && !!old} hint="8 caractères au moins. Une petite phrase est facile à retenir." minLength={8} />
      <PasswordField id="ec-pw-again" label="Retapez le nouveau mot de passe" value={again} onChange={(v) => { setAgain(v); setError(""); }} autoComplete="new-password" minLength={8} />
      {error && <p className="ec-alert" role="alert">{error}</p>}
      <button className="btn btn-primary btn-lg ec-full" disabled={busy || !next || !again}>{busy ? "Enregistrement…" : submitLabel}</button>
    </form>
  );
}

/** Rubrique « Changer mon mot de passe » (menu de l'espace). */
function MotDePasse({ guard, say }) {
  const [state, setState] = useState("form"); // form | done
  return (
    <div className="ec-pw-page">
      {state === "done" ? (
        <p className="ec-ok" role="status"><Icon name="check" size={18} /> Votre mot de passe est changé. Utilisez-le à votre prochaine connexion.</p>
      ) : (
        <>
          <p className="muted">Pour le compte du gérant (connexion par e-mail ou identifiant). Le code PIN de la caisse ne change pas.</p>
          <PasswordForm
            onDone={() => { setState("done"); say("Mot de passe changé."); }}
            onExpired={() => guard({ status: 401 })}
          />
          <p className="faint ec-help">Pas de mot de passe ? Walty peut vous créer un compte : <a href={site.contact.phoneHref}>0690 51 36 46</a>.</p>
        </>
      )}
    </div>
  );
}

/* ═════════════════════════ Connexion rapide : pas encore de lien ═════════════════════════ */
function AccessScreen({ notice, onLink, onPassword }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    const tk = readToken(text);
    if (!tk) return setError("Ce n'est pas un lien d'accès Walty. Copiez le lien complet reçu par e-mail ou sur votre kit.");
    onLink(tk);
  }
  return (
    <div className="ec-center">
      <div className="ec-gate">
        <Mascot pose="wave" size={140} title="Walty vous dit bonjour" />
        <p className="ec-kicker">{onPassword ? "Connexion rapide (caisse)" : "Espace commerçant"}</p>
        <h1 className="ec-title">Scannez, tamponnez, suivez vos clients</h1>
        <p className="muted">
          Ouvrez le <b>lien d'accès</b> que Walty vous a remis (ou scannez le QR code de votre kit en caisse), puis tapez votre code PIN.
        </p>
        {notice && <p className="ec-alert" role="alert">{notice}</p>}
        <form onSubmit={submit} className="ec-form">
          <div className="field">
            <label htmlFor="ec-link">Ou collez votre lien d'accès ici</label>
            <input id="ec-link" className="input" value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder="https://…" autoComplete="off" autoCapitalize="off" spellCheck={false} />
          </div>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-lg ec-full" disabled={!text.trim()}>Continuer</button>
        </form>
        {onPassword && <button type="button" className="ec-linkbtn" onClick={onPassword}>Se connecter avec un e-mail et un mot de passe</button>}
        <p className="faint ec-help">
          Lien perdu ou code PIN oublié ? Appelez-nous au <a href={site.contact.phoneHref}>{site.contact.phone}</a> ou écrivez à <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
          <br />Pas encore client ? <Link href="/contact" className="text-link">Réserver une démo</Link>
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════════ Code PIN ═════════════════════════════ */
function PinScreen({ token, business, notice, onIn, onInvalid, onForget, onPassword }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (pin.length < 4 || busy) return;
    setBusy(true);
    setError("");
    const r = await post("login", { token, pin });
    setBusy(false);
    if (!r.ok) {
      setPin("");
      // Lien inconnu du logiciel de cartes (mode de base : on ne pouvait pas le savoir avant)
      if (/^Lien invalide/.test(r.error || "")) return onInvalid();
      return setError(r.error || "Code PIN incorrect.");
    }
    onIn();
  }
  return (
    <div className="ec-center">
      <form className="ec-gate" onSubmit={submit}>
        {business?.name ? (
          <div className="ec-biz-logo">
            {business.logo_url ? <img src={business.logo_url} alt="" /> : <span>{initials(business.name)}</span>}
          </div>
        ) : (
          <div className="ec-biz-logo ec-biz-walty"><LogoMark size={56} /></div>
        )}
        <p className="ec-kicker">Espace commerçant</p>
        <h1 className="ec-title">{business?.name || "Votre commerce"}</h1>
        {notice && <p className="ec-info" role="status">{notice}</p>}
        <div className="field ec-full">
          <label htmlFor="ec-pin" className="ec-pin-label">Votre code PIN</label>
          <input
            id="ec-pin"
            className="input ec-pin"
            inputMode="numeric"
            autoComplete="one-time-code"
            type="password"
            pattern="\d{4,8}"
            autoFocus
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }}
            aria-describedby="ec-pin-help"
          />
          <span id="ec-pin-help" className="field-hint">4 à 8 chiffres. Après 5 erreurs, l'accès est bloqué par sécurité.</span>
        </div>
        {error && <p className="ec-alert" role="alert">{error}</p>}
        <button className="btn btn-primary btn-lg ec-full" disabled={busy || pin.length < 4}>{busy ? "Vérification…" : "Entrer"}</button>
        <button type="button" className="ec-linkbtn" onClick={onForget}>{business?.name ? "Ce n'est pas votre commerce ? Changer d'accès" : "Changer de lien d'accès"}</button>
        {onPassword && <button type="button" className="ec-linkbtn" onClick={onPassword}>Se connecter avec un e-mail et un mot de passe</button>}
        <p className="faint ec-help">Code PIN oublié ? Appelez Walty au <a href={site.contact.phoneHref}>{site.contact.phone}</a>.</p>
      </form>
    </div>
  );
}

/* ═════════════════════════════ Tableau de bord ═════════════════════════════ */
const SECTIONS = [
  { id: "accueil", label: "Accueil", icon: "store", main: true },
  { id: "scan", label: "Scanner", icon: "qr", main: true },
  { id: "clients", label: "Clients", icon: "users", main: true },
  { id: "historique", label: "Historique", icon: "clock", main: true, v13: true },
  { id: "carte", label: "Ma carte", icon: "wallet" },
  { id: "programme", label: "Mon programme", icon: "edit" },
  { id: "chiffres", label: "Chiffres", icon: "chart" },
  { id: "offres", label: "Offres", icon: "gift", full: true },
  { id: "notifs", label: "Messages", icon: "bell", needs: "canNotify" },
];
/** Rubrique du menu sans onglet : « Changer mon mot de passe » (compte du gérant). */
const PASSWORD = { id: "motdepasse", label: "Changer mon mot de passe", icon: "shield" };

function Dashboard({ me, onLogout, onExpired }) {
  const [tab, setTab] = useState("accueil");
  const [toast, setToast] = useState("");
  const [more, setMore] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [scanAuto, setScanAuto] = useState(false);
  const [today, setToday] = useState(null);
  // v13 : null = on ne sait pas encore, false = adresses card / program / history… pas encore installées
  const [v13, setV13] = useState(null);

  const sections = SECTIONS.filter((t) => (!t.needs || me[t.needs]) && !(t.full && me.basic) && !(t.v13 && v13 === false));
  // Barre du bas (téléphone) : 4 rubriques + « Plus »
  const main = sections.filter((t) => t.main);
  if (main.length < 4) main.push(...sections.filter((t) => !t.main).slice(0, 4 - main.length));
  const rest = sections.filter((t) => !main.includes(t));
  const current = tab === PASSWORD.id ? PASSWORD : sections.find((t) => t.id === tab) || sections[0];
  const bizName = me.business?.name || "Votre espace";

  const say = useCallback((t) => setToast(t), []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3800);
    return () => clearTimeout(id);
  }, [toast]);
  // Session expirée pendant l'utilisation : retour au code PIN
  const guard = useCallback((r) => {
    if (r.status === 401) { onExpired(); return false; }
    return true;
  }, [onExpired]);

  // La journée en cours (accueil) : sert aussi à savoir si les adresses de la v13 sont installées
  const refreshToday = useCallback(async () => {
    const r = await api("history?limit=8");
    if (!guard(r)) return;
    if (r.unavailable) { setV13(false); setToday(null); return; }
    if (r.ok) { setV13(true); setToday(r); }
  }, [guard]);
  // (appelée par l'accueil, la première rubrique affichée)

  const go = useCallback((id) => {
    setTab(id);
    setMore(false);
    if (id !== "clients") setClientId(null);
    try { window.scrollTo({ top: 0 }); } catch {}
  }, []);
  const openClient = useCallback((id) => {
    setClientId(id);
    setTab("clients");
    setMore(false);
    try { window.scrollTo({ top: 0 }); } catch {}
  }, []);
  const goScan = useCallback(() => { setScanAuto(true); go("scan"); }, [go]);
  // Fermer le menu « Plus » avec la touche Échap
  useEffect(() => {
    if (!more) return;
    const onKey = (e) => e.key === "Escape" && setMore(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [more]);

  const navButton = (t, extra = "") => (
    <button key={t.id} className={`${current.id === t.id ? "on" : ""} ${extra}`} aria-current={current.id === t.id ? "page" : undefined} onClick={() => (t.id === "clients" ? openClient(null) : go(t.id))}>
      <Icon name={t.icon} size={20} />
      <span>{t.label}</span>
    </button>
  );

  return (
    <div className="ec-app">
      <header className="ec-top">
        <Link href="/" prefetch={false} className="ec-top-mark" aria-label="Walty, accueil du site"><LogoMark size={34} /></Link>
        <div className="ec-top-biz">
          <b>{bizName}</b>
          <span>{me.label || "Connecté"}</span>
        </div>
        <button className="ec-top-scan" onClick={goScan} aria-label="Scanner une carte"><Icon name="qr" size={18} /> <span>Scanner</span></button>
        <button className="ec-top-out" onClick={onLogout} aria-label="Quitter"><Icon name="logout" size={18} /> <span>Quitter</span></button>
      </header>

      <div className="ec-layout">
        {/* Ordinateur et tablette : menu à gauche */}
        <nav className="ec-side" aria-label="Rubriques de l'espace">
          {sections.map((t) => navButton(t))}
          {navButton(PASSWORD, "ec-side-pw")}
          <a className="ec-side-help" href={site.contact.phoneHref}><Icon name="phone" size={18} /> <span>Aide : {site.contact.phone}</span></a>
        </nav>

        <main className="ec-main">
          {current.id !== "accueil" && <h1 className="ec-page-title">{current.label}</h1>}
          {current.id === "accueil" && <Accueil me={me} today={today} refreshToday={refreshToday} guard={guard} go={go} goScan={goScan} openClient={openClient} features={{ v13 }} />}
          {current.id === "scan" && <Scanner guard={guard} autoStart={scanAuto} onAutoStarted={() => setScanAuto(false)} onDone={refreshToday} />}
          {current.id === "clients" && <Clients guard={guard} say={say} program={me.program} clientId={clientId} openClient={openClient} />}
          {current.id === "historique" && <Historique guard={guard} say={say} openClient={openClient} mode={me.program?.mode} onChanged={refreshToday} />}
          {current.id === "carte" && <MaCarte me={me} guard={guard} say={say} />}
          {current.id === "programme" && <Programme me={me} guard={guard} say={say} />}
          {current.id === "chiffres" && <Chiffres guard={guard} program={me.program} />}
          {current.id === "offres" && <Offres guard={guard} say={say} canSend={me.canNotify} />}
          {current.id === PASSWORD.id && <MotDePasse guard={guard} say={say} />}
          {current.id === "notifs" && me.canNotify && <Notifications guard={guard} say={say} max={me.maxNotificationsPerWeek} business={{ name: me.business?.name || "Votre commerce", logo_url: me.business?.logo_url || null }} />}
        </main>
      </div>

      {/* Téléphone : barre en bas */}
      <nav className="ec-tabs" aria-label="Rubriques principales">
        {main.map((t) => navButton(t))}
        {/* « Plus » : les autres rubriques et « Changer mon mot de passe » */}
        <button className={`${rest.includes(current) || current === PASSWORD ? "on" : ""} ec-more-btn`} aria-expanded={more} aria-haspopup="true" onClick={() => setMore((m) => !m)}>
          <Icon name="grid" size={20} />
          <span>{rest.includes(current) ? current.label : current === PASSWORD ? "Compte" : "Plus"}</span>
        </button>
      </nav>
      {more && (
        <div className="ec-sheet-back" onClick={() => setMore(false)}>
          <div className="ec-sheet" role="dialog" aria-label="Autres rubriques" onClick={(e) => e.stopPropagation()}>
            {rest.map((t) => (
              <button key={t.id} className={current.id === t.id ? "on" : ""} onClick={() => go(t.id)}>
                <Icon name={t.icon} size={22} />
                <span>{t.label}</span>
              </button>
            ))}
            <button className={`ec-sheet-wide ${current.id === PASSWORD.id ? "on" : ""}`} onClick={() => go(PASSWORD.id)}>
              <Icon name={PASSWORD.icon} size={22} />
              <span>{PASSWORD.label}</span>
            </button>
          </div>
        </div>
      )}
      {toast && <div className="esp-toast" role="status">{toast}</div>}
    </div>
  );
}

/* ═════════════════════════════ Scanner ═════════════════════════════ */
function Scanner({ guard, autoStart, onAutoStarted, onDone }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [serial, setSerial] = useState(null);
  const [card, setCard] = useState(null);
  const [message, setMessage] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [useAmount, setUseAmount] = useState("");
  const [lap, setLap] = useState("");
  const [confirm, setConfirm] = useState(null);

  const stopCamera = useCallback(async () => {
    const s = scannerRef.current;
    if (s?.isScanning) await s.stop().catch(() => {});
    setScanning(false);
  }, []);
  useEffect(() => () => { stopCamera(); }, [stopCamera]);
  // « Scanner une carte » touché sur l'accueil : la caméra s'ouvre tout de suite
  const autoRef = useRef(false);
  useEffect(() => {
    if (!autoStart || autoRef.current) return;
    autoRef.current = true;
    onAutoStarted?.();
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  async function send(action, extra = {}, value) {
    const target = value || serial;
    if (!target) return;
    setBusy(true);
    setConfirm(null);
    const r = await post("scan", { serial: target, action, ...extra });
    setBusy(false);
    if (!guard(r)) return;
    if (!r.ok) {
      setMessage({ ok: false, text: r.error || "Action impossible." });
      if (action === "lookup") setSerial(null);
      return;
    }
    setSerial(target);
    setCard(r);
    if (action === "lookup") { setMessage(null); return; }
    try { navigator.vibrate?.(40); } catch {}
    setMessage({ ok: true, text: r.done || "C'est enregistré ✓" });
    setCanUndo(action === "stamp" || action === "purchase");
    onDone?.();
    setAmount("");
    setUseAmount("");
  }

  async function startCamera() {
    setMessage(null);
    setCard(null);
    setSerial(null);
    setCanUndo(false);
    setConfirm(null);
    await stopCamera();
    setScanning(true);
    let handled = false;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("ec-lecteur", { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: (w, h) => { const s = Math.floor(Math.min(w, h) * 0.72); return { width: s, height: s }; } },
        async (text) => {
          if (handled) return;
          handled = true;
          await stopCamera();
          try { navigator.vibrate?.(30); } catch {}
          const found = readSerial(text);
          if (!found) return setMessage({ ok: false, text: "Ce QR code n'est pas une carte de fidélité Walty. Visez le QR code de la carte du client (dans Apple Wallet ou Google Wallet)." });
          await send("lookup", {}, found);
        },
        () => {},
      );
    } catch (err) {
      await stopCamera();
      const name = err?.name || String(err || "");
      setMessage({
        ok: false,
        text: /NotAllowed|Permission/i.test(name)
          ? "La caméra est bloquée. Autorisez l'accès à la caméra pour walty.fr (iPhone : Réglages › Safari › Caméra ; Android : cadenas à gauche de l'adresse › Autorisations), puis réessayez."
          : /NotFound|Overconstrained/i.test(name)
            ? "Aucune caméra trouvée sur cet appareil."
            : "Impossible d'ouvrir la caméra. Fermez les autres applications qui l'utilisent, puis réessayez.",
      });
    }
  }

  const amountNum = Number(amount.replace(",", ".")) || 0;
  const preview =
    card?.mode === "points" ? `+${Math.floor(amountNum * card.points_per_euro)} points`
    : card?.mode === "cashback" ? `+${euro(Math.round(amountNum * card.cashback_percent) / 100)} sur la cagnotte`
    : "";

  return (
    <div className="ec-panel">
      <div id="ec-lecteur" className={`ec-reader ${scanning ? "" : "is-hidden"}`} />

      {!scanning && !card && (
        <button onClick={startCamera} className="ec-scan-big">
          <span className="ec-scan-icon"><Icon name="qr" size={44} stroke={1.8} /></span>
          <b>Scanner une carte</b>
          <span>Visez le QR code de la carte du client</span>
        </button>
      )}
      {scanning && <button onClick={stopCamera} className="btn btn-ghost ec-full">Arrêter la caméra</button>}
      {busy && <p className="ec-wait" aria-live="polite">Un instant…</p>}

      {card && (
        <section className="ec-card" aria-label="Carte du client">
          <div className="ec-card-head">
            <span className="ec-avatar">{initials(`${card.first_name} ${card.last_name || ""}`)}</span>
            <div>
              <h2>{card.first_name} {card.last_name || ""}</h2>
              {card.tier && <p className="ec-tier"><Icon name="crown" size={14} /> Niveau {card.tier.name}{card.tier.perk ? ` · ${card.tier.perk}` : ""}</p>}
            </div>
          </div>

          <div className="ec-balance">
            <span>{card.balance_label}</span>
            <b>{card.balance_value}</b>
          </div>
          {card.stamps && (
            <div className="ec-dots" role="img" aria-label={`${card.stamps.filled} tampons sur ${card.stamps.total}`}>
              {Array.from({ length: card.stamps.total }).map((_, i) => <i key={i} className={i < card.stamps.filled ? "on" : ""} />)}
            </div>
          )}
          {card.streak && <p className="ec-small">🔥 Série : {card.streak.count} semaine{card.streak.count > 1 ? "s" : ""}{card.streak.thisWeek ? " (déjà venu cette semaine)" : ""}</p>}
          {card.lap_enabled && <p className="ec-small">⏱️ Record : {card.best_lap || "aucun pour l'instant"}{card.rank ? ` · P${card.rank.pos} / ${card.rank.total}` : ""}</p>}

          {/* Tampons */}
          {card.mode === "stamps" && (card.reward_ready ? (
            <>
              <p className="ec-ok"><Icon name="gift" size={18} /> Cadeau débloqué : <b>{card.reward}</b></p>
              <button disabled={busy} onClick={() => send("redeem")} className="btn btn-primary btn-lg ec-full">J'ai remis le cadeau : valider</button>
            </>
          ) : (
            <button disabled={busy} onClick={() => send("stamp")} className="btn btn-primary btn-lg ec-full ec-stamp-btn"><Icon name="plus" size={20} /> Ajouter 1 tampon</button>
          ))}

          {/* Points et cagnotte : montant de l'achat */}
          {card.mode !== "stamps" && (
            <form className="field" onSubmit={(e) => {
              e.preventDefault();
              if (amountNum <= 0) return;
              setConfirm({ label: `Enregistrer un achat de ${euro(amountNum)} (${preview}) ?`, run: () => send("purchase", { amount: amountNum }) });
            }}>
              <label htmlFor="ec-achat">Montant de l'achat (€)</label>
              <div className="ec-inline">
                <input id="ec-achat" inputMode="decimal" className="input ec-amount" value={amount} placeholder="12,50" onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} />
                <button type="submit" disabled={busy || amountNum <= 0} className="btn btn-primary">Valider</button>
              </div>
              {amountNum > 0 && <span className="field-hint">{preview}</span>}
            </form>
          )}

          {card.mode === "points" && card.catalog?.length > 0 && (
            <div className="ec-list-actions">
              <p className="ec-label">Échanger des points</p>
              {card.catalog.map((r) => (
                <button key={r.id} disabled={busy || !r.affordable} className="ec-row-btn" onClick={() => setConfirm({ label: `Échanger ${r.cost} points contre « ${r.name} » ?`, run: () => send("reward", { reward_id: r.id }) })}>
                  <span>{r.name}</span><b>{r.cost} pts</b>
                </button>
              ))}
            </div>
          )}

          {card.mode === "cashback" && card.cashback > 0 && (
            <form className="field" onSubmit={(e) => {
              e.preventDefault();
              const n = Number(useAmount.replace(",", ".")) || 0;
              if (n <= 0) return;
              setConfirm({ label: `Déduire ${euro(n)} de la cagnotte (${euro(card.cashback)} disponibles) ?`, run: () => send("cashback", { amount: n }) });
            }}>
              <label htmlFor="ec-cagnotte">Utiliser la cagnotte (max {euro(card.cashback)})</label>
              <div className="ec-inline">
                <input id="ec-cagnotte" inputMode="decimal" className="input" value={useAmount} placeholder={String(card.cashback).replace(".", ",")} onChange={(e) => setUseAmount(e.target.value.replace(/[^\d.,]/g, ""))} />
                <button type="submit" disabled={busy} className="btn btn-dark">Déduire</button>
              </div>
            </form>
          )}

          {card.lap_enabled && (
            <form className="field" onSubmit={(e) => {
              e.preventDefault();
              const ms = parseLap(lap);
              if (!ms) return setMessage({ ok: false, text: "Temps invalide. Exemple : 38,412 ou 1:02,345" });
              send("lap", { lap_ms: ms });
              setLap("");
            }}>
              <label htmlFor="ec-chrono">⏱️ Meilleur tour de la session (secondes)</label>
              <div className="ec-inline">
                <input id="ec-chrono" inputMode="decimal" className="input" value={lap} placeholder="38,412" onChange={(e) => setLap(e.target.value.replace(/[^\d.,:]/g, ""))} />
                <button type="submit" disabled={busy || !lap} className="btn btn-dark">Enregistrer</button>
              </div>
            </form>
          )}

          {card.coupons?.length > 0 && (
            <div className="ec-list-actions">
              <p className="ec-label">Offres sur sa carte</p>
              {card.coupons.map((c) => (
                <button key={c.id} disabled={busy} className="ec-row-btn" onClick={() => setConfirm({ label: `Valider l'offre « ${c.title} » ?`, run: () => send("coupon", { coupon_id: c.id }) })}>
                  <span><Icon name="ticket" size={16} /> {c.title}{c.expires_at ? <em> · jusqu'au {fmtDate(c.expires_at)}</em> : null}</span><b>Utiliser</b>
                </button>
              ))}
            </div>
          )}

          {confirm && (
            <div className="ec-confirm" role="alertdialog" aria-label="Confirmation">
              <p>{confirm.label}</p>
              <div className="ec-inline">
                <button disabled={busy} onClick={confirm.run} className="btn btn-primary">Oui, valider</button>
                <button onClick={() => setConfirm(null)} className="btn btn-ghost">Annuler</button>
              </div>
            </div>
          )}

          {card.next_tier && <p className="field-hint ec-center-text">Niveau {card.next_tier.name} dans {card.next_tier.remaining}.</p>}
        </section>
      )}

      {message && <p className={message.ok ? "ec-ok ec-msg" : "ec-alert ec-msg"} role="status">{message.text}</p>}
      {canUndo && <button disabled={busy} onClick={() => send("undo")} className="ec-linkbtn ec-undo">Annuler ce passage (erreur de saisie)</button>}
      {card && !scanning && (
        <button onClick={startCamera} className="btn btn-dark btn-lg ec-full"><Icon name="qr" size={20} /> Client suivant</button>
      )}
      {!card && !scanning && (
        <p className="field-hint ec-center-text">Le client ouvre sa carte dans Apple Wallet ou Google Wallet : visez son QR code. Les règles (limite de passages par jour, soldes suffisants…) sont vérifiées automatiquement.</p>
      )}
    </div>
  );
}

/* ═════════════════════════════ Clients ═════════════════════════════ */
function Clients({ guard, say, clientId, openClient }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async (search) => {
    const r = await api(`customers?q=${encodeURIComponent(search)}`);
    if (!guard(r)) return;
    if (!r.ok) return setError(r.error || "Impossible de charger vos clients.");
    setError("");
    setRows(r.customers);
    setStats(r.stats);
  }, [guard]);
  useEffect(() => { load(""); }, [load]);

  if (clientId) {
    return <ClientFiche id={clientId} row={rows?.find((r) => r.id === clientId) || null} guard={guard} say={say} onBack={() => openClient(null)} />;
  }
  return (
    <div className="ec-panel">
      {stats && (
        <div className="ec-kpis ec-kpis-3">
          <Kpi label="Clients" value={stats.total} />
          <Kpi label="Passages ce mois" value={stats.stampsThisMonth} />
          <Kpi label="Récompenses utilisées" value={stats.rewardsRedeemed} />
        </div>
      )}
      <form className="ec-search" role="search" onSubmit={(e) => { e.preventDefault(); load(q); }}>
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Rechercher un client" aria-label="Rechercher un client (nom, téléphone ou e-mail)" />
        <button className="btn btn-dark btn-sm">Chercher</button>
      </form>
      {error && <p className="ec-alert">{error}</p>}
      {rows === null && !error && <div className="ec-spinner ec-spinner-sm" aria-label="Chargement" />}
      {rows && rows.length === 0 && (
        <div className="esp-empty"><Icon name="users" size={26} /><p>{q ? "Aucun client ne correspond." : "Pas encore de client. Affichez votre QR code d'inscription en caisse : les premiers arrivent vite."}</p></div>
      )}
      {rows && rows.length > 0 && (
        <ul className="ec-clients">
          {rows.map((c) => (
            <li key={c.id}>
              <button className="ec-client-open" onClick={() => openClient(c.id)} aria-label={`Ouvrir la fiche de ${c.first_name} ${c.last_name || ""}`.trim()} />
              <span className="ec-avatar sm">{initials(`${c.first_name} ${c.last_name || ""}`)}</span>
              <div className="ec-client-main">
                <b>{c.first_name} {c.last_name || ""}</b>
                <span>{c.phone || c.email || ""}{c.marketing_optin ? " · accepte les offres" : ""}</span>
              </div>
              <div className="ec-client-side">
                <b>{c.balance}</b>
                <span>{c.tier ? `${c.tier} · ` : ""}{fmtAgo(c.last_visit_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {rows && rows.length >= 100 && <p className="field-hint ec-center-text">Les 100 clients venus le plus récemment. Utilisez la recherche pour trouver les autres.</p>}
    </div>
  );
}

function Kpi({ label, value, sub, tone }) {
  return (
    <div className={`ec-kpi ${tone || ""}`}>
      <b>{value}</b>
      <span>{label}</span>
      {sub && <em>{sub}</em>}
    </div>
  );
}

/* ═════════════════════════════ Chiffres ═════════════════════════════ */
function Chiffres({ guard, program }) {
  const [s, setS] = useState(null);
  const [basic, setBasic] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    (async () => {
      const r = await api("stats");
      if (!live || !guard(r)) return;
      if (r.ok) return setS(r.stats);
      if (!r.unavailable) return setError(r.error || "Impossible de charger vos chiffres.");
      // Mode de base : les chiffres simples de la liste des clients
      const c = await api("customers?q=");
      if (!live || !guard(c)) return;
      if (!c.ok) return setError(c.error || "Impossible de charger vos chiffres.");
      setBasic(c.stats || { total: 0, stampsThisMonth: 0, rewardsRedeemed: 0 });
    })();
    return () => { live = false; };
  }, [guard]);
  if (error) return <div className="ec-panel"><p className="ec-alert">{error}</p></div>;
  if (basic) {
    const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: TZ }).format(new Date());
    return (
      <div className="ec-panel">
        <h2 className="ec-h">Vos chiffres</h2>
        <div className="ec-kpis ec-kpis-3">
          <Kpi label="Clients inscrits" value={basic.total} />
          <Kpi label={`Passages en ${monthName}`} value={basic.stampsThisMonth} />
          <Kpi label="Récompenses utilisées" value={basic.rewardsRedeemed} />
        </div>
        <p className="field-hint ec-center-text">Graphique des 14 derniers jours et clients les plus fidèles : bientôt disponibles ici.</p>
      </div>
    );
  }
  if (!s) return <div className="ec-panel"><div className="ec-spinner ec-spinner-sm" aria-label="Chargement" /></div>;

  const diff = s.visitsThisMonth - s.visitsLastMonth;
  const max = Math.max(1, ...s.daily.map((d) => d.count));
  const dayLabel = (d) => new Intl.DateTimeFormat("fr-FR", { weekday: "narrow", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));
  const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: TZ }).format(new Date());

  return (
    <div className="ec-panel">
      <h2 className="ec-h">En {monthName}</h2>
      <div className="ec-kpis">
        <Kpi label="Passages" value={s.visitsThisMonth} sub={s.visitsLastMonth || diff ? `${diff >= 0 ? "+" : ""}${diff} vs mois dernier` : null} tone={diff > 0 ? "up" : ""} />
        <Kpi label="Nouveaux clients" value={s.newThisMonth} sub={`${s.newLastMonth} le mois dernier`} />
        <Kpi label="Récompenses remises" value={s.rewardsThisMonth} sub={`${s.rewardsTotal} au total`} />
        {program?.mode && program.mode !== "stamps"
          ? <Kpi label="Achats enregistrés" value={euro(s.salesThisMonth)} />
          : <Kpi label="Clients actifs (30 j)" value={s.active30} sub={`sur ${s.total}`} />}
      </div>

      <section className="ec-box">
        <div className="ec-box-head"><h3>Passages des 14 derniers jours</h3><span className="chip">{s.daily.reduce((a, d) => a + d.count, 0)} au total</span></div>
        <div className="ec-bars" role="img" aria-label={`Passages par jour : ${s.daily.map((d) => d.count).join(", ")}`}>
          {s.daily.map((d, i) => (
            <div key={d.day} className={`ec-bar ${i === s.daily.length - 1 ? "today" : ""}`} title={`${fmtDate(`${d.day}T16:00:00Z`)} : ${d.count}`}>
              <em>{d.count || ""}</em>
              <i style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }} />
              <span>{dayLabel(d.day)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="ec-two">
        <section className="ec-box">
          <h3>Vos clients</h3>
          <ul className="ec-facts">
            <li><span>Clients inscrits</span><b>{s.total}</b></li>
            <li><span>Venus ces 30 derniers jours</span><b>{s.active30}</b></li>
            <li><span>Acceptent vos offres et messages</span><b>{s.optin}</b></li>
          </ul>
        </section>
        <section className="ec-box">
          <h3>Les plus fidèles</h3>
          {s.best.length === 0 ? <p className="muted ec-small">Ils apparaîtront ici après leurs premiers passages.</p> : (
            <ol className="ec-top5">
              {s.best.map((b, i) => <li key={i}><span>{b.name}</span><b>{b.visits} passage{b.visits > 1 ? "s" : ""}</b></li>)}
            </ol>
          )}
        </section>
      </div>
      <Insights guard={guard} mode={program?.mode} />
    </div>
  );
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const monthLabel = (m) => new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(new Date(`${m}-15T12:00:00Z`)).replace(".", "");

/** Chiffres détaillés : affluence, 6 derniers mois, fidélité, téléphones. Absents si l'adresse n'existe pas encore. */
function Insights({ guard, mode }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    let live = true;
    api("insights").then((r) => { if (live && guard(r) && r.ok) setD(r.insights); });
    return () => { live = false; };
  }, [guard]);
  if (!d) return null;
  const maxW = Math.max(1, ...d.weekday);
  const best = d.weekday.indexOf(Math.max(...d.weekday));
  const first = d.hours.findIndex((n) => n > 0);
  const last = 23 - [...d.hours].reverse().findIndex((n) => n > 0);
  const hours = first < 0 ? [] : d.hours.map((n, h) => ({ h, n })).slice(Math.max(0, first - 1), Math.min(24, last + 2));
  const maxH = Math.max(1, ...d.hours);
  const maxM = Math.max(1, ...d.months.map((m) => m.visits));
  const w = d.wallets;
  return (
    <>
      <div className="ec-two">
        <section className="ec-box">
          <div className="ec-box-head"><h3>Vos jours d'affluence</h3><span className="chip">90 derniers jours</span></div>
          <div className="ec-hbars" role="img" aria-label={`Passages par jour de la semaine : ${d.weekday.map((n, i) => `${WEEKDAYS[i]} ${n}`).join(", ")}`}>
            {d.weekday.map((n, i) => (
              <div key={i} className={`ec-hbar ${i === best && n > 0 ? "top" : ""}`}><span>{WEEKDAYS[i]}</span><i><s style={{ width: `${(n / maxW) * 100}%` }} /></i><b>{n}</b></div>
            ))}
          </div>
        </section>
        <section className="ec-box">
          <div className="ec-box-head"><h3>Vos heures d'affluence</h3><span className="chip">90 derniers jours</span></div>
          {hours.length === 0 ? <p className="muted ec-small">Elles apparaîtront après vos premiers passages.</p> : (
            <div className="ec-bars ec-bars-h" style={{ gridTemplateColumns: `repeat(${hours.length}, 1fr)` }} role="img" aria-label="Passages par heure">
              {hours.map(({ h, n }) => (
                <div key={h} className="ec-bar" title={`${h} h : ${n}`}><em>{n || ""}</em><i style={{ height: `${Math.max(3, (n / maxH) * 100)}%` }} /><span>{h}h</span></div>
              ))}
            </div>
          )}
          <p className="field-hint">Une heure creuse ? Pensez aux heures boostées (« Mon programme »).</p>
        </section>
      </div>
      <section className="ec-box">
        <div className="ec-box-head"><h3>Les 6 derniers mois</h3></div>
        <div className="ec-bars ec-bars-m" role="img" aria-label={`Passages par mois : ${d.months.map((m) => `${monthLabel(m.month)} ${m.visits}`).join(", ")}`}>
          {d.months.map((m, i) => (
            <div key={m.month} className={`ec-bar ${i === d.months.length - 1 ? "today" : ""}`}><em>{m.visits}</em><i style={{ height: `${Math.max(3, (m.visits / maxM) * 100)}%` }} /><span>{monthLabel(m.month)}</span></div>
          ))}
        </div>
        <ul className="ec-facts ec-months">
          {d.months.slice().reverse().map((m) => (
            <li key={m.month}><span>{monthLabel(m.month)}</span><b>{m.newCustomers} nouveau{m.newCustomers > 1 ? "x" : ""} client{m.newCustomers > 1 ? "s" : ""}{mode && mode !== "stamps" ? ` · ${euro(m.sales)}` : ""}</b></li>
          ))}
        </ul>
      </section>
      <div className="ec-two">
        <section className="ec-box">
          <h3>Fidélité</h3>
          <ul className="ec-facts">
            <li><span>Clients revenus au moins 2 fois</span><b>{d.returningRate} %</b></li>
            <li><span>Passages en moyenne par client</span><b>{String(d.avgVisits).replace(".", ",")}</b></li>
            <li><span>Pas revenus depuis 2 mois</span><b>{d.dormant}</b></li>
            <li><span>Acceptent vos offres et messages</span><b>{d.optinRate} %</b></li>
          </ul>
          {d.dormant > 0 && <p className="field-hint">Un petit message (« Messages ») ou une offre fait souvent revenir les clients endormis.</p>}
        </section>
        <section className="ec-box">
          <h3>Leurs téléphones</h3>
          <ul className="ec-facts">
            <li><span>iPhone (Apple Wallet)</span><b>{w.apple}</b></li>
            <li><span>Android (Google Wallet)</span><b>{w.google}</b></li>
            {w.web > 0 && <li><span>Carte web</span><b>{w.web}</b></li>}
            <li><span>Carte pas encore ajoutée</span><b>{w.none}</b></li>
          </ul>
        </section>
      </div>
    </>
  );
}

/* ═════════════════════════════ Offres ═════════════════════════════ */
const DURATIONS = [
  { v: 7, label: "7 jours" },
  { v: 14, label: "14 jours" },
  { v: 30, label: "30 jours" },
  { v: 0, label: "Sans limite" },
];
const OFFER_IDEAS = ["-20 % sur tout ce week-end", "1 boisson offerte pour 1 achat", "Un petit cadeau pour votre fidélité", "-10 % sur votre prochain passage"];

function Offres({ guard, say, canSend }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(7);
  const [notify, setNotify] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [soon, setSoon] = useState(false);

  const load = useCallback(async () => {
    const r = await api("offers");
    if (!guard(r)) return;
    if (r.unavailable) return setSoon(true);
    if (!r.ok) return setError(r.error || "Impossible de charger vos offres.");
    setData(r);
  }, [guard]);
  useEffect(() => { load(); }, [load]);

  async function send() {
    setBusy(true);
    setFormError("");
    const r = await post("offers", { title, days: days || null, notify });
    setBusy(false);
    if (!guard(r)) return;
    setConfirm(false);
    if (!r.ok) return setFormError(r.error || "Impossible d'ajouter l'offre.");
    say(r.warning || `Offre ajoutée sur la carte de ${r.count} client${r.count > 1 ? "s" : ""} ✓`);
    setTitle("");
    setNotify(false);
    load();
  }

  const now = Date.now();
  if (soon) {
    return (
      <div className="ec-panel">
        <p className="ec-info">Les offres arrivent très bientôt dans votre espace. En attendant, demandez à Walty d'ajouter une offre sur la carte de vos clients : {site.contact.phone}.</p>
      </div>
    );
  }
  return (
    <div className="ec-panel">
      {canSend ? (
        <section className="ec-box">
          <h2 className="ec-h">Nouvelle offre</h2>
          <p className="muted ec-small">L'offre s'ajoute sur la carte de tous vos clients. En caisse, vous la validez en scannant leur carte.</p>
          {!confirm ? (
            <form className="ec-form" onSubmit={(e) => { e.preventDefault(); if (title.trim().length < 3) return setFormError("Écrivez votre offre (3 caractères minimum)."); setFormError(""); setConfirm(true); }}>
              <div className="field">
                <label htmlFor="ec-offre">Votre offre</label>
                <input id="ec-offre" className="input" maxLength={120} value={title} onChange={(e) => { setTitle(e.target.value); setFormError(""); }} placeholder="Ex. : -20 % sur tout ce week-end" />
                <span className="field-hint">{title.length}/120</span>
              </div>
              <div className="wiz-suggest">{OFFER_IDEAS.map((t) => <button type="button" key={t} onClick={() => setTitle(t)}>{t}</button>)}</div>
              <fieldset className="field wiz-fieldset">
                <legend>Valable</legend>
                <div className="ec-seg">
                  {DURATIONS.map((d) => (
                    <label key={d.v}><input type="radio" name="ec-duree" checked={days === d.v} onChange={() => setDays(d.v)} /><span>{d.label}</span></label>
                  ))}
                </div>
              </fieldset>
              <label className="ec-check">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                <span>Prévenir mes clients par notification<em>Compte dans vos messages de la semaine. Seuls les clients qui acceptent les offres la reçoivent.</em></span>
              </label>
              {formError && <p className="field-error" role="alert">{formError}</p>}
              <button className="btn btn-primary btn-lg ec-full"><Icon name="gift" size={18} /> Ajouter l'offre</button>
            </form>
          ) : (
            <div className="ec-confirm" role="alertdialog" aria-label="Confirmer l'offre">
              <p>Ajouter « {title.trim()} » sur la carte de tous vos clients{days ? `, pendant ${days} jours` : ""}{notify ? ", avec une notification" : ""} ?</p>
              {formError && <p className="field-error" role="alert">{formError}</p>}
              <div className="ec-inline">
                <button className="btn btn-primary" onClick={send} disabled={busy}>{busy ? "Ajout…" : "Oui, ajouter"}</button>
                <button className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={busy}>Modifier</button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <p className="ec-info">Les offres et les messages ne sont pas activés pour cet accès. Demandez-les à Walty : {site.contact.phone}.</p>
      )}

      {error && <p className="ec-alert">{error}</p>}
      {data && (
        <>
          {(data.welcome || data.birthday) && (
            <section className="ec-box">
              <h3>Offres automatiques</h3>
              <ul className="ec-facts">
                {data.welcome && <li><span><Icon name="sparkle" size={16} /> Bienvenue (à l'inscription)</span><b>{data.welcome}</b></li>}
                {data.birthday && <li><span><Icon name="cake" size={16} /> Anniversaire</span><b>{data.birthday}</b></li>}
              </ul>
              <p className="field-hint">Pour les modifier, contactez Walty.</p>
            </section>
          )}
          <section className="ec-box">
            <h3>Vos offres</h3>
            {data.offers.length === 0 ? <p className="muted ec-small">Aucune offre ponctuelle pour l'instant.</p> : (
              <ul className="ec-offers">
                {data.offers.map((o) => {
                  const live = o.active > 0 && (!o.expires_at || Date.parse(o.expires_at) > now);
                  return (
                    <li key={`${o.title}-${o.created_at}`}>
                      <div>
                        <b>{o.title}</b>
                        <span>Ajoutée le {fmtDate(o.created_at)}{o.expires_at ? ` · jusqu'au ${fmtDate(o.expires_at)}` : ""}</span>
                      </div>
                      <div className="ec-offer-side">
                        <span className={`chip ${live ? "chip-lagon" : ""}`}>{live ? "En cours" : "Terminée"}</span>
                        <em>{o.used} utilisée{o.used > 1 ? "s" : ""} / {o.total}</em>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* ═════════════════════════════ Messages (notifications) ═════════════════════════════ */
const STATUS = {
  scheduled: ["Programmé", "chip-violet"],
  sending: ["En cours d'envoi", "chip-orange"],
  sent: ["Envoyé", "chip-lagon"],
  cancelled: ["Annulé", ""],
  failed: ["Échec", ""],
  skipped: ["Non envoyé (limite)", ""],
};
const IDEAS = [
  { label: "Offre du jour", text: "Aujourd'hui seulement : -20 % sur tout ! On vous attend 🎉" },
  { label: "Nouveauté", text: "Nouveau chez nous : venez goûter avant tout le monde 😍" },
  { label: "Créneau libre", text: "Il reste des places cet après-midi. On vous garde un créneau ?" },
  { label: "Fermeture", text: "Info : nous serons fermés lundi. À très vite !" },
];
/** "2026-10-15T18:30" en heure de Guadeloupe, pour le champ date */
const gpLocal = (t) => new Date(t - 4 * 3600e3).toISOString().slice(0, 16);

function Notifications({ guard, say, business, max }) {
  const [list, setList] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [msg, setMsg] = useState("");
  const [when, setWhen] = useState("now");
  const [at, setAt] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [every, setEvery] = useState(7);
  const [until, setUntil] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await api("notifications");
    if (!guard(r)) return;
    if (!r.ok) return setError(r.error || "Impossible de charger vos messages.");
    setList(r.notifications);
    setRemaining(r.remaining);
  }, [guard]);
  useEffect(() => { load(); }, [load]);

  function check(e) {
    e.preventDefault();
    setError("");
    if (!msg.trim()) return setError("Écrivez votre message d'abord.");
    if (remaining === 0) return setError("Vous avez utilisé vos messages de la semaine (du lundi au dimanche).");
    if (when === "later" && (!at || at <= gpLocal(Date.now()))) return setError("Choisissez une date et une heure à venir.");
    if (when === "later" && repeat && (every < 3 || every > 60)) return setError("La répétition doit être d'au moins 3 jours.");
    setConfirm(true);
  }
  async function send() {
    setBusy(true);
    setError("");
    const r = await post("notifications", {
      message: msg.trim(),
      when,
      sendAt: when === "later" ? at : undefined,
      repeatEveryDays: when === "later" && repeat ? every : null,
      repeatUntil: when === "later" && repeat && until ? `${until}T23:59` : null,
    });
    setBusy(false);
    if (!guard(r)) return;
    setConfirm(false);
    if (!r.ok) return setError(r.error || "Le message n'a pas pu être enregistré.");
    say(r.sentNow ? "Message envoyé ✓" : "Message programmé ✓");
    setMsg(""); setAt(""); setWhen("now"); setRepeat(false); setUntil("");
    load();
  }
  async function cancel(id) {
    const r = await api(`notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!guard(r)) return;
    say(r.ok ? "Message annulé." : r.error || "Impossible d'annuler.");
    load();
  }

  return (
    <div className="ec-panel">
      <div className="ec-notif-grid">
        <section className="ec-box">
          <div className="ec-box-head">
            <h2 className="ec-h">Nouveau message</h2>
            {remaining !== null && (
              <span className="ec-quota">
                {max ? <b className={`chip ${remaining ? "chip-orange" : ""}`}>{Math.max(0, max - remaining)} / {max} cette semaine</b> : null}
                <span className="ec-quota-left">{remaining ? `Il vous en reste ${remaining} cette semaine` : "Plus d'envoi cette semaine"}</span>
              </span>
            )}
          </div>
          {!confirm ? (
            <form className="ec-form" onSubmit={check}>
              <div className="field">
                <label htmlFor="ec-msg">Votre message</label>
                <textarea id="ec-msg" className="textarea" maxLength={180} value={msg} onChange={(e) => { setMsg(e.target.value); setError(""); }} placeholder="Ex. : Ce soir, le 2e bokit à moitié prix 🌅" style={{ minHeight: 96 }} />
                <span className="field-hint">{msg.length}/180 · court et direct, ça marche mieux</span>
              </div>
              <div className="wiz-suggest">{IDEAS.map((t) => <button type="button" key={t.label} onClick={() => setMsg(t.text)}>{t.label}</button>)}</div>
              <fieldset className="field wiz-fieldset">
                <legend>Quand ?</legend>
                <div className="ec-seg">
                  <label><input type="radio" name="ec-when" checked={when === "now"} onChange={() => setWhen("now")} /><span>Maintenant</span></label>
                  <label><input type="radio" name="ec-when" checked={when === "later"} onChange={() => setWhen("later")} /><span>Programmer</span></label>
                </div>
              </fieldset>
              {when === "later" && (
                <div className="ec-later">
                  <div className="field">
                    <label htmlFor="ec-at">Date et heure (heure de Guadeloupe)</label>
                    <input id="ec-at" type="datetime-local" className="input" value={at} min={gpLocal(Date.now())} onChange={(e) => setAt(e.target.value)} />
                  </div>
                  <label className="ec-check"><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} /><span>Répéter ce message</span></label>
                  {repeat && (
                    <div className="ec-inline">
                      <div className="field"><label htmlFor="ec-every">Tous les … jours</label><input id="ec-every" type="number" min={3} max={60} className="input" value={every} onChange={(e) => setEvery(Number(e.target.value))} /></div>
                      <div className="field"><label htmlFor="ec-until">Jusqu'au (facultatif)</label><input id="ec-until" type="date" className="input" value={until} onChange={(e) => setUntil(e.target.value)} /></div>
                    </div>
                  )}
                </div>
              )}
              {error && <p className="field-error" role="alert">{error}</p>}
              <button className="btn btn-primary btn-lg ec-full" disabled={remaining === 0}><Icon name="bell" size={18} /> {when === "later" ? "Programmer le message" : "Envoyer à mes clients"}</button>
              <p className="field-hint">Envoyé uniquement aux clients qui ont accepté les offres à l'inscription. Il s'affiche sur leur téléphone, même écran éteint.</p>
            </form>
          ) : (
            <div className="ec-confirm" role="alertdialog" aria-label="Confirmer l'envoi">
              <p>{when === "later" ? `Programmer ce message pour le ${fmtDateTime(`${at}:00-04:00`)}${repeat ? `, puis tous les ${every} jours` : ""} ?` : "Envoyer ce message maintenant à vos clients ?"}</p>
              <blockquote>{msg}</blockquote>
              {error && <p className="field-error" role="alert">{error}</p>}
              <div className="ec-inline">
                <button className="btn btn-primary" onClick={send} disabled={busy}>{busy ? "Envoi…" : "Oui, envoyer"}</button>
                <button className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={busy}>Modifier</button>
              </div>
            </div>
          )}
        </section>
        <div className="ec-preview">
          <div className="esp-lockscreen" aria-label="Aperçu sur le téléphone de vos clients">
            <div className="esp-lock-time">18:42</div>
            <div className="esp-lock-date">{new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date())}</div>
            <div className={`esp-lock-notif ${msg ? "" : "empty"}`}>
              <span className="esp-lock-icon" style={business.logo_url ? { backgroundImage: `url(${business.logo_url})`, backgroundColor: "#fff" } : { background: "var(--cta)" }}>{business.logo_url ? "" : initials(business.name)}</span>
              <div>
                <div className="esp-lock-head"><b>{business.name}</b><span>maintenant</span></div>
                <p>{msg || "Votre message apparaîtra ici."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="ec-box">
        <h3>Derniers messages</h3>
        {list === null ? <div className="ec-spinner ec-spinner-sm" aria-label="Chargement" /> : list.length === 0 ? <p className="muted ec-small">Aucun message pour l'instant.</p> : (
          <ul className="ec-offers">
            {list.map((n) => {
              const [label, cls] = STATUS[n.status] || [n.status, ""];
              return (
                <li key={n.id}>
                  <div>
                    <b className="ec-msg-text">{n.message}</b>
                    <span>{fmtDateTime(n.send_at)}{n.repeat_every_days ? ` · tous les ${n.repeat_every_days} j` : ""}{n.recipients_count != null ? ` · ${n.recipients_count} client${n.recipients_count > 1 ? "s" : ""}` : ""}</span>
                  </div>
                  <div className="ec-offer-side">
                    <span className={`chip ${cls}`}>{label}</span>
                    {n.status === "scheduled" && <button className="ec-linkbtn" onClick={() => cancel(n.id)}>Annuler</button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
