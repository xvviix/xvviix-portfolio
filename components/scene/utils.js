// Shared scene utilities — math easing, scroll progress, root-CSS-var writers
// and the deterministic pseudo-random used by every particle system.


export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Root CSS variables are written ~15× per frame; skipping unchanged writes
// avoids useless style recomputation while the page is idle.
const rootVarCache = new Map();

export const setRootVar = (name, value) => {
  const serialized = String(value);
  if (rootVarCache.get(name) === serialized) return;
  rootVarCache.set(name, serialized);
  if (typeof document !== 'undefined') document.documentElement.style.setProperty(name, serialized);
};

export const pointerEventsCache = new Map();

export const setNodePointerEvents = (key, node, value) => {
  if (!node || pointerEventsCache.get(key) === value) return;
  pointerEventsCache.set(key, value);
  node.style.pointerEvents = value;
};

// Contains asset failures (e.g. a project texture that fails to download)
// so one broken chapter can never take down the rest of the scene.
// Unlike WebGLBoundary this renders nothing and keeps WebGL alive.

export const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

export const smoothStep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001));
  return t * t * (3 - 2 * t);
};

export const chapterAlpha = (progress, start, end, fade = 0.012) => smoothStep(start, start + fade, progress) * (1 - smoothStep(end - fade, end, progress));

let cachedJourneyHeight = 0;

let cachedInnerHeight = 0;

export const updateScrollMetrics = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const journey = document.querySelector('.hero');
  cachedJourneyHeight = journey ? journey.offsetHeight : (window.innerHeight * 48);
  cachedInnerHeight = window.innerHeight;
};

export const readJourneyProgress = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  if (!cachedJourneyHeight) updateScrollMetrics();
  const range = Math.max(cachedJourneyHeight - (cachedInnerHeight || window.innerHeight), 1);
  return clamp((window.__xvScroll || window.scrollY || 0) / range);
};

/**
 * Fade every material in a group (used for chapter entrances/exits).
 */
export const setGroupOpacity = (group, opacity) => {
  group.traverse((child) => {
    const materials = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
    materials.forEach((material) => {
      material.transparent = opacity < 0.985;
      material.opacity = opacity;
      material.depthWrite = opacity > 0.35;
    });
  });
};

/**
 * Tracks the visitor's prefers-reduced-motion setting (live) so purely
 * decorative idle motion can be switched off while scroll-driven content
 * choreography keeps working.
 */

export function seeded(index, seed) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}
