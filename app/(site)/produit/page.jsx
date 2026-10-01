import Link from "next/link";
import PageHero from "@/components/PageHero";
import Phone from "@/components/Phone";
import WalletCard from "@/components/WalletCard";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import Fork from "@/components/Fork";
import { PROGRAMS } from "@/lib/programs";

export const metadata = {
  title: "Le produit",
  description: "Carte de fidélité Apple Wallet et Google Wallet, tampons sécurisés, messages sur le téléphone de vos clients, relances automatiques et chiffres clairs.",
};

/* Ce que fait la carte, avec la formule qui le débloque. */
const features = [
  { i: "wallet", t: "Dans le téléphone", d: "iPhone et Android. Rien à télécharger.", plan: "Toutes" },
  { i: "stamp", t: "Tampons sécurisés", d: "C'est votre équipe qui tamponne. Pas de triche.", plan: "Toutes" },
  { i: "chart", t: "Vos chiffres", d: "Clients, passages, cadeaux. Sur votre téléphone.", plan: "Toutes" },
  { i: "sparkle", t: "Carte avec vos photos", d: "Votre logo, vos couleurs, vos photos.", plan: "Premium" },
  { i: "bell", t: "Vos offres sur leur téléphone", d: "Comme un SMS, sans payer chaque envoi.", plan: "Premium" },
  { i: "clock", t: "Relance automatique", d: "Absent depuis 30 jours ? Un message part tout seul.", plan: "Pro" },
  { i: "cake", t: "Cadeau d'anniversaire", d: "Le jour J, le cadeau arrive sur sa carte.", plan: "Pro" },
  { i: "heart", t: "Avis Google", d: "Après sa 3e visite, on lui demande un avis.", plan: "Pro" },
];
const chip = { Toutes: "chip", Premium: "chip chip-orange", Pro: "chip chip-violet" };

export default function ProduitPage() {
  return (
    <>
      <PageHero
        label="Le produit"
        title={<>Tout ce que fait <span className="serif">votre carte</span>.</>}
        lead="Une carte dans le téléphone de vos clients. Un tampon à chaque passage. Vous, vous voyez qui revient."
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
                <span className={chip[f.plan]} style={{ justifySelf: "start" }}>{f.plan === "Toutes" ? "Toutes les formules" : f.plan === "Premium" ? "Premium et Pro" : "Pro"}</span>
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
            <span className="label">Pas de triche</span>
            <h2 className="display-l reveal">Un tampon = <span className="serif">un vrai passage</span>.</h2>
            <ol className="list reveal">
              {["Le client montre sa carte.", "Votre employé la scanne.", "Le tampon s'ajoute. Tout de suite."].map((t, i) => (
                <li key={t} style={{ color: "var(--ink)", fontWeight: 600 }}><span className="check">{i + 1}</span>{t}</li>
              ))}
            </ol>
            <p className="muted">Deux scans trop rapprochés ? Le second est refusé.</p>
          </div>
          <div className="reveal" data-delay="2" style={{ position: "relative", display: "grid", placeItems: "center", minHeight: 440 }}>
            <div className="sun" style={{ width: 360, height: 360, opacity: 0.7 }} aria-hidden="true" />
            <WalletCard theme="plage" animateStamp style={{ position: "relative", transform: "rotate(-4deg)" }} />
            <Mascot pose="stamp" size={220} style={{ position: "absolute", right: "-6px", bottom: "-10px" }} title="Walti ajoute un tampon" />
          </div>
        </div>
      </section>

      {/* Types de carte */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label">8 types de carte</span>
            <h2 className="display-l reveal">Le cadeau qui va avec <span className="serif">votre commerce</span>.</h2>
          </div>
          <div className="grid cols-4">
            {PROGRAMS.map((m, i) => (
              <div key={m.id} className="cell feature reveal" data-delay={(i % 4) + 1}>
                <span className="step-icon"><Icon name={m.icon} size={20} /></span>
                <h3>{m.name}</h3>
                <p>{m.line}</p>
                <span className="chip chip-orange" style={{ justifySelf: "start" }}>{m.example}</span>
                <span className={m.plan === "essentiel" ? "faint" : ""} style={{ fontSize: 13, fontWeight: 800, color: m.plan === "essentiel" ? undefined : "var(--violet-ink)" }}>{m.plan === "essentiel" ? "Toutes les formules" : "Premium et Pro"}</span>
              </div>
            ))}
          </div>
          <div className="how-foot">
            <p>Vous ne savez pas lequel choisir ? On vous conseille selon votre activité.</p>
            <Link href="/creer" className="btn btn-primary btn-sm">Créer ma carte</Link>
          </div>
        </div>
      </section>

      {/* Comparatif */}
      <section className="frame alt">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Comparez</span>
            <h2 className="display-l reveal">Carton, appli, <span className="serif">ou Walti</span> ?</h2>
          </div>
          <div className="table-wrap reveal">
            <table className="cmp">
              <thead>
                <tr><th></th><th>Carton</th><th>Appli à télécharger</th><th className="hl">Walti</th></tr>
              </thead>
              <tbody>
                {[
                  ["Le client installe quelque chose", "Non", "Oui (et souvent il refuse)", "Non"],
                  ["Se perd", "Souvent", "Rarement", "Jamais"],
                  ["Triche possible", "Oui", "Ça dépend", "Non"],
                  ["Vous savez qui revient", "Non", "Oui", "Oui"],
                  ["Prévenir vos clients", "Impossible", "Si l'appli est ouverte", "Sur leur écran"],
                  ["Installation", "Vous", "Vous", "Vous en 10 min, ou nous"],
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
              { i: "users", t: "Un accès par employé", d: "Vous le coupez quand vous voulez." },
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
