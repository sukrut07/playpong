import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PaddleState } from '../physics/tableTennisEngine';

interface PaddleProps {
  paddleRef: React.MutableRefObject<PaddleState>;
  isOpponent?: boolean;
}

export const Paddle: React.FC<PaddleProps> = ({ paddleRef, isOpponent = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !paddleRef.current) return;
    const p = paddleRef.current;
    groupRef.current.position.set(p.x, p.y, p.z);

    // Dynamic tilt based on velocity
    const targetTiltZ = -p.vx * 0.08;
    const targetTiltX = isOpponent ? 0.15 : -0.15 - Math.max(-0.2, Math.min(0.2, p.vy * 0.05));

    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetTiltZ, 0.2);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTiltX, 0.2);
  });

  const frontColor = isOpponent ? '#00f2fe' : '#e63946'; // Red for player, cyan for opponent
  const backColor = isOpponent ? '#0077b6' : '#111827'; // Dark rubber

  return (
    <group ref={groupRef}>
      {/* Paddle Blade (Disc) */}
      <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Wooden Core */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.008, 32]} />
          <meshStandardMaterial color="#c49a6c" roughness={0.6} />
        </mesh>

        {/* Front Rubber Face (Facing opponent) */}
        <mesh position={[0, isOpponent ? 0.005 : -0.005, 0]} castShadow>
          <cylinderGeometry args={[0.083, 0.083, 0.003, 32]} />
          <meshStandardMaterial
            color={frontColor}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>

        {/* Back Rubber Face */}
        <mesh position={[0, isOpponent ? -0.005 : 0.005, 0]} castShadow>
          <cylinderGeometry args={[0.083, 0.083, 0.003, 32]} />
          <meshStandardMaterial
            color={backColor}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Ergonomic Handle */}
      <group position={[0, -0.1, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.024, 0.09, 0.02]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
        </mesh>
        {/* Handle Grip Inlay */}
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.014, 0.07]} />
          <meshStandardMaterial color="#d4a373" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
