"use client";

/**
 * Espace commerçant de Walty (walty.fr/espace), version 13 + connexion par mot de passe.
 * Connexion :
 * - le gérant : adresse e-mail (ou identifiant) + mot de passe, compte créé par Walty (mot de passe provisoire
 *   à changer à la première connexion) ;
 * - « connexion rapide » (employé en caisse) : le lien d'accès remis par Walty + code PIN, comme avant
 *   (un lien walty.fr/espace?acces=… ouvre directement le code PIN).
 * - « Mot de passe oublié ? » : le gérant tape son adresse e-mail et reçoit un lien walty.fr/espace#reinit=…
 *   (valable 1 heure, une seule fois) ; la page efface aussitôt ce lien de la barre d'adresse et lui fait choisir
 *   un nouveau mot de passe, puis l'ouvre directement dans son espace.
 * Puis : Accueil · Scanner · Clients (et fiche client) · Historique · Ma carte (QR du comptoir) · Mon programme
 * · Chiffres · Offres · Messages · Changer mon mot de passe.
 * Toutes les données passent par /api/espace/… (passerelle vers le logiciel de cartes).
 *
 * Rôles (adresse « role » du logiciel de cartes) :
 * - gérant (connexion e-mail/identifiant + mot de passe, adresse login-gerant) : tout l'espace, et dans « Scanner »,
 *   la liste des clients pour les actions SANS QR code (tampon à la main, tampon hors limite du jour avec une raison),
 *   toujours avec une confirmation ; elles apparaissent dans l'historique avec un badge ;
 * - employé (lien + code PIN) : Scanner (QR code seulement) et Clients en lecture seule.
 *   La passerelle et le logiciel de cartes refusent aussi côté serveur ce qui est réservé au gérant.
 * - sans l'adresse « role » (logiciel de cartes pas encore à jour) : l'espace d'avant, sans actions à la main.
 *
 * Scanner : « fiche éclair » après un scan (bandeau vert / orange / rouge calculé par le logiciel de cartes,
 * client depuis…, tampons, UN gros bouton), tampon automatique au scan (réglage de l'appareil, choisi par le gérant,
 * avec « Annuler » 5 secondes), aide en 3 gestes à la première ouverture.
 * Walty Caisse (24 oct.) : mode caisse plein écran (Caisse.jsx : caméra allumée en continu, tampon ajouté dès le scan,
 * écran vert / orange / rouge, « Annuler » 5 s), ouvert par l'application installée (caisse.webmanifest, start_url
 * /espace?caisse=1) ou par le bouton « Mode caisse » du Scanner ; installation (Installer.jsx : bouton Android, guide
 * iPhone) ; appareil mémorisé 90 jours (cookie signé par le logiciel de cartes, renouvelé par la passerelle) ;
 * « Déconnecter tous les appareils » (gérant, rubrique « Mot de passe et appareils »).
 * Formules (me.plan) : « essentiel » = sans Chiffres, Offres ni Messages (carte « Passer au Tout compris ») ;
 * « tout-compris » (ou pas de formule) = tout. Le logiciel de cartes refuse aussi côté serveur.
 * Gérant : « Exporter en Excel » dans Clients et Historique.
 *
 * Retours du test d'Alexandre (20 oct.) :
 * - Rapidité : mémoire des rubriques (affichage immédiat puis mise à jour, outils.js), pré-chargement des rubriques
 *   probables juste après la connexion, squelettes au lieu d'écrans vides, rôle donné directement par « me ».
 * - Gérant : « Retirer 1 tampon » (fiche client et résultat du scan, raison obligatoire, RetirerTampon.jsx) ;
 *   Messages : limite de la semaine atteinte → « Envoyer quand même » avec avertissement + « J'ai compris » ;
 *   Mon programme : nouveau nombre de tampons → ce que ça change pour les cartes déjà installées, AVANT d'enregistrer.
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
import ExportButton from "./Export";
import Caisse from "./Caisse";
import InstallCard from "./Installer";
import ScanKit from "./ScanKit";
import { isStandalone, registerCaisseWorker } from "./installation";
import RetirerTampon from "./RetirerTampon";
import Squelette, { SkelBox, SkelList } from "./Squelette";
import {
  afterVisitChange,
  api,
  clearCache,
  euro,
  fmtAgo,
  fmtDate,
  fmtDateTime,
  fmtLongDate,
  fmtTime,
  getFresh,
  gpToday,
  initials,
  invalidate,
  peek,
  post,
  prefetch,
  swr,
  TZ,
} from "./outils";

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

/** Jeton du lien « Choisir un nouveau mot de passe » reçu par e-mail : walty.fr/espace#reinit=… (43 caractères). */
const readReset = (text) => {
  const m = /(?:^|[#?&])reinit=([A-Za-z0-9_-]{43})(?![A-Za-z0-9_-])/.exec(text || "");
  return m ? m[1] : null;
};

const EXPIRED = "Votre connexion a expiré : retapez votre code PIN.";
const EXPIRED_PW = "Votre connexion a expiré : reconnectez-vous.";
/** L'appareil mémorisé a été refusé par le logiciel de cartes (réponse deviceSignedOut de la passerelle). */
const DEVICE_OUT =
  "Cet appareil a été déconnecté (code PIN ou mot de passe changé, accès désactivé, ou « Déconnecter tous les appareils »). Reconnectez-vous.";
/** Le mode caisse est demandé par l'adresse (/espace?caisse=1, application installée). */
const wantsCaisse = () => {
  try {
    return /[?&]caisse=1(?:&|$)/.test(window.location.search);
  } catch {
    return false;
  }
};

/* ═════════════════════════════ Entrée ═════════════════════════════ */
export default function EspaceApp() {
  const [phase, setPhase] = useState("loading"); // loading | login | access | pin | change | reset | app | error
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
  // Jeton du lien « Mot de passe oublié » (gardé en mémoire seulement, jamais dans l'adresse ni sur l'appareil)
  const resetTok = useRef("");
  // Écran de connexion ouvert directement sur « Mot de passe oublié ? » (lien plus valable)
  const [forgotOpen, setForgotOpen] = useState(false);

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
        role: "legacy",
        via: mode,
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
    if (r.deviceSignedOut) setNotice(DEVICE_OUT);
    if (r.loggedIn) {
      // Gérant ou employé ? « me » le dit directement (logiciel de cartes à jour) : pas de deuxième demande.
      // Le logiciel de cartes le revérifie de toute façon à chaque action.
      if (r.role === "gerant" || r.role === "employe") return enter({ ...r, role: r.role, password: !!r.password, via: mode });
      const w = await api("role");
      if (w.status === 401) return gate(tk, mode);
      const role = w.ok ? (w.role === "gerant" ? "gerant" : "employe") : w.unavailable ? "legacy" : "employe";
      return enter({ ...r, role, password: w.ok ? !!w.password : mode === "password", via: mode });
    }
    if (withToken) setBusiness(r.business || null);
    return gate(tk, mode);
  }, [enter, gate, invalidLink, loadBasic]);

  useEffect(() => {
    // Le lien d'accès peut arriver dans l'adresse : walty.fr/espace?acces=… ou #acces=…
    // On le garde sur cet appareil (jamais le code PIN), puis on l'efface de l'adresse : il ouvre le code PIN.
    const { search, hash, pathname } = window.location;
    // Application « Walty Caisse » installable (service worker sans aucune donnée, portée /espace)
    registerCaisseWorker();
    const keep = wantsCaisse() ? `${pathname}?caisse=1` : pathname;
    // Lien « Choisir un nouveau mot de passe » (e-mail) : on garde le jeton en mémoire et on l'efface aussitôt de l'adresse
    const reset = readReset(`${search} ${hash}`);
    if (reset) window.history.replaceState(null, "", pathname);
    const fromUrl = reset ? null : readToken(`${search} ${hash}`);
    if (fromUrl) {
      lsSet(fromUrl);
      window.history.replaceState(null, "", keep);
    }
    const tk = fromUrl || readToken(lsGet());
    const mode = fromUrl ? "pin" : lsMode.get() === "password" ? "password" : "pin";
    setToken(tk);
    setVia(mode);
    if (reset) {
      resetTok.current = reset;
      setPhase("reset");
    } else {
      load(tk, mode);
    }
    // Lien d'accès (ou lien « nouveau mot de passe ») ouvert alors que la page était déjà affichée (seul le « # » change)
    const onHash = () => {
      const r = readReset(window.location.hash);
      if (r) {
        window.history.replaceState(null, "", window.location.pathname);
        resetTok.current = r;
        setNotice("");
        setPhase("reset");
        return;
      }
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
    clearCache();
    lsSet(null);
    setToken(null);
    setBusiness(null);
    setMe(null);
    setNotice("");
    setPhase("access");
  }
  async function logout() {
    await post("logout");
    clearCache();
    ssMust.set(null);
    tempPw.current = "";
    setMe(null);
    setNotice("");
    load(token, via);
  }
  const expired = useCallback(() => {
    clearCache();
    setMe(null);
    setNotice(via === "password" ? EXPIRED_PW : EXPIRED);
    load(token, via);
  }, [load, token, via]);
  /** « Mon programme » enregistré : l'accueil affiche tout de suite les nouvelles règles. */
  const programSaved = useCallback((r) => {
    const s = r?.settings;
    if (!s) return;
    setMe((m) => (m && m.program ? { ...m, program: { ...m.program, reward_threshold: s.reward_threshold, reward_description: s.reward_description, welcome_offer: s.welcome_offer || null } } : m));
  }, []);

  /** Connexion réussie par mot de passe. */
  function passwordIn(login, password, mustChange) {
    clearCache();
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
    clearCache();
    lsMode.set("pin");
    ssMust.set(null);
    setVia("pin");
    setNotice("");
    load(token, "pin");
  }
  /** Nouveau mot de passe choisi avec le lien reçu par e-mail. */
  function resetDone(r) {
    clearCache();
    resetTok.current = "";
    ssMust.set(null);
    tempPw.current = "";
    if (r.login) lsLogin.set(r.login);
    if (r.loggedIn) {
      lsMode.set("password");
      setVia("password");
      setNotice("");
      return load(token, "password");
    }
    setNotice("Votre mot de passe est changé. Connectez-vous avec votre nouveau mot de passe.");
    setForgotOpen(false);
    setPhase("login");
  }
  /** Lien plus valable : retour à la connexion, « Mot de passe oublié ? » déjà ouvert. */
  function resetAgain() {
    resetTok.current = "";
    setNotice("");
    setForgotOpen(true);
    setPhase("login");
  }
  function resetCancel() {
    resetTok.current = "";
    setNotice("");
    setForgotOpen(false);
    load(token, via);
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
      {phase === "login" && <LoginScreen notice={notice} onIn={passwordIn} onQuick={quick} startForgot={forgotOpen} />}
      {phase === "reset" && <ResetScreen resetToken={resetTok.current} onDone={resetDone} onAgain={resetAgain} onCancel={resetCancel} />}
      {phase === "access" && <AccessScreen notice={notice} onLink={openLink} onPassword={pwOk ? toPassword : null} />}
      {phase === "pin" && (
        <PinScreen
          token={token}
          business={business}
          notice={notice === EXPIRED || notice === DEVICE_OUT ? notice : ""}
          onIn={pinIn}
          onInvalid={invalidLink}
          onForget={forget}
          onPassword={pwOk ? toPassword : null}
        />
      )}
      {phase === "change" && (
        <ChangePasswordScreen
          initialOld={tempPw.current}
          // Mot de passe provisoire changé : on redemande qui est connecté (le rôle était « employé » tant que le
          // provisoire n'était pas changé), sinon le gérant arrivait dans la vue employé jusqu'au rechargement.
          onDone={() => { ssMust.set(null); tempPw.current = ""; load(token, "password"); }}
          onLogout={logout}
          onExpired={expired}
        />
      )}
      {phase === "app" && me && <Dashboard me={me} onLogout={logout} onExpired={expired} onProgramSaved={programSaved} />}
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
function LoginScreen({ notice, onIn, onQuick, startForgot = false }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(startForgot);
  const pwRef = useRef(null);
  // L'identifiant de la dernière connexion sur cet appareil (jamais le mot de passe)
  useEffect(() => { const l = lsLogin.get(); if (l) setLogin(l); }, []);

  async function submit(e) {
    e.preventDefault();
    const l = login.trim().toLowerCase();
    if (!l || !password || busy) return;
    setBusy(true);
    setError("");
    // login-gerant : la session porte la preuve « gérant » ; repli sur login-password si pas encore installée
    let r = await post("login-gerant", { login: l, password });
    if (r.unavailable) r = await post("login-password", { login: l, password });
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
          <p className="field-hint ec-center-text">Cet appareil reste connecté 90 jours (« Quitter » pour l'oublier).</p>
        </form>
        <button type="button" className="ec-linkbtn" aria-expanded={forgot} onClick={() => setForgot((f) => !f)}>Mot de passe oublié ?</button>
        {forgot && <ForgotForm initialEmail={login.includes("@") ? login.trim().toLowerCase() : ""} />}
        <button type="button" className="ec-linkbtn ec-quick" onClick={onQuick}>Connexion rapide (employé en caisse) : lien + code PIN</button>
        <p className="faint ec-help">
          Pas encore client ? <Link href="/contact" className="text-link">Réserver une démo</Link>
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════ Mot de passe oublié : lien par e-mail ═════════════════════════ */
const SENT = "Si un compte existe avec cette adresse, vous allez recevoir un e-mail.";
function ForgotForm({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [phoneOnly, setPhoneOnly] = useState(false);
  // L'envoi d'e-mails est-il configuré sur le logiciel de cartes ? Sinon on ne promet pas d'e-mail.
  const [mail, setMail] = useState(null);
  useEffect(() => {
    let live = true;
    api("reset-request").then((r) => {
      if (!live) return;
      if (r.unavailable || (r.ok && r.mail === false)) setPhoneOnly(true);
      setMail(r.ok ? r.mail !== false : true);
    });
    return () => { live = false; };
  }, []);

  async function submit(e) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setError("Tapez l'adresse e-mail de votre compte (par exemple nom@exemple.fr).");
    setBusy(true);
    setError("");
    const r = await post("reset-request", { email: v });
    setBusy(false);
    if (r.unavailable || (r.ok && r.mail === false)) return setPhoneOnly(true);
    if (!r.ok) return setError(r.error || "Erreur, réessayez dans un instant.");
    setSent(true);
  }

  if (phoneOnly) {
    return (
      <p className="ec-info ec-forgot" role="status">
        Appelez Walty au <a href={site.contact.phoneHref}>{site.contact.phone}</a> ou écrivez à <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> : on vous donne un nouveau mot de passe.
      </p>
    );
  }
  if (sent) {
    return (
      <div className="ec-info ec-forgot" role="status">
        <p><b>{SENT}</b></p>
        <p className="muted">Ouvrez-le et cliquez sur « Choisir un nouveau mot de passe » (le lien est valable 1 heure). Pensez à regarder dans les courriers indésirables.</p>
        <button type="button" className="ec-linkbtn" onClick={() => setSent(false)}>Je n'ai rien reçu : renvoyer</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="ec-form ec-forgot" noValidate>
      <p className="muted">Recevez par e-mail un lien pour choisir un nouveau mot de passe.</p>
      <div className="field">
        <label htmlFor="ec-forgot-email">Votre adresse e-mail</label>
        <input
          id="ec-forgot-email"
          className="input"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={120}
          autoFocus
        />
      </div>
      {error && <p className="ec-alert" role="alert">{error}</p>}
      <button className="btn btn-primary ec-full" disabled={busy || mail === null || !email.trim()}>{busy ? "Envoi…" : "Recevoir le lien"}</button>
      <p className="faint ec-help">Votre identifiant n'est pas une adresse e-mail ? Appelez Walty au <a href={site.contact.phoneHref}>{site.contact.phone}</a>.</p>
    </form>
  );
}

/* ═════════════════════════ Lien reçu par e-mail : nouveau mot de passe ═════════════════════════ */
function ResetScreen({ resetToken, onDone, onAgain, onCancel }) {
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState(!resetToken);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (next.length < 8) return setError("Le nouveau mot de passe doit faire au moins 8 caractères.");
    if (next !== again) return setError("Les deux mots de passe ne sont pas identiques.");
    setBusy(true);
    setError("");
    const r = await post("reset-complete", { token: resetToken, password: next });
    setBusy(false);
    if (!r.ok) {
      if (r.unavailable) return setError("Cette fonction arrive bientôt. Appelez Walty pour recevoir un nouveau mot de passe.");
      if (r.invalid) return setInvalid(true);
      return setError(r.error || "Mot de passe non modifié. Réessayez.");
    }
    setNext("");
    setAgain("");
    setDone(r);
  }

  if (done) {
    return (
      <div className="ec-center">
        <div className="ec-gate">
          <Mascot pose="wave" size={110} title="Walty est content" />
          <h1 className="ec-title">Mot de passe changé</h1>
          <p className="ec-ok" role="status"><Icon name="check" size={18} /> Votre nouveau mot de passe est enregistré.</p>
          <button className="btn btn-primary btn-lg ec-full" autoFocus onClick={() => onDone(done)}>{done.loggedIn ? "Entrer dans mon espace" : "Me connecter"}</button>
        </div>
      </div>
    );
  }
  if (invalid) {
    return (
      <div className="ec-center">
        <div className="ec-gate">
          <Mascot pose="lost" size={110} title="Walty ne trouve pas ce lien" />
          <h1 className="ec-title">Ce lien n'est plus valable</h1>
          <p className="muted">Un lien sert une seule fois, pendant 1 heure, et seul le dernier demandé fonctionne. Demandez-en un nouveau : c'est immédiat.</p>
          <button className="btn btn-primary btn-lg ec-full" autoFocus onClick={onAgain}>Demander un nouveau lien</button>
          <button type="button" className="ec-linkbtn" onClick={onCancel}>Retour à la connexion</button>
        </div>
      </div>
    );
  }
  return (
    <div className="ec-center">
      <div className="ec-gate">
        <Mascot pose="wave" size={110} title="Walty vous accueille" />
        <p className="ec-kicker">Mot de passe oublié</p>
        <h1 className="ec-title">Choisissez un nouveau mot de passe</h1>
        <form onSubmit={submit} className="ec-form" noValidate>
          <input type="text" name="username" autoComplete="username" value={lsLogin.get() || ""} readOnly hidden />
          <PasswordField id="ec-reset-new" label="Nouveau mot de passe" value={next} onChange={(v) => { setNext(v); setError(""); }} autoComplete="new-password" autoFocus hint="8 caractères au moins. Une petite phrase est facile à retenir." minLength={8} />
          <PasswordField id="ec-reset-again" label="Retapez le nouveau mot de passe" value={again} onChange={(v) => { setAgain(v); setError(""); }} autoComplete="new-password" minLength={8} />
          {error && <p className="ec-alert" role="alert">{error}</p>}
          <button className="btn btn-primary btn-lg ec-full" disabled={busy || !next || !again}>{busy ? "Enregistrement…" : "Enregistrer mon mot de passe"}</button>
        </form>
        <button type="button" className="ec-linkbtn" onClick={onCancel}>Annuler</button>
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
function MotDePasse({ guard, say, manager = false }) {
  const [state, setState] = useState("form"); // form | done
  return (
    <div className="ec-pw-page">
      {manager && <Appareils guard={guard} say={say} />}
      {state === "done" ? (
        <p className="ec-ok" role="status"><Icon name="check" size={18} /> Votre mot de passe est changé. Utilisez-le à votre prochaine connexion.</p>
      ) : (
        <>
          <p className="muted">Pour le compte du gérant (connexion par e-mail ou identifiant). Le code PIN de la caisse ne change pas.</p>
          <PasswordForm
            onDone={() => { setState("done"); say("Mot de passe changé."); }}
            onExpired={() => guard({ status: 401 })}
          />
        </>
      )}
    </div>
  );
}

/** « Déconnecter tous les appareils » (gérant) : téléphone perdu, employé parti… Cet appareil-ci reste connecté. */
function Appareils({ guard, say }) {
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  async function run() {
    setBusy(true);
    const r = await post("devices", {});
    setBusy(false);
    setAsk(false);
    if (!guard(r)) return;
    if (!r.ok) return setMsg({ ok: false, text: r.error || "Rien n'a été changé. Réessayez." });
    setMsg({ ok: true, text: "Tous les autres appareils sont déconnectés : ils devront retaper le code PIN ou le mot de passe." });
    say("Appareils déconnectés.");
  }
  return (
    <section className="ec-box ec-devices" aria-labelledby="ec-devices-title">
      <h3 id="ec-devices-title">Appareils connectés</h3>
      <p className="muted">Chaque téléphone ou tablette reste connecté 90 jours après la connexion. Téléphone perdu, employé parti ? Déconnectez-les tous : il faudra retaper le code PIN ou le mot de passe. Cet appareil-ci reste connecté.</p>
      {msg && <p className={msg.ok ? "ec-ok" : "ec-alert"} role="status">{msg.ok && <Icon name="check" size={18} />}<span style={{ flex: 1, minWidth: 0 }}>{msg.text}</span></p>}
      {ask ? (
        <div className="ec-confirm" role="alertdialog" aria-label="Confirmation">
          <p>Déconnecter tous les autres appareils (caisse, téléphones de l'équipe) ?</p>
          <div className="ec-inline">
            <button disabled={busy} onClick={run} className="btn btn-primary">{busy ? "Un instant…" : "Oui, déconnecter"}</button>
            <button disabled={busy} onClick={() => setAsk(false)} className="btn btn-ghost">Annuler</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-dark ec-full" onClick={() => { setMsg(null); setAsk(true); }}>Déconnecter tous les appareils</button>
      )}
    </section>
  );
}

/* ═════════════════════════ Connexion rapide : pas encore de lien ═════════════════════════ */
function AccessScreen({ notice, onLink, onPassword }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  // « Scanner le QR code de mon kit » (surtout pour l'application installée sur iPhone, qui ne voit pas la mémoire de Safari)
  const [kit, setKit] = useState(false);
  const [camOk, setCamOk] = useState(false);
  useEffect(() => { setCamOk(!!navigator.mediaDevices?.getUserMedia); }, []);
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
        {camOk && (
          <button type="button" className="btn btn-primary btn-lg ec-full" onClick={() => setKit(true)}>
            Scanner le QR code de mon kit
          </button>
        )}
        {kit && <ScanKit readToken={readToken} onToken={(tk) => { setKit(false); onLink(tk); }} onClose={() => setKit(false)} />}
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
        <p className="field-hint">Cet appareil reste connecté 90 jours : pas besoin de retaper le code PIN.</p>
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
  { id: "chiffres", label: "Chiffres", icon: "chart", tout: true },
  { id: "offres", label: "Offres", icon: "gift", full: true, tout: true },
  { id: "notifs", label: "Messages", icon: "bell", needs: "canNotify", tout: true },
];
/* tout: true = rubrique de la formule Tout compris (masquée pour la formule Essentiel). */
/** Rubrique du menu sans onglet : « Changer mon mot de passe » (compte du gérant). */
const PASSWORD = { id: "motdepasse", label: "Mot de passe et appareils", icon: "shield" };
/** Ce qu'un employé (code PIN) voit : le scanner (QR code seulement) et les clients en lecture seule. */
const EMPLOYEE_SECTIONS = new Set(["scan", "clients"]);

/** La journée en cours (accueil ET historique du jour : même adresse, donc même mémoire). */
const todayKey = () => `history?day=${gpToday()}&type=all`;

function Dashboard({ me, onLogout, onExpired, onProgramSaved }) {
  const employee = me.role === "employe";
  const manager = me.role === "gerant";
  // Formule Essentiel : ni Chiffres, ni Offres, ni Messages (le logiciel de cartes les refuse aussi)
  const essentiel = me.plan === "essentiel";
  // « Changer mon mot de passe » : seulement pour une connexion par mot de passe (jamais pour un code PIN)
  const showPassword = me.role === "legacy" ? me.via === "password" : !!me.password;
  // Ancienne session ouverte par mot de passe avant la mise à jour : pas encore la preuve « gérant »
  const staleManager = employee && me.via === "password";
  const [tab, setTab] = useState(employee ? "scan" : "accueil");
  const [toast, setToast] = useState("");
  const [more, setMore] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [scanAuto, setScanAuto] = useState(false);
  const [today, setToday] = useState(() => (employee ? null : peek(todayKey())));
  // Mode caisse : ouvert d'office par l'application installée ou par /espace?caisse=1
  const [caisse, setCaisse] = useState(() => isStandalone() || wantsCaisse());
  // v13 : null = on ne sait pas encore, false = adresses card / program / history… pas encore installées
  const [v13, setV13] = useState(null);

  const sections = SECTIONS.filter((t) => (!t.needs || me[t.needs]) && !(t.full && me.basic) && !(t.v13 && v13 === false) && !(t.tout && essentiel) && (!employee || EMPLOYEE_SECTIONS.has(t.id)));
  const upgrade = essentiel && !employee;
  // Barre du bas (téléphone) : 4 rubriques + « Plus »
  const main = sections.filter((t) => t.main);
  if (main.length < 4) main.push(...sections.filter((t) => !t.main).slice(0, 4 - main.length));
  const rest = sections.filter((t) => !main.includes(t));
  const current = tab === PASSWORD.id && showPassword ? PASSWORD : sections.find((t) => t.id === tab) || sections[0];
  const hasMore = rest.length > 0 || showPassword;
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

  // La journée en cours (accueil) : sert aussi à savoir si les adresses de la v13 sont installées.
  // Même adresse que l'historique du jour : la rubrique « Historique » s'ouvre tout de suite.
  const refreshToday = useCallback(async () => {
    if (employee) return; // l'historique est réservé au gérant
    await swr(todayKey(), (r) => {
      if (!guard(r)) return;
      if (r.unavailable) { setV13(false); setToday(null); return; }
      if (r.ok) { setV13(true); setToday(r); }
    });
  }, [guard, employee]);
  // (appelée par l'accueil, la première rubrique affichée)

  // Rapidité : juste après la connexion, les rubriques les plus probables sont chargées en arrière-plan,
  // pour qu'elles s'ouvrent sans attente (voir la mémoire des rubriques dans outils.js).
  useEffect(() => {
    const essentielPlan = me.plan === "essentiel";
    const t1 = setTimeout(() => {
      const day = gpToday();
      const list = ["customers?q="];
      if (manager) {
        list.push(`history?day=${day}&type=all`, `manual-log?day=${day}`, "program");
        if (!essentielPlan) list.push("stats", "insights", "offers");
        if (!essentielPlan && me.canNotify) list.push("notifications");
      }
      prefetch(list);
    }, 300);
    // « Ma carte » (QR code + image de la carte, plus lourd) un peu après
    const t2 = manager ? setTimeout(() => prefetch(["card"]), 2500) : null;
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
    // une seule fois par connexion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  /** Mode caisse : l'adresse devient /espace?caisse=1 (« Sur l'écran d'accueil » d'iPhone ouvrira la caisse). */
  const openCaisse = useCallback(() => {
    try { window.history.replaceState(null, "", "/espace?caisse=1"); } catch {}
    setCaisse(true);
  }, []);
  const exitCaisse = useCallback((to) => {
    try { window.history.replaceState(null, "", "/espace"); } catch {}
    setCaisse(false);
    if (to === "scan" || employee) go("scan");
  }, [go, employee]);
  // Fermer le menu « Plus » avec la touche Échap
  useEffect(() => {
    if (!more) return;
    const onKey = (e) => e.key === "Escape" && setMore(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [more]);

  if (caisse) {
    return <Caisse me={me} guard={guard} manager={manager} onExit={exitCaisse} onDone={refreshToday} />;
  }

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
          {showPassword && navButton(PASSWORD, "ec-side-pw")}
          {upgrade && <UpgradeCard me={me} />}
          <a className="ec-side-help" href={site.contact.phoneHref}><Icon name="phone" size={18} /> <span>Aide : {site.contact.phone}</span></a>
        </nav>

        <main className="ec-main">
          {staleManager && (
            <div className="ec-info ec-role-note" role="status">
              <span>Pour retrouver les outils du gérant (programme, offres, tampon sans carte…), reconnectez-vous avec votre e-mail et votre mot de passe.</span>
              <button className="btn btn-dark btn-sm" onClick={onLogout}>Se reconnecter</button>
            </div>
          )}
          {current.id !== "accueil" && <h1 className="ec-page-title">{current.label}</h1>}
          {current.id === "accueil" && <Accueil me={me} today={today} refreshToday={refreshToday} guard={guard} go={go} goScan={goScan} openClient={openClient} features={{ v13 }} essentiel={essentiel} upgrade={upgrade ? <UpgradeCard me={me} wide /> : null} />}
          {current.id === "scan" && <Scanner guard={guard} manager={manager} employee={employee} autoStart={scanAuto} onAutoStarted={() => setScanAuto(false)} onDone={refreshToday} onCaisse={openCaisse} />}
          {current.id === "clients" && <Clients guard={guard} say={say} program={me.program} clientId={clientId} openClient={openClient} readOnly={employee} badges={me.role !== "legacy"} exportable={manager} manager={manager} />}
          {current.id === "historique" && <Historique guard={guard} say={say} openClient={openClient} mode={me.program?.mode} onChanged={refreshToday} badges={me.role !== "legacy"} exportable={manager} />}
          {current.id === "carte" && <MaCarte me={me} guard={guard} say={say} />}
          {current.id === "programme" && <Programme me={me} guard={guard} say={say} onSaved={onProgramSaved} />}
          {current.id === "chiffres" && <Chiffres guard={guard} program={me.program} />}
          {current.id === "offres" && <Offres guard={guard} say={say} canSend={me.canNotify} />}
          {current.id === PASSWORD.id && showPassword && <MotDePasse guard={guard} say={say} manager={manager} />}
          {current.id === "notifs" && me.canNotify && <Notifications guard={guard} say={say} max={me.maxNotificationsPerWeek} manager={manager} business={{ name: me.business?.name || "Votre commerce", logo_url: me.business?.logo_url || null }} />}
        </main>
      </div>

      {/* Téléphone : barre en bas */}
      <nav className="ec-tabs" aria-label="Rubriques principales">
        {main.map((t) => navButton(t))}
        {/* « Plus » : les autres rubriques et « Changer mon mot de passe » */}
        {hasMore && (
          <button className={`${rest.includes(current) || current === PASSWORD ? "on" : ""} ec-more-btn`} aria-expanded={more} aria-haspopup="true" onClick={() => setMore((m) => !m)}>
            <Icon name="grid" size={20} />
            <span>{rest.includes(current) ? current.label : current === PASSWORD ? "Compte" : "Plus"}</span>
          </button>
        )}
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
            {showPassword && (
              <button className={`ec-sheet-wide ${current.id === PASSWORD.id ? "on" : ""}`} onClick={() => go(PASSWORD.id)}>
                <Icon name={PASSWORD.icon} size={22} />
                <span>{PASSWORD.label}</span>
              </button>
            )}
            {upgrade && <div className="ec-sheet-wide ec-sheet-card"><UpgradeCard me={me} wide /></div>}
          </div>
        </div>
      )}
      {toast && <div className="esp-toast" role="status">{toast}</div>}
    </div>
  );
}

/* ═════════════════════ Formule Essentiel : « Passer au Tout compris » ═════════════════════ */
function UpgradeCard({ me, wide = false }) {
  return (
    <aside className={`ec-upgrade ${wide ? "is-wide" : ""}`} aria-label="Formule Tout compris">
      <b>Formule Essentiel</b>
      <span>Chiffres détaillés, messages et offres : avec la formule Tout compris (15 €/mois).</span>
      {me.teamAccesses > 1 && <span className="ec-upgrade-warn">La formule Essentiel prévoit 1 accès d'équipe : vous en avez {me.teamAccesses} actifs.</span>}
      <a href={site.contact.phoneHref}><Icon name="phone" size={16} /> Passer au Tout compris : appelez Walty</a>
    </aside>
  );
}

/* ═════════════════════════════ Scanner ═════════════════════════════ */
/** Réglage de CET appareil (choisi par le gérant) : le tampon s'ajoute tout seul juste après un scan réussi. */
const LS_AUTO = "walty-espace-tampon-auto";
/** L'aide « 1. Scannez 2. Regardez la couleur 3. Touchez le gros bouton » a déjà été vue sur cet appareil. */
const LS_HELP = "walty-espace-aide-scanner";
const lsAuto = store(LS_AUTO);
const lsHelp = store(LS_HELP);
const AUTO_UNDO_S = 5;

/** « 10 h 12 » (heure de Guadeloupe), sans retour à la ligne au milieu */
const hhmm = (iso) => fmtTime(iso).replace(":", " h ");
/** « à l'instant », « il y a 12 min », « il y a 2 h » */
function agoShort(iso) {
  const min = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  return `il y a ${Math.floor(min / 60)} h`;
}
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;

/** Fiche éclair : la couleur et la phrase à lire en 1 seconde (calculées par le logiciel de cartes). */
function flashOf(v) {
  if (!v) return null;
  if (v.state === "limit") {
    return {
      tone: "red",
      title: "Limite du jour atteinte",
      sub: `${plural(v.today_count, "passage")} aujourd'hui (${v.max_per_day} maximum par jour)${v.today_last_at ? ` · dernier à ${hhmm(v.today_last_at)}` : ""}`,
    };
  }
  if (v.state === "today") {
    const left = v.max_per_day - v.today_count;
    return {
      tone: "orange",
      title: `Déjà passé aujourd'hui à ${hhmm(v.today_last_at)} (${agoShort(v.today_last_at)})`,
      sub: `${v.today_count} fois aujourd'hui${left > 0 ? ` · encore ${left} possible${left > 1 ? "s" : ""}` : ""}`,
    };
  }
  if (v.state === "first") return { tone: "green", title: "Première visite", sub: "Nouveau client : bienvenue !" };
  return {
    tone: "green",
    title: v.days_since <= 1 ? "Dernière visite hier" : `Dernière visite il y a ${v.days_since} jours`,
    sub: `Le ${fmtLongDate(v.last_visit_at)}`,
  };
}
/** « Client depuis mars · 14 visites · dernier cadeau le 3 oct. » */
function sinceLine(v) {
  if (!v) return "";
  const since = v.customer_since ? new Date(v.customer_since) : null;
  let first = "";
  if (since) {
    const sameDay = gpToday() === new Date(since.getTime() - 4 * 3600e3).toISOString().slice(0, 10);
    const sameYear = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, year: "numeric" }).format(since) === new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, year: "numeric" }).format(new Date());
    first = sameDay ? "Inscrit aujourd'hui" : `Client depuis ${new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, month: "long", ...(sameYear ? {} : { year: "numeric" }) }).format(since)}`;
  }
  return [first, plural(v.visits_total, "visite"), v.last_reward_at ? `dernier cadeau le ${fmtDate(v.last_reward_at)}` : ""].filter(Boolean).join(" · ");
}

function Flash({ tone, title, sub, icon }) {
  return (
    <div className={`ec-flash ec-flash-${tone}`} role="status" aria-live="polite">
      <span className="ec-flash-dot" aria-hidden="true">{icon ? <Icon name={icon} size={22} stroke={2.4} /> : null}</span>
      <div>
        <b>{title}</b>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

/** Aide de la première ouverture du scanner (une fois par appareil). */
function ScanHelp({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="ec-help-back" onClick={onClose}>
      <div className="ec-help-card" role="dialog" aria-modal="true" aria-labelledby="ec-help-title" onClick={(e) => e.stopPropagation()}>
        <p className="ec-kicker">Le scanner en 30 secondes</p>
        <h2 id="ec-help-title" className="ec-h">3 gestes, c'est tout</h2>
        <ol className="ec-help-steps">
          <li><b>1</b><div><strong>Scannez</strong><span>Visez le QR code de la carte du client (Apple Wallet ou Google Wallet).</span></div></li>
          <li>
            <b>2</b>
            <div>
              <strong>Regardez la couleur</strong>
              <span className="ec-help-tones">
                <em className="t-green">Vert : tout va bien</em>
                <em className="t-orange">Orange : déjà venu aujourd'hui</em>
                <em className="t-red">Rouge : limite du jour atteinte</em>
              </span>
            </div>
          </li>
          <li><b>3</b><div><strong>Touchez le gros bouton</strong><span>«&nbsp;Ajouter 1 tampon&nbsp;», ou «&nbsp;Valider le cadeau&nbsp;» quand il est prêt. Une erreur&nbsp;? «&nbsp;Annuler ce passage&nbsp;».</span></div></li>
        </ol>
        <button className="btn btn-primary btn-lg ec-full" autoFocus onClick={onClose}>C'est parti</button>
      </div>
    </div>
  );
}

function Scanner({ guard, manager = false, employee = false, autoStart, onAutoStarted, onDone, onCaisse }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [serial, setSerial] = useState(null);
  // Client choisi dans la liste (gérant, sans QR code) : { id, name }
  const [manual, setManual] = useState(null);
  const [overOn, setOverOn] = useState(false);
  const [reason, setReason] = useState("");
  const [card, setCard] = useState(null);
  const [message, setMessage] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  // Dernière action réussie sur cette carte (« stamp », « redeem »…) : le gros bouton devient « Client suivant »
  const [acted, setActed] = useState(null);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [useAmount, setUseAmount] = useState("");
  const [lap, setLap] = useState("");
  const [confirm, setConfirm] = useState(null);
  // Tampon automatique au scan (réglage de l'appareil) et son « Annuler » de 5 secondes
  const [auto, setAuto] = useState(false);
  const [undoLeft, setUndoLeft] = useState(0);
  // Aide de la première fois : null = on regarde, true = affichée, false = déjà vue
  const [help, setHelp] = useState(null);

  useEffect(() => {
    setAuto(lsAuto.get() === "1");
    setHelp(lsHelp.get() ? false : true);
  }, []);
  const closeHelp = useCallback(() => { lsHelp.set("vu"); setHelp(false); }, []);

  const stopCamera = useCallback(async () => {
    const s = scannerRef.current;
    if (s?.isScanning) await s.stop().catch(() => {});
    setScanning(false);
  }, []);
  useEffect(() => () => { stopCamera(); }, [stopCamera]);
  // « Scanner une carte » touché sur l'accueil : la caméra s'ouvre tout de suite (après l'aide de la première fois)
  const autoRef = useRef(false);
  useEffect(() => {
    if (!autoStart || autoRef.current || help !== false) return;
    autoRef.current = true;
    onAutoStarted?.();
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, help]);
  // Compte à rebours du « Annuler » du tampon automatique
  useEffect(() => {
    if (undoLeft <= 0) return;
    const id = setTimeout(() => setUndoLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [undoLeft]);

  function success(r, action) {
    try { navigator.vibrate?.(40); } catch {}
    setMessage({ ok: true, text: r.done || "C'est enregistré ✓" });
    setActed(action === "undo" ? null : action);
    setCanUndo(action === "stamp" || action === "purchase");
    if (action === "undo") setUndoLeft(0);
    // l'historique, les clients et les chiffres déjà en mémoire seront rechargés
    afterVisitChange();
    onDone?.();
    setAmount("");
    setUseAmount("");
  }

  async function send(action, extra = {}, value) {
    if (manual && !value) return sendManual(action, extra);
    const target = value || serial;
    if (!target) return null;
    setBusy(true);
    setConfirm(null);
    const r = await post("scan", { serial: target, action, ...extra });
    setBusy(false);
    if (!guard(r)) return null;
    if (!r.ok) {
      // Refus (limite du jour…) : la fiche éclair se met à jour avec ce que dit le serveur
      if (r.visit) setCard((c) => (c ? { ...c, visit: r.visit } : c));
      setMessage({ ok: false, text: r.error || "Action impossible." });
      if (action === "lookup") setSerial(null);
      return null;
    }
    setSerial(target);
    setCard(r);
    if (action === "lookup") { setMessage(null); setActed(null); return r; }
    success(r, action);
    return r;
  }

  /** Action SANS QR code (gérant) ou tampon hors limite : adresse « manual », refusée côté serveur pour un employé. */
  async function sendManual(action, extra = {}, who = manual) {
    if (!who) return;
    setBusy(true);
    setConfirm(null);
    const r = await post("manual", { customer_id: who.id, action, ...extra });
    setBusy(false);
    if (!guard(r)) return;
    if (!r.ok) {
      if (r.limit_reached || r.visit) setCard((c) => (c ? { ...c, limit_reached: !!r.limit_reached || c.limit_reached, visit: r.visit || c.visit } : c));
      setMessage({ ok: false, text: r.error || "Action impossible." });
      if (action === "lookup") setManual(null);
      return;
    }
    if (action === "lookup" || manual) setManual(who);
    setCard(r);
    if (action === "lookup") { setMessage(null); setActed(null); return; }
    setOverOn(false);
    setReason("");
    success(r, action);
  }
  /**
   * « Retirer 1 tampon » (gérant) après un scan ou depuis la liste : raison obligatoire, vérifié par le logiciel de cartes.
   * Renvoie la réponse (le petit formulaire affiche l'erreur éventuelle).
   */
  async function removeStamp(reason, target) {
    if (!target) return { ok: false, error: "Client introuvable." };
    setBusy(true);
    setConfirm(null);
    const r = await post("manual", { customer_id: target.id, action: "remove_stamp", reason });
    setBusy(false);
    if (!guard(r)) return r;
    if (!r.ok) return r;
    setCard(r);
    setOverOn(false);
    setReason("");
    success(r, "remove_stamp");
    return r;
  }
  /** Client choisi dans la liste : on affiche sa carte (sans rien enregistrer). */
  function pick(c) {
    const who = { id: c.id, name: `${c.first_name} ${c.last_name || ""}`.trim(), first: c.first_name };
    setMessage(null);
    setCanUndo(false);
    setActed(null);
    setUndoLeft(0);
    setConfirm(null);
    setOverOn(false);
    setReason("");
    setSerial(null);
    sendManual("lookup", {}, who);
    try { window.scrollTo({ top: 0 }); } catch {}
  }
  function closeCard() {
    setManual(null);
    setCard(null);
    setMessage(null);
    setCanUndo(false);
    setActed(null);
    setUndoLeft(0);
    setConfirm(null);
    setOverOn(false);
    setReason("");
  }
  /** Gérant sans QR code : chaque action demande une confirmation qui le dit clairement. */
  const ask = (label, run) => setConfirm({ label: manual ? `${label.replace(/\s*\?$/, "")} — sans scanner la carte de ${manual.first}. Confirmer ?` : label, run });

  /** Carte scannée : fiche éclair, puis tampon automatique si l'appareil le demande et que c'est permis. */
  async function scanned(found) {
    const r = await send("lookup", {}, found);
    if (!r || !auto || r.mode !== "stamps" || r.reward_ready || !r.visit?.can_stamp) return;
    const s = await send("stamp", {}, found);
    if (s) setUndoLeft(AUTO_UNDO_S);
  }

  async function startCamera() {
    setMessage(null);
    setCard(null);
    setSerial(null);
    setManual(null);
    setCanUndo(false);
    setActed(null);
    setUndoLeft(0);
    setConfirm(null);
    setOverOn(false);
    setReason("");
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
          await scanned(found);
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
  /** Client suivant : la caméra (QR code) ou, sans QR code, la liste des clients. */
  const next = () => (manual ? closeCard() : startCamera());

  const amountNum = Number(amount.replace(",", ".")) || 0;
  const preview =
    card?.mode === "points" ? `+${Math.floor(amountNum * card.points_per_euro)} points`
    : card?.mode === "cashback" ? `+${euro(Math.round(amountNum * card.cashback_percent) / 100)} sur la cagnotte`
    : "";

  // Fiche éclair (le logiciel de cartes la calcule ; sans elle, l'affichage d'avant)
  const v = card?.visit || null;
  const limit = v ? v.limit_reached : !!card?.limit_reached;
  const canStamp = v ? v.can_stamp : !!card && !card.reward_ready && !limit;
  const flash = card ? (acted && message?.ok ? { tone: "done", title: message.text, icon: "check" } : flashOf(v)) : null;
  const who = manual || (card?.customer_id ? { id: card.customer_id, first: card.first_name } : null);
  const stamp = () => (manual ? ask("Vous ajoutez un tampon", () => sendManual("stamp")) : send("stamp"));
  const redeem = () => (manual ? ask("Vous validez le cadeau remis", () => sendManual("redeem")) : send("redeem"));
  const overForm = card?.mode === "stamps" && limit && manager && who && !card.reward_ready;

  return (
    <div className="ec-panel">
      {help && <ScanHelp onClose={closeHelp} />}
      <div id="ec-lecteur" className={`ec-reader ${scanning ? "" : "is-hidden"}`} />

      {!scanning && !card && (
        <button onClick={startCamera} className="ec-scan-big">
          <span className="ec-scan-icon"><Icon name="qr" size={44} stroke={1.8} /></span>
          <b>Scanner une carte</b>
          <span>Visez le QR code de la carte du client</span>
        </button>
      )}
      {!scanning && !card && onCaisse && (
        <button type="button" className="cz-entry" onClick={async () => { await stopCamera(); onCaisse(); }}>
          <img src="/caisse/icon-192.png" alt="" width="52" height="52" />
          <span>
            <b>Mode caisse</b>
            <span>Plein écran, caméra toujours allumée : le tampon s'ajoute tout seul en 2 secondes.</span>
          </span>
          <Icon name="arrow" size={22} stroke={2} />
        </button>
      )}
      {!scanning && !card && onCaisse && <InstallCard />}
      {scanning && <button onClick={stopCamera} className="btn btn-ghost ec-full">Arrêter la caméra</button>}
      {busy && <p className="ec-wait" aria-live="polite">Un instant…</p>}

      {card && (
        <section className={`ec-card ${manual ? "is-manual" : ""} ${flash ? `tone-${flash.tone}` : ""}`} aria-label="Carte du client">
          {manual && (
            <p className="ec-manual-flag"><Icon name="shield" size={16} /> Sans QR code (gérant) · chaque action est notée dans l'historique{typeof card.manual_left === "number" ? ` · encore ${card.manual_left} aujourd'hui` : ""}</p>
          )}
          {flash && <Flash {...flash} />}
          {undoLeft > 0 && canUndo && !manual && (
            <button disabled={busy} onClick={() => send("undo")} className="btn btn-dark btn-lg ec-full ec-auto-undo">
              Annuler ce tampon <span>({undoLeft} s)</span>
            </button>
          )}

          <div className="ec-card-head">
            <span className="ec-avatar">{initials(`${card.first_name} ${card.last_name || ""}`)}</span>
            <div>
              <h2>{card.first_name} {card.last_name || ""}</h2>
              {v && <p className="ec-since">{sinceLine(v)}</p>}
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

          {/* Tampons : UN gros bouton, selon l'état de la carte */}
          {card.mode === "stamps" && (
            <div className="ec-main-action">
              {card.reward_ready ? (
                <>
                  <button disabled={busy} onClick={redeem} className="btn btn-primary btn-lg ec-full ec-stamp-btn ec-gift-btn"><Icon name="gift" size={22} /> Valider le cadeau : {card.reward}</button>
                  {canStamp && <button disabled={busy} onClick={stamp} className="btn btn-ghost ec-full">Ajouter quand même 1 tampon</button>}
                </>
              ) : acted ? (
                <>
                  <button onClick={next} className="btn btn-primary btn-lg ec-full ec-stamp-btn"><Icon name={manual ? "users" : "qr"} size={22} /> Client suivant</button>
                  {canStamp && <button disabled={busy} onClick={stamp} className="btn btn-ghost ec-full"><Icon name="plus" size={18} /> {acted === "stamp" ? "Ajouter encore 1 tampon" : "Ajouter 1 tampon"}</button>}
                </>
              ) : canStamp ? (
                <button disabled={busy} onClick={stamp} className="btn btn-primary btn-lg ec-full ec-stamp-btn"><Icon name="plus" size={22} /> Ajouter 1 tampon</button>
              ) : (
                <>
                  <button disabled className="btn btn-primary btn-lg ec-full ec-stamp-btn">{limit ? "Limite du jour atteinte" : v && !v.program_active ? "Carte en pause" : "Tampon impossible"}</button>
                  {limit && !manager && <p className="field-hint ec-center-text">Seul le gérant peut dépasser la limite du jour (connexion par e-mail et mot de passe).</p>}
                </>
              )}
              {overForm && (
                <div className="ec-over">
                  <label className="ec-over-check">
                    <input type="checkbox" checked={overOn} onChange={(e) => setOverOn(e.target.checked)} />
                    <span>Dépasser la limite du jour pour ce client (exceptionnel, gérant)</span>
                  </label>
                  {overOn && (
                    <form className="field" onSubmit={(e) => {
                      e.preventDefault();
                      const why = reason.trim();
                      if (why.length < 3) return setMessage({ ok: false, text: "Indiquez la raison (3 caractères au moins)." });
                      setConfirm({ label: `Vous ajoutez un tampon HORS LIMITE pour ${who.first}${manual ? " sans scanner sa carte" : ""} (raison : « ${why} »). Confirmer ?`, run: () => sendManual("stamp", { over_limit: true, reason: why }, who) });
                    }}>
                      <label htmlFor="ec-raison">Raison (obligatoire, notée dans l'historique)</label>
                      <input id="ec-raison" className="input" value={reason} maxLength={200} placeholder="Ex. : 2 achats séparés, oubli d'hier" onChange={(e) => setReason(e.target.value)} />
                      <button type="submit" disabled={busy || reason.trim().length < 3} className="btn btn-primary ec-full"><Icon name="plus" size={18} /> Ajouter un tampon hors limite</button>
                    </form>
                  )}
                </div>
              )}
              {/* Gérant : retirer 1 tampon à tout moment (erreur, fraude), avec une raison */}
              {manager && who && card.stamps?.filled > 0 && (
                <RetirerTampon
                  key={`${who.id}-${card.stamps.filled}`}
                  first={who.first || card.first_name}
                  filled={card.stamps.filled}
                  total={card.stamps.total}
                  busy={busy}
                  onRemove={(why) => removeStamp(why, who)}
                />
              )}
            </div>
          )}

          {/* Points et cagnotte : montant de l'achat */}
          {card.mode !== "stamps" && (
            <form className="field" onSubmit={(e) => {
              e.preventDefault();
              if (amountNum <= 0) return;
              ask(`Enregistrer un achat de ${euro(amountNum)} (${preview}) ?`, () => send("purchase", { amount: amountNum }));
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
                <button key={r.id} disabled={busy || !r.affordable} className="ec-row-btn" onClick={() => ask(`Échanger ${r.cost} points contre « ${r.name} » ?`, () => send("reward", { reward_id: r.id }))}>
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
              ask(`Déduire ${euro(n)} de la cagnotte (${euro(card.cashback)} disponibles) ?`, () => send("cashback", { amount: n }));
            }}>
              <label htmlFor="ec-cagnotte">Utiliser la cagnotte (max {euro(card.cashback)})</label>
              <div className="ec-inline">
                <input id="ec-cagnotte" inputMode="decimal" className="input" value={useAmount} placeholder={String(card.cashback).replace(".", ",")} onChange={(e) => setUseAmount(e.target.value.replace(/[^\d.,]/g, ""))} />
                <button type="submit" disabled={busy} className="btn btn-dark">Déduire</button>
              </div>
            </form>
          )}

          {card.lap_enabled && !manual && (
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
                <button key={c.id} disabled={busy} className="ec-row-btn" onClick={() => ask(`Valider l'offre « ${c.title} » ?`, () => send("coupon", { coupon_id: c.id }))}>
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

      {message && !(message.ok && flash?.tone === "done") && <p className={message.ok ? "ec-ok ec-msg" : "ec-alert ec-msg"} role="status">{message.text}</p>}
      {canUndo && <button disabled={busy} onClick={() => send("undo")} className="ec-linkbtn ec-undo">Annuler ce passage (erreur de saisie)</button>}
      {card && !scanning && !(card.mode === "stamps" && acted && !card.reward_ready) && (
        <button onClick={next} className="btn btn-dark btn-lg ec-full"><Icon name={manual ? "users" : "qr"} size={20} /> Client suivant</button>
      )}
      {card && manual && !scanning && <button onClick={closeCard} className="ec-linkbtn ec-center-text">Revenir à la liste des clients</button>}
      {!card && !scanning && (
        <p className="field-hint ec-center-text">Le client ouvre sa carte dans Apple Wallet ou Google Wallet : visez son QR code. Les règles (limite de passages par jour, soldes suffisants…) sont vérifiées automatiquement.</p>
      )}
      {!card && !scanning && manager && (
        <label className="ec-switch">
          <input type="checkbox" checked={auto} onChange={(e) => { const on = e.target.checked; lsAuto.set(on ? "1" : null); setAuto(on); }} />
          <span>
            <b>Tampon automatique au scan</b>
            <em>Sur cet appareil : le tampon s'ajoute dès le scan (si c'est permis), avec un gros « Annuler » pendant {AUTO_UNDO_S} secondes.</em>
          </span>
        </label>
      )}
      {!card && !scanning && !manager && auto && <p className="field-hint ec-center-text">Tampon automatique au scan : activé sur cet appareil par le gérant.</p>}
      {!card && !scanning && manager && <ManualFinder guard={guard} onPick={pick} busy={busy} />}
      {!card && !scanning && employee && (
        <p className="faint ec-help ec-center-text">Pas de QR code ? Seul le gérant peut ajouter un tampon à la main (connexion par e-mail et mot de passe).</p>
      )}
      {!card && !scanning && help === false && <button type="button" className="ec-linkbtn ec-center-text" onClick={() => setHelp(true)}>Revoir l'aide du scanner</button>}
    </div>
  );
}

/* ═════════════════ Scanner : « Pas de QR code ? Trouver le client » (gérant) ═════════════════ */
function ManualFinder({ guard, onPick, busy }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(() => peek("customers?q=")?.customers ?? null);
  const [error, setError] = useState("");
  const load = useCallback(async (search) => {
    const apply = (r) => {
      if (!guard(r)) return;
      if (!r.ok) return setError(r.error || "Impossible de charger vos clients.");
      setError("");
      setRows(r.customers);
    };
    // la liste sans recherche est gardée en mémoire (affichée tout de suite) ; une recherche est toujours fraîche
    if (!search) await swr("customers?q=", apply);
    else apply(await api(`customers?q=${encodeURIComponent(search)}`));
  }, [guard]);
  useEffect(() => { load(""); }, [load]);
  // Recherche au fil de la frappe (petite pause pour ne pas charger à chaque lettre)
  useEffect(() => {
    const id = setTimeout(() => { if (rows !== null) load(q.trim()); }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <section className="ec-box ec-finder" aria-labelledby="ec-finder-title">
      <div>
        <h3 id="ec-finder-title">Pas de QR code ? Trouver le client</h3>
        <p className="muted ec-small">Réservé au gérant : pour ajouter un tampon à la main ou dépasser la limite du jour. Chaque action est confirmée et notée dans l'historique (30 par jour au maximum).</p>
      </div>
      <form className="ec-search" role="search" onSubmit={(e) => { e.preventDefault(); load(q.trim()); }}>
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Nom, téléphone ou e-mail" aria-label="Rechercher un client (nom, téléphone ou e-mail)" />
      </form>
      {error && <p className="ec-alert">{error}</p>}
      {rows === null && !error && <div role="status" aria-label="Chargement"><SkelList rows={3} /></div>}
      {rows && rows.length === 0 && <p className="muted ec-small">{q ? "Aucun client ne correspond." : "Pas encore de client."}</p>}
      {rows && rows.length > 0 && (
        <ul className="ec-clients ec-finder-list">
          {rows.map((c) => (
            <li key={c.id}>
              <button className="ec-client-open" disabled={busy} onClick={() => onPick(c)} aria-label={`Choisir ${c.first_name} ${c.last_name || ""}`.trim()} />
              <span className="ec-avatar sm">{initials(`${c.first_name} ${c.last_name || ""}`)}</span>
              <div className="ec-client-main">
                <b>{c.first_name} {c.last_name || ""}</b>
                <span>{c.phone || c.email || ""}</span>
              </div>
              <div className="ec-client-side">
                <b>{c.balance}</b>
                <span>{fmtAgo(c.last_visit_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {rows && rows.length >= 100 && <p className="field-hint ec-center-text">Les 100 clients venus le plus récemment : tapez un nom pour trouver les autres.</p>}
    </section>
  );
}

/* ═════════════════════════════ Clients ═════════════════════════════ */
function Clients({ guard, say, clientId, openClient, readOnly = false, badges = false, exportable = false, manager = false }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(() => peek("customers?q=")?.customers ?? null);
  const [stats, setStats] = useState(() => peek("customers?q=")?.stats ?? null);
  const [error, setError] = useState("");
  const load = useCallback(async (search) => {
    const apply = (r) => {
      if (!guard(r)) return;
      if (!r.ok) return setError(r.error || "Impossible de charger vos clients.");
      setError("");
      setRows(r.customers);
      setStats(r.stats);
    };
    // la liste sans recherche est gardée en mémoire (affichée tout de suite, puis remise à jour) ; une recherche est toujours fraîche
    if (!search) await swr("customers?q=", apply);
    else apply(await api(`customers?q=${encodeURIComponent(search)}`));
  }, [guard]);
  useEffect(() => { load(""); }, [load]);

  if (clientId) {
    return <ClientFiche id={clientId} row={rows?.find((r) => r.id === clientId) || null} guard={guard} say={say} onBack={() => openClient(null)} readOnly={readOnly} badges={badges} manager={manager} />;
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
      {rows === null && !error && <div role="status" aria-label="Chargement"><SkelList rows={5} /></div>}
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
      {exportable && <ExportButton type="clients" label="Exporter tous mes clients (Excel)" guard={guard} say={say} />}
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
  const [s, setS] = useState(() => peek("stats")?.stats ?? null);
  const [basic, setBasic] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    (async () => {
      // affichés tout de suite s'ils sont en mémoire, puis remis à jour
      const r = await swr("stats", (x) => { if (live && x.ok) setS(x.stats); });
      if (!live || !guard(r)) return;
      if (r.ok) return;
      if (!r.unavailable) return setError(r.error || "Impossible de charger vos chiffres.");
      // Mode de base : les chiffres simples de la liste des clients
      const c = await getFresh("customers?q=");
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
  if (!s) return <Squelette kpis={4} rows={3} boxes={1} />;

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
  const [d, setD] = useState(() => peek("insights")?.insights ?? null);
  useEffect(() => {
    let live = true;
    swr("insights", (r) => { if (live && guard(r)) setD(r.ok ? r.insights : (cur) => cur || false); });
    return () => { live = false; };
  }, [guard]);
  if (d === false) return null; // pas de chiffres détaillés (ancienne version du logiciel de cartes)
  if (!d) return <SkelBox lines={4} />;
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
  const [data, setData] = useState(() => peek("offers"));
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(7);
  const [notify, setNotify] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [soon, setSoon] = useState(false);

  const load = useCallback(async () => {
    await swr("offers", (r) => {
      if (!guard(r)) return;
      if (r.unavailable) return setSoon(true);
      if (!r.ok) return setError(r.error || "Impossible de charger vos offres.");
      setError("");
      setData(r);
    });
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
    // la liste des offres, les fiches clients (offres sur leur carte) et les messages de la semaine changent
    invalidate("offers", "customer?", "notifications");
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
      {!data && !error && <SkelBox title><SkelList rows={2} /></SkelBox>}
      {data && (
        <>
          {data.welcome && (
            <section className="ec-box">
              <h3>Offres automatiques</h3>
              <ul className="ec-facts">
                <li><span><Icon name="sparkle" size={16} /> Bienvenue (à l'inscription)</span><b>{data.welcome}</b></li>
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

/** Le texte d'avertissement avant d'envoyer au-delà de la limite de la semaine (gérant). */
const OVER_WARNING =
  "Attention : trop de messages peuvent être bloqués par Google (pas plus de 3 par carte en 24 h) et vos clients risquent de couper les notifications ou de supprimer la carte. Nous conseillons 1 message par semaine.";

function Notifications({ guard, say, business, max, manager = false }) {
  const cached = peek("notifications");
  const [list, setList] = useState(cached?.notifications ?? null);
  const [info, setInfo] = useState(cached);
  const [msg, setMsg] = useState("");
  const [when, setWhen] = useState("now");
  const [at, setAt] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [every, setEvery] = useState(7);
  const [until, setUntil] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Limite de la semaine atteinte : « Envoyer quand même » (gérant) → avertissement → « J'ai compris » → envoi au-delà
  const [warnOpen, setWarnOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [over, setOver] = useState(false);

  const load = useCallback(async () => {
    await swr("notifications", (r) => {
      if (!guard(r)) return;
      if (!r.ok) return setError(r.error || "Impossible de charger vos messages.");
      setList(r.notifications);
      setInfo(r);
    });
  }, [guard]);
  useEffect(() => { load(); }, [load]);

  const remaining = info ? info.remaining : null;
  const weekMax = info?.max ?? max ?? 0;
  const limitReached = remaining === 0;
  // plus de plafond pour le gérant (23 oct.) : prévenu deux fois, il décide
  const canOverride = manager && !!info?.canOverride;

  function check(e) {
    e.preventDefault();
    setError("");
    if (!msg.trim()) return setError("Écrivez votre message d'abord.");
    if (limitReached && !over) return setError("Vous avez utilisé vos messages de la semaine (du lundi au dimanche).");
    if (when === "later" && (!at || at <= gpLocal(Date.now()))) return setError("Choisissez une date et une heure à venir.");
    if (when === "later" && repeat && !over && (every < 3 || every > 60)) return setError("La répétition doit être d'au moins 3 jours.");
    setConfirm(true);
  }
  function resetOver() {
    setOver(false);
    setWarnOpen(false);
    setUnderstood(false);
  }
  async function send() {
    setBusy(true);
    setError("");
    const r = await post("notifications", {
      message: msg.trim(),
      when,
      sendAt: when === "later" ? at : undefined,
      repeatEveryDays: when === "later" && repeat && !over ? every : null,
      repeatUntil: when === "later" && repeat && !over && until ? `${until}T23:59` : null,
      ...(over ? { override: true, understood: true } : {}),
    });
    setBusy(false);
    if (!guard(r)) return;
    setConfirm(false);
    if (!r.ok) return setError(r.error || "Le message n'a pas pu être enregistré.");
    say(r.sentNow ? (r.overLimit ? "Message envoyé (au-delà de la limite) ✓" : "Message envoyé ✓") : "Message programmé ✓");
    // plus de 3 messages en 24 h : Google (Android) peut ne pas l'afficher, Apple l'affiche
    if (r.googleWarning) setError("Envoyé. Attention : déjà 3 messages en 24 heures, les téléphones Android (Google) risquent de ne pas l'afficher. Les iPhone l'affichent.");
    setMsg(""); setAt(""); setWhen("now"); setRepeat(false); setUntil("");
    resetOver();
    invalidate("notifications");
    load();
  }
  async function cancel(id) {
    const r = await api(`notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!guard(r)) return;
    say(r.ok ? "Message annulé." : r.error || "Impossible d'annuler.");
    invalidate("notifications");
    load();
  }

  const formLocked = limitReached && !over;
  return (
    <div className="ec-panel">
      <div className="ec-notif-grid">
        <section className="ec-box">
          <div className="ec-box-head">
            <h2 className="ec-h">Nouveau message</h2>
            {remaining !== null && (
              <span className="ec-quota">
                {weekMax ? <b className={`chip ${remaining ? "chip-orange" : ""}`}>{Math.max(0, weekMax - remaining)} / {weekMax} cette semaine</b> : null}
                <span className="ec-quota-left">{remaining ? `Il vous en reste ${remaining} cette semaine` : "Plus d'envoi cette semaine"}</span>
              </span>
            )}
          </div>

          {/* Limite de la semaine atteinte */}
          {limitReached && !over && !warnOpen && (
            <div className="ec-limit" role="status">
              <b>Limite de {weekMax} message{weekMax > 1 ? "s" : ""} cette semaine atteinte</b>
              <p>Vos clients reçoivent au plus {weekMax} message{weekMax > 1 ? "s" : ""} par semaine (du lundi au dimanche). Vous pourrez de nouveau leur écrire lundi.</p>
              {canOverride && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setWarnOpen(true); setUnderstood(false); setError(""); }}>
                  Envoyer quand même
                </button>
              )}
            </div>
          )}
          {/* Avertissement avant d'envoyer au-delà de la limite (gérant) */}
          {warnOpen && !over && (
            <div className="ec-warning" role="alertdialog" aria-labelledby="ec-warn-t">
              <p id="ec-warn-t"><strong>Attention :</strong> {OVER_WARNING.replace(/^Attention : /, "")}</p>
              <label className="ec-over-check">
                <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
                <span>J'ai compris</span>
              </label>
              <div className="ec-inline">
                <button type="button" className="btn btn-primary" disabled={!understood} onClick={() => { setOver(true); setWarnOpen(false); setRepeat(false); }}>
                  Continuer
                </button>
                <button type="button" className="btn btn-ghost" onClick={resetOver}>Annuler</button>
              </div>
            </div>
          )}

          {!confirm ? (
            <form className="ec-form" onSubmit={check}>
              {over && (
                <span className="ec-overflag">
                  <Icon name="bell" size={14} /> Envoi au-delà de la limite · c'est vous qui décidez
                </span>
              )}
              <div className="field">
                <label htmlFor="ec-msg">Votre message</label>
                <textarea id="ec-msg" className="textarea" maxLength={180} value={msg} disabled={formLocked} onChange={(e) => { setMsg(e.target.value); setError(""); }} placeholder="Ex. : Ce soir, le 2e bokit à moitié prix 🌅" style={{ minHeight: 96 }} />
                <span className="field-hint">{msg.length}/180 · court et direct, ça marche mieux</span>
              </div>
              <div className="wiz-suggest">{IDEAS.map((t) => <button type="button" key={t.label} disabled={formLocked} onClick={() => setMsg(t.text)}>{t.label}</button>)}</div>
              <fieldset className="field wiz-fieldset" disabled={formLocked}>
                <legend>Quand ?</legend>
                <div className="ec-seg">
                  <label><input type="radio" name="ec-when" checked={when === "now"} onChange={() => setWhen("now")} /><span>Maintenant</span></label>
                  <label><input type="radio" name="ec-when" checked={when === "later"} onChange={() => setWhen("later")} /><span>Programmer</span></label>
                </div>
              </fieldset>
              {when === "later" && !formLocked && (
                <div className="ec-later">
                  <div className="field">
                    <label htmlFor="ec-at">Date et heure (heure de Guadeloupe)</label>
                    <input id="ec-at" type="datetime-local" className="input" value={at} min={gpLocal(Date.now())} onChange={(e) => setAt(e.target.value)} />
                  </div>
                  {over ? (
                    <p className="field-hint">Un message au-delà de la limite ne se répète pas.</p>
                  ) : (
                    <label className="ec-check"><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} /><span>Répéter ce message</span></label>
                  )}
                  {repeat && !over && (
                    <div className="ec-inline">
                      <div className="field"><label htmlFor="ec-every">Tous les … jours</label><input id="ec-every" type="number" min={3} max={60} className="input" value={every} onChange={(e) => setEvery(Number(e.target.value))} /></div>
                      <div className="field"><label htmlFor="ec-until">Jusqu'au (facultatif)</label><input id="ec-until" type="date" className="input" value={until} onChange={(e) => setUntil(e.target.value)} /></div>
                    </div>
                  )}
                </div>
              )}
              {error && <p className="field-error" role="alert">{error}</p>}
              <button className="btn btn-primary btn-lg ec-full" disabled={formLocked}><Icon name="bell" size={18} /> {when === "later" ? "Programmer le message" : over ? "Envoyer quand même" : "Envoyer à mes clients"}</button>
              {over && <button type="button" className="ec-linkbtn ec-center-text" onClick={resetOver}>Ne pas envoyer au-delà de la limite</button>}
              <p className="field-hint">Envoyé uniquement aux clients qui ont accepté les offres à l'inscription. Il s'affiche sur leur téléphone, même écran éteint.</p>
            </form>
          ) : (
            <div className="ec-confirm" role="alertdialog" aria-label="Confirmer l'envoi">
              <p>
                {when === "later"
                  ? `Programmer ce message pour le ${fmtDateTime(`${at}:00-04:00`)}${repeat && !over ? `, puis tous les ${every} jours` : ""}${over ? " (au-delà de votre limite de la semaine)" : ""} ?`
                  : over
                    ? "Envoyer ce message maintenant, AU-DELÀ de votre limite de la semaine ?"
                    : "Envoyer ce message maintenant à vos clients ?"}
              </p>
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
        {list === null ? <SkelList rows={3} /> : list.length === 0 ? <p className="muted ec-small">Aucun message pour l'instant.</p> : (
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
                    {n.over_limit && <span className="chip chip-orange">Au-delà de la limite</span>}
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
