export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xvviix.github.io/xvviix-portfolio';

// llms.txt — a concise, markdown introduction for generative engines
// (ChatGPT, Perplexity, Claude, Gemini…). https://llmstxt.org
const content = `# XVVIIX — Creative Developer (Matin)

> XVVIIX is the independent creative studio of Matin: bespoke cinematic websites, immersive WebGL experiences and useful digital products, built in English and Persian with full RTL support. Every project is engineered from scratch — zero templates — with real-time 3D, 60fps motion and sub-second load times.

XVVIIX designs and builds websites end-to-end: art direction, custom shaders and real-time 3D (Three.js), motion choreography, and production code on Next.js. This portfolio itself is the demo: a single-page bilingual (EN/FA) WebGL journey.

## Facts

- Identity: Matin, known as XVVIIX — independent creative developer
- Working languages: English and Persian (فارسی), full RTL typography (Vazirmatn)
- Stack: Next.js, React, Three.js / React Three Fiber, Lenis smooth scrolling, custom rAF choreography
- Process: 1–2 days discovery → 1–3 weeks art direction & build → 2–3 days polish & launch
- Budget tiers: Starter, Professional, Premium
- Contact: Telegram https://t.me/xvviix — GitHub https://github.com/xvviix

## Services

- Bespoke portfolio websites
- Brand websites & landing pages
- Interactive web applications (WebGL / real-time 3D)

## Selected work

- DASTIN — premium Persian food brand website — https://xvviix.github.io/Dastin/
- CHRONA — biological-age health intelligence platform — https://xvviix.github.io/chrona-bio/
- FORMA OS — software platform launch experience — https://xvviix.github.io/forma-os/
- LAJEVARD — Persian tea house in midnight blue & gold — https://xvviix.github.io/lajevard-tea-house/
- AETHER — premium AI platform — https://xvviix.github.io/aether/

## FAQ

- Who is XVVIIX? The independent creative studio of Matin, a creative developer building bespoke cinematic websites and interactive WebGL experiences in English and Persian.
- What services are offered? Bespoke portfolio websites, brand websites and landing pages, and interactive web applications with real-time 3D — designed and coded end-to-end, never from templates.
- How long does a project take? Typically 1–2 days of discovery, 1–3 weeks of design and build, then 2–3 days of polish before launch.
- Does XVVIIX build Persian (RTL) websites? Yes — bilingual-ready delivery with complete RTL support and Persian typography, or fully localized in Persian.
- How much does a project cost? Scoped in three tiers — Starter, Professional, Premium. Send a brief via Telegram for a precise quote.
- Where is the previous work? Five selected projects (Dastin, Chrona, Forma OS, Lajevard, Aether) are showcased on the site with live links.

## Links

- [Portfolio website](${SITE_URL})
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

export function GET() {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
