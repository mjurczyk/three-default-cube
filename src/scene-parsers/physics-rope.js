import { PhysicsWrapper } from '../extras/game-objects/built-in/physics-wrapper';
import { PhysicsService } from "../services/physics-service";
import { isDefined } from "../utils/shared";
import { hidePlaceholder } from "../utils/hide-placeholder";

export const parsePhysicsRope = (object) => {
  const { userData } = object;

  if (isDefined(userData.physicsRope)) {
    const ropeTarget = object.parent;
    const { physicsRopeDistance } = object.userData;

    hidePlaceholder(object);

    if (!ropeTarget.cannonRef) {
      new PhysicsWrapper(ropeTarget, {
        physicsShape: 'sphere',
        physicsSize: physicsRopeDistance / 2.0,
        physicsDamping: 0.75,
      });
    }

    new PhysicsWrapper(object, {
      physicsShape: 'sphere',
      physicsSize: physicsRopeDistance / 2.0,
      physicsDamping: 0.75,
    });

    PhysicsService.registerConstraint(
      object,
      ropeTarget,
      physicsRopeDistance
    );
  }
};
