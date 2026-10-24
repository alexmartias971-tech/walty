import Link from "next/link";
import PageHero from "@/components/PageHero";
import PriceCards from "@/components/PriceCards";
import Fork from "@/components/Fork";
import Icon from "@/components/Icon";
import { plans, features, sav, vatNotice, trialDays } from "@/lib/offer";

export const metadata = {
  title: "Tarifs",
  description: `Essentiel 9 € par mois, Tout compris 15 € par mois. Carte de fidélité Apple Wallet et Google Wallet, sans engagement, ${trialDays} jours d'essai gratuit.`,
};

function Val({ v }) {
  if (v === true) return <span className="yes" aria-label="Oui"><Icon name="check" size={14} stroke={2.6} /></span>;
  if (v === false) return <span className="no" aria-label="Non"><Icon name="x" size={12} stroke={2.6} /></span>;
  return <>{v}</>;
}

const faq = [
  { q: "Comment se passe l'essai gratuit ?", a: `On prépare votre carte avant la démo, on vous la montre au rendez-vous, et vous l'utilisez ${trialDays || 14} jours sans payer. Ensuite, vous choisissez de continuer ou non.` },
  { q: "Quelle différence entre les deux formules ?", a: "Essentiel remplace vos cartes en carton : une carte à tampons à votre logo et à vos couleurs. Tout compris ajoute ce qui fait revenir vos clients : statistiques, notifications, lien d'avis Google et parrainage. Avec un SAV sous 48 h garanti." },
  { q: "Comment marche le SAV sous 48 h ?", a: `Avec Tout compris, votre demande est prise en charge en moins de ${sav.delay}, ${sav.hours}. ${sav.sunday} Avec Essentiel, on vous aide par WhatsApp ou par e-mail, sans délai garanti.` },
  { q: "Combien de notifications je peux envoyer ?", a: "Avec Tout compris, jusqu'à 4 par semaine. Vous écrivez votre message, on l'envoie sur le téléphone de vos clients. Notre conseil : une par semaine suffit, pour ne pas les lasser." },
  { q: "Je peux changer de formule ?", a: "Oui. Passer au Tout compris, c'est immédiat. Revenir à l'Essentiel se fait au mois suivant." },
  { q: "Y a-t-il des frais en plus ?", a: "Non. L'installation est offerte dans les deux formules, et il n'y a pas d'options payantes. Vous payez votre formule chaque mois, c'est tout." },
  { q: "Et si j'arrête ?", a: "Aucun engagement. Vous arrêtez à la fin du mois et vous gardez la liste de vos clients." },
];

export default function TarifsPage() {
  return (
    <>
      <PageHero
        label="Tarifs"
        title={<>Dès 9 € <span className="serif">par mois</span>.</>}
        lead={`Deux formules, sans engagement. Essentiel pour remplacer vos cartes en carton. Tout compris pour faire revenir vos clients plus souvent.${trialDays ? ` ${trialDays} jours d'essai gratuit.` : ""}`}
      />

      <section className="frame">
        <div className="rails section" style={{ paddingTop: 24 }}>
          <PriceCards note />
          <p className="faint" style={{ fontSize: 14, marginTop: 20 }}>{vatNotice} Paiement au mois uniquement. Offre réservée aux professionnels. Voir les <Link href="/cgv" style={{ textDecoration: "underline" }}>conditions de vente</Link>.</p>
        </div>
      </section>

      <section className="frame alt">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Le détail</span>
            <h2 className="display-m">Ce que vous avez <span className="serif">dans chaque formule</span>.</h2>
          </div>
          <div className="table-wrap">
            <table className="cmp cmp--2">
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
          <p className="faint" style={{ fontSize: 14, marginTop: 16 }}>SAV sous 48 h garanti (Tout compris) : prise en charge en moins de 48 h, {sav.hours}. {sav.sunday}</p>
        </div>
      </section>

      <section className="frame">
        <div className="rails section faq-grid">
          <h2 className="display-m">Questions <span className="serif">sur les prix</span>.</h2>
          <div className="faq">
            {faq.map((f) => (
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
