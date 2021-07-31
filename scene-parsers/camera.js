import { AssetsService } from "../services/assets-service";
import { CameraService } from "../services/camera-service";
import { isDefined } from "../utils/shared";

export const parseCamera = (object) => {
  const { userData } = object;

  if (isDefined(userData.camera)) {
    object.visible = false;

    CameraService.addCamera(userData.camera, object);

    AssetsService.registerDisposeCallback(object, () => CameraService.disposeCamera(userData.camera));
  }
};
