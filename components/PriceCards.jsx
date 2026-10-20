"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Mascot from "./Mascot";
import Icon from "./Icon";
import { plans, highlights, trialDays } from "@/lib/offer";
import "./PriceCards.css";

/**
 * Les 2 formules, payées au mois. Ce qui manque est barré : la différence se voit d'un coup d'œil.
 * `note` : affiche au-dessus des cartes la ligne « au mois, sans engagement, essai gratuit ».
 */
export default function PriceCards({ note = false }) {
  const [active, setActive] = useState(Math.max(0, plans.findIndex((p) => p.featured)));
  const row = useRef(null);
  // Sur téléphone et tablette, les cartes défilent de côté : on ouvre sur la formule conseillée
  // (Walty est assis dessus) et on suit celle qui est au centre
  useEffect(() => {
    const el = row.current;
    if (!el || window.innerWidth >= 960) return;
    const f = el.querySelector(".featured");
    if (f) el.scrollLeft = f.offsetLeft - (el.clientWidth - f.clientWidth) / 2;
    const on = () => {
      const cards = [...el.children];
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0, d = Infinity;
      cards.forEach((c, i) => { const cd = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid); if (cd < d) { d = cd; best = i; } });
      setActive(best);
    };
    on();
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  function go(i) {
    const el = row.current;
    const c = el?.children[i];
    if (c) el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.clientWidth) / 2, behavior: "smooth" });
  }
  return (
    <>
      {note && (
        <div className="row toggle-row" style={{ justifyContent: "center" }}>
          <p className="price-note">
            <span><Icon name="check" size={14} stroke={2.6} /> Paiement au mois</span>
            <span><Icon name="check" size={14} stroke={2.6} /> Sans engagement</span>
            {trialDays > 0 && <span><Icon name="check" size={14} stroke={2.6} /> {trialDays} jours d'essai gratuit</span>}
          </p>
        </div>
      )}
      <div className="price-dots" aria-label="Formules">
        {plans.map((p, i) => (
          <button key={p.id} type="button" className={i === active ? "on" : ""} onClick={() => go(i)} aria-label={`Voir ${p.name}`} aria-current={i === active ? "true" : undefined}>{p.name}</button>
        ))}
      </div>
      <div className={`price-row price-row--${plans.length}`} ref={row}>
        {plans.map((p) => (
          <article key={p.id} className={`price-card ${p.featured ? "featured" : ""}`}>
            {p.featured && (
              <div className="sitter" aria-hidden="true">
                <span className="bubble">Celle-là, je la conseille !</span>
                <Mascot pose="sit" size={180} className="sitter-mascot" title={`Walty est assis sur la formule ${p.name}`} />
              </div>
            )}
            <span className="price-tag">{p.tagline}</span>
            <h3 className="display-s">{p.name}</h3>
            <div className="price-num">{p.monthly}<span> € / mois</span></div>
            <p className="price-sub">{p.for}</p>
            <ul className="list">
              {highlights[p.id].map(([on, txt]) => (
                <li key={txt} className={on ? "" : "off"}>
                  <span className={`check ${on ? "" : "x"}`}><Icon name={on ? "check" : "x"} size={12} stroke={2.6} /></span>{txt}
                </li>
              ))}
            </ul>
            <div className="price-actions">
              <Link href={`/contact?formule=${p.id}`} className={`btn ${p.featured ? "btn-primary" : "btn-dark"}`}>
                {trialDays ? `Démo gratuite · ${trialDays} jours offerts` : `Choisir ${p.name}`}
              </Link>
              <Link href={`/creer?formule=${p.id}`} className="small">Créer ma carte en ligne : bientôt disponible</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
