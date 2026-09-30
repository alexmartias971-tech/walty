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

export default function WalletCard({ theme = "plage", className = "", style, animateStamp = false, compact = false }) {
  const t = cardThemes[theme] || cardThemes.plage;
  return (
    <div className={`wcard ${compact ? "wcard--compact" : ""} ${className}`} style={{ "--wc-bg": t.bg, "--wc-accent": t.accent, ...style }}>
      <div className="wcard-top">
        <span className="wcard-logo" style={{ background: t.accent }}>{t.initials}</span>
        <span className="wcard-name">{t.merchant}</span>
        <span className="wcard-field">
          <small>TAMPONS</small>
          <b>{t.filled}/{t.total}</b>
        </span>
      </div>
      <div className="wcard-strip" style={{ background: t.strip }}>
        <div className="wcard-stamps" style={{ gridTemplateColumns: `repeat(${t.total <= 6 ? t.total : 5}, 1fr)` }}>
          {Array.from({ length: t.total }).map((_, i) => (
            <span
              key={i}
              className={`wcard-stamp ${i < t.filled ? "on" : ""} ${animateStamp && i === t.filled ? "next" : ""}`}
            />
          ))}
        </div>
      </div>
      {!compact && (
        <>
          <div className="wcard-fields">
            <span><small>RÉCOMPENSE</small><b>{t.reward}</b></span>
            <span className="r"><small>MEMBRE</small><b>Maëlys</b></span>
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
