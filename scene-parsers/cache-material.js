import { AssetsService } from "../services/assets-service";
import { isDefined } from "../utils/shared";

export const parseCacheMaterial = (object) => {
  const { userData } = object;

  if (isDefined(userData.cacheMaterial)) {
    AssetsService.saveMaterial(object.material);

    object.userData.cachedMaterialId = object.material.name;
  }
};
