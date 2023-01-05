import * as Three from 'three';
import { AssetsService } from '../../../services/assets-service';
import { DebugFlags, DebugService } from '../../../services/debug-service';
import { RenderService } from '../../../services/render-service';
import { TimeService } from '../../../services/time-service';

export class AnimationWrapper {
  target = null;
  mixer = null;
  mixerActions = {};
  mixerClips = [];

  constructor(target) {
    this.target = target;

    this.parseAnimations();
    AssetsService.registerDisposeCallback(this.target, () => this.dispose());
  }

  parseAnimations() {
    const { userData } = this.target;

    if (!userData.skinnedAnimations) {
      console.warn('SkinnedGameObject', 'onLoaded', 'model does not have animations');
      return;
    }

    if (DebugService.get(DebugFlags.DEBUG_SKINNING_SKELETONS)) {
      const scene = RenderService.getScene();
      const skeletorHelper = new Three.SkeletonHelper(this.target);
      scene.add(skeletorHelper);

      AssetsService.registerDisposable(skeletorHelper);
    }

    this.mixer = new Three.AnimationMixer(this.target);

    userData.skinnedAnimations.forEach(clip => {
      if (clip.name === 'mixamo.com') {
        // NOTE Clean-up Mixamo exported default name
        clip.name = 'idle';
      }

      const action = this.mixer.clipAction(clip);
      action.reset();
      action.play();

      // NOTE Internal only
      this.mixerActions[clip.name] = action;
      this.mixerClips.push(clip);

      this.blendInAnimation(clip.name, 1.0);
    });

    this.stopAllAnimations();

    TimeService.registerFrameListener(({ dt }) => {
      if (!this.mixer) {
        return;
      }

      this.mixer.update(dt);
    });
  }

  renameAnimation(original, newName) {
    this.mixerActions[newName] = this.mixerActions[original];
    delete this.mixerActions[original];
  }

  addMixamoAnimation(name, animation) {
    animation.name = name;

    const action = this.mixer.clipAction(animation);
    action.reset();
    action.play();

    this.mixerActions[name] = action;
    this.mixerClips.push(animation);

    this.blendInAnimation(name, 1.0);

    this.stopAllAnimations();
  }

  playAnimation(name, tweenDuration = 1000, reset = false, onFinish) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'playAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];

    action.isStopping = false;

    if (action.isRunning()) {
      return;
    }

    if (reset) {
      action.reset();
    }

    if (typeof onFinish === 'function') {
      const listener = (event) => {
        if (event.action !== action) {
          return;
        }

        onFinish();

        this.mixer.removeEventListener('finished', listener);
      };

      this.mixer.addEventListener('finished', listener);
      action.loop = Three.LoopOnce;
    } else {
      action.loop = Three.LoopRepeat;
    }

    action.enabled = true;
    action.setEffectiveTimeScale(1.0);
    action.fadeIn(tweenDuration / 1000.0);
  }

  stopAnimation(name, tweenDuration = 1000) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'stopAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];
    
    if (!action.isRunning() || action.isStopping) {
      return;
    }
    
    action.isStopping = true;
    action.enabled = true;
    action.setEffectiveTimeScale(1.0);
    action.fadeOut(tweenDuration / 1000.0);
  }

  blendInAnimation(name, blendWeight = 0.0) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'blendInAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];
    action.enabled = true;
    action.isStopping = false;
    action.setEffectiveWeight(blendWeight);
  }

  playAllAnimations(tweenDuration = 0) {
    Object.keys(this.mixerActions).forEach(name => {
      this.playAnimation(name, tweenDuration);
    });
  }

  stopAllAnimations(tweenDuration = 0) {
    Object.keys(this.mixerActions).forEach(name => {
      this.stopAnimation(name, tweenDuration);
    });
  }

  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();

      Object.keys(this.mixerActions).forEach(name => this.mixer.uncacheAction(this.mixerActions[name]));
      this.mixerClips.forEach(clip => this.mixer.uncacheClip(clip));

      this.mixer.uncacheRoot(this.mixer.getRoot());
    
      delete this.mixerActions;
      delete this.mixerClips;
      delete this.mixer;
    }

    if (this.target) {
      delete this.target;
    }
  }
}
