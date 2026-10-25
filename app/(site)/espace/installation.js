"use client";

/**
 * Application « Walty Caisse » : installation sur l'écran d'accueil du téléphone ou de la tablette.
 * - Android / Chrome : le navigateur propose l'installation (événement beforeinstallprompt, capté dès l'ouverture
 *   de l'espace) → bouton « Installer l'application ».
 * - iPhone / iPad : pas de bouton possible (Apple ne le permet pas) → petit guide en 2 gestes
 *   (Partager → « Sur l'écran d'accueil »).
 * - Le service worker (public/caisse-sw.js, portée /espace) sert seulement à rendre l'application installable et à
 *   afficher une page « Pas de réseau » : il ne garde AUCUNE donnée (ni pages, ni réponses de l'API).
 */
import { useEffect, useState } from "react";

let deferred = null; // événement beforeinstallprompt mis de côté
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // on montre NOTRE bouton, au bon moment
    deferred = e;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

/** Ouvert depuis l'icône de l'écran d'accueil (application installée) ? */
export function isStandalone() {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches || window.navigator.standalone === true;
  } catch {
    return false;
  }
}

/** iPhone, iPad (y compris les iPad qui se présentent comme un Mac) ? */
export function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

/** Enregistre le service worker de l'application (portée /espace seulement). */
export function registerCaisseWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
  navigator.serviceWorker.register("/caisse-sw.js", { scope: "/espace" }).catch(() => {});
}

/** État de l'installation : { installed, canPrompt, ios, install() }. */
export function useInstall() {
  const [, setTick] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIOS());
    const fn = () => {
      setTick((n) => n + 1);
      setInstalled(isStandalone() || false);
    };
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  async function install() {
    const e = deferred;
    if (!e) return false;
    deferred = null;
    notify();
    try {
      await e.prompt();
      const choice = await e.userChoice;
      return choice?.outcome === "accepted";
    } catch {
      return false;
    }
  }
  return { installed, canPrompt: !!deferred && !installed, ios: ios && !installed, install };
}
