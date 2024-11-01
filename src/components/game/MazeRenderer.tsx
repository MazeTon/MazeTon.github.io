import Floor from "@/components/game/Floor";
import Player from "@/components/game/Player";
import Portal from "@/components/game/Portal";
import Wall from "@/components/game/Wall";
import WinningAnimation from "@/components/game/WinningAnimation";
import React from "react";
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
  const wallColor = "#6d9bb5";

  if (!maze || maze.length === 0) return null;

  return (
    <group>
      <Floor width={maze[0].length} height={maze.length} />
      {maze.map((row, y) =>
        row.map((cell, x) => (
          <group key={`${x}-${y}`} position={[x, 0, y]}>
            {cell.walls.top && (
              <Wall position={[0, 0, -0.5]} color={wallColor} />
            )}
            {cell.walls.right && (
              <Wall
                position={[0.5, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                color={wallColor}
              />
            )}
            {cell.walls.bottom && (
              <Wall position={[0, 0, 0.5]} color={wallColor} />
            )}
            {cell.walls.left && (
              <Wall
                position={[-0.5, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                color={wallColor}
              />
            )}
          </group>
        ))
      )}
      <Player
        position={new THREE.Vector3(playerPosition.x, 0, playerPosition.z)}
        isWinning={gameWon}
      />
      <Portal
        position={new THREE.Vector3(finishPosition.x, -0.7, finishPosition.y)}
        isWinning={gameWon}
      />
      {gameWon && (
        <WinningAnimation
          position={new THREE.Vector3(finishPosition.x, 1.5, finishPosition.y)}
          score={mazeSize.height * mazeSize.width}
        />
      )}
      <pointLight
        position={[finishPosition.x, 1, finishPosition.y]}
        color="limegreen"
        intensity={3}
        distance={5}
        decay={2}
        castShadow
      />
    </group>
  );
};

export default MazeRenderer;
