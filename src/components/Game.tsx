"use client";

import Frens from "@/components/Frens";
import BgGradient from "@/components/game/elements/BgGradient";
import BottomNav from "@/components/game/elements/BottomNav";
import CameraController from "@/components/game/elements/CameraController";
import Header from "@/components/game/elements/Header";
import Loading from "@/components/game/elements/Loading";
import Maze from "@/components/game/elements/Maze";
import MiniMap from "@/components/game/elements/SimpleMap";
import SwipeHint from "@/components/game/elements/SwipeHint";
import Items from "@/components/Items";
import Profile from "@/components/Profile";
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
  const [mazeId, setMazeId] = useState("");
  const [playerPosition, setPlayerPosition] = useState(
    new THREE.Vector3(0, 0, 0)
  );
  const [finishPosition, setFinishPosition] = useState({ x: 1, y: 1 });
  const [mazeSize, setMazeSize] = useState({ width: 4, height: 4 });
  const [gameWon, setGameWon] = useState(false);
  const [resetCamera, setResetCamera] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [showSimpleMap, setShowSimpleMap] = useState(false);
  const [score, setScore] = useState(0);
  const [isSoundMuted, setIsSoundMuted] = useState(isMuted());
  const [colorScheme, setColorScheme] = useState({
    wallColor: "#ffffff",
    floorColor: "#cccccc",
    playerColor: "#ff0000",
    portalColor: "#00ff00",
  });
  const [item, setItem] = useState<{
    x: number;
    y: number;
    picked: boolean;
  } | null>(null); // For items in the maze
  const [penaltyTime, setPenaltyTime] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState("play");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>({});
  const [userId, setUserId] = useState<string>("");
  const [inverse, setInverse] = useState(false);

  const mazeCompletionSent = useRef(false);

  const tgRef = useRef(window.Telegram?.WebApp);
  const initData = useRef(window.Telegram?.WebApp?.initData);

  console.log("tgRef", tgRef);

  const toggleInverse = () => setInverse((prev) => !prev);
  const toggleSimpleMap = () => setShowSimpleMap((prev) => !prev);

  const handleMuteToggle = () => {
    toggleGlobalMute();
    setSoundsMute(isMuted());
    setIsSoundMuted(isMuted());
  };

  const getStoredPosition = async (
    mazeId: string
  ): Promise<{ x: number; y: number } | null> => {
    // Define a timeout for the CloudStorage retrieval
    const cloudStoragePromise = new Promise<{ x: number; y: number } | null>(
      (resolve) => {
        if (!window.Telegram?.WebApp?.CloudStorage) {
          resolve(null);
          return;
        }

        let resolved = false;
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            console.warn("CloudStorage.getItem timed out.");
            resolve(null);
          }
        }, 5000); // Timeout after 5 seconds

        window.Telegram.WebApp.CloudStorage.getItem(mazeId, (error, value) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);

          if (error) {
            console.error("Error getting position from CloudStorage:", error);
            resolve(null);
          } else if (value) {
            try {
              resolve(JSON.parse(value) as { x: number; y: number });
            } catch (e) {
              console.error("Error parsing position from CloudStorage:", e);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      }
    );

    // Fallback to localStorage
    const localStorageFallback = (): { x: number; y: number } | null => {
      if (window.localStorage) {
        const value = window.localStorage.getItem(mazeId);
        if (value) {
          try {
            return JSON.parse(value) as { x: number; y: number };
          } catch (e) {
            console.error("Error parsing position from localStorage:", e);
          }
        }
      }
      return null;
    };

    // Wait for CloudStorage, then fallback if necessary
    return (await cloudStoragePromise) || localStorageFallback();
  };

  const savePosition = (mazeId: string, position: { x: number; y: number }) => {
    if (window.Telegram?.WebApp?.CloudStorage) {
      window.Telegram?.WebApp?.CloudStorage.setItem(
        mazeId,
        JSON.stringify(position),
        (error) => {
          if (error) {
            console.error("Error saving to CloudStorage:", error);
          }
        }
      );
    }

    if (window.localStorage) {
      window.localStorage.setItem(mazeId, JSON.stringify(position));
    }
  };

  const clearStoredPosition = (mazeId: string) => {
    if (window.Telegram?.WebApp?.CloudStorage) {
      window.Telegram?.WebApp?.CloudStorage.removeItem(mazeId, (error) => {
        if (error) {
          console.error("Error clearing CloudStorage:", error);
        }
      });
    }
    if (window.localStorage) {
      window.localStorage.removeItem(mazeId);
    }
  };

  const fetchMazeData = useCallback(async () => {
    setLoading(true);
    console.log("fetchMazeData started");
    initializeSounds();

    try {
      // Fetch data from the server
      const response = await fetch(
        "https://d2xcq5opb5.execute-api.us-east-1.amazonaws.com/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: initData.current,
            action: "get",
          }),
        }
      );

      if (response.status === 403) {
        const data = await response.json();
        if (data.remainingTime) {
          setPenaltyTime(data.remainingTime);
          return;
        } else {
          throw new Error(data.error || "Access denied");
        }
      }

      if (!response.ok) {
        throw new Error("Failed to fetch maze data");
      }

      const data = await response.json();

      console.log("data", data);

      // Extract data
      setMazeSize(data.mazeSize || { width: 2, height: 2 });
      setMaze(data.mazeMatrix || []);
      setMazeId(data.mazeId);
      setPlayerPosition(
        new THREE.Vector3(
          data.playerPosition?.x || 0,
          0,
          data.playerPosition?.y || data.mazeSize.height - 1
        )
      );
      setFinishPosition(data.finishPosition);
      setColorScheme({
        wallColor: data.wallColor,
        floorColor: data.floorColor,
        playerColor: data.playerColor,
        portalColor: data.portalColor,
      });
      setItem(data.item || null);
      setScore(data.score || 0);
      setGameWon(false);
      setResetCamera(true);

      // Extract userData and userId
      setUserData(data.userData);
      setUserId(data.userData.userId);

      console.log("Get stored position");
      // Get stored position
      const storedPosition = await getStoredPosition(data.mazeId);

      if (storedPosition) {
        setPlayerPosition(
          new THREE.Vector3(storedPosition.x, 0, storedPosition.y)
        );
      }
    } catch (error) {
      console.error("fetchMazeData error:", error);
    } finally {
      setLoading(false);
      console.log("fetchMazeData completed");
    }
  }, []);

  // Fetch maze data from the server
  useEffect(() => {
    fetchMazeData();
  }, [fetchMazeData]);

  // Sync position to CloudStorage every time it changes
  useEffect(() => {
    if (playerPosition.x === 0 && playerPosition.z === mazeSize.height - 1)
      return;

    const position = { x: playerPosition.x, y: playerPosition.z };
    console.log("Save position", mazeId, position);
    savePosition(mazeId, position);
  }, [playerPosition, mazeId, mazeSize.height]);

  const sendPositionToServer = useCallback(async () => {
    try {
      await fetch(
        "https://d2xcq5opb5.execute-api.us-east-1.amazonaws.com/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: initData.current,
            action: "move",
            position: { x: playerPosition.x, y: playerPosition.z },
          }),
        }
      );
    } catch (error) {
      console.error("Error sending position to server:", error);
    }
  }, [playerPosition.x, playerPosition.z]);

  // Send position to server every minute
  useEffect(() => {
    const interval = setInterval(() => {
      sendPositionToServer();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [sendPositionToServer]);

  const sendItemPickup = useCallback(async () => {
    try {
      await fetch(
        "https://d2xcq5opb5.execute-api.us-east-1.amazonaws.com/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: initData.current,
            action: "pickup",
            position: { x: playerPosition.x, y: playerPosition.z },
          }),
        }
      );
    } catch (error) {
      console.error("Error sending item pickup to server:", error);
    }
  }, [playerPosition.x, playerPosition.z]);

  const clearCloudStorage = useCallback(() => {
    clearStoredPosition(mazeId);
  }, [mazeId]);

  const sendMazeCompletion = useCallback(async () => {
    console.log("sendMazeCompletion started");

    try {
      const response = await fetch(
        "https://d2xcq5opb5.execute-api.us-east-1.amazonaws.com/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: initData.current,
            action: "finish",
            position: { x: playerPosition.x, y: playerPosition.z },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error sending maze completion to server:", data.error);
        // Handle the error appropriately, e.g., show a message to the user
        return;
      }

      // Set loading to true before fetching new maze data
      setLoading(true);

      // Clear stored position
      clearStoredPosition(mazeId);

      // Reset states
      setGameWon(false);
      setItem(null);

      // Fetch new maze
      await fetchMazeData();
    } catch (error) {
      console.error("Error sending maze completion to server:", error);
    } finally {
      mazeCompletionSent.current = false; // Reset the flag after completion
      console.log("sendMazeCompletion completed");
    }
  }, [fetchMazeData, mazeId, playerPosition.x, playerPosition.z]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (gameWon || loading || penaltyTime) return;

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

        const nextPosition = new THREE.Vector3(newX, 0, newY);

        // Check for item pickup
        if (item && !item.picked && newX === item.x && newY === item.y) {
          // Mark item as picked
          setItem({ ...item, picked: true });
          sendItemPickup();
        }

        // Check for reaching finish position
        if (newX === finishPosition.x && newY === finishPosition.y) {
          if (!mazeCompletionSent.current) {
            playSound("win");
            setGameWon(true);
            mazeCompletionSent.current = true;
            sendMazeCompletion();
            clearCloudStorage();
          }
        } else {
          playSound("move");
        }

        return nextPosition;
      });
    },
    [
      gameWon,
      loading,
      penaltyTime,
      mazeSize.width,
      mazeSize.height,
      maze,
      item,
      finishPosition.x,
      finishPosition.y,
      sendItemPickup,
      mazeCompletionSent,
      sendMazeCompletion,
      clearCloudStorage,
    ]
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

  // Touch and wheel event handlers remain the same...

  const SCROLL_THRESHOLD = 40;
  const THROTTLE_TIMEOUT = 300; // milliseconds
  const SWIPE_THRESHOLD = 20; // Minimum movement in pixels to be considered a swipe

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastTapTimeRef = useRef(0);

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
              if (inverse) {
                movePlayer(1, 0); // Swipe left
              } else {
                movePlayer(-1, 0); // Swipe right
              }
            } else {
              if (inverse) {
                movePlayer(-1, 0); // Swipe right
              } else {
                movePlayer(1, 0); // Swipe left
              }
            }
          } else {
            // Vertical swipe
            if (dy > 0) {
              if (inverse) {
                movePlayer(0, 1); // Swipe up
              } else {
                movePlayer(0, -1); // Swipe down
              }
            } else {
              if (inverse) {
                movePlayer(0, -1); // Swipe down
              } else {
                movePlayer(0, 1); // Swipe up
              }
            }
          }
        }
      }
    },
    [movePlayer, inverse]
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
            if (inverse) {
              movePlayer(0, 1); // Scroll down
            } else {
              movePlayer(0, -1); // Scroll up
            }
          } else {
            if (inverse) {
              movePlayer(0, -1); // Scroll up
            } else {
              movePlayer(0, 1); // Scroll down
            }
          }
        } else {
          // Horizontal scroll
          if (event.deltaX > 0) {
            if (inverse) {
              movePlayer(1, 0); // Scroll right
            } else {
              movePlayer(-1, 0); // Scroll left
            }
          } else {
            if (inverse) {
              movePlayer(-1, 0); // Scroll left
            } else {
              movePlayer(1, 0); // Scroll right
            }
          }
        }

        lastScrollTime.current = now; // Update last scroll time
      }
    },
    [movePlayer, inverse]
  );

  useEffect(() => {
    const gameArea = gameAreaRef.current;

    if (gameArea) {
      // Touch event listeners for swipe detection on mobile
      gameArea.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      gameArea.addEventListener("touchend", handleTouchEnd, { passive: false });

      // Wheel event listener for desktop scroll control
      gameArea.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        gameArea.removeEventListener("touchstart", handleTouchStart);
        gameArea.removeEventListener("touchend", handleTouchEnd);
        gameArea.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleTouchStart, handleTouchEnd, handleWheel, currentView]);

  const handleDoubleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (gameWon || loading || penaltyTime) return;

      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX =
        (event as MouseEvent).clientX ||
        (event as TouchEvent).touches[0]?.clientX;
      const clickY =
        (event as MouseEvent).clientY ||
        (event as TouchEvent).touches[0]?.clientY;

      if (clickX == null || clickY == null) return;

      const relativeX = clickX - rect.left;
      const relativeY = clickY - rect.top;

      const isTopHalf = relativeY < rect.height / 2;
      const isLeftHalf = relativeX < rect.width / 2;

      if (isTopHalf) {
        if (isLeftHalf) {
          // Top-left: move up
          movePlayer(0, -1);
        } else {
          // Top-right: move right
          movePlayer(1, 0);
        }
      } else {
        if (isLeftHalf) {
          // Bottom-left: move left
          movePlayer(-1, 0);
        } else {
          // Bottom-right: move down
          movePlayer(0, 1);
        }
      }
    },
    [gameWon, loading, penaltyTime, movePlayer]
  );

  const handleDoubleTouch = useCallback(
    (event: TouchEvent) => {
      if (gameWon || loading || penaltyTime) return;

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Treat as a double-tap
        handleDoubleClick(event);
      }

      lastTapTimeRef.current = now;
    },
    [gameWon, loading, penaltyTime, handleDoubleClick]
  );

  useEffect(() => {
    const gameArea = gameAreaRef.current;

    if (gameArea) {
      gameArea.addEventListener("dblclick", handleDoubleClick);
      gameArea.addEventListener("touchend", handleDoubleTouch);

      return () => {
        gameArea.removeEventListener("dblclick", handleDoubleClick);
        gameArea.removeEventListener("touchend", handleDoubleTouch);
      };
    }
  }, [handleDoubleClick, handleDoubleTouch]);

  // Handle penalty time display
  useEffect(() => {
    if (penaltyTime) {
      const interval = setInterval(() => {
        const remainingTime = penaltyTime - Date.now();
        if (remainingTime <= 0) {
          setPenaltyTime(null);
          // Refetch maze data
          fetchMazeData();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [fetchMazeData, penaltyTime]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden text-white relative">
      {loading && <Loading />}
      {penaltyTime && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-75">
          <div>
            <h2>You are blocked for cheating.</h2>
            <p>
              Time remaining: {Math.ceil((penaltyTime - Date.now()) / 1000)}{" "}
              seconds
            </p>
          </div>
        </div>
      )}
      <BgGradient />
      <Header
        score={score}
        showSimpleMap={showSimpleMap}
        isSoundMuted={isSoundMuted}
        toggleSimpleMap={toggleSimpleMap}
        handleMuteToggle={handleMuteToggle}
        inverse={inverse}
        toggleInverse={toggleInverse}
      />
      <div className="w-full h-full z-10">
        {currentView === "play" && (
          <>
            <SwipeHint
              isFirstGame={mazeSize.width === 1 || mazeSize.height === 1}
            />
            <div ref={gameAreaRef} className="game-area w-full h-full z-10">
              {showSimpleMap ? (
                <MiniMap
                  maze={maze}
                  playerPosition={playerPosition}
                  finishPosition={finishPosition}
                  mazeSize={mazeSize}
                  wallColor={colorScheme.wallColor}
                  floorColor={colorScheme.floorColor}
                  playerColor={colorScheme.playerColor}
                  portalColor={colorScheme.portalColor}
                />
              ) : !loading && maze && maze.length > 0 && mazeId ? (
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
                    wallColor={colorScheme.wallColor}
                    floorColor={colorScheme.floorColor}
                    playerColor={colorScheme.playerColor}
                    portalColor={colorScheme.portalColor}
                  />
                  <CameraController
                    target={
                      new THREE.Vector3(playerPosition.x, 0, playerPosition.z)
                    }
                    resetCamera={resetCamera}
                    setResetCamera={setResetCamera}
                  />
                </Canvas>
              ) : null}
            </div>
          </>
        )}
        {currentView === "items" && <Items items={userData.items || []} />}
        {currentView === "frens" && (
          <Frens userId={userId} initData={initData.current} />
        )}
        {currentView === "profile" && (
          <Profile userData={userData} initData={initData.current} />
        )}
      </div>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default Game;
