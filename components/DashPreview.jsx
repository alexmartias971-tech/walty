import Link from "next/link";
import { demoStats, kpiTiles } from "@/lib/kpis";

/** Aperçu du tableau de bord commerçant, sur l'accueil. */
export default function DashPreview() {
  const tiles = kpiTiles().slice(0, 3);
  const max = Math.max(...demoStats.weekly);
  return (
    <div className="dash-preview">
      <div className="dash-preview-bar">
        <span>Le Bokit du Lagon</span>
        <span className="chip chip-orange">Exemple</span>
      </div>
      <div className="tiles t3">
        {tiles.map((t) => (
          <div key={t.id} className="tile">
            <small>{t.label}</small>
            <b>{t.value}</b>
            <span className={t.up ? "up" : ""}>{t.note}</span>
          </div>
        ))}
      </div>
      <div className="dash-bars">
        <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Passages par semaine</p>
        <div className="bars" role="img" aria-label={`Passages par semaine : ${demoStats.weekly.join(", ")}`}>
          {demoStats.weekly.map((v, i) => (
            <div key={i} className={`b ${i === demoStats.weekly.length - 1 ? "last" : ""}`}>
              <em>{v}</em>
              <i style={{ height: `${(v / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="bars-x">{demoStats.weeks.map((w) => <span key={w}>{w}</span>)}</div>
      </div>
      <Link href="/espace" className="text-link" style={{ justifySelf: "start", fontSize: 15 }}>Voir l'espace commerçant en exemple</Link>
    </div>
  );
}
