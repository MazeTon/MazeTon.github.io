import Floor from "@/components/game/elements/Floor";
import Player from "@/components/game/elements/Player";
import Portal from "@/components/game/elements/Portal";
import WinningAnimation from "@/components/game/elements/WinningAnimation";
import { MazeProps } from "@/types/game";
import React, { useMemo } from "react";
import * as THREE from "three";

const Maze: React.FC<MazeProps> = ({
  maze,
  playerPosition,
  finishPosition,
  gameWon,
  mazeSize,
  wallColor,
  floorColor,
  playerColor,
  portalColor,
}) => {
  // Configure wall material with transparency
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: wallColor,
        transparent: true,
        opacity: 0.5,
        roughness: 1,
        metalness: 0,
      }),
    [wallColor]
  );
  const wallGeometry = useMemo(() => new THREE.BoxGeometry(1, 1.3, 0.1), []);

  // Calculate the number of wall instances required
  const wallCount = useMemo(() => {
    return maze.reduce((count, row) => {
      return (
        count +
        row.reduce((cellCount, cell) => {
          return (
            cellCount +
            (cell.walls.top ? 1 : 0) +
            (cell.walls.right ? 1 : 0) +
            (cell.walls.bottom ? 1 : 0) +
            (cell.walls.left ? 1 : 0)
          );
        }, 0)
      );
    }, 0);
  }, [maze]);

  // Create instanced mesh for walls
  const walls = useMemo(() => {
    const instancedMesh = new THREE.InstancedMesh(
      wallGeometry,
      wallMaterial,
      wallCount
    );
    let index = 0;

    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const position = new THREE.Vector3(x, 0, y);
        if (cell.walls.top) {
          const matrix = new THREE.Matrix4().makeTranslation(
            position.x,
            position.y,
            position.z - 0.5
          );
          instancedMesh.setMatrixAt(index++, matrix);
        }
        if (cell.walls.right) {
          const matrix = new THREE.Matrix4()
            .makeRotationY(Math.PI / 2)
            .setPosition(position.x + 0.5, position.y, position.z);
          instancedMesh.setMatrixAt(index++, matrix);
        }
        if (cell.walls.bottom) {
          const matrix = new THREE.Matrix4().makeTranslation(
            position.x,
            position.y,
            position.z + 0.5
          );
          instancedMesh.setMatrixAt(index++, matrix);
        }
        if (cell.walls.left) {
          const matrix = new THREE.Matrix4()
            .makeRotationY(Math.PI / 2)
            .setPosition(position.x - 0.5, position.y, position.z);
          instancedMesh.setMatrixAt(index++, matrix);
        }
      });
    });

    return instancedMesh;
  }, [maze, wallGeometry, wallMaterial, wallCount]);

  if (!maze || maze.length === 0) return null;

  return (
    <group>
      <Floor width={maze[0].length} height={maze.length} color={floorColor} />
      <primitive object={walls} />
      <Player
        position={new THREE.Vector3(playerPosition.x, 0, playerPosition.z)}
        isWinning={gameWon}
        color={playerColor}
      />
      <Portal
        position={new THREE.Vector3(finishPosition.x, 0, finishPosition.y)}
        isWinning={gameWon}
        color={portalColor}
      />
      <WinningAnimation
        position={new THREE.Vector3(finishPosition.x, 1.5, finishPosition.y)}
        score={mazeSize.height * mazeSize.width}
        gameWon={gameWon}
      />
      <pointLight
        position={[finishPosition.x, 1, finishPosition.y]}
        color={portalColor}
        intensity={30}
        distance={5}
        decay={3}
        castShadow
      />
    </group>
  );
};

export default Maze;
