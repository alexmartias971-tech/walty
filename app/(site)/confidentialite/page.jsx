import Link from "next/link";
import LegalPage, { V, Email } from "@/components/Legal";
import { legal, processors, dataLocation } from "@/lib/site.config";

export const metadata = { title: "Politique de confidentialité", description: "Comment Walty collecte, utilise et protège vos données personnelles, conformément au RGPD." };

export default function Confidentialite() {
  return (
    <LegalPage index="L2" label="Légal" title="Politique de confidentialité">
      <p>Cette politique explique quelles données personnelles Walty collecte via ce site, pourquoi, combien de temps, et comment exercer vos droits. Elle est établie conformément au Règlement général sur la protection des données (RGPD, règlement UE 2016/679) et à la loi n° 78-17 du 6 janvier 1978 « Informatique et Libertés ».</p>

      <h2>1. Responsable du traitement</h2>
      <p><strong>Walty</strong>, exploité par <V v={legal.ownerName} />, {legal.legalFormInline}, <V v={legal.address} />, SIRET <V v={legal.siret} />. Contact pour toute question sur vos données : <Email />.</p>

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
              <td>Espace commerçant (connexion à votre carte, à vos chiffres et envoi de vos notifications)</td>
              <td>E-mail de connexion, mot de passe (stocké chiffré par notre hébergeur de base de données, en {dataLocation}), formule, texte et date des notifications que vous nous demandez d'envoyer</td>
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
            <tr>
              <td>Savoir quelles pages du site sont utiles et d'où viennent les visites (statistiques)</td>
              <td>Page consultée, site d'où vous venez (par exemple Instagram ou Google), type d'appareil (téléphone, tablette ou ordinateur), date. Aucun cookie, aucun identifiant, adresse IP non enregistrée : ces chiffres ne permettent pas de vous reconnaître.</td>
              <td>Intérêt légitime à améliorer le site (6.1.f)</td>
              <td>25 mois</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Les champs obligatoires des formulaires sont signalés par un astérisque ou indiqués à l'écran. Sans eux, nous ne pouvons pas répondre à votre demande. Aucune décision automatisée ni profilage n'est réalisé.</p>
      <p><strong>Le trajet de votre demande.</strong> Quand vous remplissez le formulaire de démo ou la liste d'attente, votre demande est enregistrée dans notre outil de suivi commercial (base de données hébergée par Supabase en {dataLocation}) et nous est envoyée par e-mail grâce au service Resend, puis arrive dans notre messagerie contact@walty.fr, hébergée par OVH en France. Elle n'est publiée nulle part et n'est lue que par nous.</p>

      <h2>3. Destinataires</h2>
      <p>Vos données sont destinées uniquement à Walty. Elles ne sont jamais vendues, louées ou cédées. Elles sont techniquement hébergées par les prestataires suivants, qui agissent comme sous-traitants et sont tenus par contrat de les protéger :</p>
      <ul>
        {processors.map((p) => (
          <li key={p.name}><strong>{p.name}</strong> — {p.role}. {p.transfer}</li>
        ))}
      </ul>
      <p>Si vous nous écrivez sur WhatsApp, vos messages transitent aussi par WhatsApp (Meta Platforms Ireland Ltd), selon ses propres conditions.</p>

      <h2>4. Où sont vos données ?</h2>
      <p>La base de données (espace commerçant, cartes de fidélité, suivi des demandes et statistiques de visite) est stockée en {dataLocation}. Notre messagerie est hébergée en France. Le site lui-même est servi par Vercel, et les e-mails du site sont envoyés par Resend depuis l'Irlande : ces deux sociétés sont américaines. Lorsque des données peuvent être consultées depuis les États-Unis, ce transfert est encadré par la décision d'adéquation de la Commission européenne (Data Privacy Framework UE–États-Unis), à laquelle ces sociétés ont adhéré, et par les clauses contractuelles types adoptées par la Commission.</p>

      <h2>5. Vos droits</h2>
      <p>Vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation du traitement, opposition (y compris, à tout moment et sans justification, à la prospection commerciale), portabilité, ainsi que du droit de définir des directives sur le sort de vos données après votre décès.</p>
      <p>Pour les exercer, écrivez à <Email /> ou à l'adresse postale indiquée ci-dessus. Nous répondons dans un délai d'un mois. Une pièce d'identité peut être demandée en cas de doute raisonnable sur votre identité.</p>
      <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL : <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">www.cnil.fr/fr/plaintes</a>, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.</p>

      <h2>6. Porteurs de cartes de fidélité</h2>
      <p>Lorsqu'un client d'un commerce ajoute une carte Walty dans son téléphone, c'est <strong>le commerce</strong> qui est responsable du traitement de ses données ; Walty agit pour son compte en tant que sous-traitant (art. 28 RGPD). Les informations sur ce traitement (données, durée, droits, accord pour recevoir les offres) sont fournies au porteur au moment de l'inscription à la carte et détaillées sur la page <Link href="/porteurs">vos données de porteur de carte</Link>. Pour exercer vos droits, adressez-vous au commerce concerné, ou écrivez-nous et nous transmettrons votre demande.</p>

      <h2>7. Sécurité</h2>
      <p>Les échanges avec le site sont chiffrés (HTTPS). L'espace administrateur est protégé par une authentification individuelle, et l'accès aux données est limité par des règles de sécurité au niveau de la base de données. Aucun système n'étant infaillible, en cas de violation de données présentant un risque pour vous, nous vous en informerons ainsi que la CNIL, dans les conditions prévues par le RGPD.</p>

      <h2>8. Cookies</h2>
      <p>Ce site n'utilise ni cookie publicitaire, ni outil de suivi, ni réseau social intégré. Il compte seulement les pages vues, de façon anonyme, sans cookie ni identifiant. Le détail figure sur la page <Link href="/cookies">cookies</Link>.</p>

      <h2>9. Modifications</h2>
      <p>Cette politique peut évoluer, par exemple si un nouveau service est ajouté. La date de mise à jour figure en haut de la page.</p>
    </LegalPage>
  );
}
