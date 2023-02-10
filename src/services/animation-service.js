import { AssetsService } from './assets-service';
import { TimeService } from './time-service';

export const animateLinearInverse = (x, duration = 1.0, offset = 1.0) => 
  offset - (Math.min(x, duration) / duration) * offset;

export const animateLinear = (x, duration = 1.0, offset = 1.0) => 
  (Math.min(x, duration) / duration) * offset;

export const animateDelay = (x, delay = 0.0) => Math.max(0.0, x - delay);

export const AnimationOverrideType = {
  default: 0,
  noOverride: 0,
  overrideIfExists: 1,
  ignoreIfExists: 2,
};

class AnimationServiceClass {
  animations = [];
  frameListenerUid = null;

  constructor() {
    this.initLoop();
  }

  initLoop() {
    this.frameListenerUid = TimeService.registerPersistentFrameListener(({ dt, elapsedTime }) => {
      this.onStep({ dt, elapsedTime });
    });
  }

  onStep({ dt, elapsedTime }) {
    const time = elapsedTime;

    this.animations = this.animations.filter(animation => {
      const { onStep, target, interval } = animation;

      if (typeof onStep !== 'function' || !target) {
        return false;
      }

      if (target.__disposed__) {
        AssetsService.disposeAsset(target);

        return false;
      }

      animation.animationTime += dt;
      animation.intervalTime += dt;

      if (interval === 0 || (animation.intervalTime >= interval)) {
        const result = onStep({
          target,
          dt,
          time,
          animationTime: animation.animationTime,
          intervalTime: animation.intervalTime
        });

        animation.intervalTime = animation.intervalTime - interval;

        if (result === false) {
          animation.dispose();

          return false;
        }
      }

      return true;
    });
  }

  registerAnimation({
    target,
    onCreate,
    onStep,
    onDispose: customDispose,
    interval,
    override = AnimationOverrideType.default,
    randomSeed = 0.0
  } = {}) {
    if (!target || !onStep) {
      return;
    }

    if (target.userData.animationServiceRef) {
      if (override === AnimationOverrideType.ignoreIfExists) {
        return target.userData.animationServiceRef;
      } else if (override === AnimationOverrideType.overrideIfExists) {
        this.cancelAnimation(target.userData.animationServiceRef);
      }
    }

    const animation = {
      target,
      onStep,
      interval: interval ? interval / 1000.0 : 0.0,
      animationTime: randomSeed,
      intervalTime: 0.0,
      dispose: () => {
        if (customDispose) {
          customDispose({ target });
        }

        this.animations = this.animations.filter(item => item !== animation);

        delete target.userData.animationServiceRef;
      }
    };

    if (onCreate) {
      onCreate(animation);
    }

    this.animations.push(animation);

    target.userData.animationServiceRef = animation;

    return animation;
  }

  cancelAnimation(animation) {
    if (animation.dispose) {
      animation.dispose();
    }

    this.animations = this.animations.filter(item => item !== animation);
  }

  disposeAll() {
    this.animations = this.animations.filter(({ target }) => {
      if (target.userData) {
        delete target.userData.animationServiceRef;
      }

      return false;
    });

    this.animations = [];
  }

  dispose() {
    if (this.frameListenerUid) {
      TimeService.disposePersistentListener(this.frameListenerUid);
    }
  }
}

export const AnimationService = new AnimationServiceClass();
