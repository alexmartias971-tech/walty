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
            <h3>Je crée ma carte moi-même</h3>
            <ul>
              <li><Icon name="check" size={18} stroke={2.4} /> Prête en 10 minutes</li>
              {trialDays > 0 && <li><Icon name="check" size={18} stroke={2.4} /> {trialDays} jours gratuits</li>}
              <li><Icon name="check" size={18} stroke={2.4} /> Sans carte bancaire</li>
            </ul>
            <Link href="/creer" className="btn btn-light btn-lg stretch">Créer ma carte <span className="arrow"><Icon name="arrow" size={16} /></span></Link>
          </div>
          <div className="fork-card help">
            <h3>Je préfère qu'on vienne</h3>
            <ul>
              <li><Icon name="check" size={18} stroke={2.4} /> 15 minutes chez vous</li>
              <li><Icon name="check" size={18} stroke={2.4} /> On installe tout</li>
              <li><Icon name="check" size={18} stroke={2.4} /> Sans engagement</li>
            </ul>
            <Link href="/contact" className="btn btn-primary btn-lg stretch">Réserver une démo</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
