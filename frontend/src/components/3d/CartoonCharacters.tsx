import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Sphere,
  Cylinder,
  Torus,
  Cone,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Box,
} from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   FAIRY — pink / lavender pixie with wings
───────────────────────────────────────────── */
export function FairyCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const wL = useRef<THREE.Mesh>(null);
  const wR = useRef<THREE.Mesh>(null);
  const wand = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.9) * 0.18;
      root.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    }

    if (wL.current) {
      wL.current.rotation.z = 0.3 + Math.sin(t * 4) * 0.4;
    }

    if (wR.current) {
      wR.current.rotation.z = -0.3 - Math.sin(t * 4) * 0.4;
    }

    if (wand.current) {
      wand.current.rotation.z = Math.sin(t * 1.8) * 0.2;
    }
  });

  return (
    <group ref={root} position={position}>
      <Cylinder
        args={[0.18, 0.38, 0.85, 12]}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#e879f9"
          roughness={0.3}
          metalness={0.1}
          emissive="#a855f7"
          emissiveIntensity={0.25}
        />
      </Cylinder>

      <Cylinder
        args={[0.42, 0.15, 0.22, 12]}
        position={[0, -0.52, 0]}
      >
        <meshPhysicalMaterial
          color="#f0abfc"
          roughness={0.4}
          emissive="#c026d3"
          emissiveIntensity={0.15}
        />
      </Cylinder>

      <Torus
        args={[0.19, 0.03, 8, 30]}
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#fde68a"
          metalness={1}
          roughness={0}
          emissive="#fbbf24"
          emissiveIntensity={0.8}
        />
      </Torus>

      <Sphere args={[0.3, 32, 32]} position={[0, 0.72, 0]}>
        <meshPhysicalMaterial
          color="#fde68a"
          roughness={0.55}
        />
      </Sphere>

      {[-0.1, 0.1].map((x, i) => (
        <group key={i} position={[x, 0.76, 0.27]}>
          <Sphere args={[0.055, 12, 12]}>
            <meshBasicMaterial color="#1c0533" />
          </Sphere>

          <Sphere
            args={[0.02, 8, 8]}
            position={[0.015, 0.015, 0.04]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      ))}

      {[-0.16, 0.16].map((x, i) => (
        <Sphere
          key={i}
          args={[0.045, 8, 8]}
          position={[x, 0.68, 0.27]}
        >
          <meshBasicMaterial
            color="#f9a8d4"
            transparent
            opacity={0.7}
          />
        </Sphere>
      ))}

      <Sphere args={[0.32, 32, 32]} position={[0, 0.88, -0.04]}>
        <meshPhysicalMaterial
          color="#7c3aed"
          roughness={0.55}
        />
      </Sphere>

      <Sphere
        args={[0.09, 12, 12]}
        position={[0.22, 1.05, 0.05]}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.1}
          emissive="#f59e0b"
          emissiveIntensity={0.5}
        />
      </Sphere>

      <mesh
        ref={wL}
        position={[-0.4, 0.25, -0.12]}
        rotation={[0.2, 0.3, 0.4]}
      >
        <torusGeometry
          args={[0.36, 0.04, 8, 20, Math.PI * 1.3]}
        />
        <meshPhysicalMaterial
          color="#e879f9"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          metalness={0.3}
          roughness={0}
        />
      </mesh>

      <mesh
        ref={wR}
        position={[0.4, 0.25, -0.12]}
        rotation={[0.2, -0.3, -0.4]}
      >
        <torusGeometry
          args={[0.36, 0.04, 8, 20, Math.PI * 1.3]}
        />
        <meshPhysicalMaterial
          color="#c084fc"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          metalness={0.3}
          roughness={0}
        />
      </mesh>

      <group ref={wand} position={[0.55, 0.3, 0.15]}>
        <Cylinder args={[0.02, 0.02, 0.55, 8]}>
          <meshStandardMaterial
            color="#fde68a"
            metalness={0.8}
            roughness={0.1}
          />
        </Cylinder>

        <Sphere
          args={[0.08, 16, 16]}
          position={[0, 0.33, 0]}
        >
          <MeshDistortMaterial
            color="#ffd700"
            distort={0.5}
            speed={3}
            emissive="#fbbf24"
            emissiveIntensity={1.2}
          />
        </Sphere>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   DORAEMON — blue robotic cat from the future
───────────────────────────────────────────── */
export function DoraemonCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const bell = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.8) * 0.15;
      root.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    }

    if (bell.current) {
      bell.current.rotation.z = Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <group ref={root} position={position}>
      <Sphere args={[0.52, 32, 32]} position={[0, -0.1, 0]}>
        <meshPhysicalMaterial
          color="#1a8fe3"
          roughness={0.25}
          metalness={0.1}
          emissive="#0ea5e9"
          emissiveIntensity={0.15}
        />
      </Sphere>

      <Sphere args={[0.36, 24, 24]} position={[0, -0.15, 0.32]}>
        <meshPhysicalMaterial
          color="#f0f9ff"
          roughness={0.3}
        />
      </Sphere>

      <Sphere args={[0.22, 16, 16]} position={[0, -0.05, 0.5]}>
        <meshPhysicalMaterial
          color="#e0f2fe"
          roughness={0.35}
        />
      </Sphere>

      <Torus
        args={[0.22, 0.02, 8, 30]}
        position={[0, -0.05, 0.5]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#1a8fe3"
          metalness={0.5}
          roughness={0.3}
        />
      </Torus>

      <Sphere args={[0.46, 32, 32]} position={[0, 0.72, 0]}>
        <meshPhysicalMaterial
          color="#1a8fe3"
          roughness={0.2}
          metalness={0.1}
          emissive="#0ea5e9"
          emissiveIntensity={0.1}
        />
      </Sphere>

      <Sphere args={[0.3, 24, 24]} position={[0, 0.68, 0.32]}>
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.3}
        />
      </Sphere>

      {[-0.13, 0.13].map((x, i) => (
        <group key={i} position={[x, 0.82, 0.55]}>
          <Sphere args={[0.1, 16, 16]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>

          <Sphere
            args={[0.065, 12, 12]}
            position={[0, 0, 0.04]}
          >
            <meshBasicMaterial color="#1c0533" />
          </Sphere>

          <Sphere
            args={[0.025, 8, 8]}
            position={[0.025, 0.025, 0.08]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      ))}

      <Sphere
        args={[0.06, 12, 12]}
        position={[0, 0.68, 0.65]}
      >
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </Sphere>

      {[0.08, 0, -0.08].map((y, i) => (
        <group key={i}>
          <Cylinder
            args={[0.008, 0.008, 0.38, 6]}
            position={[-0.42, 0.62 + y, 0.5]}
            rotation={[0, 0, 0.1]}
          >
            <meshStandardMaterial color="#94a3b8" />
          </Cylinder>

          <Cylinder
            args={[0.008, 0.008, 0.38, 6]}
            position={[0.42, 0.62 + y, 0.5]}
            rotation={[0, 0, -0.1]}
          >
            <meshStandardMaterial color="#94a3b8" />
          </Cylinder>
        </group>
      ))}

      <mesh position={[0, 0.52, 0.64]}>
        <torusGeometry
          args={[0.12, 0.02, 8, 20, Math.PI]}
        />
        <meshBasicMaterial color="#1c0533" />
      </mesh>

      {[-0.3, 0.3].map((x, i) => (
        <Sphere
          key={i}
          args={[0.12, 12, 12]}
          position={[x, 1.12, 0]}
        >
          <meshPhysicalMaterial
            color="#1a8fe3"
            roughness={0.2}
          />
        </Sphere>
      ))}

      <Torus
        args={[0.28, 0.04, 8, 30]}
        position={[0, 0.28, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#ef4444"
          metalness={0.3}
          roughness={0.4}
        />
      </Torus>

      <mesh ref={bell} position={[0, 0.15, 0.28]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.05}
          emissive="#fbbf24"
          emissiveIntensity={0.5}
        />
      </mesh>

      {[-0.22, 0.22].map((x, i) => (
        <Sphere
          key={i}
          args={[0.2, 16, 16]}
          position={[x, -0.65, 0.1]}
        >
          <meshPhysicalMaterial
            color="#f0f9ff"
            roughness={0.3}
          />
        </Sphere>
      ))}

      {[-0.6, 0.6].map((x, i) => (
        <group key={i}>
          <Sphere
            args={[0.14, 12, 12]}
            position={[x, 0.0, 0.1]}
          >
            <meshPhysicalMaterial
              color="#1a8fe3"
              roughness={0.2}
            />
          </Sphere>

          <Sphere
            args={[0.1, 12, 12]}
            position={[x * 1.2, -0.12, 0.2]}
          >
            <meshPhysicalMaterial
              color="#f0f9ff"
              roughness={0.3}
            />
          </Sphere>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────
   DORA THE EXPLORER
───────────────────────────────────────────── */
export function DoraCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const backpack = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.7) * 0.12;
      root.current.rotation.y = Math.sin(t * 0.25) * 0.2;
    }

    if (backpack.current) {
      backpack.current.rotation.z =
        Math.sin(t * 1.2) * 0.05;
    }
  });

  return (
    <group ref={root} position={position}>
      <Cylinder
        args={[0.2, 0.28, 0.7, 12]}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#f472b6"
          roughness={0.4}
          emissive="#ec4899"
          emissiveIntensity={0.15}
        />
      </Cylinder>

      <Cylinder
        args={[0.28, 0.32, 0.28, 12]}
        position={[0, -0.48, 0]}
      >
        <meshPhysicalMaterial
          color="#f97316"
          roughness={0.4}
        />
      </Cylinder>

      {[-0.12, 0.12].map((x, i) => (
        <group key={i}>
          <Cylinder
            args={[0.09, 0.08, 0.45, 8]}
            position={[x, -0.85, 0]}
          >
            <meshPhysicalMaterial
              color="#fde68a"
              roughness={0.4}
            />
          </Cylinder>

          <Sphere
            args={[0.11, 12, 12]}
            position={[x, -1.1, 0.06]}
          >
            <meshPhysicalMaterial
              color="#f472b6"
              roughness={0.3}
            />
          </Sphere>
        </group>
      ))}

      <Sphere args={[0.36, 32, 32]} position={[0, 0.72, 0]}>
        <meshPhysicalMaterial
          color="#fde68a"
          roughness={0.4}
        />
      </Sphere>

      <Sphere
        args={[0.38, 32, 32]}
        position={[0, 0.82, -0.05]}
      >
        <meshPhysicalMaterial
          color="#1c0533"
          roughness={0.6}
        />
      </Sphere>

      <Sphere
        args={[0.32, 16, 16]}
        position={[0, 0.88, 0.25]}
      >
        <meshPhysicalMaterial
          color="#1c0533"
          roughness={0.6}
        />
      </Sphere>

      {[-0.12, 0.12].map((x, i) => (
        <group
          key={i}
          position={[x, 0.78, 0.33]}
        >
          <Sphere args={[0.075, 16, 16]}>
            <meshBasicMaterial color="#1c0533" />
          </Sphere>

          <Sphere
            args={[0.028, 8, 8]}
            position={[0.02, 0.02, 0.05]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>

          <Cylinder
            args={[0.003, 0.003, 0.06, 4]}
            position={[0, 0.07, 0.02]}
            rotation={[0, 0, 0.3]}
          >
            <meshBasicMaterial color="#1c0533" />
          </Cylinder>
        </group>
      ))}

      {[-0.2, 0.2].map((x, i) => (
        <Sphere
          key={i}
          args={[0.055, 8, 8]}
          position={[x, 0.7, 0.32]}
        >
          <meshBasicMaterial
            color="#fb7185"
            transparent
            opacity={0.65}
          />
        </Sphere>
      ))}

      <Sphere
        args={[0.03, 8, 8]}
        position={[0, 0.72, 0.37]}
      >
        <meshBasicMaterial color="#f59e0b" />
      </Sphere>

      <mesh position={[0, 0.6, 0.36]}>
        <torusGeometry
          args={[0.09, 0.018, 8, 20, Math.PI]}
        />
        <meshBasicMaterial color="#1c0533" />
      </mesh>

      <Torus
        args={[0.1, 0.03, 8, 20]}
        position={[0, 1.0, -0.22]}
        rotation={[0.5, 0, 0]}
      >
        <meshStandardMaterial
          color="#f472b6"
          emissive="#f472b6"
          emissiveIntensity={0.5}
        />
      </Torus>

      {[-0.32, 0.32].map((x, i) => (
        <group key={i}>
          <Cylinder
            args={[0.07, 0.06, 0.42, 8]}
            position={[x * 1.3, 0.12, 0.05]}
            rotation={[
              0.1,
              0,
              i === 0 ? 0.4 : -0.4,
            ]}
          >
            <meshPhysicalMaterial
              color="#fde68a"
              roughness={0.4}
            />
          </Cylinder>

          <Sphere
            args={[0.08, 8, 8]}
            position={[x * 1.55, -0.1, 0.12]}
          >
            <meshPhysicalMaterial
              color="#fde68a"
              roughness={0.4}
            />
          </Sphere>
        </group>
      ))}

      <group
        ref={backpack}
        position={[0, 0.12, -0.42]}
      >
        <Box args={[0.28, 0.32, 0.12]}>
          <meshPhysicalMaterial
            color="#f97316"
            roughness={0.4}
            emissive="#ea580c"
            emissiveIntensity={0.1}
          />
        </Box>

        {[-0.06, 0.06].map((x, i) => (
          <Sphere
            key={i}
            args={[0.025, 8, 8]}
            position={[x, 0.04, 0.07]}
          >
            <meshBasicMaterial color="#1c0533" />
          </Sphere>
        ))}

        <mesh position={[0, -0.04, 0.07]}>
          <torusGeometry
            args={[0.04, 0.01, 6, 12, Math.PI]}
          />
          <meshBasicMaterial color="#1c0533" />
        </mesh>

        {[
          [-0.08, 0.1],
          [0.08, 0.1],
          [0, -0.08],
        ].map(([x, y], i) => (
          <Sphere
            key={i}
            args={[0.018, 6, 6]}
            position={[x, y, 0.07]}
          >
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={1}
            />
          </Sphere>
        ))}
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   SHIN CHAN
───────────────────────────────────────────── */
export function ShinChanCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.85) * 0.1;
      root.current.rotation.y = t * 0.15;
    }

    if (armL.current) {
      armL.current.rotation.z = Math.sin(t * 2) * 0.4;
    }

    if (armR.current) {
      armR.current.rotation.z = -Math.sin(t * 2) * 0.4;
    }
  });

  return (
    <group ref={root} position={position}>
      <Cylinder
        args={[0.22, 0.28, 0.62, 12]}
        position={[0, -0.05, 0]}
      >
        <meshPhysicalMaterial
          color="#ef4444"
          roughness={0.4}
          emissive="#dc2626"
          emissiveIntensity={0.1}
        />
      </Cylinder>

      <Cylinder
        args={[0.28, 0.3, 0.22, 12]}
        position={[0, -0.45, 0]}
      >
        <meshPhysicalMaterial
          color="#fbbf24"
          roughness={0.4}
        />
      </Cylinder>

      {[-0.12, 0.12].map((x, i) => (
        <group key={i}>
          <Cylinder
            args={[0.09, 0.09, 0.4, 8]}
            position={[x, -0.76, 0]}
          >
            <meshPhysicalMaterial
              color="#fde68a"
              roughness={0.4}
            />
          </Cylinder>

          <Sphere
            args={[0.1, 12, 12]}
            position={[x, -0.98, 0.05]}
          >
            <meshPhysicalMaterial
              color="#1c0533"
              roughness={0.4}
            />
          </Sphere>
        </group>
      ))}

      <Sphere args={[0.38, 32, 32]} position={[0, 0.56, 0]}>
        <meshPhysicalMaterial
          color="#fde68a"
          roughness={0.35}
        />
      </Sphere>

      <Sphere
        args={[0.4, 24, 24]}
        position={[0, 0.7, -0.04]}
      >
        <meshPhysicalMaterial
          color="#1c0533"
          roughness={0.7}
        />
      </Sphere>

      <Cylinder
        args={[0.08, 0.04, 0.18, 6]}
        position={[0, 0.98, 0.24]}
        rotation={[-0.5, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#1c0533"
          roughness={0.7}
        />
      </Cylinder>

      {[-0.12, 0.12].map((x, i) => (
        <group
          key={i}
          position={[x, 0.62, 0.35]}
        >
          <Sphere args={[0.04, 10, 10]}>
            <meshBasicMaterial color="#1c0533" />
          </Sphere>

          <Sphere
            args={[0.014, 6, 6]}
            position={[0.01, 0.01, 0.03]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      ))}

      {[-0.12, 0.12].map((x, i) => (
        <Cylinder
          key={i}
          args={[0.02, 0.02, 0.1, 6]}
          position={[x, 0.68, 0.34]}
          rotation={[
            0,
            0,
            i === 0 ? 0.3 : -0.3,
          ]}
        >
          <meshBasicMaterial color="#1c0533" />
        </Cylinder>
      ))}

      <Sphere
        args={[0.055, 10, 10]}
        position={[0, 0.56, 0.4]}
      >
        <meshBasicMaterial color="#f59e0b" />
      </Sphere>

      <mesh position={[0, 0.44, 0.38]}>
        <torusGeometry
          args={[0.1, 0.024, 8, 20, Math.PI * 1.1]}
        />
        <meshBasicMaterial color="#1c0533" />
      </mesh>

      <group ref={armL} position={[-0.32, 0.08, 0]}>
        <Cylinder
          args={[0.08, 0.07, 0.45, 8]}
          rotation={[0.1, 0, 0.5]}
        >
          <meshPhysicalMaterial
            color="#fde68a"
            roughness={0.4}
          />
        </Cylinder>

        <Sphere
          args={[0.09, 10, 10]}
          position={[-0.14, -0.2, 0.05]}
        >
          <meshPhysicalMaterial
            color="#fde68a"
            roughness={0.4}
          />
        </Sphere>
      </group>

      <group ref={armR} position={[0.32, 0.08, 0]}>
        <Cylinder
          args={[0.08, 0.07, 0.45, 8]}
          rotation={[0.1, 0, -0.5]}
        >
          <meshPhysicalMaterial
            color="#fde68a"
            roughness={0.4}
          />
        </Cylinder>

        <Sphere
          args={[0.09, 10, 10]}
          position={[0.14, -0.2, 0.05]}
        >
          <meshPhysicalMaterial
            color="#fde68a"
            roughness={0.4}
          />
        </Sphere>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   JACKIE CHAN
───────────────────────────────────────────── */
export function JackieChanCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const kickLeg = useRef<THREE.Group>(null);
  const punchArm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t) * 0.12;
      root.current.rotation.y =
        Math.sin(t * 0.4) * 0.3;
    }

    if (kickLeg.current) {
      kickLeg.current.rotation.x =
        Math.sin(t * 1.5) * 0.4;
    }

    if (punchArm.current) {
      punchArm.current.rotation.z =
        -0.3 + Math.sin(t * 2) * 0.6;
    }
  });

  return (
    <group ref={root} position={position}>
      <Cylinder
        args={[0.22, 0.3, 0.75, 12]}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.5}
          metalness={0.1}
        />
      </Cylinder>

      {[-0.1, 0.1].map((x, i) => (
        <Sphere
          key={i}
          args={[0.1, 12, 12]}
          position={[x, 0.15, 0.22]}
        >
          <meshPhysicalMaterial
            color="#0f172a"
            roughness={0.4}
          />
        </Sphere>
      ))}

      <Torus
        args={[0.24, 0.04, 8, 30]}
        position={[0, -0.28, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.8}
          roughness={0.1}
          emissive="#f59e0b"
          emissiveIntensity={0.3}
        />
      </Torus>

      <Cylinder
        args={[0.26, 0.28, 0.38, 12]}
        position={[0, -0.54, 0]}
      >
        <meshPhysicalMaterial
          color="#1e3a5f"
          roughness={0.5}
        />
      </Cylinder>

      {[-0.13, 0.13].map((x, i) => (
        <group key={i}>
          <Cylinder
            args={[0.1, 0.09, 0.48, 8]}
            position={[x, -0.88, 0]}
          >
            <meshPhysicalMaterial
              color="#1e3a5f"
              roughness={0.5}
            />
          </Cylinder>

          <Sphere
            args={[0.11, 12, 12]}
            position={[x, -1.14, 0.06]}
          >
            <meshPhysicalMaterial
              color="#1c0533"
              roughness={0.3}
              metalness={0.5}
            />
          </Sphere>
        </group>
      ))}

      <group
        ref={kickLeg}
        position={[0.2, -0.65, 0]}
      >
        <Cylinder
          args={[0.1, 0.09, 0.5, 8]}
          rotation={[0.5, 0, 0.3]}
        >
          <meshPhysicalMaterial
            color="#1e3a5f"
            roughness={0.5}
          />
        </Cylinder>
      </group>

      <Sphere args={[0.3, 32, 32]} position={[0, 0.68, 0]}>
        <meshPhysicalMaterial
          color="#f5cba7"
          roughness={0.4}
        />
      </Sphere>

      <Sphere
        args={[0.31, 24, 24]}
        position={[0, 0.8, -0.06]}
      >
        <meshPhysicalMaterial
          color="#1c0533"
          roughness={0.6}
        />
      </Sphere>

      {[-0.1, 0.1].map((x, i) => (
        <group
          key={i}
          position={[x, 0.72, 0.27]}
        >
          <Sphere args={[0.055, 12, 12]}>
            <meshBasicMaterial color="#1c0533" />
          </Sphere>

          <Sphere
            args={[0.02, 8, 8]}
            position={[0.01, 0.01, 0.04]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      ))}

      {[-0.1, 0.1].map((x, i) => (
        <Cylinder
          key={i}
          args={[0.016, 0.016, 0.08, 4]}
          position={[x, 0.79, 0.26]}
          rotation={[
            0,
            0,
            i === 0 ? -0.5 : 0.5,
          ]}
        >
          <meshBasicMaterial color="#1c0533" />
        </Cylinder>
      ))}

      <Sphere
        args={[0.035, 8, 8]}
        position={[0, 0.67, 0.32]}
      >
        <meshBasicMaterial color="#e8a87c" />
      </Sphere>

      <mesh position={[0, 0.58, 0.3]}>
        <torusGeometry
          args={[0.08, 0.018, 8, 20, Math.PI * 0.8]}
        />
        <meshBasicMaterial color="#1c0533" />
      </mesh>

      <Cylinder
        args={[0.1, 0.09, 0.5, 8]}
        position={[-0.38, 0.18, 0.1]}
        rotation={[0.2, 0, 0.5]}
      >
        <meshPhysicalMaterial
          color="#f5cba7"
          roughness={0.4}
        />
      </Cylinder>

      <group
        ref={punchArm}
        position={[0.38, 0.18, 0.1]}
      >
        <Cylinder
          args={[0.1, 0.09, 0.5, 8]}
          rotation={[0.2, 0, -0.5]}
        >
          <meshPhysicalMaterial
            color="#f5cba7"
            roughness={0.4}
          />
        </Cylinder>

        <Box
          args={[0.15, 0.12, 0.12]}
          position={[0.22, -0.22, 0.05]}
        >
          <meshPhysicalMaterial
            color="#f5cba7"
            roughness={0.4}
          />
        </Box>
      </group>

      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;

        return (
          <Sphere
            key={i}
            args={[0.025, 6, 6]}
            position={[
              Math.cos(a) * 0.85,
              0.3 + Math.sin(a) * 0.3,
              0.1,
            ]}
          >
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={2}
            />
          </Sphere>
        );
      })}
    </group>
  );
}

/* ─────────────────────────────────────────────
   SPIDER-MAN
───────────────────────────────────────────── */
export function SpidermanCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const webArm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 1.1) * 0.2;
      root.current.rotation.y =
        Math.sin(t * 0.5) * 0.3;
    }

    if (webArm.current) {
      webArm.current.rotation.z =
        -0.5 + Math.sin(t * 1.5) * 0.4;
    }
  });

  return (
    <group ref={root} position={position}>
      <Cylinder
        args={[0.22, 0.3, 0.75, 12]}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#ef4444"
          roughness={0.3}
          metalness={0.1}
          emissive="#dc2626"
          emissiveIntensity={0.1}
        />
      </Cylinder>

      <Torus
        args={[0.24, 0.015, 8, 30]}
        position={[0, 0.15, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#1d4ed8"
          emissive="#1d4ed8"
          emissiveIntensity={0.3}
        />
      </Torus>

      <Torus
        args={[0.24, 0.015, 8, 30]}
        position={[0, -0.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#1d4ed8"
          emissive="#1d4ed8"
          emissiveIntensity={0.3}
        />
      </Torus>

      <Cylinder
        args={[0.28, 0.3, 0.35, 12]}
        position={[0, -0.54, 0]}
      >
        <meshPhysicalMaterial
          color="#1d4ed8"
          roughness={0.35}
        />
      </Cylinder>

      {[-0.13, 0.13].map((x, i) => (
        <group key={i}>
          <Cylinder
            args={[0.1, 0.09, 0.48, 8]}
            position={[x, -0.88, 0]}
          >
            <meshPhysicalMaterial
              color="#1d4ed8"
              roughness={0.35}
            />
          </Cylinder>

          <Sphere
            args={[0.11, 12, 12]}
            position={[x, -1.14, 0.05]}
          >
            <meshPhysicalMaterial
              color="#ef4444"
              roughness={0.3}
            />
          </Sphere>
        </group>
      ))}

      <Sphere args={[0.32, 32, 32]} position={[0, 0.68, 0]}>
        <meshPhysicalMaterial
          color="#ef4444"
          roughness={0.25}
          metalness={0.05}
          emissive="#dc2626"
          emissiveIntensity={0.15}
        />
      </Sphere>

      <Sphere
        args={[0.33, 24, 24]}
        position={[0, 0.62, -0.06]}
      >
        <meshPhysicalMaterial
          color="#1d4ed8"
          roughness={0.3}
        />
      </Sphere>

      {[-0.12, 0.12].map((x, i) => (
        <group
          key={i}
          position={[x, 0.74, 0.28]}
        >
          <mesh>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#e2e8f0"
              emissiveIntensity={0.5}
            />
          </mesh>

          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.8}
              roughness={0}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}

      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(a) * 0.28,
              0.68 + Math.sin(a) * 0.15,
              0.2,
            ]}
          >
            <cylinderGeometry
              args={[0.004, 0.004, 0.35, 4]}
            />
            <meshBasicMaterial color="#7f1d1d" />
          </mesh>
        );
      })}

      <Sphere
        args={[0.05, 8, 8]}
        position={[0, 0.22, 0.25]}
      >
        <meshStandardMaterial
          color="#1c0533"
          emissive="#1c0533"
          emissiveIntensity={0.5}
        />
      </Sphere>

      <Cylinder
        args={[0.09, 0.08, 0.5, 8]}
        position={[-0.35, 0.18, 0.1]}
        rotation={[0.2, 0, 0.5]}
      >
        <meshPhysicalMaterial
          color="#ef4444"
          roughness={0.25}
        />
      </Cylinder>

      <group
        ref={webArm}
        position={[0.35, 0.18, 0.1]}
      >
        <Cylinder
          args={[0.09, 0.08, 0.5, 8]}
          rotation={[0.2, 0, -0.6]}
        >
          <meshPhysicalMaterial
            color="#ef4444"
            roughness={0.25}
          />
        </Cylinder>

        <Sphere
          args={[0.09, 10, 10]}
          position={[0.25, -0.28, 0.1]}
        >
          <meshPhysicalMaterial
            color="#ef4444"
            roughness={0.25}
          />
        </Sphere>

        <Cylinder
          args={[0.008, 0.004, 0.8, 4]}
          position={[0.4, -0.45, 0.2]}
          rotation={[-0.3, 0, -0.4]}
        >
          <meshStandardMaterial
            color="#e2e8f0"
            transparent
            opacity={0.7}
          />
        </Cylinder>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   SUPERMAN
───────────────────────────────────────────── */
export function SupermanCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const cape = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.8) * 0.22;
      root.current.rotation.y =
        Math.sin(t * 0.3) * 0.2;
    }

    if (cape.current) {
      cape.current.rotation.x =
        Math.sin(t * 1.2) * 0.15;
      cape.current.rotation.z =
        Math.sin(t * 0.8) * 0.08;
    }
  });

  return (
    <group ref={root} position={position}>
      {/* Body — blue suit */}
      <Cylinder
        args={[0.24, 0.32, 0.78, 12]}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#1d4ed8"
          roughness={0.3}
          metalness={0.1}
          emissive="#1e40af"
          emissiveIntensity={0.15}
        />
      </Cylinder>

      {/* S shield on chest */}
      <Box
        args={[0.22, 0.22, 0.06]}
        position={[0, 0.18, 0.27]}
      >
        <meshPhysicalMaterial
          color="#fbbf24"
          roughness={0.2}
          metalness={0.5}
          emissive="#f59e0b"
          emissiveIntensity={0.4}
        />
      </Box>

      <Box
        args={[0.12, 0.12, 0.08]}
        position={[0, 0.18, 0.31]}
      >
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.5}
        />
      </Box>

      <Cylinder
        args={[0.26, 0.3, 0.22, 12]}
        position={[0, -0.46, 0]}
      >
        <meshPhysicalMaterial
          color="#ef4444"
          roughness={0.35}
        />
      </Cylinder>

      {[-0.13, 0.13].map((x, i) => (
        <group key={i}>
          <Cylinder
            args={[0.11, 0.1, 0.5, 8]}
            position={[x, -0.85, 0]}
          >
            <meshPhysicalMaterial
              color="#1d4ed8"
              roughness={0.3}
            />
          </Cylinder>

          <Sphere
            args={[0.12, 12, 12]}
            position={[x, -1.12, 0.06]}
          >
            <meshPhysicalMaterial
              color="#1d4ed8"
              roughness={0.3}
            />
          </Sphere>
        </group>
      ))}

      {/* Cape */}
      <mesh
        ref={cape}
        position={[0, 0.25, -0.38]}
      >
        <torusGeometry
          args={[0.5, 0.2, 6, 14, Math.PI * 1.3]}
        />
        <meshPhysicalMaterial
          color="#ef4444"
          side={THREE.DoubleSide}
          roughness={0.5}
          emissive="#dc2626"
          emissiveIntensity={0.15}
        />
      </mesh>

      <Sphere args={[0.32, 32, 32]} position={[0, 0.72, 0]}>
        <meshPhysicalMaterial
          color="#f5cba7"
          roughness={0.4}
        />
      </Sphere>

      <Sphere
        args={[0.33, 24, 24]}
        position={[0, 0.84, -0.05]}
      >
        <meshPhysicalMaterial
          color="#1c0533"
          roughness={0.6}
        />
      </Sphere>

      <Cylinder
        args={[0.04, 0.02, 0.2, 6]}
        position={[0.12, 0.92, 0.22]}
        rotation={[0.8, 0.3, 0]}
      >
        <meshPhysicalMaterial
          color="#1c0533"
          roughness={0.7}
        />
      </Cylinder>

      {[-0.1, 0.1].map((x, i) => (
        <group
          key={i}
          position={[x, 0.76, 0.28]}
        >
          <Sphere args={[0.06, 12, 12]}>
            <meshBasicMaterial color="#1c0533" />
          </Sphere>

          <Sphere
            args={[0.024, 8, 8]}
            position={[0.01, 0.01, 0.04]}
          >
            <meshBasicMaterial color="#60a5fa" />
          </Sphere>

          <Sphere
            args={[0.01, 6, 6]}
            position={[0.015, 0.015, 0.06]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      ))}

      <Sphere
        args={[0.14, 12, 12]}
        position={[0, 0.54, 0.22]}
      >
        <meshPhysicalMaterial
          color="#f5cba7"
          roughness={0.4}
        />
      </Sphere>

      <mesh position={[0, 0.59, 0.33]}>
        <torusGeometry
          args={[0.07, 0.018, 8, 16, Math.PI * 0.9]}
        />
        <meshBasicMaterial color="#7c3030" />
      </mesh>

      <Cylinder
        args={[0.11, 0.09, 0.52, 8]}
        position={[-0.38, 0.2, 0.08]}
        rotation={[0.15, 0, 0.45]}
      >
        <meshPhysicalMaterial
          color="#1d4ed8"
          roughness={0.3}
        />
      </Cylinder>

      <Cylinder
        args={[0.11, 0.09, 0.52, 8]}
        position={[0.38, 0.2, 0.08]}
        rotation={[0.15, 0, -0.45]}
      >
        <meshPhysicalMaterial
          color="#1d4ed8"
          roughness={0.3}
        />
      </Cylinder>

      <Sphere
        args={[0.1, 12, 12]}
        position={[-0.62, 0.0, 0.15]}
      >
        <meshPhysicalMaterial
          color="#f5cba7"
          roughness={0.4}
        />
      </Sphere>

      <Sphere
        args={[0.1, 12, 12]}
        position={[0.62, 0.0, 0.15]}
      >
        <meshPhysicalMaterial
          color="#f5cba7"
          roughness={0.4}
        />
      </Sphere>

      <Sphere
        args={[0.9, 16, 16]}
        position={[0, 0.1, 0]}
      >
        <meshStandardMaterial
          color="#fbbf24"
          transparent
          opacity={0.04}
          emissive="#fbbf24"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </group>
  );
}

/* ─────────────────────────────────────────────
   DRAGON — original
───────────────────────────────────────────── */
export function DragonCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const flame = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.7) * 0.14;
      root.current.rotation.y =
        Math.sin(t * 0.25) * 0.3;
    }

    if (tail.current) {
      tail.current.rotation.z =
        Math.sin(t * 1.5) * 0.3;
    }

    if (wingL.current) {
      wingL.current.rotation.z =
        0.4 + Math.sin(t * 2.5) * 0.35;
    }

    if (wingR.current) {
      wingR.current.rotation.z =
        -0.4 - Math.sin(t * 2.5) * 0.35;
    }

    if (flame.current) {
      flame.current.scale.setScalar(
        0.8 + Math.sin(t * 4) * 0.3
      );
    }
  });

  return (
    <group ref={root} position={position}>
      <Sphere args={[0.52, 24, 24]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#0f766e"
          roughness={0.3}
          metalness={0.2}
          emissive="#0d9488"
          emissiveIntensity={0.2}
        />
      </Sphere>

      <Sphere
        args={[0.34, 16, 16]}
        position={[0, -0.08, 0.32]}
      >
        <meshPhysicalMaterial
          color="#fbbf24"
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>

      <Cylinder
        args={[0.22, 0.28, 0.4, 10]}
        position={[0.12, 0.55, 0.1]}
        rotation={[0.3, 0, -0.2]}
      >
        <meshPhysicalMaterial
          color="#0f766e"
          roughness={0.3}
          metalness={0.2}
        />
      </Cylinder>

      <Sphere
        args={[0.35, 24, 24]}
        position={[0.22, 0.92, 0.18]}
      >
        <meshPhysicalMaterial
          color="#0f766e"
          roughness={0.3}
          metalness={0.2}
          emissive="#0d9488"
          emissiveIntensity={0.15}
        />
      </Sphere>

      <Sphere
        args={[0.2, 16, 16]}
        position={[0.44, 0.85, 0.3]}
      >
        <meshPhysicalMaterial
          color="#134e4a"
          roughness={0.35}
        />
      </Sphere>

      {[0.05, -0.12].map((z, i) => (
        <group
          key={i}
          position={[0.35, 0.98, 0.25 + z]}
        >
          <Sphere args={[0.09, 16, 16]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>

          <Sphere
            args={[0.055, 12, 12]}
            position={[0.04, 0, 0.02]}
          >
            <meshBasicMaterial color="#fbbf24" />
          </Sphere>

          <Sphere
            args={[0.03, 8, 8]}
            position={[0.06, 0, 0.04]}
          >
            <meshBasicMaterial color="#1c0533" />
          </Sphere>
        </group>
      ))}

      <group
        ref={tail}
        position={[-0.45, -0.2, -0.2]}
      >
        <Cylinder
          args={[0.14, 0.04, 0.7, 8]}
          rotation={[0.3, 0, -0.7]}
        >
          <meshPhysicalMaterial
            color="#0f766e"
            roughness={0.3}
          />
        </Cylinder>

        <Cone
          args={[0.1, 0.25, 6]}
          position={[-0.35, -0.28, 0]}
          rotation={[0, 0, -0.8]}
        >
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.8}
            roughness={0.1}
          />
        </Cone>
      </group>

      <mesh
        ref={wingL}
        position={[-0.5, 0.38, -0.15]}
        rotation={[0.2, 0.2, 0.6]}
      >
        <torusGeometry
          args={[0.55, 0.06, 6, 16, Math.PI * 1.1]}
        />
        <meshPhysicalMaterial
          color="#0d9488"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>

      <mesh
        ref={wingR}
        position={[0.5, 0.38, -0.15]}
        rotation={[0.2, -0.2, -0.6]}
      >
        <torusGeometry
          args={[0.55, 0.06, 6, 16, Math.PI * 1.1]}
        />
        <meshPhysicalMaterial
          color="#0d9488"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>

      <mesh
        ref={flame}
        position={[0.68, 0.82, 0.38]}
      >
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#f97316"
          emissiveIntensity={2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   WIZARD
───────────────────────────────────────────── */
export function WizardCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const staff = useRef<THREE.Group>(null);
  const orb = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.75) * 0.15;
      root.current.rotation.y = t * 0.12;
    }

    if (staff.current) {
      staff.current.rotation.z =
        Math.sin(t * 1.2) * 0.18;
    }

    if (orb.current) {
      orb.current.rotation.y = t * 2;
    }
  });

  return (
    <group ref={root} position={position}>
      <Cylinder
        args={[0.12, 0.48, 1.1, 10]}
        position={[0, -0.15, 0]}
      >
        <meshPhysicalMaterial
          color="#7c3aed"
          roughness={0.65}
          emissive="#6d28d9"
          emissiveIntensity={0.2}
        />
      </Cylinder>

      <Torus
        args={[0.2, 0.03, 8, 30]}
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={1}
          roughness={0}
          emissive="#fbbf24"
          emissiveIntensity={0.5}
        />
      </Torus>

      <Sphere args={[0.3, 32, 32]} position={[0, 0.8, 0]}>
        <meshPhysicalMaterial
          color="#fde68a"
          roughness={0.5}
        />
      </Sphere>

      <Sphere
        args={[0.22, 16, 16]}
        position={[0, 0.62, 0.18]}
      >
        <meshPhysicalMaterial
          color="#e2e8f0"
          roughness={0.7}
        />
      </Sphere>

      {[-0.1, 0.1].map((x, i) => (
        <group
          key={i}
          position={[x, 0.84, 0.27]}
        >
          <Sphere args={[0.05, 12, 12]}>
            <meshBasicMaterial color="#1c1c3a" />
          </Sphere>

          <Sphere
            args={[0.018, 8, 8]}
            position={[0.01, 0.01, 0.03]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      ))}

      <Cylinder
        args={[0, 0.3, 0.72, 10]}
        position={[0, 1.22, 0]}
      >
        <meshPhysicalMaterial
          color="#4c1d95"
          roughness={0.6}
          emissive="#6d28d9"
          emissiveIntensity={0.2}
        />
      </Cylinder>

      <Cylinder
        args={[0.42, 0.42, 0.05, 20]}
        position={[0, 0.88, 0]}
      >
        <meshPhysicalMaterial
          color="#1e1b4b"
          roughness={0.5}
        />
      </Cylinder>

      <group
        ref={staff}
        position={[0.58, 0.3, 0.1]}
      >
        <Cylinder
          args={[0.025, 0.025, 1.1, 8]}
        >
          <meshStandardMaterial
            color="#92400e"
            roughness={0.7}
            metalness={0.2}
          />
        </Cylinder>

        <mesh ref={orb} position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <MeshDistortMaterial
            color="#8b5cf6"
            distort={0.6}
            speed={2}
            emissive="#8b5cf6"
            emissiveIntensity={1.2}
            transparent
            opacity={0.9}
          />
        </mesh>

        <Torus
          args={[0.16, 0.012, 6, 30]}
          position={[0, 0.65, 0]}
          rotation={[0.5, 0, 0]}
        >
          <meshStandardMaterial
            color="#c4b5fd"
            emissive="#c4b5fd"
            emissiveIntensity={0.6}
          />
        </Torus>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   PHOENIX — original
───────────────────────────────────────────── */
export function PhoenixCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const wL = useRef<THREE.Mesh>(null);
  const wR = useRef<THREE.Mesh>(null);
  const tailF = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t) * 0.2;
      root.current.rotation.y =
        Math.sin(t * 0.4) * 0.3;
    }

    if (wL.current) {
      wL.current.rotation.z =
        0.5 + Math.sin(t * 3) * 0.5;
    }

    if (wR.current) {
      wR.current.rotation.z =
        -0.5 - Math.sin(t * 3) * 0.5;
    }

    if (tailF.current) {
      tailF.current.rotation.z =
        Math.sin(t * 1.8) * 0.25;
    }
  });

  return (
    <group ref={root} position={position}>
      <Sphere args={[0.42, 24, 24]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#dc2626"
          roughness={0.25}
          emissive="#ef4444"
          emissiveIntensity={0.4}
          metalness={0.15}
        />
      </Sphere>

      <Sphere
        args={[0.28, 16, 16]}
        position={[0, -0.05, 0.3]}
      >
        <meshPhysicalMaterial
          color="#fbbf24"
          roughness={0.3}
          emissive="#f59e0b"
          emissiveIntensity={0.3}
        />
      </Sphere>

      <Sphere
        args={[0.28, 24, 24]}
        position={[0.1, 0.85, 0.14]}
      >
        <meshPhysicalMaterial
          color="#dc2626"
          roughness={0.25}
          emissive="#ef4444"
          emissiveIntensity={0.35}
        />
      </Sphere>

      <Cone
        args={[0.05, 0.2, 6]}
        position={[0.3, 0.82, 0.25]}
        rotation={[0.3, 0, -1.3]}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.8}
          roughness={0.1}
        />
      </Cone>

      <mesh
        ref={wL}
        position={[-0.52, 0.15, -0.1]}
        rotation={[0.15, 0.25, 0.5]}
      >
        <torusGeometry
          args={[0.52, 0.055, 6, 16, Math.PI * 1.2]}
        />
        <meshPhysicalMaterial
          color="#f97316"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          emissive="#f97316"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh
        ref={wR}
        position={[0.52, 0.15, -0.1]}
        rotation={[0.15, -0.25, -0.5]}
      >
        <torusGeometry
          args={[0.52, 0.055, 6, 16, Math.PI * 1.2]}
        />
        <meshPhysicalMaterial
          color="#fbbf24"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          emissive="#fbbf24"
          emissiveIntensity={0.4}
        />
      </mesh>

      <group
        ref={tailF}
        position={[-0.38, -0.2, -0.22]}
      >
        {[0, 1, 2, 3].map((i) => {
          const colors = [
            '#ef4444',
            '#f97316',
            '#fbbf24',
            '#fde68a',
          ];

          return (
            <Cone
              key={i}
              args={[
                0.06 - i * 0.01,
                0.38 + i * 0.1,
                6,
              ]}
              position={[
                -i * 0.06,
                -i * 0.1,
                i * 0.04,
              ]}
              rotation={[
                0.3,
                0,
                -0.5 - i * 0.2,
              ]}
            >
              <meshStandardMaterial
                color={colors[i]}
                emissive={colors[i]}
                emissiveIntensity={0.8}
                transparent
                opacity={0.9 - i * 0.1}
              />
            </Cone>
          );
        })}
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   ROBOT — original
───────────────────────────────────────────── */
export function RobotCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);
  const headBob = useRef<THREE.Group>(null);
  const arm1 = useRef<THREE.Group>(null);
  const arm2 = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 1.1) * 0.12;
    }

    if (headBob.current) {
      headBob.current.rotation.z =
        Math.sin(t * 0.8) * 0.12;
    }

    if (arm1.current) {
      arm1.current.rotation.z =
        Math.sin(t * 1.5) * 0.3;
    }

    if (arm2.current) {
      arm2.current.rotation.z =
        -Math.sin(t * 1.5) * 0.3;
    }
  });

  return (
    <group ref={root} position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.85, 0.45]} />
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.15}
          metalness={0.9}
          emissive="#0f172a"
          emissiveIntensity={0.1}
        />
      </mesh>

      <mesh position={[0, 0.08, 0.23]}>
        <boxGeometry args={[0.38, 0.28, 0.05]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#06b6d4"
          emissiveIntensity={0.6}
        />
      </mesh>

      <Cylinder
        args={[0.2, 0.2, 0.12, 16]}
        position={[0, -0.48, 0]}
      >
        <meshPhysicalMaterial
          color="#334155"
          roughness={0.2}
          metalness={0.85}
        />
      </Cylinder>

      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.4]} />
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      <group
        ref={arm1}
        position={[-0.45, 0.22, 0]}
      >
        <Cylinder
          args={[0.1, 0.08, 0.55, 10]}
          rotation={[0, 0, 0.3]}
        >
          <meshPhysicalMaterial
            color="#334155"
            roughness={0.2}
            metalness={0.85}
          />
        </Cylinder>

        <mesh position={[-0.15, -0.32, 0]}>
          <boxGeometry args={[0.2, 0.18, 0.16]} />
          <meshPhysicalMaterial
            color="#1e293b"
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
      </group>

      <group
        ref={arm2}
        position={[0.45, 0.22, 0]}
      >
        <Cylinder
          args={[0.1, 0.08, 0.55, 10]}
          rotation={[0, 0, -0.3]}
        >
          <meshPhysicalMaterial
            color="#334155"
            roughness={0.2}
            metalness={0.85}
          />
        </Cylinder>

        <mesh position={[0.15, -0.32, 0]}>
          <boxGeometry args={[0.2, 0.18, 0.16]} />
          <meshPhysicalMaterial
            color="#1e293b"
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
      </group>

      <group
        ref={headBob}
        position={[0, 0.72, 0]}
      >
        <mesh>
          <boxGeometry args={[0.62, 0.58, 0.5]} />
          <meshPhysicalMaterial
            color="#1e293b"
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>

        <Cylinder
          args={[0.018, 0.018, 0.28, 8]}
          position={[0, 0.43, 0]}
        >
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>

        <Sphere
          args={[0.05, 12, 12]}
          position={[0, 0.58, 0]}
        >
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={2}
          />
        </Sphere>

        <mesh position={[0, 0.06, 0.26]}>
          <boxGeometry args={[0.44, 0.14, 0.05]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>

        <mesh position={[0, -0.12, 0.26]}>
          <boxGeometry args={[0.3, 0.04, 0.04]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   UNICORN — white/rainbow cartoon unicorn
───────────────────────────────────────────── */
export function UnicornCartoon({
  position = [0, 0, 0] as [number, number, number],
}) {
  const root = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (root.current) {
      root.current.position.y =
        position[1] + Math.sin(t * 0.8) * 0.16;
      root.current.rotation.y =
        Math.sin(t * 0.3) * 0.2;
    }
  });

  return (
    <group ref={root} position={position}>
      <Sphere args={[0.55, 24, 24]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#f5f0ff"
          roughness={0.2}
          metalness={0.1}
          emissive="#e9d5ff"
          emissiveIntensity={0.15}
        />
      </Sphere>

      <Cylinder
        args={[0.2, 0.28, 0.45, 10]}
        position={[0.2, 0.55, 0.12]}
        rotation={[0.4, 0, -0.3]}
      >
        <meshPhysicalMaterial
          color="#f5f0ff"
          roughness={0.2}
        />
      </Cylinder>

      <Sphere
        args={[0.32, 24, 24]}
        position={[0.38, 0.88, 0.2]}
      >
        <meshPhysicalMaterial
          color="#f5f0ff"
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>

      {[0.06, -0.1].map((z, i) => (
        <group
          key={i}
          position={[0.5, 0.93, 0.24 + z]}
        >
          <Sphere args={[0.07, 12, 12]}>
            <meshBasicMaterial color="#1c0533" />
          </Sphere>

          <Sphere
            args={[0.025, 8, 8]}
            position={[0.02, 0.02, 0.04]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      ))}

      <mesh position={[0.38, 1.22, 0.2]}>
        <coneGeometry args={[0.055, 0.38, 8]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={1}
          roughness={0}
          emissive="#fbbf24"
          emissiveIntensity={0.7}
        />
      </mesh>

      <Torus
        args={[0.7, 0.025, 8, 60]}
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <MeshWobbleMaterial
          color="#f472b6"
          factor={0.3}
          speed={2}
          emissive="#f472b6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </Torus>
    </group>
  );
}

/* ─────────────────────────────────────────────
   CHARACTER SELECTOR
───────────────────────────────────────────── */

export type CharacterType =
  | 'fairy'
  | 'dragon'
  | 'unicorn'
  | 'wizard'
  | 'phoenix'
  | 'robot'
  | 'doraemon'
  | 'dora'
  | 'shinchan'
  | 'jackie'
  | 'spiderman'
  | 'superman';

interface CartoonCharacterProps {
  type: CharacterType;
  position?: [number, number, number];
  scale?: number;
}

export function CartoonCharacter({
  type,
  position = [0, 0, 0],
  scale = 1,
}: CartoonCharacterProps) {
  return (
    <group position={position} scale={scale}>
      {type === 'fairy' && (
        <FairyCartoon position={[0, 0, 0]} />
      )}

      {type === 'dragon' && (
        <DragonCartoon position={[0, 0, 0]} />
      )}

      {type === 'unicorn' && (
        <UnicornCartoon position={[0, 0, 0]} />
      )}

      {type === 'wizard' && (
        <WizardCartoon position={[0, 0, 0]} />
      )}

      {type === 'phoenix' && (
        <PhoenixCartoon position={[0, 0, 0]} />
      )}

      {type === 'robot' && (
        <RobotCartoon position={[0, 0, 0]} />
      )}

      {type === 'doraemon' && (
        <DoraemonCartoon position={[0, 0, 0]} />
      )}

      {type === 'dora' && (
        <DoraCartoon position={[0, 0, 0]} />
      )}

      {type === 'shinchan' && (
        <ShinChanCartoon position={[0, 0, 0]} />
      )}

      {type === 'jackie' && (
        <JackieChanCartoon position={[0, 0, 0]} />
      )}

      {type === 'spiderman' && (
        <SpidermanCartoon position={[0, 0, 0]} />
      )}

      {type === 'superman' && (
        <SupermanCartoon position={[0, 0, 0]} />
      )}
    </group>
  );
}