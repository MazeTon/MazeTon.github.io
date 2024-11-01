import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";

interface PortalProps {
  position: THREE.Vector3;
  isWinning: boolean;
}

const Portal: React.FC<PortalProps> = ({ position, isWinning }) => {
  const portalRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (portalRef.current) {
      const scaleIntensity = isWinning ? 1.1 : 0.8;
      portalRef.current.scale.setScalar(
        scaleIntensity + Math.sin(clock.getElapsedTime() * 3) * 0.05
      );
    }
  });

  return (
    <mesh
      ref={portalRef}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
    >
      <torusGeometry args={[0.3, 0.08, 16, 100]} />
      <meshStandardMaterial
        color="limegreen"
        emissive="green"
        emissiveIntensity={isWinning ? 2 : 1}
      />
    </mesh>
  );
};

export default Portal;
