import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Torus, Sphere, Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';
import { Theme } from '../../types';

interface FloatingMeshProps {
  position: [number, number, number];
  color: string;
  speed?: number;
  amplitude?: number;
  phase?: number;
}

function FloatingSphere({ position, color, speed = 1, amplitude = 0.3, phase = 0 }: FloatingMeshProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * amplitude;
    ref.current.rotation.y += 0.005;
    ref.current.rotation.x += 0.003;
  });
  return (
    <Sphere ref={ref} position={position} args={[0.4, 32, 32]}>
      <MeshDistortMaterial color={color} distort={0.4} speed={2} transparent opacity={0.8} />
    </Sphere>
  );
}

function FloatingCrystal({ position, color, speed = 0.8, amplitude = 0.4, phase = 0 }: FloatingMeshProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * amplitude;
    ref.current.rotation.y += 0.01;
    ref.current.rotation.x += 0.005;
  });
  return (
    <Octahedron ref={ref} position={position} args={[0.5, 0]}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.1}
        roughness={0}
        transmission={0.9}
        transparent
        opacity={0.85}
      />
    </Octahedron>
  );
}

function FloatingRing({ position, color, speed = 0.6, amplitude = 0.2, phase = 0 }: FloatingMeshProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * amplitude;
    ref.current.rotation.z += 0.01;
    ref.current.rotation.x += 0.005;
  });
  return (
    <Torus ref={ref} position={position} args={[0.5, 0.08, 16, 60]}>
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} emissive={color} emissiveIntensity={0.3} />
    </Torus>
  );
}

function FloatingCube({ position, color, speed = 0.9, amplitude = 0.35, phase = 0 }: FloatingMeshProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * amplitude;
    ref.current.rotation.y += 0.008;
    ref.current.rotation.x += 0.004;
  });
  return (
    <Box ref={ref} position={position} args={[0.5, 0.5, 0.5]}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.5}
        roughness={0.1}
        transparent
        opacity={0.75}
        wireframe={false}
      />
    </Box>
  );
}

interface FloatingObjectsProps {
  theme: Theme;
}

const THEME_OBJECTS = {
  feminine: [
    { type: 'crystal', pos: [-3.5, 1.5, -2] as [number,number,number], color: '#f472b6', phase: 0 },
    { type: 'sphere', pos: [3, 2, -3] as [number,number,number], color: '#e879f9', phase: 1.2 },
    { type: 'crystal', pos: [4.5, -0.5, -1] as [number,number,number], color: '#fb923c', phase: 2.1 },
    { type: 'ring', pos: [-4, -1, -2] as [number,number,number], color: '#a855f7', phase: 0.8 },
    { type: 'sphere', pos: [0, 3.5, -4] as [number,number,number], color: '#fda4af', phase: 3.0 },
    { type: 'crystal', pos: [-1.5, -2, -3] as [number,number,number], color: '#c084fc', phase: 1.7 },
  ],
  masculine: [
    { type: 'cube', pos: [-3.5, 1.5, -2] as [number,number,number], color: '#3b82f6', phase: 0 },
    { type: 'ring', pos: [3, 2, -3] as [number,number,number], color: '#06b6d4', phase: 1.2 },
    { type: 'sphere', pos: [4.5, -0.5, -1] as [number,number,number], color: '#6366f1', phase: 2.1 },
    { type: 'cube', pos: [-4, -1, -2] as [number,number,number], color: '#818cf8', phase: 0.8 },
    { type: 'ring', pos: [0, 3.5, -4] as [number,number,number], color: '#38bdf8', phase: 3.0 },
    { type: 'sphere', pos: [-1.5, -2, -3] as [number,number,number], color: '#60a5fa', phase: 1.7 },
  ],
  neutral: [
    { type: 'sphere', pos: [-3.5, 1.5, -2] as [number,number,number], color: '#818cf8', phase: 0 },
    { type: 'crystal', pos: [3, 2, -3] as [number,number,number], color: '#a78bfa', phase: 1.2 },
    { type: 'ring', pos: [4.5, -0.5, -1] as [number,number,number], color: '#c4b5fd', phase: 2.1 },
    { type: 'cube', pos: [-4, -1, -2] as [number,number,number], color: '#6366f1', phase: 0.8 },
    { type: 'sphere', pos: [0, 3.5, -4] as [number,number,number], color: '#8b5cf6', phase: 3.0 },
    { type: 'crystal', pos: [-1.5, -2, -3] as [number,number,number], color: '#7c3aed', phase: 1.7 },
  ],
};

export default function FloatingObjects({ theme }: FloatingObjectsProps) {
  const objects = THEME_OBJECTS[theme];
  return (
    <group>
      {objects.map((obj, i) => {
        if (obj.type === 'crystal') return <FloatingCrystal key={i} position={obj.pos} color={obj.color} phase={obj.phase} />;
        if (obj.type === 'ring') return <FloatingRing key={i} position={obj.pos} color={obj.color} phase={obj.phase} />;
        if (obj.type === 'cube') return <FloatingCube key={i} position={obj.pos} color={obj.color} phase={obj.phase} />;
        return <FloatingSphere key={i} position={obj.pos} color={obj.color} phase={obj.phase} />;
      })}
    </group>
  );
}
