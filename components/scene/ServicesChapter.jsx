'use client';

import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SERVICES_START, SERVICES_END } from './constants';
import { clamp, easeOutCubic, smoothStep, chapterAlpha, readJourneyProgress, setGroupOpacity } from './utils';

function FoundationBrowser({ browserRef, shellRef, htmlRef }) {
  return (
    <group ref={shellRef}>
      <RoundedBox args={[4.82, 3.2, 0.12]} radius={0.14} smoothness={6} position={[0, 0, -0.12]}>
        <meshPhysicalMaterial color="#8f5a1c" emissive="#3a1d05" emissiveIntensity={0.25} metalness={0.94} roughness={0.16} clearcoat={1} />
      </RoundedBox>
      <RoundedBox args={[4.62, 3.02, 0.16]} radius={0.12} smoothness={6}>
        <meshPhysicalMaterial color="#110b06" emissive="#1e1005" emissiveIntensity={0.12} metalness={0.82} roughness={0.24} clearcoat={0.65} />
      </RoundedBox>
      <mesh position={[0, 1.45, 0.11]}>
        <boxGeometry args={[4.28, 0.045, 0.026]} />
        <meshBasicMaterial color="#e4b65c" toneMapped={false} transparent opacity={0.82} />
      </mesh>
      <mesh position={[-1.92, 1.45, 0.13]}>
        <boxGeometry args={[0.11, 0.11, 0.028]} />
        <meshBasicMaterial color="#f6cf7a" toneMapped={false} />
      </mesh>
      {/* The mockup is plain host HTML: .scene-canvas forces direction:ltr,
          which fixes the Chromium RTL-document/3D-transform projection bug
          that used to blank this mockup out. (An iframe was tried and failed:
          Chrome does not paint iframe content below the first line inside a
          matrix3d/preserve-3d context.) */}
      <Html ref={htmlRef} transform center position={[0, -0.03, 0.145]} distanceFactor={1.55} style={{ pointerEvents: 'none' }}>
        <div ref={browserRef} className="foundation-browser" dir="ltr">
          <div className="foundation-browser__chrome">
            <span className="foundation-browser__dots"><i /><i /><i /></span>
            <span className="foundation-browser__address">atelier-01 / base-build</span>
            <b className="foundation-browser__phase">PHASE 01 / 03</b>
          </div>
          <div className="foundation-browser__viewport">
            <div className="foundation-wireframe">
              <div className="foundation-browser__grid" />
              <header className="foundation-site-header foundation-layer foundation-layer--header">
                <span className="foundation-site-logo">ATELIER<span>/</span>01</span>
                <span className="foundation-site-nav"><i /><i /><i /></span>
              </header>
              <main>
                <span className="foundation-site-index foundation-layer foundation-layer--index">00 — 01 / FOUNDATION</span>
                <div className="foundation-site-hero">
                  <div className="foundation-wire-title foundation-layer foundation-layer--title"><i /><i /><i /></div>
                  <div className="foundation-wire-copy foundation-layer foundation-layer--copy"><i /><i /><i /><i /></div>
                  <div className="foundation-wire-art foundation-layer foundation-layer--art">
                    <span className="foundation-wire-art__cross" />
                    <span className="foundation-wire-art__cross foundation-wire-art__cross--second" />
                    <b>MEDIA<br />BLOCK</b>
                  </div>
                </div>
                <div className="foundation-site-grid foundation-layer foundation-layer--cards">
                  <div><i /><i /></div><div><i /><i /></div><div><i /><i /></div>
                </div>
              </main>
              <footer className="foundation-site-footer foundation-layer foundation-layer--footer">
                <span>RESPONSIVE SYSTEM / 12 COLUMNS</span>
                <span>BUILDING THE FIRST LAYER</span>
              </footer>
            </div>
            <div className="foundation-design">
              <nav className="foundation-design__nav">
                <span>ATELIER<span>/</span>01</span>
                <div><i>OBJECTS</i><i>SPACES</i><i>INDEX ↗</i></div>
              </nav>
              <span className="foundation-design__index">00 — 01 / VISUAL SYSTEM</span>
              <div className="foundation-design__hero">
                <div className="foundation-design__copy">
                  <span className="foundation-design__eyebrow">A DIGITAL FIELD GUIDE / 2026</span>
                  <h1>Make <em>space</em><br />visible.</h1>
                  <p>A quiet study of material, light and the structures we leave behind.</p>
                  <span className="foundation-design__cta">Explore the system <b>↗</b></span>
                </div>
                <div className="foundation-design__visual">
                  <span className="foundation-design__visual-index">01 / 03</span>
                  <div className="foundation-design__shape" />
                  <span className="foundation-design__visual-note">LIGHT STUDY<br />FORM / 01</span>
                </div>
              </div>
              <div className="foundation-design__cards">
                <div><b>01</b><span>LIGHT / MATERIAL</span><i /></div>
                <div><b>02</b><span>SPACE / MEMORY</span><i /></div>
                <div><b>03</b><span>FORM / MOTION</span><i /></div>
              </div>
              <div className="foundation-design__footer">
                <span>FIELD / FORM</span>
                <span>SCROLL TO DISCOVER</span>
                <span>© ATELIER 01</span>
              </div>
            </div>
            <div className="foundation-launch">
              <nav className="foundation-design__nav">
                <span>ATELIER<span>/</span>01</span>
                <div><i>OBJECTS</i><i>SPACES</i><i className="foundation-launch__online">● LIVE</i></div>
              </nav>
              <span className="foundation-design__index">00 — 01 / ONLINE EXPERIENCE</span>
              <div className="foundation-design__hero">
                <div className="foundation-design__copy">
                  <span className="foundation-design__eyebrow">LIVE EXPERIENCE / ATELIER 01</span>
                  <h1>Make <em>space</em><br />visible.</h1>
                  <p>The structure is built, the atmosphere is alive, and the experience is ready to be explored.</p>
                  <span className="foundation-design__cta">Open live preview <b>↗</b></span>
                </div>
                <div className="foundation-design__visual">
                  <span className="foundation-design__visual-index">LIVE / 01</span>
                  <div className="foundation-design__shape" />
                  <span className="foundation-launch__live-badge"><i /> ONLINE / READY</span>
                  <span className="foundation-design__visual-note">PUBLISHED<br />FORM / 01</span>
                </div>
              </div>
              <div className="foundation-design__cards">
                <div><b>01</b><span>LIVE / MATERIAL</span><i /></div>
                <div><b>02</b><span>LIVE / MEMORY</span><i /></div>
                <div><b>03</b><span>LIVE / MOTION</span><i /></div>
              </div>
              <div className="foundation-design__footer">
                <span>FIELD / FORM</span>
                <span>ONLINE / 2026</span>
                <span>© ATELIER 01</span>
              </div>
            </div>
            <div className="foundation-browser__status">
              <span className="foundation-status__wire">WIREFRAME</span>
              <span className="foundation-status__design">VISUAL SYSTEM</span>
              <span className="foundation-status__launch">LIVE PREVIEW</span>
              <i><b /></i>
              <span className="foundation-status__wire">BASE STRUCTURE</span>
              <span className="foundation-status__design">COLOR + DESIGN</span>
              <span className="foundation-status__launch">ONLINE / READY</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Section 4 begins with a fictive site foundation, then moves into its visual system.
export function ServicesChapter({ lang = 'en' }) {
  const root = useRef();
  const browser = useRef();
  const browserHtml = useRef();
  const shell = useRef();
  const browserProgress = useRef(0);
  const designProgress = useRef(0);
  const launchProgress = useRef(0);
  const phaseNodes = useRef([]);

  useEffect(() => {
    phaseNodes.current = Array.from(document.querySelectorAll('.journey-phase'));
    return () => { phaseNodes.current = []; };
  }, []);

  useFrame(({ clock }, delta) => {
    const progress = readJourneyProgress();
    const local = clamp((progress - SERVICES_START) / (SERVICES_END - SERVICES_START));
    const alpha = chapterAlpha(progress, SERVICES_START, SERVICES_END, 0.018);
    const mobile = window.innerWidth < 760;
    if (!root.current) return;

    const exit = smoothStep(0.76, 1, local);
    const exitAlpha = alpha * (1 - smoothStep(0.86, 1, local));
    root.current.visible = exitAlpha > 0.002;
    // drei's <Html> ignores hidden ancestor groups (see ScrollStory) — drive
    // the mockup's display from the chapter alpha as well.
    if (browserHtml.current) browserHtml.current.style.display = exitAlpha > 0.002 ? 'block' : 'none';
    const baseScale = mobile ? 0.5 : 0.9;
    const targetX = THREE.MathUtils.lerp(mobile ? 0 : 1.2, mobile ? 0.2 : 4.8, exit);
    const targetY = THREE.MathUtils.lerp(mobile ? -1.18 : -0.2, mobile ? -1.72 : -0.72, exit);
    const targetZ = THREE.MathUtils.lerp(-0.12, -3.4, exit);
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, baseScale * (1 - exit * 0.22), 5, delta));
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, targetX, 5, delta);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, targetY, 5, delta);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, targetZ, 5, delta);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, exit * -0.12, 4, delta);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, exit * -0.42, 4, delta);
    root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, exit * 0.06, 4, delta);
    setGroupOpacity(root.current, exitAlpha);

    const reveal = easeOutCubic(clamp(local / 0.28));
    if (shell.current) {
      const lift = easeOutCubic(clamp((local - 0.02) / 0.3));
      shell.current.position.x = THREE.MathUtils.damp(shell.current.position.x, THREE.MathUtils.lerp(3.8, 0, lift), 5, delta);
      shell.current.position.y = THREE.MathUtils.damp(shell.current.position.y, THREE.MathUtils.lerp(-1.15, 0, lift), 5, delta);
      shell.current.position.z = THREE.MathUtils.damp(shell.current.position.z, THREE.MathUtils.lerp(-4.2, 0, lift), 5, delta);
      shell.current.rotation.x = THREE.MathUtils.damp(shell.current.rotation.x, THREE.MathUtils.lerp(-0.32, 0.02, lift), 4, delta);
      shell.current.rotation.y = THREE.MathUtils.damp(shell.current.rotation.y, THREE.MathUtils.lerp(0.5, -0.08, lift), 4, delta);
      shell.current.rotation.z = THREE.MathUtils.damp(shell.current.rotation.z, THREE.MathUtils.lerp(-0.16, 0, lift), 4, delta);
      shell.current.scale.setScalar(THREE.MathUtils.damp(shell.current.scale.x, reveal, 5, delta));
    }

    browserProgress.current = THREE.MathUtils.damp(browserProgress.current, smoothStep(0.02, 0.30, local), 6, delta);
    designProgress.current = THREE.MathUtils.damp(designProgress.current, smoothStep(0.24, 0.58, local), 6, delta);
    launchProgress.current = THREE.MathUtils.damp(launchProgress.current, smoothStep(0.56, 0.90, local), 6, delta);
    const design = designProgress.current;
    const launch = launchProgress.current;
    if (browser.current) {
      browser.current.style.opacity = exitAlpha.toFixed(4);
      browser.current.style.transform = `translateZ(0) scale(${(0.985 + exitAlpha * 0.015).toFixed(4)})`;
      browser.current.style.setProperty('--foundation-progress', browserProgress.current.toFixed(4));
      browser.current.style.setProperty('--design-progress', design.toFixed(4));
      browser.current.style.setProperty('--launch-progress', launch.toFixed(4));
      browser.current.style.setProperty('--foundation-time', clock.elapsedTime.toFixed(3));
      const phaseLabel = browser.current.querySelector('.foundation-browser__phase');
      const address = browser.current.querySelector('.foundation-browser__address');
      if (phaseLabel) phaseLabel.textContent = launch > 0.12 ? 'PHASE 03 / 03' : design > 0.12 ? 'PHASE 02 / 03' : 'PHASE 01 / 03';
      if (address) address.textContent = launch > 0.12 ? 'atelier-01 / live-preview' : design > 0.12 ? 'atelier-01 / visual-system' : 'atelier-01 / base-build';
    }
    const activePhase = launch > 0.1 ? 2 : design > 0.1 ? 1 : 0;
    phaseNodes.current.forEach((node, index) => {
      node.classList.toggle('is-active', index === activePhase);
      node.classList.toggle('is-complete', index < activePhase);
    });
  });

  return (
    <group ref={root} visible={false} scale={0.0001}>
      <FoundationBrowser browserRef={browser} shellRef={shell} htmlRef={browserHtml} />
    </group>
  );
}
