import * as Three from 'three';
import { AssetsService } from './assets-service';
import { RenderService } from './render-service';
import { BackgroundPlane } from '../game-objects/built-in/background';
import { ParserService } from './parser-service';
import { GameInfoService } from './game-info-service';

export class SceneServiceClass {
  backgroundPlane = null;
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

  setBackgroundImage(texture, spherical = true) {
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

  setBackground(background) {
    if (this.backgroundPlane) {
      AssetsService.disposeAsset(this.backgroundPlane);
    }

    const scene = RenderService.getScene();

    this.backgroundPlane = background || new BackgroundPlane();

    scene.add(this.backgroundPlane);
  }

  getBackground() {
    return this.backgroundPlane;
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

    if (this.backgroundPlane) {
      AssetsService.disposeAsset(this.backgroundPlane);
    }

    this.backgroundPlane = null;
    
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