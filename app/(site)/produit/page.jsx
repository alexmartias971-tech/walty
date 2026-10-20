import Link from "next/link";
import PageHero from "@/components/PageHero";
import Phone from "@/components/Phone";
import WalletCard from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import Fork from "@/components/Fork";

export const metadata = {
  title: "Le produit",
  description: "Carte de fidélité à tampons dans Apple Wallet et Google Wallet : tampons sécurisés, un produit offert ou une remise au bout. Avec Tout compris : statistiques, notifications, anniversaire, avis Google.",
};

/* Ce que fait la carte, avec la formule qui le comprend. */
const features = [
  { i: "wallet", t: "Dans le téléphone", d: "iPhone et Android. Pas d'appli Walty à télécharger.", plan: "both" },
  { i: "stamp", t: "Tampons sécurisés", d: "C'est votre équipe qui tamponne, pas le client.", plan: "both" },
  { i: "gift", t: "Un cadeau au bout", d: "Carte pleine : un produit offert ou une remise. Vous choisissez.", plan: "both" },
  { i: "sparkle", t: "Carte sur mesure", d: "Vos photos, des visuels de saison.", plan: "tc" },
  { i: "chart", t: "Vos statistiques", d: "Clients qui reviennent, passages, cadeaux, argent rapporté (estimé).", plan: "tc" },
  { i: "bell", t: "Vos offres sur leur téléphone", d: "Jusqu'à 4 notifications par semaine. Vous écrivez, on envoie.", plan: "tc" },
  { i: "cake", t: "Offre d'anniversaire", d: "Le jour J, l'offre arrive toute seule sur sa carte.", plan: "tc" },
  { i: "heart", t: "Avis Google et parrainage", d: "Un lien vers votre fiche Google sur la carte. Et vos clients font venir leurs amis.", plan: "tc" },
];
const chip = { both: ["chip", "Les 2 formules"], tc: ["chip chip-violet", "Tout compris"] };

/* Exemples de cartes à tampons, selon le commerce. */
const examples = [
  { i: "store", t: "Roulotte, snack", d: "Le 10e bokit offert.", k: "Produit offert" },
  { i: "gift", t: "Coffee shop", d: "8 cafés, 1 matcha glacé offert.", k: "Produit offert" },
  { i: "percent", t: "Onglerie", d: "-50 % sur la 6e pose.", k: "Remise" },
  { i: "stamp", t: "Karting, loisirs", d: "Au 5e tampon, 1 session offerte.", k: "Produit offert" },
];

export default function ProduitPage() {
  return (
    <>
      <PageHero
        label="Le produit"
        title={<>Tout ce que fait <span className="serif">votre carte</span>.</>}
        lead="Une carte dans le téléphone de vos clients. Un tampon à chaque passage, un cadeau au bout."
      >
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <Phone theme="lagon" notif={{ app: "Coffee Plage", text: "Ton 5e tampon est là ☕ Plus que 3 avant ton matcha offert." }} />
        </div>
      </PageHero>

      {/* Ce qui est inclus */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Ce qu'elle fait</span>
            <h2 className="display-l">8 choses, <span className="serif">pas plus</span>.</h2>
          </div>
          <div className="grid cols-4">
            {features.map((f, i) => (
              <div key={f.t} className="cell feature reveal" data-delay={(i % 4) + 1}>
                <span className="step-icon"><Icon name={f.i} size={20} /></span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
                <span className={chip[f.plan][0]} style={{ justifySelf: "start" }}>{chip[f.plan][1]}</span>
              </div>
            ))}
          </div>
          <div className="how-foot">
            <p>Le détail formule par formule ?</p>
            <Link href="/tarifs" className="btn btn-dark btn-sm">Comparer les formules</Link>
          </div>
        </div>
      </section>

      {/* Anti-triche */}
      <section className="frame alt">
        <div className="rails section duo">
          <div className="stack" style={{ "--gap": "22px" }}>
            <span className="label">Anti-triche</span>
            <h2 className="display-l reveal">Un tampon = <span className="serif">un vrai passage</span>.</h2>
            <ol className="list reveal">
              {["Le client montre sa carte.", "Votre employé la scanne.", "Le tampon s'ajoute. Tout de suite."].map((t, i) => (
                <li key={t} style={{ color: "var(--ink)", fontWeight: 600 }}><span className="check">{i + 1}</span>{t}</li>
              ))}
            </ol>
            <p className="muted">Deux scans trop rapprochés ? Le second est refusé.</p>
          </div>
          <div className="reveal triche-visual" data-delay="2" style={{ position: "relative", display: "grid", placeItems: "center", minHeight: 440 }}>
            <div className="sun" style={{ width: 360, height: 360, opacity: 0.7 }} aria-hidden="true" />
            <WalletCard theme="plage" animateStamp style={{ position: "relative", transform: "rotate(-4deg)" }} />
            <Mascot pose="stamp" size={220} style={{ position: "absolute", right: "-6px", bottom: "-10px" }} title="Walty ajoute un tampon" />
          </div>
        </div>
      </section>

      {/* La carte à tampons */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">La carte à tampons</span>
            <h2 className="display-l reveal">Le cadeau qui va avec <span className="serif">votre commerce</span>.</h2>
            <p className="lead">Un tampon à chaque passage. Quand la carte est pleine, vous offrez un produit ou une remise. C'est vous qui choisissez.</p>
          </div>
          <div className="grid cols-4">
            {examples.map((m, i) => (
              <div key={m.t} className="cell feature reveal" data-delay={(i % 4) + 1}>
                <span className="step-icon"><Icon name={m.i} size={20} /></span>
                <h3>{m.t}</h3>
                <p>{m.d}</p>
                <span className="chip chip-orange" style={{ justifySelf: "start" }}>{m.k}</span>
              </div>
            ))}
          </div>
          <div className="how-foot">
            <p>Vous hésitez sur le cadeau ? On vous conseille selon votre activité.</p>
            <Link href="/contact" className="btn btn-primary btn-sm">Réserver une démo</Link>
          </div>
        </div>
      </section>

      {/* Comparatif */}
      <section className="frame alt">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Comparez</span>
            <h2 className="display-l reveal">Carton, appli, <span className="serif">ou Walty</span>{" "}?</h2>
          </div>
          <div className="table-wrap reveal">
            <table className="cmp">
              <thead>
                <tr><th></th><th>Carton</th><th>Appli à télécharger</th><th className="hl">Walty</th></tr>
              </thead>
              <tbody>
                {[
                  ["Le client installe quelque chose", "Non", "Oui (et souvent il refuse)", "Non"],
                  ["Se perd", "Souvent", "Rarement", "Non, elle reste dans le téléphone"],
                  ["Triche possible", "Oui (stylo)", "Ça dépend", "Très difficile"],
                  ["Vous avez la liste de vos clients", "Non", "Oui", "Oui"],
                  ["Prévenir vos clients", "Impossible", "Si l'appli est ouverte", "Sur leur écran (Tout compris)"],
                  ["Installation", "Vous", "Vous", "On s'en occupe"],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className="t-no">{r[1]}</td>
                    <td className="t-no">{r[2]}</td>
                    <td className="hl t-yes">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Données */}
      <section className="frame">
        <div className="rails section duo flip">
          <div className="stack" style={{ "--gap": "20px" }}>
            <span className="label">Vos données</span>
            <h2 className="display-l">Vos clients <span className="serif">restent à vous</span>.</h2>
            <p className="lead">On ne revend rien. Si vous partez, vous gardez votre liste de clients.</p>
          </div>
          <div className="grid cols-2">
            {[
              { i: "shield", t: "Le strict minimum", d: "Prénom et téléphone. L'anniversaire si le client veut." },
              { i: "download", t: "Votre liste", d: "En fichier Excel, quand vous voulez." },
              { i: "users", t: "Les accès de l'équipe", d: "1 accès avec Essentiel, autant que vous voulez avec Tout compris. Vous les coupez quand vous voulez." },
              { i: "shield", t: "Protégé", d: "Connexion chiffrée, mot de passe pour chaque accès." },
            ].map((c) => (
              <div key={c.t} className="cell feature">
                <span className="step-icon"><Icon name={c.i} size={20} /></span>
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
