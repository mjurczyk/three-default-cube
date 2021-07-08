import { AssetsService } from "../services/assets-service";
import { PhysicsService } from "../services/physics-service";

export const parseSurface = (object) => {
  const { userData } = object;

  if (userData.surface) {
    PhysicsService.registerSurface(object);

    AssetsService.registerDisposeCallback(object, () => PhysicsService.disposeSurface(object));
  }
};
