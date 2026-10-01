import Link from "next/link";
import Mascot from "./Mascot";
import Icon from "./Icon";
import { trialDays } from "@/lib/offer";

/** Fin de page : deux portes, selon que le commerçant veut faire seul ou être accompagné. */
export default function Fork({ title = "Comment voulez-vous commencer ?" }) {
  return (
    <section className="frame" id="commencer">
      <div className="rails section">
        <div className="section-head center">
          <h2 className="display-l">{title}</h2>
        </div>
        <div className="fork-mascot" aria-hidden="true"><Mascot pose="wave" size={150} title="Walti vous salue" /></div>
        <div className="fork">
          <div className="fork-card self">
            <h3>On vient chez vous</h3>
            <ul>
              <li><Icon name="check" size={18} stroke={2.4} /> 15 minutes, démo gratuite</li>
              <li><Icon name="check" size={18} stroke={2.4} /> On crée et installe votre carte</li>
              {trialDays > 0 && <li><Icon name="check" size={18} stroke={2.4} /> {trialDays} jours offerts, sans engagement</li>}
            </ul>
            <Link href="/contact" className="btn btn-light btn-lg stretch">Réserver une démo <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
          </div>
          <div className="fork-card help">
            <h3>Je crée ma carte moi-même <span className="soon-tag">Bientôt</span></h3>
            <ul>
              <li><Icon name="sparkle" size={18} /> Vous décrivez votre commerce</li>
              <li><Icon name="sparkle" size={18} /> Notre agent IA crée votre carte</li>
              <li><Icon name="sparkle" size={18} /> En 2 minutes</li>
            </ul>
            <Link href="/creer" className="btn btn-ghost btn-lg stretch">Être prévenu</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
