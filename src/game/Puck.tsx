// src/game/Puck.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Puck() {
  const ref = useRef<THREE.Mesh>(null!);

  const velocity = useRef({ x: 0.01, y: 0.007 });

  useFrame(() => {
    const puck = ref.current;
    puck.position.x += velocity.current.x;
    puck.position.y += velocity.current.y;

    // Bounce off simple hard-coded edges
    if (puck.position.x > 2 || puck.position.x < -2) {
      velocity.current.x *= -1;
    }
    if (puck.position.y > 1.2 || puck.position.y < -1.2) {
      velocity.current.y *= -1;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.05, 32]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}
