import * as Three from 'three';
import { AssetsService } from './assets-service';
import { RenderService } from './render-service';
import { ParserService } from './parser-service';
import { GameInfoService } from './game-info-service';
import { TimeService } from './time-service';
import CSM from 'three-csm';

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

        if (onCreate) {
          onCreate(parserPayload);
        }
      },
    });
  }

  setBackground(texture, spherical = true) {
    if (RenderService.isHeadless) {
      return;
    }

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

  setFog(color = 0x000000, density) {
    const scene = RenderService.getScene();

    scene.fog = new Three.FogExp2(color, density);
  }
  
  getFog() {
    const scene = RenderService.getScene();

    return scene.fog;
  }

  setSun(color = 0xffffff, intensity = 1.0, position = new Three.Vector3(1.0, 1.0, 1.0), near = 0.0, far = 400.0, shadowDrawDistance = 100.0) {
    const scene = RenderService.getScene();
    const camera = RenderService.getNativeCamera();

    const sunShadowMap = new CSM({
      maxFar: shadowDrawDistance || GameInfoService.config.system.shadowDrawDistance,
      lightNear: near,
      lightFar: far,
      shadowMapSize: GameInfoService.config.system.shadowsSunShadowResolution || GameInfoService.config.system.shadowsResolution,
      lightDirection: position.negate(),
      lightIntensity: intensity,
      camera: camera,
      parent: scene,
    });
    sunShadowMap.lights.forEach(light => {
      light.color = new Three.Color(color);
    });
    sunShadowMap.fade = true;

    scene.traverse(child => {
      if (!child.material || !child.visible) {
        return;
      }

      sunShadowMap.setupMaterial(child.material);
    });

    const originalSceneAddHandler = scene.add.bind(scene);
    scene.add = (...args) => {
      originalSceneAddHandler(...args);
    };

    TimeService.registerFrameListener(() => {
      sunShadowMap.update(camera.matrix);
    });
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