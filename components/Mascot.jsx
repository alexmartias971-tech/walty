"use client";

/**
 * WALTI — la mascotte.
 * Un petit porte-monnaie orange-crépuscule. Sa carte de fidélité dépasse de la
 * poche : c'est elle qui porte ses yeux (et ses 3 tampons déjà gagnés).
 * Gants blancs façon cartoon rétro, baskets à semelle violette.
 *
 * Poses : "stamp" (tamponne), "wave" (salue), "sit" (assis, jambes qui balancent),
 *         "sleep" (dort), "lost" (perdu, page 404), "peek" (seule la carte dépasse d'un bord).
 * Les pupilles suivent le curseur ; il cligne des yeux tout seul.
 */

import { useEffect, useId, useRef } from "react";

const INK = "#241043";

export default function Mascot({ pose = "stamp", size = 260, className = "", style, title = "Walti, la mascotte" }) {
  const raw = useId().replace(/:/g, "");
  const id = (n) => `${raw}-${n}`;
  const ref = useRef(null);

  // Les yeux suivent la souris
  useEffect(() => {
    const el = ref.current;
    if (!el || pose === "sleep") return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.3;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 400);
        el.style.setProperty("--px", ((dx / d) * 4.5 * k).toFixed(2));
        el.style.setProperty("--py", ((dy / d) * 4 * k).toFixed(2));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [pose]);

  const isPeek = pose === "peek";
  const viewBox = isPeek ? "40 6 180 132" : "0 0 260 300";
  const ratio = isPeek ? 132 / 180 : 300 / 260;

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      width={size}
      height={Math.round(size * ratio)}
      className={`walti walti--${pose} ${className}`}
      style={style}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={id("body")} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffbd66" />
          <stop offset="0.42" stopColor="#ff5b1f" />
          <stop offset="1" stopColor="#ff2e7e" />
        </linearGradient>
        <radialGradient id={id("shade")} cx="0.75" cy="0.95" r="0.8">
          <stop offset="0" stopColor="#7b3cff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#7b3cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ece4ff" />
        </linearGradient>
        <linearGradient id={id("violet")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a47bff" />
          <stop offset="1" stopColor="#5520d8" />
        </linearGradient>
        <radialGradient id={id("glove")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6ddf5" />
        </radialGradient>
        <clipPath id={id("clip")}>
          <rect x="50" y="108" width="160" height="142" rx="40" />
        </clipPath>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Ombre au sol */}
      {!isPeek && (
        <ellipse className="w-shadow" cx="130" cy="289" rx="72" ry="8" fill="#000" opacity="0.4" filter={`url(#${id("soft")})`} />
      )}

      {/* Marque de tampon (pose stamp) */}
      {pose === "stamp" && (
        <g transform="translate(236 262)">
          <g className="w-imprint">
            <circle r="17" fill="none" stroke="#2de2c4" strokeWidth="3" />
            <path d="M-8 -4 l3 10 l5 -8 l5 8 l3 -10" fill="none" stroke="#2de2c4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      )}

      <g className="w-bob">
        {/* ── Jambes + baskets ── */}
        {!isPeek && (
          <g className="w-legs">
            <g className="w-leg w-leg-l">
              <path d="M106 240 V272" stroke={INK} strokeWidth="11" strokeLinecap="round" />
              <path d="M88 270 h26 a9 9 0 0 1 9 9 v2 h-40 v-4 a7 7 0 0 1 5 -7z" fill="#fff" />
              <rect x="83" y="279" width="40" height="6" rx="3" fill={`url(#${id("violet")})`} />
            </g>
            <g className="w-leg w-leg-r">
              <path d="M154 240 V272" stroke={INK} strokeWidth="11" strokeLinecap="round" />
              <path d="M146 270 h26 a7 7 0 0 1 5 7 v4 h-40 v-2 a9 9 0 0 1 9 -9z" fill="#fff" />
              <rect x="137" y="279" width="40" height="6" rx="3" fill={`url(#${id("violet")})`} />
            </g>
          </g>
        )}

        {/* ── Bras gauche (côté spectateur), derrière le corps ── */}
        {!isPeek && !["stamp", "wave"].includes(pose) && <LeftArm pose={pose} id={id} />}

        {/* ── La carte de fidélité = le visage ── */}
        <g className="w-card">
          <g transform="rotate(-5 130 76)">
            <rect x="66" y="24" width="128" height="100" rx="16" fill={`url(#${id("card")})`} stroke="#fff" strokeWidth="2" />
            {/* 5 cases de tampons : 3 gagnés, 2 à venir */}
            {[88, 109, 130, 151, 172].map((cx, i) => (
              <circle
                key={cx}
                className={i === 3 ? "w-slot-next" : undefined}
                cx={cx}
                cy="41"
                r="6.5"
                fill={i < 3 ? "#ff5b1f" : "none"}
                stroke={i < 3 ? "none" : "#c9b8ef"}
                strokeWidth="2"
              />
            ))}
            {pose === "sleep" ? (
              <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
                <path d="M94 82 q12 9 24 0" />
                <path d="M142 82 q12 9 24 0" />
              </g>
            ) : (
              <g className="w-eyes">
                <ellipse cx="106" cy="80" rx="12" ry="15" fill={INK} />
                <ellipse cx="154" cy="80" rx="12" ry="15" fill={INK} />
                <g className="w-pupils">
                  <circle cx="109" cy="74" r="4.6" fill="#fff" />
                  <circle cx="157" cy="74" r="4.6" fill="#fff" />
                  <circle cx="103" cy="86" r="2" fill="#fff" opacity="0.8" />
                  <circle cx="151" cy="86" r="2" fill="#fff" opacity="0.8" />
                </g>
              </g>
            )}
            {pose === "lost" && (
              <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
                <path d="M92 58 l18 -5" />
                <path d="M168 58 l-18 -5" />
              </g>
            )}
          </g>
        </g>

        {/* ── Corps : le porte-monnaie ── */}
        {!isPeek && (
          <g className="w-body">
            <rect x="50" y="108" width="160" height="142" rx="40" fill={`url(#${id("body")})`} />
            <g clipPath={`url(#${id("clip")})`}>
              <rect x="50" y="108" width="160" height="142" fill={`url(#${id("shade")})`} />
              <rect x="40" y="108" width="180" height="24" fill="#6a0c3a" opacity="0.2" />
              <path d="M40 132 H220" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
            </g>
            <rect x="61" y="140" width="138" height="99" rx="30" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
            {/* reflet brillant */}
            <ellipse cx="86" cy="152" rx="20" ry="9" fill="#fff" opacity="0.38" transform="rotate(-24 86 152)" />
            <circle cx="104" cy="143" r="3.5" fill="#fff" opacity="0.5" />
            {/* bouche + joues */}
            {pose === "sleep" ? (
              <ellipse cx="130" cy="168" rx="7" ry="5" fill="#3a0f33" />
            ) : pose === "lost" ? (
              <path d="M116 172 q14 -10 28 0" stroke="#3a0f33" strokeWidth="4" fill="none" strokeLinecap="round" />
            ) : (
              <g className="w-mouth">
                <path d="M111 160 Q130 186 149 160 Q130 168 111 160Z" fill="#3a0f33" />
                <path d="M122 172 Q130 180 138 172 Q130 168 122 172Z" fill="#ff86b0" />
              </g>
            )}
            <ellipse cx="88" cy="168" rx="11" ry="6" fill="#ff2e7e" opacity="0.5" />
            <ellipse cx="172" cy="168" rx="11" ry="6" fill="#ff2e7e" opacity="0.5" />
            {/* fermoir */}
            <rect x="192" y="182" width="30" height="32" rx="11" fill={`url(#${id("violet")})`} />
            <circle cx="209" cy="198" r="6" fill="#ffd7b8" />
            <circle cx="207" cy="196" r="2" fill="#fff" />
          </g>
        )}

        {/* ── Poing sur la hanche, devant le corps ── */}
        {["stamp", "wave"].includes(pose) && <LeftArm pose={pose} id={id} />}

        {/* ── Bras droit ── */}
        {!isPeek && <RightArm pose={pose} id={id} />}

        {/* ── Mains accrochées au bord (pose peek) ── */}
        {isPeek && (
          <g>
            <circle cx="84" cy="122" r="11" fill={`url(#${id("glove")})`} stroke="#d9cdef" strokeWidth="1.5" />
            <circle cx="176" cy="122" r="11" fill={`url(#${id("glove")})`} stroke="#d9cdef" strokeWidth="1.5" />
            <path d="M78 118 v6 M84 117 v7 M90 118 v6" stroke="#cbbde6" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M170 118 v6 M176 117 v7 M182 118 v6" stroke="#cbbde6" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* Extras */}
      {pose === "sleep" && (
        <g className="w-zzz" fill="#c9b8ef" fontFamily="Unbounded Variable, sans-serif" fontWeight="700">
          <text x="196" y="40" fontSize="22">z</text>
          <text x="214" y="22" fontSize="16">z</text>
          <text x="228" y="8" fontSize="12">z</text>
        </g>
      )}
      {pose === "lost" && (
        <g className="w-question">
          <circle cx="222" cy="36" r="22" fill={`url(#${id("violet")})`} />
          <text x="222" y="46" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800" fontFamily="Unbounded Variable, sans-serif">?</text>
        </g>
      )}
    </svg>
  );
}

function Glove({ cx, cy, id, r = 11 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id("glove")})`} stroke="#d9cdef" strokeWidth="1.5" />
      <path d={`M${cx - 4} ${cy - 5} q-3 5 0 10`} stroke="#cbbde6" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function LeftArm({ pose, id }) {
  if (pose === "wave") {
    // poing sur la hanche
    return (
      <g className="w-arm-l">
        <path d="M56 180 C 26 178, 22 206, 56 214" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
        <Glove cx={58} cy={213} id={id} r={10} />
      </g>
    );
  }
  if (pose === "stamp") {
    // main sur la hanche, fier
    return (
      <g className="w-arm-l">
        <path d="M56 180 C 26 178, 22 206, 56 214" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
        <Glove cx={58} cy={213} id={id} r={10} />
      </g>
    );
  }
  if (pose === "lost") {
    return (
      <g className="w-arm-l">
        <path d="M56 184 C 30 176, 22 160, 20 146" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
        <Glove cx={20} cy={142} id={id} r={10} />
      </g>
    );
  }
  // sit / sleep : bras le long du corps
  return (
    <g className="w-arm-l">
      <path d="M54 190 C 36 200, 34 222, 42 240" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
      <Glove cx={42} cy={242} id={id} r={10} />
    </g>
  );
}

function RightArm({ pose, id }) {
  if (pose === "stamp") {
    return (
      <g className="w-arm-r w-thump">
        <path d="M206 178 C 230 170, 240 146, 236 108" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* le tampon */}
        <g>
          <circle cx="236" cy="72" r="15" fill={`url(#${id("violet")})`} />
          <circle cx="231" cy="67" r="4.5" fill="#fff" opacity="0.6" />
          <rect x="230" y="84" width="12" height="26" rx="4" fill="#3b1c72" />
          <rect x="210" y="112" width="52" height="20" rx="7" fill={`url(#${id("violet")})`} />
          <rect x="214" y="115" width="18" height="4" rx="2" fill="#fff" opacity="0.35" />
          <rect x="213" y="131" width="46" height="6" rx="3" fill="#2de2c4" />
        </g>
        <Glove cx={236} cy={100} id={id} r={11} />
      </g>
    );
  }
  if (pose === "wave") {
    return (
      <g className="w-arm-r w-wave">
        <path d="M206 180 C 232 172, 242 146, 238 116" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* main ouverte */}
        <g>
          <circle cx="238" cy="106" r="12" fill={`url(#${id("glove")})`} stroke="#d9cdef" strokeWidth="1.5" />
          {[-14, -5, 5, 14].map((dx, i) => (
            <rect key={i} x={238 + dx - 3.5} y={86 + Math.abs(dx) * 0.4} width="7" height="16" rx="3.5" fill="#fff" stroke="#d9cdef" strokeWidth="1.2" />
          ))}
        </g>
      </g>
    );
  }
  if (pose === "lost") {
    return (
      <g className="w-arm-r">
        <path d="M206 184 C 230 188, 240 176, 244 160" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
        <Glove cx={244} cy={156} id={id} r={10} />
      </g>
    );
  }
  return (
    <g className="w-arm-r">
      <path d="M206 190 C 224 200, 226 222, 218 240" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
      <Glove cx={218} cy={242} id={id} r={10} />
    </g>
  );
}
