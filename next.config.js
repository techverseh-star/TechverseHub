// Monaco (the code editor) loads its runtime and workers from the jsdelivr
// CDN by default (@monaco-editor/react isn't configured to self-host from
// node_modules), so jsdelivr needs to stay allowed across script/style/font/
// connect/worker sources or the editor breaks in production.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data: https: blob:;
  font-src 'self' data: https://cdn.jsdelivr.net;
  worker-src 'self' blob:;
  connect-src 'self' https://*.supabase.co https://emkc.org https://cdn.jsdelivr.net https://www.google-analytics.com https://www.google.com https://*.adtrafficquality.google https://pagead2.googlesyndication.com https://generativelanguage.googleapis.com https://api.groq.com;
  frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
}

module.exports = nextConfig
