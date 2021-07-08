import { AssetsService } from "../services/assets-service";
import { PhysicsService } from "../services/physics-service";

export const parseNavmap = (object) => {
  const { userData } = object;

  if (userData.navmap) {
    object.visible = false;

    PhysicsService.registerNavmap(object);

    AssetsService.registerDisposeCallback(object, () => PhysicsService.disposeNavmap(object));
  }
};
