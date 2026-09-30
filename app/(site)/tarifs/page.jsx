import Link from "next/link";
import PageHero from "@/components/PageHero";
import Icon from "@/components/Icon";
import Plans from "./Plans";
import { addons, founderOffer, vatNotice } from "@/lib/offer";

export const metadata = {
  title: "Tarifs",
  description: "Essentiel 29 €/mois, Premium 49 €/mois, Enseigne dès 79 €/mois. Carte de fidélité Wallet installée sur place en Guadeloupe, sans engagement.",
};

export default function TarifsPage() {
  return (
    <>
      <PageHero
        index="T1"
        label="Tarifs"
        title={<>Le prix d'un bokit <span className="serif grad-text">par semaine.</span></>}
        lead="Trois formules claires, sans engagement pour Essentiel et Premium. Pas de frais cachés, pas de coût par notification. Installation sur place en Guadeloupe."
      />

      <section className="frame">
        <div className="rails section" style={{ paddingTop: 72 }}>
          <Plans />
          <div className="founder">
            <div className="row" style={{ "--gap": "14px" }}>
              <span className="step-icon" style={{ background: "rgba(45,226,196,.15)", color: "var(--lagon)", borderColor: "rgba(45,226,196,.4)" }}><Icon name="sparkle" size={22} /></span>
              <div>
                <b>Offre fondateurs</b>
                <p className="muted" style={{ fontSize: 14 }}>{founderOffer.replace(/^Offre fondateurs : /, "").replace(/^./, (c) => c.toUpperCase())}</p>
              </div>
            </div>
            <Link href="/contact?formule=fondateur" className="btn btn-light btn-sm">Réserver ma place</Link>
          </div>
          <p className="faint" style={{ fontSize: 13, marginTop: 16 }}>{vatNotice} Offre réservée aux professionnels. Voir les <Link href="/cgv" style={{ textDecoration: "underline" }}>conditions générales de vente</Link>.</p>
        </div>
      </section>

      {/* Quelle formule */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>01</b> — Quelle formule pour moi ?</span>
            <h2 className="display-m reveal">Choisissez selon <span className="serif orange">votre quotidien.</span></h2>
          </div>
          <div className="table-wrap reveal">
            <table className="cmp">
              <thead>
                <tr><th>Vous êtes…</th><th>Ce que vous dites</th><th>Votre formule</th></tr>
              </thead>
              <tbody>
                <tr><td>Seul ou avec 1 à 2 employés, clientèle d'habitués (roulotte, snack, coach, barbier, onglerie)</td><td>« Je veux juste remplacer mes cartons. »</td><td className="yes">Essentiel · 29 €</td></tr>
                <tr className="hl"><td>Une équipe de 3 personnes ou plus, des heures creuses à remplir, une activité saisonnière (karting, restaurant, institut, salle de sport)</td><td>« Je n'ai pas le temps de faire ma com'. »</td><td className="yes">Premium · 49 €</td></tr>
                <tr><td>Plusieurs boutiques, un fichier client déjà dans la caisse</td><td>« On a déjà un fichier clients. »</td><td className="yes">Enseigne · dès 79 €</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Comparatif détaillé */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>02</b> — Comparatif détaillé</span>
            <p className="lead">La différence entre Essentiel et Premium, c'est 20 € par mois. Un seul client de plus par mois qui dépense 20 € la rembourse.</p>
          </div>
          <div className="table-wrap reveal">
            <table className="cmp">
              <thead>
                <tr><th></th><th>Essentiel</th><th className="hl">Premium</th><th>Enseigne</th></tr>
              </thead>
              <tbody>
                {[
                  ["Prix mensuel", "29 €", "49 €", "Dès 79 €"],
                  ["Paiement annuel", "290 € (2 mois offerts)", "490 € (2 mois offerts)", "Sur devis"],
                  ["Mise en place", "90 €, offerte en annuel", "Offerte", "Sur devis"],
                  ["Carte Apple + Google Wallet", "Sur mesure", "Premium + 4 visuels saisonniers/an", "Aux couleurs de l'enseigne, toutes boutiques"],
                  ["Notifications push", "2 par semaine", "2 par semaine + 1 campagne/mois écrite pour vous", "Selon le besoin"],
                  ["Relance automatique à 30 jours", "✓", "✓", "✓"],
                  ["Offre d'anniversaire", "✓", "✓", "✓"],
                  ["Kit comptoir", "2 affiches + autocollant", "Kit complet + chevalet", "Par boutique"],
                  ["Accès caisse (personnel)", "3", "Illimités", "Par boutique"],
                  ["Bilan chiffré", "Tous les 3 mois", "Chaque mois + rendez-vous", "Chaque mois, par boutique"],
                  ["Plaque NFC avis Google", "En option", "Offerte", "Offerte"],
                  ["Import d'un fichier client", "En option (49 €)", "En option (49 €)", "Inclus"],
                  ["Engagement", "Aucun", "Aucun", "12 mois"],
                ].map((r) => (
                  <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td className="hl">{r[2]}</td><td>{r[3]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Options */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>03</b> — Options à la carte</span>
            <p className="lead">Pour aller plus loin, sans changer de formule.</p>
          </div>
          <div className="grid cols-3">
            {addons.map((a, i) => (
              <div key={a.name} className="cell reveal" data-delay={(i % 3) + 1} style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
                <span>{a.name}</span>
                <b style={{ fontFamily: "var(--f-display)", whiteSpace: "nowrap" }}>{a.price}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>04</b> — Questions sur les prix</span>
            <h2 className="display-m">Pas de petites lignes.</h2>
          </div>
          <div className="faq">
            {[
              { q: "Pourquoi n'y a-t-il pas de TVA ?", a: "Walti est une micro-entreprise qui bénéficie de la franchise en base de TVA (art. 293 B du Code général des impôts). Les prix affichés sont donc les prix que vous payez." },
              { q: "Comment je paie ?", a: "Par virement ou prélèvement, chaque mois ou une fois par an. Une facture vous est envoyée à chaque paiement." },
              { q: "Puis-je changer de formule ?", a: "Oui, à tout moment. Le passage à la formule supérieure s'applique tout de suite ; le passage à la formule inférieure s'applique au mois suivant." },
              { q: "Qu'est-ce qui se passe si j'arrête ?", a: "Pour Essentiel et Premium, vous arrêtez à la fin du mois en cours, sans frais. La carte cesse de fonctionner pour vos clients et vous récupérez votre fichier client. En paiement annuel, l'année payée reste due." },
              { q: "C'est quoi l'offre fondateurs ?", a: "Les 10 premiers commerces qui s'abonnent gardent le prix de départ à vie, même si les tarifs augmentent plus tard, tant qu'ils restent abonnés sans interruption." },
            ].map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus"><Icon name="plus" size={14} stroke={2} /></span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
