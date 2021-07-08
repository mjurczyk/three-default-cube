import * as Three from 'three';
import {
  ViewClass,
  Preloader,
  AssetsService,
  RenderService,
  SceneService,
  mathPi4,
} from 'three-default-cube';

export class DemoDebugging extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);

    new Preloader({
      requireAssets: [
        AssetsService.preloadModel(require('../assets/models/character.glb')),
      ],
      onComplete: () => {
        const spawnScene = () => {
          AssetsService.getModel(require('../assets/models/character.glb')).then(characterModel => {
            SceneService.parseScene({
              target: characterModel,
              onCreate: () => {
                characterModel.position.x = Three.MathUtils.randFloat(-5.0, 5.0)
                characterModel.position.y -= 1.5;
                characterModel.position.z -= 15.0 + Three.MathUtils.randFloat(0.0, 10.0);

                characterModel.rotation.y = Three.MathUtils.randFloat(-mathPi4, mathPi4);

                scene.add(characterModel);

                setTimeout(() => {
                  AssetsService.disposeAsset(characterModel);
                }, 3000 + Math.random() * 500);
              }
            });
          });

          setTimeout(() => {
            spawnScene();
          }, 1000 + Math.random() * 500);
        };

        spawnScene();
      }
    });
  }
}
