import Link from "next/link";
import Logo from "./Logo";
import Mascot from "./Mascot";
import { site, legal } from "@/lib/site.config";

export default function Footer() {
  return (
    <footer className="footer frame">
      <div className="rails">
        <div className="footer-grid">
          <div className="stack" style={{ "--gap": "20px" }}>
            <Logo size={40} />
            <p className="muted" style={{ maxWidth: 360 }}>
              La carte de fidélité digitale des commerces de Guadeloupe. Créée pour vous, installée chez vous, dans le téléphone de vos clients.
            </p>
            <p className="faint" style={{ fontSize: 13 }}>{site.contact.zone}</p>
          </div>
          <div>
            <h4>Walti</h4>
            <ul>
              <li><Link href="/produit">Le produit</Link></li>
              <li><Link href="/tarifs">Tarifs</Link></li>
              <li><Link href="/a-propos">À propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/marque">Identité de marque</Link></li>
            </ul>
          </div>
          <div>
            <h4>Légal</h4>
            <ul>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/confidentialite">Confidentialité</Link></li>
              <li><Link href="/cgv">CGV</Link></li>
              <li><Link href="/cgu">CGU du site</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
            </ul>
          </div>
          <div className="footer-mascot">
            <h4>Une question ?</h4>
            <p className="muted" style={{ marginBottom: 18 }}>On se déplace dans toute la Guadeloupe pour vous montrer la carte en vrai.</p>
            <Link href="/contact" className="btn btn-primary btn-sm">Prendre rendez-vous</Link>
          </div>
        </div>
        <div className="footer-giant-wrap">
          <div className="footer-giant" aria-hidden="true">walti</div>
          <Mascot pose="peek" size={150} className="footer-peek" title="Walti vous regarde partir" />
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Walti · {legal.vat}</span>
        <span>Apple Wallet est une marque d'Apple Inc. Google Wallet est une marque de Google LLC. Walti n'est affilié ni à Apple ni à Google.</span>
      </div>
    </footer>
  );
}
