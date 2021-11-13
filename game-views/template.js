// NOTE Template only

import {
  ViewClass,
  Preloader,
  AssetsService,
  RenderService,
} from 'three-default-cube';

export class TemplateView extends ViewClass {
  onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0x000033, 0xffffcc, 1.0);
    scene.add(ambientLight);

    const preloaderObject = new Preloader({
      requireAssets: [
        AssetsService.getModel(/* NOTE View model */)
      ],
      onComplete: ([
        viewModel
      ]) => {
        SceneService.parseScene({
          target: viewModel,
          gameObjects: {
            // NOTE View game objects
          },
          actions: {
            // NOTE View actions
          },
          onCreate: () => {
            scene.add(viewModel);
          }
        });
      }
    });

    scene.add(preloaderObject);
  }
}
