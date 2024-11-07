import { ReactElement } from "react";
import * as THREE from "three";

export type Cell = {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
};

export interface NavButtonProps {
  icon: ReactElement;
  text: string;
  color: string;
}

export interface CameraControllerProps {
  target: THREE.Vector3;
  resetCamera: boolean;
  setResetCamera: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface FloorProps {
  width: number;
  height: number;
  color: string;
}

export interface HeaderProps {
  score: number;
  showSimpleMap: boolean;
  isSoundMuted: boolean;
  toggleSimpleMap: () => void;
  handleMuteToggle: () => void;
}

export interface MazeProps {
  maze: Cell[][];
  playerPosition: THREE.Vector3;
  finishPosition: { x: number; y: number };
  gameWon: boolean;
  mazeSize: {
    width: number;
    height: number;
  };
  wallColor: string;
  floorColor: string;
  playerColor: string;
  portalColor: string;
}

export interface PlayerProps {
  position: THREE.Vector3;
  isWinning: boolean;
  color: string;
}

export interface PortalProps {
  position: THREE.Vector3;
  isWinning: boolean;
  color: string;
}

export interface SimpleMapProps {
  maze: Cell[][];
  playerPosition: { x: number; z: number };
  finishPosition: { x: number; y: number };
  mazeSize: { width: number; height: number };
  wallColor: string;
  floorColor: string;
  playerColor: string;
  portalColor: string;
}

export interface WallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
}

export interface WinningAnimationProps {
  position: THREE.Vector3;
  score: number;
  gameWon: boolean;
}

export type Direction = "up" | "right" | "down" | "left";
