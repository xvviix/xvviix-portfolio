'use client';

import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  featuredProjects,
  WORK_START, WORK_END,
  SERVICES_START, SERVICES_END,
  PROCESS_START, PROCESS_END,
  CONTACT_START,
  DEFERRAL,
} from './constants';
import { clamp, chapterAlpha, smoothStep, setRootVar, setNodePointerEvents, readJourneyProgress } from './utils';
import { SceneBoundary } from './SceneBoundary';
import { DeferredChapter } from './DeferredChapter';
import { useReducedMotion } from './useReducedMotion';
import { Dust, CursorTrailLights } from './effects';
import { ScrollStory } from './ScrollStory';
import { ProjectsChapter } from './ProjectsChapter';
import { SkillsChapter } from './SkillsChapter';
import { ServicesChapter } from './ServicesChapter';
import { ProcessChapter } from './ProcessChapter';
import { ContactPortal } from './ContactPortal';


function JourneyDirector() {
  const tint = useRef(new THREE.Color('#d2a145'));
  const tintTarget = useRef(new THREE.Color('#d2a145'));
  const tintAlpha = useRef(0.06);
  const projectNodesRef = useRef([]);
  const contactNodeRef = useRef(null);

  useEffect(() => {
    projectNodesRef.current = Array.from(document.querySelectorAll('.journey-project'));
    contactNodeRef.current = document.querySelector('.journey-contact');
  }, []);

  useFrame((_, delta) => {
    const progress = readJourneyProgress();
    const root = document.documentElement;
    let targetColor = '#d2a145';
    let targetAlpha = 0.06;
    setRootVar('--journey-progress', progress.toFixed(4));
    setRootVar('--chapter-work', chapterAlpha(progress, WORK_START, WORK_END, 0.06).toFixed(4));
    setRootVar('--chapter-skills', chapterAlpha(progress, 0.48, 0.64, 0.035).toFixed(4));
    setRootVar('--chapter-services', chapterAlpha(progress, SERVICES_START, SERVICES_END, 0.04).toFixed(4));
    setRootVar('--chapter-process', chapterAlpha(progress, PROCESS_START, PROCESS_END, 0.018).toFixed(4));
    setRootVar('--chapter-contact', smoothStep(CONTACT_START - 0.05, 1.0, progress).toFixed(4));

    if (progress >= WORK_START && progress <= WORK_END) {
      const local = clamp((progress - WORK_START) / (WORK_END - WORK_START));
      const segment = 1 / featuredProjects.length;
      featuredProjects.forEach((project, index) => {
        const item = (local - index * segment) / segment;
        const active = item >= -0.08 && item <= 1;
        const copyFadeIn = index === 0 ? smoothStep(-0.08, 0.18, item) : smoothStep(-0.05, 0.08, item);
        const alpha = active ? copyFadeIn * (1 - smoothStep(0.72, 0.82, item)) : 0;
        setRootVar(`--featured-${index}`, alpha.toFixed(4));
        setNodePointerEvents(`project-${index}`, projectNodesRef.current[index], alpha > 0.45 ? 'auto' : 'none');
      });
      const index = Math.min(featuredProjects.length - 1, Math.floor(local * featuredProjects.length));
      targetColor = featuredProjects[index].accent;
      targetAlpha = 0.14;
    } else {
      featuredProjects.forEach((_, index) => {
        setRootVar(`--featured-${index}`, '0');
        setNodePointerEvents(`project-${index}`, projectNodesRef.current[index], 'none');
      });
      targetAlpha = progress > CONTACT_START - 0.01 ? 0.16 : 0.05;
      if (progress > CONTACT_START - 0.01) targetColor = '#d8a447';
    }
    tintTarget.current.set(targetColor);
    const colorEase = 1 - Math.exp(-delta * 3.4);
    tint.current.lerp(tintTarget.current, colorEase);
    tintAlpha.current = THREE.MathUtils.damp(tintAlpha.current, targetAlpha, 3.8, delta);
    setRootVar('--scene-tint', `#${tint.current.getHexString()}`);
    setRootVar('--scene-tint-alpha', tintAlpha.current.toFixed(4));
    setNodePointerEvents('contact', contactNodeRef.current, progress > CONTACT_START + 0.012 ? 'auto' : 'none');
  });
  return null;
}

export function Scene({ stories, lang }) {
  const reduced = useReducedMotion();
  return (
    <>
      <fog attach="fog" args={['#070401', 8, 18]} />
      
      {/* 100% Local Self-Contained Balanced Lighting Architecture */}
      <ambientLight intensity={0.52} color="#946328" />
      <hemisphereLight args={['#ffe8a3', '#150a03', 0.75]} />
      
      {/* Symmetrical 6-Directional Studio Light Array (Zero External Dependencies) */}
      
      {/* Pair 1: Front-Center Key Lights (±18° - Soft 0.65 intensity) */}
      <directionalLight position={[-1.85, 2.2, 5.7]} intensity={0.65} color="#fff3d6" />
      <directionalLight position={[1.85, 2.2, 5.7]} intensity={0.65} color="#fff3d6" />
      
      {/* Pair 2: Mid-Flank Fill Lights (±42° - Soft 0.45 intensity) */}
      <directionalLight position={[-4.0, 1.6, 4.45]} intensity={0.45} color="#ffe2a3" />
      <directionalLight position={[4.0, 1.6, 4.45]} intensity={0.45} color="#ffe2a3" />
      
      {/* Pair 3: Wide-Side Edge Kickers (±68° - Subtle 0.35 intensity) */}
      <directionalLight position={[-5.55, 2.4, 2.25]} intensity={0.35} color="#ffd88a" />
      <directionalLight position={[5.55, 2.4, 2.25]} intensity={0.35} color="#ffd88a" />
      
      <CursorTrailLights />
      <JourneyDirector />
      {/* Independent Suspense + error boundaries: the hero letters only wait
          for the typeface, and a failed project texture can never blank the
          stage or kill the other chapters.
          DeferredChapter keeps distant chapters unmounted until the visitor
          approaches them, shifting their mount cost off the critical path. */}
      <SceneBoundary name="hero">
        <Suspense fallback={null}>
          <ScrollStory stories={stories} lang={lang} reduced={reduced} />
        </Suspense>
      </SceneBoundary>
      <SceneBoundary name="projects">
        <DeferredChapter name="projects" threshold={DEFERRAL.projects}>
          <Suspense fallback={null}>
            <ProjectsChapter />
          </Suspense>
        </DeferredChapter>
      </SceneBoundary>
      <SceneBoundary name="skills">
        <DeferredChapter name="skills" threshold={DEFERRAL.skills}>
          <Suspense fallback={null}>
            <SkillsChapter reduced={reduced} />
          </Suspense>
        </DeferredChapter>
      </SceneBoundary>
      <SceneBoundary name="services">
        <DeferredChapter name="services" threshold={DEFERRAL.services}>
          <Suspense fallback={null}>
            <ServicesChapter lang={lang} />
          </Suspense>
        </DeferredChapter>
      </SceneBoundary>
      <SceneBoundary name="process">
        <DeferredChapter name="process" threshold={DEFERRAL.process}>
          <Suspense fallback={null}>
            <ProcessChapter reduced={reduced} />
          </Suspense>
        </DeferredChapter>
      </SceneBoundary>
      <SceneBoundary name="contact">
        <DeferredChapter name="contact" threshold={DEFERRAL.contact}>
          <Suspense fallback={null}>
            <ContactPortal reduced={reduced} />
          </Suspense>
        </DeferredChapter>
      </SceneBoundary>
      <Dust reduced={reduced} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.86} luminanceSmoothing={0.45} intensity={0.25} />
        <Noise opacity={0.015} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette offset={0.15} darkness={0.68} />
      </EffectComposer>
    </>
  );
}
