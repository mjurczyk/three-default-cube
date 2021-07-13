import * as Three from 'three';
import {
  ViewClass,
  Preloader,
  AssetsService,
  CameraService,
  RenderService,
  SceneService,
  VarService,
  TimeService,
  MathService,
  MathUtils
} from 'three-default-cube';

export class DemoActionsAndUi extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);

    VarService.setVar('count', 0);

    new Preloader({
      requireAssets: [
        AssetsService.getModel(require('../assets/models/demo-actions-and-ui.glb')),
      ],
      onComplete: ([
        worldModel,
      ]) => {
        SceneService.parseScene({
          target: worldModel,
          actions: {
            'increment': (object) => {
              VarService.setVar('count', Math.min(VarService.getVar('count') + 1, 10));

              object.material.emissiveIntensity = 1.0;
              object.scale.setScalar(1.1);
            },
            'decrement': (object) => {
              VarService.setVar('count', Math.max(0, VarService.getVar('count') - 1));

              object.material.emissiveIntensity = 1.0;
              object.scale.setScalar(1.1);
            }
          },
          gameObjects: {
            actionButton: (object) => {
              const material = object.material;

              material.emissiveIntensity = 0.0;
              material.emissive = new Three.Color(0xffffcc);

              TimeService.registerFrameListener(() => {
                material.emissiveIntensity = MathUtils.lerp(material.emissiveIntensity, 0.0, 0.1);

                const originalScale = MathService.getVec3(1.0, 1.0, 1.0);

                object.scale.lerp(originalScale, 0.1);

                MathService.releaseVec3(originalScale);
              });
            }
          },
          onCreate: () => {
            CameraService.useCamera(CameraService.getCamera('initial'), false);

            scene.add(worldModel);
          }
        });
      }
    });
  }
}
