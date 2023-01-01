import { MathUtils } from 'three';
import { AssetsService } from '../services/assets-service';
import { MathService } from '../services/math-service';
import { UtilsService } from '../services/utils-service';

export const get3dScreenHeight = (depth = 1.0, camera) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const fov = targetCamera.fov * MathUtils.DEG2RAD;

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }

  return 2.0 * Math.tan(fov / 2.0) * Math.abs(depth !== 0.0 ? depth : 1.0);
};

export const get3dScreenWidth = (depth = 1.0, camera) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const height = get3dScreenHeight(depth, targetCamera);

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }

  return height * targetCamera.aspect;
};

export const fitToScreen = (mesh, depth = 1.0, camera, preserveRatio = false) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const height = get3dScreenHeight(depth, targetCamera) + 1.0;
  const width = height * targetCamera.aspect + 1.0;


  const mock = mesh.clone();
  mock.scale.set(1.0, 1.0, 1.0);

  const box = UtilsService.getBox3();
  box.setFromObject(mock);

  const boxWidth = box.max.x - box.min.x;
  const boxHeight = box.max.y - box.min.y;

  const ratioWidth = width / boxWidth;
  const ratioHeight = height / boxHeight;

  AssetsService.disposeAsset(mock);
  UtilsService.releaseBox3(box);

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }

  if (preserveRatio) {
    const maxRatio = Math.max(ratioWidth, ratioHeight);
    mesh.scale.set(maxRatio, maxRatio, 1.0);
  } else {
    mesh.scale.set(ratioWidth, ratioHeight, 1.0);
  }
};

export const fitToCamera = (mesh, camera, preserveRatio = false) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const distance = MathService.getVec3(0.0, 0.0, 0.0, 'screen-size-1');
  targetCamera.getWorldPosition(distance);

  const meshPosition = MathService.getVec3(0.0, 0.0, 0.0, 'screen-size-1');
  mesh.getWorldPosition(meshPosition);
  distance.sub(meshPosition);
  MathService.releaseVec3(meshPosition);

  fitToScreen(mesh, distance.length(), targetCamera, preserveRatio);
  MathService.releaseVec3(distance);

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }
};
