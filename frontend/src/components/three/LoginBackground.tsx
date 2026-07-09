'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Campo de partículas em preto e laranja com profundidade e drift suave. */
function Particles({ count = 2600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const orange = new THREE.Color('#E8540A');
    const gray = new THREE.Color('#555555');
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
      const c = Math.random() < 0.28 ? orange : gray;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.y = t * 0.03 + pointer.x * 0.15;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.08 + pointer.y * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Formas abstratas flutuantes (torus e icosaedros) em laranja/preto. */
function FloatingShapes() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = t * 0.08;
    group.current.children.forEach((child, i) => {
      child.position.y += Math.sin(t * 0.6 + i * 2) * 0.0015;
      child.rotation.x = t * (0.1 + i * 0.05);
    });
  });
  return (
    <group ref={group}>
      <mesh position={[-5, 1.5, -4]}>
        <torusKnotGeometry args={[0.9, 0.26, 120, 16]} />
        <meshStandardMaterial color="#E8540A" roughness={0.35} metalness={0.55} wireframe />
      </mesh>
      <mesh position={[5.5, -1.5, -5]}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial color="#181818" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[3.6, 2.4, -7]}>
        <torusGeometry args={[1, 0.06, 16, 90]} />
        <meshStandardMaterial
          color="#E8540A"
          emissive="#E8540A"
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

export function LoginBackground() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#0B0B0B']} />
        <fog attach="fog" args={['#0B0B0B', 8, 22]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[6, 4, 6]} intensity={40} color="#E8540A" />
        <pointLight position={[-6, -3, 4]} intensity={18} color="#ffffff" />
        <Particles />
        <FloatingShapes />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/60" />
    </div>
  );
}
