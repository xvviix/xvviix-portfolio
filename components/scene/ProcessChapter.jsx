'use client';

import { useFrame } from '@react-three/fiber';
import { Center, Text3D } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FONT, PROCESS_START, PROCESS_END } from './constants';
import { clamp, easeOutCubic, smoothStep, chapterAlpha, readJourneyProgress } from './utils';

const nameLetters = [
  { char: 'M', x: -2.25, entrance: [-4.8, 1.6, -2.4], rot: [0.24, 0.62, -0.32] },
  { char: 'A', x: -1.08, entrance: [3.6, 2.2, -2.9], rot: [-0.3, -0.58, 0.28] },
  { char: 'T', x: 0.02, entrance: [-0.6, -3.1, -2.6], rot: [0.6, 0.22, -0.18] },
  { char: 'I', x: 1.02, entrance: [2.2, -2.7, -3.2], rot: [-0.5, 0.56, 0.34] },
  { char: 'N', x: 2.05, entrance: [4.7, 0.7, -2.5], rot: [0.2, -0.72, 0.4] },
];

function StoryLetter({ item, letterRef, faceMaterial, sideMaterial }) {
  return (
    <group ref={letterRef}>
      <Center>
        <Text3D
          font={FONT}
          size={1.18}
          depth={0.31}
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.044}
          bevelSize={0.032}
          bevelSegments={9}
          material={[faceMaterial, sideMaterial]}
        >
          {item.char}
        </Text3D>
      </Center>
    </group>
  );
}

export function ProcessChapter({ reduced = false }) {
  const root = useRef();
  const letterRefs = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  const faceMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f2bf4c'),
    emissive: new THREE.Color('#381b03'),
    emissiveIntensity: 0.16,
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 1,
  }), []);

  const sideMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ba7b1d'),
    emissive: new THREE.Color('#221002'),
    emissiveIntensity: 0.1,
    metalness: 0.88,
    roughness: 0.32,
    clearcoat: 0.2,
    clearcoatRoughness: 0.15,
    transparent: true,
    opacity: 1,
  }), []);

  useEffect(() => () => {
    faceMaterial.dispose();
    sideMaterial.dispose();
  }, [faceMaterial, sideMaterial]);

  useEffect(() => {
    const onPointerMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const reset = () => { mouse.current.x = 0; mouse.current.y = 0; };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('mouseleave', reset);
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const progress = readJourneyProgress();
    const local = clamp((progress - PROCESS_START) / (PROCESS_END - PROCESS_START));
    const alpha = chapterAlpha(progress, PROCESS_START, PROCESS_END, 0.02);
    const mobile = window.innerWidth < 760;
    if (!root.current) return;

    root.current.visible = alpha > 0.002;
    smoothMouse.current.x = THREE.MathUtils.damp(smoothMouse.current.x, mouse.current.x, 4.8, delta);
    smoothMouse.current.y = THREE.MathUtils.damp(smoothMouse.current.y, mouse.current.y, 4.8, delta);
    const exit = smoothStep(0.78, 1, local);

    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, mobile ? 0 : 0.15, 5, delta);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, mobile ? -0.8 : -0.46, 5, delta);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, 0, 5, delta);
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, mobile ? 0.39 : 0.56, 5, delta));
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -smoothMouse.current.y * 0.055 * (1 - exit), 4.2, delta);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, smoothMouse.current.x * 0.075 * (1 - exit), 4.2, delta);

    // Exit mirrors the entrance exactly, played in reverse: the last letter in
    // (N) leaves first; each letter flies back to its original entrance pose
    // with its original rotation, shrinks and fades — the intro movement
    // inverted, keeping the chapter fully reversible on reverse scroll.
    nameLetters.forEach((item, index) => {
      const letter = letterRefs.current[index];
      if (!letter) return;
      const letterIn = easeOutCubic(clamp((local - index * 0.045) / 0.42));
      const letterOut = easeOutCubic(clamp((local - (0.66 + (nameLetters.length - 1 - index) * 0.035)) / 0.17));
      const docked = letterIn * (1 - letterOut);
      const idle = reduced ? 0 : docked;
      const t = clock.elapsedTime + index * 0.9;
      const pointerX = smoothMouse.current.x * 0.15 * idle;
      const pointerY = smoothMouse.current.y * 0.12 * idle;
      letter.visible = alpha > 0.002;
      letter.position.x = THREE.MathUtils.damp(letter.position.x, THREE.MathUtils.lerp(item.entrance[0], item.x + pointerX, docked), 8, delta);
      letter.position.y = THREE.MathUtils.damp(letter.position.y, THREE.MathUtils.lerp(item.entrance[1], Math.sin(t * 0.78) * 0.045 * idle + pointerY, docked), 8, delta);
      letter.position.z = THREE.MathUtils.damp(letter.position.z, THREE.MathUtils.lerp(item.entrance[2], 0.02 + Math.cos(t * 0.62) * 0.04 * idle, docked), 8, delta);
      letter.rotation.x = THREE.MathUtils.damp(letter.rotation.x, THREE.MathUtils.lerp(item.rot[0], -smoothMouse.current.y * 0.09 * idle, docked), 8, delta);
      letter.rotation.y = THREE.MathUtils.damp(letter.rotation.y, THREE.MathUtils.lerp(item.rot[1], smoothMouse.current.x * 0.12 * idle, docked), 8, delta);
      letter.rotation.z = THREE.MathUtils.damp(letter.rotation.z, THREE.MathUtils.lerp(item.rot[2], Math.sin(t * 0.5) * 0.025 * idle, docked), 8, delta);
      letter.scale.setScalar(THREE.MathUtils.damp(letter.scale.x, THREE.MathUtils.lerp(0.28, mobile ? 0.96 : 1.1, docked), 8, delta));
    });
    // Shared materials cannot fade per-letter, so the global fade follows the
    // same 0.66 -> 0.97 window as the staggered flight out.
    const letterFade = 1 - smoothStep(0.66, 0.97, local);
    faceMaterial.opacity = alpha * letterFade;
    sideMaterial.opacity = alpha * letterFade;
  });

  return (
    <group ref={root} visible={false}>
      {/* Decorative shapes removed — the MATIN letters are the centerpiece. */}
      {nameLetters.map((item, index) => (
        <StoryLetter
          key={`${item.char}-${index}`}
          item={item}
          letterRef={(node) => { letterRefs.current[index] = node; }}
          faceMaterial={faceMaterial}
          sideMaterial={sideMaterial}
        />
      ))}
    </group>
  );
}
