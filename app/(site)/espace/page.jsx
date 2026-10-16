import EspaceApp from "./EspaceApp";
import "./espace.css";

export const metadata = {
  title: "Espace commerçant",
  description: "Scannez les cartes de vos clients, ajoutez des tampons, suivez vos chiffres et envoyez vos offres.",
  robots: { index: false, follow: false },
};

export default function EspacePage() {
  return <EspaceApp />;
}
