import React from 'react';
import * as THREE from 'three';

export const Table: React.FC = () => {
  // Table dimensions: Length = 2.74m (Z), Width = 1.525m (X), Height offset = 0
  const TABLE_WIDTH = 1.525;
  const TABLE_LENGTH = 2.74;
  const TABLE_THICKNESS = 0.04;
  const NET_HEIGHT = 0.1525;
  const NET_OVERHANG = 0.1525;

  return (
    <group position={[0, -TABLE_THICKNESS / 2, 0]}>
      {/* Table Top Surface - Sleek deep cyan esports laminate */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[TABLE_WIDTH, TABLE_THICKNESS, TABLE_LENGTH]} />
        <meshStandardMaterial
          color="#08304b"
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* Outer White Edge Lines (2cm wide) */}
      {/* Side line Left */}
      <mesh position={[-TABLE_WIDTH / 2 + 0.01, TABLE_THICKNESS / 2 + 0.001, 0]}>
        <planeGeometry args={[0.02, TABLE_LENGTH]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* Side line Right */}
      <mesh position={[TABLE_WIDTH / 2 - 0.01, TABLE_THICKNESS / 2 + 0.001, 0]}>
        <planeGeometry args={[0.02, TABLE_LENGTH]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* End line Player */}
      <mesh
        position={[0, TABLE_THICKNESS / 2 + 0.001, TABLE_LENGTH / 2 - 0.01]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[TABLE_WIDTH, 0.02]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* End line Opponent */}
      <mesh
        position={[0, TABLE_THICKNESS / 2 + 0.001, -TABLE_LENGTH / 2 + 0.01]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[TABLE_WIDTH, 0.02]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* Center Dividing Line (3mm wide) */}
      <mesh
        position={[0, TABLE_THICKNESS / 2 + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.006, TABLE_LENGTH]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* Table Net Assembly */}
      <group position={[0, TABLE_THICKNESS / 2, 0]}>
        {/* Net Mesh */}
        <mesh position={[0, NET_HEIGHT / 2, 0]} castShadow>
          <planeGeometry args={[TABLE_WIDTH + NET_OVERHANG * 2, NET_HEIGHT]} />
          <meshStandardMaterial
            color="#223344"
            transparent
            opacity={0.7}
            roughness={0.8}
            side={THREE.DoubleSide}
            wireframe={true}
          />
        </mesh>
        {/* Net Top White Cord */}
        <mesh position={[0, NET_HEIGHT, 0]}>
          <boxGeometry args={[TABLE_WIDTH + NET_OVERHANG * 2, 0.015, 0.005]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Net Posts Left and Right */}
        <mesh position={[-TABLE_WIDTH / 2 - NET_OVERHANG, NET_HEIGHT / 2, 0]}>
          <cylinderGeometry args={[0.01, 0.01, NET_HEIGHT + 0.02, 16]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[TABLE_WIDTH / 2 + NET_OVERHANG, NET_HEIGHT / 2, 0]}>
          <cylinderGeometry args={[0.01, 0.01, NET_HEIGHT + 0.02, 16]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Under-table Support Frame and Legs */}
      <group position={[0, -0.38, 0]}>
        {/* 4 Sturdy Industrial Legs */}
        {[
          [-TABLE_WIDTH / 2 + 0.12, -TABLE_LENGTH / 2 + 0.2],
          [TABLE_WIDTH / 2 - 0.12, -TABLE_LENGTH / 2 + 0.2],
          [-TABLE_WIDTH / 2 + 0.12, TABLE_LENGTH / 2 - 0.2],
          [TABLE_WIDTH / 2 - 0.12, TABLE_LENGTH / 2 - 0.2],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0, lz]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.72, 16]} />
            <meshStandardMaterial color="#0b1329" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Horizontal Bracing Rails */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[TABLE_WIDTH - 0.2, 0.04, TABLE_LENGTH - 0.4]} />
          <meshStandardMaterial color="#080e20" metalness={0.9} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
