'use client';

import { useFrame } from '@react-three/fiber';
import { RoundedBox, Sparkles } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { CONTACT_START, CONTACT_END } from './constants';
import { clamp, easeOutCubic, readJourneyProgress, smoothStep } from './utils';

export function ContactPortal({ reduced = false }) {
  const root = useRef();
  const left = useRef();
  const right = useRef();
  const halo = useRef();
  const doorLight = useRef();

  useFrame(({ clock, viewport }, delta) => {
    const p = readJourneyProgress();
    const local = clamp((p - CONTACT_START) / (CONTACT_END - CONTACT_START));
    if (!root.current) return;
    // Gradual entrance: the portal fades in over a generous window as the
    // journey approaches the final chapter (and fades back out on reverse
    // scroll) instead of popping in at the chapter boundary.
    const appear = smoothStep(CONTACT_START - 0.05, 1.0, p);
    root.current.visible = appear > 0.002;
    const rootScale = window.innerWidth < 760 ? 0.62 : 1;
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, rootScale, 4, delta));
    const open = easeOutCubic(clamp((local - 0.18) / 0.48));
    // The doors slide out until their OUTER edge reaches the screen edge — a
    // long travel on wide desktops, a short one on phones (the whole portal is
    // scaled down there, so the travel is compensated by that scale) — and
    // never beyond, so they stay inside the palace frame.
    const doorTravel = open * Math.max(0, (viewport.width * 0.524) / rootScale - 1.34);
    left.current.position.x = THREE.MathUtils.damp(left.current.position.x, -(0.7 + doorTravel), 4, delta);
    right.current.position.x = THREE.MathUtils.damp(right.current.position.x, 0.7 + doorTravel, 4, delta);
    left.current.rotation.y = THREE.MathUtils.damp(left.current.rotation.y, -open * 0.2, 4, delta);
    right.current.rotation.y = THREE.MathUtils.damp(right.current.rotation.y, open * 0.2, 4, delta);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, THREE.MathUtils.lerp(-4, 0.15, easeOutCubic(clamp(local / 0.25))), 4, delta);
    if (halo.current) halo.current.rotation.z = reduced ? 0 : clock.elapsedTime * 0.08;
    if (doorLight.current) doorLight.current.intensity = (6 + open * 16) * appear;
    // Fade every material in proportion to its designed opacity.
    root.current.traverse((child) => {
      const materials = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
      materials.forEach((material) => {
        if (material.userData.baseOpacity === undefined) material.userData.baseOpacity = material.opacity;
        material.transparent = appear < 0.985;
        material.opacity = material.userData.baseOpacity * appear;
        material.depthWrite = appear > 0.35;
      });
    });
  });

  return (
    <group ref={root} visible={false}>
      <group ref={halo} position={[0, 0.35, -0.25]}>
        <mesh><torusGeometry args={[1.78, 0.11, 16, 96, Math.PI * 2]} /><meshPhysicalMaterial color="#b77c2b" metalness={0.9} roughness={0.14} clearcoat={1} /></mesh>
      </group>
      <RoundedBox ref={left} args={[1.28, 3.25, 0.2]} radius={0.1} smoothness={5}><meshPhysicalMaterial color="#3b210d" metalness={0.88} roughness={0.18} clearcoat={1} /></RoundedBox>
      <RoundedBox ref={right} args={[1.28, 3.25, 0.2]} radius={0.1} smoothness={5}><meshPhysicalMaterial color="#3b210d" metalness={0.88} roughness={0.18} clearcoat={1} /></RoundedBox>
      <pointLight ref={doorLight} position={[0, 0, -0.4]} color="#f1b84d" intensity={6} distance={7} decay={2} />
      {!reduced && <Sparkles count={38} scale={[4, 4, 2]} size={1.3} speed={0.12} opacity={0.5} color="#f0c86d" />}
    </group>
  );
}
