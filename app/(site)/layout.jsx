import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function SiteLayout({ children }) {
  return (
    <>
      <a href="#contenu" className="skip">Aller au contenu</a>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <Reveal />
    </>
  );
}
