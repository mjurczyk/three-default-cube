import { AssetsService } from "../services/assets-service";
import { PhysicsService } from "../services/physics-service";
import { isDefined } from "../utils/shared";

export const parseSurface = (object) => {
  const { userData } = object;

  if (isDefined(userData.surface)) {
    PhysicsService.registerSurface(object);

    AssetsService.registerDisposeCallback(object, () => PhysicsService.disposeSurface(object));
  }
};
