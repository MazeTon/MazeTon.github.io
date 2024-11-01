import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";

interface PlayerProps {
  position: THREE.Vector3;
  isWinning: boolean;
}

const Player: React.FC<PlayerProps> = ({ position, isWinning }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const bounceHeight = isWinning ? 0.15 : 0.1;
      meshRef.current.position.set(
        position.x,
        position.y + Math.sin(clock.getElapsedTime() * 3) * bounceHeight,
        position.z
      );

      if (isWinning) {
        meshRef.current.scale.setScalar(
          1 + Math.sin(clock.getElapsedTime() * 2.5) * 0.3
        );
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity =
          1 + Math.abs(Math.sin(clock.getElapsedTime() * 2.5));
      }
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        emissive="orange"
        color="orange"
        emissiveIntensity={1}
      />
      <pointLight
        position={[0, 0.5, 0]}
        color="orange"
        intensity={isWinning ? 2 : 1.5}
        distance={3}
        decay={2}
        castShadow
      />
    </mesh>
  );
};

export default Player;
