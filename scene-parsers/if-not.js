import { AssetsService } from "../services/assets-service";
import { VarService } from "../services/var-service";
import { isDefined } from "../utils/shared";

export const parseIfNot = (object) => {
  const { userData } = object;

  if (isDefined(userData.ifNot)) {
    VarService.resolveVar(userData.ifNot, (newValue) => {
      if (!object || !object.parent) {
        return false;
      }

      object.visible = !newValue;
    }, (listener) => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.ifNot, listener));
    });
  }
};
