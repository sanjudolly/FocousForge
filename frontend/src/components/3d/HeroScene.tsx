import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Theme } from '../../types';
import { getTheme } from '../../themes/themeConfig';
import FocusCharacter from './FocusCharacter';
import FloatingObjects from './FloatingObjects';
import ParticleField from './ParticleField';

function CameraRig() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useFrame(() => {
    camera.position.x += (mouseRef.current.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouseRef.current.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  if (typeof window !== 'undefined') {
    window.onmousemove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
  }
  return null;
}

function ProgressRing({ position, color, radius, progress }: { position: [number,number,number]; color: string; radius: number; progress: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.4;
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[radius, 0.04, 16, 100, Math.PI * 2 * (progress / 100)]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.85} />
    </mesh>
  );
}

function SceneContent({ theme }: { theme: Theme }) {
  const cfg = getTheme(theme);
  return (
    <>
      <ambientLight intensity={0.4} color={cfg.ambientColor} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={cfg.primary} />
      <pointLight position={[-5, -3, 3]} intensity={0.8} color={cfg.secondary} />
      <spotLight position={[0, 8, 0]} intensity={2} color="#ffffff" angle={0.4} penumbra={1} />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1.5} />
      <Sparkles count={80} scale={12} size={2} speed={0.4} color={cfg.particleColor} opacity={0.6} />

      <ParticleField count={80} color={cfg.particleColor} spread={12} speed={0.4} />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
        <FocusCharacter theme={theme} position={[0, -0.3, 0]} scale={1.3} />
      </Float>

      <FloatingObjects theme={theme} />

      {/* Progress rings */}
      <ProgressRing position={[0, 0, -1]} color={cfg.primary} radius={2.5} progress={75} />
      <ProgressRing position={[0, 0, -1.5]} color={cfg.secondary} radius={3.2} progress={60} />
      <ProgressRing position={[0, 0, -2]} color={cfg.accent} radius={3.9} progress={45} />

      <CameraRig />
    </>
  );
}

interface HeroSceneProps {
  theme: Theme;
  className?: string;
}

export default function HeroScene({ theme, className = '' }: HeroSceneProps) {
  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: 500 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <SceneContent theme={theme} />
        </Suspense>
      </Canvas>
    </div>
  );
}
