import Link from "next/link";
import PageHero from "@/components/PageHero";
import Phone from "@/components/Phone";
import WalletCard from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";

export const metadata = {
  title: "Le produit",
  description: "Carte de fidélité Apple Wallet et Google Wallet, tampons sécurisés, notifications push, relances automatiques, bilans chiffrés. Tout ce que fait Walti pour votre commerce.",
};

const features = [
  { i: "wallet", t: "Apple Wallet + Google Wallet", d: "Une seule carte, compatible iPhone et Android. Elle se range à côté de la carte bancaire, toujours à portée de main." },
  { i: "sparkle", t: "Design sur mesure", d: "Vos photos, votre logo, vos couleurs. Des visuels saisonniers pour Noël, le Carnaval ou la fête des mères." },
  { i: "stamp", t: "Tampons sécurisés", d: "C'est votre équipe qui scanne la carte, jamais le client. Un délai minimum empêche les scans répétés." },
  { i: "bell", t: "Notifications push", d: "Sur l'écran verrouillé, tout de suite ou programmées. 2 par semaine incluses, sans coût par envoi." },
  { i: "heart", t: "Relance « tu nous manques »", d: "Un client ne revient pas depuis 30 jours ? Walti lui envoie un message automatiquement." },
  { i: "cake", t: "Offre d'anniversaire", d: "Le jour J, un cadeau apparaît sur sa carte. Le geste qui fait revenir, sans que vous y pensiez." },
  { i: "chart", t: "Bilan chiffré", d: "Inscrits, passages, clients qui décrochent : un bilan clair par WhatsApp, tous les 3 mois ou chaque mois." },
  { i: "nfc", t: "Plaque NFC avis Google", d: "Vos clients laissent un avis en approchant leur téléphone. Offerte en formule Premium." },
];

export default function ProduitPage() {
  return (
    <>
      <PageHero
        index="P1"
        label="Le produit"
        title={<>Tout ce que fait <span className="serif">votre carte</span>.</>}
        lead="Une carte dans le téléphone de vos clients, un outil tout simple pour votre équipe au comptoir. Le reste, c'est nous qui nous en occupons."
      >
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <Phone theme="lagon" notif={{ app: "Coffee Plage", text: "Ton 5e tampon est là ☕ Plus que 3 avant ton matcha glacé offert." }} />
        </div>
      </PageHero>

      {/* Fonctionnalités */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Ce qui est inclus</span>
            <p className="lead">Tout ce qu'il faut pour transformer un client de passage en habitué, sans rien installer dans votre caisse.</p>
          </div>
          <div className="grid cols-4">
            {features.map((f, i) => (
              <div key={f.t} className="cell feature reveal" data-delay={(i % 4) + 1}>
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anti-triche */}
      <section className="frame">
        <div className="rails section">
          <div className="notif-grid">
            <div className="stack" style={{ "--gap": "24px" }}>
              <span className="label">Sécurité</span>
              <h2 className="display-m reveal">Un tampon = <span className="serif">un vrai passage</span>.</h2>
              <p className="lead reveal">Avec un carton, n'importe qui peut ajouter un tampon avec un stylo. Avec Walti, chaque tampon est enregistré, daté, et ajouté par votre équipe.</p>
              <ol className="list reveal" style={{ counterReset: "s" }}>
                {[
                  "Le client montre sa carte Wallet au comptoir.",
                  "Votre employé la scanne avec son téléphone, connecté à son propre accès caisse.",
                  "Le tampon s'ajoute en direct sur la carte du client. Un second scan trop rapproché est refusé.",
                  "Vous voyez l'historique : qui a tamponné, quand, pour quel client.",
                ].map((t, i) => (
                  <li key={i}><span className="check">{i + 1}</span>{t}</li>
                ))}
              </ol>
            </div>
            <div className="reveal" data-delay="2" style={{ position: "relative", display: "grid", placeItems: "center", minHeight: 460 }}>
              <div className="sun" style={{ width: 380, height: 380, opacity: 0.8 }} aria-hidden="true" />
              <WalletCard theme="plage" animateStamp style={{ position: "relative", transform: "rotate(-4deg)" }} />
              <Mascot pose="stamp" size={230} style={{ position: "absolute", right: "-10px", bottom: "-10px" }} title="Walti ajoute un tampon" />
            </div>
          </div>
        </div>
      </section>

      {/* Mécaniques */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Mécaniques</span>
            <h2 className="display-m reveal">La récompense qui colle à <span className="serif">votre commerce</span>.</h2>
          </div>
          <div className="grid cols-4">
            {[
              { t: "Tampons", e: "10 bokits achetés = 1 offert", d: "Le classique, compris par tout le monde. Idéal pour les petits tickets et les habitués." },
              { t: "Points", e: "1 € dépensé = 1 point", d: "Pour les paniers variables : restaurants, boutiques, instituts." },
              { t: "Cashback", e: "5 % reversés sur la carte", d: "Le client voit sa cagnotte grandir et revient la dépenser." },
              { t: "Niveaux", e: "Rookie → Pilote → Légende", d: "Pour les loisirs et le sport : on monte de niveau à chaque visite." },
            ].map((m, i) => (
              <div key={m.t} className="cell feature reveal" data-delay={i + 1}>
                <h3 className="display-s">{m.t}</h3>
                <span className="chip chip-orange" style={{ justifySelf: "start" }}>{m.e}</span>
                <p>{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparatif */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Comparatif</span>
            <h2 className="display-m reveal">Carton, appli, ou Walti ?</h2>
          </div>
          <div className="table-wrap reveal">
            <table className="cmp">
              <thead>
                <tr><th></th><th>Carton à tampons</th><th>Appli à télécharger</th><th className="hl">Walti</th></tr>
              </thead>
              <tbody>
                {[
                  ["Le client doit installer quelque chose", "Non", "Oui, et la plupart refusent", "Non, déjà dans le téléphone"],
                  ["Risque de perte", "Élevé", "Faible", "Aucun"],
                  ["Triche possible", "Oui (stylo, tampon copié)", "Selon l'appli", "Non, scan par votre équipe"],
                  ["Vous savez qui revient", "Non", "Oui", "Oui"],
                  ["Prévenir vos clients", "Impossible", "Si l'appli est ouverte", "Notification sur l'écran verrouillé"],
                  ["Coûts cachés", "Impression, commandes, transport", "Développement, mises à jour", "Aucun, tout est inclus"],
                  ["Installation", "À faire soi-même", "À faire soi-même", "Sur place, par Walti"],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className="no">{r[1]}</td>
                    <td className="no">{r[2]}</td>
                    <td className="hl yes">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Données */}
      <section className="sable-section">
        <div className="rails section">
          <div className="local-grid">
            <div className="stack" style={{ "--gap": "24px" }}>
              <span className="label">Vos données</span>
              <h2 className="display-m">Vos clients <span className="serif">restent à vous</span>.</h2>
              <p className="lead">Walti traite les données de vos clients pour votre compte, en tant que sous-traitant au sens du RGPD. Elles ne sont jamais revendues ni utilisées pour autre chose. Si vous partez, vous récupérez votre fichier.</p>
            </div>
            <div className="grid cols-2 local-cells">
              {[
                { i: "shield", t: "Données minimales", d: "Prénom, téléphone ou e-mail, date d'anniversaire si le client le souhaite. Rien de plus." },
                { i: "download", t: "Export à tout moment", d: "Votre fichier client en un fichier Excel, sur simple demande." },
                { i: "users", t: "Accès séparés", d: "Chaque employé a son propre accès caisse, que vous pouvez couper à tout moment." },
                { i: "shield", t: "Connexion chiffrée", d: "Tous les échanges passent en HTTPS et chaque accès est protégé par un mot de passe." },
              ].map((c) => (
                <div key={c.t} className="cell">
                  <span className="local-icon"><Icon name={c.i} size={22} /></span>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="frame">
        <div className="rails section end-cta">
          <Mascot pose="wave" size={170} title="Walti vous salue" />
          <h2 className="display-l">Voyez-la <span className="serif">en vrai</span>.</h2>
          <p className="lead">On vous installe une carte d'essai à votre nom, sur votre téléphone, pendant le rendez-vous.</p>
          <div className="row" style={{ justifyContent: "center", "--gap": "22px" }}>
            <Link href="/#demo" className="btn btn-primary btn-lg">Réserver ma démo gratuite <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
            <Link href="/tarifs" className="text-link">Voir les tarifs</Link>
          </div>
        </div>
      </section>
    </>
  );
}
