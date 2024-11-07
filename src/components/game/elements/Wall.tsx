import { WallProps } from "@/types/game";
import { MeshProps } from "@react-three/fiber";
import React from "react";

const Wall: React.FC<WallProps & MeshProps> = ({
  position,
  rotation,
  color,
}) => (
  <mesh position={position} rotation={rotation} castShadow>
    <boxGeometry args={[1, 1.3, 0.1]} />
    <meshStandardMaterial
      color={color}
      transparent
      opacity={0.5}
      roughness={1}
      metalness={0}
    />
  </mesh>
);

export default Wall;
