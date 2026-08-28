'use client';

import { useFrame } from '@react-three/fiber';
import { Center, Float, Html, RoundedBox, Sparkles, Text3D } from '@react-three/drei';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FONT, letterData, entrances, HERO_HANDOFF_END } from './constants';
import { clamp, easeOutCubic, smoothStep, readJourneyProgress, setRootVar, seeded } from './utils';


const SparkBursts = forwardRef(function SparkBursts(_, ref) {
  const count = 720;
  const geometry = useRef();
  const cursor = useRef(0);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) data[i * 3 + 1] = -100;
    return data;
  }, []);
  const velocities = useMemo(() => new Float32Array(count * 3), []);
  const life = useMemo(() => new Float32Array(count), []);
  const maxLife = useMemo(() => new Float32Array(count), []);
  const lifeRatio = useMemo(() => new Float32Array(count), []);

  useImperativeHandle(ref, () => ({
    burstFromLetter(letterGroup, rootGroup, strength = 1) {
      let sourceMesh = null;
      letterGroup?.traverse((object) => {
        if (!sourceMesh && object.isMesh && object.geometry?.type === 'TextGeometry') sourceMesh = object;
      });
      if (!sourceMesh || !rootGroup) return;

      sourceMesh.updateWorldMatrix(true, false);
      rootGroup.updateWorldMatrix(true, false);
      const attribute = sourceMesh.geometry.attributes.position;
      const point = new THREE.Vector3();
      const center = new THREE.Vector3();
      letterGroup.getWorldPosition(center);
      rootGroup.worldToLocal(center);

      const clusterCount = 4 + Math.floor(Math.random() * 4);
      const clusters = [];
      for (let c = 0; c < clusterCount; c += 1) {
        const vertex = Math.floor(Math.random() * attribute.count);
        point.fromBufferAttribute(attribute, vertex).applyMatrix4(sourceMesh.matrixWorld);
        rootGroup.worldToLocal(point);
        clusters.push(point.clone());
      }

      const amount = (strength < 0.8 ? 92 : 122) + Math.floor(Math.random() * 26);
      for (let n = 0; n < amount; n += 1) {
        const index = cursor.current++ % count;
        const sampleWholeGlyph = Math.random() < 0.16;
        if (sampleWholeGlyph) {
          const vertex = Math.floor(Math.random() * attribute.count);
          point.fromBufferAttribute(attribute, vertex).applyMatrix4(sourceMesh.matrixWorld);
          rootGroup.worldToLocal(point);
        } else {
          point.copy(clusters[Math.floor(Math.random() * clusters.length)]);
        }

        const spread = 0.025 + Math.random() * 0.095;
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        positions[index * 3] = point.x + (Math.random() - 0.5) * spread;
        positions[index * 3 + 1] = point.y + (Math.random() - 0.5) * spread;
        positions[index * 3 + 2] = point.z + (Math.random() - 0.5) * spread * 0.8;
        velocities[index * 3] = (dx * (0.35 + Math.random() * 0.42) + (Math.random() - 0.5) * 0.9) * strength;
        velocities[index * 3 + 1] = (dy * 0.18 - 0.12 + Math.random() * 0.78) * strength;
        velocities[index * 3 + 2] = (Math.random() - 0.5) * 0.95 * strength;
        maxLife[index] = 0.5 + Math.random() * 0.58;
        life[index] = maxLife[index];
        lifeRatio[index] = 1;
      }
      if (geometry.current) {
        geometry.current.attributes.position.needsUpdate = true;
        geometry.current.attributes.aLife.needsUpdate = true;
      }
    },
  }));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033);
    let changed = false;
    for (let i = 0; i < count; i += 1) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      if (life[i] <= 0) {
        positions[i * 3 + 1] = -100;
        lifeRatio[i] = 0;
        changed = true;
        continue;
      }
      velocities[i * 3 + 1] -= 3.9 * dt;
      positions[i * 3] += velocities[i * 3] * dt;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
      lifeRatio[i] = Math.max(0, life[i] / maxLife[i]);
      changed = true;
    }
    if (changed && geometry.current) {
      geometry.current.attributes.position.needsUpdate = true;
      geometry.current.attributes.aLife.needsUpdate = true;
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aLife" args={[lifeRatio, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}
        vertexShader={`attribute float aLife; varying float vLife; void main(){vLife=aLife;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=1.4+aLife*3.6;}`}
        fragmentShader={`varying float vLife; void main(){float d=distance(gl_PointCoord,vec2(.5));float s=smoothstep(.5,.05,d);vec3 c=mix(vec3(1.,.38,.03),vec3(1.,.88,.42),vLife);gl_FragColor=vec4(c,s*vLife);}`}
      />
    </points>
  );
});

// Rich volumetric particle cloud distributed through the entire 3D volume of letters
const HeroLetterParticles = forwardRef(function HeroLetterParticles(_, ref) {
  const count = 16000;
  const points = useRef();
  const geometry = useRef();
  const material = useRef();
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const scatter = useMemo(() => new Float32Array(count * 3), []);
  const seeds = useMemo(() => new Float32Array(count), []);

  useImperativeHandle(ref, () => ({
    capture(letterGroups, rootGroup) {
      if (!rootGroup) return;
      rootGroup.updateWorldMatrix(true, true);
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const c = new THREE.Vector3();
      const ab = new THREE.Vector3();
      const ac = new THREE.Vector3();
      const point = new THREE.Vector3();

      const infos = letterGroups.map((group) => {
        let mesh = null;
        group?.traverse((object) => { if (!mesh && object.isMesh && object.geometry?.type === 'TextGeometry') mesh = object; });
        if (!mesh) return null;
        mesh.updateWorldMatrix(true, false);
        const attribute = mesh.geometry.attributes.position;
        const indexAttribute = mesh.geometry.index;
        const triangleCount = indexAttribute ? indexAttribute.count / 3 : attribute.count / 3;
        const triangles = new Uint32Array(triangleCount * 3);
        const cumulative = new Float32Array(triangleCount);
        let totalArea = 0;
        for (let triangle = 0; triangle < triangleCount; triangle += 1) {
          const ia = indexAttribute ? indexAttribute.getX(triangle * 3) : triangle * 3;
          const ib = indexAttribute ? indexAttribute.getX(triangle * 3 + 1) : triangle * 3 + 1;
          const ic = indexAttribute ? indexAttribute.getX(triangle * 3 + 2) : triangle * 3 + 2;
          triangles[triangle * 3] = ia;
          triangles[triangle * 3 + 1] = ib;
          triangles[triangle * 3 + 2] = ic;
          a.fromBufferAttribute(attribute, ia);
          b.fromBufferAttribute(attribute, ib);
          c.fromBufferAttribute(attribute, ic);
          ab.subVectors(b, a);
          ac.subVectors(c, a);
          totalArea += ab.cross(ac).length() * 0.5;
          cumulative[triangle] = totalArea;
        }
        return { mesh, attribute, triangles, cumulative, totalArea };
      }).filter(Boolean);

      const completeArea = infos.reduce((sum, info) => sum + info.totalArea, 0);
      let offset = 0;
      infos.forEach((info, letterIndex) => {
        const remaining = count - offset;
        const amount = letterIndex === infos.length - 1 ? remaining : Math.round(count * info.totalArea / completeArea);
        for (let n = 0; n < amount && offset < count; n += 1, offset += 1) {
          const targetArea = seeded(offset, 91) * info.totalArea;
          let low = 0; let high = info.cumulative.length - 1;
          while (low < high) {
            const middle = (low + high) >> 1;
            if (info.cumulative[middle] < targetArea) low = middle + 1; else high = middle;
          }
          const triangle = low;
          const ia = info.triangles[triangle * 3];
          const ib = info.triangles[triangle * 3 + 1];
          const ic = info.triangles[triangle * 3 + 2];
          a.fromBufferAttribute(info.attribute, ia);
          b.fromBufferAttribute(info.attribute, ib);
          c.fromBufferAttribute(info.attribute, ic);
          const sqrtU = Math.sqrt(seeded(offset, 97));
          const v = seeded(offset, 101);
          const wa = 1 - sqrtU;
          const wb = sqrtU * (1 - v);
          const wc = sqrtU * v;

          const isVolume = seeded(offset, 123) < 0.65;
          const depthSpan = isVolume ? (seeded(offset, 127) - 0.5) * 0.36 : (seeded(offset, 127) - 0.5) * 0.06;
          const volumeJitterX = isVolume ? (seeded(offset, 131) - 0.5) * 0.032 : 0;
          const volumeJitterY = isVolume ? (seeded(offset, 137) - 0.5) * 0.032 : 0;

          point.set(
            a.x * wa + b.x * wb + c.x * wc + volumeJitterX,
            a.y * wa + b.y * wb + c.y * wc + volumeJitterY,
            a.z * wa + b.z * wb + c.z * wc + depthSpan,
          ).applyMatrix4(info.mesh.matrixWorld);
          rootGroup.worldToLocal(point);
          positions[offset * 3] = point.x;
          positions[offset * 3 + 1] = point.y;
          positions[offset * 3 + 2] = point.z;

          const theta = seeded(offset, 103) * Math.PI * 2;
          const phi = Math.acos(2 * seeded(offset, 107) - 1);
          const distance = 2.4 + seeded(offset, 109) * 6.2;
          scatter[offset * 3] = Math.sin(phi) * Math.cos(theta) * distance;
          scatter[offset * 3 + 1] = Math.sin(phi) * Math.sin(theta) * distance;
          scatter[offset * 3 + 2] = Math.cos(phi) * distance;
          seeds[offset] = seeded(offset, 113);
        }
      });
      while (offset < count) { positions[offset * 3 + 1] = -100; offset += 1; }
      if (geometry.current) {
        geometry.current.attributes.position.needsUpdate = true;
        geometry.current.attributes.aScatter.needsUpdate = true;
        geometry.current.attributes.aSeed.needsUpdate = true;
      }
    },
    setProgress(value) {
      if (material.current) material.current.uniforms.uProgress.value = value;
      if (points.current) points.current.visible = value > 0.001 && value < 0.999;
    },
  }));

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return <points ref={points} visible={false} frustumCulled={false}>
    <bufferGeometry ref={geometry}>
      <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      <bufferAttribute attach="attributes-aScatter" args={[scatter, 3]} />
      <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
    </bufferGeometry>
    <shaderMaterial ref={material} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} uniforms={{uProgress:{value:0},uTime:{value:0}}}
      vertexShader={`attribute vec3 aScatter;attribute float aSeed;uniform float uProgress;uniform float uTime;varying float vAlpha;varying float vSeed;varying float vExit;void main(){float t=clamp((uProgress-.32)/.36,0.,1.);float burst=t*t*t*(t*(t*6.-15.)+10.);float e=clamp((uProgress-.5)/.43,0.,1.);float exitFlow=e*e*e*(e*(e*6.-15.)+10.);float living=1.-smoothstep(.78,1.,uProgress);vec3 drift=vec3(sin(uTime*1.15+aSeed*31.),cos(uTime*.93+aSeed*27.),sin(uTime*1.31+aSeed*19.))*0.024*living;vec3 exploded=position+aScatter*burst+drift;float angle=aSeed*37.699+1.7;vec2 fallback=vec2(cos(angle),sin(angle));vec2 outward=normalize(exploded.xy+fallback*.65);float exitDistance=12.+aSeed*9.;vec3 outsideFrame=exploded+vec3(outward*exitDistance,(aSeed-.5)*1.8);vec3 p=mix(exploded,outsideFrame,exitFlow);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.3+aSeed*2.2+sin(uTime*1.8+aSeed*24.)*.18)*(1.-exitFlow*.75);vAlpha=smoothstep(.02,.16,uProgress)*(1.-smoothstep(.945,1.,uProgress));vSeed=aSeed;vExit=exitFlow;}`}
      fragmentShader={`varying float vAlpha;varying float vSeed;varying float vExit;void main(){float d=distance(gl_PointCoord,vec2(.5));float s=smoothstep(.5,.06,d);vec3 gold=mix(vec3(.85,.48,.08),vec3(1.,.92,.48),vSeed);vec3 c=mix(gold,vec3(1.,.98,.76),vExit*.6);gl_FragColor=vec4(c,s*vAlpha*(.6+vSeed*.4));}`}/>
  </points>;
});

function StoryLetter({ project, index, letterRef, faceMaterial, sideMaterial }) {
  return (
    <group ref={letterRef}>
      <Center>
        <Text3D
          font={FONT}
          size={1.28}
          depth={0.32}
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.046}
          bevelSize={0.034}
          bevelSegments={9}
          material={[faceMaterial, sideMaterial]}
        >
          {project.char}
        </Text3D>
      </Center>
    </group>
  );
}

function PuzzleSlots({ slotMaterial }) {
  return (
    <group position={[0, 0, -0.42]}>
      {letterData.map((project, index) => (
        <group key={`${project.char}-${index}`} position={[project.x, 0, 0]}>
          <Center>
            <Text3D
              font={FONT}
              size={1.28}
              depth={0.16}
              curveSegments={10}
              bevelEnabled
              bevelThickness={0.022}
              bevelSize={0.014}
              bevelSegments={4}
            >
              {project.char}
              <primitive object={slotMaterial} attach="material" />
            </Text3D>
          </Center>
        </group>
      ))}
    </group>
  );
}

function PillarPlaque3D({ index, story, lang, plaqueRef, frameMaterialRef, htmlRef }) {
  return (
    <group ref={plaqueRef} visible={false} scale={0.0001}>
      {/* Outer Luxury Glass Plaque */}
      <RoundedBox args={[2.55, 1.85, 0.08]} radius={0.1} smoothness={5}>
        <meshPhysicalMaterial
          ref={frameMaterialRef}
          color="#120c06"
          emissive="#241405"
          emissiveIntensity={0.12}
          metalness={0.88}
          roughness={0.25}
          clearcoat={0.6}
          transparent
          opacity={0}
        />
      </RoundedBox>

      {/* Decorative Gold Header Bar */}
      <mesh position={[0, 0.78, 0.055]}>
        <boxGeometry args={[2.35, 0.04, 0.015]} />
        <meshBasicMaterial color="#e5b44d" toneMapped={false} />
      </mesh>

      {/* Floating HTML Manifesto Card — plain host HTML; .scene-canvas forces
          direction:ltr which fixes the Chromium RTL-document/3D-transform
          projection bug. */}
      <Html ref={htmlRef} transform center position={[0, -0.02, 0.065]} distanceFactor={1.55} style={{ pointerEvents: 'none' }}>
        <div className="pillar-card" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
          <div className="pillar-card__kicker">
            <span>{story?.pillar}</span>
            <b>{story?.tag}</b>
          </div>
          <h3>{story?.title}</h3>
          <p>{story?.copy}</p>
        </div>
      </Html>
    </group>
  );
}

export function ScrollStory({ stories = [], lang = 'en', reduced = false }) {
  const rig = useRef();
  const floatRoot = useRef();
  const sparks = useRef();
  const heroParticles = useRef();
  const particlesCaptured = useRef(false);
  const impactTimer = useRef();
  const letterRefs = useRef([]);
  const plaqueRefs = useRef([]);
  const plaqueHtmlRefs = useRef([]);
  const plaqueFrameMaterials = useRef([]);
  const snappedRef = useRef(new Array(letterData.length).fill(false));
  const aliveFactors = useRef(new Array(letterData.length).fill(0));
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  // 100% Self-contained Satin Gold Material (Zero External CDN Dependencies)
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

  const slotMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#201408'),
    emissive: new THREE.Color('#0a0502'),
    emissiveIntensity: 0.05,
    metalness: 0.82,
    roughness: 0.48,
    transparent: true,
    opacity: 0.9,
  }), []);

  // Imperatively created materials are not tracked by R3F — free their GPU
  // resources on unmount instead of leaking one set per remount.
  useEffect(() => () => {
    faceMaterial.dispose();
    sideMaterial.dispose();
    slotMaterial.dispose();
  }, [faceMaterial, sideMaterial, slotMaterial]);

  useEffect(() => {
    const onPointerMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onOrientation = (event) => {
      if (event.gamma !== null && event.beta !== null) {
        const gx = clamp(event.gamma / 25, -1, 1);
        const gy = clamp((event.beta - 40) / 25, -1, 1);
        mouse.current.x = gx;
        mouse.current.y = -gy;
        window.__xvPointer = { x: gx, y: -gy };
      }
    };
    const reset = () => { mouse.current.x = 0; mouse.current.y = 0; };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
    }
    document.documentElement.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', onOrientation);
      }
      document.documentElement.removeEventListener('mouseleave', reset);
      window.clearTimeout(impactTimer.current);
      document.documentElement.classList.remove('hero-impact');
    };
  }, []);

  useFrame(({ viewport, clock }, delta) => {
    if (!rig.current) return;
    const mobile = typeof window !== 'undefined' ? window.innerWidth < 760 : viewport.width < 4;
    const journeyProgress = readJourneyProgress();
    const progress = clamp(journeyProgress / 0.18);
    setRootVar('--hero-progress', progress.toFixed(4));
    window.__xvJourney = journeyProgress;

    smoothMouse.current.x = THREE.MathUtils.damp(smoothMouse.current.x, mouse.current.x, 4.8, delta);
    smoothMouse.current.y = THREE.MathUtils.damp(smoothMouse.current.y, mouse.current.y, 4.8, delta);
    const dissolve = clamp((journeyProgress - 0.18) / (HERO_HANDOFF_END - 0.18));
    rig.current.visible = journeyProgress < HERO_HANDOFF_END;
    const solidOpacity = 1 - smoothStep(0.06, 0.34, dissolve);
    faceMaterial.opacity = solidOpacity;
    sideMaterial.opacity = solidOpacity;
    slotMaterial.opacity = solidOpacity;
    heroParticles.current?.setProgress(dissolve);
    const interaction = 1 - smoothStep(0, 0.18, dissolve);
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, -smoothMouse.current.y * 0.065 * interaction, 4.2, delta);
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, smoothMouse.current.x * 0.085 * interaction, 4.2, delta);
    rig.current.position.z = THREE.MathUtils.damp(rig.current.position.z, 0, 5, delta);
    rig.current.position.y = THREE.MathUtils.damp(rig.current.position.y, 0, 5, delta);
    rig.current.scale.setScalar(THREE.MathUtils.damp(rig.current.scale.x, mobile ? 0.34 : 0.55, 5, delta));

    letterData.forEach((project, index) => {
      const letter = letterRefs.current[index];
      const plaque = plaqueRefs.current[index];
      if (!letter || !plaque) return;
      const segmentStart = 0.015 + index * 0.155;
      const local = clamp((progress - segmentStart) / 0.155);
      const entrance = entrances[index];
      const panelSide = index % 2 === 0 ? 1 : -1;
      const showX = mobile ? 0 : -panelSide * 0.82;
      const enter = easeOutCubic(clamp(local / 0.2));
      const dock = easeOutCubic(clamp((local - 0.76) / 0.24));
      const storyIn = easeOutCubic(clamp((local - 0.05) / 0.13));
      const storyOut = 1 - easeOutCubic(clamp((local - 0.7) / 0.18));
      const alpha = storyIn * storyOut;
      const aliveTarget = local > 0.08 && local < 0.76 ? 1 : 0;
      aliveFactors.current[index] = THREE.MathUtils.damp(aliveFactors.current[index], aliveTarget, 4.5, delta);
      const idle = reduced ? 0 : aliveFactors.current[index];
      const time = clock.elapsedTime + index * 0.9;
      const showY = mobile ? 0.48 : 0.05;
      const idleX = (Math.sin(time * 0.78) + Math.sin(time * 1.43) * 0.28) * 0.062 * idle;
      const idleY = (Math.sin(time * 1.02) + Math.cos(time * 0.57) * 0.24) * 0.078 * idle;
      const idleZ = (Math.cos(time * 0.69) + Math.sin(time * 1.17) * 0.2) * 0.072 * idle;

      let px; let py; let pz; let rx; let ry; let rz; let scale;
      if (local < 0.76) {
        px = THREE.MathUtils.lerp(entrance.position[0], showX, enter) + idleX;
        py = THREE.MathUtils.lerp(entrance.position[1], showY, enter) + idleY;
        pz = THREE.MathUtils.lerp(entrance.position[2], 1.5, enter) + idleZ;
        rx = THREE.MathUtils.lerp(entrance.rotation[0], -smoothMouse.current.y * 0.07, enter) + Math.sin(time * 0.66) * 0.026 * idle;
        ry = THREE.MathUtils.lerp(entrance.rotation[1], smoothMouse.current.x * 0.09, enter) + Math.cos(time * 0.59) * 0.034 * idle;
        rz = THREE.MathUtils.lerp(entrance.rotation[2], 0, enter) + Math.sin(time * 0.51) * 0.019 * idle;
        scale = THREE.MathUtils.lerp(0.32, mobile ? 1.38 : 1.64, enter) * (1 + Math.sin(time * 0.86) * 0.013 * idle);
      } else {
        px = THREE.MathUtils.lerp(showX, project.x, dock);
        py = THREE.MathUtils.lerp(showY, 0, dock);
        pz = THREE.MathUtils.lerp(1.5, 0, dock);
        rx = THREE.MathUtils.lerp(-smoothMouse.current.y * 0.07, 0, dock);
        ry = THREE.MathUtils.lerp(smoothMouse.current.x * 0.09, 0, dock);
        rz = 0;
        scale = THREE.MathUtils.lerp(mobile ? 1.38 : 1.64, 1, dock);
      }

      letter.visible = local > 0.001;
      letter.position.x = THREE.MathUtils.damp(letter.position.x, px, 9, delta);
      letter.position.y = THREE.MathUtils.damp(letter.position.y, py, 9, delta);
      letter.position.z = THREE.MathUtils.damp(letter.position.z, pz, 9, delta);
      letter.rotation.x = THREE.MathUtils.damp(letter.rotation.x, rx, 9, delta);
      letter.rotation.y = THREE.MathUtils.damp(letter.rotation.y, ry, 9, delta);
      letter.rotation.z = THREE.MathUtils.damp(letter.rotation.z, rz, 9, delta);
      letter.scale.setScalar(THREE.MathUtils.damp(letter.scale.x, scale, 9, delta));

      const plaqueScale = alpha * (mobile ? 0.62 : 0.9);
      plaque.visible = alpha > 0.002;
      // drei's <Html> only hides itself when behind the camera — it ignores
      // hidden ancestor groups — so drive the card's display from alpha too.
      const plaqueHtml = plaqueHtmlRefs.current[index];
      if (plaqueHtml) plaqueHtml.style.display = alpha > 0.002 ? 'block' : 'none';
      plaque.position.x = THREE.MathUtils.damp(plaque.position.x, mobile ? 0 : panelSide * (2.55 + (1 - alpha) * 0.3), 8, delta);
      plaque.position.y = THREE.MathUtils.damp(plaque.position.y, mobile ? -1.45 : -0.02, 8, delta);
      plaque.position.z = THREE.MathUtils.damp(plaque.position.z, 0.35, 8, delta);
      plaque.rotation.y = THREE.MathUtils.damp(plaque.rotation.y, mobile ? 0 : -panelSide * 0.1, 8, delta);
      plaque.scale.setScalar(THREE.MathUtils.damp(plaque.scale.x, plaqueScale, 8, delta));
      if (plaqueFrameMaterials.current[index]) plaqueFrameMaterials.current[index].opacity = alpha * 0.96;

      if (!snappedRef.current[index] && local >= 0.985) {
        snappedRef.current[index] = true;
        letter.position.set(project.x, 0, 0);
        letter.rotation.set(0, 0, 0);
        letter.scale.setScalar(1);
        letter.updateWorldMatrix(true, true);
        floatRoot.current?.updateWorldMatrix(true, true);
        sparks.current?.burstFromLetter(letter, floatRoot.current, mobile ? 0.72 : 1);

        const page = document.documentElement;
        page.classList.remove('hero-impact');
        void page.offsetWidth;
        page.classList.add('hero-impact');
        window.clearTimeout(impactTimer.current);
        impactTimer.current = window.setTimeout(() => page.classList.remove('hero-impact'), 300);
      } else if (local < 0.95) {
        snappedRef.current[index] = false;
      }
    });
    if (!particlesCaptured.current && journeyProgress >= 0.172 && letterRefs.current.every(Boolean) && floatRoot.current) {
      heroParticles.current?.capture(letterRefs.current, floatRoot.current);
      particlesCaptured.current = true;
    }
  });

  return (
    <group ref={rig}>
      <Float ref={floatRoot} speed={reduced ? 0 : 0.48} rotationIntensity={reduced ? 0 : 0.012} floatIntensity={reduced ? 0 : 0.06}>
        <PuzzleSlots slotMaterial={slotMaterial} />
        {letterData.map((project, index) => (
          <StoryLetter
            key={`${project.char}-${index}`}
            project={project}
            index={index}
            letterRef={(node) => { letterRefs.current[index] = node; }}
            faceMaterial={faceMaterial}
            sideMaterial={sideMaterial}
          />
        ))}
        {letterData.map((project, index) => (
          <PillarPlaque3D
            key={`plaque-${index}`}
            index={index}
            story={stories[index]}
            lang={lang}
            plaqueRef={(node) => { plaqueRefs.current[index] = node; }}
            frameMaterialRef={(node) => { plaqueFrameMaterials.current[index] = node; }}
            htmlRef={(node) => { plaqueHtmlRefs.current[index] = node; }}
          />
        ))}
        <HeroLetterParticles ref={heroParticles} />
        <SparkBursts ref={sparks} />
      </Float>
      {!reduced && (
        <Sparkles count={40} scale={[8.2, 4.1, 3.8]} size={1} speed={0.07} opacity={0.38} color="#e4b85d" noise={1.15} />
      )}
    </group>
  );
}
