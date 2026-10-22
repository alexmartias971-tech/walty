"use client";

/**
 * « Squelettes » de chargement de l'espace commerçant : la forme de la page apparaît tout de suite
 * (chiffres, liste…) au lieu d'un écran vide avec une roue, le temps que les données arrivent.
 * Les données déjà vues s'affichent, elles, immédiatement (mémoire des rubriques, voir outils.js).
 */
const Line = ({ w = "100%", h, className = "" }) => <span className={`ec-skel ec-skel-line ${className}`} style={{ width: w, ...(h ? { height: h } : {}) }} />;

/** Une rangée de chiffres (tuiles). */
export function SkelKpis({ n = 4 }) {
  return (
    <div className={`ec-kpis ${n === 3 ? "ec-kpis-3" : ""}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="ec-kpi">
          <Line w="52%" h={24} />
          <Line w="78%" />
        </div>
      ))}
    </div>
  );
}

/** Une liste (passages, clients, messages). */
export function SkelList({ rows = 4 }) {
  return (
    <ul className="ec-skel-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="ec-skel-row">
          <span className="ec-skel ec-skel-dot" />
          <span className="ec-skel-col">
            <Line w={`${58 - (i % 3) * 9}%`} />
            <Line w={`${36 + (i % 2) * 14}%`} />
          </span>
          <Line w="44px" />
        </li>
      ))}
    </ul>
  );
}

/** Un encadré avec un titre et quelques lignes. */
export function SkelBox({ lines = 3, title = true, children = null }) {
  return (
    <section className="ec-box" aria-hidden="true">
      {title && <Line w="40%" h={16} />}
      {children || Array.from({ length: lines }, (_, i) => <Line key={i} w={`${92 - i * 11}%`} />)}
    </section>
  );
}

/** Page entière en chargement : chiffres + liste (annoncée aux lecteurs d'écran). */
export default function Squelette({ kpis = 4, rows = 4, boxes = 0 }) {
  return (
    <div className="ec-panel" role="status" aria-busy="true" aria-label="Chargement">
      {kpis > 0 && <SkelKpis n={kpis} />}
      <SkelBox title><SkelList rows={rows} /></SkelBox>
      {Array.from({ length: boxes }, (_, i) => <SkelBox key={i} lines={3} />)}
    </div>
  );
}
