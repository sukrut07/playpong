import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TableTennisEngine } from '../physics/tableTennisEngine';

interface PlayerAssistCueProps {
  engine: TableTennisEngine;
  enabled: boolean;
}

export const PlayerAssistCue: React.FC<PlayerAssistCueProps> = ({ engine, enabled }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const ghostPaddleRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null);

  useFrame(() => {
    if (!enabled) {
      if (ringRef.current) ringRef.current.visible = false;
      if (ghostPaddleRef.current) ghostPaddleRef.current.visible = false;
      if (lineRef.current) lineRef.current.visible = false;
      return;
    }

    const pred = engine.getPlayerAssistancePrediction();
    if (!pred.active) {
      if (ringRef.current) ringRef.current.visible = false;
      if (ghostPaddleRef.current) ghostPaddleRef.current.visible = false;
      if (lineRef.current) lineRef.current.visible = false;
      return;
    }

    // Position ring at predicted intersection
    if (ringRef.current) {
      ringRef.current.visible = true;
      ringRef.current.position.set(pred.targetX, pred.targetY, pred.targetZ - 0.05);

      // Color based on timing cue
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (pred.timingCue === 'READY') {
        mat.color.setHex(0x00ff88); // Electric emerald
      } else if (pred.timingCue === 'EARLY') {
        mat.color.setHex(0x38bdf8); // Sky blue
      } else {
        mat.color.setHex(0xf43f5e); // Rose red
      }
    }

    // Position ghost paddle
    if (ghostPaddleRef.current) {
      ghostPaddleRef.current.visible = true;
      ghostPaddleRef.current.position.set(pred.targetX, pred.targetY, pred.targetZ);
    }

    // Update trajectory line from current ball to target
    if (lineRef.current) {
      lineRef.current.visible = true;
      const positions = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
      positions.setXYZ(0, engine.ball.x, engine.ball.y, engine.ball.z);
      positions.setXYZ(1, pred.targetX, pred.targetY, pred.targetZ);
      positions.needsUpdate = true;
    }
  });

  const lineGeo = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(6);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  return (
    <>
      {/* Target Reticle Ring */}
      <mesh ref={ringRef} visible={false}>
        <ringGeometry args={[0.07, 0.09, 32]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ghost Target Paddle Silhouette */}
      <group ref={ghostPaddleRef} visible={false}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.012, 24]} />
          <meshBasicMaterial
            color="#CCFF00"
            wireframe
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Predictive Ball Trajectory Ray */}
      {/* @ts-ignore */}
      <line ref={lineRef} geometry={lineGeo} visible={false}>
        <lineBasicMaterial
          color="#CCFF00"
          transparent
          opacity={0.4}
          linewidth={2}
          depthWrite={false}
        />
      </line>
    </>
  );
};
