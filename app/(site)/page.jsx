import Link from "next/link";
import { Suspense } from "react";
import Mascot from "@/components/Mascot";
import Phone from "@/components/Phone";
import WalletCard from "@/components/WalletCard";
import Icon from "@/components/Icon";
import ContactForm from "./contact/ContactForm";
import { plans, vatNotice } from "@/lib/offer";
import { site } from "@/lib/site.config";

const highlights = {
  essentiel: ["Carte Apple & Google Wallet à vos couleurs", "2 notifications par semaine", "Installation et formation sur place"],
  premium: ["Tout Essentiel", "1 campagne par mois écrite pour vous", "4 visuels de saison par an", "Plaque NFC avis Google offerte"],
  enseigne: ["Tout Premium", "Une carte pour toutes vos boutiques", "Import de votre fichier client"],
};

export default function Home() {
  return (
    <>
      {/* ═════ 1. HERO — une promesse, une action ═════ */}
      <section className="hero">
        <div className="hero-sky" aria-hidden="true">
          <div className="sun hero-sun" />
          <div className="hero-sea">{Array.from({ length: 7 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}</div>
        </div>

        <div className="rails hero-rails">
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 className="display-xl hero-title reveal">
                <span className="nw">Faites-les</span> <span className="grad-text">revenir.</span>
              </h1>
              <p className="lead hero-lead reveal" data-delay="1">
                Walti crée la carte de fidélité de votre commerce et la glisse dans le téléphone de vos clients, juste à côté de leur carte bancaire. On vient l'installer chez vous. Vous, vous tamponnez.
              </p>
              <div className="hero-actions reveal" data-delay="2">
                <Link href="#demo" className="btn btn-primary btn-lg">Réserver ma démo gratuite <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
                <Link href="#prix" className="text-link">Voir les prix</Link>
              </div>
              <ul className="reassure reveal" data-delay="3">
                <li><Icon name="check" size={16} stroke={2.2} /> 15 minutes, chez vous</li>
                <li><Icon name="check" size={16} stroke={2.2} /> Sans engagement</li>
                <li><Icon name="check" size={16} stroke={2.2} /> Dès 29 €/mois</li>
              </ul>
            </div>

            <div className="stage" aria-hidden="true">
              <div className="stage-floor" />
              <div className="stage-phone">
                <Phone theme="plage" cardBottom={-6} />
              </div>
              <span className="stamp-pop">+1</span>
              <Mascot pose="stamp" size={320} impact={false} className="stage-mascot" title="Walti ajoute un tampon sur la carte" />
            </div>
          </div>
        </div>
      </section>

      {/* ═════ 2. LE PROBLÈME ═════ */}
      <section className="frame">
        <div className="rails section problem">
          <div className="problem-text">
            <h2 className="display-l reveal">Le carton à tampons, tout le monde le <span className="serif">perd</span>.</h2>
            <p className="lead reveal" data-delay="1">
              Oublié dans une poche, passé à la machine, recopié au stylo… Et de votre côté, impossible de savoir qui revient, ni de prévenir vos habitués quand vous avez une nouveauté.
            </p>
            <p className="lead reveal" data-delay="2" style={{ color: "var(--ink)" }}>
              Avec Walti, la carte ne quitte plus le téléphone. Et vous pouvez enfin parler à vos clients.
            </p>
          </div>
          <div className="problem-visual reveal" data-delay="1" aria-hidden="true">
            <div className="paper-card">
              <div className="paper-title">Carte de fidélité</div>
              <div className="paper-stamps">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < 4 ? "on" : ""} />)}</div>
              <div className="paper-tear" />
            </div>
            <svg className="hand-arrow" viewBox="0 0 120 60" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 40 C 30 12, 70 8, 104 26" />
              <path d="M92 16 L105 27 L89 33" />
            </svg>
            <WalletCard theme="hibiscus" className="problem-card" />
          </div>
        </div>
      </section>

      {/* ═════ 3. COMMENT ÇA MARCHE (fond sable) ═════ */}
      <section className="sable-section" id="comment">
        <div className="rails section">
          <div className="how-head">
            <span className="label">Comment ça marche</span>
            <h2 className="display-l">Trois étapes. <span className="serif">Les deux premières</span>, c'est nous.</h2>
          </div>
          <ol className="how">
            <li className="how-step reveal">
              <div className="how-visual">
                <WalletCard theme="lagon" compact />
              </div>
              <span className="how-n">1</span>
              <h3>On crée votre carte</h3>
              <p>Vos couleurs, votre logo, vos photos et la récompense de votre choix. Vous validez l'aperçu, on s'occupe du reste.</p>
            </li>
            <li className="how-step reveal" data-delay="1">
              <div className="how-visual">
                <div className="counter-sign">
                  <span className="counter-sign-title">Votre carte de fidélité est ici</span>
                  <span className="counter-qr" />
                  <span className="counter-sign-sub">Scannez avec l'appareil photo</span>
                </div>
              </div>
              <span className="how-n">2</span>
              <h3>On l'installe chez vous</h3>
              <p>On pose le QR code au comptoir et on montre à votre équipe comment tamponner. Vos clients ajoutent la carte en deux secondes, sans télécharger d'appli.</p>
            </li>
            <li className="how-step reveal" data-delay="2">
              <div className="how-visual">
                <div className="mini-notif">
                  <span className="lock-notif-icon" />
                  <div><b>Coffee Plage</b><p>Ça fait un mois ! Ton café glacé t'attend ☕</p></div>
                </div>
                <div className="mini-notif mini-notif-2">
                  <span className="lock-notif-icon" />
                  <div><b>Coffee Plage</b><p>+1 tampon. Plus que 2 avant ton matcha offert.</p></div>
                </div>
              </div>
              <span className="how-n">3</span>
              <h3>Vous tamponnez, ils reviennent</h3>
              <p>Un scan à chaque passage. Et si un client ne revient pas pendant un mois, Walti lui envoie un petit message à votre place.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* ═════ 4. NOTIFICATIONS ═════ */}
      <section className="frame">
        <div className="rails section notif-grid">
          <div className="lock-wrap reveal" aria-hidden="true">
            <div className="lock glass">
              <div className="lock-time">18:42</div>
              <div className="lock-date">vendredi 3 octobre</div>
              {[
                { a: "Le Bokit du Lagon", t: "On est à la plage de Bois-Jolan ce soir ! Ton 10e bokit est offert 🌅", d: 0 },
                { a: "Studio Hibiscus", t: "Il reste 2 créneaux samedi matin. On te garde une place ?", d: 1 },
                { a: "Coffee Plage", t: "Nouveau : matcha coco glacé. Le premier est à -50 % pour toi.", d: 2 },
              ].map((n) => (
                <div key={n.a} className="lock-notif" style={{ "--d": n.d }}>
                  <span className="lock-notif-icon" />
                  <div><div className="phone-notif-head"><b>{n.a}</b><span>maintenant</span></div><p>{n.t}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="stack" style={{ "--gap": "22px" }}>
            <span className="label">Notifications</span>
            <h2 className="display-l reveal">Un message qui arrive <span className="serif">vraiment</span>.</h2>
            <p className="lead reveal">
              Une nouveauté, un créneau libre, un anniversaire : votre message s'affiche sur l'écran verrouillé de vos clients, comme un SMS. Un statut WhatsApp, lui, ne touche que ceux qui pensent à le regarder.
            </p>
            <p className="muted reveal">Deux notifications par semaine sont incluses, sans frais d'envoi. Vous les écrivez en une minute, ou on les écrit pour vous.</p>
          </div>
        </div>
      </section>

      {/* ═════ 5. PRIX ═════ */}
      <section className="frame" id="prix">
        <div className="rails section">
          <div className="price-head">
            <h2 className="display-l reveal">Un prix simple, <span className="serif">sans engagement</span>.</h2>
            <p className="lead reveal">Pas de frais cachés, pas de coût par notification. Vous arrêtez quand vous voulez.</p>
          </div>
          <div className="price-row">
            {plans.map((p, i) => (
              <div key={p.id} className={`price-mini glass reveal ${p.featured ? "featured" : ""}`} data-delay={i + 1}>
                {p.featured && (
                  <div className="sitter" aria-hidden="true">
                    <span className="bubble">Celle-là, je la conseille !</span>
                    <Mascot pose="sit" size={180} className="sitter-mascot" title="Walti est assis sur la formule Premium" />
                  </div>
                )}
                <h3 className="display-s">{p.name}</h3>
                <div className="price-num">{p.fromPrice && <small>dès </small>}{p.monthly}<span> €/mois</span></div>
                <p className="muted" style={{ fontSize: 14 }}>{p.for}</p>
                <ul className="list">
                  {highlights[p.id].map((f) => <li key={f}><span className="check"><Icon name="check" size={12} stroke={2.4} /></span>{f}</li>)}
                </ul>
                <Link href={`/?formule=${p.id}#demo`} scroll={false} className={`btn ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                  {p.id === "enseigne" ? "Demander un devis" : "Réserver ma démo"}
                </Link>
              </div>
            ))}
          </div>
          <div className="price-foot">
            <p className="faint">Tarif fondateur : les 10 premiers commerces gardent leur prix à vie. {vatNotice}</p>
            <Link href="/tarifs" className="text-link">Comparer les formules en détail</Link>
          </div>
        </div>
      </section>

      {/* ═════ 6. OBJECTIONS ═════ */}
      <section className="frame">
        <div className="rails section faq-grid">
          <h2 className="display-m">Les questions qu'on nous pose <span className="serif">tout le temps</span>.</h2>
          <div className="faq">
            {[
              { q: "Mes clients doivent-ils télécharger une application ?", a: "Non. La carte s'ajoute dans Apple Wallet sur iPhone ou Google Wallet sur Android, deux applications déjà installées sur leur téléphone. Ils scannent le QR code, tapent leur prénom, et c'est fait." },
              { q: "Et si un client essaie de tricher avec les tampons ?", a: "Il ne peut pas se tamponner lui-même : c'est votre équipe qui scanne sa carte, chacun avec son propre accès. Et un deuxième scan trop rapproché est refusé." },
              { q: "Je ne suis pas à l'aise avec la technique.", a: "Justement, vous n'avez rien à faire de technique. On crée la carte, on vient l'installer, on forme votre équipe, et on reste joignables sur WhatsApp." },
              { q: "Et si j'arrête ?", a: "Essentiel et Premium sont sans engagement : vous arrêtez à la fin du mois, sans frais, et vous gardez la liste de vos clients. Elle est à vous." },
            ].map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus"><Icon name="plus" size={14} stroke={2} /></span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ 7. DÉMO — fin du tunnel ═════ */}
      <section className="frame demo-section" id="demo">
        <div className="sun demo-sun" aria-hidden="true" />
        <div className="rails section demo-grid">
          <div className="demo-copy">
            <h2 className="display-l">On passe vous la <span className="serif">montrer</span> ?</h2>
            <p className="lead">15 minutes chez vous, à l'heure creuse. On installe une carte d'essai sur votre téléphone et vous voyez tout en vrai. Si ça ne vous convient pas, on se quitte bons amis.</p>
            <Mascot pose="wave" size={200} className="demo-mascot" title="Walti vous dit à bientôt" />
            {site.contact.whatsapp && (
              <a className="text-link" href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">Ou écrivez-nous sur WhatsApp</a>
            )}
          </div>
          <Suspense fallback={<div className="form-card glass" style={{ minHeight: 480 }} />}>
            <ContactForm compact />
          </Suspense>
        </div>
      </section>
    </>
  );
}
