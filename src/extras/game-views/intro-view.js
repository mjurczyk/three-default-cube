import { ViewClass } from "../../classes/view-class";
import { AnimationOverrideType, AnimationService } from "../../services/animation-service";
import { AssetsService } from "../../services/assets-service";
import { CameraService } from "../../services/camera-service";
import { GameInfoService } from "../../services/game-info-service";
import { MathService } from "../../services/math-service";
import { RenderService } from "../../services/render-service";
import { SceneService } from "../../services/scene-service";
import { VarService } from "../../services/var-service";
import { IntroFadeShader } from '../game-shaders/intro-fade-shader';

GameInfoService.shader('introFade', IntroFadeShader);

export class IntroView extends ViewClass {
  nextView = null;

  constructor(nextView) {
    super();

    this.nextView = nextView;
  }

  onCreate() {
    const scene = RenderService.getScene();
    const { camera } = CameraService;

    const cameraTarget = MathService.getVec3(0, 0, 0);
    camera.lookAt(cameraTarget);
    MathService.releaseVec3(cameraTarget);

    const ambientLight = AssetsService.getAmbientLight();
    scene.add(ambientLight);

    AssetsService.getModel(GameInfoService.config.models.intro).then(introModel => {
      SceneService.parseScene({
        target: introModel,
        actions: {
          'skip': () => {
            this.onPlaquesShown();
          }
        },
        onCreate: ({ gameObjectRefs }) => {
          CameraService.useCamera(CameraService.getCamera('intro'), true);

          scene.add(introModel);

          Promise.all([
            VarService.registerPersistentVar('playerBike', 'fusion'),
            VarService.registerPersistentVar('playerOutfit', 'safety'),
            VarService.registerPersistentVar('playerPoints', 0),
            VarService.registerPersistentVar('playerSunracePoints', 0),
            VarService.registerPersistentVar('playerTierUnlocks', [3, 0, 0, 0]),
            VarService.registerPersistentVar('playerMapRecords', []),
            VarService.registerPersistentVar('optionsShowDriver', true),
            VarService.registerPersistentVar('optionsAudioVolume', 0.2),
            VarService.registerPersistentVar('optionsPerformanceMode', false),
            VarService.registerPersistentVar('statsTotalPlaytime', 0),
            VarService.registerPersistentVar('statsMapPlays', []),
          ]).then(() => {
            this.showPlaques(['plaque-1', 'plaque-2'], gameObjectRefs);
          });
        }
      });
    });
  }

  showPlaques(queue, gameObjectRefs) {
    const plaque = gameObjectRefs[queue.shift()];

    if (!plaque) {
      this.onPlaquesShown();

      return;
    }

    AnimationService.registerAnimation({
      target: plaque,
      override: AnimationOverrideType.overrideIfExists,
      onStep: ({ target, animationTime }) => {
        if (animationTime > 1 && target.material.uniforms.fTime.value >= 2.0) {
          setTimeout(() => {
            this.hidePlaques(target, queue, gameObjectRefs);
          }, 0);

          return false;
        }

        target.material.uniforms.fTime.value += Math.sin(target.material.uniforms.fTime.value / 60 + 0.01);

        if (target.material.uniforms.fTime.value > 3.0) {
          target.material.uniforms.fTime.value = 3.0;
        }
      }
    });
  }

  hidePlaques(plaque, queue, gameObjectRefs) {
    AnimationService.registerAnimation({
      target: plaque,
      override: AnimationOverrideType.overrideIfExists,
      onStep: ({ target, animationTime }) => {
        if (animationTime > 1 && target.material.uniforms.fTime.value <= 0) {
          setTimeout(() => {
            this.showPlaques(queue, gameObjectRefs);
          }, 0);

          return false;
        }

        target.material.uniforms.fTime.value -= 0.01;
      }
    });
  }

  onPlaquesShown() {
    if (this.nextView) {
      RenderService.renderView(this.nextView);
    }
  }
}
