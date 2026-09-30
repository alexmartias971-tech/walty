import Link from "next/link";
import Logo from "./Logo";
import Mascot from "./Mascot";
import { site, legal } from "@/lib/site.config";

export default function Footer() {
  return (
    <footer className="footer">
      <Mascot pose="peek" size={130} className="footer-peek" title="Walti vous regarde partir" />
      <div className="rails">
        <div className="footer-grid">
          <div className="stack" style={{ "--gap": "18px" }}>
            <Logo size={38} />
            <p className="muted" style={{ maxWidth: 340 }}>
              La carte de fidélité des commerces de Guadeloupe, dans le téléphone de vos clients.
            </p>
            <p className="faint" style={{ fontSize: 13 }}>{site.contact.hours} · {site.contact.zone}</p>
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
              <li><Link href="/cgu">Conditions d'utilisation</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Walti · {legal.vat}</span>
        <span>Apple Wallet est une marque d'Apple Inc., Google Wallet une marque de Google LLC. Walti n'est affilié à aucune des deux.</span>
      </div>
    </footer>
  );
}
