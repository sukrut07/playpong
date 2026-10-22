import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PaddleState } from '@game-engine/tableTennisEngine';

export interface PaddleProps {
  paddleRef: React.MutableRefObject<PaddleState>;
  isOpponent?: boolean;
}

export const Paddle: React.FC<PaddleProps> = ({ paddleRef, isOpponent = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !paddleRef.current) return;
    const p = paddleRef.current;
    groupRef.current.position.set(p.x, p.y, p.z);

    // Dynamic tilt based on paddle lateral velocity
    const targetTiltZ = -p.vx * 0.08;
    const targetTiltX = isOpponent ? 0.15 : -0.15 - Math.max(-0.2, Math.min(0.2, p.vy * 0.05));

    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetTiltZ, 0.2);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTiltX, 0.2);
  });

  // Palette: Player = Mint #62F5AD with black rim; Opponent = Lavender #BDA5FF with black rim
  const frontColor = isOpponent ? '#BDA5FF' : '#62F5AD';
  const backColor = '#111111';

  return (
    <group ref={groupRef}>
      {/* Paddle Blade (Disc) */}
      <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Core Rim */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.086, 0.086, 0.009, 32]} />
          <meshStandardMaterial color="#111111" roughness={0.4} />
        </mesh>

        {/* Front Rubber Face */}
        <mesh position={[0, isOpponent ? 0.005 : -0.005, 0]} castShadow>
          <cylinderGeometry args={[0.082, 0.082, 0.003, 32]} />
          <meshStandardMaterial
            color={frontColor}
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* Back Rubber Face */}
        <mesh position={[0, isOpponent ? -0.005 : 0.005, 0]} castShadow>
          <cylinderGeometry args={[0.082, 0.082, 0.003, 32]} />
          <meshStandardMaterial
            color={backColor}
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Ergonomic Handle */}
      <group position={[0, -0.1, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.024, 0.09, 0.02]} />
          <meshStandardMaterial color="#d4a373" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.014, 0.07]} />
          <meshStandardMaterial color="#111111" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
