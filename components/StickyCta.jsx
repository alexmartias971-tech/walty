"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Bouton « Réserver une démo » fixé en bas de l'écran sur mobile, après le premier écran. */
export default function StickyCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const demo = document.getElementById("demo");
      const inDemo = demo && demo.getBoundingClientRect().top < window.innerHeight * 0.8;
      setShow(window.scrollY > window.innerHeight * 0.7 && !inDemo);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);
  if (pathname === "/contact") return null;
  return (
    <div className={`sticky-cta ${show ? "on" : ""}`} aria-hidden={!show}>
      <Link href={pathname === "/" ? "#demo" : "/#demo"} className="btn btn-primary" tabIndex={show ? 0 : -1}>Réserver ma démo gratuite</Link>
    </div>
  );
}
