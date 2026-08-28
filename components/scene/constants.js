// Shared scene constants — chapter boundaries, assets, deferral thresholds.
// Single source of truth so choreography stays in sync across every chapter.


export const FONT = '/fonts/helvetiker_regular.typeface.json';

export const letterData = [
  { char: 'X', x: -2.7 },
  { char: 'V', x: -1.45 },
  { char: 'V', x: -0.25 },
  { char: 'I', x: 0.75 },
  { char: 'I', x: 1.25 },
  { char: 'X', x: 2.4 },
];

export const featuredProjects = [
  { title: 'DASTIN', image: '/projects/Dastin.jpg', accent: '#b9782d' },
  { title: 'CHRONA', image: '/projects/chrona-bio.jpg', accent: '#43c9a4' },
  { title: 'FORMA OS', image: '/projects/forma-os.jpg', accent: '#806be8' },
  { title: 'LAJEVARD', image: '/projects/lajevard-tea-house.jpg', accent: '#d0a540' },
  { title: 'AETHER', image: '/projects/aether.jpg', accent: '#637cf0' },
];

export const HERO_HANDOFF_END = 0.225;

export const WORK_START = HERO_HANDOFF_END;

export const WORK_END = 0.50;

export const SKILLS_START = 0.50;

export const SKILLS_END = 0.655;

export const SERVICES_START = 0.64;

export const SERVICES_END = 0.85;

export const PROCESS_START = 0.87;

export const PROCESS_END = 0.935;


export const CONTACT_START = 0.945;

export const CONTACT_END = 1.0;

export const entrances = [
  { position: [-5.4, 3.6, 2.6], rotation: [0.28, 0.62, -0.52] },
  { position: [4.8, 1.9, -2.7], rotation: [-0.45, -0.85, 0.55] },
  { position: [-1.5, 4.1, -3.2], rotation: [0.85, 0.3, -0.35] },
  { position: [0.7, -4.0, -2.5], rotation: [-0.75, 0.65, 0.25] },
  { position: [2.8, -3.5, -4.0], rotation: [0.5, -0.7, -0.55] },
  { position: [5.2, 0.5, -3.0], rotation: [-0.3, -1.0, 0.72] },
];

// Brand palette (single source of truth for future chapters/UI)
export const PALETTE = { gold: '#d7aa50', goldBright: '#f0cf7b', black: '#070604' };

// How early (in journey progress) each distant chapter mounts, so its
// geometry/shaders/textures load just before the visitor arrives.
export const DEFERRAL = {
  projects: 0.08,
  skills: 0.4,
  services: 0.55,
  process: 0.75,
  contact: 0.88,
};
