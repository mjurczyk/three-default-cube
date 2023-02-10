import { AssetsService } from "../services/assets-service";
import { VarService } from "../services/var-service";
import { isDefined } from "../utils/shared";

export const parseMaterial = (object) => {
  const { userData } = object;

  if (isDefined(userData.material)) {
    VarService.resolveVar(
      userData.material,
      (materialName) => {
        if (!object || !object.parent) {
          return false;
        }
  
        const material = AssetsService.getMaterial(materialName);
  
        if (material) {
          AssetsService.disposeProps(object.material);
  
          object.material = material;
        }
      },
      (listener) => {
        AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.material, listener));
      }
    );
  }
};
