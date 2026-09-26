/**
 * CommitmentVault — 3D visual representation of a pocket-money commitment.
 * States: locked (active) → brightening (tasks completing) → unlocked (eligible/claimed) → celebration
 */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, MeshDistortMaterial, Octahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

type VaultState = 'locked' | 'progress' | 'unlocked' | 'claimed' | 'missed';

interface VaultCrystalProps {
  state: VaultState;
  progress: number; // 0-100
  amount: number;
}

function VaultCrystal({ state, progress, amount }: VaultCrystalProps) {
  const crystalRef = useRef<THREE.Mesh>(null);
  const ringRef    = useRef<THREE.Mesh>(null);
  const ring2Ref   = useRef<THREE.Mesh>(null);
  const glowRef    = useRef<THREE.Mesh>(null);

  const colors = useMemo(() => {
    switch (state) {
      case 'locked':   return { main: '#94a3b8', emissive: '#475569', glow: '#1e293b', ring: '#64748b' };
      case 'progress': return { main: '#818cf8', emissive: '#6366f1', glow: '#4f46e5', ring: '#a5b4fc' };
      case 'unlocked': return { main: '#34d399', emissive: '#10b981', glow: '#059669', ring: '#6ee7b7' };
      case 'claimed':  return { main: '#fbbf24', emissive: '#f59e0b', glow: '#d97706', ring: '#fde68a' };
      case 'missed':   return { main: '#f87171', emissive: '#ef4444', glow: '#dc2626', ring: '#fca5a5' };
    }
  }, [state]);

  const intensity = useMemo(() => {
    if (state === 'claimed')  return 2.2;
    if (state === 'unlocked') return 1.8;
    if (state === 'progress') return 0.8 + (progress / 100) * 0.8;
    if (state === 'missed')   return 0.4;
    return 0.3;
  }, [state, progress]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * (state === 'claimed' ? 1.5 : 0.6);
      crystalRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }
    if (ringRef.current)  ringRef.current.rotation.z  = t * 0.8;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.5;
    if (glowRef.current) {
      const s = 0.9 + Math.sin(t * 2) * 0.12;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* Glow sphere behind crystal */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color={colors.glow} transparent opacity={0.12}
          emissive={colors.glow} emissiveIntensity={0.5} />
      </mesh>

      {/* Main crystal */}
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={crystalRef}>
          <octahedronGeometry args={[0.42, 0]} />
          <MeshDistortMaterial
            color={colors.main}
            distort={state === 'claimed' ? 0.5 : 0.2}
            speed={state === 'claimed' ? 3 : 1.2}
            emissive={colors.emissive}
            emissiveIntensity={intensity}
            roughness={0}
            metalness={0.3}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Inner bright core */}
        <mesh>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color={colors.emissive} emissive={colors.emissive}
            emissiveIntensity={intensity * 1.5} transparent opacity={0.8} />
        </mesh>
      </Float>

      {/* Orbiting ring 1 */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.65, 0.018, 8, 80]} />
        <meshStandardMaterial color={colors.ring} emissive={colors.ring}
          emissiveIntensity={0.9} transparent opacity={0.7} />
      </mesh>

      {/* Orbiting ring 2 — tilted */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[0.72, 0.012, 8, 80]} />
        <meshStandardMaterial color={colors.ring} emissive={colors.ring}
          emissiveIntensity={0.6} transparent opacity={0.5} />
      </mesh>

      {/* Lock icon ring (locked state) */}
      {state === 'locked' && (
        <mesh position={[0, 0.55, 0.3]}>
          <torusGeometry args={[0.12, 0.025, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={0.4} />
        </mesh>
      )}

      {/* Sparkles — intensity depends on state */}
      <Sparkles
        count={state === 'claimed' ? 80 : state === 'unlocked' ? 50 : state === 'progress' ? 25 : 8}
        scale={state === 'claimed' ? 4 : 2.5}
        size={state === 'claimed' ? 4 : 2}
        speed={state === 'claimed' ? 1.2 : 0.5}
        color={colors.ring}
        opacity={state === 'missed' ? 0.2 : 0.8}
      />

      {/* Lights */}
      <pointLight position={[0, 0, 1]} intensity={intensity * 2} color={colors.emissive} />
      <ambientLight intensity={0.6} color="#fff8f0" />
    </group>
  );
}

interface CommitmentVaultProps {
  state?: VaultState;
  progress?: number;
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
  height?: number;
}

export default function CommitmentVault({
  state = 'locked',
  progress = 0,
  amount = 0,
  className = '',
  style,
  height = 220,
}: CommitmentVaultProps) {
  return (
    <div className={className}
      style={{ width: '100%', height, ...style }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <VaultCrystal state={state} progress={progress} amount={amount} />
      </Canvas>
    </div>
  );
}

// Named export for inline use inside existing canvases
export function VaultCrystalScene({ state = 'locked', progress = 0, amount = 0 }: Omit<CommitmentVaultProps, 'height' | 'className' | 'style'>) {
  return <VaultCrystal state={state} progress={progress} amount={amount} />;
}
