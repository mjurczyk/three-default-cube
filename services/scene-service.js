import * as Three from 'three';
import { AssetsService } from './assets-service';
import { RenderService } from './render-service';
import { ParserService } from './parser-service';
import { GameInfoService } from './game-info-service';

export class SceneServiceClass {
  gameObjectRefs = {};

  parseScene({
    target,
    navpath,
    actions,
    gameObjects,
    onCreate,
  }) {
    ParserService.parseModel({
      target,
      navpath,
      actions,
      gameObjects,
      onCreate: (parserPayload) => {
        this.gameObjectRefs = parserPayload.gameObjectRefs;

        onCreate(parserPayload);
      },
    });
  }

  setBackground(texture, spherical = true) {
    const scene = RenderService.getScene();

    if (scene.background) {
      AssetsService.disposeAsset(scene.background);
    }

    if (!spherical) {
      scene.background = texture;
    } else {
      const renderer = RenderService.getRenderer();
      const generator = new Three.PMREMGenerator(renderer);

      const renderTarget = generator.fromEquirectangular(texture);
      const sphericalTexture = renderTarget.texture;

      AssetsService.registerDisposable(sphericalTexture);
      AssetsService.registerDisposable(renderTarget);
      texture.dispose();
      generator.dispose();

      scene.background = sphericalTexture;
    }
  }

  setEnvironment(hdri) {
    const scene = RenderService.getScene();

    if (scene.environment) {
      AssetsService.disposeAsset(scene.environment);
    }

    scene.environment = hdri;
  }

  getEnvironment() {
    const scene = RenderService.getScene();

    return scene.environment;
  }

  disposeAll() {
    const scene = RenderService.getScene();
    
    if (scene.environment) {
      AssetsService.disposeAsset(scene.environment);
      
      delete scene.environment;
    }

    if (scene.background) {
      AssetsService.disposeAsset(scene.background);

      scene.background = new Three.Color(GameInfoService.config.system.sceneBackgroundDefault);
    }

    if (this.gameObjectRefs) {
      Object.keys(this.gameObjectRefs).forEach(key => {
        AssetsService.disposeAsset(this.gameObjectRefs[key]);

        delete this.gameObjectRefs[key];
      });
    }

    this.gameObjectRefs = {};
  }
}

export const SceneService = new SceneServiceClass();