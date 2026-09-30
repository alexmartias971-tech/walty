import Link from "next/link";
import LegalPage, { Email } from "@/components/Legal";
import { site } from "@/lib/site.config";

export const metadata = { title: "Conditions d'utilisation du site", description: "Conditions générales d'utilisation du site Walti." };

export default function CGU() {
  return (
    <LegalPage index="L4" label="Légal" title="Conditions d'utilisation du site">
      <p>Les présentes conditions générales d'utilisation (« CGU ») encadrent l'accès et l'utilisation du site {site.url.replace(/^https?:\/\//, "")} (le « Site »). En naviguant sur le Site, vous les acceptez.</p>

      <h2>1. Objet du Site</h2>
      <p>Le Site présente les services de Walti (cartes de fidélité digitales pour les professionnels), permet de demander une démonstration, et donne accès à un espace administrateur réservé à l'éditeur.</p>

      <h2>2. Accès</h2>
      <p>Le Site est accessible gratuitement à toute personne disposant d'un accès à internet. Les frais de connexion restent à la charge de l'utilisateur. L'éditeur peut suspendre ou modifier le Site à tout moment, notamment pour maintenance, sans que sa responsabilité puisse être engagée.</p>

      <h2>3. Espace administrateur</h2>
      <p>L'espace administrateur est strictement réservé aux personnes autorisées par l'éditeur. Toute tentative d'accès non autorisé, de contournement des mesures de sécurité ou d'extraction de données est interdite et peut constituer une infraction pénale (articles 323-1 et suivants du Code pénal).</p>

      <h2>4. Utilisation du formulaire de contact</h2>
      <p>Vous vous engagez à fournir des informations exactes et à ne pas utiliser le formulaire à des fins de spam, de démarchage ou d'envoi de contenus illicites. Le traitement de vos données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.</p>

      <h2>5. Propriété intellectuelle</h2>
      <p>Les contenus du Site sont protégés (voir les <Link href="/mentions-legales">mentions légales</Link>). Vous pouvez les consulter pour un usage personnel ; toute autre utilisation nécessite l'accord écrit de l'éditeur.</p>

      <h2>6. Responsabilité</h2>
      <p>Les informations du Site sont fournies à titre indicatif et peuvent évoluer. Les exemples de cartes, de notifications et de commerces sont fictifs et illustratifs. Seuls le devis et les <Link href="/cgv">CGV</Link> engagent l'éditeur. L'éditeur n'est pas responsable des dommages résultant d'une utilisation anormale du Site ou d'un virus provenant d'un site tiers.</p>

      <h2>7. Liens</h2>
      <p>Le Site peut contenir des liens vers d'autres sites, sur lesquels l'éditeur n'exerce aucun contrôle. Tout lien vers le Site est autorisé à condition de ne pas porter atteinte à l'image de Walti et de ne pas intégrer ses pages dans un autre site.</p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes CGU sont régies par le droit français. Pour toute question : <Email />.</p>
    </LegalPage>
  );
}
