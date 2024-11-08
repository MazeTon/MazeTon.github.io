import { PlayerProps } from "@/types/game";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Player: React.FC<PlayerProps> = ({ position, isWinning, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null); // Shadow reference
  const [isBouncing, setIsBouncing] = useState(false); // Track if we're currently bouncing
  const [shadowAnimating, setShadowAnimating] = useState(false); // Track shadow animation
  const bounceStartTime = useRef(0); // Track the start time of the bounce
  const previousPosition = useRef(position.clone()); // Store the previous position
  const shadowAnimationStartTime = useRef(0); // Track shadow animation start

  // Detect position changes to trigger a bounce
  useEffect(() => {
    if (!position.equals(previousPosition.current)) {
      setIsBouncing(true); // Start bouncing when position changes
      bounceStartTime.current = performance.now(); // Record the time the bounce starts
      previousPosition.current.copy(position); // Update previous position
      resetShadow(); // Reset shadow when a new bounce starts
    }
  }, [position]);

  const resetShadow = () => {
    if (shadowRef.current) {
      shadowRef.current.scale.set(1, 1, 1);
      (shadowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5;
    }
  };

  useFrame(({ clock }) => {
    if (meshRef.current && shadowRef.current) {
      const elapsedTime = clock.getElapsedTime();

      if (isBouncing) {
        const bounceDuration = 0.3; // Duration for the bounce effect (in seconds)
        const timeSinceBounce =
          (performance.now() - bounceStartTime.current) / 600;

        if (timeSinceBounce < bounceDuration) {
          const bounceHeight =
            0.3 * Math.sin((Math.PI * timeSinceBounce) / bounceDuration);
          meshRef.current.position.set(
            position.x,
            position.y + bounceHeight,
            position.z
          );
        } else {
          meshRef.current.position.set(position.x, position.y, position.z);
          setIsBouncing(false); // Stop the bounce
          setShadowAnimating(true); // Start shadow animation after bounce
          shadowAnimationStartTime.current = clock.getElapsedTime();
        }
      } else {
        const idleBounceHeight = isWinning ? 0.15 : 0.05;
        meshRef.current.position.set(
          position.x,
          position.y + Math.sin(elapsedTime * 2) * idleBounceHeight,
          position.z
        );
      }

      if (isWinning) {
        meshRef.current.scale.setScalar(1 + Math.sin(elapsedTime * 2.5) * 0.3);
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 1 + Math.abs(Math.sin(elapsedTime * 2.5));
      } else {
        meshRef.current.scale.setScalar(1);
      }

      // Shadow animation logic
      if (shadowAnimating) {
        const shadowDuration = 0.5; // Duration of shadow animation
        const shadowElapsedTime =
          clock.getElapsedTime() - shadowAnimationStartTime.current;

        if (shadowElapsedTime < shadowDuration) {
          const shadowScale = 1 + shadowElapsedTime * 2; // Expand shadow
          const shadowOpacity = 1 - shadowElapsedTime / shadowDuration; // Fade out
          shadowRef.current.scale.set(shadowScale, shadowScale, 1);
          (shadowRef.current.material as THREE.MeshBasicMaterial).opacity =
            shadowOpacity;
        } else {
          setShadowAnimating(false); // Stop shadow animation after 1 run
          resetShadow(); // Ensure shadow resets completely
        }
      }
    }
  });

  return (
    <>
      {/* Balloon Player */}
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

      {/* Circular Dynamic Shadow */}
      <mesh
        ref={shadowRef}
        position={[position.x, position.y - 0.4, position.z]} // Slightly below balloon
        rotation={[-Math.PI / 2, 0, 0]} // Flat on the ground
      >
        <circleGeometry args={[0.25, 32]} /> {/* Circular shadow */}
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </>
  );
};

export default Player;
