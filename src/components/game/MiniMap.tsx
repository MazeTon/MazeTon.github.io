import React from "react";

interface Cell {
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

interface MiniMapProps {
  maze: Cell[][];
  playerPosition: { x: number; z: number };
  finishPosition: { x: number; y: number };
  mazeSize: { width: number; height: number };
}

const MiniMap: React.FC<MiniMapProps> = ({
  maze,
  playerPosition,
  finishPosition,
  mazeSize,
}) => {
  const cellSize = 12;
  const wallColor = "#6d9bb5";

  return (
    <div className="fixed top-20 right-4 bg-gray-800 bg-opacity-80 p-2 rounded shadow-md text-white">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mazeSize.width}, ${cellSize}px)`,
          gap: "1px",
        }}
      >
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor:
                  x === Math.floor(playerPosition.x) &&
                  y === Math.floor(playerPosition.z)
                    ? "orange"
                    : x === finishPosition.x && y === finishPosition.y
                    ? "green"
                    : "transparent",
                borderTop: cell.walls.top ? `2px solid ${wallColor}` : "none",
                borderRight: cell.walls.right
                  ? `2px solid ${wallColor}`
                  : "none",
                borderBottom: cell.walls.bottom
                  ? `2px solid ${wallColor}`
                  : "none",
                borderLeft: cell.walls.left ? `2px solid ${wallColor}` : "none",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MiniMap;
