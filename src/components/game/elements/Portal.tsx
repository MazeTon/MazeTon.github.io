import { PortalProps } from "@/types/game";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";

const Portal: React.FC<PortalProps> = ({ position, isWinning, color }) => {
  const portalRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const particles = useRef<THREE.Group>(null);

  const maxParticleHeight = 2; // Maximum height before resetting

  // Store random properties for each particle (speed and initial scale)
  const particleData = useRef(
    [...Array(10)].map(() => ({
      speed: 0.01 + Math.random() * 0.03, // Random speed for each particle
      initialScale: 0.1 + Math.random() * 0.3, // Random initial size
    }))
  );

  useFrame(({ clock }) => {
    if (portalRef.current) {
      const scaleIntensity = isWinning ? 1.1 : 0.8;
      portalRef.current.scale.setScalar(
        scaleIntensity + Math.sin(clock.getElapsedTime() * 3) * 0.05
      );
    }

    if (particles.current) {
      particles.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const elapsed = clock.getElapsedTime() + i * 0.1;

        // Use each particle's random speed
        mesh.position.y += particleData.current[i].speed;

        // Reset position if it exceeds max height
        if (mesh.position.y > maxParticleHeight) {
          mesh.position.y = 0; // Reset to the bottom
        }

        // Gradually fade out the particle as it rises
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          const fadeFactor = 1 - mesh.position.y / maxParticleHeight;
          mesh.material.opacity = Math.max(0, fadeFactor); // Ensure opacity doesn't go negative
        }

        // Uneven scaling effect
        const scaleVariance = 0.1 * Math.sin(elapsed * 2);
        const initialScale = particleData.current[i].initialScale;
        mesh.scale.setScalar(initialScale + scaleVariance);
      });
    }
  });

  return (
    <group position={position}>
      {/* Portal Mesh */}
      <mesh ref={portalRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.3, 0.08, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isWinning ? 2 : 1}
        />
      </mesh>

      {/* Point Light for the glow effect */}
      <pointLight
        ref={lightRef}
        color={color}
        position={[0, 0.5, 0]} // Above the portal
        intensity={isWinning ? 2 : 1} // Brighter if it's a winning portal
        distance={3}
        decay={2}
      />

      {/* Particles rising above the portal */}
      <group ref={particles}>
        {[...Array(10)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.random() * 0.4 - 0.2, // Random initial x position
              0,
              Math.random() * 0.4 - 0.2, // Random initial z position
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default Portal;
