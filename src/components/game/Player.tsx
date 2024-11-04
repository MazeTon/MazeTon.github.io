import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface PlayerProps {
  position: THREE.Vector3;
  isWinning: boolean;
  color: string;
}

const Player: React.FC<PlayerProps> = ({ position, isWinning, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isBouncing, setIsBouncing] = useState(false); // Track if we're currently bouncing
  const bounceStartTime = useRef(0); // Track the start time of the bounce
  const previousPosition = useRef(position.clone()); // Store the previous position

  // Detect position changes to trigger a bounce
  useEffect(() => {
    // Compare the current position with the previous position
    if (!position.equals(previousPosition.current)) {
      setIsBouncing(true); // Start bouncing when position changes
      bounceStartTime.current = performance.now(); // Record the time the bounce starts
      previousPosition.current.copy(position); // Update previous position
    }
  }, [position]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const elapsedTime = clock.getElapsedTime();

      if (isBouncing) {
        // Calculate the bounce effect based on elapsed time
        const bounceDuration = 0.3; // Duration for the bounce effect (in seconds)
        const timeSinceBounce =
          (performance.now() - bounceStartTime.current) / 600;

        // Bounce only within the bounce duration
        if (timeSinceBounce < bounceDuration) {
          const bounceHeight =
            0.3 * Math.sin((Math.PI * timeSinceBounce) / bounceDuration);
          meshRef.current.position.set(
            position.x,
            position.y + bounceHeight,
            position.z
          );
        } else {
          // Stop bouncing after the duration and reset position
          meshRef.current.position.set(position.x, position.y, position.z);
          setIsBouncing(false); // Stop the bounce
        }
      } else {
        // Standard calm movement (optional idle bounce for winning state)
        const idleBounceHeight = isWinning ? 0.15 : 0.05;
        meshRef.current.position.set(
          position.x,
          position.y + Math.sin(elapsedTime * 2) * idleBounceHeight,
          position.z
        );
      }

      // Scale and emissive effect if winning
      if (isWinning) {
        meshRef.current.scale.setScalar(1 + Math.sin(elapsedTime * 2.5) * 0.3);
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 1 + Math.abs(Math.sin(elapsedTime * 2.5));
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial
        emissive={color}
        color={color}
        emissiveIntensity={2}
      />
      <pointLight
        position={[0.01, 0.3, 0]}
        color="#fff"
        intensity={isWinning ? 2 : 1.5}
        distance={5}
        decay={1}
        castShadow
      />
    </mesh>
  );
};

export default Player;
