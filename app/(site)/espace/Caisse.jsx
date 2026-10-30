"use client";

/**
 * MODE CAISSE — application « Walty Caisse » (walty.fr/espace?caisse=1, ou l'icône sur l'écran d'accueil).
 * Le plus rapide possible, sans rien toucher (mains occupées) :
 * - la caméra reste allumée en plein écran ; le client montre sa carte Wallet ; à chaque QR code lu, UNE demande
 *   (adresse « caisse » du logiciel de cartes) décide et ajoute le tampon si c'est permis ;
 * - VERT plein écran « +1 tampon · Marie · 4/8 » ~1,5 s, bip court (réglable) et vibration, gros « Annuler » 5 s,
 *   puis retour au scan tout seul ;
 * - cadeau prêt : ORANGE « 🎁 Cadeau prêt : 1 café offert », UN gros bouton « Valider le cadeau » (et « Plus tard ») ;
 * - déjà passé aujourd'hui : ORANGE « Déjà passé à 10 h 12 », « Ajouter quand même 1 tampon » si la limite le permet ;
 * - limite du jour : ROUGE ; le gérant peut la dépasser avec une raison (adresse « manual », comme dans le scanner) ;
 * - pas une carte Walty / autre commerce : ROUGE, puis retour au scan.
 * La même carte n'est jamais traitée deux fois en 10 secondes (et la base refuse un 2e tampon « Déjà passé »).
 * Mesures (temps de décodage, aller-retour, scan → écran) gardées en mémoire dans window.__waltyCaisse (aucune donnée client).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import InstallCard from "./Installer";
import { countCameras, createDecoder, hasTorch, openCamera, setTorch, startLoop, stopStream } from "./lecteur-qr";
import { afterVisitChange, fmtTime, post } from "./outils";

const SAME_CARD_MS = 10000;
/** Espace insécable (« Cadeau prêt : … » ne se coupe pas avant les deux-points). */
const NB = "\u00a0";
const GREEN_MS = 1500;
const UNDO_MS = 5000;
const LS_SOUND = "walty-caisse-son";
const readSerial = (text) => {
  const m = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.exec(text || "");
  return m ? m[0].toLowerCase() : null;
};
const hhmm = (iso) => fmtTime(iso).replace(":", " h ");
function agoShort(iso) {
  const min = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  return `il y a ${Math.floor(min / 60)} h`;
}
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const vibrate = (p) => { try { navigator.vibrate?.(p); } catch {} };

/** « Dernière visite il y a 12 jours » / « Première visite » (fiche éclair, avant ce tampon). */
function visitLine(v) {
  if (!v) return "";
  if (v.state === "first") return "Première visite : bienvenue !";
  if (v.days_since == null) return "";
  return v.days_since <= 1 ? "Dernière visite hier" : `Dernière visite il y a ${v.days_since} jours`;
}

function Dots({ stamps }) {
  if (!stamps || !stamps.total || stamps.total > 30) return null;
  return (
    <div className="cz-dots" role="img" aria-label={`${stamps.filled} tampons sur ${stamps.total}`}>
      {Array.from({ length: stamps.total }).map((_, i) => <i key={i} className={i < stamps.filled ? "on" : ""} />)}
    </div>
  );
}

/* Petits pictogrammes de la barre (lampe, caméra, son). */
const Torch = ({ on }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 2h10v4l-3 4v11h-4V10L7 6z" /><path d="M7 6h10" fill="none" />
  </svg>
);
const SwitchCam = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><path d="M9.5 13.5a3 3 0 0 0 5.2 1.4M14.5 11.5a3 3 0 0 0-5.2-1.4" /><path d="M15 15.5v-1.5h-1.5M9 9.5V11h1.5" />
  </svg>
);
const Sound = ({ on }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9h4l5-4v14l-5-4H4z" />
    {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
  </svg>
);

export default function Caisse({ me, guard, manager = false, onExit, onDone }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const decoderRef = useRef(null);
  const lockRef = useRef(false);
  const lastRef = useRef({ key: "", at: 0 });
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const wakeRef = useRef(null);
  const aliveRef = useRef(true);
  const facingRef = useRef("environment");
  const onCodeRef = useRef(null);

  const [camera, setCamera] = useState("starting"); // starting | live | paused | error
  const [camError, setCamError] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState(null); // { serial, name, until }
  const [, setTick] = useState(0);
  const [torchOk, setTorchOk] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cams, setCams] = useState(0);
  const [facing, setFacing] = useState("environment");
  const [sound, setSound] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [count, setCount] = useState(0);
  const [reason, setReason] = useState("");
  const [overOpen, setOverOpen] = useState(false);
  const soundRef = useRef(true);

  useEffect(() => {
    const on = lsGet(LS_SOUND) !== "0";
    setSound(on);
    soundRef.current = on;
  }, []);

  /* ───────── Son (WebAudio) : débloqué au premier toucher de l'écran ───────── */
  const unlockAudio = useCallback(() => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioRef.current) audioRef.current = new AC();
      const ctx = audioRef.current;
      if (ctx.state !== "running") ctx.resume().then(() => setAudioReady(true)).catch(() => {});
      else setAudioReady(true);
    } catch {
      // pas de son sur cet appareil
    }
  }, []);
  const beep = useCallback((kind) => {
    if (!soundRef.current) return;
    const ctx = audioRef.current;
    if (!ctx || ctx.state !== "running") return;
    const notes = kind === "ok" ? [[988, 0, 0.09], [1480, 0.1, 0.14]] : kind === "warn" ? [[660, 0, 0.18]] : [[330, 0, 0.14], [220, 0.17, 0.22]];
    try {
      for (const [f, t, d] of notes) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        const t0 = ctx.currentTime + t;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.32, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        o.connect(g).connect(ctx.destination);
        o.start(t0);
        o.stop(t0 + d + 0.03);
      }
    } catch {
      // son impossible : sans importance
    }
  }, []);
  useEffect(() => {
    const onDown = () => unlockAudio();
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("keydown", onDown);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onDown);
    };
  }, [unlockAudio]);

  /* ───────── Écran toujours allumé pendant la caisse (quand le téléphone le permet) ───────── */
  const keepAwake = useCallback(async () => {
    try {
      if (!("wakeLock" in navigator) || document.hidden || wakeRef.current) return;
      wakeRef.current = await navigator.wakeLock.request("screen");
      wakeRef.current.addEventListener?.("release", () => { wakeRef.current = null; });
    } catch {
      wakeRef.current = null;
    }
  }, []);

  /* ───────── Résultats ───────── */
  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  /** Retour au scan (la même carte reste ignorée 10 s à partir de maintenant). */
  const backToScan = useCallback(() => {
    clearTimer();
    setResult(null);
    setOverOpen(false);
    setReason("");
    if (lastRef.current.key) lastRef.current.at = Date.now();
    lockRef.current = false;
  }, []);
  const show = useCallback((res, autoMs) => {
    clearTimer();
    setResult(res);
    if (autoMs) timerRef.current = setTimeout(() => (res.after ? res.after() : backToScan()), autoMs);
  }, [backToScan]);

  /** Mesure « scan → écran affiché » (au rendu suivant). */
  const measure = (meta, kind) => {
    if (!meta) return;
    requestAnimationFrame(() => {
      const m = { kind, decodeMs: meta.decodeMs, apiMs: Math.round(meta.apiMs ?? 0), totalMs: Math.round(performance.now() - meta.at) };
      try {
        const w = (window.__waltyCaisse = window.__waltyCaisse || { timings: [] });
        w.timings.push(m);
        if (w.timings.length > 200) w.timings.shift();
        w.decoder = loopRef.current?.stats?.decoder;
        w.stats = { ...(loopRef.current?.stats || {}) };
      } catch {}
    });
  };

  const handle = useCallback((r, serial, meta) => {
    if (!aliveRef.current) return;
    const name = r.first_name || "";
    const v = r.visit || null;
    // Carte pas encore dans le téléphone du client : sans Wallet, il ne reçoit aucune notification (29 oct. 2026)
    const sansWallet = r.in_wallet === false ? "📲 Pas encore dans son téléphone : dites-lui d'appuyer sur « Ajouter » sur sa carte." : "";
    if (r.status === 0) {
      lastRef.current = { key: "", at: 0 };
      beep("err");
      vibrate(200);
      show({ tone: "red", kicker: "Pas de réseau", title: "Vérifiez le Wi-Fi ou les données", sub: "Puis visez à nouveau la carte." }, 2500);
      return measure(meta, "reseau");
    }
    if (!r.ok && !r.kind) {
      lastRef.current = { key: "", at: 0 };
      beep("err");
      vibrate(200);
      show({ tone: "red", kicker: "Petit souci", title: r.error || "Réessayez", sub: "Visez à nouveau la carte." }, 2500);
      return measure(meta, "erreur");
    }
    switch (r.kind) {
      case "stamped": {
        beep("ok");
        vibrate(70);
        setCount((n) => n + 1);
        setUndo({ serial, name, until: Date.now() + UNDO_MS });
        afterVisitChange();
        onDone?.();
        const next = r.reward_ready
          ? () => show({ tone: "orange", kind: "reward", serial, name, reward: r.reward, stamps: r.stamps, kicker: `${name} vient de le débloquer`, title: `🎁 Cadeau prêt${NB}: ${r.reward}`, gift: true, noName: true }, 30000)
          : backToScan;
        show({
          tone: "green",
          kind: "stamped",
          name,
          stamps: r.stamps,
          kicker: r.added > 1 ? `+${r.added} tampons` : "+1 tampon",
          sub: [r.reward_ready ? "🎁 Cadeau débloqué !" : "", visitLine(v)].filter(Boolean).join(" · "),
          note: [/Heures boostées|parrain/.test(r.done || "") ? r.done.replace(/^Tampon ajouté ✓\s*/, "") : "", sansWallet].filter(Boolean).join(" · "),
          after: next,
        }, GREEN_MS);
        return measure(meta, "stamped");
      }
      case "reward":
        beep("warn");
        vibrate([40, 60, 40]);
        show({ tone: "orange", kind: "reward", serial, name, reward: r.reward, stamps: r.stamps, kicker: name, title: `🎁 Cadeau prêt${NB}: ${r.reward}`, gift: true, noName: true }, 30000);
        return measure(meta, "reward");
      case "today": {
        beep("warn");
        vibrate([40, 60, 40]);
        const left = v ? v.max_per_day - v.today_count : 0;
        show({
          tone: "orange",
          kind: "today",
          serial,
          name,
          stamps: r.stamps,
          kicker: v?.today_last_at ? `Déjà passé à ${hhmm(v.today_last_at)}` : "Déjà passé aujourd'hui",
          sub: v ? `${v.today_last_at ? `${agoShort(v.today_last_at)} · ` : ""}${v.today_count} fois aujourd'hui${left > 0 ? ` · encore ${left} possible${left > 1 ? "s" : ""}` : ""}` : "",
          canForce: left > 0,
          note: sansWallet,
        }, 9000);
        return measure(meta, "today");
      }
      case "limit": {
        beep("err");
        vibrate([60, 80, 60]);
        show({
          tone: "red",
          kind: "limit",
          serial,
          name,
          customerId: r.customer_id,
          stamps: r.stamps,
          kicker: "Limite du jour atteinte",
          sub: v ? `${plural(v.today_count, "passage")} aujourd'hui (${v.max_per_day} maximum)${v.today_last_at ? ` · dernier à ${hhmm(v.today_last_at)}` : ""}` : r.error || "",
        }, 9000);
        return measure(meta, "limit");
      }
      case "other_mode":
        beep("warn");
        show({ tone: "orange", kind: "other_mode", name, kicker: "Carte à points ou cagnotte", title: name, sub: "Le montant de l'achat se saisit dans le scanner classique." }, 9000);
        return measure(meta, "other_mode");
      case "paused":
        beep("err");
        vibrate(200);
        show({ tone: "red", kind: "paused", name, kicker: "Carte en pause", title: name, sub: "Le programme de fidélité est en pause : aucun tampon pour le moment." }, 3500);
        return measure(meta, "paused");
      case "refused":
        beep("err");
        vibrate(200);
        show({ tone: "red", kind: "refused", name, kicker: "Tampon refusé", title: name, sub: r.error || "" }, 3500);
        return measure(meta, "refused");
      default: {
        // not_card, unknown, other_shop
        beep("err");
        vibrate(200);
        const title = r.kind === "other_shop" ? "Carte d'un autre commerce" : r.kind === "unknown" ? "Carte inconnue" : "Ce n'est pas une carte Walty";
        show({ tone: "red", kind: r.kind || "not_card", kicker: "Carte refusée", title, sub: r.error || "Visez le QR code de la carte de fidélité du client (Apple Wallet ou Google Wallet)." }, 2500);
        return measure(meta, r.kind || "not_card");
      }
    }
  }, [backToScan, beep, onDone, show]);

  /** Un QR code vient d'être lu par la caméra. */
  const onCode = useCallback(async (text, meta) => {
    if (lockRef.current || !aliveRef.current) return;
    const serial = readSerial(text);
    const key = serial || `x:${text}`;
    const now = Date.now();
    if (lastRef.current.key === key && now - lastRef.current.at < SAME_CARD_MS) return;
    lockRef.current = true;
    lastRef.current = { key, at: now };
    if (!serial) {
      handle({ ok: false, kind: "not_card", error: "Ce QR code n'est pas une carte de fidélité Walty." }, null, { ...meta, apiMs: 0 });
      return;
    }
    setBusy(true);
    const t = performance.now();
    const r = await post("caisse", { serial });
    const apiMs = performance.now() - t;
    if (!aliveRef.current) return;
    setBusy(false);
    if (r.status === 401) {
      lockRef.current = false;
      guard(r);
      return;
    }
    handle(r, serial, { ...meta, apiMs });
  }, [guard, handle]);

  onCodeRef.current = onCode;

  /* ───────── Caméra : allumée en continu ───────── */
  const stopCamera = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    setTorchOn(false);
  }, []);
  const startCamera = useCallback(async (face = facingRef.current) => {
    stopCamera();
    setCamera("starting");
    setCamError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("error");
      setCamError("La caméra n'est pas disponible dans ce navigateur. Ouvrez walty.fr/espace dans Safari (iPhone) ou Chrome (Android).");
      return;
    }
    try {
      const [stream, decoder] = await Promise.all([openCamera(face), decoderRef.current || createDecoder()]);
      if (!aliveRef.current) return stopStream(stream);
      decoderRef.current = decoder;
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play().catch(() => {});
      loopRef.current = startLoop(video, decoder, (text, meta) => onCodeRef.current?.(text, meta));
      setTorchOk(hasTorch(stream));
      setCamera("live");
      countCameras().then((n) => aliveRef.current && setCams(n));
      keepAwake();
    } catch (err) {
      const n = err?.name || String(err || "");
      setCamera("error");
      setCamError(
        /NotAllowed|Permission|Security/i.test(n)
          ? "La caméra est bloquée. Autorisez la caméra pour walty.fr (iPhone : Réglages › Safari › Caméra ; Android : cadenas à gauche de l'adresse › Autorisations), puis touchez « Démarrer la caisse »."
          : /NotFound|Overconstrained/i.test(n)
            ? "Aucune caméra trouvée sur cet appareil."
            : "Impossible d'ouvrir la caméra. Fermez les autres applications qui l'utilisent, puis réessayez.",
      );
    }
  }, [keepAwake, stopCamera]);

  useEffect(() => {
    aliveRef.current = true;
    startCamera();
    // Application en arrière-plan : caméra coupée (batterie) ; de retour : rallumée tout de suite
    const onVis = () => {
      if (document.hidden) {
        stopCamera();
        setCamera("paused");
      } else {
        startCamera();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    // Pas de défilement de la page derrière la caisse
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      aliveRef.current = false;
      document.removeEventListener("visibilitychange", onVis);
      clearTimer();
      stopCamera();
      html.style.overflow = prev;
      try { wakeRef.current?.release?.(); } catch {}
      try { audioRef.current?.close?.(); } catch {}
    };
    // une seule fois à l'ouverture de la caisse
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compte à rebours du « Annuler »
  useEffect(() => {
    if (!undo) return;
    const id = setInterval(() => {
      if (Date.now() >= undo.until) setUndo(null);
      else setTick((n) => n + 1);
    }, 250);
    return () => clearInterval(id);
  }, [undo]);

  /* ───────── Actions ───────── */
  async function cancelStamp() {
    const u = undo;
    if (!u) return;
    clearTimer();
    lockRef.current = true;
    setUndo(null);
    setBusy(true);
    const r = await post("scan", { serial: u.serial, action: "undo" });
    setBusy(false);
    if (!guard(r)) return;
    if (!r.ok) {
      beep("err");
      show({ tone: "red", kicker: "Annulation impossible", title: u.name, sub: r.error || "" }, 3000);
      return;
    }
    beep("warn");
    setCount((n) => Math.max(0, n - 1));
    afterVisitChange();
    onDone?.();
    // la carte encore devant la caméra n'est pas retamponnée tout de suite (10 s)
    lastRef.current = { key: u.serial, at: Date.now() };
    show({ tone: "neutral", kicker: "Tampon annulé", title: u.name, stamps: r.stamps, sub: "Rien n'a été compté pour ce passage." }, 1600);
  }
  async function redeem(res) {
    clearTimer();
    setBusy(true);
    const r = await post("scan", { serial: res.serial, action: "redeem" });
    setBusy(false);
    if (!guard(r)) return;
    if (!r.ok) {
      beep("err");
      show({ tone: "red", kicker: "Cadeau non validé", title: res.name, sub: r.error || "" }, 3500);
      return;
    }
    beep("ok");
    vibrate(70);
    setUndo(null);
    afterVisitChange();
    onDone?.();
    show({ tone: "green", kind: "redeemed", name: res.name, stamps: r.stamps, kicker: "🎁 Cadeau validé", sub: `${res.reward} · le compteur repart à zéro` }, GREEN_MS);
  }
  async function forceStamp(res) {
    clearTimer();
    setBusy(true);
    const t = performance.now();
    const r = await post("caisse", { serial: res.serial, force: true });
    setBusy(false);
    if (r.status === 401) return guard(r);
    handle(r, res.serial, { at: t, decodeMs: 0, apiMs: performance.now() - t });
  }
  async function overLimit(res) {
    const why = reason.trim();
    if (why.length < 3 || !res.customerId) return;
    clearTimer();
    setBusy(true);
    const r = await post("manual", { customer_id: res.customerId, action: "stamp", over_limit: true, reason: why });
    setBusy(false);
    if (!guard(r)) return;
    if (!r.ok) {
      beep("err");
      show({ ...res, sub: r.error || "Tampon refusé." }, 9000);
      return;
    }
    beep("ok");
    vibrate(70);
    setCount((n) => n + 1);
    afterVisitChange();
    onDone?.();
    setOverOpen(false);
    setReason("");
    show({ tone: "green", kind: "stamped", name: res.name, stamps: r.stamps, kicker: "+1 tampon (hors limite)", sub: `Raison notée dans l'historique : « ${why} »` }, GREEN_MS);
  }

  async function toggleTorch() {
    const next = !torchOn;
    if (await setTorch(streamRef.current, next)) setTorchOn(next);
  }
  function switchCamera() {
    const next = facingRef.current === "environment" ? "user" : "environment";
    facingRef.current = next;
    setFacing(next);
    startCamera(next);
  }
  function toggleSound() {
    const next = !sound;
    setSound(next);
    soundRef.current = next;
    lsSet(LS_SOUND, next ? "1" : "0");
    if (next) {
      unlockAudio();
      setTimeout(() => beep("ok"), 60);
    }
  }

  const bizName = me?.business?.name || "Votre commerce";
  const undoLeft = undo ? Math.max(0, Math.ceil((undo.until - Date.now()) / 1000)) : 0;
  const res = result;
  const line = res && res.kind === "stamped" ? [res.kicker, res.name, res.stamps ? `${res.stamps.filled}/${res.stamps.total}` : ""].filter(Boolean).join(" · ") : "";

  return (
    <div className="cz" aria-label="Walty Caisse">
      <video ref={videoRef} className={`cz-video ${facing === "user" ? "is-mirror" : ""}`} playsInline muted autoPlay />
      <div className="cz-frame" aria-hidden="true"><i /><i /><i /><i /><span className="cz-laser" /></div>

      <header className="cz-top">
        <img className="cz-top-icon" src="/caisse/icon-192.png" alt="" width="36" height="36" />
        <div className="cz-top-biz">
          <b>{bizName}</b>
          <span>Walty Caisse{me?.label ? ` · ${me.label}` : ""}</span>
        </div>
        <div className="cz-tools">
          {torchOk && (
            <button type="button" className={`cz-tool ${torchOn ? "on" : ""}`} onClick={toggleTorch} aria-pressed={torchOn} aria-label={torchOn ? "Éteindre la lampe" : "Allumer la lampe"}><Torch on={torchOn} /></button>
          )}
          {cams > 1 && <button type="button" className="cz-tool" onClick={switchCamera} aria-label={facing === "user" ? "Caméra arrière" : "Caméra avant"}><SwitchCam /></button>}
          <button type="button" className={`cz-tool ${sound ? "on" : ""}`} onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Couper le bip" : "Activer le bip"}><Sound on={sound} /></button>
          <button type="button" className="cz-tool cz-close" onClick={() => onExit?.()} aria-label="Quitter le mode caisse"><Icon name="x" size={22} stroke={2.2} /></button>
        </div>
      </header>

      <div className="cz-bottom">
        {undo && undoLeft > 0 && (
          <button type="button" className="cz-undo" onClick={cancelStamp} disabled={busy}>
            <span>Annuler le tampon de {undo.name}</span>
            <b>{undoLeft} s</b>
          </button>
        )}
        <p className="cz-hint">{camera === "live" ? "Visez le QR code de la carte du client" : camera === "paused" ? "Caméra en pause" : camera === "starting" ? "Ouverture de la caméra…" : ""}</p>
        <p className="cz-count">{count > 0 ? `${plural(count, "tampon")} ajouté${count > 1 ? "s" : ""} sur cet appareil` : "Le tampon s'ajoute tout seul dès que la carte est lue"}</p>
        {sound && !audioReady && camera === "live" && <p className="cz-sound-hint">Touchez l'écran une fois pour activer le bip</p>}
        <InstallCard compact />
      </div>

      {busy && !res && <div className="cz-busy" role="status" aria-label="Un instant"><span className="cz-spin" /></div>}

      {camera === "error" && (
        <div className="cz-start">
          <img src="/caisse/icon-192.png" alt="" width="72" height="72" />
          <h2>Walty Caisse</h2>
          <p>{camError}</p>
          <button type="button" className="btn btn-primary btn-lg ec-full" onClick={() => { unlockAudio(); startCamera(); }}>Démarrer la caisse</button>
          <button type="button" className="ec-linkbtn" onClick={() => onExit?.()}>Revenir à l'espace</button>
        </div>
      )}

      {res && (
        <div className={`cz-res is-${res.tone}`} role="alert" aria-live="assertive" aria-label={line || undefined} onClick={res.kind === "stamped" || res.kind === "redeemed" ? () => { clearTimer(); if (res.after) res.after(); else backToScan(); } : undefined}>
          <div className="cz-res-body" onClick={(e) => res.kind !== "stamped" && res.kind !== "redeemed" && e.stopPropagation()}>
            <span className="cz-res-icon" aria-hidden="true">
              {res.tone === "green" ? <Icon name="check" size={58} stroke={2.6} /> : res.gift ? <Icon name="gift" size={54} stroke={2.2} /> : res.tone === "neutral" ? <Icon name="x" size={50} stroke={2.4} /> : <span className="cz-bang">!</span>}
            </span>
            {res.kind === "stamped" ? (
              <h2 className="cz-res-line">
                <span className="cz-big">{res.kicker}</span>
                <span className="cz-sep"> · </span>
                <span className="cz-name">{res.name}</span>
                {res.stamps && (<><span className="cz-sep"> · </span><span className="cz-count-big">{res.stamps.filled}/{res.stamps.total}</span></>)}
              </h2>
            ) : (
              <>
                <p className="cz-res-kicker">{res.kicker}</p>
                {res.title && <h2 className="cz-res-title">{res.title}</h2>}
                {res.name && !res.noName && res.title !== res.name && <p className="cz-res-name">{res.name}{res.stamps && res.kind !== "reward" ? ` · ${res.stamps.filled}/${res.stamps.total}` : ""}</p>}
              </>
            )}
            <Dots stamps={res.stamps} />
            {res.sub && <p className="cz-res-sub">{res.sub}</p>}
            {res.note && <p className="cz-res-sub">{res.note}</p>}

            {res.kind === "reward" && (
              <div className="cz-actions">
                <button type="button" className="cz-btn cz-btn-main" onClick={() => redeem(res)} disabled={busy} autoFocus>Valider le cadeau</button>
                <button type="button" className="cz-btn cz-btn-ghost" onClick={backToScan} disabled={busy}>Plus tard</button>
              </div>
            )}
            {res.kind === "today" && (
              <div className="cz-actions">
                <button type="button" className="cz-btn cz-btn-main" onClick={backToScan} disabled={busy} autoFocus>Retour au scan</button>
                {res.canForce && <button type="button" className="cz-btn cz-btn-ghost" onClick={() => forceStamp(res)} disabled={busy}>Ajouter quand même 1 tampon</button>}
              </div>
            )}
            {res.kind === "limit" && (
              <div className="cz-actions">
                {manager && res.customerId && !overOpen && (
                  <button type="button" className="cz-btn cz-btn-ghost" onClick={() => { clearTimer(); setOverOpen(true); }}>Dépasser la limite (gérant)</button>
                )}
                {manager && overOpen && (
                  <form className="cz-over" onSubmit={(e) => { e.preventDefault(); overLimit(res); }}>
                    <label htmlFor="cz-raison">Raison (obligatoire, notée dans l'historique)</label>
                    <input id="cz-raison" className="input" value={reason} maxLength={200} placeholder="Ex. : 2 achats séparés" onChange={(e) => setReason(e.target.value)} autoFocus />
                    <button type="submit" className="cz-btn cz-btn-light" disabled={busy || reason.trim().length < 3}>Ajouter 1 tampon hors limite</button>
                  </form>
                )}
                {!manager && <p className="cz-res-sub cz-small">Seul le gérant peut dépasser la limite du jour.</p>}
                <button type="button" className="cz-btn cz-btn-main" onClick={backToScan} disabled={busy}>Retour au scan</button>
              </div>
            )}
            {res.kind === "other_mode" && (
              <div className="cz-actions">
                <button type="button" className="cz-btn cz-btn-main" onClick={() => onExit?.("scan")}>Ouvrir le scanner classique</button>
                <button type="button" className="cz-btn cz-btn-ghost" onClick={backToScan}>Retour au scan</button>
              </div>
            )}
            {["paused", "refused", "not_card", "unknown", "other_shop"].includes(res.kind) && (
              <div className="cz-actions">
                <button type="button" className="cz-btn cz-btn-ghost" onClick={backToScan}>Retour au scan</button>
              </div>
            )}
          </div>
          {undo && undoLeft > 0 && res.kind === "stamped" && (
            <button type="button" className="cz-undo cz-undo-res" onClick={(e) => { e.stopPropagation(); cancelStamp(); }} disabled={busy}>
              <span>Annuler</span>
              <b>{undoLeft} s</b>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
