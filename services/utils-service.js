import * as Three from 'three';
import { AssetsService } from './assets-service';
import { GameInfoService } from './game-info-service';

class UtilsServiceClass {
  poolRaycaster = [];
  poolBox3 = [];
  poolCamera = [];
  poolEmpty = [];
  poolBlankMaterial = [];
  
  poolRaycasterTotal = 0;
  poolBox3Total = 0;
  poolCameraTotal = 0;
  poolEmptyTotal = 0;
  poolBlankMaterialTotal = 0;

  getRaycaster() {
    const pooled = this.poolRaycaster.pop();

    if (pooled) {
      return pooled;
    }

    this.poolRaycasterTotal++;

    return new Three.Raycaster();
  }

  releaseRaycaster(raycaster) {
    raycaster.near = 0.0;
    raycaster.far = Infinity;

    this.poolRaycaster.push(raycaster);
  }

  getBox3() {
    const pooled = this.poolBox3.pop();

    if (pooled) {
      return pooled;
    }

    this.poolBox3Total++;

    return new Three.Box3();
  }

  releaseBox3(box3) {
    box3.makeEmpty();

    this.poolBox3.push(box3);
  }

  getCamera() {
    const pooled = this.poolCamera.pop();

    if (pooled) {
      return pooled;
    }

    this.poolCameraTotal++;

    return new Three.PerspectiveCamera(GameInfoService.config.system.camera.fov, 1.0);
  }

  releaseCamera(camera) {
    camera.position.set(0.0, 0.0, 0.0);
    camera.rotation.set(0.0, 0.0, 0.0);
    camera.quaternion.identity();

    this.poolCamera.push(camera);
  }

  getEmpty() {
    const pooled = this.poolEmpty.pop();

    if (pooled) {
      return pooled;
    }

    this.poolEmptyTotal++;

    const empty = new Three.Object3D();

    AssetsService.registerDisposable(empty);

    return empty;
  }

  releaseEmpty(object) {
    object.position.set(0.0, 0.0, 0.0);
    object.rotation.set(0.0, 0.0, 0.0);
    object.scale.set(1.0, 1.0, 1.0);
    object.quaternion.identity();

    object.children.forEach(child => object.remove(child));
    object.children = [];

    object.userData = {};

    if (object.parent) {
      object.parent.remove(object);
    }

    this.poolEmpty.push(object);
  }

  getBlankMaterial() {
    const pooled = this.poolBlankMaterial.pop();

    if (pooled) {
      return pooled;
    }

    this.poolBlankMaterialTotal++;

    const material = new Three.MeshBasicMaterial();

    AssetsService.registerDisposable(material);

    return material;
  }

  releaseBlankMaterial(material) {
    this.poolBlankMaterial.push(material);
  }

  disposeAll() {
    this.poolEmpty = [];
    this.poolBlankMaterial = [];

    this.poolEmptyTotal = 0;
    this.poolBlankMaterialTotal = 0;
  }
}

export const UtilsService = new UtilsServiceClass();