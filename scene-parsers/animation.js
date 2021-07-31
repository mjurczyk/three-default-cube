import { GameInfoService } from "../services/game-info-service";
import { isDefined } from "../utils/shared";

export const parseAnimation = (object) => {
  const { userData } = object;

  if (isDefined(userData.animation)) {
    const animation = GameInfoService.config.animations[userData.animation];

    if (animation) {
      animation(object);
    } else {
      console.warn('parseAnimation', `animation does not exist`, userData.animation);
    }
  }
};
