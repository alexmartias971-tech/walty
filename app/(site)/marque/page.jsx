import PageHero from "@/components/PageHero";
import Mascot from "@/components/Mascot";
import WalletCard from "@/components/WalletCard";
import { LogoMark, Wordmark } from "@/components/Logo";

export const metadata = {
  title: "Identité de marque",
  description: "Le guide d'identité visuelle de Walti : couleurs, typographies, logo, effets verre et la mascotte Walti.",
};

const palette = [
  { name: "Flamboyant", hex: "#FF5B1F", rgb: "255 · 91 · 31", role: "Couleur signature", why: "L'arbre flamboyant qui s'embrase en été, le soleil qui plonge dans la mer. Énergie, appétit, action : c'est la couleur des boutons et de ce qu'on veut faire cliquer.", big: true, fg: "#fff", bg: "#FF5B1F" },
  { name: "Crépuscule", hex: "#7B3CFF", rgb: "123 · 60 · 255", role: "Couleur digitale", why: "Le violet du ciel juste après le coucher du soleil. Il apporte le côté premium et technologique, et fait vibrer l'orange par contraste.", big: true, fg: "#fff", bg: "#7B3CFF" },
  { name: "Hibiscus", hex: "#FF2E7E", rgb: "255 · 46 · 126", role: "Pont", why: "La fleur d'hibiscus. Elle relie l'orange au violet dans le dégradé.", fg: "#fff", bg: "#FF2E7E" },
  { name: "Mangue", hex: "#FFA23D", rgb: "255 · 162 · 61", role: "Lumière", why: "Le haut du dégradé, les reflets, les petits accents chaleureux.", fg: "#0b0713", bg: "#FFA23D" },
  { name: "Lagon", hex: "#2DE2C4", rgb: "45 · 226 · 196", role: "Validation", why: "L'eau du lagon. Réservé à ce qui est réussi : tampon ajouté, paiement reçu, client actif.", fg: "#0b0713", bg: "#2DE2C4" },
  { name: "Nuit", hex: "#0B0713", rgb: "11 · 7 · 19", role: "Fond", why: "La nuit tropicale, jamais un noir pur : une pointe de violet la rend plus chaude.", fg: "#f6efe6", bg: "#0B0713", border: true },
  { name: "Sable", hex: "#F6EFE6", rgb: "246 · 239 · 230", role: "Texte et fonds clairs", why: "Un blanc chaud de sable, moins clinique qu'un blanc pur.", fg: "#0b0713", bg: "#F6EFE6" },
];

export default function MarquePage() {
  return (
    <>
      <PageHero
        index="B1"
        label="Identité de marque"
        title={<>Le <span className="serif grad-text">crépuscule</span> caribéen.</>}
        lead="L'heure où la Guadeloupe est la plus belle, et celle où les clients rentrent chez eux. Toute l'identité Walti part de ce moment : la chaleur du soleil couchant, le violet de la nuit qui tombe, et le lagon qui reste lumineux."
      >
        <div className="glass" style={{ padding: 40, borderRadius: 32, display: "grid", placeItems: "center", gap: 20 }}>
          <LogoMark size={120} />
          <Wordmark size={72} />
        </div>
      </PageHero>

      {/* Concept */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>01</b> — Le concept</span>
            <p className="lead">Une marque qui claque sans crier. Vive comme les couleurs de l'île, mais tenue par une grille rigoureuse, pour inspirer confiance à un commerçant qui confie ses clients.</p>
          </div>
          <div className="grid cols-3">
            {[
              { t: "Pourquoi l'orange", d: "C'est la couleur de l'appétit et de l'action, parfaite pour des snacks, des roulottes et des cafés. En Guadeloupe, elle évoque le soleil, le flamboyant et le madras : elle parle à tout le monde, sans cliché." },
              { t: "Pourquoi le violet", d: "L'orange seul ferait « promo de supermarché ». Le violet du crépuscule lui donne une dimension premium et digitale. Ensemble, ils forment un dégradé qu'on reconnaît de loin, sur une affiche comme sur un écran." },
              { t: "Pourquoi le fond nuit", d: "Les cartes Wallet, les notifications et les dégradés ressortent mieux sur un fond sombre. C'est aussi l'heure du crépuscule : le fond est la nuit, les couleurs sont la lumière qui reste." },
            ].map((c, i) => (
              <div key={c.t} className="cell feature reveal" data-delay={i + 1}>
                <span className="idx">0{i + 1}</span>
                <h3 className="display-s">{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Palette */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>02</b> — Couleurs</span>
            <h2 className="display-m reveal">7 couleurs, <span className="serif orange">un dégradé.</span></h2>
          </div>
          <div className="swatches">
            {palette.map((c) => (
              <div key={c.name} className={`swatch reveal ${c.big ? "big" : ""}`} style={{ background: c.bg, color: c.fg, border: c.border ? "1px solid var(--line-strong)" : 0 }}>
                <div>
                  <small>{c.role}</small>
                  <h3>{c.name}</h3>
                  <p>{c.why}</p>
                </div>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="hex">{c.hex}</span>
                  <span className="hex" style={{ opacity: 0.7 }}>RVB {c.rgb}</span>
                </div>
              </div>
            ))}
            <div className="swatch" style={{ background: "var(--grad-sunset)", color: "#fff", gridColumn: "1 / -1", minHeight: 180 }}>
              <div><small>Dégradé signature</small><h3>Crépuscule</h3></div>
              <span className="hex">#FFA23D → #FF5B1F → #FF2E7E → #7B3CFF · angle 115°</span>
            </div>
          </div>
          <div className="grid cols-4" style={{ marginTop: 24 }}>
            {[
              { p: "60 %", t: "Nuit", d: "Fonds, respiration." },
              { p: "25 %", t: "Sable", d: "Textes, sections claires." },
              { p: "10 %", t: "Flamboyant + dégradé", d: "Boutons, mots forts, mascotte." },
              { p: "5 %", t: "Lagon", d: "Uniquement ce qui est validé." },
            ].map((r) => (
              <div key={r.t} className="cell">
                <div className="price-num" style={{ fontSize: 40 }}>{r.p}</div>
                <b>{r.t}</b>
                <p className="muted" style={{ fontSize: 14 }}>{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typo */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>03</b> — Typographies</span>
            <p className="lead">Trois voix. Unbounded pour frapper, Manrope pour expliquer, Instrument Serif en italique pour le mot qui fait sourire. Jamais plus d'un mot en italique par titre.</p>
          </div>
          <div className="type-specimen">
            <div>
              <small className="label"><b>Titres</b> — Unbounded</small>
              <div className="aa" style={{ fontFamily: "var(--f-display)", fontWeight: 700, letterSpacing: "-0.06em" }}>Aa</div>
              <p style={{ fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 28, letterSpacing: "-0.04em", lineHeight: 1.05 }}>Faites-les revenir.</p>
              <p className="muted" style={{ fontSize: 13 }}>Large, arrondie, pleine d'énergie. Graisse 600 à 800, interlettrage serré (-3 à -6 %).</p>
            </div>
            <div>
              <small className="label"><b>Texte</b> — Manrope</small>
              <div className="aa" style={{ fontWeight: 700 }}>Aa</div>
              <p className="muted" style={{ fontSize: 13 }}>Lisible sur mobile, moderne sans être froide. Graisse 400 à 700.</p>
            </div>
            <div>
              <small className="label"><b>Émotion</b> — Instrument Serif</small>
              <div className="aa serif" style={{ color: "var(--mangue)" }}>Aa</div>
              <p className="muted" style={{ fontSize: 13 }}>Italique uniquement, pour un mot : « revenir », « chez vous ».</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logo */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>04</b> — Logo</span>
            <p className="lead">Le symbole reprend la mascotte : la carte avec ses deux yeux qui dépasse de la poche. Dans le logotype, le point du « i » est un tampon.</p>
          </div>
          <div className="logo-stage">
            <div className="logo-tile" style={{ background: "var(--nuit-2)" }}>
              <span className="logo"><LogoMark size={88} /><Wordmark size={70} /></span>
              <small>Version principale · fond nuit</small>
            </div>
            <div className="logo-tile" style={{ background: "var(--sable)", color: "var(--nuit)" }}>
              <span className="logo"><LogoMark size={56} /><span className="wordmark" style={{ fontSize: 40, color: "var(--nuit)" }}>walt<span className="wordmark-i">ı<i /></span></span></span>
              <small style={{ color: "var(--nuit)" }}>Fond sable</small>
            </div>
            <div className="logo-tile" style={{ background: "var(--grad-sunset)" }}>
              <LogoMark size={96} flat />
              <small>Icône d'app · min. 24 px</small>
            </div>
          </div>
          <div className="dont" style={{ marginTop: 24 }}>
            <div>
              <h4 className="lagon">À faire</h4>
              <ul className="list">
                <li>Laisser autour du logo un espace égal à la hauteur du « w ».</li>
                <li>Toujours écrire « walti » en minuscules dans le logo, « Walti » dans le texte.</li>
                <li>Utiliser l'icône seule quand la place manque (réseaux, favicon, carte Wallet).</li>
              </ul>
            </div>
            <div>
              <h4 className="orange">À éviter</h4>
              <ul className="list">
                <li>Déformer, incliner ou contourner le logo.</li>
                <li>Poser le logo sur une photo chargée sans pastille de verre derrière.</li>
                <li>Changer les couleurs du dégradé ou remplacer le tampon du « i ».</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verre & grille */}
      <section className="frame">
        <div className="rails section">
          <div className="notif-grid">
            <div className="stack" style={{ "--gap": "22px" }}>
              <span className="label"><b>05</b> — Verre, 3D et grille</span>
              <h2 className="display-m reveal">Du verre sur <span className="serif grad-text">une grille stricte.</span></h2>
              <p className="lead">Les surfaces sont en verre dépoli, comme les dernières interfaces iPhone : flou de 22 px, bord blanc à 16 %, reflet en haut à gauche. Derrière, des soleils flous donnent la profondeur. Mais tout est posé sur une grille visible : lignes de 1 px, repères « + », sections numérotées entre crochets.</p>
              <ul className="list">
                <li><span className="check">1</span>Le site est cadré, la mascotte ne l'est jamais : elle déborde, s'assoit, dépasse des bords.</li>
                <li><span className="check">2</span>Chaque section a un numéro et un label : [ 01 — Le constat ].</li>
                <li><span className="check">3</span>Les cartes Wallet sont les seuls objets en « vraie » 3D (perspective, ombre portée).</li>
              </ul>
            </div>
            <div className="reveal" style={{ position: "relative", minHeight: 420, display: "grid", placeItems: "center" }}>
              <div className="sun" style={{ width: 300, height: 300, left: "10%", top: "8%" }} aria-hidden="true" />
              <div className="glass" style={{ position: "relative", width: "min(100%, 380px)", padding: 28, borderRadius: 28, display: "grid", gap: 16 }}>
                <span className="label"><b>Verre</b> — composant</span>
                <WalletCard theme="plage" compact />
                <p className="muted" style={{ fontSize: 14 }}>backdrop-filter : blur(22px) saturate(170 %) · bordure rgba(255,255,255,.16)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mascotte */}
      <section className="frame">
        <div className="rails section">
          <div className="section-head">
            <span className="label"><b>06</b> — La mascotte</span>
            <h2 className="display-m reveal">Voici <span className="serif orange">Walti.</span></h2>
          </div>

          <div className="mascot-board">
            <span className="label" style={{ position: "absolute", top: 20, left: 24 }}><b>Projet</b> — planche personnage v1</span>
            <div className="mascot-hero" style={{ marginTop: 30 }}>
              <div className="anatomy" style={{ flexDirection: "column", alignItems: "center", gap: 20 }}>
                <Mascot pose="stamp" size={320} title="Walti, planche d'anatomie" />
                <ol className="anatomy-list">
                  <li><b>1</b>Sa carte de fidélité = son visage</li>
                  <li><b>2</b>3 tampons gagnés, le 4<sup>e</sup> s'allume en lagon</li>
                  <li><b>3</b>Porte-monnaie orange crépuscule, coutures en pointillé</li>
                  <li><b>4</b>Fermoir violet, gants blancs, baskets à semelle violette</li>
                </ol>
              </div>
              <div className="stack" style={{ "--gap": "20px" }}>
                <p className="lead" style={{ maxWidth: "none" }}>Walti est un petit porte-monnaie qui garde les cartes de fidélité bien au chaud. Sa carte dépasse de la poche et porte ses yeux : quand il est content, elle remonte ; quand il est surpris, elle sort d'un coup.</p>
                <div className="grid cols-2" style={{ borderRadius: 20, overflow: "hidden" }}>
                  {[
                    ["Caractère", "Serviable, un peu fier de ses tampons, jamais moqueur."],
                    ["Ce qu'il fait", "Il tamponne, il salue, il surveille les cartes."],
                    ["Ce qu'il ne fait pas", "Il ne parle pas créole, ne vend rien, ne crie pas."],
                    ["Signature", "Le « tchak » du tampon, avec un éclat lagon."],
                  ].map(([t, d]) => (
                    <div key={t} className="cell" style={{ padding: 20 }}>
                      <b style={{ fontSize: 14 }}>{t}</b>
                      <p className="muted" style={{ fontSize: 14 }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="poses">
              {[
                { p: "stamp", t: "Tamponne", d: "Accueil, page produit, confirmation d'envoi" },
                { p: "wave", t: "Salue", d: "Appel à l'action, à propos, connexion admin" },
                { p: "sit", t: "Assis", d: "Posé sur la formule recommandée" },
                { p: "peek", t: "Jette un œil", d: "Dépasse d'un bloc ou du pied de page" },
                { p: "sleep", t: "Dort", d: "Listes vides dans l'admin" },
                { p: "lost", t: "Perdu", d: "Page 404" },
              ].map((x) => (
                <div key={x.p} className="pose">
                  <Mascot pose={x.p} size={x.p === "peek" ? 120 : 120} title={`Walti, pose ${x.t}`} />
                  <b>{x.t}</b>
                  <span>{x.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section-head" style={{ marginTop: 72, marginBottom: 32 }}>
            <span className="label"><b>06.1</b> — Où il apparaît</span>
            <p className="lead">Sur le site, Walti casse la grille aux moments clés. Jamais plus d'une apparition par écran.</p>
          </div>
          <div className="where-map">
            {[
              ["Accueil · haut", "En grand, il tamponne la carte du téléphone. Le 4e tampon s'allume en lagon au même moment."],
              ["Accueil · étapes", "Il dépasse du bloc « Vos clients la scannent »."],
              ["Tarifs", "Assis sur la formule Premium, jambes qui balancent."],
              ["Appel à l'action", "Il salue au-dessus du soleil couchant."],
              ["Contact", "Il tamponne la demande quand elle est envoyée."],
              ["Pied de page", "Seule sa carte dépasse, il vous regarde partir."],
              ["Page 404", "Perdu, avec un point d'interrogation."],
              ["Admin", "Il dort quand une liste est vide."],
            ].map(([t, d]) => (
              <div key={t}><b>{t}</b><span>{d}</span></div>
            ))}
          </div>

          <div className="section-head" style={{ marginTop: 72, marginBottom: 32 }}>
            <span className="label"><b>06.2</b> — Brief animation 3D</span>
            <p className="lead">Pour la future version 3D (Spline, Blender ou Rive), voici les animations déjà prototypées sur le site.</p>
          </div>
          <div className="table-wrap">
            <table className="cmp">
              <thead><tr><th>Animation</th><th>Déclencheur</th><th>Durée</th><th>Détail</th></tr></thead>
              <tbody>
                <tr><td>Clignement</td><td>Automatique</td><td>Toutes les 4 à 5 s</td><td>Les yeux se ferment sur la carte (échelle verticale à 8 %).</td></tr>
                <tr><td>Coup de tampon</td><td>En boucle (pose Tamponne)</td><td>2,8 s</td><td>Il arme le bras (-26°), frappe (+16°), le corps s'écrase légèrement, une marque lagon apparaît.</td></tr>
                <tr><td>Respiration</td><td>Automatique</td><td>3,4 s</td><td>Le corps monte de 6 px, la carte remonte de 4 px, l'ombre se resserre.</td></tr>
                <tr><td>Regard</td><td>Mouvement de la souris</td><td>Continu</td><td>Les reflets des yeux suivent le curseur.</td></tr>
                <tr><td>Saut</td><td>Survol</td><td>0,7 s</td><td>Saut de 26 px avec écrasement à la réception.</td></tr>
                <tr><td>Coucou</td><td>Pose Jette un œil</td><td>4 s</td><td>La carte sort de derrière un bord, les mains agrippées.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ton */}
      <section className="sable-section">
        <div className="rails section">
          <div className="local-grid">
            <div className="stack" style={{ "--gap": "22px" }}>
              <span className="label"><b>07</b> — Ton de voix</span>
              <h2 className="display-m">Chaleureux, direct, <span className="serif">d'ici.</span></h2>
              <p className="lead">On vouvoie les commerçants, on tutoie leurs clients dans les notifications. Des phrases courtes, des exemples locaux (bokits, Carnaval, plage), jamais de jargon technique.</p>
            </div>
            <div className="grid cols-2 local-cells">
              {[
                ["On dit", "« Faites-les revenir. »"],
                ["On évite", "« Optimisez votre rétention client omnicanale. »"],
                ["On dit", "« Zéro impression, zéro transport. »"],
                ["On évite", "« 100 % écologique » (allégation encadrée par la loi)."],
              ].map(([t, d], i) => (
                <div key={i} className="cell">
                  <h3 style={{ color: t === "On dit" ? "#0a8a74" : "var(--flamboyant)", marginTop: 0 }}>{t}</h3>
                  <p style={{ fontSize: 16, color: "var(--nuit)" }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
