"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

export const navLinks = [
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/espace", label: "Se connecter" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-bar">
        <Link href="/" aria-label="Walti, accueil"><Logo size={34} /></Link>
        <nav className="nav" aria-label="Navigation principale">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="row" style={{ "--gap": "8px" }}>
          <div className="header-ctas">
            <Link href="/contact" className="btn btn-ghost btn-sm">Réserver une démo</Link>
            <Link href="/creer" className="btn btn-primary btn-sm">Créer ma carte</Link>
          </div>
          <button className="burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}>
            <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 13h14" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu" aria-label="Navigation mobile">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Accueil</Link>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/creer" className="btn btn-primary" style={{ marginTop: 8 }}>Créer ma carte</Link>
          <Link href="/contact" className="btn btn-dark">Réserver une démo</Link>
        </nav>
      )}
    </header>
  );
}
