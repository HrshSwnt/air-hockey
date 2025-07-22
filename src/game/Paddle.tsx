// src/game/Paddle.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  player: 'left' | 'right';
};

export default function Paddle({ player }: Props) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    // This will later be controlled by mouse/touch or network
    const targetX = player === 'left' ? -1.5 : 1.5;
    ref.current.position.x = targetX;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
      <meshStandardMaterial color={player === 'left' ? 'blue' : 'red'} />
    </mesh>
  );
}
