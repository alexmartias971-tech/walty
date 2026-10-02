"use client";

/**
 * WALTY — la mascotte (v2, rendu « volume »).
 * Un petit porte-monnaie orange. Sa carte de fidélité est glissée dans la poche :
 * c'est elle qui porte ses yeux et ses 3 tampons gagnés.
 *
 * Construction 3D simulée :
 *  - chaque volume a une face arrière décalée (épaisseur) + une face avant éclairée
 *  - lumière principale chaude en haut à gauche, contre-jour violet sur la droite
 *  - occlusion (ombre) dans la poche, ombres de contact au sol ou sur la surface
 *  - les pieds restent plantés : la respiration écrase le corps depuis les hanches
 *
 * Poses : "stamp" (tamponne), "wave" (salue), "sit" (assis sur un rebord),
 *         "sleep" (dort), "lost" (perdu), "peek" (seule la carte dépasse d'un bord).
 */

import { useEffect, useId, useRef } from "react";

const INK = "#241043";

export default function Mascot({ pose = "stamp", size = 260, className = "", style, title = "Walty, la mascotte", impact = true }) {
  const raw = useId().replace(/:/g, "");
  const id = (n) => `${raw}-${n}`;
  const url = (n) => `url(#${id(n)})`;
  const ref = useRef(null);

  // Les yeux suivent la souris (avec un petit retard, plus naturel)
  useEffect(() => {
    const el = ref.current;
    if (!el || pose === "sleep") return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.25);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 380);
        el.style.setProperty("--px", ((dx / d) * 4.2 * k).toFixed(2));
        el.style.setProperty("--py", ((dy / d) * 3.6 * k).toFixed(2));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [pose]);

  const isPeek = pose === "peek";
  const isSit = pose === "sit";
  const viewBox = isPeek ? "40 4 180 134" : isSit ? "0 0 260 336" : "0 0 260 300";
  const [vw, vh] = isPeek ? [180, 134] : isSit ? [260, 336] : [260, 300];

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      width={size}
      height={Math.round((size * vh) / vw)}
      className={`walti walti--${pose} ${className}`}
      style={style}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={id("face")} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffc46e" />
          <stop offset="0.38" stopColor="#ff6a26" />
          <stop offset="0.78" stopColor="#ff3d62" />
          <stop offset="1" stopColor="#e2307c" />
        </linearGradient>
        <linearGradient id={id("back")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c8401a" />
          <stop offset="1" stopColor="#6d1a55" />
        </linearGradient>
        <radialGradient id={id("key")} cx="0.22" cy="0.18" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("ao")} cx="0.6" cy="1.05" r="0.75">
          <stop offset="0" stopColor="#4a1470" stopOpacity="0.55" />
          <stop offset="1" stopColor="#4a1470" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("rim")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.72" stopColor="#a98bff" stopOpacity="0" />
          <stop offset="1" stopColor="#b69cff" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={id("lip")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe1b8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe1b8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("card")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ebe3fb" />
        </linearGradient>
        <linearGradient id={id("pocket")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#2a0b2e" stopOpacity="0" />
          <stop offset="1" stopColor="#2a0b2e" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={id("violet")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b08cff" />
          <stop offset="1" stopColor="#5520d8" />
        </linearGradient>
        <linearGradient id={id("leg")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a2a86" />
          <stop offset="0.45" stopColor="#2c1457" />
          <stop offset="1" stopColor="#170830" />
        </linearGradient>
        <linearGradient id={id("shoe")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9d0ec" />
        </linearGradient>
        <radialGradient id={id("glove")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ddd3f0" />
        </radialGradient>
        <clipPath id={id("peekclip")}>
          <rect x="0" y="-60" width="260" height="184" />
        </clipPath>
        <clipPath id={id("clip")}>
          <rect x="50" y="110" width="160" height="140" rx="40" />
        </clipPath>
        <filter id={id("blur6")} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={id("blur3")} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={id("blur1")} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>

      {/* ── Ombres au sol (restent immobiles : il ne flotte pas) ── */}
      {!isPeek && !isSit && (
        <g className="w-shadow">
          <ellipse cx="132" cy="288" rx="84" ry="10" fill="#000" opacity="0.32" filter={url("blur6")} />
          <ellipse cx="130" cy="287" rx="56" ry="4.5" fill="#000" opacity="0.45" filter={url("blur3")} />
        </g>
      )}

      {/* ── Ombres sur la surface où il est assis ── */}
      {isSit && (
        <g>
          <ellipse cx="132" cy="252" rx="80" ry="5" fill="#000" opacity="0.55" filter={url("blur3")} />
          <ellipse className="w-legshadow w-legshadow-l" cx="114" cy="318" rx="15" ry="22" fill="#000" opacity="0.36" filter={url("blur6")} />
          <ellipse className="w-legshadow w-legshadow-r" cx="162" cy="318" rx="15" ry="22" fill="#000" opacity="0.36" filter={url("blur6")} />
        </g>
      )}

      <g className="w-rig">
        {/* ── Jambes ── */}
        {!isPeek && !isSit && <StandingLegs url={url} />}
        {isSit && <SittingLegs url={url} />}

        {/* ── Corps (respire / s'écrase depuis les hanches) ── */}
        <g className="w-body">
          {!isPeek && <BackArm pose={pose} url={url} />}

          {/* épaisseur arrière du porte-monnaie */}
          {!isPeek && <rect x="58" y="104" width="160" height="140" rx="40" fill={url("back")} />}
          {/* intérieur sombre de la poche */}
          {!isPeek && <path d="M72 112 Q130 96 206 106 L206 124 L72 124 Z" fill="#2a0b2e" opacity="0.85" />}

          {/* ── La carte glissée dans la poche = le visage ── */}
          <g clipPath={isPeek ? url("peekclip") : undefined}>
          <g className="w-card">
            <g transform="rotate(-5 130 76)">
              <rect x="69" y="27" width="128" height="100" rx="16" fill="#b9aad9" />
              <rect x="66" y="24" width="128" height="100" rx="16" fill={url("card")} />
              <rect x="66" y="24" width="128" height="100" rx="16" fill={url("pocket")} />
              <path d="M78 27 h100" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
              {[88, 109, 130, 151, 172].map((cx, i) => (
                <g key={cx}>
                  {i < 3 && <circle cx={cx} cy="42.5" r="6.5" fill="#b8330f" />}
                  <circle
                    className={i === 3 ? "w-slot-next" : undefined}
                    cx={cx}
                    cy="41"
                    r="6.5"
                    fill={i < 3 ? "#ff5b1f" : "none"}
                    stroke={i < 3 ? "none" : "#c4b3ec"}
                    strokeWidth="2"
                  />
                  {i < 3 && <circle cx={cx - 2} cy="39" r="1.8" fill="#fff" opacity="0.55" />}
                </g>
              ))}
              <Face pose={pose} />
            </g>
          </g>
          </g>

          {!isPeek && (
            <>
              {/* face avant éclairée */}
              <rect x="50" y="110" width="160" height="140" rx="40" fill={url("face")} />
              <g clipPath={url("clip")}>
                <rect x="50" y="110" width="160" height="140" fill={url("ao")} />
                <rect x="50" y="110" width="160" height="140" fill={url("key")} />
                <rect x="50" y="110" width="160" height="16" fill={url("lip")} opacity="0.55" />
                <rect x="49" y="109" width="162" height="142" rx="41" fill="none" stroke={url("rim")} strokeWidth="6" />
                <path d="M60 128 H200" stroke="#7a1d3b" strokeOpacity="0.25" strokeWidth="2" />
              </g>
              <rect x="61" y="138" width="138" height="101" rx="30" fill="none" stroke="#fff" strokeOpacity="0.42" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
              <ellipse cx="84" cy="150" rx="19" ry="8" fill="#fff" opacity="0.42" transform="rotate(-24 84 150)" />
              <circle cx="103" cy="141" r="3.4" fill="#fff" opacity="0.55" />
              <Mouth pose={pose} />
              <ellipse cx="86" cy="170" rx="11" ry="6" fill="#ff2e7e" opacity="0.45" />
              <ellipse cx="174" cy="170" rx="11" ry="6" fill="#ff2e7e" opacity="0.45" />
              {/* fermoir en volume */}
              <rect x="197" y="182" width="31" height="33" rx="11" fill="#3a18a0" />
              <rect x="194" y="179" width="31" height="33" rx="11" fill={url("violet")} />
              <circle cx="210" cy="195.5" r="6.2" fill="#e8b48a" />
              <circle cx="209" cy="194.5" r="5.4" fill="#ffd9ba" />
              <circle cx="207.5" cy="193" r="1.8" fill="#fff" />
            </>
          )}

          {!isPeek && <FrontArm pose={pose} url={url} />}

          {/* mains accrochées au rebord (pose peek) */}
          {isPeek && (
            <g>
              <Glove cx={84} cy={124} url={url} grip />
              <Glove cx={176} cy={124} url={url} grip />
            </g>
          )}
        </g>
      </g>

      {/* Effets */}
      {pose === "stamp" && impact && (
        <g className="w-impact" stroke="#2de2c4" strokeWidth="3" strokeLinecap="round">
          <path d="M272 124 l12 2" />
          <path d="M268 136 l10 9" />
          <path d="M254 142 l2 12" />
        </g>
      )}
      {pose === "sleep" && (
        <g className="w-zzz" fill="#c9b8ef" fontFamily="Unbounded Variable, sans-serif" fontWeight="700">
          <text x="196" y="40" fontSize="22">z</text>
          <text x="214" y="22" fontSize="16">z</text>
          <text x="228" y="8" fontSize="12">z</text>
        </g>
      )}
      {pose === "lost" && (
        <g className="w-question">
          <circle cx="224" cy="34" r="21" fill="#3a18a0" />
          <circle cx="222" cy="32" r="21" fill={url("violet")} />
          <text x="222" y="42" textAnchor="middle" fill="#fff" fontSize="27" fontWeight="800" fontFamily="Unbounded Variable, sans-serif">?</text>
        </g>
      )}
    </svg>
  );
}

/* ─────────── Visage (sur la carte) ─────────── */
function Face({ pose }) {
  if (pose === "sleep") {
    return (
      <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M94 82 q12 9 24 0" />
        <path d="M142 82 q12 9 24 0" />
      </g>
    );
  }
  return (
    <g>
      {pose === "lost" && (
        <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
          <path d="M93 57 l17 -4" />
          <path d="M167 57 l-17 -4" />
        </g>
      )}
      <g className="w-eyes">
        <g className="w-eyes-in">
          <ellipse cx="106" cy="80" rx="12" ry="15" fill={INK} />
          <ellipse cx="154" cy="80" rx="12" ry="15" fill={INK} />
          <g className="w-pupils">
            <circle cx="109" cy="74" r="4.6" fill="#fff" />
            <circle cx="157" cy="74" r="4.6" fill="#fff" />
            <circle cx="103" cy="86" r="2" fill="#fff" opacity="0.75" />
            <circle cx="151" cy="86" r="2" fill="#fff" opacity="0.75" />
          </g>
        </g>
      </g>
    </g>
  );
}

function Mouth({ pose }) {
  if (pose === "sleep") return <ellipse className="w-snore" cx="130" cy="166" rx="7" ry="5" fill="#3a0f33" />;
  if (pose === "lost") return <path d="M116 170 q14 -10 28 0" stroke="#3a0f33" strokeWidth="4" fill="none" strokeLinecap="round" />;
  return (
    <g className="w-mouth">
      <path d="M111 158 Q130 184 149 158 Q130 166 111 158Z" fill="#3a0f33" />
      <path d="M122 170 Q130 178 138 170 Q130 166 122 170Z" fill="#ff86b0" />
    </g>
  );
}

/* ─────────── Jambes ─────────── */
function Shoe({ x, url, flip }) {
  // basket vue de trois quarts, pointe légèrement vers l'extérieur
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} 0) scale(${s} 1)`}>
      <path d="M-13 284 q-2 -14 12 -16 h6 q16 1 19 13 q1 5 -3 6 z" fill={url("shoe")} />
      <path d="M-15 283 h39 q2 0 2 3 v1 a3 3 0 0 1 -3 3 h-36 a3 3 0 0 1 -3 -3 z" fill={url("violet")} />
      <path d="M-2 272 l8 3 M0 277 l8 3" stroke="#c4b3ec" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function StandingLegs({ url }) {
  return (
    <g className="w-legs">
      <rect x="99" y="236" width="14" height="40" rx="7" fill={url("leg")} />
      <rect x="147" y="236" width="14" height="40" rx="7" fill={url("leg")} />
      <Shoe x={102} url={url} flip />
      <Shoe x={158} url={url} />
    </g>
  );
}

function SittingLegs({ url }) {
  // assis : les cuisses partent vers nous (raccourcies), les tibias pendent devant le rebord
  const Leg = ({ x, side }) => (
    <g className={`w-shin w-shin-${side}`} style={{ transformOrigin: `${x}px 256px` }}>
      <rect x={x - 8} y="250" width="16" height="48" rx="8" fill={url("leg")} />
      <ellipse cx={x} cy="305" rx="17.5" ry="12.5" fill={url("shoe")} />
      <path d={`M${x - 16.5} 308 q16.5 10 33 0 v3.5 q-16.5 9 -33 0 z`} fill={url("violet")} />
      <path d={`M${x - 5} 297 l10 0`} stroke="#c4b3ec" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
  return (
    <g className="w-legs">
      <Leg x={108} side="l" />
      <Leg x={156} side="r" />
      {/* genoux (cuisses vues de face, en raccourci) */}
      <ellipse cx="108" cy="252" rx="10" ry="7" fill="#3a1c70" />
      <ellipse cx="156" cy="252" rx="10" ry="7" fill="#3a1c70" />
    </g>
  );
}

/* ─────────── Bras ─────────── */
function Hose({ d, w = 10 }) {
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#fff" strokeOpacity="0.16" strokeWidth={w * 0.3} fill="none" strokeLinecap="round" transform="translate(-1.6 -1.6)" />
    </g>
  );
}

function Glove({ cx, cy, url, r = 10.5, grip = false, open = false }) {
  if (open) {
    return (
      <g>
        {[-13, -4.5, 4.5, 13].map((dx, i) => (
          <rect key={i} x={cx + dx - 3.6} y={cy - 22 + Math.abs(dx) * 0.45} width="7.2" height="17" rx="3.6" fill={url("shoe")} stroke="#d4c8ee" strokeWidth="1.1" />
        ))}
        <circle cx={cx} cy={cy} r={12} fill={url("glove")} stroke="#d4c8ee" strokeWidth="1.4" />
      </g>
    );
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={url("glove")} stroke="#d4c8ee" strokeWidth="1.4" />
      {grip ? (
        <path d={`M${cx - 7} ${cy + 6} v5 M${cx} ${cy + 7} v5 M${cx + 7} ${cy + 6} v5`} stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      ) : (
        <path d={`M${cx - 4} ${cy - 5} q-3 5 0 10`} stroke="#c4b3ec" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function BackArm({ pose, url }) {
  // bras gauche passé derrière le corps (poses calmes)
  if (pose === "sleep") {
    return (
      <g>
        <Hose d="M56 190 C 38 200, 34 222, 42 240" />
        <Glove cx={42} cy={242} url={url} />
      </g>
    );
  }
  if (pose === "lost") {
    return (
      <g className="w-arm-l">
        <Hose d="M56 184 C 30 176, 22 160, 20 146" />
        <Glove cx={20} cy={142} url={url} />
      </g>
    );
  }
  return null;
}

function FrontArm({ pose, url }) {
  if (pose === "stamp") {
    return (
      <>
        {/* poing sur la hanche */}
        <Hose d="M56 182 C 26 178, 22 206, 56 214" />
        <Glove cx={58} cy={213} url={url} />
        {/* bras qui tamponne */}
        <g className="w-arm-r">
          <Hose d="M206 178 C 232 168, 242 140, 236 92" />
          <g>
            <circle cx="238" cy="58" r="15" fill="#3a18a0" />
            <circle cx="236" cy="56" r="15" fill={url("violet")} />
            <circle cx="231" cy="51" r="4.5" fill="#fff" opacity="0.6" />
            <rect x="230" y="68" width="12" height="26" rx="4" fill="#3b1c72" />
            <rect x="213" y="99" width="52" height="20" rx="7" fill="#3a18a0" />
            <rect x="210" y="96" width="52" height="20" rx="7" fill={url("violet")} />
            <rect x="214" y="99" width="18" height="4" rx="2" fill="#fff" opacity="0.35" />
            <rect x="213" y="115" width="46" height="6" rx="3" fill="#2de2c4" />
          </g>
          <Glove cx={236} cy={84} url={url} r={11} />
        </g>
      </>
    );
  }
  if (pose === "wave") {
    return (
      <>
        <Hose d="M56 182 C 26 178, 22 206, 56 214" />
        <Glove cx={58} cy={213} url={url} />
        <g className="w-arm-r">
          <Hose d="M206 180 C 232 172, 242 146, 238 118" />
          <Glove cx={238} cy={108} url={url} open />
        </g>
      </>
    );
  }
  if (pose === "sit") {
    // mains posées sur le rebord, doigts qui s'enroulent par-dessus
    return (
      <>
        <Hose d="M56 188 C 38 196, 34 222, 38 246" />
        <Hose d="M204 188 C 222 196, 226 222, 222 246" />
        <Glove cx={38} cy={246} url={url} grip />
        <Glove cx={222} cy={246} url={url} grip />
      </>
    );
  }
  if (pose === "lost") {
    return (
      <g className="w-arm-r">
        <Hose d="M206 184 C 230 188, 240 176, 244 160" />
        <Glove cx={244} cy={156} url={url} />
      </g>
    );
  }
  if (pose === "sleep") {
    return (
      <>
        <Hose d="M204 190 C 222 200, 226 222, 218 240" />
        <Glove cx={218} cy={242} url={url} />
      </>
    );
  }
  return null;
}
