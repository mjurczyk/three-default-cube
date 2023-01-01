import { AssetsService } from "../services/assets-service";
import { VarService } from "../services/var-service";
import { isDefined } from "../utils/shared";

export const parseIf = (object) => {
  const { userData } = object;

  if (isDefined(userData.if)) {
    VarService.resolveVar(userData.if, (newValue) => {
      if (!object || !object.parent) {
        return false;
      }

      object.visible = !!newValue;
    }, (listener) => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.if, listener));
    });
  }
};
