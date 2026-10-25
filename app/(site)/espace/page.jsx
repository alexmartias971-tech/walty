import EspaceApp from "./EspaceApp";
import "./espace.css";
import "./caisse.css";

export const metadata = {
  title: "Espace commerçant",
  description: "Scannez les cartes de vos clients, ajoutez des tampons, suivez vos chiffres et envoyez vos offres.",
  robots: { index: false, follow: false },
  // Application « Walty Caisse » (installable depuis l'espace commerçant seulement ; le reste du site ne change pas)
  manifest: "/caisse.webmanifest",
  icons: { icon: "/icon.svg", apple: "/caisse/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Walty Caisse", statusBarStyle: "black" },
  // anciens iPhone (avant iOS 16.4) : ouverture en plein écran depuis l'écran d'accueil
  other: { "apple-mobile-web-app-capable": "yes" },
};

export default function EspacePage() {
  return <EspaceApp />;
}
