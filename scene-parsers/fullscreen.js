import { MathService } from "../services/math-service";
import { RenderService } from "../services/render-service";
import { TimeService } from "../services/time-service";
import { fitToCamera, fitToScreen } from "../utils/screen-size";
import { mathPi2 } from "../utils/constants";
import { AssetsService } from "../services/assets-service";
import { isDefined } from "../utils/shared";

export const parseFullscreen = (object) => {
  const { userData } = object;

  if (isDefined(userData.fullscreen)) {
    const camera = RenderService.getNativeCamera();

    const originalOrientation = MathService.getVec3(0.0, 0.0, 0.0, 'fullscreen-1')
      .copy(object.rotation);

    // NOTE Blender uses XZY axis orientation
    object.rotation.set(-mathPi2, -mathPi2, -mathPi2);

    if (userData.fullscreenOffset) {
      fitToScreen(object, userData.fullscreenOffset, camera, userData.fullscreenPreserveRatio);
    } else {
      const frameListener = TimeService.registerFrameListener(() => {
        fitToCamera(object, camera, userData.fullscreenPreserveRatio);
      });

      AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
    }

    object.scale.set(object.scale.z, object.scale.y, object.scale.x);

    object.rotation.x = originalOrientation.z;
    object.rotation.y = originalOrientation.y;
    object.rotation.z = originalOrientation.x;

    MathService.releaseVec3(originalOrientation);
  }
};
