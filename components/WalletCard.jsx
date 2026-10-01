import { programDisplay, isHex, mix, luminance } from "@/lib/programs";

/**
 * Aperçu d'une carte de fidélité telle qu'elle apparaît dans Apple Wallet / Google Wallet.
 * Commerces fictifs, utilisés uniquement comme exemples.
 */

export const cardThemes = {
  plage: {
    merchant: "Le Bokit du Lagon",
    kind: "Roulotte · Sainte-Anne",
    bg: "#1a0f2e",
    fg: "#fff",
    accent: "#ff5b1f",
    strip: "linear-gradient(180deg, #ffb35c 0%, #ff5b1f 38%, #ff2e7e 62%, #3b1c72 63%, #241043 100%)",
    reward: "Le 10e bokit offert",
    total: 10,
    filled: 7,
    initials: "BL",
  },
  hibiscus: {
    merchant: "Studio Hibiscus",
    kind: "Onglerie · Le Gosier",
    bg: "#2a0a1f",
    fg: "#fff",
    accent: "#ff2e7e",
    strip: "radial-gradient(120% 140% at 80% 10%, #ff86b0 0%, #ff2e7e 35%, #7b1e5a 70%, #2a0a1f 100%)",
    reward: "-50 % sur la 6e pose",
    total: 6,
    filled: 4,
    initials: "SH",
  },
  lagon: {
    merchant: "Coffee Plage",
    kind: "Coffee shop · Bord de mer",
    bg: "#062a2c",
    fg: "#fff",
    accent: "#2de2c4",
    strip: "linear-gradient(170deg, #e8f7f2 0%, #8ff0dc 30%, #2de2c4 52%, #0a6b73 53%, #062a2c 100%)",
    reward: "1 matcha glacé offert",
    total: 8,
    filled: 5,
    initials: "CP",
  },
  kart: {
    merchant: "Circuit Grand Prix",
    kind: "Karting · Loisirs",
    bg: "#0d0a18",
    fg: "#fff",
    accent: "#ffa23d",
    strip: "repeating-linear-gradient(135deg, #16122a 0 14px, #1d1834 14px 28px), linear-gradient(90deg, #ff5b1f, #7b3cff)",
    reward: "1 session offerte",
    total: 5,
    filled: 3,
    initials: "GP",
  },
};

/** Fonds de bandeau proposés dans « Créer ma carte ». c = couleur principale, bg = fond de la carte. */
export const stripStyles = {
  sunset: { label: "Coucher de soleil", css: (c) => `linear-gradient(180deg, #ffb35c 0%, ${c} 40%, #ff2e7e 64%, #3b1c72 65%, #241043 100%)` },
  lagon: { label: "Lagon", css: (c) => `linear-gradient(170deg, #e8f7f2 0%, #8ff0dc 30%, ${c} 52%, #0a5560 53%, #062a2c 100%)` },
  glow: { label: "Lumière", css: (c) => `radial-gradient(120% 140% at 80% 10%, #ffffff55 0%, ${c} 38%, #00000088 100%)` },
  uni: { label: "Uni", css: (c) => `linear-gradient(180deg, ${c}, ${c})` },
  minimal: { label: "Minimal", css: (c, bg) => `linear-gradient(180deg, ${bg} 0 calc(100% - 5px), ${c} calc(100% - 5px))` },
  photo: { label: "Votre photo", css: (c, bg, photo) => (photo ? `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.45)), url(${photo}) center / cover` : `linear-gradient(180deg, ${c}, ${bg})`) },
};

export const cardColors = [
  { id: "flamboyant", label: "Orange", accent: "#ff5b1f", bg: "#1a0f2e" },
  { id: "hibiscus", label: "Rose", accent: "#ff2e7e", bg: "#2a0a1f" },
  { id: "lagon", label: "Turquoise", accent: "#2de2c4", bg: "#062a2c" },
  { id: "crepuscule", label: "Violet", accent: "#7b3cff", bg: "#140c24" },
  { id: "mangue", label: "Jaune", accent: "#ffa23d", bg: "#22140a" },
  { id: "foret", label: "Vert", accent: "#3fbf6b", bg: "#0c1f14" },
];

/** Transforme la configuration saisie dans « Créer ma carte » en carte affichable (accepte aussi l'ancien format). */
export function cardFromConfig(c = {}) {
  const preset = cardColors.find((x) => x.id === c.color);
  const accent = isHex(c.accent) ? c.accent : preset?.accent || cardColors[0].accent;
  const bg = isHex(c.bg) ? c.bg : preset?.bg || mix(accent, "#0d0a14", 0.86);
  const fg = luminance(bg) > 0.45 ? "#1c1226" : "#ffffff";
  const template = c.template || c.strip || "sunset";
  const style = stripStyles[template] || stripStyles.sunset;
  const name = (c.merchant || "Votre commerce").trim() || "Votre commerce";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "W";
  const program = c.program?.type ? c.program : { type: "tampons", rules: { total: c.total, reward: c.reward } };
  const display = programDisplay(program);
  const total = display.total || 10;
  return {
    merchant: name,
    bg, fg, accent,
    strip: style.css(accent, bg, c.photo),
    logo: c.logo || null,
    initials,
    stampShape: c.stampShape || "rond",
    display,
    total,
    filled: Math.min(total - 1, c.filled ?? Math.round(total * 0.6)),
    reward: display.reward || display.field?.[1] || "",
    summary: display.summary,
  };
}

const SHAPES = {
  etoile: "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z",
  coeur: "M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8 2.9c0 6.1-8 11-8 11z",
};

function Stamp({ on, next, shape, logo }) {
  if (shape === "etoile" || shape === "coeur") {
    return (
      <span className={`wcard-stamp wcard-stamp--shape ${on ? "on" : ""} ${next ? "next" : ""}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={SHAPES[shape]} /></svg>
      </span>
    );
  }
  if (shape === "logo" && logo && on) {
    return <span className="wcard-stamp on wcard-stamp--logo" style={{ backgroundImage: `url(${logo})` }} />;
  }
  return <span className={`wcard-stamp ${on ? "on" : ""} ${next ? "next" : ""}`} />;
}

export default function WalletCard({ theme = "plage", card, className = "", style, animateStamp = false, compact = false, member = "Maëlys" }) {
  const t = card || cardThemes[theme] || cardThemes.plage;
  const d = t.display;
  const isValue = d?.kind === "value";
  const head = isValue ? d.head : ["TAMPONS", `${t.filled}/${t.total}`];
  const field = d?.field || ["RÉCOMPENSE", t.reward];
  return (
    <div className={`wcard ${compact ? "wcard--compact" : ""} ${className}`} style={{ "--wc-bg": t.bg, "--wc-accent": t.accent, color: t.fg || "#fff", ...style }}>
      <div className="wcard-top">
        <span className="wcard-logo" style={t.logo ? { backgroundImage: `url(${t.logo})`, backgroundColor: "#fff" } : { background: t.accent }}>{t.logo ? "" : t.initials}</span>
        <span className="wcard-name">{t.merchant}</span>
        <span className="wcard-field">
          <small>{head[0]}</small>
          <b>{head[1]}</b>
        </span>
      </div>
      <div className="wcard-strip" style={{ background: t.strip }}>
        {isValue ? (
          <div className={`wcard-value ${d.long ? "long" : ""}`}>
            <b>{d.big}</b>
            {d.unit && <span>{d.unit}</span>}
            {!compact && d.sub && <em>{d.sub}</em>}
          </div>
        ) : (
          <div className="wcard-stamps" style={{ gridTemplateColumns: `repeat(${t.total <= 6 ? t.total : Math.ceil(t.total / 2) > 6 ? 6 : Math.ceil(t.total / 2)}, 1fr)` }}>
            {Array.from({ length: t.total }).map((_, i) => (
              <Stamp key={i} on={i < t.filled} next={animateStamp && i === t.filled} shape={t.stampShape} logo={t.logo} />
            ))}
          </div>
        )}
      </div>
      {!compact && (
        <>
          <div className="wcard-fields">
            <span><small>{field[0]}</small><b>{field[1]}</b></span>
            <span className="r"><small>MEMBRE</small><b>{member}</b></span>
          </div>
          <div className="wcard-qr" aria-hidden="true">
            <Qr />
          </div>
        </>
      )}
    </div>
  );
}

function Qr() {
  // QR décoratif (non scannable) généré de façon déterministe
  const n = 21;
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      if (finder) continue;
      if (((x * 7 + y * 13 + x * y) % 5) < 2) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  const Finder = ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width="100%" height="100%" shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      <g fill="#111">
        {cells}
        <Finder x={0} y={0} />
        <Finder x={n - 7} y={0} />
        <Finder x={0} y={n - 7} />
      </g>
    </svg>
  );
}
