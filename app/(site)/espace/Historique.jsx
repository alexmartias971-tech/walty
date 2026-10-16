"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { site } from "@/lib/site.config";
import { api, euro, fmtDay, gpToday, post, shiftDay } from "./outils";
import { EventList } from "./Passages";

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "visits", label: "Passages" },
  { id: "rewards", label: "Récompenses" },
  { id: "bonus", label: "Bonus" },
  { id: "undone", label: "Annulés" },
];

/** Historique des passages, jour par jour, avec filtres et annulation (10 minutes). */
export default function Historique({ guard, say, openClient, mode, onChanged }) {
  const today = gpToday();
  const [day, setDay] = useState(today);
  const [type, setType] = useState("all");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [soon, setSoon] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const r = await api(`history?day=${day}&type=${type}`);
    if (!guard(r)) return;
    if (r.unavailable) return setSoon(true);
    if (!r.ok) return setError(r.error || "Impossible de charger l'historique.");
    setData(r);
  }, [day, type, guard]);
  useEffect(() => { setData(null); load(); }, [load]);

  async function undo(e) {
    const r = await post("history", { action: "undo", event_id: e.id });
    if (!guard(r)) return;
    say(r.ok ? r.done || "Passage annulé ✓" : r.error || "Annulation impossible.");
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
        {!data && !error && <div className="ec-spinner ec-spinner-sm" aria-label="Chargement" />}
        {data && data.events.length === 0 && (
          <div className="esp-empty"><Icon name="clock" size={26} /><p>{type === "all" ? "Aucun passage ce jour-là." : "Rien à afficher avec ce filtre."}</p></div>
        )}
        {data && data.events.length > 0 && <EventList events={data.events} openClient={openClient} onUndo={undo} />}
        {data?.more && <p className="field-hint ec-center-text">Les {data.events.length} passages les plus récents de la journée sont affichés.</p>}
      </section>
      <p className="field-hint">Une erreur ? Un tampon ou un achat s'annule pendant 10 minutes, avec l'accès qui l'a enregistré (bouton « Annuler »). Au-delà, appelez Walty au {site.contact.phone}.</p>
    </div>
  );
}
