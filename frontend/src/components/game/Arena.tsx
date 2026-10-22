import React from 'react';

export const Arena: React.FC = () => {
  return (
    <group position={[0, -0.76, 0]}>
      {/* Neo-Brutalist Arena Floor - Warm Ink */}
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 22]} />
        <meshStandardMaterial
          color="#161616"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Outer Court Boundary Rectangle - Thick Mint Border */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.25, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color="#62F5AD" opacity={0.35} transparent />
      </mesh>

      {/* Background Court Wall */}
      <mesh position={[0, 4, -7.5]}>
        <planeGeometry args={[20, 9]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.9} />
      </mesh>

      {/* Overhead Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[0, 5, 2.5]}
        intensity={1.4}
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
      {/* Accent Lights: Mint and Lavender */}
      <pointLight position={[-3, 2, 0]} intensity={0.8} color="#62F5AD" distance={7} />
      <pointLight position={[3, 2, 0]} intensity={0.8} color="#BDA5FF" distance={7} />
    </group>
  );
};
