import React from "react";

interface FloorProps {
  width: number;
  height: number;
}

const Floor: React.FC<FloorProps> = ({ width, height }) => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[width / 2 - 0.5, -0.75, height / 2 - 0.5]}
    receiveShadow
  >
    <planeGeometry args={[width, height]} />
    <meshStandardMaterial
      color="#5a7fa8"
      transparent
      opacity={0.6}
      roughness={0.8}
      metalness={0.1}
    />
  </mesh>
);

export default Floor;
