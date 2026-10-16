/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Caméra, micro et position interdits partout… sauf la caméra sur l'espace commerçant (ci-dessous)
      { source: "/:path((?!espace$).*)", headers: [{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Espace commerçant : la caméra du téléphone sert à scanner les cartes (uniquement sur cette page)
      { source: "/espace", headers: [{ key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Les adresses techniques de Vercel (walty-xxx.vercel.app) ne doivent pas apparaître sur Google : seule walty.fr compte.
      { source: "/:path*", has: [{ type: "host", value: ".*\\.vercel\\.app" }], headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
