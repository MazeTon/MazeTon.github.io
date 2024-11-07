"use client";

import BgGradient from "@/components/game/elements/BgGradient";
import BottomNav from "@/components/game/elements/BottomNav";
import CameraController from "@/components/game/elements/CameraController";
import Header from "@/components/game/elements/Header";
import Loading from "@/components/game/elements/Loading";
import Maze from "@/components/game/elements/Maze";
import MiniMap from "@/components/game/elements/SimpleMap";
import SwipeHint from "@/components/game/elements/SwipeHint";
import {
  initializeSounds,
  isMuted,
  playSound,
  setSoundsMute,
  toggleGlobalMute,
} from "@/lib/soundEffects";
import { Cell } from "@/types/game";
import { Canvas } from "@react-three/fiber";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const MAX_SIZE = 1000;

const Game: React.FC = () => {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPosition, setPlayerPosition] = useState(
    new THREE.Vector3(0, 0, 0)
  );
  const [finishPosition, setFinishPosition] = useState({ x: 1, y: 1 });
  const [mazeSize, setMazeSize] = useState({ width: 4, height: 4 });
  const [gameWon, setGameWon] = useState(false);
  const [resetCamera, setResetCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSimpleMap, setShowSimpleMap] = useState(false);
  const [score, setScore] = useState(0);
  const [isSoundMuted, setIsSoundMuted] = useState(isMuted());

  const toggleSimpleMap = () => setShowSimpleMap((prev) => !prev);

  const handleMuteToggle = () => {
    toggleGlobalMute();
    setSoundsMute(isMuted());
    setIsSoundMuted(isMuted());
  };

  useEffect(() => {
    if (gameWon) {
      setScore((prevScore) => prevScore + mazeSize.width * mazeSize.height);
    }
  }, [gameWon, mazeSize.height, mazeSize.width]);

  const findFarthestPoint = useCallback(
    (maze: Cell[][], startX: number, startY: number) => {
      const queue: [number, number, number][] = [[startX, startY, 0]];
      const visited = new Set<string>();
      let farthest = { x: startX, y: startY, distance: 0 };

      while (queue.length) {
        const [x, y, distance] = queue.shift()!;
        const cell = maze[y][x];
        visited.add(`${x},${y}`);

        if (distance > farthest.distance) {
          farthest = { x, y, distance };
        }

        const directions: [number, number, keyof Cell["walls"]][] = [
          [0, -1, "top"],
          [1, 0, "right"],
          [0, 1, "bottom"],
          [-1, 0, "left"],
        ];

        directions.forEach(([dx, dy, wall]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (
            typeof nx === "number" && // Ensures nx is a number
            typeof ny === "number" && // Ensures ny is a number
            nx >= 0 &&
            nx < mazeSize.width &&
            ny >= 0 &&
            ny < mazeSize.height &&
            !visited.has(`${nx},${ny}`) &&
            !cell.walls[wall]
          ) {
            queue.push([nx, ny, distance + 1]);
          }
        });
      }

      return { x: farthest.x, y: farthest.y };
    },
    [mazeSize]
  );

  const generateMaze = useCallback(() => {
    setLoading(true);

    initializeSounds();

    const newMaze: Cell[][] = Array.from({ length: mazeSize.height }, (_, y) =>
      Array.from({ length: mazeSize.width }, (_, x) => ({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
      }))
    );

    const stack: [number, number][] = [[0, mazeSize.height - 1]];
    const visited = new Set<string>();

    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      visited.add(`${x},${y}`);

      const neighbors = [
        [x, y - 1, "top", "bottom"],
        [x + 1, y, "right", "left"],
        [x, y + 1, "bottom", "top"],
        [x - 1, y, "left", "right"],
      ].filter(
        ([nx, ny]) =>
          typeof nx === "number" && // without this condition there will be a typescript error
          typeof ny === "number" && // without this condition there will be a typescript error
          nx >= 0 &&
          nx < mazeSize.width &&
          ny >= 0 &&
          ny < mazeSize.height &&
          !visited.has(`${nx},${ny}`)
      ) as [number, number, keyof Cell["walls"], keyof Cell["walls"]][];

      if (neighbors.length) {
        const [nx, ny, wall1, wall2] =
          neighbors[Math.floor(Math.random() * neighbors.length)];
        newMaze[y][x].walls[wall1] = false;
        newMaze[ny][nx].walls[wall2] = false;
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }

    setMaze(newMaze);
    setPlayerPosition(new THREE.Vector3(0, 0, mazeSize.height - 1));
    setFinishPosition(findFarthestPoint(newMaze, 0, mazeSize.height - 1));
    setGameWon(false);
    setResetCamera(true);

    setLoading(false);
  }, [mazeSize, findFarthestPoint]);

  const expandMaze = useCallback(() => {
    setMazeSize((prevSize) => {
      const canExpandWidth = prevSize.width < MAX_SIZE;
      const canExpandHeight = prevSize.height < MAX_SIZE;
      let newWidth = prevSize.width;
      let newHeight = prevSize.height;

      if (canExpandWidth && canExpandHeight) {
        if (Math.random() < 0.5) {
          newWidth += 1;
        } else {
          newHeight += 1;
        }
      } else if (canExpandWidth) {
        newWidth += 1;
      } else if (canExpandHeight) {
        newHeight += 1;
      }

      return { width: newWidth, height: newHeight };
    });
  }, []);

  useEffect(() => {
    generateMaze();
  }, [generateMaze, mazeSize]);

  useEffect(() => {
    if (gameWon) {
      const timeoutId = setTimeout(() => {
        expandMaze();
        generateMaze();
      }, 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [gameWon, generateMaze, expandMaze]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (gameWon) return;

      setPlayerPosition((prev) => {
        const newX = prev.x + dx;
        const newY = prev.z + dy;

        if (
          newX < 0 ||
          newX >= mazeSize.width ||
          newY < 0 ||
          newY >= mazeSize.height
        ) {
          playSound("collision");
          return prev;
        }

        const currentCell = maze[Math.floor(prev.z)]?.[Math.floor(prev.x)];
        if (!currentCell || !currentCell.walls) return prev;

        if (
          (dx === 1 && currentCell.walls.right) ||
          (dx === -1 && currentCell.walls.left) ||
          (dy === 1 && currentCell.walls.bottom) ||
          (dy === -1 && currentCell.walls.top)
        ) {
          playSound("collision");
          return prev;
        }

        if (newX === finishPosition.x && newY === finishPosition.y) {
          playSound("win");
          setGameWon(true);
        } else {
          playSound("move");
        }

        return new THREE.Vector3(newX, 0, newY);
      });
    },
    [maze, mazeSize, finishPosition, gameWon]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          movePlayer(0, -1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          movePlayer(1, 0);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          movePlayer(-1, 0);
          break;
      }
    },
    [movePlayer]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const SCROLL_THRESHOLD = 40;
  const THROTTLE_TIMEOUT = 300; // milliseconds
  const SWIPE_THRESHOLD = 20; // Minimum movement in pixels to be considered a swipe

  // Detect swipe gestures for mobile
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Detect swipe gestures for mobile
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      event.preventDefault();
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (event.changedTouches.length === 1) {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX.current;
        const dy = touchEndY - touchStartY.current;

        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
          event.preventDefault();

          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0) {
              movePlayer(-1, 0); // Swipe right
            } else {
              movePlayer(1, 0); // Swipe left
            }
          } else {
            // Vertical swipe
            if (dy > 0) {
              movePlayer(0, -1); // Swipe down
            } else {
              movePlayer(0, 1); // Swipe up
            }
          }
        }
      }
    },
    [movePlayer]
  );

  // Throttled scroll-based movement
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault(); // Prevent default page scroll behavior

      const now = Date.now();
      if (now - lastScrollTime.current < THROTTLE_TIMEOUT) return; // Throttle scroll events

      // Check for significant scroll threshold
      if (
        Math.abs(event.deltaY) > SCROLL_THRESHOLD ||
        Math.abs(event.deltaX) > SCROLL_THRESHOLD
      ) {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          // Vertical scroll
          if (event.deltaY > 0) {
            movePlayer(0, 1); // Scroll down
          } else {
            movePlayer(0, -1); // Scroll up
          }
        } else {
          // Horizontal scroll
          if (event.deltaX > 0) {
            movePlayer(1, 0); // Scroll right
          } else {
            movePlayer(-1, 0); // Scroll left
          }
        }

        lastScrollTime.current = now; // Update last scroll time
      }
    },
    [movePlayer]
  );

  useEffect(() => {
    const gameArea = gameAreaRef.current;

    if (gameArea) {
      // Keyboard event listener for desktop
      window.addEventListener("keydown", handleKeyDown);

      // Touch event listeners for swipe detection on mobile
      gameArea.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      gameArea.addEventListener("touchend", handleTouchEnd, { passive: false });

      // Wheel event listener for desktop scroll control
      gameArea.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        gameArea.removeEventListener("touchstart", handleTouchStart);
        gameArea.removeEventListener("touchend", handleTouchEnd);
        gameArea.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleKeyDown, handleTouchStart, handleTouchEnd, handleWheel]);

  const getRandomColor = useCallback((plus: number): string => {
    const getRandomValue = () => Math.floor(Math.random() * 128) + plus;
    const r = getRandomValue();
    const g = getRandomValue();
    const b = getRandomValue();

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }, []);

  const wallColor = useRef(getRandomColor(128));
  const floorColor = useRef(getRandomColor(128));
  const playerColor = useRef(getRandomColor(64));
  const portalColor = useRef(getRandomColor(64));

  useEffect(() => {
    if (gameWon) {
      wallColor.current = getRandomColor(128);
      floorColor.current = getRandomColor(128);
      playerColor.current = getRandomColor(64);
      portalColor.current = getRandomColor(64);
    }
  }, [gameWon, getRandomColor]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden text-white relative">
      {loading && <Loading />}
      <BgGradient />
      <SwipeHint isFirstGame={mazeSize.width === 2 && mazeSize.height === 2} />
      <Header
        score={score}
        showSimpleMap={showSimpleMap}
        isSoundMuted={isSoundMuted}
        toggleSimpleMap={toggleSimpleMap}
        handleMuteToggle={handleMuteToggle}
      />
      <div ref={gameAreaRef} className="game-area w-full h-full">
        {showSimpleMap ? (
          <MiniMap
            maze={maze}
            playerPosition={playerPosition}
            finishPosition={finishPosition}
            mazeSize={mazeSize}
            wallColor={wallColor.current}
            floorColor={floorColor.current}
            playerColor={playerColor.current}
            portalColor={portalColor.current}
          />
        ) : (
          <Canvas shadows className="absolute inset-0">
            <ambientLight intensity={0.4} />
            <spotLight
              position={[10, 15, 10]}
              angle={0.5}
              penumbra={1}
              castShadow
            />
            <Maze
              maze={maze}
              playerPosition={playerPosition}
              finishPosition={finishPosition}
              gameWon={gameWon}
              mazeSize={mazeSize}
              wallColor={wallColor.current}
              floorColor={floorColor.current}
              playerColor={playerColor.current}
              portalColor={portalColor.current}
            />
            <CameraController
              target={new THREE.Vector3(playerPosition.x, 0, playerPosition.z)}
              resetCamera={resetCamera}
              setResetCamera={setResetCamera}
            />
          </Canvas>
        )}
      </div>
      <BottomNav currentView={`play`} setCurrentView={() => {}} />
    </div>
  );
};

export default Game;
