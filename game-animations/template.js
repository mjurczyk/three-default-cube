// NOTE Template only

import { AnimationService } from "../services/animation-service";

export const Animation = (object) => {
  return new Promise((resolve) => {
    AnimationService.registerAnimation({
      target: object,
      onCreate: () => {

      },
      onStep: () => {
        resolve();
      },
      onDispose: () => {
        
      }
    });
  });
};
