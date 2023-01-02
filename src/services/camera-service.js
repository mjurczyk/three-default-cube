import * as Three from 'three';
import { AssetsService } from './assets-service';
import { MathService } from './math-service';
import { RenderService } from './render-service';
import { UtilsService } from './utils-service';

class CameraServiceClass {
  cameras = {};
  renderTargets = {};
  autoUpdateRenderTargets = false;
  cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-1');
  cameraQuaternion = MathService.getQuaternion();
  defaultTween = 0.2;
  tween = 0.2;
  camera = null;
  followedObject = null;
  followListener = null;
  followListenerThreshold = 0.001;
  followOffset = new Three.Vector3(0.0, 0.0, 0.0);
  translationLocked = false;
  rotationLocked = false;
  cameraControls = null;

  init({ camera, renderer } = {}) {
    this.camera = camera;
    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);

    // if (!this.cameraControls) {
      this.cameraControls = new CameraControls(RenderService.getNativeCamera(), renderer.domElement);
      // this.cameraControls.enabled = false;
    // }
  }

  onFrame(dt) {
    this.updateCamera(dt);

    if (this.autoUpdateRenderTargets) {
      // this.updateRenderTargets();
    }
  }

  resetCamera() {
    return;
    this.camera.position.set(0.0, 0.0, 0.0);
    this.camera.rotation.set(0.0, 0.0, 0.0);
    this.camera.quaternion.identity();

    this.cameraPosition.copy(this.camera.position);
    this.cameraQuaternion.copy(this.camera.quaternion);

    this.cameraControls.enabled = false;
  }

  updateCamera(dt = 0.0) {
    // this.cameraControls.rotate(0.01, 0.0, 0.0);
    this.cameraControls.update(dt);
    return;

    if (this.followedObject) {
      this.followedObject.getWorldPosition(this.cameraPosition);
      this.followedObject.getWorldQuaternion(this.cameraQuaternion);

      this.cameraControls.setLookAt(
        this.cameraPosition.x + this.followOffset.x,
        this.cameraPosition.y + this.followOffset.y,
        this.cameraPosition.z + this.followOffset.z,
        this.cameraPosition.x,
        this.cameraPosition.y,
        this.cameraPosition.z,
        false
      );

      if (this.followListener) {
        const distanceToTarget = MathService.getVec3(0.0, 0.0, 0.0, 'camera-3')
          .copy(this.camera.position)
          .sub(this.cameraPosition);

        if (distanceToTarget.length() <= this.followListenerThreshold) {
          this.followListener();

          delete this.followListener;
        }

        MathService.releaseVec3(distanceToTarget);
      }
    }

    if (!this.cameraControls.enabled) {
      if (!this.translationLocked) {
        this.camera.position.lerp(this.cameraPosition, this.tween);
      }

      if (!this.rotationLocked) {
        this.camera.quaternion.slerp(this.cameraQuaternion, this.tween);
      }
    } else {
      this.cameraControls.update(dt);
    }
  }

  addCamera(id, camera) {
    this.cameras[id] = camera;
  }

  getCamera(id) {
    return this.cameras[id];
  }

  setTween(tween = 0.2) {
    this.tween = tween;
  }

  useGameObjectCamera(gameObjectOrId) {
    let camera;

    if (typeof gameObjectOrId === 'string') {
      camera = this.getCamera(gameObjectOrId);
    } else {
      camera = gameObjectOrId;
    }

    if (!camera) {
      console.warn('CameraService', 'useStaticCamera', 'camera not found', { cameraOrId });
      return;
    }

    this.followedObject = null;
    this.cameraControls.enabled = false;
    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);

    if (this.tween >= 1.0) {
      this.camera.position.copy(camera.position);
      this.camera.quaternion.copy(camera.quaternion);
    }
  }

  useStaticCamera(position, target) {
    this.followedObject = null;
    this.cameraControls.enabled = true;
    // this.cameraControls.setOrbitPoint(target.x, target.y, target.z);
    // this.cameraPosition.copy(position);

    // if (target) {
    //   const mock = UtilsService.getEmpty();
    //   mock.position.copy(position);
    //   mock.lookAt(target);

    //   this.cameraQuaternion.copy(mock.quaternion);
    //   UtilsService.releaseEmpty(mock);
    // }

    // if (this.tween >= 1.0) {
    //   this.camera.position.copy(this.cameraPosition);
    //   this.camera.quaternion.copy(this.cameraQuaternion);
    // }
  }

  useFirstPersonCamera(object) {
    this.followedObject = object;

    this.cameraControls.dampingFactor = 1.0;
    this.cameraControls.enabled = true;
  }

  useThirdPersonCamera(object, offset = new Three.Vector3(0.0, 1.0, 1.0), preventOcclusion = true) {
    this.followedObject = object;

    if (preventOcclusion) {
      const scene = RenderService.getScene();

      if (scene) {
        this.cameraControls.colliderMeshes = [];

        scene.traverseVisible(child => {
          if (child === object || !(child instanceof Three.Mesh) || child.children.length) {
            return;
          }

          let isFollowTarget = false;

          child.traverseAncestors(ancestor => {
            if (ancestor === object) {
              isFollowTarget = true;
            }
          });

          if (isFollowTarget) {
            return;
          }

          this.cameraControls.colliderMeshes.push(child);
        });
      }
    } else {
      this.cameraControls.colliderMeshes = [];
    }

    this.followOffset.copy(offset);

    this.cameraControls.dampingFactor = this.tween;
    this.cameraControls.enabled = true;
  }

  useOrbitCamera() {
    // this.cameraControls.dampingFactor = 0.05;
    // this.cameraControls.enabled = true;
  }

  onReachTarget(callback) {
    this.followListener = callback;
  }

  getCameraAsTexture(id, { width, height, minFilter, magFilter } = {}) {
    return;
    const camera = this.cameras[id];

    if (!camera) {
      console.warn('CameraService', 'getCameraAsTexture', `camera ${id} does not exist`);

      return;
    }

    if (this.renderTargets[id]) {
      return this.renderTargets[id].texture;
    }

    const renderTarget = new Three.WebGLRenderTarget(
      width || window.innerWidth,
      height || window.innerHeight,
      {
        minFilter: minFilter || Three.LinearFilter,
        magFilter: magFilter || Three.NearestFilter,
        format: Three.RGBFormat
      }
    );

    this.renderTargets[id] = renderTarget;

    return renderTarget.texture;
  }

  updateRenderTargets() {
    return;
    const scene = RenderService.getScene();
    const renderer = RenderService.getRenderer();

    if (!scene || !renderer) {
      console.info('CameraService', 'updateRenderTargets', 'missing scene or renderer');
      return;
    }

    const uncontrolledCamera = UtilsService.getCamera();

    Object.keys(this.renderTargets).forEach(id => {
      const renderTarget = this.renderTargets[id];
      const camera = this.cameras[id];

      uncontrolledCamera.position.copy(camera.position);
      uncontrolledCamera.quaternion.copy(camera.quaternion);

      if (!camera) {
        console.info('CameraService', 'updateRenderTargets', `missing camera ${id}`);

        this.disposeRenderTarget(renderTarget);

        return;
      }

      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, uncontrolledCamera);
    });

    renderer.setRenderTarget(null);
    UtilsService.releaseCamera(uncontrolledCamera);
  }

  disposeRenderTarget(renderTarget) {
    return;
    AssetsService.disposeAsset(renderTarget.texture);
    AssetsService.disposeAsset(renderTarget);
  }

  lockTranslation() {
    this.translationLocked = true;
  }

  lockRotation() {
    this.rotationLocked = true;
  }

  unlockTranslation() {
    this.translationLocked = false;
  }

  unlockRotation() {
    this.rotationLocked = false;
  }

  disposeCamera(id) {
    this.cameras[id] = null;
  }

  disposeAll() {
    this.cameras = {};

    Object.keys(this.renderTargets).forEach(id => {
      const renderTarget = this.renderTargets[id];

      this.disposeRenderTarget(renderTarget);
    });

    this.renderTargets = {};

    if (this.cameraPosition) {
      MathService.releaseVec3(this.cameraPosition);
    }

    this.cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-7');

    if (this.cameraQuaternion) {
      MathService.releaseQuaternion(this.cameraQuaternion);
    }

    this.cameraQuaternion = MathService.getQuaternion();

    this.followedObject = null;
    this.followListener = null;
    this.followListenerThreshold = 0.001;

    this.cameraControls.enabled = false;
    this.cameraControls.dampingFactor = 0.05;
    this.cameraControls.colliderMeshes = [];

    this.resetCamera();
    this.tween = 0.2;
  }
}

export const CameraService = new CameraServiceClass();