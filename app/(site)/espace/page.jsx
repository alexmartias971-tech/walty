import EspaceApp from "./EspaceApp";

export const metadata = {
  title: "Espace commerçant",
  description: "Votre carte, vos clients et vos chiffres, au même endroit.",
  robots: { index: false, follow: false },
};

export default function EspacePage() {
  return <EspaceApp />;
}
