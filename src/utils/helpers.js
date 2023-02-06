import * as Three from 'three';
import { AssetsService } from '../services/assets-service';
import { getRandomColor } from './shared';

export const createArrowHelper = (container, id, vector, origin, color) => {
  let helper = container.getObjectByName(id);

  if (!helper) {
    helper = new Three.ArrowHelper(vector, undefined, vector.length(), color || getRandomColor());
    helper.name = id;

    AssetsService.registerDisposable(helper);

    container.add(helper);
  }

  helper.setLength(vector.length());
  helper.setDirection(vector.normalize());

  if (origin) {
    helper.position.copy(origin);
  }

  return helper;
};

export const createBoxHelper = (container, id, box) => {
  let helper = container.getObjectByName(id);

  if (!helper) {
    helper = new Three.Box3Helper(box, getRandomColor());
    helper.name = id;

    AssetsService.registerDisposable(helper);

    container.add(helper);
  }

  helper.box.copy(box);

  return helper;
};

export const createDefaultCube = (container, id, { position, size, color } = {}) => {
  let helper = container.getObjectByName(id);

  if (!helper) {
    helper = new Three.Mesh(
      new Three.BoxGeometry(size || 1.0, size || 1.0, size || 1.0),
      new Three.MeshStandardMaterial({ color: color || getRandomColor() })
    );
    helper.name = id;

    AssetsService.registerDisposable(helper);

    container.add(helper);
  }

  if (position) {
    helper.position.copy(position);
  }

  return helper;
};
