import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Cylinder, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Theme } from '../../types';

interface FocusCharacterProps {
  theme: Theme;
  position?: [number, number, number];
  scale?: number;
}

// Feminine character: elegant fairy-like figure
function FairyCharacter({ position = [0, 0, 0] as [number,number,number] }: { position?: [number,number,number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const wingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.15;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    if (wingRef.current) wingRef.current.rotation.z = Math.sin(t * 3) * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <Cylinder args={[0.25, 0.35, 0.8, 16]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#f9a8d4" metalness={0.2} roughness={0.3} emissive="#f472b6" emissiveIntensity={0.2} />
      </Cylinder>
      {/* Head */}
      <Sphere args={[0.28, 32, 32]} position={[0, 0.7, 0]}>
        <meshPhysicalMaterial color="#fde68a" roughness={0.5} />
      </Sphere>
      {/* Hair */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0.85, -0.05]}>
        <meshPhysicalMaterial color="#7c3aed" roughness={0.6} />
      </Sphere>
      {/* Eyes */}
      <Sphere args={[0.04, 8, 8]} position={[-0.09, 0.72, 0.26]}>
        <meshBasicMaterial color="#1e1b4b" />
      </Sphere>
      <Sphere args={[0.04, 8, 8]} position={[0.09, 0.72, 0.26]}>
        <meshBasicMaterial color="#1e1b4b" />
      </Sphere>
      {/* Wings */}
      <mesh ref={wingRef} position={[0, 0.2, -0.1]}>
        <torusGeometry args={[0.5, 0.05, 8, 20, Math.PI]} />
        <meshPhysicalMaterial color="#e879f9" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.2, -0.1]} rotation={[0, Math.PI, 0]}>
        <torusGeometry args={[0.5, 0.05, 8, 20, Math.PI]} />
        <meshPhysicalMaterial color="#c084fc" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Glow orb */}
      <Sphere args={[0.12, 16, 16]} position={[0.4, 0.5, 0.3]}>
        <MeshDistortMaterial color="#ffd700" distort={0.5} speed={3} emissive="#ffd700" emissiveIntensity={1} />
      </Sphere>
      {/* Star crown */}
      <Torus args={[0.22, 0.03, 8, 30]} position={[0, 1.05, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0} emissive="#fbbf24" emissiveIntensity={0.5} />
      </Torus>
    </group>
  );
}

// Masculine: armored warrior / knight
function WarriorCharacter({ position = [0, 0, 0] as [number,number,number] }: { position?: [number,number,number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.1;
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15;
    if (swordRef.current) swordRef.current.rotation.z = Math.sin(t * 1.5) * 0.1;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Armor body */}
      <Cylinder args={[0.3, 0.38, 0.9, 8]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#1e3a5f" metalness={0.9} roughness={0.1} emissive="#3b82f6" emissiveIntensity={0.15} />
      </Cylinder>
      {/* Chest emblem */}
      <Torus args={[0.15, 0.03, 8, 20]} position={[0, 0.1, 0.31]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#06b6d4" metalness={1} emissive="#06b6d4" emissiveIntensity={0.6} />
      </Torus>
      {/* Helmet */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0.7, 0]}>
        <meshPhysicalMaterial color="#1e293b" metalness={0.95} roughness={0.05} />
      </Sphere>
      {/* Visor glow */}
      <mesh position={[0, 0.72, 0.25]}>
        <boxGeometry args={[0.25, 0.06, 0.05]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
      </mesh>
      {/* Shoulder pads */}
      <Sphere args={[0.2, 16, 16]} position={[-0.42, 0.35, 0]}>
        <meshPhysicalMaterial color="#1e293b" metalness={0.95} roughness={0.05} />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[0.42, 0.35, 0]}>
        <meshPhysicalMaterial color="#1e293b" metalness={0.95} roughness={0.05} />
      </Sphere>
      {/* Energy sword */}
      <mesh ref={swordRef} position={[0.7, 0.4, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.06, 0.8, 0.06]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// Neutral: mystical sage / wizard
function SageCharacter({ position = [0, 0, 0] as [number,number,number] }: { position?: [number,number,number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.12;
    groupRef.current.rotation.y = t * 0.1;
    if (orbRef.current) {
      orbRef.current.position.x = Math.sin(t * 1.5) * 0.4;
      orbRef.current.position.y = 0.5 + Math.cos(t * 1.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Robe body */}
      <Cylinder args={[0.15, 0.45, 1, 8]} position={[0, -0.1, 0]}>
        <meshPhysicalMaterial color="#312e81" roughness={0.7} emissive="#4338ca" emissiveIntensity={0.1} />
      </Cylinder>
      {/* Head */}
      <Sphere args={[0.27, 32, 32]} position={[0, 0.7, 0]}>
        <meshPhysicalMaterial color="#fef3c7" roughness={0.6} />
      </Sphere>
      {/* Hair / hood */}
      <Sphere args={[0.31, 32, 32]} position={[0, 0.78, -0.03]}>
        <meshPhysicalMaterial color="#1e1b4b" roughness={0.8} />
      </Sphere>
      {/* Pointed hat */}
      <Cylinder args={[0, 0.28, 0.6, 8]} position={[0, 1.15, 0]}>
        <meshPhysicalMaterial color="#312e81" roughness={0.6} emissive="#4338ca" emissiveIntensity={0.15} />
      </Cylinder>
      {/* Eyes — glowing */}
      <Sphere args={[0.04, 8, 8]} position={[-0.09, 0.72, 0.24]}>
        <meshBasicMaterial color="#a78bfa" />
      </Sphere>
      <Sphere args={[0.04, 8, 8]} position={[0.09, 0.72, 0.24]}>
        <meshBasicMaterial color="#a78bfa" />
      </Sphere>
      {/* Floating orb */}
      <Sphere ref={orbRef as React.RefObject<THREE.Mesh>} args={[0.15, 32, 32]} position={[0.4, 0.5, 0.3]}>
        <MeshDistortMaterial color="#8b5cf6" distort={0.5} speed={2} emissive="#8b5cf6" emissiveIntensity={0.8} transparent opacity={0.9} />
      </Sphere>
      {/* Magic ring */}
      <Torus args={[0.38, 0.025, 8, 40]} position={[0, 0.5, 0]} rotation={[Math.PI/4, 0, 0]}>
        <meshStandardMaterial color="#c4b5fd" emissive="#c4b5fd" emissiveIntensity={0.8} />
      </Torus>
    </group>
  );
}

export default function FocusCharacter({ theme, position = [0, -0.5, 0], scale = 1 }: FocusCharacterProps) {
  return (
    <group position={position} scale={scale}>
      {theme === 'feminine' && <FairyCharacter position={[0, 0, 0]} />}
      {theme === 'masculine' && <WarriorCharacter position={[0, 0, 0]} />}
      {theme === 'neutral' && <SageCharacter position={[0, 0, 0]} />}
    </group>
  );
}
