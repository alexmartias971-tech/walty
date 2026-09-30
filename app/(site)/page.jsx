import Link from "next/link";
import Mascot from "@/components/Mascot";
import Phone from "@/components/Phone";
import WalletCard from "@/components/WalletCard";
import Icon from "@/components/Icon";
import { plans, founderOffer, vatNotice } from "@/lib/offer";

const sectors = ["Roulottes à bokits", "Snacks", "Ongleries", "Barbiers", "Coachs sportifs", "Karting", "Coffee shops", "Boulangeries", "Instituts", "Restaurants", "Salles de sport", "Food trucks"];

export default function Home() {
  return (
    <>
      {/* ═════ HERO ═════ */}
      <section className="hero">
        <div className="hero-sky" aria-hidden="true">
          <div className="sun hero-sun" />
          <div className="orb orb-violet" style={{ width: 620, height: 620, left: "-12%", top: "-18%" }} />
          <div className="orb orb-pink" style={{ width: 420, height: 420, right: "8%", top: "30%", opacity: 0.35 }} />
          <div className="hero-sea">
            {Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}
          </div>
        </div>

        <div className="rails hero-rails">
          <div className="hero-meta">
            <span className="label"><b>971</b> — Guadeloupe</span>
            <span className="label">16°15′N · 61°35′O</span>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow reveal"><span className="pill">Nouveau</span> 10 places fondateurs, prix gardé à vie</span>
              <h1 className="display-xl hero-title reveal" data-delay="1">
                <span className="nw">Faites-les</span> <span className="grad-text">revenir.</span>
              </h1>
              <p className="hero-sub reveal" data-delay="2">
                <span className="serif">Comme la vague, chaque jour.</span>
              </p>
              <p className="lead reveal" data-delay="2">
                Walti crée la carte de fidélité de votre commerce dans <strong>Apple Wallet</strong> et <strong>Google Wallet</strong>. Tampons sécurisés, notifications sur l'écran verrouillé, installation sur place en Guadeloupe.
              </p>
              <div className="row reveal" data-delay="3" style={{ "--gap": "12px", marginTop: 8 }}>
                <Link href="/contact" className="btn btn-primary">Demander une démo <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
                <Link href="/tarifs" className="btn btn-ghost">Dès 29 €/mois</Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-phone-wrap">
                <Phone theme="plage" className="hero-phone" />
                <div className="float-chip glass chip-a"><span className="dot-lagon" /> +1 tampon ajouté</div>
                <div className="float-chip glass chip-b"><Icon name="bell" size={16} /> Notification envoyée</div>
                <div className="float-chip glass chip-c"><Icon name="cake" size={16} /> Joyeux anniversaire, Maëlys 🎉</div>
              </div>
              <Mascot pose="stamp" size={300} className="hero-mascot" title="Walti tamponne une carte de fidélité" />
            </div>
          </div>

          <div className="hero-bar glass">
            <div><b>0</b><span>appli à télécharger</span></div>
            <div><b>iPhone + Android</b><span>Apple & Google Wallet</span></div>
            <div><b>29 €</b><span>par mois, sans engagement</span></div>
            <div><b>Sur place</b><span>installation et formation</span></div>
          </div>
        </div>
      </section>

      {/* ═════ BANDEAU SECTEURS ═════ */}
      <div className="band" aria-label="Pour tous les commerces de proximité">
        <div className="marquee">
          {[...sectors, ...sectors].map((s, i) => (
            <span key={i} className="band-item">{s}<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 10l1.5 5 2.5-4 2.5 4L16 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          ))}
        </div>
      </div>

      {/* ═════ 01 · LE CARTON EST MORT ═════ */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>01</b> — Le constat</span>
            <h2 className="display-l reveal">Le carton à tampons <span className="serif orange">finit toujours</span> dans la machine à laver.</h2>
          </div>

          <div className="versus">
            <div className="versus-side versus-old reveal">
              <div className="paper-card" aria-hidden="true">
                <div className="paper-title">Carte de fidélité</div>
                <div className="paper-stamps">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < 4 ? "on" : ""} />)}</div>
                <div className="paper-tear" />
              </div>
              <ul className="list">
                {["Perdue, oubliée, lavée avec le jean", "Un tampon, ça se recopie facilement", "Vous ne savez pas qui revient", "Impression, commandes, transport jusqu'en Guadeloupe", "Aucun moyen de prévenir vos clients"].map((t) => (
                  <li key={t}><span className="check x"><Icon name="x" size={12} stroke={2.4} /></span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="versus-mid" aria-hidden="true"><span>VS</span></div>
            <div className="versus-side versus-new reveal" data-delay="1">
              <WalletCard theme="hibiscus" className="versus-card" />
              <ul className="list">
                {["Toujours dans le téléphone, à côté de la carte bancaire", "Tampon scanné par votre équipe, impossible à tricher", "Vous voyez qui revient, et quand", "Zéro impression, zéro commande, zéro transport", "Une notification sur l'écran verrouillé, quand vous voulez"].map((t) => (
                  <li key={t}><span className="check"><Icon name="check" size={12} stroke={2.4} /></span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═════ 02 · COMMENT ÇA MARCHE ═════ */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>02</b> — Comment ça marche</span>
            <p className="lead">Vous ne touchez à rien de technique. On crée, on installe, on forme votre équipe. Vous, vous tamponnez.</p>
          </div>
          <div className="grid cols-3 steps">
            {[
              { n: "01", icon: "sparkle", t: "On crée votre carte", d: "Vos photos, votre logo, vos couleurs, votre récompense. Une vraie carte haut de gamme, pas un modèle générique." },
              { n: "02", icon: "qr", t: "Vos clients la scannent", d: "Un QR code au comptoir, deux secondes, et la carte est dans leur Wallet. Aucune appli à télécharger." },
              { n: "03", icon: "stamp", t: "Vous tamponnez, ils reviennent", d: "Votre équipe scanne la carte à chaque passage. Walti relance ceux qui ne sont pas revenus." },
            ].map((s, i) => (
              <div key={s.n} className="cell step reveal" data-delay={i + 1}>
                {i === 1 && <Mascot pose="peek" size={150} className="step-peek" title="Walti jette un œil" />}
                <div className="step-top"><span className="step-n">{s.n}</span><span className="step-icon"><Icon name={s.icon} size={22} /></span></div>
                <h3 className="display-s">{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ 03 · NOTIFICATIONS ═════ */}
      <section className="frame notif-section">
        <div className="orb orb-orange" style={{ width: 520, height: 520, right: "-10%", top: "10%", opacity: 0.35 }} aria-hidden="true" />
        <div className="rails section">
          <div className="notif-grid">
            <div className="stack" style={{ "--gap": "24px" }}>
              <span className="label"><b>03</b> — Notifications push</span>
              <h2 className="display-l reveal">Sur l'écran verrouillé. <span className="serif grad-text">Pas perdu</span> dans un fil Instagram.</h2>
              <p className="lead reveal">Un statut WhatsApp ne touche que ceux qui le regardent. La notification Wallet arrive directement sur le téléphone de vos clients, comme un SMS, sans coût par envoi.</p>
              <div className="notif-types reveal">
                {[
                  { i: "bell", t: "Immédiate", d: "« Arrivage de langoustes ce midi 🦞 »" },
                  { i: "clock", t: "Programmée", d: "« Happy hour ce vendredi dès 17 h »" },
                  { i: "heart", t: "Automatique", d: "« Ça fait un mois ! Ton café t'attend »" },
                  { i: "cake", t: "Anniversaire", d: "« Ton dessert est offert aujourd'hui »" },
                ].map((n) => (
                  <div key={n.t} className="notif-type glass">
                    <span className="notif-type-icon"><Icon name={n.i} size={18} /></span>
                    <div><b>{n.t}</b><span>{n.d}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="notif-stack reveal" data-delay="2" aria-hidden="true">
              <div className="lock glass">
                <div className="lock-time">18:42</div>
                <div className="lock-date">mardi 30 septembre</div>
                {[
                  { a: "Coffee Plage", t: "Nouveau : matcha coco glacé 🥥 Viens goûter, le 1er est à -50 %.", d: 0 },
                  { a: "Le Bokit du Lagon", t: "Plus que 3 tampons avant ton bokit offert 🌅", d: 1 },
                  { a: "Studio Hibiscus", t: "Ça fait 30 jours ! Ta pose semi-permanente t'attend 💅", d: 2 },
                ].map((n) => (
                  <div key={n.a} className="lock-notif" style={{ "--d": n.d }}>
                    <span className="lock-notif-icon" />
                    <div><div className="phone-notif-head"><b>{n.a}</b><span>maintenant</span></div><p>{n.t}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════ 04 · POUR QUI ═════ */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>04</b> — Pour qui</span>
            <h2 className="display-m reveal">Chaque commerce a sa carte. <span className="serif orange">À son image.</span></h2>
          </div>
          <div className="bento">
            <div className="bento-a glass reveal">
              <div className="fan">
                <WalletCard theme="kart" compact className="fan-1" />
                <WalletCard theme="lagon" compact className="fan-2" />
                <WalletCard theme="plage" compact className="fan-3" />
              </div>
              <div className="bento-text">
                <h3 className="display-s">Tampons, points, cashback ou niveaux</h3>
                <p className="muted">La mécanique s'adapte à votre commerce : 10 bokits = 1 offert, des points par euro dépensé, ou des niveaux Rookie → Légende pour un karting.</p>
              </div>
            </div>
            {[
              { i: "store", t: "Roulottes & snacks", d: "Des habitués qui reviennent chaque semaine. La carte la plus simple, la plus rentable." },
              { i: "sparkle", t: "Beauté & bien-être", d: "Ongleries, barbiers, instituts : la relance à 30 jours remplit l'agenda." },
              { i: "users", t: "Loisirs & sport", d: "Karting, padel, coachs : niveaux, défis et notifications pour les créneaux creux." },
              { i: "sun", t: "Cafés & restaurants", d: "Une nouveauté, un happy hour, une saison : vous prévenez tout le monde en un clic." },
            ].map((b, i) => (
              <div key={b.t} className="bento-b glass reveal" data-delay={i + 1}>
                <span className="step-icon"><Icon name={b.i} size={22} /></span>
                <h3 className="display-s">{b.t}</h3>
                <p className="muted">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ 05 · TARIFS (aperçu) ═════ */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>05</b> — Tarifs</span>
            <h2 className="display-m reveal">Moins d'1 € par jour. <span className="serif grad-text">Sans engagement.</span></h2>
          </div>
          <div className="price-row">
            {plans.map((p, i) => (
              <div key={p.id} className={`price-mini glass reveal ${p.featured ? "featured" : ""}`} data-delay={i + 1}>
                {p.featured && <Mascot pose="sit" size={130} className="price-sitter" title="Walti recommande la formule Premium" />}
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <h3 className="display-s">{p.name}</h3>
                  {p.featured && <span className="chip chip-orange">Recommandée</span>}
                </div>
                <div className="price-num">{p.fromPrice && <small>dès </small>}{p.monthly}<span> €/mois</span></div>
                <p className="muted" style={{ fontSize: 14 }}>{p.for}</p>
                <p style={{ fontSize: 15 }}>{p.pitch}</p>
              </div>
            ))}
          </div>
          <div className="row center-row" style={{ marginTop: 32, justifyContent: "space-between" }}>
            <p className="faint" style={{ fontSize: 13 }}>{founderOffer} {vatNotice}</p>
            <Link href="/tarifs" className="btn btn-ghost">Comparer les formules <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
          </div>
        </div>
      </section>

      {/* ═════ 06 · LOCAL (section sable) ═════ */}
      <section className="sable-section">
        <div className="rails section">
          <div className="local-grid">
            <div className="stack" style={{ "--gap": "24px" }}>
              <span className="label"><b>06</b> — Pourquoi Walti</span>
              <h2 className="display-l">On vient <span className="serif">chez vous.</span></h2>
              <p className="lead">Les autres solutions vous envoient un lien et vous laissent configurer seul. Walti se déplace, installe tout sur place et forme votre équipe. Un interlocuteur en Guadeloupe, joignable sur WhatsApp.</p>
              <Link href="/a-propos" className="btn btn-dark" style={{ justifySelf: "start" }}>Notre histoire <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
            </div>
            <div className="grid cols-2 local-cells">
              {[
                { i: "pin", t: "Installé sur place", d: "Grande-Terre, Basse-Terre, Marie-Galante sur rendez-vous." },
                { i: "users", t: "Équipe formée", d: "Votre personnel sait tamponner en 5 minutes." },
                { i: "whatsapp", t: "Réponse sur WhatsApp", d: "Une question, un visuel à changer : un message suffit." },
                { i: "leaf", t: "Zéro papier", d: "Plus d'impression ni de transport de cartes depuis l'Hexagone." },
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

      {/* ═════ 07 · FAQ ═════ */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>07</b> — Questions fréquentes</span>
            <h2 className="display-m">Tout ce qu'on nous demande.</h2>
          </div>
          <div className="faq">
            {[
              { q: "Mes clients doivent-ils télécharger une application ?", a: "Non. La carte s'ajoute dans Apple Wallet (iPhone) ou Google Wallet (Android), des applications déjà installées sur leur téléphone. Ils scannent un QR code, remplissent leur prénom, et c'est fait." },
              { q: "Comment éviter qu'un client triche avec les tampons ?", a: "Le client ne se tamponne jamais lui-même : c'est votre équipe qui scanne sa carte depuis un téléphone ou une tablette. Un délai minimum entre deux tampons empêche les scans répétés." },
              { q: "Combien de notifications puis-je envoyer ?", a: "Deux par semaine sont incluses, ce qui est le bon rythme pour ne pas lasser vos clients. Elles peuvent partir tout de suite, être programmées, ou partir automatiquement (anniversaire, relance après 30 jours)." },
              { q: "Et si j'arrête ?", a: "Les formules Essentiel et Premium sont sans engagement : vous arrêtez quand vous voulez, à la fin du mois en cours. Vous récupérez la liste de vos clients, elle vous appartient." },
              { q: "À qui appartiennent les données de mes clients ?", a: "À vous. Walti les traite pour votre compte, en tant que sous-traitant au sens du RGPD, et ne les revend jamais ni ne les utilise pour autre chose." },
              { q: "J'ai déjà un fichier client dans ma caisse, ça sert à quoi ?", a: "Walti ne remplace pas votre fichier, il le rend utile : chaque client reçoit la carte dans son téléphone, et vous pouvez enfin lui parler. L'import de votre fichier existant est inclus dans la formule Enseigne." },
            ].map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus"><Icon name="plus" size={14} stroke={2} /></span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ CTA FINAL ═════ */}
      <section className="frame cta-final">
        <div className="rails section">
          <div className="cta-box">
            <div className="sun cta-sun" aria-hidden="true" />
            <div className="cta-inner">
              <Mascot pose="wave" size={190} className="cta-mascot" title="Walti vous salue" />
              <h2 className="display-l">Prêt à les faire <span className="serif">revenir</span> ?</h2>
              <p className="lead" style={{ margin: "0 auto" }}>On passe vous montrer la carte en vrai, sur votre téléphone, en 15 minutes. Sans engagement.</p>
              <div className="row" style={{ justifyContent: "center", "--gap": "12px" }}>
                <Link href="/contact" className="btn btn-light">Demander une démo <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
                <Link href="/produit" className="btn btn-ghost">Voir le produit</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
