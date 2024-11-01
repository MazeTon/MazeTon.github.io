import { MeshProps } from "@react-three/fiber";
import React from "react";

interface WallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
}

const Wall: React.FC<WallProps & MeshProps> = ({
  position,
  rotation,
  color,
}) => (
  <mesh position={position} rotation={rotation} castShadow>
    <boxGeometry args={[1, 1.5, 0.1]} />
    <meshStandardMaterial
      color={color}
      transparent
      opacity={0.5}
      roughness={0.3}
      metalness={0.1}
    />
  </mesh>
);

export default Wall;
