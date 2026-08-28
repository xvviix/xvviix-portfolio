'use client';

import { useEffect, useState } from 'react';


export function DeferredChapter({ name, threshold, children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;
    let frame;
    const check = () => {
      if ((window.__xvJourney || 0) >= threshold) {
        (window.__xvChapterMounts ??= {})[name] = Math.round(performance.now());
        setReady(true);
        return;
      }
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [ready, threshold, name]);

  return ready ? children : null;
}
