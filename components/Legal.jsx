import PageHero from "./PageHero";
import { TODO, site, legal } from "@/lib/site.config";

/** Affiche une valeur de configuration, ou un repère orange si elle reste à compléter. */
export function V({ v }) {
  if (!v || v === TODO) return <span className="todo">{TODO}</span>;
  return <>{v}</>;
}

export const hasEmail = Boolean(site.contact.email && site.contact.email !== TODO);

/** L'e-mail de contact ; tant qu'il n'existe pas, le téléphone (jamais de repère « à compléter » en public). */
export function Email() {
  const e = site.contact.email;
  if (!hasEmail) return <a href={site.contact.phoneHref}>{site.contact.phone}</a>;
  return <a href={`mailto:${e}`}>{e}</a>;
}

export default function LegalPage({ index, label, title, children }) {
  return (
    <>
      <PageHero index={index} label={label} title={title} orbs={false} />
      <article className="legal">
        <p className="faint" style={{ fontSize: 14 }}>Dernière mise à jour : {legal.lastUpdate}</p>
        {children}
      </article>
    </>
  );
}
