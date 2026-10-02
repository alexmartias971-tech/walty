import "@fontsource-variable/unbounded";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./components.css";
import "./mascot.css";
import { site } from "@/lib/site.config";

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Walty · La carte de fidélité dans le téléphone de vos clients", template: "%s · Walty" },
  description: site.description,
  applicationName: "Walty",
  // Tant que les mentions légales ne sont pas complétées, le site n'est pas indexé.
  robots: site.isPublic ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Walty",
    title: "Walty · La carte de fidélité digitale",
    description: site.description,
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport = {
  themeColor: "#110c18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
