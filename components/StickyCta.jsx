"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Sur mobile, après le premier écran : les deux portes d'entrée restent à portée de pouce. */
export default function StickyCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const end = document.getElementById("commencer");
      const atEnd = end && end.getBoundingClientRect().top < window.innerHeight * 0.85;
      setShow(window.scrollY > window.innerHeight * 0.7 && !atEnd);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);
  if (["/contact", "/creer", "/espace"].includes(pathname)) return null;
  return (
    <div className={`sticky-cta ${show ? "on" : ""}`} aria-hidden={!show}>
      <Link href="/contact" className="btn btn-primary" tabIndex={show ? 0 : -1}>Réserver une démo</Link>
      <Link href="/creer" className="btn btn-dark" tabIndex={show ? 0 : -1}>Créer ma carte <span className="soon-tag">Bientôt</span></Link>
    </div>
  );
}
