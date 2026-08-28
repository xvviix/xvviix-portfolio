'use client';

import { useFrame } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { featuredProjects, WORK_START, WORK_END } from './constants';
import { clamp, smoothStep, readJourneyProgress } from './utils';



function FeaturedScreen({ texture, index, groupRef, outerRef, frameRef, imageRef }) {
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  const accent = featuredProjects[index].accent;
  return (
    <group ref={groupRef} visible={false}>
      <RoundedBox args={[4.1, 2.97, 0.09]} radius={0.15} smoothness={6} position={[0, 0, -0.06]}>
        <meshStandardMaterial ref={outerRef} color="#b77a29" metalness={0.9} roughness={0.16} transparent opacity={0} />
      </RoundedBox>
      <RoundedBox args={[3.95, 2.82, 0.16]} radius={0.13} smoothness={6}>
        <meshStandardMaterial ref={frameRef} color="#120d08" metalness={0.72} roughness={0.25} transparent opacity={0} />
      </RoundedBox>
      <mesh position={[0, -0.06, 0.092]}>
        <planeGeometry args={[3.64, 2.48]} />
        <meshBasicMaterial ref={imageRef} map={texture} toneMapped={false} transparent opacity={0} />
      </mesh>
      <mesh position={[0, 1.25, 0.11]}>
        <boxGeometry args={[3.66, 0.16, 0.035]} />
        <meshBasicMaterial color="#080604" />
      </mesh>
      {[-1.64, -1.53, -1.42].map((x, dot) => (
        <mesh key={x} position={[x, 1.25, 0.132]}>
          <circleGeometry args={[0.025, 16]} />
          <meshBasicMaterial color={dot === 0 ? accent : '#4f4539'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function ProjectsChapter() {
  const groups = useRef([]);
  const outerFrames = useRef([]);
  const frames = useRef([]);
  const images = useRef([]);
  const textures = useTexture(featuredProjects.map((project) => project.image));
  useFrame(({ viewport }, delta) => {
    const progress = readJourneyProgress();
    const chapter = clamp((progress - WORK_START) / (WORK_END - WORK_START));
    const mobile = typeof window !== 'undefined' && window.innerWidth < 760;
    groups.current.forEach((group, index) => {
      if (!group) return;
      const segment = 1 / featuredProjects.length;
      const local = (chapter - index * segment) / segment;
      const active = local >= -0.12 && local <= 1;
      const screenFadeIn = index === 0 ? smoothStep(-0.12, 0.24, local) : smoothStep(-0.1, 0.12, local);
      const screenAlpha = active ? screenFadeIn * (1 - smoothStep(0.86, 1, local)) : 0;
      const pointer = window.__xvPointer || { x: 0, y: 0 };
      group.visible = progress >= WORK_START && progress <= WORK_END && active && screenAlpha > 0.002;

      const halfTurn = Math.PI * 0.5;
      let angle;
      if (local < 0.22) angle = THREE.MathUtils.lerp(-halfTurn, 0, smoothStep(-0.15, 0.22, local));
      else if (local < 0.66) angle = 0;
      else angle = THREE.MathUtils.lerp(0, halfTurn, smoothStep(0.66, 1, local));

      const radius = mobile ? 4.1 : 5.8;
      const centerX = mobile ? 0 : 0.85;
      const front = Math.pow(Math.max(0, Math.cos(angle)), 2);
      const x = centerX + Math.sin(angle) * radius;
      const z = 0.4 + (Math.cos(angle) - 1) * radius;
      group.position.x = THREE.MathUtils.damp(group.position.x, x, 8, delta);
      group.position.y = THREE.MathUtils.damp(group.position.y, mobile ? 0.35 : 0.02, 8, delta);
      group.position.z = THREE.MathUtils.damp(group.position.z, z, 8, delta);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, angle + pointer.x * 0.035 * front, 7, delta);
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -pointer.y * 0.028 * front, 7, delta);
      group.rotation.z = THREE.MathUtils.damp(group.rotation.z, 0, 7, delta);
      const scale = (mobile ? 0.62 : 0.95) * (0.78 + front * 0.22);
      group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, scale, 7, delta));
      if (outerFrames.current[index]) outerFrames.current[index].opacity = screenAlpha;
      if (frames.current[index]) frames.current[index].opacity = screenAlpha * 0.97;
      if (images.current[index]) images.current[index].opacity = screenAlpha;
    });
  });
  return (
    <group>
      {textures.map((texture, index) => (
        <FeaturedScreen key={featuredProjects[index].title} texture={texture} index={index}
          groupRef={(node) => { groups.current[index] = node; }}
          outerRef={(node) => { outerFrames.current[index] = node; }}
          frameRef={(node) => { frames.current[index] = node; }}
          imageRef={(node) => { images.current[index] = node; }} />
      ))}
    </group>
  );
}
