import { SimpleMapProps } from "@/types/game";
import React, { useEffect, useRef } from "react";

const SimpleMap: React.FC<SimpleMapProps> = ({
  maze,
  playerPosition,
  finishPosition,
  mazeSize,
  wallColor,
  playerColor,
  portalColor,
}) => {
  // Ref to the map container for scrolling control
  const mapRef = useRef<HTMLDivElement>(null);

  // Configure cell size with a minimum size for visibility
  const screenWidth = window.innerWidth * 0.9;
  const availableHeight = window.innerHeight * 0.65;
  const cellSize = Math.max(
    10, // Minimum cell size in pixels
    Math.min(screenWidth / mazeSize.width, availableHeight / mazeSize.height)
  );

  // Define the rendering window around the player
  const renderRadius = 100; // Number of cells to render around the player

  // Calculate the visible range based on the player's position
  const startX = Math.max(0, playerPosition.x - renderRadius);
  const endX = Math.min(mazeSize.width, playerPosition.x + renderRadius + 1);
  const startY = Math.max(0, playerPosition.z - renderRadius);
  const endY = Math.min(mazeSize.height, playerPosition.z + renderRadius + 1);

  // Scroll to center on the player's position
  useEffect(() => {
    if (mapRef.current) {
      const scrollLeft = Math.max(
        0,
        playerPosition.x * cellSize - mapRef.current.clientWidth / 2
      );
      const scrollTop = Math.max(
        0,
        playerPosition.z * cellSize - mapRef.current.clientHeight / 2
      );

      mapRef.current.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [playerPosition, cellSize]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        height: "100vh",
        width: "100vw",
        paddingTop: "10vh",
        paddingBottom: "25vh",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={mapRef}
        style={{
          maxWidth: "90vw",
          maxHeight: "65vh",
          overflow: "auto",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "8px",
          backgroundColor: "transparent",
        }}
      >
        <div
          className="p-2 shadow-md text-white z-10 relative"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${endX - startX}, ${cellSize}px)`,
            gap: "1px",
          }}
        >
          {maze.slice(startY, endY).map((row, y) =>
            row.slice(startX, endX).map((cell, x) => {
              const globalX = x + startX;
              const globalY = y + startY;
              return (
                <div
                  key={`${globalX}-${globalY}`}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor:
                      globalX === Math.floor(playerPosition.x) &&
                      globalY === Math.floor(playerPosition.z)
                        ? playerColor
                        : globalX === finishPosition.x &&
                          globalY === finishPosition.y
                        ? portalColor
                        : "transparent",
                    borderTop: cell.walls.top
                      ? `1px solid ${wallColor}`
                      : "none",
                    borderRight: cell.walls.right
                      ? `1px solid ${wallColor}`
                      : "none",
                    borderBottom: cell.walls.bottom
                      ? `1px solid ${wallColor}`
                      : "none",
                    borderLeft: cell.walls.left
                      ? `1px solid ${wallColor}`
                      : "none",
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
