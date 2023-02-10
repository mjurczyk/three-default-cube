import * as Three from 'three';
import { AssetsService } from "../services/assets-service";

export const hidePlaceholder = (target) => {
  if (target.geometry) {
    AssetsService.disposeProps(target.geometry);

    target.geometry = new Three.BufferGeometry();
    AssetsService.registerDisposable(target.geometry);
  }
};
