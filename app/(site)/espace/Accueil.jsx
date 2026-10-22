"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { euro, fmtDay, gpToday, peek, programLine, swr, TZ } from "./outils";
import { EventList } from "./Passages";
import { SkelKpis } from "./Squelette";

/**
 * Accueil de l'espace : les chiffres du jour, le gros bouton « Scanner une carte »,
 * les derniers passages et les raccourcis vers les autres rubriques.
 * Formule Essentiel : les chiffres simples de la liste des clients (pas de « stats »), pas de messages ni d'offres,
 * et la carte « Passer au Tout compris » (upgrade).
 */
const monthOf = (s) => ({ visits: s.stats.visitsThisMonth, newCustomers: s.stats.newThisMonth, rewards: s.stats.rewardsThisMonth, total: s.stats.total, active30: s.stats.active30 });

export default function Accueil({ me, today, refreshToday, guard, go, goScan, openClient, features, essentiel = false, upgrade = null }) {
  // Déjà en mémoire (retour sur l'accueil) : affiché tout de suite, puis remis à jour
  const [month, setMonth] = useState(() => { const s = !essentiel && peek("stats"); return s?.ok ? monthOf(s) : null; });
  const [remaining, setRemaining] = useState(() => peek("notifications")?.remaining ?? null);

  useEffect(() => {
    refreshToday();
  }, [refreshToday]);

  useEffect(() => {
    let live = true;
    // Le mois en cours (adresse « stats ») et les messages restants : demandés EN MÊME TEMPS
    const notif = me.canNotify && !essentiel
      ? swr("notifications", (n) => { if (live && n.ok) setRemaining(n.remaining); })
      : null;
    (async () => {
      const s = essentiel ? { ok: false, unavailable: true } : await swr("stats", (x) => { if (live && x.ok) setMonth(monthOf(x)); });
      if (!live || !guard(s)) return;
      if (!s.ok && (s.unavailable || s.upgrade)) {
        // Formule Essentiel (ou ancienne version) : les chiffres simples de la liste des clients
        await swr("customers?q=", (c) => {
          if (live && guard(c) && c.ok) setMonth({ visits: c.stats.stampsThisMonth, newCustomers: null, rewards: c.stats.rewardsRedeemed, total: c.stats.total, basic: true });
        });
      }
      await notif;
    })();
    return () => { live = false; };
  }, [guard, me.canNotify, essentiel]);

  const hour = Number(new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "numeric", hour12: false }).format(new Date()));
  const hello = hour >= 18 || hour < 4 ? "Bonsoir" : "Bonjour";
  const sum = today?.summary;
  const mode = me.program?.mode;
  const max = me.maxNotificationsPerWeek;
  const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: TZ }).format(new Date());

  return (
    <div className="ec-panel ec-home">
      <section className="ec-hello">
        <div>
          <p className="ec-kicker">{fmtDay(gpToday())}</p>
          <h1 className="ec-hello-title">{hello}{me.business?.name ? `, ${me.business.name}` : ""} 👋</h1>
          {me.program && <p className="muted ec-small">Votre carte : <b>{programLine(me.program)}</b>{me.program.is_active === false ? " · en pause" : ""}</p>}
        </div>
      </section>

      <button onClick={goScan} className="ec-scan-big ec-scan-home">
        <span className="ec-scan-icon"><Icon name="qr" size={40} stroke={1.8} /></span>
        <b>Scanner une carte</b>
        <span>Tampon, achat, cadeau ou offre : visez le QR code du client</span>
      </button>

      <section className="ec-box" aria-labelledby="ec-today-h">
        <div className="ec-box-head">
          <h2 id="ec-today-h" className="ec-h">Aujourd'hui</h2>
          {features.v13 && <button className="ec-linkbtn" onClick={() => go("historique")}>Tout l'historique</button>}
        </div>
        {sum ? (
          <div className="ec-kpis">
            <Tile label="Passages" value={sum.visits} />
            <Tile label="Nouveaux clients" value={sum.newCustomers} />
            <Tile label="Récompenses remises" value={sum.rewards} />
            {mode && mode !== "stamps" ? <Tile label="Achats enregistrés" value={euro(sum.sales)} /> : <Tile label="Clients venus" value={sum.customers} />}
          </div>
        ) : features.v13 === false ? (
          <p className="muted ec-small">Le détail de la journée arrive bientôt ici. En attendant, vos chiffres du mois sont ci-dessous.</p>
        ) : (
          <div role="status" aria-label="Chargement"><SkelKpis n={4} /></div>
        )}
        {today?.events?.length > 0 && (
          <>
            <h3 className="ec-sub">Derniers passages</h3>
            <EventList events={today.events.slice(0, 5)} openClient={openClient} compact />
          </>
        )}
        {today && today.events?.length === 0 && <p className="muted ec-small">Pas encore de passage aujourd'hui. Le premier client arrive bientôt ✨</p>}
      </section>

      {month && (
        <section className="ec-box">
          <div className="ec-box-head">
            <h2 className="ec-h">En {monthName}</h2>
            {!essentiel && <button className="ec-linkbtn" onClick={() => go("chiffres")}>Voir mes chiffres</button>}
          </div>
          <div className="ec-kpis">
            <Tile label="Passages" value={month.visits} />
            {month.newCustomers != null && <Tile label="Nouveaux clients" value={month.newCustomers} />}
            <Tile label={month.basic ? "Récompenses (total)" : "Récompenses remises"} value={month.rewards} />
            <Tile label="Clients inscrits" value={month.total} />
          </div>
        </section>
      )}

      <nav className="ec-shortcuts" aria-label="Raccourcis">
        <button onClick={() => go("carte")}><Icon name="qr" size={22} /><b>Mon QR code comptoir</b><span>Affiche à imprimer, lien d'inscription</span></button>
        {me.canNotify && !essentiel && (
          <button onClick={() => go("notifs")}>
            <Icon name="bell" size={22} /><b>Envoyer un message</b>
            <span>{remaining == null ? "Notification à vos clients" : max ? `${Math.max(0, max - remaining)} / ${max} envoyés cette semaine` : `Il vous en reste ${remaining} cette semaine`}</span>
          </button>
        )}
        {me.canNotify && !me.basic && !essentiel && <button onClick={() => go("offres")}><Icon name="gift" size={22} /><b>Créer une offre</b><span>Ex. : -20 % ce week-end</span></button>}
        <button onClick={() => go("programme")}><Icon name="edit" size={22} /><b>Mon programme</b><span>Cadeau, offres de bienvenue, heures boostées</span></button>
      </nav>
      {upgrade}
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="ec-kpi">
      <b>{value ?? "—"}</b>
      <span>{label}</span>
    </div>
  );
}
