import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Theme } from '../../types';
import { getTheme } from '../../themes/themeConfig';
import FocusCharacter from './FocusCharacter';
import ParticleField from './ParticleField';

function OrbitingRing({ radius, speed, color, tilt }: { radius: number; speed: number; color: string; tilt: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * speed;
  });
  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <Torus args={[radius, 0.03, 8, 80]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.6} />
      </Torus>
    </group>
  );
}

function PulsingSphere({ position, color }: { position: [number,number,number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 2) * 0.1;
    ref.current.scale.setScalar(s);
  });
  return (
    <Sphere ref={ref} position={position} args={[0.3, 32, 32]}>
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.7} transmission={0.3} />
    </Sphere>
  );
}

function DashEnvContent({ theme }: { theme: Theme }) {
  const cfg = getTheme(theme);
  return (
    <>
      <ambientLight intensity={0.3} color={cfg.ambientColor} />
      <pointLight position={[3, 5, 3]} intensity={1.2} color={cfg.primary} />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color={cfg.secondary} />

      <Stars radius={80} depth={40} count={1500} factor={3} saturation={0.4} fade speed={1} />
      <Sparkles count={40} scale={8} size={1.5} speed={0.3} color={cfg.particleColor} opacity={0.5} />
      <ParticleField count={50} color={cfg.particleColor} spread={8} speed={0.3} />

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.6}>
        <FocusCharacter theme={theme} position={[0, -0.5, 0]} scale={1} />
      </Float>

      <OrbitingRing radius={2} speed={0.5} color={cfg.primary} tilt={0.3} />
      <OrbitingRing radius={2.8} speed={-0.3} color={cfg.secondary} tilt={0.6} />
      <OrbitingRing radius={3.5} speed={0.2} color={cfg.accent} tilt={1.0} />

      <PulsingSphere position={[2.5, 1, -1]} color={cfg.primary} />
      <PulsingSphere position={[-2.5, -1, -1]} color={cfg.secondary} />
      <PulsingSphere position={[0, 2.5, -2]} color={cfg.accent} />
    </>
  );
}

interface DashboardEnvironmentProps {
  theme: Theme;
  className?: string;
}

export default function DashboardEnvironment({ theme, className = '' }: DashboardEnvironmentProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 7], fov: 55 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <DashEnvContent theme={theme} />
        </Suspense>
      </Canvas>
    </div>
  );
}
