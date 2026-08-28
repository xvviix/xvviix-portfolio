'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { updateScrollMetrics } from './utils';


export default function SceneCanvas({ stories, lang }) {
  // Fail fast when WebGL is unavailable (old GPU, blocked driver…):
  // flag <html> with `no-webgl` so the CSS fallback layout activates and
  // skip mounting the canvas entirely.
  const [supported] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const probe = document.createElement('canvas');
      return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!supported) {
      document.documentElement.classList.add('no-webgl');
      return undefined;
    }
    updateScrollMetrics();
    const onResize = () => updateScrollMetrics();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [supported]);

  if (!supported) return <div className="scene-canvas" aria-hidden="true" />;

  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.35]}
        camera={{ position: [0, 0, 6.45], fov: 34, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      >
        <Scene stories={stories} lang={lang} />
      </Canvas>
    </div>
  );
}
