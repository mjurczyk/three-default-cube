import {
  ViewClass,
  Preloader,
  AssetsService,
  CameraService,
  RenderService,
  SceneService,
  TimeService,
  MathService,
} from 'three-default-cube';

export class DemoGameObjects extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);

    new Preloader({
      requireAssets: [
        AssetsService.getModel(require('../assets/models/demo-game-objects.glb')),
      ],
      onComplete: ([
        worldModel,
      ]) => {
        SceneService.parseScene({
          target: worldModel,
          gameObjects: {
            cubeRed: (object) => {
              TimeService.registerFrameListener(({ elapsedTime }) => {
                object.rotation.x += Math.sin(elapsedTime) * 0.1;
              });
            },
            cubeGreen: (object) => {
              TimeService.registerFrameListener(({ elapsedTime }) => {
                object.position.y = Math.sin(elapsedTime) * 0.5;
                object.rotation.x = Math.sin(elapsedTime) * -0.4;
              });
            },
            cubeBlue: (object) => {
              TimeService.registerFrameListener(({ elapsedTime }) => {
                const scaleTarget = MathService.getVec3(1.0, 1.0, 1.0).multiplyScalar(Math.sin(elapsedTime) * 0.1 + 1.0);

                object.scale.copy(scaleTarget);

                MathService.releaseVec3(scaleTarget);
              });
            },
          },
          onCreate: () => {
            CameraService.useCamera('initial');

            scene.add(worldModel);
          }
        });
      }
    });
  }
}
