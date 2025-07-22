// src/game/GameCanvas.tsx
import { Canvas } from '@react-three/fiber';
import Paddle from './Paddle';
import Puck from './Puck';
import { Suspense } from 'react';

export default function GameCanvas() {
  return (
    <Canvas orthographic camera={{ zoom: 100, position: [0, 0, 100] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 2, 5]} intensity={0.7} />

      <Suspense fallback={null}>
        <Paddle player="left" />
        <Paddle player="right" />
        <Puck />
      </Suspense>
    </Canvas>
  );
}
