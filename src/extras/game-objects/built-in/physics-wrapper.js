import { PhysicsService } from '../../../services/physics-service';

export class PhysicsWrapper {
  target = null;
  body = null;

  surfaceCollisions = {};

  constructor(target, physicsConfig = {}) {
    this.target = target;
    this.body = PhysicsService.registerBody(target, physicsConfig);
  }

  getBody() {
    return this.body;
  }

  enableNoClip() {
    this.noClip = true;
  }

  disableNoClip() {
    this.noClip = false;
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

    delete this.surfaceCollisions;
  }
}
