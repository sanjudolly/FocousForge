/**
 * FloatingCartoonScene
 * ─────────────────────────────────────────────
 * A full Canvas scene that floats ALL the new cartoon
 * characters (Doraemon, Dora, Shin Chan, Jackie Chan,
 * Spiderman, Superman) + classic ones (Fairy, Wizard,
 * Phoenix, Dragon) around the scene.
 *
 * Drop inside a <Canvas> as a child, or use the
 * default export which wraps its own <Canvas>.
 */

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  DoraemonCartoon, DoraCartoon, ShinChanCartoon,
  JackieChanCartoon, SpidermanCartoon, SupermanCartoon,
  FairyCartoon, WizardCartoon, PhoenixCartoon, DragonCartoon,
  UnicornCartoon, RobotCartoon,
} from './CartoonCharacters';

/* ── Mini floating ring that orbits a character ── */
function OrbitRing({ color, radius, speed, tilt = 0 }: { color: string; radius: number; speed: number; tilt?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.018, 8, 60]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.55} />
    </mesh>
  );
}

/* ── Star burst (sparkle streaks behind a character) ── */
function StarBurst({ pos, color }: { pos: [number, number, number]; color: string }) {
  const pts = useRef<THREE.Points>(null);
  const count = 12;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    positions[i * 3]     = Math.cos(a) * 0.6;
    positions[i * 3 + 1] = Math.sin(a) * 0.6;
    positions[i * 3 + 2] = 0;
  }
  useFrame(({ clock }) => {
    if (pts.current) {
      pts.current.rotation.z = clock.getElapsedTime() * 0.8;
      pts.current.scale.setScalar(0.9 + Math.sin(clock.getElapsedTime() * 2) * 0.15);
    }
  });
  return (
    <points ref={pts} position={pos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.06} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ── Scene variants ─────────────────────────── */
interface SceneProps { variant?: 'full' | 'compact' | 'login' | 'hero'; }

function SceneContent({ variant = 'full' }: SceneProps) {
  const isCompact = variant === 'compact' || variant === 'login';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} color="#fff5f5" />
      <pointLight position={[6, 6, 4]}  intensity={2.5} color="#f472b6" />
      <pointLight position={[-6, 4, 3]} intensity={2.0} color="#818cf8" />
      <pointLight position={[0, -5, 4]} intensity={1.8} color="#34d399" />
      <pointLight position={[4, -4, 3]} intensity={1.5} color="#f59e0b" />
      <spotLight position={[0, 10, 5]} intensity={3} color="#ffffff" angle={0.5} penumbra={1} />

      {/* Stars */}
      <Stars radius={80} depth={40} count={isCompact ? 800 : 1800}
        factor={3} saturation={0.8} fade speed={1} />

      {/* Global sparkles */}
      <Sparkles count={isCompact ? 40 : 100} scale={16} size={2} speed={0.5} color="#f472b6" opacity={0.6} />
      <Sparkles count={isCompact ? 30 : 70}  scale={12} size={1.5} speed={0.4} color="#818cf8" opacity={0.5} />
      <Sparkles count={isCompact ? 25 : 50}  scale={10} size={1}   speed={0.6} color="#34d399" opacity={0.4} />

      {/* ── DORAEMON — center-left, prominent ── */}
      <Float speed={1.0} rotationIntensity={0.25} floatIntensity={0.7}>
        <group position={[-3.2, 0.5, 0]}>
          <DoraemonCartoon position={[0, 0, 0]} />
          <OrbitRing color="#1a8fe3" radius={1.0} speed={0.8} tilt={0.4} />
          <StarBurst pos={[0, 0, 0]} color="#1a8fe3" />
        </group>
      </Float>

      {/* ── DORA — right side ── */}
      <Float speed={0.9} rotationIntensity={0.2} floatIntensity={0.6}>
        <group position={[3.0, -0.2, -0.5]}>
          <DoraCartoon position={[0, 0, 0]} />
          <StarBurst pos={[0, 0.5, 0]} color="#f472b6" />
        </group>
      </Float>

      {/* ── SHIN CHAN — top area, spinning ── */}
      <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.8}>
        <group position={[1.0, 2.8, -1]}>
          <ShinChanCartoon position={[0, 0, 0]} />
          <OrbitRing color="#ef4444" radius={0.85} speed={1.2} tilt={0.6} />
        </group>
      </Float>

      {/* ── JACKIE CHAN — bottom-right, action pose ── */}
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.5}>
        <group position={[2.5, -2.5, -0.5]}>
          <JackieChanCartoon position={[0, 0, 0]} />
          <StarBurst pos={[0.5, 0.3, 0]} color="#fbbf24" />
        </group>
      </Float>

      {/* ── SPIDERMAN — upper-right, web-swinging ── */}
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={1.0}>
        <group position={[3.8, 2.2, -1]}>
          <SpidermanCartoon position={[0, 0, 0]} />
          <OrbitRing color="#ef4444" radius={0.9} speed={1.5} tilt={0.3} />
          <StarBurst pos={[-0.4, 0.4, 0]} color="#ef4444" />
        </group>
      </Float>

      {/* ── SUPERMAN — upper-left, flying ── */}
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.9}>
        <group position={[-3.5, 2.5, -1]}>
          <SupermanCartoon position={[0, 0, 0]} />
          <OrbitRing color="#1d4ed8" radius={1.0} speed={-0.7} tilt={0.2} />
          <StarBurst pos={[0.3, 0.2, 0]} color="#fbbf24" />
        </group>
      </Float>

      {/* ── FAIRY — small, background ── */}
      {!isCompact && (
        <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.2}>
          <group position={[-1.5, -2.2, -1.5]} scale={0.75}>
            <FairyCartoon position={[0, 0, 0]} />
          </group>
        </Float>
      )}

      {/* ── WIZARD — background left ── */}
      {!isCompact && (
        <Float speed={0.7} rotationIntensity={0.15} floatIntensity={0.5}>
          <group position={[-4.5, -1.2, -2]} scale={0.7}>
            <WizardCartoon position={[0, 0, 0]} />
          </group>
        </Float>
      )}

      {/* ── PHOENIX — background upper ── */}
      {variant === 'full' && (
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
          <group position={[0, 3.8, -2]} scale={0.65}>
            <PhoenixCartoon position={[0, 0, 0]} />
          </group>
        </Float>
      )}

      {/* ── UNICORN — lower left background ── */}
      {variant === 'full' && (
        <Float speed={0.85} rotationIntensity={0.2} floatIntensity={0.6}>
          <group position={[-4.8, 1.2, -2.5]} scale={0.6}>
            <UnicornCartoon position={[0, 0, 0]} />
          </group>
        </Float>
      )}

      {/* ── DRAGON — lower right background ── */}
      {variant === 'full' && (
        <Float speed={0.9} rotationIntensity={0.25} floatIntensity={0.7}>
          <group position={[4.5, -1.5, -2.5]} scale={0.65}>
            <DragonCartoon position={[0, 0, 0]} />
          </group>
        </Float>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   NAMED SCENE — drop inside existing <Canvas>
───────────────────────────────────────────── */
export function FloatingCartoonSceneContent({ variant = 'full' }: SceneProps) {
  return (
    <Suspense fallback={null}>
      <SceneContent variant={variant} />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────
   DEFAULT EXPORT — standalone Canvas wrapper
   Usage: <FloatingCartoonScene variant="hero" />
───────────────────────────────────────────── */
interface FloatingCartoonSceneProps extends SceneProps {
  className?: string;
  style?: React.CSSProperties;
  orbitControls?: boolean;
}

export default function FloatingCartoonScene({
  variant = 'full',
  className = '',
  style,
  orbitControls = false,
}: FloatingCartoonSceneProps) {
  const isCompact = variant === 'compact' || variant === 'login';
  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        camera={{ position: [0, 0, isCompact ? 9 : 11], fov: isCompact ? 55 : 58 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <SceneContent variant={variant} />
          {orbitControls && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.4}
              minPolarAngle={Math.PI / 3.5}
              maxPolarAngle={Math.PI / 1.8}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPACT VERSION — 4 characters for sidebars
───────────────────────────────────────────── */
export function CartoonSidebar({ accent = '#8b5cf6' }: { accent?: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.8} color="#fff0f5" />
        <pointLight position={[4, 4, 4]} intensity={2} color={accent} />
        <pointLight position={[-4, -3, 3]} intensity={1.5} color="#818cf8" />
        <Stars radius={60} depth={30} count={600} factor={3} saturation={0.7} fade speed={1} />
        <Sparkles count={35} scale={10} size={2} speed={0.5} color={accent} opacity={0.6} />

        <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.8}>
          <DoraemonCartoon position={[-1.8, 0.8, 0]} />
        </Float>
        <Float speed={0.9} rotationIntensity={0.2} floatIntensity={0.6}>
          <SpidermanCartoon position={[1.8, 0.5, 0]} />
        </Float>
        <Float speed={1.3} rotationIntensity={0.35} floatIntensity={0.7}>
          <ShinChanCartoon position={[0, -1.0, 0]} />
        </Float>
        <Float speed={0.8} rotationIntensity={0.25} floatIntensity={0.9}>
          <SupermanCartoon position={[0, 2.2, -0.5]} />
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ─────────────────────────────────────────────
   HERO LINEUP — horizontal row for landing page
───────────────────────────────────────────── */
export function HeroLineup() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 65 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} color="#f5f5ff" />
        <pointLight position={[8, 6, 6]}  intensity={3} color="#f472b6" />
        <pointLight position={[-8, 4, 5]} intensity={2.5} color="#818cf8" />
        <pointLight position={[0, -5, 5]} intensity={2} color="#34d399" />
        <Stars radius={80} depth={40} count={1200} factor={3.5} saturation={0.8} fade speed={1.2} />
        <Sparkles count={80} scale={18} size={2.5} speed={0.4} color="#f472b6" opacity={0.55} />

        {/* 6 characters side-by-side */}
        <Float speed={1.0} rotationIntensity={0.2} floatIntensity={0.6}>
          <DoraemonCartoon position={[-5.2, 0, 0]} />
        </Float>
        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.8}>
          <DoraCartoon position={[-3.0, 0.2, 0]} />
        </Float>
        <Float speed={0.9} rotationIntensity={0.15} floatIntensity={0.5}>
          <ShinChanCartoon position={[-0.8, -0.1, 0]} />
        </Float>
        <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.7}>
          <JackieChanCartoon position={[1.4, 0.1, 0]} />
        </Float>
        <Float speed={1.3} rotationIntensity={0.35} floatIntensity={0.9}>
          <SpidermanCartoon position={[3.4, 0.3, 0]} />
        </Float>
        <Float speed={0.85} rotationIntensity={0.2} floatIntensity={0.7}>
          <SupermanCartoon position={[5.4, 0.2, 0]} />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Suspense>
    </Canvas>
  );
}
