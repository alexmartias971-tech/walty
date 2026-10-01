import { Suspense } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Icon from "@/components/Icon";
import ContactForm from "./ContactForm";
import { site, TODO } from "@/lib/site.config";

export const metadata = {
  title: "Contact",
  description: "Demandez une démo de Walti : on se déplace dans toute la Guadeloupe pour vous montrer la carte de fidélité digitale sur votre téléphone.",
};

function val(v) {
  return v === TODO ? <span className="todo">{TODO}</span> : v;
}

export default function ContactPage() {
  const wa = site.contact.whatsapp;
  return (
    <>
      <PageHero
        label="Contact"
        title={<>On passe <span className="serif">vous voir</span> ?</>}
        lead="15 minutes chez vous. On vous montre la carte sur votre téléphone. Sans engagement."
      />
      <section className="frame">
        <div className="rails section" style={{ paddingTop: 64 }}>
          <div className="contact-grid">
            <Suspense fallback={<div className="form-card glass" style={{ minHeight: 600 }} />}>
              <ContactForm />
            </Suspense>
            <aside className="stack" style={{ "--gap": "16px" }}>
              <div className="info-card glass">
                <h2 className="display-s">Nous joindre</h2>
                <div className="info-line"><span className="step-icon"><Icon name="phone" size={20} /></span><div><b>Téléphone</b><span>{val(site.contact.phone)}</span></div></div>
                <div className="info-line"><span className="step-icon"><Icon name="mail" size={20} /></span><div><b>E-mail</b><span>{val(site.contact.email)}</span></div></div>
                <div className="info-line"><span className="step-icon"><Icon name="clock" size={20} /></span><div><b>Horaires</b><span>{site.contact.hours}</span></div></div>
                <div className="info-line"><span className="step-icon"><Icon name="pin" size={20} /></span><div><b>Zone d'intervention</b><span>{site.contact.zone}</span></div></div>
                {wa && (
                  <a className="btn btn-ghost" href={`https://wa.me/${wa}?text=${encodeURIComponent("Bonjour, je voudrais une démo de Walti.")}`} target="_blank" rel="noopener noreferrer">
                    <Icon name="whatsapp" size={18} /> Écrire sur WhatsApp
                  </a>
                )}
              </div>
              <div className="info-card glass">
                <h2 className="display-s" style={{ fontSize: 20 }}>Et après ?</h2>
                <ol className="list">
                  {["On vous rappelle sous 24 h.", "On passe chez vous, à l'heure creuse.", "Vous voyez la carte sur votre téléphone.", "Vous décidez. Sans pression."].map((t, i) => (
                    <li key={t}><span className="check">{i + 1}</span>{t}</li>
                  ))}
                </ol>
              </div>
              <div className="info-card glass">
                <h2 className="display-s" style={{ fontSize: 20 }}>Pressé ?</h2>
                <p className="muted" style={{ fontSize: 15 }}>Créez votre carte vous-même en 10 minutes. On l'active sous 24 h.</p>
                <Link href="/creer" className="btn btn-primary">Créer ma carte</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
