import * as Three from 'three';
import * as Cannon from 'cannon-es';
import { GameInfoService } from '../../../services/game-info-service';
import { PhysicsService } from '../../../services/physics-service';
import { DQ } from '../../../utils/constants';

export class PhysicsWrapper {
  target = null;
  body = null;

  surfaceCollisions = {};

  constructor(target, physicsConfig = {}) {
    this.target = target;
    this.body = PhysicsService.registerBody(target, physicsConfig);

    this.enableDynamicShadows();
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

  enableDynamicShadows() {
    if (!this.body) {
      return;
    }

    const isStatic = this.body.type === Cannon.Body.STATIC;

    this.target.traverse(child => {
      if (GameInfoService.config.system.shadows && child.visible) {
        if (child instanceof Three.Mesh) {
          if (isStatic) {
            child.castShadow = GameInfoService.config.system.shadows & DQ.ShadowsStaticObjects;
          } else {
            child.castShadow = GameInfoService.config.system.shadows & DQ.ShadowsDynamicObjects;
          }
        }
      }
    });
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
