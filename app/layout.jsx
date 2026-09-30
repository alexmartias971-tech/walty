import "@fontsource-variable/unbounded";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./components.css";
import "./mascot.css";
import { site } from "@/lib/site.config";

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Walti · La carte de fidélité dans le téléphone de vos clients", template: "%s · Walti" },
  description: site.description,
  applicationName: "Walti",
  // Tant que les mentions légales ne sont pas complétées, le site n'est pas indexé.
  robots: site.isPublic ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Walti",
    title: "Walti · Faites-les revenir.",
    description: site.description,
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport = {
  themeColor: "#0b0713",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
