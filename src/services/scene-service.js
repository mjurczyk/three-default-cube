import * as Three from 'three';
import { AssetsService } from './assets-service';
import { RenderService } from './render-service';
import { ParserService } from './parser-service';
import { GameInfoService } from './game-info-service';
import { TimeService } from './time-service';
import { CameraService } from './camera-service';
import { MathService } from './math-service';

export class SceneServiceClass {
  gameObjectRefs = {};
  sunInstances = [];

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

  setSun(color = 0xffffff, intensity = 1.0) {
    const scene = RenderService.getScene();

    if (this.sunInstances) {
      this.sunInstances.forEach(sun => AssetsService.disposeAsset(sun));
    }
    this.sunInstances = [];

    const sunOffset = new Three.Vector3(1.0, 1.0, 1.0);
    const sunShadowLodLevels = 3; // NOTE Hardcoded to fit shadow settings below
    
    Array(sunShadowLodLevels).fill(0).forEach((_, lodLevel) => {
      const sunShadowSpan = [15.0, 25.0, 30.0][lodLevel];
      const sunShadowDistance = RenderService.getNativeCamera().far;
      const sun = new Three.DirectionalLight(color, intensity / sunShadowLodLevels);
      sun.shadow.mapSize.width = [2048, 1024, 256][lodLevel];
      sun.shadow.mapSize.height = [2048, 1024, 256][lodLevel];
      sun.shadow.camera.left = -sunShadowSpan;
      sun.shadow.camera.right = sunShadowSpan;
      sun.shadow.camera.top = sunShadowSpan;
      sun.shadow.camera.bottom = -sunShadowSpan;
      sun.shadow.camera.near = -sunShadowDistance;
      sun.shadow.camera.far = sunShadowDistance;
      sun.castShadow = true;

      sun.target.position.sub(sunOffset);

      scene.add(sun.target);
      scene.add(sun);

      this.sunInstances.push(sun);
    });

    const sunPositionUpdateListener = TimeService.registerFrameListener(() => {
      const cameraTarget = CameraService.followedObject || CameraService.camera;

      const targetPosition = MathService.getVec3();
      cameraTarget.getWorldPosition(targetPosition);

      this.sunInstances.forEach(sunInstance => {
        if (!sunInstance) {
          return;
        }

        sunInstance.target.position.copy(targetPosition);
        sunInstance.position.copy(sunInstance.target.position).add(sunOffset);
      });

      MathService.releaseVec3(targetPosition);
    });

    AssetsService.registerDisposeCallback(this.sunInstances[0], () => {
      TimeService.disposeFrameListener(sunPositionUpdateListener);
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

    if (this.sunInstances) {
      this.sunInstances.forEach(sun => AssetsService.disposeAsset(sun));
      this.sunInstances = [];
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