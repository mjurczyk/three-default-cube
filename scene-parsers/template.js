// NOTE Template only

import { AssetsService } from "../services/assets-service";

export const parse = (object, payload) => {
  const { userData } = object;

  if (userData.key) {


    AssetsService.registerDisposeCallback(object, () => {});
  }
};
