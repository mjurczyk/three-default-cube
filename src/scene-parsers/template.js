// NOTE Template only

import { AssetsService, isDefined } from 'three-default-cube';

export const parse = (object, payload) => {
  const { userData } = object;

  if (isDefined(userData.key)) {
    AssetsService.registerDisposeCallback(object, () => {});
  }
};
