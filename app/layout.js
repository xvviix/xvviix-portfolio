import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xvviix.github.io/xvviix-portfolio';
// Public-asset URL prefix: empty for dev/Vercel (site at root),
// '/xvviix-portfolio' for the GitHub Pages build (subpath repo).
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '';
// Prefixed asset URLs, injected as CSS variables so globals.css (which is
// shared between builds) can reference public assets with the right prefix.
const assetVars = ASSET_BASE
  ? {
      '--font-manrope-url': `url('${ASSET_BASE}/fonts/manrope.woff2')`,
      '--font-vazirmatn-url': `url('${ASSET_BASE}/fonts/vazirmatn.woff2')`,
      '--palace-bg-url': `url('${ASSET_BASE}/images/palace-bg-1920.webp')`,
      '--cursor-idle-url': `url('${ASSET_BASE}/cursors/luxury-gold-cursor.svg')`,
      '--cursor-active-url': `url('${ASSET_BASE}/cursors/luxury-gold-interactive-v2.svg')`,
    }
  : undefined;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'XVVIIX — Creative Developer',
  description: 'Cinematic websites, interactive experiences and useful digital products by XVVIIX.',
  keywords: ['creative developer', 'web design', 'three.js', 'interactive portfolio', 'XVVIIX'],
  manifest: 'manifest.webmanifest',
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: 'icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: 'icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'XVVIIX — Creative Developer',
    siteName: 'XVVIIX',
    description: 'Digital experiences engineered to be remembered.',
    type: 'website',
    url: SITE_URL,
    locale: 'en_US',
    alternateLocale: ['fa_IR'],
    images: [{ url: 'images/og-card.jpg', width: 1200, height: 630, alt: 'XVVIIX — Creative Developer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XVVIIX — Creative Developer',
    description: 'Digital experiences engineered to be remembered.',
    images: ['images/og-card.jpg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070604',
};

const FAQ_ENTRIES = [
  ['Who is XVVIIX?', 'XVVIIX is the independent creative studio of Matin, a creative developer building bespoke cinematic websites and interactive WebGL experiences in English and Persian.'],
  ['What services does XVVIIX offer?', 'Bespoke portfolio websites, brand websites and landing pages, and interactive web applications with real-time 3D — designed and coded end-to-end, never from templates.'],
  ['How long does a project take?', 'Typically 1–2 days of discovery, 1–3 weeks of design and build, then 2–3 days of polish before launch.'],
  ['Does XVVIIX build Persian (RTL) websites?', 'Yes — every project ships bilingual-ready with complete RTL support and Persian typography, or fully localized in Persian.'],
  ['How much does a website cost?', 'Projects are scoped in three tiers — Starter, Professional and Premium. Send a brief via Telegram to get a precise quote.'],
  ['Where can I see previous work?', 'Five selected projects — Dastin, Chrona, Forma OS, Lajevard and Aether — are showcased on the site with live links.'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'XVVIIX',
      url: SITE_URL,
      description: 'Cinematic websites, interactive experiences and useful digital products.',
      inLanguage: ['en', 'fa'],
    },
    {
      '@type': 'ProfilePage',
      url: SITE_URL,
      mainEntity: {
        '@type': 'Person',
        name: 'Matin',
        alternateName: 'XVVIIX',
        url: SITE_URL,
        jobTitle: 'Creative Developer',
        knowsLanguage: ['en', 'fa'],
        knowsAbout: ['Creative Development', 'WebGL', 'Three.js', 'Next.js', 'Interaction Design'],
        sameAs: ['https://github.com/xvviix', 'https://t.me/xvviix'],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ENTRIES.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning style={assetVars}>
      <head>
        {/* Apply the returning visitor's language before first paint —
            prevents an LTR/EN flash for returning Persian users. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('xvviix-lang')==='fa'){document.documentElement.lang='fa';document.documentElement.dir='rtl';}}catch(e){}",
          }}
        />
        <link rel="preload" href={`${ASSET_BASE}/fonts/manrope.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Vazirmatn is intentionally NOT preloaded: it is only needed after a
            visitor switches to Persian, and font-display:swap loads it on demand. */}
        <link rel="preload" href={`${ASSET_BASE}/fonts/helvetiker_regular.typeface.json`} as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href={`${ASSET_BASE}/images/palace-bg-1920.webp`} as="image" type="image/webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
