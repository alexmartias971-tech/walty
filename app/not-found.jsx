import Link from "next/link";
import Header from "@/components/Header";
import Mascot from "@/components/Mascot";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="nf">
        <div className="orb orb-violet" style={{ width: 600, height: 600, left: "10%", top: "10%" }} aria-hidden="true" />
        <div className="orb orb-orange" style={{ width: 500, height: 500, right: "5%", bottom: "0%", opacity: 0.35 }} aria-hidden="true" />
        <div className="z1" style={{ display: "grid", gap: 20, justifyItems: "center" }}>
          <Mascot pose="lost" size={220} title="Walti est perdu" />
          <div className="nf-code">404</div>
          <h1 className="display-s">Cette page s'est perdue en chemin.</h1>
          <p className="lead" style={{ margin: "0 auto" }}>Même Walti ne la retrouve pas. Retournons à l'accueil.</p>
          <Link href="/" className="btn btn-primary">Retour à l'accueil</Link>
        </div>
      </main>
    </>
  );
}
