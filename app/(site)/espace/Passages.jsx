"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { fmtDateTime, fmtTime } from "./outils";

const TONE = {
  stamp: "visit",
  purchase: "visit",
  reward_redeemed: "reward",
  points_redeemed: "reward",
  cashback_used: "reward",
  coupon_used: "reward",
  correction: "bonus",
};
const ICON = { visit: "stamp", reward: "gift", bonus: "sparkle" };

/**
 * Liste de passages (historique du jour, fiche client, accueil).
 * Un passage annulable (tampon ou achat de moins de 10 minutes, fait avec cet accès) a son bouton « Annuler ».
 * Un passage fait par le gérant SANS scanner la carte porte le badge « ajouté à la main » (et « hors limite » + la raison).
 */
export function EventList({ events, openClient, onUndo, compact = false, showDate = false, showCustomer = true }) {
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  return (
    <ul className={`ec-events ${compact ? "compact" : ""}`}>
      {events.map((e) => {
        const tone = TONE[e.type] || "bonus";
        return (
          <li key={e.id} className={e.undone_at ? "is-undone" : ""}>
            <span className={`ec-ev-icon ${tone}`}><Icon name={ICON[tone]} size={18} /></span>
            <div className="ec-ev-main">
              <div className="ec-ev-line">
                <b>{e.label}</b>
                {showCustomer && e.customer && (
                  openClient && e.customer_id
                    ? <button className="ec-ev-who" onClick={() => openClient(e.customer_id)}>{e.customer}</button>
                    : <span className="ec-ev-who">{e.customer}</span>
                )}
              </div>
              <span className="ec-ev-detail">
                {[e.detail, compact ? null : e.manual?.by || e.by].filter(Boolean).join(" · ")}
                {e.undone_at && <em> · annulé à {fmtTime(e.undone_at)}</em>}
              </span>
              {e.manual && (
                <span className="ec-ev-badges">
                  <span className="chip chip-violet">Ajouté à la main</span>
                  {e.manual.over_limit && <span className="chip chip-orange">Hors limite</span>}
                  {e.manual.over_limit && e.manual.reason && !compact && <span className="ec-ev-reason">Raison : {e.manual.reason}</span>}
                </span>
              )}
            </div>
            <div className="ec-ev-side">
              <time dateTime={e.at}>{showDate ? fmtDateTime(e.at) : fmtTime(e.at)}</time>
              {e.undone_at && <span className="chip">Annulé</span>}
              {onUndo && e.undoable && !e.undone_at && (
                confirm === e.id ? (
                  <span className="ec-ev-confirm">
                    <button className="btn btn-primary btn-sm" disabled={busy} onClick={async () => { setBusy(true); await onUndo(e); setBusy(false); setConfirm(null); }}>{busy ? "…" : "Oui, annuler"}</button>
                    <button className="ec-linkbtn" onClick={() => setConfirm(null)}>Non</button>
                  </span>
                ) : (
                  <button className="ec-linkbtn ec-undo" onClick={() => setConfirm(e.id)}>Annuler</button>
                )
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
