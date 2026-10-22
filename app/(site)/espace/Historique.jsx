"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { site } from "@/lib/site.config";
import { afterVisitChange, euro, fmtDay, getFresh, gpToday, peek, post, shiftDay } from "./outils";
import ExportButton from "./Export";
import { EventList } from "./Passages";
import { SkelList } from "./Squelette";

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "visits", label: "Passages" },
  { id: "rewards", label: "Récompenses" },
  { id: "bonus", label: "Bonus et retraits" },
  { id: "undone", label: "Annulés" },
];

/** Badges « ajouté à la main » / « hors limite » / « retiré par le gérant » posés sur les passages. */
const withBadges = (r, m) => {
  const items = m?.ok ? m.items || {} : {};
  return { ...r, events: r.events.map((e) => (items[e.id] ? { ...e, manual: items[e.id] } : e)) };
};

/**
 * Historique des passages, jour par jour, avec filtres et annulation (10 minutes). Gérant : « Exporter en Excel ».
 * La journée déjà vue (ou pré-chargée à la connexion) s'affiche tout de suite, puis se met à jour.
 */
export default function Historique({ guard, say, openClient, mode, onChanged, badges = false, exportable = false }) {
  const today = gpToday();
  const [day, setDay] = useState(today);
  const [type, setType] = useState("all");
  const keys = (d, t) => [`history?day=${d}&type=${t}`, `manual-log?day=${d}`];
  const [data, setData] = useState(() => { const [hk, mk] = keys(today, "all"); const h = peek(hk); return h ? withBadges(h, peek(mk)) : null; });
  const [error, setError] = useState("");
  const [soon, setSoon] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const [hk, mk] = [`history?day=${day}&type=${type}`, `manual-log?day=${day}`];
    // en mémoire : affiché tout de suite
    const cached = peek(hk);
    if (cached) setData(withBadges(cached, badges ? peek(mk) : null));
    const [r, m] = await Promise.all([getFresh(hk), badges ? getFresh(mk) : null]);
    if (!guard(r)) return;
    if (r.unavailable) return setSoon(true);
    if (!r.ok) return setError(r.error || "Impossible de charger l'historique.");
    setData(withBadges(r, m));
  }, [day, type, guard, badges]);
  useEffect(() => {
    if (!peek(`history?day=${day}&type=${type}`)) setData(null);
    load();
  }, [load, day, type]);

  async function undo(e) {
    const r = await post("history", { action: "undo", event_id: e.id });
    if (!guard(r)) return;
    say(r.ok ? r.done || "Passage annulé ✓" : r.error || "Annulation impossible.");
    afterVisitChange();
    load();
    onChanged?.();
  }

  if (soon) {
    return (
      <div className="ec-panel">
        <p className="ec-info">L'historique détaillé des passages arrive très bientôt dans votre espace. En attendant, la fiche de chaque client est dans « Clients », et Walty peut vous envoyer l'historique : {site.contact.phone}.</p>
      </div>
    );
  }

  const s = data?.summary;
  return (
    <div className="ec-panel">
      <div className="ec-daynav">
        <button className="ec-iconbtn" aria-label="Jour précédent" onClick={() => setDay(shiftDay(day, -1))}><Icon name="arrow" size={18} className="flip" /></button>
        <label className="ec-daypick">
          <span>{day === today ? "Aujourd'hui" : fmtDay(day)}</span>
          <input type="date" value={day} max={today} onChange={(e) => e.target.value && setDay(e.target.value > today ? today : e.target.value)} aria-label="Choisir un jour" />
        </label>
        <button className="ec-iconbtn" aria-label="Jour suivant" disabled={day >= today} onClick={() => setDay(shiftDay(day, 1))}><Icon name="arrow" size={18} /></button>
        {day !== today && <button className="ec-linkbtn" onClick={() => setDay(today)}>Revenir à aujourd'hui</button>}
      </div>

      {s && (
        <div className="ec-kpis">
          <div className="ec-kpi"><b>{s.visits}</b><span>Passages</span></div>
          <div className="ec-kpi"><b>{s.rewards}</b><span>Récompenses</span></div>
          <div className="ec-kpi"><b>{s.newCustomers}</b><span>Nouveaux clients</span></div>
          {mode && mode !== "stamps"
            ? <div className="ec-kpi"><b>{euro(s.sales)}</b><span>Achats enregistrés</span></div>
            : <div className="ec-kpi"><b>{s.undone}</b><span>Passages annulés</span></div>}
        </div>
      )}

      <div className="ec-seg ec-filters" role="radiogroup" aria-label="Filtrer l'historique">
        {FILTERS.map((f) => (
          <label key={f.id}><input type="radio" name="ec-hfilter" checked={type === f.id} onChange={() => setType(f.id)} /><span>{f.label}</span></label>
        ))}
      </div>

      {error && <p className="ec-alert">{error}</p>}
      <section className="ec-box">
        {!data && !error && <div role="status" aria-label="Chargement"><SkelList rows={5} /></div>}
        {data && data.events.length === 0 && (
          <div className="esp-empty"><Icon name="clock" size={26} /><p>{type === "all" ? "Aucun passage ce jour-là." : "Rien à afficher avec ce filtre."}</p></div>
        )}
        {data && data.events.length > 0 && <EventList events={data.events} openClient={openClient} onUndo={undo} />}
        {data?.more && <p className="field-hint ec-center-text">Les {data.events.length} passages les plus récents de la journée sont affichés.</p>}
      </section>
      {exportable && <ExportButton type="passages" label="Exporter tous les passages (Excel)" guard={guard} say={say} />}
      <p className="field-hint">Une erreur ? Un tampon ou un achat s'annule pendant 10 minutes, avec l'accès qui l'a enregistré (bouton « Annuler »). Au-delà, le gérant peut retirer un tampon depuis la fiche du client (« Retirer 1 tampon », avec une raison). Besoin d'aide : {site.contact.phone}.</p>
    </div>
  );
}
