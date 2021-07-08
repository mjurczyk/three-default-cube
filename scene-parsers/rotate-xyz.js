import { AnimationService } from "../services/animation-service";

export const parseRotateXYZ = (object) => {
  const { userData } = object;

  if (userData.rotateX || userData.rotateY || userData.rotateZ) {
    AnimationService.registerAnimation({
      target: object,
      onStep: ({ target }) => {
        if (userData.rotateX) {
          target.rotateX(userData.rotateX);
        }

        if (userData.rotateY) {
          target.rotateY(userData.rotateY);
        }

        if (userData.rotateZ) {
          target.rotateZ(userData.rotateZ);
        }
      }
    });
  }
};
