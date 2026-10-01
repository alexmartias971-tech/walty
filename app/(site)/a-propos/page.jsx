import Link from "next/link";
import PageHero from "@/components/PageHero";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import Fork from "@/components/Fork";

export const metadata = {
  title: "À propos",
  description: "Walti est né en Guadeloupe pour les commerces de Guadeloupe : une carte de fidélité dans le téléphone de vos clients, installée sur place si vous le voulez.",
};

export default function AProposPage() {
  return (
    <>
      <PageHero
        label="À propos"
        title={<>Né <span className="serif">au comptoir</span>.</>}
        lead="Les cartons se perdent. Les applis coûtent cher et viennent de loin. Walti est né ici, pour les commerces d'ici."
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Mascot pose="wave" size={280} title="Walti vous dit bonjour" />
        </div>
      </PageHero>

      <section className="frame">
        <div className="rails section duo">
          <p className="big-quote reveal">« Un commerce qui fidélise, c'est un commerce qui dure. »</p>
          <div className="stack reveal" style={{ "--gap": "16px" }} data-delay="1">
            <p className="lead" style={{ maxWidth: "none" }}>On vient chez vous. On installe la carte. On reste joignable sur WhatsApp.</p>
            <p className="muted">Bientôt, vous pourrez aussi créer votre carte en ligne avec notre agent IA.</p>
            <p className="muted"><strong style={{ color: "var(--ink)" }}>Walti</strong>, c'est le petit nom du « wallet », le portefeuille du téléphone où vit la carte. C'est aussi notre mascotte.</p>
          </div>
        </div>
      </section>

      <section className="frame alt">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Ce qui compte pour nous</span>
            <h2 className="display-l reveal">4 promesses.</h2>
          </div>
          <div className="grid cols-4">
            {[
              { i: "pin", t: "On se déplace", d: "Un visage, un numéro, une réponse sur WhatsApp." },
              { i: "sparkle", t: "C'est simple", d: "Votre équipe sait tamponner en 5 minutes." },
              { i: "shield", t: "C'est clair", d: "Prix affichés. Sans engagement. Vos données restent à vous." },
              { i: "leaf", t: "Zéro papier", d: "Plus de cartons à imprimer ni à commander." },
            ].map((v, i) => (
              <div key={v.t} className="cell feature reveal" data-delay={i + 1}>
                <span className="step-icon"><Icon name={v.i} size={20} /></span>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="frame">
        <div className="rails section duo flip">
          <div className="stack" style={{ "--gap": "20px" }}>
            <span className="label">Où on intervient</span>
            <h2 className="display-l">Toute <span className="serif">la Guadeloupe</span>.</h2>
            <p className="lead">Roulottes, snacks, ongleries, karting, coffee shops : on vient chez vous.</p>
            <Link href="/contact" className="btn btn-dark" style={{ justifySelf: "start" }}>On passe vous voir <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
          </div>
          <div className="grid cols-2">
            {[
              { t: "Grande-Terre", d: "Pointe-à-Pitre, Les Abymes, Le Gosier, Sainte-Anne, Saint-François…" },
              { t: "Basse-Terre", d: "Baie-Mahault, Petit-Bourg, Basse-Terre, Deshaies…" },
              { t: "Les îles", d: "Marie-Galante, Les Saintes, La Désirade : sur rendez-vous." },
              { t: "Et après", d: "Martinique et Guyane : parlons-en." },
            ].map((c) => (
              <div key={c.t} className="cell feature">
                <span className="step-icon"><Icon name="pin" size={20} /></span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Fork />
    </>
  );
}
