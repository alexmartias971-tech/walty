/** En-tête des pages intérieures : petit sur-titre, grand titre, intro, visuel optionnel à droite. */
export default function PageHero({ label, title, lead, children }) {
  return (
    <section className="page-hero">
      <div className="rails" style={{ borderColor: "transparent" }}>
        <div className="page-hero-grid">
          <div className="stack">
            {label && <span className="label reveal">{label}</span>}
            <h1 className="display-l reveal" data-delay="1">{title}</h1>
            {lead && <p className="lead reveal" data-delay="2">{lead}</p>}
          </div>
          {children && <div className="reveal" data-delay="2">{children}</div>}
        </div>
      </div>
    </section>
  );
}
