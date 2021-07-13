import { AssetsService } from '../services/assets-service';
import { MathService } from "../services/math-service";
import { RenderService } from '../services/render-service';
import { TimeService } from "../services/time-service";
import { get3dScreenWidth } from "../utils/screen-size";
import { MathUtils } from '../utils/shared';

export const parseAlign = (object) => {
  const { userData } = object;

  if (userData.align) {
    const frameListener = TimeService.registerFrameListener(() => {
      const camera = RenderService.getNativeCamera();

      const position = MathService.getVec3(0.0, 0.0, 0.0, 'align-1');
      const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'align-2');

      object.getWorldPosition(position);
      camera.getWorldPosition(cameraPosition);

      const screenWidth = get3dScreenWidth(position.sub(cameraPosition).length() / 2.0, camera);
      let targetOffset = 0;

      if (userData.align === 'left') {
        targetOffset = -screenWidth / 2.0 + 0.1;
      } else if (userData.align === 'right') {
        targetOffset = screenWidth / 2.0 - 0.1;
      }

      object.position.z = MathUtils.lerp(object.position.z, targetOffset, 0.05);

      MathService.releaseVec3(position);
      MathService.releaseVec3(cameraPosition);
    });

    AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
  }
};
