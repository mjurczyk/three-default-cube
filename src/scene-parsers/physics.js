import { PhysicsWrapper } from "../extras/game-objects/built-in/physics-wrapper";
import { isDefined } from "../utils/shared";

export const parsePhysics = (object) => {
  const { userData } = object;

  if (isDefined(userData.physics)) {
    new PhysicsWrapper(object, userData || {});
  }
};
