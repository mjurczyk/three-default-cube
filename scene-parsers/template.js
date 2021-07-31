// NOTE Template only

import { AssetsService } from "../services/assets-service";
import { isDefined } from "../utils/shared";

export const parse = (object, payload) => {
  const { userData } = object;

  if (isDefined(userData.key)) {


    AssetsService.registerDisposeCallback(object, () => {});
  }
};
