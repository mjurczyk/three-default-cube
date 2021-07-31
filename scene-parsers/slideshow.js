import { AnimationService } from "../services/animation-service";
import { AssetsService } from "../services/assets-service";
import { isDefined } from "../utils/shared";

export const parseSlideshow = (object) => {
  const { userData } = object;

  if (isDefined(userData.slideshow)) {
    let slidesX = parseInt(userData.slidesX, 10);
    let slidesY = parseInt(userData.slidesY, 10);
    const slideshowFrequency = 500;

    if (isNaN(slidesX)) {
      slidesX = 1.0;
    }

    if (isNaN(slidesY)) {
      slidesY = 1.0;
    }

    const dX = slidesX === 1 ? 0 : 1 / slidesX;
    const dY = slidesY === 1 ? 0 : 1 / slidesY;

    AnimationService.registerAnimation({
      target: object,
      interval: slideshowFrequency,
      onCreate: (target) => {
        if (target.material && target.material.map) {
          target.material = AssetsService.cloneMaterial(target.material);
          target.material.map = AssetsService.cloneTexture(target.material.map);

          target.material.map.offset.x = 0;
          target.material.map.offset.y = 0;
        }
      },
      onStep: ({ target }) => {
        if (!target || !target.parent || !target.material || !target.material.map) {
          return false;
        }

        target.material.map.offset.x += dX;
        target.material.map.offset.y += dY;
      }
    });
  }
};
