import Link from "next/link";
import PageHero from "@/components/PageHero";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";

export const metadata = {
  title: "À propos",
  description: "Walti est né en Guadeloupe pour les commerces de Guadeloupe : une carte de fidélité digitale haut de gamme, installée sur place, à un prix pensé pour l'économie locale.",
};

export default function AProposPage() {
  return (
    <>
      <PageHero
        index="A1"
        label="À propos"
        title={<>Une idée née <span className="serif">au comptoir</span>.</>}
        lead="Walti est né d'un constat simple, fait sur le terrain, dans les commerces de Guadeloupe : les cartons à tampons se perdent, et les solutions digitales sont soit trop chères, soit pensées pour l'Hexagone."
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Mascot pose="wave" size={280} title="Walti vous dit bonjour" />
        </div>
      </PageHero>

      <section className="frame">
        <div className="rails section">
          <div className="notif-grid">
            <div className="stack" style={{ "--gap": "28px" }}>
              <span className="label">Notre histoire</span>
              <p className="big-quote reveal">« Un commerce qui fidélise, c'est un commerce qui dure. »</p>
            </div>
            <div className="stack reveal" style={{ "--gap": "18px" }} data-delay="1">
              <p className="lead" style={{ maxWidth: "none" }}>En Guadeloupe, on connaît le prix de tout ce qui vient de loin : les cartons imprimés, les commandes, le transport. Et on connaît aussi la force d'un commerce de quartier où l'on revient parce qu'on s'y sent reconnu.</p>
              <p className="muted">Les solutions de fidélité digitales existent, mais elles vous envoient un lien et vous laissent vous débrouiller. Walti fait l'inverse : on crée votre carte, on vient l'installer, on forme votre équipe, et on reste joignable. Notre propre outil, développé pour nous, nous permet de garder des prix accessibles à un snack comme à une enseigne.</p>
              <p className="muted">Le nom ? <strong style={{ color: "var(--ink)" }}>Walti</strong>, c'est le petit nom de votre wallet : le portefeuille du téléphone, là où vit la carte de vos clients. Et c'est aussi notre mascotte, un petit porte-monnaie qui tamponne plus vite que son ombre.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Ce qui nous guide</span>
            <h2 className="display-m reveal">Ce à quoi on <span className="serif">tient</span>.</h2>
          </div>
          <div className="grid cols-4 values">
            {[
              { i: "pin", t: "Proximité", d: "On se déplace. Vous avez un visage, un numéro, une réponse sur WhatsApp." },
              { i: "sparkle", t: "Simplicité", d: "Rien à installer, rien à configurer. Votre équipe sait tamponner en 5 minutes." },
              { i: "shield", t: "Honnêteté", d: "Sans engagement, prix affichés, pas de frais cachés. Vos données restent à vous." },
              { i: "leaf", t: "Zéro papier", d: "Plus d'impression ni de transport de cartes. Moins de déchets, moins de coûts." },
            ].map((v, i) => (
              <div key={v.t} className="cell value reveal" data-delay={i + 1}>
                <span className="idx">0{i + 1}</span>
                <h3>{v.t}</h3>
                <p className="muted">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sable-section">
        <div className="rails section">
          <div className="local-grid">
            <div className="stack" style={{ "--gap": "24px" }}>
              <span className="label">Notre terrain</span>
              <h2 className="display-m">De Pointe-à-Pitre à <span className="serif">Marie-Galante</span>.</h2>
              <p className="lead">Roulottes de plage, snacks de bord de route, ongleries, karting, coffee shops : Walti a été pensé pour les commerces qui font vivre l'île, avec des prix adaptés à l'économie locale.</p>
              <Link href="/#demo" className="btn btn-dark" style={{ justifySelf: "start" }}>On passe vous voir <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
            </div>
            <div className="grid cols-2 local-cells">
              {[
                { t: "Grande-Terre", d: "Pointe-à-Pitre, Les Abymes, Le Gosier, Sainte-Anne, Saint-François, Le Moule…" },
                { t: "Basse-Terre", d: "Baie-Mahault, Petit-Bourg, Basse-Terre, Deshaies, Bouillante…" },
                { t: "Les îles", d: "Marie-Galante, Les Saintes, La Désirade, sur rendez-vous." },
                { t: "Et au-delà", d: "Martinique et Guyane : parlons-en." },
              ].map((c) => (
                <div key={c.t} className="cell">
                  <span className="local-icon"><Icon name="pin" size={22} /></span>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
