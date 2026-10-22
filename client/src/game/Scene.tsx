import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TableTennisEngine, BallState, PaddleState } from './physics/tableTennisEngine';
import { Table } from './entities/Table';
import { Ball } from './entities/Ball';
import { Paddle } from './entities/Paddle';
import { Arena } from './entities/Arena';

interface SceneProps {
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
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        camera={{
          position: [0, 1.15, 2.35],
          fov: 52,
          near: 0.1,
          far: 50,
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
