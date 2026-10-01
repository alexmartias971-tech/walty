import Link from "next/link";
import Mascot from "@/components/Mascot";
import Phone from "@/components/Phone";
import WalletCard from "@/components/WalletCard";
import Icon from "@/components/Icon";
import PriceCards from "@/components/PriceCards";
import DashPreview from "@/components/DashPreview";
import Fork from "@/components/Fork";
import WalletBadges from "@/components/WalletBadges";
import { founderOffer, trialDays } from "@/lib/offer";

export default function Home() {
  return (
    <>
      {/* ═════ 1. HERO ═════ */}
      <section className="hero">
        <div className="hero-sky" aria-hidden="true">
          <div className="sun hero-sun" />
          <div className="hero-sea">{Array.from({ length: 7 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}</div>
        </div>
        <div className="rails hero-rails">
          <div className="hero-grid">
            <div className="hero-copy">
              <ul className="wallet-badges reveal" aria-label="Compatible avec">
                <li><Icon name="check" size={14} stroke={2.4} /> Compatible Apple Wallet</li>
                <li><Icon name="check" size={14} stroke={2.4} /> Compatible Google Wallet</li>
              </ul>
              <h1 className="display-xl hero-title reveal" data-delay="1">
                La carte de fidélité <span className="grad-text">digitale</span>.
              </h1>
              <p className="hero-lead reveal" data-delay="2">
                Vos clients la gardent dans leur téléphone. Un tampon à chaque passage, un cadeau au bout.
              </p>
              <div className="hero-actions reveal" data-delay="3">
                <Link href="/contact" className="btn btn-primary btn-lg">Réserver une démo <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
                <Link href="/creer" className="btn btn-soon btn-lg">Créer ma carte <span className="soon-tag">Bientôt disponible</span></Link>
              </div>
              <ul className="reassure reveal" data-delay="4">
                <li><Icon name="check" size={17} stroke={2.4} /> Sans appli à télécharger</li>
                {trialDays > 0 && <li><Icon name="check" size={17} stroke={2.4} /> {trialDays} jours gratuits</li>}
                <li><Icon name="check" size={17} stroke={2.4} /> Sans engagement</li>
              </ul>
            </div>
            <div className="hero-visual">
              <div className="stage" aria-hidden="true">
                <div className="stage-floor" />
                <div className="stage-phone"><Phone theme="plage" cardBottom={-6} /></div>
                <span className="stamp-pop">+1</span>
                <Mascot pose="stamp" size={320} impact={false} className="stage-mascot" title="Walti ajoute un tampon sur la carte" />
              </div>
              <WalletBadges />
            </div>
          </div>
        </div>
      </section>

      {/* ═════ 2. COMMENT ÇA MARCHE ═════ */}
      <section className="frame alt" id="comment">
        <div className="rails section">
          <div className="section-head">
            <span className="label">Comment ça marche</span>
            <h2 className="display-l">Simple comme <span className="serif">un tampon</span>.</h2>
          </div>
          <ol className="how">
            <li className="how-step reveal">
              <div className="how-visual"><WalletCard theme="lagon" compact /></div>
              <span className="how-n">1</span>
              <h3>On crée votre carte</h3>
              <p>Vos couleurs, votre logo, votre cadeau. On s'occupe de tout.</p>
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
              <h3>Vos clients la scannent</h3>
              <p>Un QR code sur votre comptoir. Rien à télécharger.</p>
            </li>
            <li className="how-step reveal" data-delay="2">
              <div className="how-visual">
                <div className="mini-notif"><span className="lock-notif-icon" /><div><b>Coffee Plage</b><p>+1 tampon ! Plus que 2 avant ton café offert ☕</p></div></div>
              </div>
              <span className="how-n">3</span>
              <h3>Ils reviennent</h3>
              <p>Un tampon à chaque passage, un cadeau au bout.</p>
            </li>
          </ol>
          <div className="how-foot">
            <p>Pas le temps ou pas à l'aise avec le téléphone ? On vient tout installer chez vous.</p>
            <Link href="/contact" className="btn btn-dark btn-sm">Réserver une démo</Link>
          </div>
        </div>
      </section>

      {/* ═════ 3. AVANT / APRÈS ═════ */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <h2 className="display-l">Le carton, <span className="serif">c'est fini</span>.</h2>
          </div>
          <div className="ba">
            <div className="ba-side ba-before reveal">
              <span className="ba-tag muted">AVANT</span>
              <div className="ba-visual" aria-hidden="true">
                <div className="paper-card">
                  <div className="paper-title">Carte de fidélité</div>
                  <div className="paper-stamps">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < 4 ? "on" : ""} />)}</div>
                  <div className="paper-tear" />
                </div>
              </div>
              <ul className="list">
                {["Perdu, oublié, passé à la machine", "Facile à tricher", "Vous ne savez pas qui revient"].map((t) => (
                  <li key={t}><span className="check x"><Icon name="x" size={12} stroke={2.6} /></span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="ba-side ba-after reveal" data-delay="1">
              <span className="ba-tag orange">AVEC WALTI</span>
              <div className="ba-visual" aria-hidden="true"><WalletCard theme="hibiscus" /></div>
              <ul className="list">
                {["Toujours dans le téléphone", "Tamponnée par votre équipe", "Vous voyez vos chiffres"].map((t) => (
                  <li key={t} style={{ color: "var(--ink)", fontWeight: 600 }}><span className="check"><Icon name="check" size={12} stroke={2.6} /></span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═════ 4. MESSAGES (bloc sombre) ═════ */}
      <section className="frame dark msg-band">
        <div className="rails section duo">
          <div className="reveal" aria-hidden="true">
            <div className="lock">
              <div className="lock-time">18:42</div>
              <div className="lock-date">vendredi 3 octobre</div>
              {[
                { a: "Le Bokit du Lagon", t: "Ce soir on est à Bois-Jolan ! Ton 10e bokit est offert 🌅", d: 0 },
                { a: "Studio Hibiscus", t: "Il reste 2 places samedi matin. On te garde un créneau ?", d: 1 },
                { a: "Coffee Plage", t: "Nouveau : matcha coco glacé. Le 1er à -50 % pour toi.", d: 2 },
              ].map((n) => (
                <div key={n.a} className="lock-notif" style={{ "--d": n.d }}>
                  <span className="lock-notif-icon" />
                  <div><div className="phone-notif-head"><b>{n.a}</b><span>maintenant</span></div><p>{n.t}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="stack" style={{ "--gap": "20px" }}>
            <span className="chip chip-violet" style={{ justifySelf: "start" }}>Formules Premium et Pro</span>
            <h2 className="display-l reveal">Prévenez vos clients <span className="serif">en 1 clic</span>.</h2>
            <p className="lead reveal">Une offre, une nouveauté, un créneau libre : votre message s'affiche sur leur téléphone, comme un SMS.</p>
            <Link href="/tarifs" className="text-link" style={{ color: "var(--ink)" }}>Voir ce qui est inclus</Link>
          </div>
        </div>
      </section>

      {/* ═════ 5. VOS CHIFFRES ═════ */}
      <section className="frame alt dash-band">
        <div className="rails section duo flip">
          <div className="stack" style={{ "--gap": "20px" }}>
            <span className="label">Votre espace commerçant</span>
            <h2 className="display-l reveal">Vos chiffres, <span className="serif">en clair</span>.</h2>
            <p className="lead reveal">Combien de clients ont votre carte, combien reviennent, qui relancer. Sur votre téléphone, à tout moment.</p>
          </div>
          <div className="reveal" data-delay="1"><DashPreview /></div>
        </div>
      </section>

      {/* ═════ 6. PRIX ═════ */}
      <section className="frame" id="prix">
        <div className="rails section">
          <div className="section-head price-head">
            <span className="label">Tarifs</span>
            <h2 className="display-l">Moins d'1 € <span className="serif">par jour</span>.</h2>
            <p className="lead">Essentiel : 29 € par mois. Un client de plus par semaine suffit à la rembourser.</p>
          </div>
          <PriceCards />
          <div className="price-foot">
            <p>{founderOffer}</p>
            <Link href="/tarifs" className="text-link">Tout comparer</Link>
          </div>
        </div>
      </section>

      {/* ═════ 7. QUESTIONS ═════ */}
      <section className="frame alt">
        <div className="rails section faq-grid">
          <h2 className="display-m">Vos <span className="serif">questions</span>.</h2>
          <div className="faq">
            {[
              { q: "Mes clients doivent-ils télécharger une appli ?", a: "Non. La carte va dans le portefeuille du téléphone : Apple Wallet sur iPhone, Google Wallet sur Android (déjà installé sur la plupart des téléphones)." },
              { q: "Je ne suis pas à l'aise avec la technique.", a: "Pas de souci : réservez une démo, on vient chez vous et on installe tout. Vous n'avez qu'à tamponner." },
              { q: "Un client peut-il tricher ?", a: "C'est votre équipe qui tamponne la carte, avec son propre accès. Le client ne peut pas s'ajouter de tampon lui-même." },
              { q: "Et si j'arrête ?", a: "Aucun engagement. Vous arrêtez à la fin du mois, et vous gardez la liste de vos clients." },
            ].map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus"><Icon name="plus" size={14} stroke={2} /></span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ 8. DEUX PORTES ═════ */}
      <Fork />
    </>
  );
}
