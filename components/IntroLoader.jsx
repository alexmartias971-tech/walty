/**
 * Écran de chargement animé (1,6 s), une seule fois par visite.
 * Il ne bloque jamais le site : il est purement visuel, ne capte pas les clics,
 * et disparaît tout seul. Désactivé si l'appareil demande moins d'animations.
 */
const SKIP = "try{if(sessionStorage.getItem('walty-intro')){document.documentElement.classList.add('no-intro')}else{sessionStorage.setItem('walty-intro','1')}}catch(e){}";

export default function IntroLoader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP }} />
      <div className="intro" aria-hidden="true">
        <div className="intro-mark">
          <svg viewBox="0 0 200 190" width="210" height="200">
            <defs>
              <linearGradient id="intro-pocket" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffa23d" />
                <stop offset=".55" stopColor="#ff5b1f" />
                <stop offset="1" stopColor="#ff2e7e" />
              </linearGradient>
            </defs>
            {/* la carte, qui sort de la poche */}
            <g className="intro-card">
              <rect x="56" y="40" width="88" height="74" rx="13" fill="#f3ece3" />
              <g className="intro-stamps">
                <circle cx="76" cy="54" r="4.6" />
                <circle cx="91" cy="54" r="4.6" />
                <circle cx="106" cy="54" r="4.6" />
                <circle cx="121" cy="54" r="4.6" className="last" />
              </g>
              <g className="intro-eyes">
                <ellipse cx="86" cy="82" rx="6.4" ry="8.4" fill="#1c1226" />
                <ellipse cx="114" cy="82" rx="6.4" ry="8.4" fill="#1c1226" />
                <circle cx="88.4" cy="78.6" r="2.2" fill="#fff" />
                <circle cx="116.4" cy="78.6" r="2.2" fill="#fff" />
              </g>
            </g>
            {/* la poche du portefeuille, devant */}
            <g className="intro-pocket">
              <rect x="34" y="92" width="132" height="82" rx="24" fill="url(#intro-pocket)" />
              <rect x="44" y="102" width="112" height="62" rx="16" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeDasharray="5 5" />
              <path d="M88 136 q12 9 24 0" stroke="#5a1430" strokeWidth="3.4" strokeLinecap="round" fill="none" />
            </g>
          </svg>
          <div className="intro-word" aria-hidden="true">
            {"walty".split("").map((l, i) => <span key={i} style={{ "--i": i }}>{l}</span>)}
          </div>
        </div>
      </div>
    </>
  );
}
