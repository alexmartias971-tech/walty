"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Logo, { LogoMark } from "@/components/Logo";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import { plans, planById } from "@/lib/offer";
import WalletCard, { cardFromConfig } from "@/components/WalletCard";
import { programById, programDisplay } from "@/lib/programs";
import {
  isDemo, STAGES, stageById, SECTORS, COMMUNES,
  getSession, signIn, signOut, listAccounts, saveAccount, deleteAccount, resetDemo, computeMrr, toCsv, listPushRequests, markPushSent,
} from "@/lib/store";

const eur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: Number(n) % 1 ? 2 : 0 }).format(Number(n) || 0);
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => (d ? new Date(d.length === 10 ? d + "T12:00:00" : d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "");
const waLink = (phone) => {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "590" + d.slice(1); // numéros de Guadeloupe
  return `https://wa.me/${d}`;
};

export default function AdminApp() {
  const [session, setSession] = useState(undefined);
  useEffect(() => { getSession().then(setSession); }, []);
  if (session === undefined) return <div className="login" />;
  if (!session) return <Login onDone={() => getSession().then(setSession)} />;
  return <Shell onLogout={async () => { await signOut(); setSession(null); }} />;
}

/* ───────────── Connexion ───────────── */
function Login({ onDone }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const fd = new FormData(e.currentTarget);
    try { await signIn(fd.get("email"), fd.get("password")); onDone(); }
    catch (x) { setErr(x.message); setBusy(false); }
  }
  return (
    <main className="login">
      <div className="orb orb-violet" style={{ width: 600, height: 600, left: "-10%", top: "-20%" }} />
      <div className="orb orb-orange" style={{ width: 500, height: 500, right: "-10%", bottom: "-20%", opacity: 0.4 }} />
      <div className="login-card glass">
        <Mascot pose="wave" size={170} title="Walti vous accueille" />
        <div className="center" style={{ display: "grid", gap: 8, justifyItems: "center" }}>
          <Logo size={36} />
          <h1 className="display-s" style={{ marginTop: 8 }}>Espace administrateur</h1>
          <p className="muted" style={{ fontSize: 14 }}>Prospects, clients, relances et chiffres.</p>
        </div>
        {isDemo ? (
          <>
            <p className="notice">Mode démo : Supabase n'est pas encore branché. Les données sont fictives et restent dans ce navigateur.</p>
            <button className="btn btn-primary" onClick={async () => { await signIn(); onDone(); }}>Entrer dans la démo <span className="arrow"><Icon name="arrow" size={16} /></span></button>
          </>
        ) : (
          <form onSubmit={submit} className="stack" style={{ "--gap": "14px" }}>
            <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" className="input" required autoComplete="username" /></div>
            <div className="field"><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" className="input" required autoComplete="current-password" /></div>
            {err && <p className="notice" role="alert">{err}</p>}
            <button className="btn btn-primary" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
          </form>
        )}
        <Link href="/" className="faint center" style={{ fontSize: 13 }}>← Retour au site</Link>
      </div>
    </main>
  );
}

/* ───────────── Coque ───────────── */
function Shell({ onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null); // fiche ouverte (objet) ou {} pour nouveau
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");
  const [pushes, setPushes] = useState([]);

  const load = useCallback(async () => {
    try { setPushes(await listPushRequests()); } catch {}
    try { setList(await listAccounts()); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (["dashboard", "prospects", "clients", "notifications"].includes(h)) setTab(h);
  }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2400); return () => clearTimeout(t); } }, [toast]);

  const go = (t) => { setTab(t); history.replaceState(null, "", `#${t}`); };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((a) => [a.business, a.contact_name, a.city, a.sector, a.phone, a.email].some((v) => String(v || "").toLowerCase().includes(s)));
  }, [list, q]);

  async function save(acc) {
    try {
      const saved = await saveAccount(acc);
      setList((l) => {
        const i = l.findIndex((x) => x.id === saved.id);
        if (i >= 0) { const c = [...l]; c[i] = saved; return c; }
        return [saved, ...l];
      });
      setToast("Enregistré ✓");
      return saved;
    } catch (e) { setToast("Erreur : " + e.message); }
  }
  async function remove(id) {
    try { await deleteAccount(id); setList((l) => l.filter((x) => x.id !== id)); setOpen(null); setToast("Supprimé"); }
    catch (e) { setToast("Erreur : " + e.message); }
  }
  function exportCsv() {
    const blob = new Blob([toCsv(list)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `walti-contacts-${todayStr()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const counts = {
    prospects: list.filter((a) => ["nouveau", "contacte", "demo", "proposition"].includes(a.stage)).length,
    clients: list.filter((a) => a.stage === "client").length,
    pushes: pushes.filter((p) => p.status === "a_envoyer").length,
  };

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand"><LogoMark size={34} /><div><b style={{ fontFamily: "var(--f-display)" }}>walti</b><small>Admin</small></div></div>
        <nav className="adm-nav" aria-label="Admin">
          <button aria-current={tab === "dashboard" ? "page" : undefined} onClick={() => go("dashboard")}><Icon name="grid" size={18} /> Tableau de bord</button>
          <button aria-current={tab === "prospects" ? "page" : undefined} onClick={() => go("prospects")}><Icon name="kanban" size={18} /> Prospects <span className="count">{counts.prospects}</span></button>
          <button aria-current={tab === "clients" ? "page" : undefined} onClick={() => go("clients")}><Icon name="store" size={18} /> Clients <span className="count">{counts.clients}</span></button>
          <button aria-current={tab === "notifications" ? "page" : undefined} onClick={() => go("notifications")}><Icon name="bell" size={18} /> Notifications <span className={`count ${counts.pushes ? "hot" : ""}`}>{counts.pushes}</span></button>
          <button onClick={exportCsv}><Icon name="download" size={18} /> Exporter (CSV)</button>
          <button onClick={onLogout} className="adm-logout-m"><Icon name="logout" size={18} /> Déconnexion</button>
        </nav>
        <div className="adm-side-foot">
          <span className={`adm-mode ${isDemo ? "demo" : "live"}`}>{isDemo ? "● Mode démo (navigateur)" : "● Connecté à Supabase"}</span>
          {isDemo && <button className="btn btn-ghost btn-sm" onClick={() => { setList(resetDemo()); setToast("Démo réinitialisée"); }}>Réinitialiser la démo</button>}
          <Link href="/" className="btn btn-ghost btn-sm">Voir le site</Link>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-top">
          <div>
            <h1>{{ dashboard: "Tableau de bord", prospects: "Prospects", clients: "Clients", notifications: "Notifications à envoyer" }[tab]}</h1>
            <p>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}{isDemo ? " · données fictives" : ""}</p>
          </div>
          <div className="row" style={{ "--gap": "10px" }}>
            <label className="adm-search">
              <Icon name="search" size={16} />
              <span className="sr-only">Rechercher</span>
              <input className="input" placeholder="Rechercher un commerce…" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <button className="btn btn-primary btn-sm" onClick={() => setOpen({ stage: "nouveau", source: "terrain" })}><Icon name="plus" size={16} /> Nouveau</button>
          </div>
        </div>

        {error && <p className="notice" style={{ marginBottom: 16 }}>Impossible de charger les données : {error}. Vérifiez la configuration Supabase (README).</p>}
        {loading ? <p className="muted">Chargement…</p> : (
          <>
            {tab === "dashboard" && <Dashboard list={filtered} onOpen={setOpen} go={go} />}
            {tab === "prospects" && <Pipeline list={filtered} onOpen={setOpen} onMove={(a, stage) => save({ ...a, stage })} />}
            {tab === "clients" && <Clients list={filtered} onOpen={setOpen} />}
            {tab === "notifications" && <PushQueue pushes={pushes} onSent={async (id) => {
              try { const u = await markPushSent(id); setPushes((l) => l.map((x) => (x.id === id ? u : x))); setToast("Marquée comme envoyée ✓"); }
              catch (e) { setToast("Erreur : " + e.message); }
            }} onCopy={() => setToast("Texte copié ✓")} />}
          </>
        )}
      </main>

      {open && <Fiche acc={open} onClose={() => setOpen(null)} onSave={async (a) => { const s = await save(a); if (s) setOpen(s); }} onDelete={remove} />}
      {toast && <div className="toast glass">{toast}</div>}
    </div>
  );
}

/* ───────────── Notifications demandées par les commerçants ───────────── */
function PushQueue({ pushes, onSent, onCopy }) {
  const [all, setAll] = useState(false);
  const due = (p) => !p.send_at || new Date(p.send_at) <= new Date();
  const shown = pushes
    .filter((p) => all || p.status === "a_envoyer")
    .sort((a, b) => (a.status === "a_envoyer") === (b.status === "a_envoyer") ? new Date(a.send_at || a.created_at) - new Date(b.send_at || b.created_at) : a.status === "a_envoyer" ? -1 : 1);
  const fmt = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  async function copy(t) { try { await navigator.clipboard.writeText(t); onCopy(); } catch {} }
  return (
    <section className="panel glass" style={{ display: "grid", gap: 14 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <p className="muted" style={{ fontSize: 14, maxWidth: 640 }}>Les commerçants écrivent leurs notifications dans leur espace. Envoyez-les depuis l'application de cartes, puis cliquez « Marquer comme envoyée » : le commerçant le voit dans son espace.</p>
        <label className="row" style={{ "--gap": "8px", fontSize: 14 }}><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Afficher l'historique</label>
      </div>
      {shown.length === 0 ? <p className="muted">Rien à envoyer pour le moment.</p> : (
        <ul className="push-list">
          {shown.map((p) => (
            <li key={p.id} className={p.status === "a_envoyer" ? (due(p) ? "due" : "later") : "done"}>
              <div className="push-meta">
                <b>{p.business || p.account_email}</b>
                <span>{p.account_email}</span>
                <span>{p.status === "envoye" ? `Envoyée le ${fmt(p.sent_at)}` : p.send_at ? `À envoyer le ${fmt(p.send_at)}` : `Dès que possible · écrite le ${fmt(p.created_at)}`}</span>
              </div>
              <p className="push-text">{p.message}</p>
              <div className="row" style={{ "--gap": "8px" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => copy(p.message)}>Copier le texte</button>
                {p.status === "a_envoyer" && <button className="btn btn-primary btn-sm" onClick={() => onSent(p.id)}><Icon name="check" size={16} /> Marquer comme envoyée</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ───────────── Tableau de bord ───────────── */
function Dashboard({ list, onOpen, go }) {
  const clients = list.filter((a) => a.stage === "client");
  const active = clients.filter((a) => (a.client_status || "actif") === "actif");
  const mrr = active.reduce((s, a) => s + Number(a.mrr || 0), 0);
  const inPipe = list.filter((a) => ["nouveau", "contacte", "demo", "proposition"].includes(a.stage));
  const lost = list.filter((a) => a.stage === "perdu").length;
  const conv = clients.length + lost ? Math.round((clients.length / (clients.length + lost)) * 100) : 0;
  const potential = list.filter((a) => a.stage === "proposition").reduce((s, a) => s + (planById[a.plan]?.monthly || 29), 0);
  const founders = clients.filter((a) => a.founder).length;

  const t = todayStr();
  const todo = list
    .filter((a) => a.next_action_date && a.stage !== "perdu" && a.next_action_date <= new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10))
    .sort((a, b) => a.next_action_date.localeCompare(b.next_action_date));
  const fresh = list.filter((a) => a.source === "site" && a.stage === "nouveau");

  const byStage = STAGES.map((s) => ({ ...s, n: list.filter((a) => a.stage === s.id).length }));
  const maxStage = Math.max(1, ...byStage.map((s) => s.n));
  const byPlan = plans.map((p) => ({ ...p, n: active.filter((a) => a.plan === p.id).length, mrr: active.filter((a) => a.plan === p.id).reduce((s, a) => s + Number(a.mrr || 0), 0) }));
  const maxPlan = Math.max(1, ...byPlan.map((p) => p.mrr));

  return (
    <div className="stack" style={{ "--gap": "12px" }}>
      <div className="kpis">
        <div className="kpi glass hot"><small><Icon name="euro" size={15} /> Revenu mensuel récurrent</small><b>{eur(mrr)}</b><span>{eur(mrr * 12)} sur 12 mois</span></div>
        <div className="kpi glass"><small><Icon name="store" size={15} /> Clients actifs</small><b>{active.length}</b><span>Fondateurs : {founders}/10</span></div>
        <div className="kpi glass"><small><Icon name="kanban" size={15} /> Prospects en cours</small><b>{inPipe.length}</b><span>Potentiel en proposition : {eur(potential)}/mois</span></div>
        <div className="kpi glass"><small><Icon name="chart" size={15} /> Taux de signature</small><b>{conv} %</b><span>Clients ÷ (clients + perdus)</span></div>
      </div>

      <div className="panels">
        <section className="panel glass">
          <h2>À faire <span>retards, aujourd'hui et 3 prochains jours</span></h2>
          {todo.length === 0 ? (
            <div className="empty"><Mascot pose="sleep" size={110} title="Rien à faire, Walti dort" />Rien d'urgent. Walti fait la sieste.</div>
          ) : (
            <div className="todo-list">
              {todo.map((a) => {
                const late = a.next_action_date < t, isToday = a.next_action_date === t;
                return (
                  <button key={a.id} className="todo-item" onClick={() => onOpen(a)}>
                    <span className="stage-dot" style={{ background: stageById[a.stage]?.color }} title={stageById[a.stage]?.label} />
                    <div><b>{a.next_action || "Action à définir"}</b><span>{a.business} · {stageById[a.stage]?.label}</span></div>
                    <span className={`date-pill ${late ? "late" : isToday ? "today" : ""}`}>{late ? "En retard · " : isToday ? "Aujourd'hui" : ""}{isToday ? "" : fmtDate(a.next_action_date)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel glass">
          <h2>Demandes du site <span>{fresh.length} à traiter</span></h2>
          {fresh.length === 0 ? (
            <div className="empty">Aucune nouvelle demande.</div>
          ) : (
            <div className="todo-list">
              {fresh.slice(0, 6).map((a) => (
                <button key={a.id} className="todo-item" onClick={() => onOpen(a)}>
                  <Icon name="mail" size={18} />
                  <div><b>{a.business}</b><span>{[a.sector, a.city, a.preferred_channel].filter(Boolean).join(" · ")}</span></div>
                  <span className="date-pill">{fmtDate(a.created_at)}</span>
                </button>
              ))}
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => go("prospects")} style={{ justifySelf: "start" }}>Voir le pipeline</button>
        </section>

        <section className="panel glass">
          <h2>Contacts par étape <span>{list.length} au total</span></h2>
          <div className="hbars" role="list">
            {byStage.map((s) => (
              <div key={s.id} className="hbar" role="listitem" title={`${s.label} : ${s.n}`}>
                <span className="lbl">{s.label}</span>
                <span className="track"><span className="fill" style={{ width: `${(s.n / maxStage) * 100}%` }} /></span>
                <span className="val">{s.n}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel glass">
          <h2>Revenu mensuel par formule <span>clients actifs</span></h2>
          <div className="hbars" role="list">
            {byPlan.map((p) => (
              <div key={p.id} className="hbar" role="listitem" title={`${p.name} : ${p.n} client(s), ${eur(p.mrr)}/mois`}>
                <span className="lbl">{p.name} ({p.n})</span>
                <span className="track"><span className="fill" style={{ width: `${(p.mrr / maxPlan) * 100}%` }} /></span>
                <span className="val">{Math.round(p.mrr)} €</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ───────────── Pipeline (kanban) ───────────── */
function Pipeline({ list, onOpen, onMove }) {
  const [over, setOver] = useState(null);
  return (
    <>
      <p className="faint" style={{ fontSize: 13, marginBottom: 14 }}>Glissez une carte d'une colonne à l'autre pour changer son étape. Cliquez pour ouvrir la fiche.</p>
      <div className="kanban">
        {STAGES.map((s) => {
          const items = list.filter((a) => a.stage === s.id);
          const sum = items.reduce((t, a) => t + (s.id === "client" ? Number(a.mrr || 0) : planById[a.plan]?.monthly || 0), 0);
          return (
            <div
              key={s.id}
              className={`col ${over === s.id ? "over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault(); setOver(null);
                const id = e.dataTransfer.getData("text/plain");
                const a = list.find((x) => x.id === id);
                if (a && a.stage !== s.id) onMove(a, s.id);
              }}
            >
              <div className="col-head">
                <span className="stage-dot" style={{ background: s.color }} />{s.label}
                {sum > 0 && <span className="sum">· {Math.round(sum)} €/m</span>}
                <span className="n">{items.length}</span>
              </div>
              {items.map((a) => (
                <button
                  key={a.id}
                  className="kcard"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", a.id)}
                  onClick={() => onOpen(a)}
                >
                  <b>{a.business}</b>
                  <span className="meta">{[a.sector, a.city].filter(Boolean).join(" · ") || "—"}</span>
                  <div className="row">
                    {a.source === "site" && <span className="tag site">Site web</span>}
                    {(a.plan || a.requested_plan) && <span className="tag plan">{planById[a.plan || a.requested_plan]?.name}{!a.plan && " ?"}</span>}
                    {a.card_config && <span className="tag plan">Carte en ligne</span>}
                    {a.founder && <span className="tag founder">Fondateur</span>}
                  </div>
                  {a.next_action && (
                    <span className="meta" style={{ color: a.next_action_date && a.next_action_date < todayStr() ? "#ffb08a" : undefined }}>
                      → {a.next_action}{a.next_action_date ? ` · ${fmtDate(a.next_action_date)}` : ""}
                    </span>
                  )}
                </button>
              ))}
              {items.length === 0 && <div className="empty">Vide</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ───────────── Clients ───────────── */
function Clients({ list, onOpen }) {
  const [f, setF] = useState("actif");
  const clients = list.filter((a) => a.stage === "client" && (f === "tous" || (a.client_status || "actif") === f));
  const total = clients.reduce((s, a) => s + Number(a.mrr || 0), 0);
  return (
    <>
      <div className="filters" role="group" aria-label="Filtrer par statut">
        {[["actif", "Actifs"], ["pause", "En pause"], ["resilie", "Résiliés"], ["tous", "Tous"]].map(([id, l]) => (
          <button key={id} aria-pressed={f === id} onClick={() => setF(id)}>{l}</button>
        ))}
      </div>
      {clients.length === 0 ? (
        <div className="panel glass"><div className="empty"><Mascot pose="sleep" size={120} title="Aucun client, Walti dort" />Aucun client dans cette catégorie. Faites glisser un prospect dans « Client » pour l'ajouter.</div></div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Commerce</th><th>Formule</th><th>Paiement</th><th style={{ textAlign: "right" }}>Mensuel</th><th>Client depuis</th><th>Statut</th><th>Prochaine action</th></tr>
            </thead>
            <tbody>
              {clients.map((a) => (
                <tr key={a.id} onClick={() => onOpen(a)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(a)}>
                  <td><b>{a.business}</b>{a.founder && <span className="tag founder" style={{ marginLeft: 8 }}>Fondateur</span>}<div className="faint" style={{ fontSize: 12 }}>{[a.sector, a.city].filter(Boolean).join(" · ")}</div></td>
                  <td>{planById[a.plan]?.name || "—"}</td>
                  <td>{a.billing === "annuel" ? "Annuel" : "Mensuel"}</td>
                  <td className="num">{eur(a.mrr)}</td>
                  <td>{a.client_since ? new Date(a.client_since + "T12:00:00").toLocaleDateString("fr-FR") : "—"}</td>
                  <td><span className={`status ${a.client_status || "actif"}`}>{{ actif: "Actif", pause: "En pause", resilie: "Résilié" }[a.client_status || "actif"]}</span></td>
                  <td className="muted">{a.next_action ? `${a.next_action}${a.next_action_date ? " · " + fmtDate(a.next_action_date) : ""}` : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3} className="muted" style={{ padding: "14px 16px" }}>{clients.length} client(s)</td><td className="num" style={{ padding: "14px 16px" }}>{eur(total)}</td><td colSpan={3} /></tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}

/* ───────────── Fiche (tiroir) ───────────── */
function Fiche({ acc, onClose, onSave, onDelete }) {
  const [a, setA] = useState(acc);
  const [note, setNote] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  useEffect(() => { setA(acc); setConfirmDel(false); }, [acc]);
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setA((p) => {
      const n = { ...p, [k]: v };
      if ((k === "plan" || k === "billing") && n.plan) n.mrr = computeMrr(n.plan, n.billing);
      return n;
    });
  };

  function addNote() {
    if (!note.trim()) return;
    setA((p) => ({ ...p, notes: [{ at: new Date().toISOString(), text: note.trim() }, ...(p.notes || [])] }));
    setNote("");
  }

  function submit(e) {
    e.preventDefault();
    if (!a.business?.trim()) return;
    onSave({ ...a, mrr: Number(a.mrr || 0) });
  }

  const wa = waLink(a.phone);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <form className="drawer" onSubmit={submit} aria-label="Fiche contact">
        <div className="drawer-head">
          <div>
            <span className="tag" style={{ background: "transparent", paddingLeft: 0 }}>{a.id ? `Créé le ${new Date(a.created_at).toLocaleDateString("fr-FR")} · ${a.source === "site" ? "via le site" : "terrain"}` : "Nouveau contact"}</span>
            <h2>{a.business || "Nouveau commerce"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer"><Icon name="x" size={18} /></button>
        </div>

        {(a.phone || a.email) && (
          <div className="quick">
            {a.phone && <a className="btn btn-ghost btn-sm" href={`tel:${a.phone.replace(/\s/g, "")}`}><Icon name="phone" size={16} /> Appeler</a>}
            {wa && <a className="btn btn-ghost btn-sm" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} /> WhatsApp</a>}
            {a.email && <a className="btn btn-ghost btn-sm" href={`mailto:${a.email}`}><Icon name="mail" size={16} /> E-mail</a>}
          </div>
        )}

        {a.message && <div className="msg"><b style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Message reçu</b>{a.message}</div>}

        {(a.card_config || a.requested_plan) && (
          <div className="msg adm-made">
            <b style={{ display: "block", fontSize: 12, marginBottom: 10 }}>{a.card_config ? "Carte créée en ligne par le commerçant" : "Formule demandée"}</b>
            {a.card_config && <WalletCard card={cardFromConfig(a.card_config)} compact />}
            {a.requested_plan && (
              <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
                <span>Formule choisie : <b>{planById[a.requested_plan]?.name}</b> ({planById[a.requested_plan]?.monthly} €/mois)</span>
                {a.plan !== a.requested_plan && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setA((p) => ({ ...p, plan: p.requested_plan, mrr: computeMrr(p.requested_plan, p.billing) }))}>Reprendre cette formule</button>}
              </div>
            )}
            {a.card_config?.program && <p style={{ fontSize: 13, marginTop: 10 }}><b>{programById[a.card_config.program.type]?.name}</b> · {programDisplay(a.card_config.program).summary}</p>}
            {a.card_config?.brand && (
              <p style={{ fontSize: 13, marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <span>Charte : {{ complete: "complète", logo: "logo seul", none: "aucune" }[a.card_config.brand.charter] || "—"}</span>
                {a.card_config.brand.primary && <span className="adm-swatch" style={{ background: a.card_config.brand.primary }} title={a.card_config.brand.primary} />}
                {a.card_config.brand.secondary && <span className="adm-swatch" style={{ background: a.card_config.brand.secondary }} title={a.card_config.brand.secondary} />}
                {a.card_config.brand.font && <span>· Police : {a.card_config.brand.font}</span>}
                {a.card_config.brand.sendCharter && <span>· Envoie sa charte PDF</span>}
                {a.card_config.brand.links && <span>· {a.card_config.brand.links}</span>}
              </p>
            )}
            <div className="row" style={{ "--gap": "14px", marginTop: 8 }}>
              {a.card_config?.logo && <a className="text-link" style={{ fontSize: 13 }} href={a.card_config.logo} download={`logo-${(a.business || "commerce").replace(/\W+/g, "-")}.png`}>Télécharger le logo</a>}
              {a.card_config?.photo && <a className="text-link" style={{ fontSize: 13 }} href={a.card_config.photo} download={`photo-${(a.business || "commerce").replace(/\W+/g, "-")}.jpg`}>Télécharger la photo</a>}
            </div>
          </div>
        )}

        {a.billing_info && (
          <div className="msg">
            <b style={{ display: "block", fontSize: 12, marginBottom: 8 }}>Facturation</b>
            <div style={{ display: "grid", gap: 2, fontSize: 14 }}>
              <span><b>{a.billing_info.legal_name}</b>{a.billing_info.siret ? ` · SIRET ${a.billing_info.siret}` : " · SIRET à demander"}</span>
              <span>{a.billing_info.address}, {a.billing_info.postal_code} {a.billing_info.city}</span>
              <span>Factures : {a.billing_info.email} · paiement {a.billing_info.billing}</span>
              {a.billing_info.options?.length > 0 && <span>Options : {a.billing_info.options.join(", ")}</span>}
              <span className="faint">{a.billing_info.marketing_optin ? "Accepte les conseils par message" : "Ne veut pas de messages commerciaux"}</span>
            </div>
          </div>
        )}

        <fieldset>
          <legend>Commerce</legend>
          <div className="field"><label>Nom du commerce *</label><input className="input" value={a.business || ""} onChange={set("business")} required /></div>
          <div className="two">
            <div className="field"><label>Contact</label><input className="input" value={a.contact_name || ""} onChange={set("contact_name")} /></div>
            <div className="field"><label>Activité</label>
              <select className="select" value={a.sector || ""} onChange={set("sector")}><option value="">—</option>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <div className="two">
            <div className="field"><label>Téléphone</label><input className="input" value={a.phone || ""} onChange={set("phone")} /></div>
            <div className="field"><label>E-mail</label><input className="input" type="email" value={a.email || ""} onChange={set("email")} /></div>
          </div>
          <div className="field"><label>Commune</label>
            <select className="select" value={a.city || ""} onChange={set("city")}><option value="">—</option>{COMMUNES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Suivi</legend>
          <div className="two">
            <div className="field"><label>Étape</label>
              <select className="select" value={a.stage || "nouveau"} onChange={set("stage")}>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
            </div>
            <div className="field"><label>Formule visée</label>
              <select className="select" value={a.plan || ""} onChange={set("plan")}><option value="">—</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.monthly} €</option>)}</select>
            </div>
          </div>
          <div className="two">
            <div className="field"><label>Prochaine action</label><input className="input" value={a.next_action || ""} onChange={set("next_action")} placeholder="Rappeler, envoyer le devis…" /></div>
            <div className="field"><label>Pour le</label><input className="input" type="date" value={a.next_action_date || ""} onChange={set("next_action_date")} /></div>
          </div>
        </fieldset>

        {a.stage === "client" && (
          <fieldset>
            <legend>Abonnement</legend>
            <div className="two">
              <div className="field"><label>Paiement</label>
                <select className="select" value={a.billing || "mensuel"} onChange={set("billing")}><option value="mensuel">Mensuel</option><option value="annuel">Annuel</option></select>
              </div>
              <div className="field"><label>Revenu mensuel (€)</label><input className="input" type="number" step="0.01" min="0" value={a.mrr ?? 0} onChange={set("mrr")} /></div>
            </div>
            <div className="two">
              <div className="field"><label>Client depuis</label><input className="input" type="date" value={a.client_since || ""} onChange={set("client_since")} /></div>
              <div className="field"><label>Statut</label>
                <select className="select" value={a.client_status || "actif"} onChange={set("client_status")}><option value="actif">Actif</option><option value="pause">En pause</option><option value="resilie">Résilié</option></select>
              </div>
            </div>
            <label className="consent"><input type="checkbox" checked={!!a.founder} onChange={set("founder")} /> Offre fondateurs (prix gardé à vie)</label>
          </fieldset>
        )}

        <fieldset>
          <legend>Notes</legend>
          <div className="row" style={{ "--gap": "8px", flexWrap: "nowrap" }}>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note…" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={addNote}>Ajouter</button>
          </div>
          <div className="notes">
            {(a.notes || []).map((n, i) => (
              <div key={i} className="note"><time>{new Date(n.at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time>{n.text}</div>
            ))}
            {(!a.notes || a.notes.length === 0) && <p className="faint" style={{ fontSize: 13 }}>Aucune note pour l'instant.</p>}
          </div>
        </fieldset>

        <div className="drawer-foot">
          {a.id ? (
            confirmDel ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(a.id)}>Confirmer la suppression</button>
            ) : (
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDel(true)}><Icon name="trash" size={16} /> Supprimer</button>
            )
          ) : <span />}
          <button type="submit" className="btn btn-primary btn-sm">Enregistrer</button>
        </div>
      </form>
    </>
  );
}
