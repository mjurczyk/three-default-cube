import { AssetsService } from '../services/assets-service';
import { MathService } from "../services/math-service";
import { RenderService } from '../services/render-service';
import { TimeService } from "../services/time-service";
import { VarService } from '../services/var-service';
import { get3dScreenWidth } from "../utils/screen-size";
import { UiService } from '../services/ui-service';

export const parseLeft = (object) => {
  const { userData } = object;

  if (userData.left) {
    if (!UiService.isUiElement(object)) {
      console.info('parseLeft', 'object must be part of the UI layer');

      return;
    }

    let frameListener = null;

    VarService.resolveVar(
      userData.left,
      (value) => {
        if (frameListener) {
          TimeService.disposeFrameListener(frameListener);
        }

        if (!value) {
          return;
        }

        const percentageOffset = value.substr(-1) === '%';
        const offset = parseFloat(value);

        if (isNaN(offset)) {
          console.info('parseLeft', 'NaN value');

          return;
        }

        frameListener = TimeService.registerFrameListener(() => {
          if (!object.visible) {
            return;
          }

          const camera = RenderService.getNativeCamera();
          const position = MathService.getVec3(0.0, 0.0, 0.0);
          const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0);
          const cameraDirection = MathService.getVec3(0.0, 0.0, 0.0);

          object.getWorldPosition(position);
          camera.getWorldPosition(cameraPosition);
          camera.getWorldDirection(cameraDirection);

          const cameraOffset = position.add(cameraPosition).projectOnVector(cameraDirection).length();
          const screenWidth = get3dScreenWidth(cameraOffset, camera);

          object.position.x = -screenWidth / 2.0;

          if (percentageOffset) {
            object.position.x += (offset / 100.0) * screenWidth;
          } else {
            object.position.x += offset;
          }

          MathService.releaseVec3(position);
          MathService.releaseVec3(cameraPosition);
          MathService.releaseVec3(cameraDirection);
        });

        AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
      }
    );
  }
};
