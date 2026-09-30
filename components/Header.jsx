"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/produit", label: "Le produit" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="header">
      <div className="header-bar glass">
        <Link href="/" aria-label="Walti, accueil"><Logo size={34} /></Link>
        <nav className="nav" aria-label="Navigation principale">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="row" style={{ "--gap": "8px" }}>
          <Link href="/contact" className="btn btn-primary btn-sm header-cta">Demander une démo</Link>
          <button className="burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}>
            <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 13h14" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu glass" aria-label="Navigation mobile">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</Link>
          ))}
          <Link href="/contact" className="btn btn-primary" style={{ marginTop: 8 }}>Demander une démo</Link>
        </nav>
      )}
    </header>
  );
}
