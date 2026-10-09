"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { noterEntree } from "@/lib/origine";

let premiere = true;

/**
 * Compte les pages vues, de façon anonyme (voir la page /cookies).
 * Rien n'est écrit ni lu dans le navigateur ; « Do Not Track » ou « Global Privacy Control » : rien n'est compté.
 */
export default function Visites() {
  const path = usePathname();
  useEffect(() => {
    if (navigator.globalPrivacyControl || navigator.doNotTrack === "1") return;
    const q = new URLSearchParams(window.location.search);
    const utm = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) if (q.get(k)) utm[k] = q.get(k).slice(0, 80);
    const corps = premiere ? { p: path, e: 1, r: document.referrer || "", ...utm } : { p: path, e: 0 };
    if (premiere) noterEntree(document.referrer, utm);
    premiere = false;
    fetch("/api/v", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps), keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
