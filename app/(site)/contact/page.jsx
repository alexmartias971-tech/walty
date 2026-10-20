import { Suspense } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Icon from "@/components/Icon";
import ContactForm from "./ContactForm";
import { site, TODO } from "@/lib/site.config";

export const metadata = {
  title: "Contact",
  description: "Demandez une démo gratuite de Walty : on se déplace dans toute la Guadeloupe et on crée votre carte de fidélité digitale pendant le rendez-vous. Dès 9 € par mois, 14 jours d'essai gratuit.",
};

export default function ContactPage() {
  const wa = site.contact.whatsapp;
  return (
    <>
      <PageHero
        label="Contact"
        title={<>On passe <span className="serif">vous voir</span>{" "}?</>}
        lead="Une démo gratuite, chez vous. On crée votre carte pendant le rendez-vous, et vous l'essayez 14 jours. Sans engagement."
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
                <div className="info-line"><span className="step-icon"><Icon name="phone" size={20} /></span><div><b>Téléphone</b><span><a href={site.contact.phoneHref}>{site.contact.phone}</a></span></div></div>
                {site.contact.email && site.contact.email !== TODO && (
                  <div className="info-line"><span className="step-icon"><Icon name="mail" size={20} /></span><div><b>E-mail</b><span><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></span></div></div>
                )}
                <div className="info-line"><span className="step-icon"><Icon name="clock" size={20} /></span><div><b>Horaires</b><span>{site.contact.hours}</span></div></div>
                <div className="info-line"><span className="step-icon"><Icon name="pin" size={20} /></span><div><b>Zone d'intervention</b><span>{site.contact.zone}</span></div></div>
                {wa && (
                  <a className="btn btn-ghost" href={`https://wa.me/${wa}?text=${encodeURIComponent("Bonjour, je voudrais une démo de Walty.")}`} target="_blank" rel="noopener noreferrer">
                    <Icon name="whatsapp" size={18} /> Écrire sur WhatsApp
                  </a>
                )}
              </div>
              <div className="info-card glass">
                <h2 className="display-s" style={{ fontSize: 20 }}>Et après ?</h2>
                <ol className="list">
                  {["On vous rappelle sous 24 h ouvrées.", "On passe chez vous, à l'heure creuse.", "On crée votre carte pendant la démo.", "Vous l'essayez 14 jours, gratuitement.", "Vous décidez. Sans pression."].map((t, i) => (
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
