/** En-tête des pages intérieures : label, grand titre, intro, visuel optionnel à droite. */
export default function PageHero({ index, label, title, lead, children, orbs = true }) {
  return (
    <section className="page-hero">
      {orbs && (
        <div aria-hidden="true">
          <div className="orb orb-violet" style={{ width: 560, height: 560, left: "-14%", top: "-30%" }} />
          <div className="orb orb-orange" style={{ width: 460, height: 460, right: "-8%", top: "-10%", opacity: 0.4 }} />
        </div>
      )}
      <div className="rails" style={{ borderColor: "transparent" }}>
        <div className="page-hero-grid">
          <div className="stack">
            <span className="label reveal"><b>{index}</b> — {label}</span>
            <h1 className="display-l reveal" data-delay="1">{title}</h1>
            {lead && <p className="lead reveal" data-delay="2">{lead}</p>}
          </div>
          {children && <div className="reveal" data-delay="2">{children}</div>}
        </div>
      </div>
    </section>
  );
}
