"use client";

/**
 * « Installer Walty Caisse » sur l'écran d'accueil :
 * - Android (Chrome, Samsung Internet, Edge) : un bouton « Installer l'application » (fenêtre du téléphone) ;
 * - iPhone / iPad : un guide en 2 gestes avec les pictogrammes de Safari (Partager → « Sur l'écran d'accueil ») ;
 * - déjà installée (ouverte depuis l'icône) : rien.
 */
import { useEffect, useState } from "react";
import { useInstall } from "./installation";

/** Pictogramme « Partager » de Safari (carré + flèche vers le haut). */
export function ShareGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 10H16" />
    </svg>
  );
}
/** Pictogramme « Sur l'écran d'accueil » (carré arrondi + plus). */
export function AddHomeGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

/** Guide iPhone / iPad en 2 gestes (fenêtre par-dessus l'écran). */
export function IosGuide({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="cz-sheet-back" onClick={onClose}>
      <div className="cz-sheet" role="dialog" aria-modal="true" aria-labelledby="cz-ios-title" onClick={(e) => e.stopPropagation()}>
        <img className="cz-sheet-icon" src="/caisse/apple-touch-icon.png" alt="" width="64" height="64" />
        <h2 id="cz-ios-title">Walty Caisse sur votre écran d'accueil</h2>
        <ol className="cz-steps">
          <li>
            <b>1</b>
            <span className="cz-glyph"><ShareGlyph size={26} /></span>
            <div><strong>Touchez « Partager »</strong><em>En bas de Safari sur iPhone, en haut à droite sur iPad.</em></div>
          </li>
          <li>
            <b>2</b>
            <span className="cz-glyph"><AddHomeGlyph size={26} /></span>
            <div><strong>Choisissez « Sur l'écran d'accueil »</strong><em>Faites défiler la liste si besoin, puis touchez « Ajouter ».</em></div>
          </li>
        </ol>
        <p className="cz-sheet-note">L'icône Walty Caisse apparaît sur l'écran d'accueil : elle ouvre directement la caisse, sans code à retaper pendant 90 jours.</p>
        <button className="btn btn-primary btn-lg ec-full" onClick={onClose} autoFocus>J'ai compris</button>
      </div>
    </div>
  );
}

/**
 * Carte (ou petit bouton, compact) « Installer l'application ». Ne s'affiche que si l'installation est possible
 * et pas encore faite.
 */
export default function InstallCard({ compact = false }) {
  const { installed, canPrompt, ios, install } = useInstall();
  const [guide, setGuide] = useState(false);
  const [done, setDone] = useState(false);
  if (installed || done || (!canPrompt && !ios)) return null;

  // iPhone / iPad : toujours le guide (Safari n'a pas de fenêtre d'installation)
  const run = async () => {
    if (ios) return setGuide(true);
    if (await install()) setDone(true);
  };
  const label = ios ? "Ajouter à l'écran d'accueil" : "Installer l'application";
  return (
    <>
      {compact ? (
        <button type="button" className="cz-install-pill" onClick={run}>
          <img src="/caisse/icon-192.png" alt="" width="28" height="28" />
          <span>{label}</span>
        </button>
      ) : (
        <div className="cz-install-card">
          <img src="/caisse/icon-192.png" alt="" width="56" height="56" />
          <div>
            <b>Walty Caisse sur ce téléphone</b>
            <span>Une icône sur l'écran d'accueil : la caisse s'ouvre en plein écran, prête à scanner.</span>
          </div>
          <button type="button" className="btn btn-primary" onClick={run}>{ios ? "Voir comment faire" : "Installer l'application"}</button>
        </div>
      )}
      {guide && <IosGuide onClose={() => setGuide(false)} />}
    </>
  );
}
