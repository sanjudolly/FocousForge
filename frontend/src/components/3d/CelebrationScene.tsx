import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';
import GoalCrystal from './GoalCrystal';

interface CelebrationSceneProps {
  color?: string;
  className?: string;
}

export default function CelebrationScene({ color = '#8b5cf6', className = '' }: CelebrationSceneProps) {
  return (
    <div className={`w-full ${className}`} style={{ height: 300 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 3, 3]} intensity={2} color={color} />
          <pointLight position={[-3, -3, 3]} intensity={1} color="#ffffff" />
          <Stars radius={50} depth={30} count={1000} factor={3} fade speed={2} />
          <Sparkles count={100} scale={8} size={3} speed={1} color={color} opacity={0.8} />
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <GoalCrystal color={color} scale={1.2} />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}
