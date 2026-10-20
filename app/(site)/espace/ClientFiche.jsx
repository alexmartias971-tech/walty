"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { api, euro, fmtAgo, fmtDate, fmtLongDate, initials, post } from "./outils";
import { EventList } from "./Passages";

/** Fiche d'un client : état de sa carte, ses chiffres, ses offres et son historique. */
export default function ClientFiche({ id, row, guard, say, onBack, readOnly = false, badges = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [soon, setSoon] = useState(false);

  const load = useCallback(async () => {
    const [r, m] = await Promise.all([
      api(`customer?id=${encodeURIComponent(id)}`),
      badges ? api(`manual-log?customer=${encodeURIComponent(id)}`) : null,
    ]);
    if (!guard(r)) return;
    if (r.unavailable) return setSoon(true);
    if (!r.ok) return setError(r.error || "Impossible de charger ce client.");
    setError("");
    const items = m?.ok ? m.items || {} : {};
    setData({ ...r, history: (r.history || []).map((e) => (items[e.id] ? { ...e, manual: items[e.id] } : e)) });
  }, [id, guard, badges]);
  useEffect(() => { setData(null); setSoon(false); load(); }, [load]);

  async function undo(e) {
    const r = await post("history", { action: "undo", event_id: e.id });
    if (!guard(r)) return;
    say(r.ok ? r.done || "Passage annulé ✓" : r.error || "Annulation impossible.");
    load();
  }

  const c = data?.customer;
  const card = data?.card;
  const name = c ? `${c.first_name} ${c.last_name || ""}`.trim() : row ? `${row.first_name} ${row.last_name || ""}`.trim() : "";

  return (
    <div className="ec-panel ec-fiche">
      <button className="ec-back" onClick={onBack}><Icon name="arrow" size={18} className="flip" /> Tous les clients</button>

      <section className="ec-card">
        <div className="ec-card-head">
          <span className="ec-avatar">{initials(name)}</span>
          <div>
            <h2>{name || "Client"}</h2>
            {card?.tier && <p className="ec-tier"><Icon name="crown" size={14} /> Niveau {card.tier.name}{card.tier.perk ? ` · ${card.tier.perk}` : ""}</p>}
            {!card && row?.tier && <p className="ec-tier"><Icon name="crown" size={14} /> Niveau {row.tier}</p>}
          </div>
        </div>

        {soon && row && (
          <>
            <div className="ec-balance"><span>SOLDE</span><b>{row.balance}</b></div>
            <ul className="ec-facts">
              {row.phone && <li><span>Téléphone</span><b><a href={`tel:${row.phone.replace(/[^\d+]/g, "")}`}>{row.phone}</a></b></li>}
              {row.email && <li><span>E-mail</span><b>{row.email}</b></li>}
              <li><span>Dernier passage</span><b>{fmtAgo(row.last_visit_at)}</b></li>
              <li><span>Accepte les offres et messages</span><b>{row.marketing_optin ? "Oui" : "Non"}</b></li>
            </ul>
            <p className="ec-info">La fiche détaillée (historique, offres, chiffres du client) arrive très bientôt.</p>
          </>
        )}
        {error && <p className="ec-alert">{error}</p>}
        {!data && !soon && !error && <div className="ec-spinner ec-spinner-sm" aria-label="Chargement" />}

        {card && (
          <>
            <div className="ec-balance">
              <span>{card.balance_label}</span>
              <b>{card.balance_value}</b>
            </div>
            {card.stamps && (
              <div className="ec-dots" role="img" aria-label={`${card.stamps.filled} tampons sur ${card.stamps.total}`}>
                {Array.from({ length: card.stamps.total }).map((_, i) => <i key={i} className={i < card.stamps.filled ? "on" : ""} />)}
              </div>
            )}
            {card.reward_ready && <p className="ec-ok"><Icon name="gift" size={18} /> Cadeau débloqué : <b>{card.reward}</b> — à remettre au prochain passage (scannez sa carte).</p>}
            <p className="muted ec-small ec-center-text">{card.sentence}</p>
            {card.next_tier && <p className="field-hint ec-center-text">Niveau {card.next_tier.name} dans {card.next_tier.remaining}.</p>}
            {card.streak && <p className="ec-small ec-center-text">🔥 Série : {card.streak.count} semaine{card.streak.count > 1 ? "s" : ""} (record {card.streak.best})</p>}
            {card.best_lap && <p className="ec-small ec-center-text">⏱️ Record : {card.best_lap}{card.rank ? ` · P${card.rank.pos} / ${card.rank.total}` : ""}</p>}
          </>
        )}
      </section>

      {c && card && (
        <div className="ec-two">
          <section className="ec-box">
            <h3>Ses chiffres</h3>
            <ul className="ec-facts">
              <li><span>Passages au total</span><b>{card.lifetime_visits}</b></li>
              {card.mode === "stamps" && <li><span>Cadeaux obtenus / remis</span><b>{card.rewards_earned} / {card.rewards_redeemed}</b></li>}
              {card.mode !== "stamps" && <li><span>Achats enregistrés</span><b>{euro(card.lifetime_spent)}</b></li>}
              {card.mode === "points" && <li><span>Points gagnés au total</span><b>{card.lifetime_points}</b></li>}
              {card.mode === "cashback" && <li><span>Cagnotte disponible</span><b>{euro(card.cashback)}</b></li>}
              <li><span>Dernier passage</span><b>{fmtAgo(c.last_visit_at)}</b></li>
              <li><span>Client depuis le</span><b>{fmtLongDate(c.created_at)}</b></li>
            </ul>
          </section>
          <section className="ec-box">
            <h3>Contact</h3>
            <ul className="ec-facts">
              {c.phone && <li><span>Téléphone</span><b><a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a></b></li>}
              {c.email && <li><span>E-mail</span><b className="ec-break"><a href={`mailto:${c.email}`}>{c.email}</a></b></li>}
              {c.birthday && <li><span>Anniversaire</span><b>{c.birthday}</b></li>}
              <li><span>Accepte les offres et messages</span><b>{c.marketing_optin ? "Oui" : "Non"}</b></li>
              <li><span>Sa carte</span><b>{card.wallet}</b></li>
            </ul>
          </section>
        </div>
      )}

      {card?.coupons?.length > 0 && (
        <section className="ec-box">
          <h3>Offres sur sa carte</h3>
          <ul className="ec-facts">
            {card.coupons.map((k, i) => (
              <li key={i}><span><Icon name="ticket" size={16} /> {k.title}</span><b>{k.expires_at ? `jusqu'au ${fmtDate(k.expires_at)}` : "sans limite"}</b></li>
            ))}
          </ul>
          <p className="field-hint">Elles se valident en caisse, en scannant sa carte.</p>
        </section>
      )}

      {data && (
        <section className="ec-box">
          <h3>Son historique</h3>
          {data.history.length === 0 ? <p className="muted ec-small">Pas encore de passage.</p> : <EventList events={data.history} onUndo={readOnly ? null : undo} showDate showCustomer={false} />}
        </section>
      )}
      {c && <p className="field-hint">Ce client souhaite que ses données soient supprimées ou exportées (RGPD) ? Transmettez sa demande à Walty, qui s'en occupe.</p>}
    </div>
  );
}
