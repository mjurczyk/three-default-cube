import { AssetsService } from "../services/assets-service";
import { CameraService } from "../services/camera-service";

export const parseCamera = (object, { cameras }) => {
  const { userData } = object;

  if (userData.camera) {
    object.visible = false;

    CameraService.addCamera(userData.camera, object);

    AssetsService.registerDisposeCallback(object, () => CameraService.disposeCamera(userData.camera));
  }
};
