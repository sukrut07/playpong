import React from 'react';
import * as THREE from 'three';

export const Arena: React.FC = () => {
  return (
    <group position={[0, -0.76, 0]}>
      {/* Arena Floor */}
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 24]} />
        <meshStandardMaterial
          color="#060914"
          roughness={0.65}
          metalness={0.2}
        />
      </mesh>

      {/* Court Boundary Line (Subtle neon cyan perimeter) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.8, 3.84, 64]} />
        <meshBasicMaterial color="#00f2fe" opacity={0.25} transparent />
      </mesh>

      {/* Court Inner Glow Ring */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.2, 6.25, 64]} />
        <meshBasicMaterial color="#ff5e36" opacity={0.15} transparent />
      </mesh>

      {/* Background Stadium Architectural Elements */}
      {/* Far Wall */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[24, 10]} />
        <meshStandardMaterial color="#040710" roughness={0.9} />
      </mesh>
      {/* Stadium Accent Light Strips */}
      <mesh position={[0, 6, -7.9]}>
        <planeGeometry args={[14, 0.08]} />
        <meshBasicMaterial color="#00f2fe" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0, 4.5, -7.9]}>
        <planeGeometry args={[10, 0.04]} />
        <meshBasicMaterial color="#ff5e36" opacity={0.4} transparent />
      </mesh>

      {/* Overhead Lighting Rig */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[0, 5, 2]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
      {/* Rim Lights */}
      <pointLight position={[-3, 2, 0]} intensity={0.8} color="#00f2fe" distance={8} />
      <pointLight position={[3, 2, 0]} intensity={0.8} color="#ff5e36" distance={8} />
      <pointLight position={[0, 1.5, -2]} intensity={0.6} color="#ffffff" distance={5} />
    </group>
  );
};
