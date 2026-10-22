import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BallState } from '@game-engine/tableTennisEngine';

export interface BallProps {
  ballRef: React.MutableRefObject<BallState>;
}

export const Ball: React.FC<BallProps> = ({ ballRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailLineRef = useRef<THREE.Line>(null);

  useFrame(() => {
    if (!meshRef.current || !ballRef.current) return;
    const b = ballRef.current;
    meshRef.current.position.set(b.x, b.y, b.z);

    // Update trajectory trail geometry
    if (trailLineRef.current && b.trail.length > 2) {
      const positions = new Float32Array(b.trail.length * 3);
      for (let i = 0; i < b.trail.length; i++) {
        positions[i * 3] = b.trail[i].x;
        positions[i * 3 + 1] = b.trail[i].y;
        positions[i * 3 + 2] = b.trail[i].z;
      }
      trailLineRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      trailLineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 3D Ball Sphere - High Contrast Neon Lime */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[0.02, 32, 32]} />
        <meshStandardMaterial
          color="#D9FF55"
          roughness={0.2}
          metalness={0.05}
          emissive="#c4f03a"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Trajectory Trail Ribbon */}
      <line ref={trailLineRef as any}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#D9FF55"
          transparent
          opacity={0.7}
          linewidth={2}
        />
      </line>
    </group>
  );
};
