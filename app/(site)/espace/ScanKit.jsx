"use client";

/**
 * « Scanner le QR code de mon kit » (écran du lien d'accès) : la caméra lit le QR code du kit Walty
 * (walty.fr/espace?acces=…) et ouvre directement le code PIN. Utile surtout dans l'application installée sur iPhone,
 * qui ne partage pas la mémoire de Safari (le lien d'accès n'y est pas encore). Rien n'est envoyé : seul le lien lu
 * est gardé sur l'appareil, comme quand on ouvre le lien.
 */
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { createDecoder, openCamera, startLoop, stopStream } from "./lecteur-qr";

export default function ScanKit({ readToken, onToken, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [wrong, setWrong] = useState(false);
  // dernières fonctions reçues (la caméra ne redémarre pas à chaque affichage)
  const cb = useRef({ readToken, onToken });
  cb.current = { readToken, onToken };
  useEffect(() => {
    let stream = null;
    let loop = null;
    let alive = true;
    (async () => {
      try {
        const [s, decoder] = await Promise.all([openCamera("environment"), createDecoder()]);
        if (!alive) return stopStream(s);
        stream = s;
        const video = videoRef.current;
        video.srcObject = s;
        await video.play().catch(() => {});
        loop = startLoop(video, decoder, (text) => {
          const tk = cb.current.readToken(text);
          if (!tk) return setWrong(true);
          loop?.stop();
          stopStream(stream);
          try { navigator.vibrate?.(60); } catch {}
          cb.current.onToken(tk);
        });
      } catch (err) {
        const n = err?.name || "";
        setError(/NotAllowed|Permission|Security/i.test(n) ? "La caméra est bloquée : autorisez-la pour walty.fr, puis réessayez." : "Impossible d'ouvrir la caméra sur cet appareil.");
      }
    })();
    return () => {
      alive = false;
      loop?.stop();
      stopStream(stream);
    };
  }, []);

  return (
    <div className="cz cz-kit" role="dialog" aria-modal="true" aria-label="Scanner le QR code du kit Walty">
      <video ref={videoRef} className="cz-video" playsInline muted autoPlay />
      <div className="cz-frame" aria-hidden="true"><i /><i /><i /><i /><span className="cz-laser" /></div>
      <header className="cz-top">
        <div className="cz-top-biz">
          <b>QR code de votre kit Walty</b>
          <span>Le lien d'accès de la caisse</span>
        </div>
        <div className="cz-tools">
          <button type="button" className="cz-tool cz-close" onClick={onClose} aria-label="Fermer"><Icon name="x" size={22} stroke={2.2} /></button>
        </div>
      </header>
      <div className="cz-bottom">
        <p className="cz-hint">{error || "Visez le QR code « Espace commerçant » de votre kit"}</p>
        <p className="cz-count">{wrong ? "Ce QR code n'est pas un lien d'accès Walty." : "Le code PIN vous sera demandé juste après."}</p>
      </div>
    </div>
  );
}
