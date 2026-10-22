import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TableTennisEngine, BallState, PaddleState } from '@game-engine/tableTennisEngine';
import { Table } from './Table';
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { Arena } from './Arena';

export interface SceneProps {
  engine: TableTennisEngine;
  playerInputRef: React.MutableRefObject<{ x: number; y: number; swing: boolean }>;
}

const GameLoop: React.FC<SceneProps> = ({ engine, playerInputRef }) => {
  const ballRef = useRef<BallState>(engine.ball);
  const playerPaddleRef = useRef<PaddleState>(engine.playerPaddle);
  const opponentPaddleRef = useRef<PaddleState>(engine.opponentPaddle);

  useFrame((_, delta) => {
    // Read direct input from hand or keyboard
    const input = playerInputRef.current;
    engine.update(delta, input.x, input.y);

    // Keep refs in sync for Three.js renderers
    ballRef.current = engine.ball;
    playerPaddleRef.current = engine.playerPaddle;
    opponentPaddleRef.current = engine.opponentPaddle;
  });

  return (
    <>
      <Arena />
      <Table />
      <Ball ballRef={ballRef} />
      <Paddle paddleRef={playerPaddleRef} isOpponent={false} />
      <Paddle paddleRef={opponentPaddleRef} isOpponent={true} />
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({ engine, playerInputRef }) => {
  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden bg-[#161616]">
      <Canvas
        shadows
        camera={{
          position: [0, 1.15, 2.35],
          fov: 52,
          near: 0.1,
          far: 40,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <GameLoop engine={engine} playerInputRef={playerInputRef} />
      </Canvas>
    </div>
  );
};
