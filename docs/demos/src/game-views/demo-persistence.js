import {
  ViewClass,
  Preloader,
  AssetsService,
  CameraService,
  RenderService,
  SceneService,
  VarService,
  GameInfoService,
} from 'three-default-cube';

export class DemoPersistence extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);

    await VarService.registerPersistentVar('viewCount', 0);

    VarService.setVar('viewCount', VarService.getVar('viewCount') + 1);

    if (VarService.getVar('viewCount') === 1) {
      VarService.setVar('views', 'You saw this page 1 time');
    } else if (VarService.getVar('viewCount') > 1 && VarService.getVar('viewCount') < 10) {
      VarService.setVar('views', `You saw this page ${VarService.getVar('viewCount')} times`);
    } else {
      VarService.setVar('views', 'You saw this page plenty of times');
    }

    new Preloader({
      spinnerTexture: GameInfoService.config.textures.spinner,
      requireAssets: [
        AssetsService.getModel(require('../assets/models/demo-persistence.glb')),
      ],
      onComplete: ([
        worldModel,
      ]) => {
        SceneService.parseScene({
          target: worldModel,
          gameObjects: {
            
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
