// NOTE Template only

import { AnimationService } from 'three-default-cube';

export const TemplateAnimation = (object) => {
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
