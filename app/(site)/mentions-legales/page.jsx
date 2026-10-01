import Link from "next/link";
import LegalPage, { V, Email } from "@/components/Legal";
import { legal, site, processors } from "@/lib/site.config";

export const metadata = { title: "Mentions légales", description: "Mentions légales du site Walti : éditeur, hébergeurs, propriété intellectuelle." };

export default function MentionsLegales() {
  return (
    <LegalPage index="L1" label="Légal" title="Mentions légales">
      <p>Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), voici les informations relatives à l'éditeur et à l'hébergement du site {site.url.replace(/^https?:\/\//, "")}.</p>

      <h2>1. Éditeur du site</h2>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><th>Nom commercial</th><td>{legal.tradeName}</td></tr>
            <tr><th>Exploitant</th><td><V v={legal.ownerName} /></td></tr>
            <tr><th>Statut</th><td>{legal.legalForm}</td></tr>
            <tr><th>Adresse</th><td><V v={legal.address} /></td></tr>
            <tr><th>SIREN</th><td><V v={legal.siren} /></td></tr>
            <tr><th>SIRET</th><td><V v={legal.siret} /></td></tr>
            <tr><th>Immatriculation</th><td>{legal.registry}</td></tr>
            <tr><th>E-mail</th><td><Email /></td></tr>
            <tr><th>Téléphone</th><td><V v={site.contact.phone} /></td></tr>
            <tr><th>Directeur de la publication</th><td><V v={legal.publicationDirector} /></td></tr>
          </tbody>
        </table>
      </div>

      <h2>2. Hébergement</h2>
      {processors.map((p) => (
        <p key={p.name}><strong>{p.name}</strong> ({p.role})<br />{p.address}<br /><a href={p.web} target="_blank" rel="noopener noreferrer">{p.web}</a></p>
      ))}

      <h2>3. Propriété intellectuelle</h2>
      <p>L'ensemble des éléments de ce site (textes, graphismes, logo, nom « Walti », mascotte Walti, illustrations, maquettes de cartes, code) est la propriété exclusive de l'éditeur, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par les articles L335-2 et suivants du Code de la propriété intellectuelle.</p>
      <p>Les commerces présentés sur les cartes d'exemple (« Le Bokit du Lagon », « Studio Hibiscus », « Coffee Plage », « Circuit Grand Prix ») sont fictifs. Toute ressemblance avec un commerce existant serait fortuite.</p>
      <p>Apple, Apple Wallet et iPhone sont des marques d'Apple Inc. Google, Google Wallet et Android sont des marques de Google LLC. Leur mention sert uniquement à indiquer la compatibilité du service ; Walti n'est ni affilié, ni sponsorisé, ni approuvé par ces sociétés.</p>

      <h2>4. Responsabilité</h2>
      <p>L'éditeur s'efforce de fournir des informations exactes et à jour, sans pouvoir garantir l'absence d'erreur. Les informations du site sont données à titre indicatif ; seules les conditions figurant dans le devis et les <Link href="/cgv">conditions générales de vente</Link> engagent l'éditeur. L'éditeur ne peut être tenu responsable du contenu des sites externes vers lesquels des liens renvoient.</p>

      <h2>5. Données personnelles et cookies</h2>
      <p>Le traitement de vos données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>. Ce site n'utilise aucun cookie publicitaire ni de mesure d'audience : voir la page <Link href="/cookies">cookies</Link>.</p>

      <h2>6. Crédits</h2>
      <p>Conception, identité visuelle et mascotte : Walti. Polices Unbounded et Manrope, sous licence SIL Open Font License, hébergées directement sur ce site (aucun appel à un service tiers).</p>

      <h2>7. Droit applicable</h2>
      <p>Les présentes mentions sont régies par le droit français. Tout litige relève des juridictions compétentes du ressort de la cour d'appel de Basse-Terre.</p>
    </LegalPage>
  );
}
