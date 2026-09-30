import { Suspense } from "react";
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
        index="C1"
        label="Contact"
        title={<>On passe <span className="serif grad-text">vous voir ?</span></>}
        lead="15 minutes, sur place, avec une carte de démonstration à votre nom installée sur votre téléphone. Sans engagement."
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
                <h2 className="display-s" style={{ fontSize: 20 }}>Ce qui se passe ensuite</h2>
                <ol className="list">
                  {["On vous rappelle sous 24 h ouvrées.", "On fixe un rendez-vous chez vous, à l'heure creuse.", "On vous montre la carte en vrai, sur votre téléphone.", "Vous décidez. Sans engagement, sans pression."].map((t, i) => (
                    <li key={t}><span className="check">{i + 1}</span>{t}</li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
