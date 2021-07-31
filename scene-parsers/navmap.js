import { AssetsService } from "../services/assets-service";
import { PhysicsService } from "../services/physics-service";
import { isDefined } from "../utils/shared";

export const parseNavmap = (object) => {
  const { userData } = object;

  if (isDefined(userData.navmap)) {
    object.visible = false;

    PhysicsService.registerNavmap(object);

    AssetsService.registerDisposeCallback(object, () => PhysicsService.disposeNavmap(object));
  }
};
