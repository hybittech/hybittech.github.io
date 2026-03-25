import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

function LetterSphere({ position, color, scale = 0.15, speed = 1 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005 * speed;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[scale, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.85} />
    </mesh>
  );
}

function VectorField({ count = 28 }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.5 + Math.sin(i * 0.7) * 0.5;
      pts.push([Math.cos(angle) * r, Math.sin(i * 0.5) * 0.8, Math.sin(angle) * r]);
    }
    return pts;
  }, [count]);

  const colors = ['#00e5ff', '#ffd700', '#00ff88', '#a855f7', '#ff4466'];

  return (
    <group>
      {points.map((pos, i) => (
        <LetterSphere
          key={i}
          position={pos}
          color={colors[i % colors.length]}
          scale={0.08 + Math.random() * 0.08}
          speed={0.5 + Math.random() * 1.5}
        />
      ))}
    </group>
  );
}

function Grid() {
  return (
    <group>
      <gridHelper args={[10, 20, '#1e1e2e', '#111118']} rotation={[0, 0, 0]} position={[0, -1.5, 0]} />
    </group>
  );
}

export default function HijaiyyahScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 1, 4], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00e5ff" />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ffd700" />
        <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
          <VectorField />
        </Float>
        <Grid />
        <OrbitControls enableDamping dampingFactor={0.05} enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
