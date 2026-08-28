'use client';

import { useEffect, useState } from 'react';

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('loading');
    const start = performance.now();
    let frame;
    let doneTimer;

    const tick = (now) => {
      const elapsed = now - start;
      const value = Math.min(100, Math.round((elapsed / 1100) * 100));
      setProgress(value);

      if (value < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        doneTimer = window.setTimeout(() => {
          setDone(true);
          document.documentElement.classList.remove('loading');
        }, 150);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(doneTimer);
      document.documentElement.classList.remove('loading');
    };
  }, []);

  return (
    <div className={`loader ${done ? 'loader--done' : ''}`} aria-hidden="true">
      <div className="loader__halo" />
      <div className="loader__logo">X<span>/</span>VII<span>/</span>X</div>
      <div className="loader__line"><i style={{ width: `${progress}%` }} /></div>
      <div className="loader__meta">
        <span>{done ? 'EXPERIENCE READY' : 'IMMERSIVE PORTFOLIO'}</span>
        <b>{String(progress).padStart(3, '0')}</b>
      </div>
    </div>
  );
}
