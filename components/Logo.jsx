/**
 * Logo Walti.
 * Symbole : la carte de Walti (avec ses deux yeux) qui dépasse de la poche.
 * Logotype : « walti » en minuscules, le point du i est un tampon.
 */

export function LogoMark({ size = 36, flat = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb35c" />
          <stop offset="0.45" stopColor="#ff5b1f" />
          <stop offset="0.8" stopColor="#ff2e7e" />
          <stop offset="1" stopColor="#7b3cff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={flat ? "#ff5b1f" : "url(#lm-g)"} />
      {/* carte */}
      <rect x="15" y="10" width="34" height="30" rx="6" fill="#fff" transform="rotate(-6 32 25)" />
      <g transform="rotate(-6 32 25)">
        <ellipse cx="26" cy="26" rx="3.2" ry="4.2" fill="#241043" />
        <ellipse cx="38" cy="26" rx="3.2" ry="4.2" fill="#241043" />
        <circle cx="27" cy="24.4" r="1.2" fill="#fff" />
        <circle cx="39" cy="24.4" r="1.2" fill="#fff" />
        <circle cx="22" cy="15.5" r="1.8" fill="#ff5b1f" />
        <circle cx="27.5" cy="15.5" r="1.8" fill="#ff5b1f" />
        <circle cx="33" cy="15.5" r="1.8" fill="none" stroke="#c9b8ef" strokeWidth="1" />
      </g>
      {/* poche */}
      <path d="M8 36 h48 v10 a10 10 0 0 1 -10 10 H18 A10 10 0 0 1 8 46z" fill="#0b0713" opacity="0.28" />
      <path d="M8 36 h48" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M26 45 q6 5 12 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ size = 26, className = "" }) {
  return (
    <span className={`wordmark ${className}`} style={{ fontSize: size }}>
      walt<span className="wordmark-i">ı<i /></span>
    </span>
  );
}

export default function Logo({ size = 34 }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <Wordmark size={size * 0.72} />
    </span>
  );
}
