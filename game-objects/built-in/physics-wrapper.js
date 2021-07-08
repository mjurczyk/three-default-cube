import { AssetsService } from '../../services/assets-service';
import { MathService } from '../../services/math-service';
import { PhysicsService } from '../../services/physics-service';
import { UtilsService } from '../../services/utils-service';

export class PhysicsWrapper {
  target = null;
  simpleVelocity = null;
  simpleGravity = null;
  grounded = true;
  collisionListener = null;
  dynamicCollisions = false;
  boundingBox = null;

  constructor(target) {
    this.target = target;

    PhysicsService.registerBody(this);
    AssetsService.registerDisposeCallback(this.target, () => {
      PhysicsService.disposeBody(this);
      this.dispose
    });
  }

  enableNavmaps() {
    this.simpleVelocity = MathService.getVec3(0.0, 0.0, 0.0, 'physics-wrapper-2');
    this.simpleGravity = MathService.getVec3(0.0, 0.0, 0.0, 'physics-wrapper-3');
  }

  enablePhysics() {
    // FIXME Implement CannonES instead: https://pmndrs.github.io/cannon-es/
  }

  enableDynamicCollisions(callback) {
    this.dynamicCollisions = true;
    this.boundingBox = UtilsService.getBox3();

    PhysicsService.registerDynamicCollisionBody(this, callback);
  }

  disableDynamicCollisions() {
    this.dynamicCollisions = false;

    if (this.boundingBox) {
      UtilsService.releaseBox3(this.boundingBox);
    }
  }

  disablePhysics() {
    if (this.simpleVelocity) {
      MathService.releaseVec3(this.simpleVelocity);

      delete this.simpleVelocity;
    }

    if (this.simpleGravity) {
      MathService.releaseVec3(this.simpleGravity);

      delete this.simpleGravity;
    }
  }

  getSimpleVelocity() {
    return this.simpleVelocity;
  }

  setSimpleVelocity(value) {
    this.simpleVelocity.copy(value);
  }

  onCollision(listener) {
    this.collisionListener = listener;
  }

  dispose() {
    delete this.collisionListener;

    this.disablePhysics();
    this.disableDynamicCollisions();

    if (this.target) {
      delete this.target;
    }
  }
}
