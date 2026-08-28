'use client';

import { useFrame } from '@react-three/fiber';
import { Center, Text3D } from '@react-three/drei';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FONT, SKILLS_START, SKILLS_END } from './constants';
import { clamp, easeOutCubic, smoothStep, readJourneyProgress, seeded } from './utils';


const SkillsRainParticles = forwardRef(function SkillsRainParticles(_, ref) {
  const count = 9000;
  const points = useRef();
  const geometry = useRef();
  const material = useRef();
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const flow = useMemo(() => new Float32Array(count * 3), []);
  const seeds = useMemo(() => new Float32Array(count), []);
  const localPositions = useMemo(() => new Float32Array(count * 3), []);
  const meshIndices = useMemo(() => new Uint16Array(count), []);
  const bindings = useRef({ meshes: [], root: null });

  useImperativeHandle(ref, () => ({
    capture(rootGroup) {
      if (!rootGroup) return;
      rootGroup.updateWorldMatrix(true, true);
      const a = new THREE.Vector3(); const b = new THREE.Vector3(); const c = new THREE.Vector3();
      const ab = new THREE.Vector3(); const ac = new THREE.Vector3(); const point = new THREE.Vector3();
      const infos = [];
      rootGroup.traverse((mesh) => {
        if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;
        mesh.updateWorldMatrix(true, false);
        const attribute = mesh.geometry.attributes.position;
        const indexAttribute = mesh.geometry.index;
        const triangleCount = indexAttribute ? indexAttribute.count / 3 : attribute.count / 3;
        if (!triangleCount) return;
        const triangles = new Uint32Array(triangleCount * 3);
        const cumulative = new Float32Array(triangleCount);
        let totalArea = 0;
        for (let triangle = 0; triangle < triangleCount; triangle += 1) {
          const ia = indexAttribute ? indexAttribute.getX(triangle * 3) : triangle * 3;
          const ib = indexAttribute ? indexAttribute.getX(triangle * 3 + 1) : triangle * 3 + 1;
          const ic = indexAttribute ? indexAttribute.getX(triangle * 3 + 2) : triangle * 3 + 2;
          triangles[triangle * 3] = ia; triangles[triangle * 3 + 1] = ib; triangles[triangle * 3 + 2] = ic;
          a.fromBufferAttribute(attribute, ia); b.fromBufferAttribute(attribute, ib); c.fromBufferAttribute(attribute, ic);
          ab.subVectors(b, a); ac.subVectors(c, a); totalArea += ab.cross(ac).length() * 0.5; cumulative[triangle] = totalArea;
        }
        infos.push({ mesh, attribute, triangles, cumulative, totalArea });
      });
      const completeArea = infos.reduce((sum, info) => sum + info.totalArea, 0);
      bindings.current = { meshes: infos.map((info) => info.mesh), root: rootGroup };
      let offset = 0;
      infos.forEach((info, infoIndex) => {
        const amount = infoIndex === infos.length - 1 ? count - offset : Math.round(count * info.totalArea / completeArea);
        for (let n = 0; n < amount && offset < count; n += 1, offset += 1) {
          const target = seeded(offset, 131) * info.totalArea;
          let low = 0; let high = info.cumulative.length - 1;
          while (low < high) { const middle = (low + high) >> 1; if (info.cumulative[middle] < target) low = middle + 1; else high = middle; }
          const triangle = low;
          const ia = info.triangles[triangle * 3]; const ib = info.triangles[triangle * 3 + 1]; const ic = info.triangles[triangle * 3 + 2];
          a.fromBufferAttribute(info.attribute, ia); b.fromBufferAttribute(info.attribute, ib); c.fromBufferAttribute(info.attribute, ic);
          const sqrtU = Math.sqrt(seeded(offset, 137)); const v = seeded(offset, 139);
          const wa = 1 - sqrtU; const wb = sqrtU * (1 - v); const wc = sqrtU * v;
          point.set(a.x * wa + b.x * wb + c.x * wc, a.y * wa + b.y * wb + c.y * wc, a.z * wa + b.z * wb + c.z * wc);
          localPositions[offset * 3] = point.x; localPositions[offset * 3 + 1] = point.y; localPositions[offset * 3 + 2] = point.z;
          meshIndices[offset] = infoIndex;
          point.applyMatrix4(info.mesh.matrixWorld);
          rootGroup.worldToLocal(point);
          positions[offset * 3] = point.x; positions[offset * 3 + 1] = point.y; positions[offset * 3 + 2] = point.z;
          flow[offset * 3] = (seeded(offset, 149) - .5) * 1.4;
          flow[offset * 3 + 1] = 0;
          flow[offset * 3 + 2] = (seeded(offset, 151) - .5) * .85;
          seeds[offset] = seeded(offset, 157);
        }
      });
      if (geometry.current) { geometry.current.attributes.position.needsUpdate = true; geometry.current.attributes.aFlow.needsUpdate = true; geometry.current.attributes.aSeed.needsUpdate = true; }
    },
    sync(rootGroup) {
      const root = rootGroup || bindings.current.root;
      if (!root || !bindings.current.meshes.length) return;
      root.updateWorldMatrix(true, true);
      const inverseRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
      const matrices = bindings.current.meshes.map((mesh) => {
        mesh.updateWorldMatrix(true, false);
        return new THREE.Matrix4().copy(inverseRoot).multiply(mesh.matrixWorld);
      });
      const point = new THREE.Vector3();
      for (let index = 0; index < count; index += 1) {
        point.set(localPositions[index * 3], localPositions[index * 3 + 1], localPositions[index * 3 + 2]).applyMatrix4(matrices[meshIndices[index]]);
        positions[index * 3] = point.x; positions[index * 3 + 1] = point.y; positions[index * 3 + 2] = point.z;
      }
      if (geometry.current) geometry.current.attributes.position.needsUpdate = true;
    },
    setProgress(value) { if (material.current) material.current.uniforms.uProgress.value = value; if (points.current) points.current.visible = value > .001 && value < .999; },
  }));
  useFrame(({ clock }) => { if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime; });
  return <points ref={points} visible={false} frustumCulled={false}>
    <bufferGeometry ref={geometry}><bufferAttribute attach="attributes-position" args={[positions,3]} /><bufferAttribute attach="attributes-aFlow" args={[flow,3]} /><bufferAttribute attach="attributes-aSeed" args={[seeds,1]} /></bufferGeometry>
    <shaderMaterial ref={material} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} uniforms={{uProgress:{value:0},uTime:{value:0}}}
      vertexShader={`attribute vec3 aFlow;attribute float aSeed;uniform float uProgress;uniform float uTime;varying float vAlpha;varying float vSeed;void main(){float appear=smoothstep(.02,.2,uProgress);float delayed=clamp((uProgress-.3-aSeed*.12)/.52,0.,1.);float fall=delayed*delayed;float floorY=-2.85;vec3 p=position;float distanceToFloor=max(0.,position.y-floorY);p.y-=distanceToFloor*fall;float splash=smoothstep(.72,1.,fall);p.x+=aFlow.x*splash;p.z+=aFlow.z*splash*.55;p.x+=sin(uTime*1.2+aSeed*30.)*.018*(1.-fall);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=1.2+aSeed*1.9;vAlpha=appear*(1.-smoothstep(.9,1.,uProgress));vSeed=aSeed;}`}
      fragmentShader={`varying float vAlpha;varying float vSeed;void main(){float d=distance(gl_PointCoord,vec2(.5));float s=smoothstep(.5,.08,d);vec3 c=mix(vec3(.75,.42,.06),vec3(1.,.88,.42),vSeed);gl_FragColor=vec4(c,s*vAlpha*(.55+vSeed*.45));}`}/>
  </points>;
});

const skillNames = ['HTML', 'CSS', 'JAVASCRIPT', 'THREE.JS', 'NEXT.JS', 'PYTHON', 'UI / UX', 'MOTION', 'RESPONSIVE'];

const skillOrbitAngles = skillNames.map((_, index) => (index / skillNames.length) * Math.PI * 2 - Math.PI / 2);

export function SkillsChapter({ reduced = false }) {
  const root = useRef();
  const nodes = useRef([]);
  const coreLabel = useRef();
  const rainParticles = useRef();
  const rainCaptured = useRef(false);
  const rainMaterials = useRef([]);
  const cursorWorld = useMemo(() => new THREE.Vector3(), []);
  const cursorLocal = useMemo(() => new THREE.Vector3(), []);
  const cursorRay = useMemo(() => new THREE.Vector3(), []);
  const orbitPoint = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock, camera }, delta) => {
    const progress = readJourneyProgress();
    const local = clamp((progress - SKILLS_START) / (SKILLS_END - SKILLS_START));
    const rise = smoothStep(SKILLS_START - 0.005, SKILLS_START + 0.05, progress);
    const rain = clamp((progress - 0.615) / 0.032);
    if (!root.current) return;
    root.current.visible = progress > SKILLS_START && progress < SKILLS_END;
    const pointer = window.__xvPointer || { x: 0, y: 0 };
    if (rain <= 0.001) {
      if (rainCaptured.current) {
        rainMaterials.current.forEach(({ material, opacity }) => { material.opacity = opacity; });
        rainMaterials.current = [];
        rainCaptured.current = false;
      }
      rainParticles.current?.setProgress(0);
    }
    const motionTime = clock.elapsedTime;
    const mobile = window.innerWidth < 760;
    const baseScale = mobile ? 0.46 : 0.78;
    const idle = reduced ? 0 : 1;
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, baseScale * (0.72 + rise * 0.28), 5, delta));
    const restingX = (mobile ? 0 : -1.3) + Math.sin(motionTime * 0.27) * 0.095 * idle;
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, restingX, 5, delta);
    const restingY = (mobile ? -0.35 : -0.72) + Math.sin(motionTime * 0.42) * 0.14 * idle;
    const restingZ = mobile ? -0.55 : -1.15;
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, THREE.MathUtils.lerp(-5.8, restingY, rise), 5.5, delta);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, THREE.MathUtils.lerp(-3.0, restingZ + Math.sin(motionTime * 0.31) * 0.05 * idle, rise), 5.5, delta);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, 0, 5, delta);
    root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, 0, 5, delta);

    cursorWorld.set(pointer.x, pointer.y, 0.35).unproject(camera);
    cursorRay.copy(cursorWorld).sub(camera.position).normalize();
    if (Math.abs(cursorRay.z) > 1e-4) {
      const rayDistance = (3.0 - camera.position.z) / cursorRay.z;
      cursorWorld.copy(camera.position).addScaledVector(cursorRay, rayDistance);
    }
    root.current.updateWorldMatrix(true, false);
    cursorLocal.copy(cursorWorld);
    root.current.worldToLocal(cursorLocal);

    if (coreLabel.current) {
      const dx = cursorLocal.x;
      const dy = cursorLocal.y;
      const dz = cursorLocal.z;
      coreLabel.current.rotation.y = THREE.MathUtils.damp(coreLabel.current.rotation.y, Math.atan2(dx, dz), 6, delta);
      coreLabel.current.rotation.x = THREE.MathUtils.damp(coreLabel.current.rotation.x, -Math.atan2(dy, Math.hypot(dx, dz)), 6, delta);
    }

    nodes.current.forEach((node, index) => {
      if (!node) return;
      const enter = easeOutCubic(clamp(local / 0.36));
      const angle = skillOrbitAngles[index] + motionTime * (reduced ? 0 : 0.13);
      orbitPoint.set(Math.cos(angle) * 2.05, Math.sin(angle) * 1.68, 0);
      const targetX = orbitPoint.x;
      const targetY = orbitPoint.y + Math.sin(motionTime * 0.7 + index) * 0.008 * (reduced ? 0 : 1);
      const targetZ = orbitPoint.z;
      node.position.x = THREE.MathUtils.damp(node.position.x, targetX, 5, delta);
      node.position.y = THREE.MathUtils.damp(node.position.y, targetY, 5, delta);
      node.position.z = THREE.MathUtils.damp(node.position.z, THREE.MathUtils.lerp(-3.5, targetZ, enter), 5, delta);
      // Every skill node keeps one fixed size; depth or vertical position must not resize it.
      node.scale.setScalar(THREE.MathUtils.damp(node.scale.x, enter, 5, delta));
      const dx = cursorLocal.x - node.position.x;
      const dy = cursorLocal.y - node.position.y;
      const dz = cursorLocal.z - node.position.z;
      node.rotation.y = THREE.MathUtils.damp(node.rotation.y, Math.atan2(dx, dz), 6, delta);
      node.rotation.x = THREE.MathUtils.damp(node.rotation.x, -Math.atan2(dy, Math.hypot(dx, dz)), 6, delta);
      node.rotation.z = THREE.MathUtils.damp(node.rotation.z, 0, 6, delta);
    });

    if (rain > 0.001 && !rainCaptured.current) {
      root.current.updateWorldMatrix(true, true);
      rainParticles.current?.capture(root.current);
      const seen = new Set();
      root.current.traverse((object) => {
        if (!object.isMesh) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (!material || seen.has(material)) return;
          seen.add(material);
          rainMaterials.current.push({ material, opacity: material.opacity ?? 1 });
          material.transparent = true;
          material.depthWrite = false;
          material.needsUpdate = true;
        });
      });
      rainCaptured.current = true;
    }
    if (rainCaptured.current && rain < 0.34) rainParticles.current?.sync(root.current);
    rainParticles.current?.setProgress(rainCaptured.current ? rain : 0);
    const solidOpacity = 1 - smoothStep(0.06, 0.34, rain);
    rainMaterials.current.forEach(({ material, opacity }) => { material.opacity = opacity * solidOpacity; });
  });
  return (
    <group ref={root} visible={false}>
      <mesh scale={[1, 0.82, 1]}>
        <torusGeometry args={[2.05, 0.026, 10, 160]} />
        <meshStandardMaterial color="#b78431" emissive="#70420d" emissiveIntensity={0.36} metalness={0.72} roughness={0.24} transparent opacity={0.84} />
      </mesh>
      <mesh><icosahedronGeometry args={[0.62, 2]} /><meshPhysicalMaterial color="#704819" metalness={0.95} roughness={0.12} clearcoat={0.8} clearcoatRoughness={0.1} envMapIntensity={0.4} /></mesh>
      <group ref={coreLabel}><Center position={[0, 0, 0.625]}><Text3D font={FONT} size={0.14} depth={0.01} curveSegments={5} bevelEnabled bevelThickness={0.003} bevelSize={0.0015} bevelSegments={2}>XVVIIX<meshStandardMaterial color="#f0c564" emissive="#b97620" emissiveIntensity={1.05} metalness={0.62} roughness={0.22} toneMapped={false} /></Text3D></Center></group>
      {skillNames.map((name, index) => {
        const textSize = name.length > 9 ? 0.045 : name.length > 6 ? 0.055 : 0.07;
        return <group ref={(node) => { nodes.current[index] = node; }} key={name}>
          <mesh rotation={[Math.PI * 0.1, index * 0.3, 0]}>
            <sphereGeometry args={[0.32, 24, 18]} />
            <meshPhysicalMaterial color={index % 2 ? '#24211d' : '#2d2923'} metalness={0.74} roughness={0.25} clearcoat={0.2} clearcoatRoughness={0.3} />
          </mesh>
          <Center position={[0, 0, 0.34]}><Text3D font={FONT} size={textSize} depth={0.006} curveSegments={4} bevelEnabled={false}>{name}<meshStandardMaterial color="#d9a748" metalness={0.58} roughness={0.27} /></Text3D></Center>
        </group>;
      })}
      <SkillsRainParticles ref={rainParticles} />
    </group>
  );
}
