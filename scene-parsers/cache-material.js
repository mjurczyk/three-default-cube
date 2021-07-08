import { AssetsService } from "../services/assets-service";

export const parseCacheMaterial = (object) => {
  const { userData } = object;

  if (userData.cacheMaterial) {
    AssetsService.saveMaterial(object.material);

    object.userData.cachedMaterialId = object.material.name;
  }
};
