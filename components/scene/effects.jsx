'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


export function Dust({ reduced = false }) {
  const points = useRef();
  const positions = useMemo(() => {
    const result = new Float32Array(340 * 3);
    for (let i = 0; i < 340; i += 1) {
      const radius = 2.6 + Math.random() * 7.2;
      const theta = Math.random() * Math.PI * 2;
      result[i * 3] = Math.cos(theta) * radius;
      result[i * 3 + 1] = (Math.random() - 0.5) * 5.8;
      result[i * 3 + 2] = Math.sin(theta) * radius - 3;
    }
    return result;
  }, []);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * (reduced ? 0 : 0.005);
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#bc8732" size={0.013} transparent opacity={0.38} depthWrite={false} sizeAttenuation />
    </points>
  );
}

export function CursorTrailLights() {
  const trail = useMemo(() => new THREE.Vector2(), []);
  useFrame((_, delta) => {
    const pointer = window.__xvPointer || { x: 0, y: 0 };
    trail.x = THREE.MathUtils.damp(trail.x, pointer.x, 3.2, delta);
    trail.y = THREE.MathUtils.damp(trail.y, pointer.y, 3.2, delta);
    window.__xvTrailPointer = { x: trail.x, y: trail.y };
  });
  return null;
}
