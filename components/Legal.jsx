import PageHero from "./PageHero";
import { TODO, site, legal } from "@/lib/site.config";

/** Affiche une valeur de configuration, ou un repère orange si elle reste à compléter. */
export function V({ v }) {
  if (!v || v === TODO) return <span className="todo">{TODO}</span>;
  return <>{v}</>;
}

export function Email() {
  const e = site.contact.email;
  if (!e || e === TODO) return <V v={e} />;
  return <a href={`mailto:${e}`}>{e}</a>;
}

export default function LegalPage({ index, label, title, children }) {
  const incomplete = [legal.ownerName, legal.address, legal.siren, legal.siret, site.contact.email].some((x) => x === TODO);
  return (
    <>
      <PageHero index={index} label={label} title={title} orbs={false} />
      <article className="legal">
        <p className="faint" style={{ fontSize: 14 }}>Dernière mise à jour : {legal.lastUpdate}</p>
        {incomplete && (
          <p className="notice" style={{ marginTop: 16 }}>
            Version de prévisualisation : les champs en orange doivent être complétés dans <code>lib/site.config.js</code> avant la mise en ligne publique du site.
          </p>
        )}
        {children}
      </article>
    </>
  );
}
