# XVVIIX — Immersive 3D Portfolio

A production-ready bilingual portfolio built with **Next.js 16**, **React Three Fiber / Three.js**, **Lenis** and real-time post-processing.

## Configuration

Set `NEXT_PUBLIC_SITE_URL` (build time) to your production domain so `robots.txt`, `sitemap.xml` and Open Graph/Twitter cards resolve to absolute URLs — for example:

```bash
NEXT_PUBLIC_SITE_URL=https://xvviix.github.io/xvviix-portfolio npm run build
```

Unset, it falls back to `https://xvviix.github.io/xvviix-portfolio`.

## Project structure

```
app/            layout (SEO/JSON-LD), page, globals.css, robots, sitemap, llms.txt, not-found
components/
  scene/                       # the WebGL journey — one module per chapter
    constants.js               # chapter boundaries, deferral thresholds, palette
    utils.js                   # easing, scroll progress, root-var writers, seeded RNG
    SceneBoundary.jsx          # per-chapter error boundary
    DeferredChapter.jsx        # mounts a chapter only when the visitor approaches
    useReducedMotion.js        # live prefers-reduced-motion tracking
    effects.jsx                # ambient dust + cursor trail lights
    ScrollStory.jsx            # hero: six gold letters, plaques, 16,000-particle handoff
    ProjectsChapter.jsx        # 3D project screens
    SkillsChapter.jsx          # orbiting skill nodes + rain
    ServicesChapter.jsx        # browser-mockup build sequence
    ProcessChapter.jsx         # MATIN letters + medallion plaques
    ContactPortal.jsx          # gold arch, double-door portal
    Scene.jsx                  # composition, lighting, post-processing
    index.js                   # Canvas + WebGL capability gate
  Portfolio.jsx / Header / Loader / Timeline / WebGLBoundary / VitalsReporter
```

## Performance notes

- The hero background ships as a single 1920w WebP (~79KB, PSNR ≈44dB vs the original 2816px/230KB asset).
- 3D chapters are **deferred**: each one stays completely unmounted (no geometry, no shaders, no textures) until the visitor scrolls near it (`DeferredChapter`), keeping the initial load light. Mount order is observable via `window.__xvChapterMounts`.
- During `npm run dev`, a console **web-vitals reporter** logs TTFB/FCP/LCP/CLS and long-task budget (stripped from production builds).

## Stack

- Next.js 16 + React 19
- Three.js through React Three Fiber
- Drei helpers and local WebGL project textures
- Post-processing: bloom, noise and vignette with a capped 1.35 WebGL DPR for stable scrolling
- Custom rAF scroll choreography driven by Lenis progress (all chapter motion is computed in `useFrame`)
- Lenis for smooth, controlled scrolling
- Next Image for optimized portfolio imagery
- English / Persian with complete RTL support

## 3D scene

The hero is a real WebGL scene rather than a CSS approximation. It includes:

- A pinned, 6-stage scroll sequence that assembles `XVVIIX` one letter at a time
- Six properly spaced, solid bronze puzzle sockets form the final `XVVIIX` wordmark without overlapping
- All construction grids, outlines and puzzle frames are removed in favor of clean sculptural geometry
- A user-provided cinematic black-and-gold column hall is optimized locally and used as the lightweight hero background
- Each foreground letter now holds its story and project panel through a longer 56% dwell phase before docking
- Six direct entrance-and-docking paths restore the original motion language; the first X uses a raised front-depth approach so it never intersects its empty socket
- Once a letter enters the scene, a time-driven autonomous motion system adds stronger multi-frequency breathing, depth drift, rotation and scale movement even when scrolling stops
- Snap sparks and the short impact shake remain, without the later lift-and-align route or radial flash
- A custom animated gold shader gives every active letter bright polished faces, deep metallic sides, moving specular sweeps and a warm Fresnel glow
- A bilingual editorial story is physically attached to the foreground face of every letter
- A separate 3D browser panel displays the corresponding real project beside the active letter
- Each lock emits 122–147 GPU sparks on desktop (92–117 on mobile) from 4–7 newly randomized clusters sampled from the real letter geometry
- Before emission, the letter is hard-snapped to its exact socket and particles are transformed into the same floating coordinate space, preventing positional drift
- A tighter 300ms whole-hero impact shake fires on the exact frame each letter locks into place
- The old circular cursor is replaced by two same-hotspot beveled gold arrows; interactive controls use a brighter version without any positional jump
- A 115ms dual-layer gold light trail follows pointer movement at a capped 1.25 DPR and leaves up to 48 tiny low-opacity gold dust motes with 150–260ms lifetimes. The former moving PointLights were removed to eliminate global lighting flicker; a lightweight lag tracker still drives the custom gold shader without adding reflection hotspots or affecting HTML descriptions
- Global pointer tracking adds subtle tilt while the active letter and project panel are in view
- A slower 9.8-viewport pinned sequence gives every stage room to breathe
- Project titles use thin HTML typography instead of heavy extruded 3D text
- All floor and background construction lines are removed so the composition feels suspended in space
- Hero letters use Dastin, Chrona, Nova, Forma, Lajevard and Aether; the main work chapter features five projects without Orang
- Responsive scroll timing and composition for mobile

## Continuous journey

The old vertical sections have been replaced by one fixed 60-viewport experience with seven scroll-directed chapters:

1. XVVIIX letter assembly
2. Five high-resolution browser screens on a true circular Y-axis cylinder. The next panel now starts its hidden pre-roll 12% before its own segment and begins fading at -10%, exactly when the previous panel enters its final 10% exit. A slightly tighter 5.8-unit radius places the new panel on the left edge by the boundary, creating a controlled edge-to-edge overlap instead of empty travel. Project copy starts near -5% only after the first edge becomes visible, while the previous copy is already gone.
3. A smaller, deeper and lower skills solar system. Nine polished light-black spheres use 0.74 metalness and 0.25 roughness on a tilted metallic-gold ring; the central dark-gold sphere uses 0.72 metalness and 0.24 roughness. At the end of Skills, the solar system never freezes. Particle samples retain their source mesh and local triangle coordinates; during the 2–34% formation window, 5,500 positions are re-synchronized every frame from the moving spheres, orbit, cursor-facing labels and breathing root transform. Solid materials are explicitly switched to transparent rendering and fade from 6–34% while particles form from 2–20%, matching the Hero crossfade without positional drift. Once liquid fall begins, the particles detach, accelerate to one floor level, spread into a shallow gold puddle and fade. Reverse scrolling tracks the moving geometry again as it rebuilds.
4. A fictive browser-based build system that continues one fresh website through foundation, color/design and a visual live-preview phase
5. Four floating medallions with polished rings, dark insets and clear process numbers
6. Three glass-and-gold statistic plaques with crisp HTML typography
7. An ornate opening gold arch and double-door portal, short brief form, Telegram and reserved future messenger slots

The palace remains fixed while camera depth, objects, copy and project-derived lighting change continuously. Most chapter handoffs use a deterministic reversible dissolve driven by 2,400 fine gold particles; the Work-to-Skills handoff intentionally has no particle layer, allowing the final browser roll to finish cleanly before Skills enters. At the Hero handoff the exact final TextGeometry of all six letters is sampled into a dense 16,000-point cloud. Particles are distributed with area-weighted barycentric sampling across every triangle—not only geometry vertices—so the complete front, back and extruded side surfaces of each X, V and I are filled at their real orientation, position and size. The solid gold letters and bronze sockets make a clearly visible opacity crossfade into that stationary particle wordmark. The waiting gap has been shortened: scattering begins at 32% of the handoff and uses a smootherstep curve through 68%. While formed, every particle has a tiny independent clock-driven drift and size pulse. The initial scatter and final exit are now one continuous movement: radial acceleration starts at 50% while the first scatter is still running and continues through 93%, so the particles never pause or begin a visibly separate second animation. Their direction is calculated in screen-facing X/Y space, so they physically cross outside the frame instead of collapsing into the center. Only after they are beyond the visible bounds do they fade from 94.5% to 100%. The first Work screen now starts at 21.6% while the Hero particle exit continues until 22.5%, creating a controlled overlap of roughly 0.43 viewport instead of an empty pause. Reverse scroll pulls the particles back through the same edges and reforms the wordmark. Reverse scroll gathers the same deterministic points, restores the exact word shapes and fades the solid geometry back in. Cinematic holds give every chapter time to be read, and the mobile layout uses independent scaling and composition.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## GitHub Pages build

For the XVVIIX GitHub Pages domain, use:

```bash
npm run build:github
```

This sets `NEXT_PUBLIC_SITE_URL=https://xvviix.github.io/xvviix-portfolio` and enables static export settings for GitHub Pages.

## Production

```bash
npm run build
npm run start
```

The easiest deployment target is Vercel. Import the repository and deploy with the default Next.js settings.

## Main files

```text
app/page.js                  Next.js page entry
app/layout.js                Metadata and root layout
app/globals.css              Visual system and responsive design
components/Portfolio.jsx     Site content, language and motion system
components/scene/index.js  Complete Three.js / R3F WebGL scene
components/Header.jsx        Navigation and bilingual controls
components/Loader.jsx        Cinematic loading sequence
public/projects/             Local portfolio images
public/fonts/                Local fonts; no runtime font CDN
```

## Contact

Project enquiry buttons currently link to `https://t.me/xvviix`.
