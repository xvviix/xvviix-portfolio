<div align="center">

# ✦ XVVIIX

### A cinematic 3D portfolio — *digital experiences engineered to be remembered.*

A single-page, scroll-driven WebGL journey in black & gold. No templates, no page
builders, no CSS fakes — every letter, particle and plaque is real-time 3D.
Fully bilingual (**English / فارسی** with complete RTL), tuned to hold 60fps on real devices.

[![LIVE DEMO — visit the journey](https://img.shields.io/badge/LIVE_DEMO-visit_the_journey-d4af37?style=for-the-badge)](https://xvviix.github.io/xvviix-portfolio/)
[![Telegram](https://img.shields.io/badge/Telegram-%40xvviix-2aabee?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/xvviix)
[![GitHub](https://img.shields.io/badge/GitHub-xvviix-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/xvviix)

<br>

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-000000?style=flat-square&logo=nextdotjs&logoColor=white)]()
[![React](https://img.shields.io/badge/React-19.2.8-149ECA?style=flat-square&logo=react&logoColor=white)]()
[![Three.js](https://img.shields.io/badge/Three.js-0.185.1-ffffff?style=flat-square&logo=threedotjs&logoColor=000000)]()
[![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-9.7.0-000000?style=flat-square)]()
[![Lenis](https://img.shields.io/badge/Lenis-1.3.26-d4af37?style=flat-square)]()
[![Node](https://img.shields.io/badge/Node-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)]()
[![CI/CD](https://img.shields.io/badge/CI_CD-GitHub_Pages-2ea44f?style=flat-square&logo=githubactions&logoColor=white)]()

</div>

---

## 🎬 The Journey

One fixed, 60-viewport experience. The stage stays still — camera depth, lighting,
objects and copy flow continuously through seven scroll-directed chapters:

| # | Chapter | What happens |
|:-:|---|---|
| 01 | **Prologue** | `XVVIIX` assembles letter by letter into six bronze sockets — custom gold shader, GPU sparks on each lock, then the whole wordmark dissolves into a dense 16,000-particle cloud |
| 02 | **Work** | Five high-resolution project screens orbit on a true circular 3D cylinder with controlled edge-to-edge handoffs |
| 03 | **Skills** | A nine-sphere solar system on a tilted gold ring — then it never freezes: the spheres melt into 5,500 particles that fall, spread into a gold puddle and fade |
| 04 | **Expertise** | A 3D browser mockup that builds one fresh website live: foundation → color & design → live preview |
| 05 | **Process** | Four floating medallions with polished rings and process numbers |
| 06 | **Numbers** | Three glass-and-gold statistic plaques with crisp HTML typography |
| 07 | **Contact** | An ornate gold arch and double-door portal — brief form, Telegram and reserved messenger slots |

Chapters hand off through deterministic, reversible gold-particle dissolves;
reverse scrolling replays every transition in perfect reverse.

## ✨ Featured Work

Five selected projects, each linked to its live site — showcased on a 3D cylinder
inside the portfolio itself:

| Project | The one-liner |
|---|---|
| [**DASTIN**](https://xvviix.github.io/Dastin/) | A premium Persian food brand — nature, story and quiet cinematic motion |
| [**CHRONA**](https://xvviix.github.io/chrona-bio/) | Biological-age intelligence as a precise, editorial clinical interface |
| [**FORMA OS**](https://xvviix.github.io/forma-os/) | A sharp launch experience for ambitious software teams |
| [**LAJEVARD**](https://xvviix.github.io/lajevard-tea-house/) | An editorial home for a Tehran tea house in midnight blue & gold |
| [**AETHER**](https://xvviix.github.io/aether/) | A premium AI platform for elite developers and product teams |

## 🧱 Stack

- **Next.js 16** + **React 19** — static-first, production-hardened
- **Three.js** through **React Three Fiber** — custom gold shaders, bloom, noise & vignette post-processing
- **Lenis** — smooth, controlled scrolling; all chapter motion is computed in `useFrame` from scroll progress
- **Bilingual EN/FA** — Vazirmatn & Manrope shipped locally, mirrored RTL layouts, proper Persian digits
- **Next Image** with AVIF/WebP for portfolio imagery — zero runtime font or image CDNs

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. During development a console **web-vitals
reporter** logs TTFB / FCP / LCP / CLS and the long-task budget (it is stripped
from production builds).

## ⚙️ Under the Hood

- **Deferred chapters** — each 3D chapter is completely unmounted (no geometry,
  no shaders, no textures) until the visitor scrolls near it, keeping the initial
  load light. Mount order is inspectable at `window.__xvChapterMounts`.
- **Solid → particle handoff** — the hero's final TextGeometry is sampled with
  area-weighted barycentric sampling into a 16,000-point cloud that fills the real
  front, back and extruded sides of every letter; solid gold and bronze then crossfade
  into the stationary particle wordmark without positional drift.
- **60fps discipline** — WebGL DPR is capped at 1.35 for stable scrolling; the
  hero background is a single locally optimized 1920w WebP (~79KB, PSNR ≈44dB vs
  the 2816px / 230KB original).
- **Graceful degradation** — a WebGL capability gate plus a per-chapter error
  boundary; `prefers-reduced-motion` is tracked live and choreography adapts.
- **Security-first production headers** — strict CSP, HSTS, `nosniff`,
  `Referrer-Policy` and a locked-down `Permissions-Policy` on every response.
- **Built to be found by AI too** — `robots.txt` explicitly welcomes
  GPTBot, PerplexityBot, ClaudeBot and friends (GEO), alongside `sitemap.xml`
  and an [`llms.txt`](https://llmstxt.org) page.

## 🗂 Project Structure

```text
app/
  layout.js                  metadata, JSON-LD, root layout
  page.js                    page entry
  globals.css                visual system + responsive design
  robots.js · sitemap.js     SEO / GEO routes
  llms.txt/                  markdown intro for generative engines
  not-found.js
components/
  Portfolio.jsx              site content, EN/FA language system, Lenis wiring
  Header.jsx · Loader.jsx    navigation + cinematic loading sequence
  Timeline.jsx               scroll progress timeline (client-only)
  WebGLBoundary.jsx          capability gate + fallback
  VitalsReporter.jsx         dev-only web-vitals console
  scene/                     the WebGL journey — one module per chapter
    index.js                 Canvas + WebGL gate
    Scene.jsx                composition, lighting, post-processing
    ScrollStory.jsx          hero: six gold letters, 16k-particle handoff
    ProjectsChapter.jsx      3D project screens
    SkillsChapter.jsx        orbiting skill nodes + particle rain
    ServicesChapter.jsx      browser-mockup build sequence
    ProcessChapter.jsx       medallion plaques
    ContactPortal.jsx        gold arch + double-door portal
    DeferredChapter.jsx      mounts a chapter only when approached
    SceneBoundary.jsx        per-chapter error boundary
    effects.jsx              ambient dust + cursor trail lights
    constants.js · utils.js  chapter boundaries, palette, easing, RNG
    useReducedMotion.js      live motion-preference tracking
lib/
  faDigits.js                Persian digit conversion
public/                      local fonts, project shots, icons, OG card
scripts/                     build helpers (asset prefixing, visual audit)
```

## 📌 Notes

- Every push to `main` is built and deployed to GitHub Pages automatically by
  GitHub Actions.
- The site ships with a web app manifest and icons — it is installable on
  mobile as an app-like experience.

---

<div dir="rtl" align="right">

### فارسی

پورتفولیوی تک‌صفحه‌ای و سینمایی با وب‌جی‌ال واقعی: بدون هیچ قالب آماده، با
تایپوگرافی فارسی صحیح (Vazirmatn) و پشتیبانی کامل RTL. هر فونت، هر ذره و هر
حرکت از صفر کد شده — طوری که روی دستگاه‌های واقعی هم ۶۰ فریم بر ثانیه بماند.

</div>

---

<div align="center">

Built by **Matin** ([@xvviix](https://github.com/xvviix)) · [Telegram](https://t.me/xvviix)

© 2026 Matin — All rights reserved.

</div>
