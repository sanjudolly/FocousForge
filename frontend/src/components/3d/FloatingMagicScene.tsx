import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Sphere, Torus, Cylinder, Cone, Box,
  Octahedron, Stars, Sparkles, MeshDistortMaterial, Float,
} from '@react-three/drei';
import * as THREE from 'three';

/* ── Floating Crystal ───────────────────────── */
function Crystal({ pos, color, scale = 1, phase = 0 }: {
  pos: [number, number, number]; color: string; scale?: number; phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.y = pos[1] + Math.sin(t * 0.7) * 0.18;
    ref.current.rotation.y += 0.008;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.15;
  });
  return (
    <group ref={ref} position={pos} scale={scale}>
      <Octahedron args={[0.22, 0]}>
        <meshPhysicalMaterial color={color} roughness={0} metalness={0.1}
          transmission={0.85} transparent opacity={0.9}
          emissive={color} emissiveIntensity={0.35} />
      </Octahedron>
      <Octahedron args={[0.11, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5}
          transparent opacity={0.7} />
      </Octahedron>
    </group>
  );
}

/* ── Magic Star ─────────────────────────────── */
function MagicStar({ pos, color, phase = 0 }: {
  pos: [number, number, number]; color: string; phase?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.y = pos[1] + Math.sin(t * 1.1) * 0.22;
    ref.current.rotation.z += 0.015;
    ref.current.rotation.y += 0.01;
    const s = 0.85 + Math.sin(t * 2.5) * 0.15;
    ref.current.scale.setScalar(s);
  });
  // 5-point star via dodecahedron approximation with cone spikes
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <Sphere args={[0.12, 8, 8]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </Sphere>
      </mesh>
      {[0, 1, 2, 3, 4].map(i => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i}
            position={[Math.cos(a) * 0.19, pos[1] + Math.sin(a) * 0.19, 0]}
            rotation={[0, 0, a]}>
            <coneGeometry args={[0.04, 0.18, 5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Potion Bottle ──────────────────────────── */
function Potion({ pos, color, phase = 0 }: {
  pos: [number, number, number]; color: string; phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.y = pos[1] + Math.sin(t * 0.9) * 0.14;
    ref.current.rotation.y = Math.sin(t * 0.5) * 0.3;
  });
  return (
    <group ref={ref} position={pos}>
      {/* Bottle body */}
      <Sphere args={[0.18, 16, 16]}>
        <meshPhysicalMaterial color={color} roughness={0} metalness={0}
          transmission={0.7} transparent opacity={0.85}
          emissive={color} emissiveIntensity={0.4} />
      </Sphere>
      {/* Neck */}
      <Cylinder args={[0.06, 0.1, 0.18, 10]} position={[0, 0.22, 0]}>
        <meshPhysicalMaterial color={color} roughness={0.1} transmission={0.5}
          transparent opacity={0.9} />
      </Cylinder>
      {/* Cork */}
      <Cylinder args={[0.07, 0.07, 0.08, 10]} position={[0, 0.34, 0]}>
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </Cylinder>
      {/* Bubbles inside */}
      {[0, 1, 2].map(i => (
        <Sphere key={i} args={[0.035, 8, 8]}
          position={[
            (Math.random() - 0.5) * 0.18,
            (Math.random() - 0.5) * 0.18,
            (Math.random() - 0.5) * 0.18,
          ]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
        </Sphere>
      ))}
    </group>
  );
}

/* ── Magic Book ─────────────────────────────── */
function MagicBook({ pos, phase = 0 }: {
  pos: [number, number, number]; phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const pages = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.y = pos[1] + Math.sin(t * 0.65) * 0.16;
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.4;
    if (pages.current) pages.current.rotation.x = Math.sin(t * 1.5) * 0.08;
  });
  return (
    <group ref={ref} position={pos}>
      {/* Cover */}
      <Box args={[0.32, 0.04, 0.42]}>
        <meshPhysicalMaterial color="#7c3aed" roughness={0.4} metalness={0.3}
          emissive="#6d28d9" emissiveIntensity={0.25} />
      </Box>
      {/* Pages */}
      <mesh ref={pages} position={[0, 0.04, 0]}>
        <boxGeometry args={[0.29, 0.06, 0.38]} />
        <meshStandardMaterial color="#fef9c3" roughness={0.9} />
      </mesh>
      {/* Spine */}
      <Box args={[0.04, 0.12, 0.42]} position={[-0.18, 0, 0]}>
        <meshPhysicalMaterial color="#4c1d95" roughness={0.4} metalness={0.2} />
      </Box>
      {/* Glowing runes on cover */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0.04 + i * 0.06, 0.03, -0.08 + i * 0.08]}>
          <boxGeometry args={[0.04, 0.01, 0.02]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={2} />
        </mesh>
      ))}
      {/* Golden clasp */}
      <Sphere args={[0.04, 8, 8]} position={[0.18, 0.05, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0}
          emissive="#fbbf24" emissiveIntensity={0.6} />
      </Sphere>
    </group>
  );
}

/* ── Floating Castle Tower ──────────────────── */
function CastleTower({ pos, color, scale = 1, phase = 0 }: {
  pos: [number, number, number]; color: string; scale?: number; phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.y = pos[1] + Math.sin(t * 0.55) * 0.12;
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.15;
  });
  return (
    <group ref={ref} position={pos} scale={scale}>
      {/* Base */}
      <Cylinder args={[0.18, 0.22, 0.55, 8]}>
        <meshPhysicalMaterial color={color} roughness={0.4} metalness={0.3}
          emissive={color} emissiveIntensity={0.1} />
      </Cylinder>
      {/* Battlements */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <Box key={i} args={[0.06, 0.1, 0.06]}
            position={[Math.cos(a) * 0.19, 0.32, Math.sin(a) * 0.19]}>
            <meshPhysicalMaterial color={color} roughness={0.3} metalness={0.4} />
          </Box>
        );
      })}
      {/* Conical roof */}
      <Cone args={[0.22, 0.35, 8]} position={[0, 0.45, 0]}>
        <meshPhysicalMaterial color="#be185d" roughness={0.3} metalness={0.2}
          emissive="#9d174d" emissiveIntensity={0.2} />
      </Cone>
      {/* Flag */}
      <Cylinder args={[0.01, 0.01, 0.28, 6]} position={[0, 0.76, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.1} />
      </Cylinder>
      {/* Windows */}
      {[0, 1, 2].map(i => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i}
            position={[Math.cos(a) * 0.19, 0.05, Math.sin(a) * 0.19]}
            rotation={[0, a, 0]}>
            <boxGeometry args={[0.06, 0.1, 0.03]} />
            <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Spiral Galaxy / Vortex ─────────────────── */
function MiniGalaxy({ pos, color, phase = 0 }: {
  pos: [number, number, number]; color: string; phase?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const { positions } = useMemo(() => {
    const n = 80;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 6;
      const r = (i / n) * 0.5;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    return { positions };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.rotation.y = t * 0.6;
    ref.current.position.y = pos[1] + Math.sin(t * 0.7) * 0.1;
  });

  return (
    <points ref={ref} position={pos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.04} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/* ── Sparkle Ring ───────────────────────────── */
function SparkleRing({ pos, color, radius, phase = 0 }: {
  pos: [number, number, number]; color: string; radius: number; phase?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.rotation.z = t * 0.5;
    ref.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    ref.current.position.y = pos[1] + Math.sin(t * 0.8) * 0.1;
  });
  return (
    <Torus ref={ref} position={pos} args={[radius, 0.018, 8, 80]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9}
        transparent opacity={0.7} />
    </Torus>
  );
}

/* ── Cloud Puff ─────────────────────────────── */
function CloudPuff({ pos, phase = 0, color = '#ffffff' }: {
  pos: [number, number, number]; phase?: number; color?: string;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.x = pos[0] + Math.sin(t * 0.35) * 0.3;
    ref.current.position.y = pos[1] + Math.sin(t * 0.55) * 0.08;
  });
  return (
    <group ref={ref} position={pos}>
      {[
        [0, 0, 0, 0.2], [-0.22, -0.04, 0, 0.15],
        [0.22, -0.04, 0, 0.15], [-0.1, 0.1, 0, 0.16],
        [0.1, 0.1, 0, 0.16],
      ].map(([x, y, z, r], i) => (
        <Sphere key={i} args={[r, 10, 10]} position={[x, y, z]}>
          <meshStandardMaterial color={color} transparent opacity={0.55}
            roughness={1} emissive={color} emissiveIntensity={0.08} />
        </Sphere>
      ))}
    </group>
  );
}

/* ── Diamond Ring ───────────────────────────── */
function DiamondOrb({ pos, color, phase = 0 }: {
  pos: [number, number, number]; color: string; phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + phase;
    ref.current.position.y = pos[1] + Math.sin(t * 1.2) * 0.2;
    ref.current.rotation.y += 0.018;
    ref.current.rotation.x = Math.sin(t * 0.7) * 0.2;
  });
  return (
    <group ref={ref} position={pos}>
      <Sphere args={[0.16, 32, 32]}>
        <MeshDistortMaterial color={color} distort={0.35} speed={2}
          emissive={color} emissiveIntensity={0.6}
          transparent opacity={0.8} roughness={0} metalness={0.2} />
      </Sphere>
      <Torus args={[0.28, 0.016, 8, 50]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1}
          transparent opacity={0.65} />
      </Torus>
      <Torus args={[0.28, 0.016, 8, 50]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8}
          transparent opacity={0.5} />
      </Torus>
    </group>
  );
}

/* ══════════════════════════════════════════════
   MAIN EXPORT — FloatingMagicScene
   Drop inside a <Canvas> as a child.
   Accepts a `theme` prop: 'feminine'|'masculine'|'neutral'
══════════════════════════════════════════════ */
export interface FloatingMagicSceneProps {
  theme?: 'feminine' | 'masculine' | 'neutral';
  density?: 'full' | 'light';   // 'light' = fewer objects for dashboards
}

export default function FloatingMagicScene({
  theme = 'neutral',
  density = 'full',
}: FloatingMagicSceneProps) {

  // Per-theme palettes
  const pal = {
    feminine:  { a: '#f472b6', b: '#a855f7', c: '#fbbf24', d: '#e879f9', e: '#fde68a', cloud: '#fce7f3' },
    masculine: { a: '#06b6d4', b: '#3b82f6', c: '#f59e0b', d: '#818cf8', e: '#22d3ee', cloud: '#bae6fd' },
    neutral:   { a: '#84cc16', b: '#a78bfa', c: '#f97316', d: '#34d399', e: '#fbbf24', cloud: '#d1fae5' },
  }[theme];

  return (
    <>
      {/* Starfield */}
      <Stars radius={90} depth={55} count={density === 'full' ? 2500 : 1200}
        factor={3.5} saturation={0.6} fade speed={1.2} />

      {/* Global sparkles */}
      <Sparkles count={density === 'full' ? 100 : 50} scale={14}
        size={2.5} speed={0.5} color={pal.a} opacity={0.6} />
      <Sparkles count={density === 'full' ? 60 : 30} scale={10}
        size={1.8} speed={0.4} color={pal.b} opacity={0.5} />

      {/* Floating crystals */}
      <Crystal pos={[-4.2, 1.8, -2.5]}  color={pal.a} scale={1.1} phase={0.0} />
      <Crystal pos={[ 4.0, 2.2, -3.0]}  color={pal.b} scale={0.9} phase={1.5} />
      <Crystal pos={[-2.5,-1.5, -2.0]}  color={pal.c} scale={0.75} phase={2.8} />
      <Crystal pos={[ 3.2,-2.0, -1.8]}  color={pal.d} scale={1.0} phase={0.8} />
      {density === 'full' && <>
        <Crystal pos={[ 0.8, 3.8, -4.0]}  color={pal.e} scale={0.8} phase={3.5} />
        <Crystal pos={[-3.8,-0.5, -3.2]}  color={pal.b} scale={0.65} phase={4.2} />
      </>}

      {/* Magic stars */}
      <MagicStar pos={[-3.0, 2.8, -2.0]}  color={pal.c}  phase={0.0} />
      <MagicStar pos={[ 3.5, 1.5, -2.5]}  color={pal.a}  phase={1.8} />
      <MagicStar pos={[ 1.5,-2.5, -1.5]}  color={pal.e}  phase={3.2} />
      {density === 'full' && <>
        <MagicStar pos={[-1.8, 3.5, -3.5]} color={pal.b}  phase={2.5} />
        <MagicStar pos={[ 4.5,-1.0, -2.0]} color={pal.d}  phase={0.9} />
      </>}

      {/* Potion bottles */}
      <Potion pos={[ 2.8, 2.8, -2.5]} color={pal.a}  phase={0.5} />
      <Potion pos={[-3.5,-1.2, -2.0]} color={pal.d}  phase={2.0} />
      {density === 'full' && <Potion pos={[ 0.5, 3.2, -3.8]} color={pal.b} phase={3.8} />}

      {/* Magic books */}
      <MagicBook pos={[-2.2, 2.0, -2.0]} phase={1.0} />
      {density === 'full' && <MagicBook pos={[ 3.8,-1.8, -2.8]} phase={4.0} />}

      {/* Castle towers */}
      <CastleTower pos={[-4.5, 0.5, -4.0]} color={pal.b} scale={0.9} phase={0.3} />
      {density === 'full' && <>
        <CastleTower pos={[ 4.2, 0.8, -4.5]} color={pal.a} scale={0.75} phase={2.1} />
        <CastleTower pos={[-1.0,-2.8, -3.5]} color={pal.d} scale={0.65} phase={3.7} />
      </>}

      {/* Mini galaxies */}
      <MiniGalaxy pos={[ 3.0, 3.2, -4.0]} color={pal.a} phase={0.0} />
      <MiniGalaxy pos={[-3.5, 2.5, -3.5]} color={pal.b} phase={2.0} />
      {density === 'full' && <MiniGalaxy pos={[ 1.0,-3.0, -4.5]} color={pal.c} phase={4.5} />}

      {/* Sparkle rings */}
      <SparkleRing pos={[0, 0, -3.0]}  color={pal.a} radius={2.8} phase={0.0} />
      <SparkleRing pos={[0, 0, -3.5]}  color={pal.b} radius={3.5} phase={1.0} />
      {density === 'full' &&
        <SparkleRing pos={[0, 0, -4.0]} color={pal.c} radius={4.2} phase={2.0} />}

      {/* Cloud puffs */}
      <CloudPuff pos={[-3.8, 3.0, -3.5]} phase={0.0} color={pal.cloud} />
      <CloudPuff pos={[ 3.5, 2.5, -3.5]} phase={1.5} color={pal.cloud} />
      {density === 'full' && <>
        <CloudPuff pos={[-1.5,-3.2, -3.0]} phase={3.0} color={pal.cloud} />
        <CloudPuff pos={[ 2.0, 4.0, -4.5]} phase={4.5} color={pal.cloud} />
      </>}

      {/* Diamond orbs */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <DiamondOrb pos={[-2.8, 0.5, -2.5]} color={pal.a} phase={0.0} />
      </Float>
      <Float speed={0.9} rotationIntensity={0.3} floatIntensity={0.8}>
        <DiamondOrb pos={[ 2.5,-0.5, -2.0]} color={pal.e} phase={2.5} />
      </Float>

      {/* Ambient lighting */}
      <ambientLight intensity={0.5} color={pal.a} />
      <pointLight position={[5, 5, 3]}  intensity={1.8} color={pal.a} />
      <pointLight position={[-5,-3, 3]} intensity={1.2} color={pal.b} />
      <pointLight position={[0, 8, -2]} intensity={1.0} color={pal.c} />
      <spotLight position={[0, 10, 0]} intensity={2.5}
        color="#ffffff" angle={0.45} penumbra={1} castShadow={false} />
    </>
  );
}
