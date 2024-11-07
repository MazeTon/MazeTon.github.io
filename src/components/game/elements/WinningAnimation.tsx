import { WinningAnimationProps } from "@/types/game";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";

const WinningAnimation: React.FC<WinningAnimationProps> = ({
  position,
  score,
  gameWon,
}) => {
  const animationRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (animationRef.current) {
      animationRef.current.scale.setScalar(
        1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.3 // Slower text animation
      );
    }
  });

  return (
    <Text
      ref={animationRef}
      position={position}
      color="#38e624"
      font="/font/RubikMaze-Regular.ttf"
      fontSize={0.8}
      maxWidth={200}
      lineHeight={1}
      letterSpacing={0.02}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
      visible={gameWon}
    >
      +{score}
    </Text>
  );
};

export default WinningAnimation;
