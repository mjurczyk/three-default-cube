import {
  ViewClass,
  Preloader,
  AssetsService,
  RenderService,
  SceneService,
  VarService,
  TimeService,
  AnimationService,
  UiService
} from 'three-default-cube';

export class DemoUiAlignment extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);

    TimeService.registerIntervalListener(() => {
      VarService.setVar('variable-x', `${Math.random() * 100.0}%`);
      VarService.setVar('variable-y', `${Math.random() * 100.0}%`);
    }, 3000);

    new Preloader({
      requireAssets: [
        AssetsService.getModel(require('../assets/models/demo-ui-alignment.glb')),
      ],
      onComplete: ([
        worldModel,
      ]) => {
        UiService.registerUiElement(worldModel);

        const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 5.0);
        UiService.uiScene.add(ambientLight);

        worldModel.position.z -= 6.0;

        SceneService.parseScene({
          target: worldModel,
          gameObjects: {
            'marker': (object) => {
              AnimationService.registerAnimation({
                target: object,
                onCreate: ({ target }) => {
                  target.userData.rotation = target.rotation.clone();
                },
                onStep: ({ target, animationTime }) => {
                  target.rotation.z = target.rotation.z - Math.cos(animationTime) * 0.001;
                }
              });
            }
          },
          onCreate: () => {}
        });
      }
    });
  }
}
