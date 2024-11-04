import Floor from "@/components/game/Floor";
import Player from "@/components/game/Player";
import Portal from "@/components/game/Portal";
import Wall from "@/components/game/Wall";
import WinningAnimation from "@/components/game/WinningAnimation";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Cell = {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
};

interface MazeRendererProps {
  maze: Cell[][];
  playerPosition: THREE.Vector3;
  finishPosition: { x: number; y: number };
  gameWon: boolean;
  mazeSize: {
    width: number;
    height: number;
  };
}

const MazeRenderer: React.FC<MazeRendererProps> = ({
  maze,
  playerPosition,
  finishPosition,
  gameWon,
  mazeSize,
}) => {
  const wallColor = useRef(getRandomDarkColor());
  const floorColor = useRef(getRandomDarkColor());
  const playerColor = useRef(getRandomLightColor());
  const portalColor = useRef(getRandomLightColor());

  useEffect(() => {
    if (gameWon) {
      wallColor.current = getRandomDarkColor();
      floorColor.current = getRandomDarkColor();
      playerColor.current = getRandomLightColor();
      portalColor.current = getRandomLightColor();
    }
  }, [gameWon]);

  if (!maze || maze.length === 0) return null;

  return (
    <group>
      <Floor
        width={maze[0].length}
        height={maze.length}
        color={floorColor.current}
      />
      {maze.map((row, y) =>
        row.map((cell, x) => (
          <group key={`${x}-${y}`} position={[x, 0, y]}>
            {cell.walls.top && (
              <Wall position={[0, 0, -0.5]} color={wallColor.current} />
            )}
            {cell.walls.right && (
              <Wall
                position={[0.5, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                color={wallColor.current}
              />
            )}
            {cell.walls.bottom && (
              <Wall position={[0, 0, 0.5]} color={wallColor.current} />
            )}
            {cell.walls.left && (
              <Wall
                position={[-0.5, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                color={wallColor.current}
              />
            )}
          </group>
        ))
      )}
      <Player
        position={new THREE.Vector3(playerPosition.x, 0, playerPosition.z)}
        isWinning={gameWon}
        color={playerColor.current}
      />
      <Portal
        position={new THREE.Vector3(finishPosition.x, 0, finishPosition.y)}
        isWinning={gameWon}
        color={portalColor.current}
      />
      <WinningAnimation
        position={new THREE.Vector3(finishPosition.x, 1.5, finishPosition.y)}
        score={mazeSize.height * mazeSize.width}
        gameWon={gameWon}
      />
      <pointLight
        position={[finishPosition.x, 1, finishPosition.y]}
        color={portalColor.current}
        intensity={30}
        distance={5}
        decay={3}
        castShadow
      />
    </group>
  );
};

function getRandomDarkColor(): string {
  const getRandomValue = () => Math.floor(Math.random() * 128) + 128;
  const r = getRandomValue();
  const g = getRandomValue();
  const b = getRandomValue();

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getRandomLightColor(): string {
  const getRandomValue = () => Math.floor(Math.random() * 128) + 64;
  const r = getRandomValue();
  const g = getRandomValue();
  const b = getRandomValue();

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default MazeRenderer;
