import { CameraControllerProps } from "@/types/game";
import { useFrame, useThree } from "@react-three/fiber";

const CameraController: React.FC<CameraControllerProps> = ({
  target,
  resetCamera,
  setResetCamera,
}) => {
  const { camera } = useThree();

  useFrame(() => {
    // Directly set the camera position without interpolation
    camera.position.set(target.x - 0.5, 5, target.z + 5);
    camera.lookAt(target);

    if (resetCamera) {
      setResetCamera(false); // Reset only once after winning
    }
  });

  return null;
};

export default CameraController;
