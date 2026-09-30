"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import Mascot from "@/components/Mascot";
import { plans } from "@/lib/offer";

export default function Plans() {
  const [yearly, setYearly] = useState(false);
  return (
    <>
      <div className="row" style={{ justifyContent: "center", marginBottom: 150 }}>
        <div className="billing glass" role="group" aria-label="Période de paiement">
          <button aria-pressed={!yearly} onClick={() => setYearly(false)}>Mensuel</button>
          <button aria-pressed={yearly} onClick={() => setYearly(true)}>Annuel <em>2 mois offerts</em></button>
        </div>
      </div>
      <div className="plans">
        {plans.map((p) => {
          const showYear = yearly && p.yearly;
          return (
            <article key={p.id} className={`plan glass ${p.featured ? "featured" : ""}`}>
              {p.featured && <Mascot pose="sit" size={140} className="price-sitter" title="Walti recommande Premium" />}
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h2 className="display-s">{p.name}</h2>
                {p.featured && <span className="chip chip-orange">Recommandée</span>}
              </div>
              <p className="muted" style={{ fontSize: 14, marginTop: -8 }}>{p.for}</p>
              <div>
                <div className="price-num">
                  {p.fromPrice && <small>dès </small>}
                  {showYear ? p.yearly : p.monthly}
                  <span>{showYear ? " €/an" : " €/mois"}</span>
                </div>
                <p className="plan-sub">
                  {showYear ? `soit ${Math.round((p.yearly / 12) * 10) / 10} €/mois · ` : ""}
                  {yearly && p.id === "essentiel" ? "Mise en place offerte" : p.setup}
                </p>
              </div>
              <p style={{ fontWeight: 600 }}>{p.pitch}</p>
              <ul className="list">
                {p.features.map((f) => (
                  <li key={f}><span className="check"><Icon name="check" size={12} stroke={2.4} /></span>{f}</li>
                ))}
              </ul>
              <div className="stack" style={{ "--gap": "10px" }}>
                <Link href={`/contact?formule=${p.id}`} className={`btn ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                  {p.id === "enseigne" ? "Demander un devis" : `Choisir ${p.name}`}
                </Link>
                <span className="faint center" style={{ fontSize: 13 }}>{p.commitment}</span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
