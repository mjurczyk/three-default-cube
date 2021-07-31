import { AnimationService } from "../services/animation-service";
import { isDefined } from "../utils/shared";

export const parseRotateXYZ = (object) => {
  const { userData } = object;

  if (isDefined(userData.rotateX) || isDefined(userData.rotateY) || isDefined(userData.rotateZ)) {
    AnimationService.registerAnimation({
      target: object,
      onStep: ({ target }) => {
        if (isDefined(userData.rotateX)) {
          target.rotateX(userData.rotateX);
        }

        if (isDefined(userData.rotateY)) {
          target.rotateY(userData.rotateY);
        }

        if (isDefined(userData.rotateZ)) {
          target.rotateZ(userData.rotateZ);
        }
      }
    });
  }
};
