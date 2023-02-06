import * as Three from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { AssetsService } from './assets-service';
import { MathService } from './math-service';
import { RenderService } from './render-service';
import { UtilsService } from './utils-service';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE: Three });

export const CameraMovementTypeEnums = {
  rotateOnButtonDown: 'rotateOnButtonDown',
  rotateOnPointerMove: 'rotateOnPointerMove'
};

class CameraServiceClass {
  cameras = {};
  renderTargets = {};
  autoUpdateRenderTargets = false;
  cameraPosition = MathService.getVec3(0.0, 1.0, 1.0, 'camera-1');
  cameraQuaternion = MathService.getQuaternion();
  defaultTween = 0.2;
  tween = 0.2;
  camera = null;
  followedObject = null;
  followListener = null;
  followListenerThreshold = 0.001;
  followOffset = new Three.Vector3(0.0, 0.0, 0.0);
  rotationLocked = false;
  cameraControls = null;
  pointerLockControls = null;
  cameraMovementType = CameraMovementTypeEnums.rotateOnButtonDown;

  init({ camera, renderer } = {}) {
    this.camera = camera;
    this.camera.position.copy(this.cameraPosition);
    this.camera.quaternion.copy(this.cameraQuaternion);

    if (!this.cameraControls) {
      this.cameraControls = new CameraControls(RenderService.getNativeCamera(), RenderService.isHeadless ? document.createElement('div') : renderer.domElement);
      this.cameraControls.enabled = false;
    }

    if (!this.pointerLockControls) {
      this.pointerLockControls = new PointerLockControls(RenderService.getNativeCamera(), RenderService.isHeadless ? document.createElement('div') :renderer.domElement);
      this.pointerLockControls.unlock();
    }
  }

  onFrame(dt) {
    this.updateCamera(dt);

    if (this.autoUpdateRenderTargets) {
      this.updateRenderTargets();
    }
  }

  resetCamera() {
    this.camera.position.set(0.0, 0.0, 0.0);
    this.camera.rotation.set(0.0, 0.0, 0.0);
    this.camera.quaternion.identity();

    this.cameraPosition.copy(this.camera.position);
    this.cameraQuaternion.copy(this.camera.quaternion);

    this.cameraControls.enabled = false;

    this.pointerLockControls.unlock();
  }

  updateCamera(dt = 0.0) {
    if (this.pointerLockControls.isLocked) {
      if (this.followedObject) {
        this.followedObject.getWorldPosition(this.cameraPosition);

        this.camera.position.lerp(this.cameraPosition, this.tween);
      }
      return;
    }

    if (this.followedObject) {
      this.followedObject.getWorldPosition(this.cameraPosition);
      this.followedObject.getWorldQuaternion(this.cameraQuaternion);

      const worldAlignedOffset = MathService.getVec3();
      worldAlignedOffset.copy(this.followOffset);
      worldAlignedOffset.applyQuaternion(this.cameraQuaternion);

      if (this.rotationLocked) {
        this.cameraControls.setLookAt(
          this.cameraPosition.x + worldAlignedOffset.x,
          this.cameraPosition.y + worldAlignedOffset.y,
          this.cameraPosition.z + worldAlignedOffset.z,
          this.cameraPosition.x,
          this.cameraPosition.y,
          this.cameraPosition.z,
          true
        );
      } else {
        this.cameraControls.moveTo(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
      }

      MathService.releaseVec3(worldAlignedOffset);

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
      if (!this.rotationLocked) {
        this.camera.quaternion.slerp(this.cameraQuaternion, this.tween);
      }

      this.camera.position.lerp(this.cameraPosition, this.tween);
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

    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnButtonDown);

    this.followedObject = null;
    this.cameraControls.enabled = false;
    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);

    if (this.tween >= 1.0) {
      this.camera.position.copy(camera.position);
      this.camera.quaternion.copy(camera.quaternion);
    }
  }

  useStaticCamera(position, target, allowOrbit = false) {
    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnButtonDown);

    this.followedObject = null;
    this.followOffset.set(0.1, 0.1, 0.1);
    this.cameraControls.enabled = allowOrbit;
    this.cameraControls.setOrbitPoint(target.x, target.y, target.z);
    this.cameraPosition.copy(position);

    if (target) {
      const mock = UtilsService.getEmpty();
      mock.position.copy(position);
      mock.lookAt(target);

      this.cameraQuaternion.copy(mock.quaternion);
      UtilsService.releaseEmpty(mock);
    }

    if (this.tween >= 1.0) {
      this.camera.position.copy(this.cameraPosition);
      this.camera.quaternion.copy(this.cameraQuaternion);
    }
  }

  useFirstPersonCamera(object) {
    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnPointerMove);

    this.followedObject = object;
    this.followOffset.set(0.0, 0.0, 0.0);

    this.registerCameraColliders(false);

    this.cameraControls.dampingFactor = 1.0;
    this.cameraControls.enabled = false;
  }

  useThirdPersonCamera(object, offset, preventOcclusion = true) {
    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnButtonDown);

    this.followedObject = object;
    this.followedObject.getWorldPosition(this.cameraPosition);
    
    this.registerCameraColliders(preventOcclusion);
    
    if (offset) {
      this.followOffset.copy(offset);
    } else {
      this.followOffset.set(0.1, 0.1, 0.1);
    }

    this.cameraControls.setLookAt(
      this.cameraPosition.x + this.followOffset.x,
      this.cameraPosition.y + this.followOffset.y,
      this.cameraPosition.z + this.followOffset.z,
      this.cameraPosition.x,
      this.cameraPosition.y,
      this.cameraPosition.z,
      false
    );

    this.cameraControls.dampingFactor = this.tween;
    this.cameraControls.enabled = true;
  }

  ignoreCameraCollisions(object) {
    object.traverse(child => {
      child.userData._ignoreCameraCollision = true;
    });
  }

  registerCameraColliders(preventOcclusion) {
    if (preventOcclusion) {
      const scene = RenderService.getScene();

      if (scene) {
        this.cameraControls.colliderMeshes = [];

        scene.traverseVisible(child => {
          if (child === this.followedObject || !(child instanceof Three.Mesh) || child.children.length) {
            return;
          }

          let ignoreCollision = false;

          child.traverseAncestors(ancestor => {
            if (ancestor && (ancestor === this.followedObject || ancestor.userData._ignoreCameraCollision)) {
              ignoreCollision = true;
            }
          });

          if (ignoreCollision) {
            return;
          }

          this.cameraControls.colliderMeshes.push(child);
        });
      }
    } else {
      this.cameraControls.colliderMeshes = [];
    }
  }

  setCameraMovementType(cameraMovementType) {
    this.cameraMovementType = cameraMovementType;
    
    if (cameraMovementType === CameraMovementTypeEnums.rotateOnButtonDown) {
      this.cameraControls.enabled = true;
      this.pointerLockControls.unlock();
    } else {
      this.cameraControls.enabled = false;
      this.pointerLockControls.lock();
    }
  }

  onReachTarget(callback) {
    this.followListener = callback;
  }

  getCameraAsTexture(id, { width, height, minFilter, magFilter } = {}) {
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
    if (RenderService.isHeadless) {
      return;
    }

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
    AssetsService.disposeAsset(renderTarget.texture);
    AssetsService.disposeAsset(renderTarget);
  }

  lockRotation() {
    this.rotationLocked = true;
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

    this.pointerLockControls.unlock();

    this.resetCamera();
    this.tween = 0.2;
  }
}

export const CameraService = new CameraServiceClass();