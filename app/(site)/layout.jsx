import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import StickyCta from "@/components/StickyCta";
import IntroLoader from "@/components/IntroLoader";

export default function SiteLayout({ children }) {
  return (
    <>
      <IntroLoader />
      <a href="#contenu" className="skip">Aller au contenu</a>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <StickyCta />
      <Reveal />
    </>
  );
}
