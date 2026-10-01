import Link from "next/link";
import LegalPage, { V, Email } from "@/components/Legal";
import { legal, processors } from "@/lib/site.config";

export const metadata = { title: "Politique de confidentialité", description: "Comment Walti collecte, utilise et protège vos données personnelles, conformément au RGPD." };

export default function Confidentialite() {
  return (
    <LegalPage index="L2" label="Légal" title="Politique de confidentialité">
      <p>Cette politique explique quelles données personnelles Walti collecte via ce site, pourquoi, combien de temps, et comment exercer vos droits. Elle est établie conformément au Règlement général sur la protection des données (RGPD, règlement UE 2016/679) et à la loi n° 78-17 du 6 janvier 1978 « Informatique et Libertés ».</p>

      <h2>1. Responsable du traitement</h2>
      <p><strong>Walti</strong>, exploité par <V v={legal.ownerName} />, {legal.legalForm.toLowerCase()}, <V v={legal.address} />, SIRET <V v={legal.siret} />. Contact pour toute question sur vos données : <Email />.</p>

      <h2>2. Données collectées et utilisations</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Pourquoi</th><th>Quelles données</th><th>Base légale (art. 6 RGPD)</th><th>Durée de conservation</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Répondre à votre demande de contact ou de démonstration</td>
              <td>Nom, nom du commerce, activité, commune, téléphone, e-mail, moyen de contact préféré, message</td>
              <td>Mesures précontractuelles prises à votre demande (6.1.b)</td>
              <td>3 ans à compter de notre dernier échange</td>
            </tr>
            <tr>
              <td>Vous prévenir de l'ouverture de « Créer ma carte » (liste d'attente)</td>
              <td>E-mail ou téléphone, nom du commerce (facultatif), formule envisagée</td>
              <td>Votre consentement, en vous inscrivant (6.1.a). Retirable à tout moment.</td>
              <td>Jusqu'au lancement, puis 6 mois</td>
            </tr>
            <tr>
              <td>Espace commerçant (connexion à votre carte et à vos chiffres)</td>
              <td>E-mail de connexion, mot de passe (stocké chiffré par notre hébergeur de base de données), formule</td>
              <td>Exécution du contrat (6.1.b)</td>
              <td>Durée du contrat, puis suppression du compte de connexion</td>
            </tr>
            <tr>
              <td>Prospection commerciale auprès de professionnels (appel, e-mail, WhatsApp)</td>
              <td>Coordonnées professionnelles, historique des échanges</td>
              <td>Intérêt légitime à faire connaître nos services (6.1.f). Vous pouvez vous y opposer à tout moment.</td>
              <td>3 ans à compter du dernier contact de votre part</td>
            </tr>
            <tr>
              <td>Gestion des clients : contrat, mise en place, support, facturation</td>
              <td>Identité et coordonnées du commerce et de son représentant, formule, historique, factures</td>
              <td>Exécution du contrat (6.1.b) ; obligation légale pour les factures (6.1.c)</td>
              <td>Durée du contrat + 5 ans ; factures et pièces comptables : 10 ans (art. L123-22 du Code de commerce)</td>
            </tr>
            <tr>
              <td>Sécurité du site et de l'espace administrateur</td>
              <td>Journaux techniques (adresse IP, date, pages demandées), gérés par l'hébergeur</td>
              <td>Intérêt légitime à sécuriser le service (6.1.f)</td>
              <td>Selon la politique de l'hébergeur, 12 mois maximum</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Les champs obligatoires des formulaires sont signalés par un astérisque ou indiqués à l'écran. Sans eux, nous ne pouvons pas répondre à votre demande. Aucune décision automatisée ni profilage n'est réalisé.</p>

      <h2>3. Destinataires</h2>
      <p>Vos données sont destinées uniquement à Walti. Elles ne sont jamais vendues, louées ou cédées. Elles sont techniquement hébergées par les prestataires suivants, qui agissent comme sous-traitants et sont tenus par contrat de les protéger :</p>
      <ul>
        {processors.map((p) => (
          <li key={p.name}><strong>{p.name}</strong> — {p.role}. {p.transfer}</li>
        ))}
      </ul>
      <p>Si vous nous écrivez sur WhatsApp, vos messages transitent aussi par WhatsApp (Meta Platforms Ireland Ltd), selon ses propres conditions.</p>

      <h2>4. Transferts hors de l'Union européenne</h2>
      <p>Lorsque des données sont accessibles depuis un pays hors de l'Union européenne (notamment les États-Unis pour l'hébergement du site), ce transfert est encadré par une décision d'adéquation de la Commission européenne (Data Privacy Framework UE–États-Unis) et/ou par les clauses contractuelles types adoptées par la Commission.</p>

      <h2>5. Vos droits</h2>
      <p>Vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation du traitement, opposition (y compris, à tout moment et sans justification, à la prospection commerciale), portabilité, ainsi que du droit de définir des directives sur le sort de vos données après votre décès.</p>
      <p>Pour les exercer, écrivez à <Email /> ou à l'adresse postale indiquée ci-dessus. Nous répondons dans un délai d'un mois. Une pièce d'identité peut être demandée en cas de doute raisonnable sur votre identité.</p>
      <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL : <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">www.cnil.fr/fr/plaintes</a>, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.</p>

      <h2>6. Porteurs de cartes de fidélité</h2>
      <p>Lorsqu'un client d'un commerce ajoute une carte Walti dans son téléphone, c'est <strong>le commerce</strong> qui est responsable du traitement de ses données ; Walti agit pour son compte en tant que sous-traitant (art. 28 RGPD). Les informations sur ce traitement (données, durée, droits) sont fournies au porteur au moment de l'inscription à la carte. Pour exercer vos droits, adressez-vous au commerce concerné, ou écrivez-nous et nous transmettrons votre demande.</p>

      <h2>7. Sécurité</h2>
      <p>Les échanges avec le site sont chiffrés (HTTPS). L'espace administrateur est protégé par une authentification individuelle, et l'accès aux données est limité par des règles de sécurité au niveau de la base de données. Aucun système n'étant infaillible, en cas de violation de données présentant un risque pour vous, nous vous en informerons ainsi que la CNIL, dans les conditions prévues par le RGPD.</p>

      <h2>8. Cookies</h2>
      <p>Ce site n'utilise ni cookie publicitaire, ni outil de mesure d'audience, ni réseau social intégré. Le détail figure sur la page <Link href="/cookies">cookies</Link>.</p>

      <h2>9. Modifications</h2>
      <p>Cette politique peut évoluer, par exemple si un nouveau service est ajouté. La date de mise à jour figure en haut de la page.</p>
    </LegalPage>
  );
}
