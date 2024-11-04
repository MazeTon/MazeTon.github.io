import React from "react";

interface FloorProps {
  width: number;
  height: number;
  color: string;
}

const Floor: React.FC<FloorProps> = ({ width, height, color }) => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[width / 2 - 0.5, -0.5, height / 2 - 0.5]}
    receiveShadow
  >
    <planeGeometry args={[width, height]} />
    <meshStandardMaterial
      color={color}
      transparent
      opacity={0.3}
      roughness={1} // white blink
      metalness={-1}
    />
  </mesh>
);

export default Floor;
