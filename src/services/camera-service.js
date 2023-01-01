import * as Three from 'three';
import { AssetsService } from './assets-service';
import { MathService } from './math-service';
import { RenderService } from './render-service';
import { UtilsService } from './utils-service';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const OcclusionStepEnum = {
  progressive: 'progressive'
};

class CameraServiceClass {
  cameras = {};
  detachedControls = null;
  renderTargets = {};
  autoUpdateRenderTargets = false;
  cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-1');
  cameraQuaternion = MathService.getQuaternion();
  defaultTween = 0.2;
  tween = 0.2;
  camera = null;
  followedObject = null;
  followListener = null;
  followThreshold = 0.001;
  followPivot = null;
  followPivotPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-2');
  occlusionTest = false;
  occlusionSettings = {};
  occlusionStep = OcclusionStepEnum.progressive;
  occlusionSphere = 0.1;
  translationLocked = false;
  rotationLocked = false;

  init({ camera } = {}) {
    this.camera = camera;
    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);
  }

  onFrame() {
    this.updateCamera();

    if (this.occlusionTest) {
      this.determineTargetVisibility();
    }

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
  }

  updateCamera() {
    if (this.detachedControls) {
      return;
    }

    if (this.followedObject) {
      this.followedObject.getWorldPosition(this.cameraPosition);
      this.followedObject.getWorldQuaternion(this.cameraQuaternion);

      if (this.followListener) {
        const distanceToTarget = MathService.getVec3(0.0, 0.0, 0.0, 'camera-3')
          .copy(this.camera.position)
          .sub(this.cameraPosition);

        if (distanceToTarget.length() <= this.followThreshold) {
          this.followListener();

          delete this.followListener;
        }

        MathService.releaseVec3(distanceToTarget);
      }

      this.followPivot.position.lerp(this.followPivotPosition, this.tween);

      if (this.followPivot && !this.occlusionSettings.faceTarget) {
        const mock = UtilsService.getEmpty();
        mock.position.copy(this.followPivot.position);
        mock.quaternion.copy(this.followPivot.quaternion);
        mock.matrix.copy(this.followPivot.matrix);
        mock.matrixWorld.copy(this.followPivot.matrixWorld);
        mock.isCamera = true;

        this.followPivot.parent.add(mock);

        mock.lookAt(this.cameraPosition);

        this.followPivot.quaternion.slerp(mock.quaternion, this.tween);

        mock.isCamera = false;
        UtilsService.releaseEmpty(mock);
      }
    }

    if (!this.translationLocked) {
      this.camera.position.lerp(this.cameraPosition, this.tween);
    }

    if (!this.rotationLocked) {
      this.camera.quaternion.slerp(this.cameraQuaternion, this.tween);
    }
  }

  setCameraPosition(x, y, z) {
    this.cameraPosition.set(x, y, z);
  }

  setCameraQuaternion(quaternion) {
    this.cameraQuaternion.set(quaternion);
  }

  copyCameraPosition(position) {
    this.cameraPosition.copy(position);
  }

  copyCameraQuaternion(quaternion) {
    this.cameraQuaternion.copy(quaternion);
  }

  addCamera(id, camera) {
    this.cameras[id] = camera;
  }

  getCamera(id) {
    return this.cameras[id];
  }

  useCamera(camera, instant = false) {
    this.stopFollowing();
    this.reattachCamera();

    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);

    if (instant) {
      this.camera.position.copy(this.cameraPosition);
      this.camera.quaternion.copy(this.cameraQuaternion);
    }
  }

  follow(object, onReachTarget, freezeFrame = true) {
    const callback = () => {
      this.stopFollowing();
      this.reattachCamera();

      this.followedObject = object;
      this.followListener = onReachTarget;

      const pivot = UtilsService.getEmpty();
      this.camera.parent.add(pivot);

      pivot.position.copy(this.camera.position);
      pivot.quaternion.copy(this.camera.quaternion);

      this.camera.position.set(0.0, 0.0, 0.0);
      this.camera.quaternion.identity();

      pivot.add(this.camera);

      this.followPivot = this.camera;
      this.camera = pivot;

      if (freezeFrame) {
        RenderService.resumeRendering();
      }
    };

    if (freezeFrame) {
      RenderService.pauseRendering(() => callback());
    } else {
      callback();
    }
  }

  getFollowPivot() {
    return this.followPivot;
  }

  stopFollowing() {
    delete this.followedObject;

    if (this.followPivot) {
      const originalCamera = this.followPivot;

      originalCamera.position.copy(this.camera.position);
      originalCamera.quaternion.copy(this.camera.quaternion);

      const cameraRoot = this.camera.parent;

      this.camera.remove(originalCamera);
      cameraRoot.remove(this.camera);
      cameraRoot.add(originalCamera);

      const pivot = this.camera;
      this.camera = this.followPivot;
      
      UtilsService.releaseEmpty(pivot);
      this.followPivot = null;
    }

    this.cameraPosition.copy(this.camera.position);
    this.cameraQuaternion.copy(this.camera.quaternion);
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

  preventOcclusion({ allowTransparent, faceTarget, collisionRadius, occlusionStep } = {}) {
    if (!this.followedObject) {
      console.warn('CameraService', 'preventOcclusion', 'unable to prevent occlusion unless following a target');
      return;
    }

    this.occlusionTest = true;
    this.occlusionSettings = {
      allowTransparent: allowTransparent || false,
      faceTarget: faceTarget !== false
    };
    this.occlusionSphere = collisionRadius || 0.1;
    this.occlusionStep = occlusionStep || OcclusionStepEnum.progressive;
  }

  allowOcclusion() {
    this.occlusionTest = false;
    this.occlusionSettings = {};
    this.occlusionSphere = 0.1;
  }

  determineTargetVisibility() {
    if (!this.followedObject) {
      return;
    }

    const scene = RenderService.getScene();

    if (!scene) {
      return;
    }

    let latestHits = null;
    let step = null;

    const pivotDirection = MathService.getVec3(0.0, 0.0, 0.0, 'camera-4')
      .copy(this.followPivot.position)
      .normalize()
      .negate();

    const raycaster = UtilsService.getRaycaster();
    raycaster.near = Number.MIN_VALUE;

    const targetPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-5');
    this.camera.getWorldPosition(targetPosition);

    const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-6');

    if (this.occlusionStep !== OcclusionStepEnum.progressive) {
      step = this.occlusionStep;
    }

    const direction = MathService.getVec3(0.0, 0.0, 0.0, 'camera-7');
    this.followPivot.getWorldPosition(cameraPosition);
    direction.copy(targetPosition).sub(cameraPosition).normalize();

    const determineVisibility = () => {
      this.followPivot.getWorldPosition(cameraPosition);

      raycaster.far = Math.max(this.followPivot.position.length(), raycaster.near);
      raycaster.set(cameraPosition, direction);

      if (raycaster.far <= raycaster.near) {
        return false;
      }

      let hits = raycaster.intersectObjects(scene.children, true);

      if (this.occlusionStep === OcclusionStepEnum.progressive) {
        if (!step) {
          step = this.occlusionSphere;
        } else {
          const newStep = Math.sqrt(latestHits[latestHits.length - 1].distance);

          if (step === newStep) {
            return false;
          }

          step = newStep;
        }
      }

      if (hits.length) {
        hits = hits.filter(({ object }) => {
          if (!object.visible) {
            return false;
          }

          if (this.occlusionSettings.allowTransparent) {
            return !(object.material && object.material.transparent && object.material.opacity < 1.0);
          }

          return true;
        });

        this.followedObject.traverse(child => {
          hits = hits.filter(({ object }) => object.uuid !== child.uuid);
        });
      }

      if (hits.length > 0) {
        this.followPivot.position.add(pivotDirection.clone().multiplyScalar(step));

        latestHits = hits;

        return true;
      } else {
        if (latestHits) {
          const nearbyHits = latestHits.filter(({ point }) => point.clone().sub(cameraPosition).length() <= this.occlusionSphere);

          if (nearbyHits.length > 0) {
            this.followPivot.position.add(pivotDirection.clone().multiplyScalar(step));

            latestHits = nearbyHits;

            return true;
          }
        }
      }

      return false;
    };

    while (determineVisibility());

    MathService.releaseVec3(direction);
    MathService.releaseVec3(pivotDirection);
    MathService.releaseVec3(targetPosition);
    MathService.releaseVec3(cameraPosition);
    UtilsService.releaseRaycaster(raycaster);

    latestHits = null;
  }

  detachCamera() {
    this.stopFollowing();
    this.allowOcclusion();

    this.detachedControls = new OrbitControls(RenderService.getNativeCamera(), RenderService.getRenderer().domElement);
  }

  reattachCamera() {
    if (!this.detachedControls) {
      return;
    }

    this.detachedControls.dispose();
    this.detachedControls = null;
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
    this.stopFollowing();

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

    if (this.followPivotPosition) {
      MathService.releaseVec3(this.followPivotPosition);
    }

    this.followPivotPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-8');

    if (this.cameraQuaternion) {
      MathService.releaseQuaternion(this.cameraQuaternion);
    }

    this.cameraQuaternion = MathService.getQuaternion();

    this.followedObject = null;
    this.followListener = null;
    this.followThreshold = 0.001;
    this.occlusionTest = false;
    this.occlusionSettings = {};

    this.allowOcclusion();
    this.resetCamera();
    this.reattachCamera();
    this.tween = 0.2;
  }
}

export const CameraService = new CameraServiceClass();