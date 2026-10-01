import Link from "next/link";
import PageHero from "@/components/PageHero";
import PriceCards from "@/components/PriceCards";
import Fork from "@/components/Fork";
import Icon from "@/components/Icon";
import { plans, features, addons, founderOffer, vatNotice, trialDays } from "@/lib/offer";

export const metadata = {
  title: "Tarifs",
  description: "Essentiel 29 €, Premium 49 €, Pro 79 € par mois. Carte de fidélité Apple et Google Wallet, sans engagement, 14 jours gratuits.",
};

function Val({ v }) {
  if (v === true) return <span className="yes" aria-label="Oui"><Icon name="check" size={14} stroke={2.6} /></span>;
  if (v === false) return <span className="no" aria-label="Non"><Icon name="x" size={12} stroke={2.6} /></span>;
  return <>{v}</>;
}

export default function TarifsPage() {
  return (
    <>
      <PageHero
        label="Tarifs"
        title={<>Moins d'1 € <span className="serif">par jour</span>.</>}
        lead={`Trois formules, sans engagement.${trialDays ? ` ${trialDays} jours gratuits pour essayer.` : ""} Un seul client de plus par semaine rembourse la carte.`}
      />

      <section className="frame">
        <div className="rails section" style={{ paddingTop: 24 }}>
          <PriceCards toggle />
          <p className="faint" style={{ fontSize: 14, marginTop: 20 }}>{founderOffer} {vatNotice} Offre réservée aux professionnels. Voir les <Link href="/cgv" style={{ textDecoration: "underline" }}>conditions de vente</Link>.</p>
        </div>
      </section>

      <section className="frame alt">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Le détail</span>
            <h2 className="display-m">Ce que vous avez <span className="serif">dans chaque formule</span>.</h2>
          </div>
          <div className="table-wrap">
            <table className="cmp">
              <thead>
                <tr>
                  <th></th>
                  {plans.map((p) => <th key={p.id} className={p.featured ? "hl" : ""}>{p.name}<br /><span style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 13, opacity: .75 }}>{p.monthly} € / mois</span></th>)}
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.label} className={f.key ? "key" : ""}>
                    <td>{f.label}</td>
                    {f.values.map((v, i) => <td key={i} className={plans[i].featured ? "hl" : ""}><Val v={v} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">En option</span>
            <h2 className="display-m">À ajouter <span className="serif">quand vous voulez</span>.</h2>
          </div>
          <div className="grid cols-3">
            {addons.map((a) => (
              <div key={a.name} className="cell" style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
                <span style={{ fontWeight: 600 }}>{a.name}</span>
                <b style={{ fontFamily: "var(--f-display)", whiteSpace: "nowrap" }}>{a.price}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="frame alt">
        <div className="rails section faq-grid">
          <h2 className="display-m">Questions <span className="serif">sur les prix</span>.</h2>
          <div className="faq">
            {[
              { q: "Pourquoi il n'y a pas de TVA ?", a: "Walti est une micro-entreprise en franchise de TVA (art. 293 B du CGI). Le prix affiché est le prix que vous payez." },
              { q: "Que se passe-t-il à 200 clients en Essentiel ?", a: "Bravo ! Les clients déjà inscrits gardent leur carte. Pour accueillir les suivants, vous passez en Premium (jusqu'à 1 000 clients)." },
              { q: "Comment se passe l'essai gratuit ?", a: `Vous créez votre carte, on l'active, et vous l'utilisez ${trialDays || 14} jours sans payer. Ensuite, vous choisissez de continuer ou non.` },
              { q: "Je peux changer de formule ?", a: "Oui, à tout moment. Pour monter, c'est immédiat. Pour descendre, c'est au mois suivant." },
              { q: "Et si j'arrête ?", a: "Aucun engagement. Vous arrêtez à la fin du mois et vous gardez la liste de vos clients." },
            ].map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus"><Icon name="plus" size={14} stroke={2} /></span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Fork />
    </>
  );
}
