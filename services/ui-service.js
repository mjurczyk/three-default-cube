import * as Three from 'three';
import { AssetsService } from './assets-service';
import { MathService } from './math-service';
import { RenderService } from './render-service';

class UiServiceClass {
  uiElements = [];
  uiScene = this.createUiScene();
  tween = 0.8;

  createUiScene() {
    const scene = new Three.Object3D();
    const ambientLight = new Three.AmbientLight(0xffffff, 1.0);

    scene.add(ambientLight);

    return scene;
  }

  registerUiElement(object) {
    this.uiScene.add(object);
    this.uiElements.push(object);
  }

  onFrame() {
    const camera = RenderService.getNativeCamera();
    const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'ui-1');
    const cameraQuaternion = MathService.getQuaternion();

    camera.getWorldPosition(cameraPosition);
    camera.getWorldQuaternion(cameraQuaternion);

    this.uiScene.position.lerp(cameraPosition, this.tween);
    this.uiScene.quaternion.slerp(cameraQuaternion, this.tween);

    MathService.releaseVec3(cameraPosition);
    MathService.releaseQuaternion(cameraQuaternion);

    this.uiScene.updateMatrixWorld();
  }

  disposeAll() {
    this.uiElements.forEach(layer => {
      AssetsService.registerDisposable(layer);
    });

    this.uiElements = [];
    this.tween = 0.8;
  }
}

export const UiService = new UiServiceClass();