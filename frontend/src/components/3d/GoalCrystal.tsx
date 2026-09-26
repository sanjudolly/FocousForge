import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Octahedron, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface GoalCrystalProps {
  color?: string;
  scale?: number;
}

export default function GoalCrystal({ color = '#8b5cf6', scale = 1 }: GoalCrystalProps) {
  const ref = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.8;
      ref.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <Sparkles count={30} scale={3} size={2} speed={0.5} color={color} opacity={0.7} />
      <Octahedron ref={ref} args={[0.8, 0]}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0}
          transmission={0.8}
          transparent
          opacity={0.9}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Octahedron>
      {/* Inner glow core */}
      <Octahedron args={[0.4, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.6} />
      </Octahedron>
    </group>
  );
}
