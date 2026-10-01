import Link from "next/link";
import Header from "@/components/Header";
import Mascot from "@/components/Mascot";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="nf">
        <div className="z1" style={{ display: "grid", gap: 20, justifyItems: "center" }}>
          <Mascot pose="lost" size={220} title="Walti est perdu" />
          <div className="nf-code">404</div>
          <h1 className="display-s">Cette page s'est perdue en chemin.</h1>
          <p className="lead" style={{ margin: "0 auto" }}>Même Walti ne la retrouve pas.</p>
          <div className="row" style={{ justifyContent: "center" }}><Link href="/" className="btn btn-primary">Retour à l'accueil</Link><Link href="/creer" className="btn btn-ghost">Créer ma carte</Link></div>
        </div>
      </main>
    </>
  );
}
