"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/Icon";
import { site } from "@/lib/site.config";
import { api, copyText, download, fileSlug, initials, programLine } from "./outils";

const STEPS = ["Scannez ce QR code avec l'appareil photo", "Indiquez votre prénom", "Ajoutez la carte à votre téléphone"];

/** « Ma carte » : l'aperçu de la carte des clients, le QR code du comptoir (PNG, affiche A5 / A6) et le lien d'inscription. */
export default function MaCarte({ me, guard, say }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [soon, setSoon] = useState(false);
  const [format, setFormat] = useState("A5");
  const [printing, setPrinting] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await api("card");
    if (!guard(r)) return;
    if (r.unavailable) return setSoon(true);
    if (!r.ok) return setError(r.error || "Impossible de charger votre carte.");
    setData(r);
  }, [guard]);
  useEffect(() => { load(); }, [load]);

  // Impression de l'affiche : seule l'affiche est imprimée, au format choisi
  useEffect(() => {
    if (!printing) return;
    const style = document.createElement("style");
    style.id = "ec-page-size";
    style.textContent = `@page { size: ${format} portrait; margin: 0; }`;
    document.head.appendChild(style);
    document.documentElement.classList.add("ec-printing");
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    const t = setTimeout(() => { try { window.print(); } catch {} }, 150);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", done);
      style.remove();
      document.documentElement.classList.remove("ec-printing");
    };
  }, [printing, format]);

  if (soon) {
    return (
      <div className="ec-panel">
        <section className="ec-box">
          <h2 className="ec-h">Votre carte de fidélité</h2>
          {me.program && <p className="muted">{programLine(me.program)}</p>}
          <p className="ec-info">L'aperçu de votre carte et votre QR code du comptoir (à télécharger ou imprimer) arrivent très bientôt ici. En attendant, Walty peut vous renvoyer votre affiche : {site.contact.phone}.</p>
        </section>
      </div>
    );
  }
  if (error) return <div className="ec-panel"><p className="ec-alert">{error}</p></div>;
  if (!data) return <div className="ec-panel"><div className="ec-spinner ec-spinner-sm" aria-label="Chargement" /></div>;

  const name = data.business.name;
  const card = data.card;
  const slug = fileSlug(name);
  const w = data.wallets;
  const totalCards = w.apple + w.google + w.web + w.none;
  const shareText = `Rejoignez la carte de fidélité ${name} : c'est gratuit, dans votre téléphone.`;

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: `Carte de fidélité ${name}`, text: shareText, url: data.signupUrl }); return; } catch (e) { if (e?.name === "AbortError") return; }
    }
    say((await copyText(data.signupUrl)) ? "Lien copié ✓" : "Copie impossible : sélectionnez le lien à la main.");
  }
  async function posterPng() {
    setBusy(true);
    try {
      const url = await drawPoster({ name, logo: data.business.logo_data, pitch: card?.pitch, colors: card?.colors, qr: data.qrPng });
      download(url, `affiche-${slug}.png`);
      say("Affiche téléchargée ✓");
    } catch {
      say("Impossible de fabriquer l'image. Utilisez « Imprimer l'affiche ».");
    }
    setBusy(false);
  }

  return (
    <div className="ec-panel">
      <div className="ec-carte-grid">
        <section className="ec-box">
          <div className="ec-box-head">
            <h2 className="ec-h">Votre carte, côté client</h2>
            {card && !card.isActive && <span className="chip chip-orange">En pause</span>}
          </div>
          {card ? <WalletPreview name={name} logo={data.business.logo_url} card={card} /> : <p className="ec-info">Votre carte n'est pas encore créée. Contactez Walty.</p>}
          {card && <p className="field-hint ec-center-text">Exemple avec une cliente, Marie, à mi-parcours. La vraie carte s'affiche dans Apple Wallet (iPhone) ou Google Wallet (Android).</p>}
          {totalCards > 0 && (
            <ul className="ec-facts">
              <li><span><Icon name="phone" size={16} /> Cartes dans un iPhone</span><b>{w.apple}</b></li>
              <li><span><Icon name="phone" size={16} /> Cartes dans un Android</span><b>{w.google}</b></li>
              {w.web > 0 && <li><span><Icon name="wallet" size={16} /> Cartes web</span><b>{w.web}</b></li>}
              {w.none > 0 && <li><span><Icon name="clock" size={16} /> Inscrits, carte pas encore ajoutée</span><b>{w.none}</b></li>}
            </ul>
          )}
        </section>

        <section className="ec-box" aria-labelledby="ec-qr-h">
          <h2 id="ec-qr-h" className="ec-h">QR code du comptoir</h2>
          <p className="muted ec-small">Vos clients le scannent avec leur téléphone pour obtenir la carte. Posez-le près de la caisse, sur la vitrine ou sur les tables.</p>
          <div className="ec-poster-wrap">
            <Poster name={name} logo={data.business.logo_url} pitch={card?.pitch} colors={card?.colors} qr={data.qrPng} />
          </div>
          <div className="ec-actions">
            <button className="btn btn-primary" onClick={() => download(data.qrPng, `qr-code-${slug}.png`)}><Icon name="download" size={18} /> QR code seul (PNG)</button>
            <button className="btn btn-dark" disabled={busy} onClick={posterPng}><Icon name="image" size={18} /> {busy ? "Préparation…" : "Affiche (PNG)"}</button>
          </div>
          <fieldset className="field wiz-fieldset">
            <legend>Imprimer l'affiche</legend>
            <div className="ec-inline ec-print-line">
              <div className="ec-seg" role="radiogroup" aria-label="Format de l'affiche">
                {["A5", "A6"].map((f) => (
                  <label key={f}><input type="radio" name="ec-format" checked={format === f} onChange={() => setFormat(f)} /><span>{f}{f === "A5" ? " (comptoir)" : " (petit)"}</span></label>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={() => setPrinting(true)}><Icon name="file" size={18} /> Imprimer</button>
            </div>
            <span className="field-hint">Astuce : dans la fenêtre d'impression, choisissez « Enregistrer au format PDF » pour garder un fichier, et cochez « Graphiques d'arrière-plan » pour garder les couleurs.</span>
          </fieldset>
        </section>
      </div>

      <section className="ec-box" aria-labelledby="ec-link-h">
        <h2 id="ec-link-h" className="ec-h">Lien d'inscription à partager</h2>
        <p className="muted ec-small">Le même lien que le QR code : envoyez-le par SMS, WhatsApp, ou mettez-le sur Instagram et Google.</p>
        <div className="ec-copy">
          <input className="input" readOnly value={data.signupUrl} onFocus={(e) => e.target.select()} aria-label="Lien d'inscription" />
          <button className="btn btn-dark" onClick={async () => say((await copyText(data.signupUrl)) ? "Lien copié ✓" : "Copie impossible : sélectionnez le lien à la main.")}>Copier</button>
        </div>
        <div className="ec-actions">
          <button className="btn btn-ghost" onClick={share}><Icon name="arrow" size={18} /> Partager</button>
          <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${data.signupUrl}`)}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> WhatsApp</a>
          <a className="btn btn-ghost" href={data.signupUrl} target="_blank" rel="noopener noreferrer"><Icon name="phone" size={18} /> Voir la page</a>
        </div>
      </section>

      {data.rules?.length > 0 && (
        <section className="ec-box">
          <h2 className="ec-h">Ce que lisent vos clients</h2>
          <p className="muted ec-small">Les règles affichées au dos de leur carte (à modifier dans « Mon programme »).</p>
          <ul className="ec-rules">
            {data.rules.map((r) => <li key={r.title}><span aria-hidden="true">{r.icon}</span><div><b>{r.title}</b><p>{r.text}</p></div></li>)}
          </ul>
        </section>
      )}

      {printing && createPortal(
        <div className={`ec-print-root ec-print-${format}`} aria-hidden="true">
          <Poster name={name} logo={data.business.logo_url} pitch={card?.pitch} colors={card?.colors} qr={data.qrPng} print />
        </div>,
        document.body,
      )}
    </div>
  );
}

/** Aperçu de la carte telle qu'elle apparaît dans le téléphone du client. */
function WalletPreview({ name, logo, card }) {
  const { colors, labels, sample } = card;
  return (
    <div className="ec-wallet" style={{ background: colors.background, color: colors.foreground }} role="img" aria-label={`Aperçu de la carte ${card.programName}`}>
      <div className="ec-wallet-top">
        <span className="ec-wallet-logo">{logo ? <img src={logo} alt="" /> : <i>{initials(name)}</i>}</span>
        {card.showLogoText && <b className="ec-wallet-name">{name}</b>}
        <span className="ec-wallet-field right">
          <em style={{ color: colors.label }}>{labels.balance}</em>
          <strong>{sample.balanceValue}</strong>
        </span>
      </div>
      {card.strip ? <img className="ec-wallet-strip" src={card.strip} alt="" /> : <div className="ec-wallet-strip ec-wallet-strip-empty" />}
      <div className="ec-wallet-fields">
        <span className="ec-wallet-field"><em style={{ color: colors.label }}>{labels.customer}</em><strong>{sample.name}</strong></span>
        {card.reward && labels.reward && <span className="ec-wallet-field right"><em style={{ color: colors.label }}>{labels.reward}</em><strong>{card.reward}</strong></span>}
      </div>
      <div className="ec-wallet-qr"><span><Icon name="qr" size={54} stroke={1.4} /></span><small>QR code personnel du client</small></div>
    </div>
  );
}

/** L'affiche du comptoir (écran et impression). */
function Poster({ name, logo, pitch, colors, qr, print = false }) {
  const bg = colors?.background || "#0B6474";
  const fg = colors?.foreground || "#FFFFFF";
  return (
    <div className={`ec-poster ${print ? "is-print" : ""}`} style={{ background: bg, color: fg }}>
      {logo ? <img className="ec-poster-logo" src={logo} alt="" /> : <span className="ec-poster-logo ec-poster-initials">{initials(name)}</span>}
      <b className="ec-poster-name">{name}</b>
      <span className="ec-poster-title">Votre carte de fidélité est ici</span>
      {pitch && <span className="ec-poster-pitch">{pitch} 🎁</span>}
      <span className="ec-poster-qr"><img src={qr} alt="QR code d'inscription à la carte de fidélité" /></span>
      <ol className="ec-poster-steps">{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
      <span className="ec-poster-foot">Gratuit · Aucune application à installer · iPhone et Android</span>
    </div>
  );
}

/* ───────── Affiche en image (PNG, format A5 à 150 points par pouce) ───────── */
const loadImg = (src) => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
function wrap(g, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
async function drawPoster({ name, logo, pitch, colors, qr }) {
  const W = 1240, H = 1748;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const fg = colors?.foreground || "#FFFFFF";
  g.fillStyle = colors?.background || "#0B6474";
  g.fillRect(0, 0, W, H);
  g.textAlign = "center";
  g.fillStyle = fg;
  const font = (w, s) => `${w} ${s}px "Manrope Variable", "Segoe UI", system-ui, sans-serif`;
  let y = 110;
  const box = (x, yy, w, h, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, yy, w, h, r); else g.rect(x, yy, w, h); g.fill(); };
  if (logo) {
    try {
      const img = await loadImg(logo);
      g.fillStyle = "#FFFFFF";
      box(W / 2 - 110, y, 220, 220, 40);
      const s = Math.min(180 / img.width, 180 / img.height);
      g.drawImage(img, W / 2 - (img.width * s) / 2, y + 110 - (img.height * s) / 2, img.width * s, img.height * s);
      y += 270;
    } catch { /* sans logo */ }
  }
  g.fillStyle = fg;
  g.font = font(800, 78);
  for (const l of wrap(g, name, W - 160)) { y += 84; g.fillText(l, W / 2, y); }
  y += 74;
  g.font = font(600, 50);
  g.fillText("Votre carte de fidélité est ici", W / 2, y);
  if (pitch) {
    g.font = font(800, 44);
    for (const l of wrap(g, `${pitch} 🎁`, W - 200)) { y += 62; g.fillText(l, W / 2, y); }
  }
  y += 50;
  const qrImg = await loadImg(qr);
  const Q = 640;
  g.fillStyle = "#FFFFFF";
  box(W / 2 - Q / 2 - 24, y, Q + 48, Q + 48, 44);
  g.drawImage(qrImg, W / 2 - Q / 2, y + 24, Q, Q);
  y += Q + 48 + 80;
  g.fillStyle = fg;
  g.font = font(700, 38);
  g.textAlign = "left";
  const left = 230;
  STEPS.forEach((s, i) => { g.fillText(`${i + 1}. ${s}`, left, y + i * 56); });
  y += STEPS.length * 56 + 40;
  g.textAlign = "center";
  g.globalAlpha = 0.8;
  g.font = font(600, 30);
  g.fillText("Gratuit · Aucune application à installer · iPhone et Android", W / 2, Math.min(H - 60, y));
  g.globalAlpha = 1;
  return c.toDataURL("image/png");
}
