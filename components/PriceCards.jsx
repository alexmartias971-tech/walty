"use client";

import Link from "next/link";
import { useState } from "react";
import Mascot from "./Mascot";
import Icon from "./Icon";
import { plans, highlights, trialDays } from "@/lib/offer";

/** Les 3 formules. Ce qui manque est barré : la différence se voit d'un coup d'œil. */
export default function PriceCards({ toggle = false }) {
  const [yearly, setYearly] = useState(false);
  return (
    <>
      {toggle && (
        <div className="row toggle-row" style={{ justifyContent: "center" }}>
          <div className="billing" role="group" aria-label="Paiement">
            <button aria-pressed={!yearly} onClick={() => setYearly(false)}>Au mois</button>
            <button aria-pressed={yearly} onClick={() => setYearly(true)}>À l'année <em>2 mois offerts</em></button>
          </div>
        </div>
      )}
      <div className="price-row">
        {plans.map((p) => (
          <article key={p.id} className={`price-card ${p.featured ? "featured" : ""}`}>
            {p.featured && (
              <div className="sitter" aria-hidden="true">
                <span className="bubble">Celle-là, je la conseille !</span>
                <Mascot pose="sit" size={180} className="sitter-mascot" title="Walti est assis sur la formule Premium" />
              </div>
            )}
            <span className="price-tag">{p.tagline}</span>
            <h3 className="display-s">{p.name}</h3>
            <div className="price-num">{yearly ? p.yearly : p.monthly}<span>{yearly ? " € / an" : " € / mois"}</span></div>
            <p className="price-sub">{yearly ? `soit ${(p.yearly / 12).toFixed(2).replace(".", ",")} € par mois` : p.for}</p>
            <ul className="list">
              {highlights[p.id].map(([on, txt]) => (
                <li key={txt} className={on ? "" : "off"}>
                  <span className={`check ${on ? "" : "x"}`}><Icon name={on ? "check" : "x"} size={12} stroke={2.6} /></span>{txt}
                </li>
              ))}
            </ul>
            <div className="price-actions">
              <Link href={`/creer?formule=${p.id}`} className={`btn ${p.featured ? "btn-primary" : "btn-dark"}`}>
                {trialDays ? `Essayer ${trialDays} jours gratuits` : `Choisir ${p.name}`}
              </Link>
              <Link href={`/contact?formule=${p.id}`} className="small">ou réserver une démo</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
