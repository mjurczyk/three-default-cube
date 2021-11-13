import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createArrowHelper, createBoxHelper } from '../utils/helpers';
import { AssetsService } from './assets-service';
import { DebugFlags, DummyDebug } from './dummy-debug';
import { MathService } from './math-service';
import { RenderService } from './render-service';
import { TimeService } from './time-service';
import { UtilsService } from './utils-service';
import { Pathfinding } from 'three-pathfinding';
import { MathUtils } from '../utils/shared';

class PhysicsServiceClass {
  bodies = [];
  dynamicBodies = [];

  navmaps = [];
  pathfinder = null;
  pathfinedEnabled = false;
  pathfinderZoneId = 'zone';

  surfaceHandlers = {};
  surfaces = [];

  slopeTolerance = 1.0;
  gravityConstant = -0.986;

  maxDynamicBodySize = 1.0;

  init() {
    TimeService.registerPersistentFrameListener(() => {
      this.updateDynamicBodies();
      this.updateStaticBodies();
    });
  }

  updateStaticBodies() {
    if (!this.bodies.length) {
      return;
    }

    const direction = MathService.getVec3(0.0, 0.0, 0.0, 'physics-1');
    const position = MathService.getVec3(0.0, 0.0, 0.0, 'physics-1');
    const raycaster = UtilsService.getRaycaster();

    this.bodies = this.bodies.filter(body => {
      if (!body.simpleGravity) {
        return false;
      }

      raycaster.near = -0.00001;
      raycaster.far = 500.0; // NOTE If navmap is not found within this limit, it's assumed body left the navmap

      if (!body || !body.target) {
        AssetsService.disposeAsset(body);
        AssetsService.disposeAsset(body.target);

        return false;
      }

      if (body.grounded) {
        body.simpleGravity.y = 0.0;
      } else {
        body.simpleGravity.y = MathUtils.lerp(body.simpleGravity.y, this.gravityConstant, 0.1);
      }

      const simpleVelocity = body.getSimpleVelocity();
      const simpleGravity = body.simpleGravity;

      if (simpleVelocity) {
        body.target.getWorldPosition(position);
        position.add(simpleVelocity);

        const slopeVector = MathService.getVec3(0.0, 0.0, 0.0, 'physics-1')
          .copy(simpleGravity)
          .normalize()
          .multiplyScalar(-this.slopeTolerance);

        position.add(slopeVector);

        const gravityDirection = MathService.getVec3(0.0, -1.0, 0.0, 'physics-2');

        position.sub(gravityDirection);
        raycaster.set(position, gravityDirection);

        MathService.releaseVec3(gravityDirection);

        // Surfaces
        let collisions = raycaster.intersectObjects(this.surfaces, true);
        let cachedCollisions = Object.keys(body.surfaceCollisions || {});

        collisions.forEach(collision => {
          const { surface: surfaceType, surfaceRef } = collision.object.userData;
          const { onInteraction, onEnter, onLeave } = this.surfaceHandlers[surfaceType];

          if (surfaceRef[onEnter] && !body.surfaceCollisions[collision.object.uuid]) {
            surfaceRef[onEnter]({
              body,
              hit: collision
            });
          }

          if (surfaceRef[onInteraction]) {
            surfaceRef[onInteraction]({
              body,
              hit: collision
            });
          }

          body.surfaceCollisions[collision.object.uuid] = { onLeave: surfaceRef[onLeave] };
          cachedCollisions = cachedCollisions.filter(uuid => uuid !== collision.object.uuid);
        });

        cachedCollisions.forEach(collisionUuid => {
          if (body.surfaceCollisions[collisionUuid].onLeave) {
            body.surfaceCollisions[collisionUuid].onLeave({ body, hit: null });
          }

          delete body.surfaceCollisions[collisionUuid];
        });

        MathService.releaseVec3(slopeVector);

        // Collisions
        collisions = raycaster.intersectObjects(
          this.navmaps,
          true
        );

        if (collisions[0]) {
          const { point } = collisions[0];

          body.target.getWorldPosition(position);

          const pointOffset = MathService.getVec3(0.0, 0.0, 0.0, 'physics-3')
            .copy(point)
            .sub(position);

          if (pointOffset.length() - this.slopeTolerance <= simpleVelocity.length()) {
            body.target.position.add(pointOffset);
            body.grounded = true;
          } else {
            body.target.position.add(simpleVelocity);
            body.target.position.add(simpleGravity);
            body.grounded = false;
          }

          MathService.releaseVec3(pointOffset);
        } else {
          if (!body.noClip) {
            if (body.collisionListener) {
              body.collisionListener();
            }

            body.grounded = false;
          } else {
            body.target.position.add(simpleVelocity);
            body.grounded = true;
          }
        }
      }

      if (body.dynamicCollision) {
        body.dynamicCollision = false;
      }

      return true;
    });

    MathService.releaseVec3(direction);
    MathService.releaseVec3(position);
    UtilsService.releaseRaycaster(raycaster);
  }

  updateDynamicBodies() {
    if (!this.dynamicBodies.length) {
      return;
    }

    const tests = {};

    const positionA = MathService.getVec3(0.0, 0.0, 0.0, 'physics-4');
    const positionB = MathService.getVec3(0.0, 0.0, 0.0, 'physics-5');

    this.dynamicBodies = this.dynamicBodies.filter(bodyA => {
      if (!bodyA || !bodyA.target) {
        return false;
      }

      bodyA.target.getWorldPosition(positionA);

      this.dynamicBodies.forEach((bodyB) => {
        if (bodyA === bodyB || !bodyB || !bodyB.target) {
          return;
        }

        bodyB.target.getWorldPosition(positionB);

        const distance = positionB.distanceTo(positionA);
        const isNearby = distance <= this.maxDynamicBodySize && distance > 0.0;

        const collisionKey = [bodyA.target.uuid, bodyB.target.uuid].sort().join(':');
        const isTested = typeof tests[collisionKey] !== 'undefined';

        if (!isNearby || isTested) {
          return;
        }

        tests[collisionKey] = { bodyA, bodyB };
      });

      return true;
    });

    const distance = MathService.getVec3(0.0, 0.0, 0.0, 'physics-6');

    Object.keys(tests).forEach((testId, index) => {
      const { bodyA, bodyB } = tests[testId];

      if (bodyA === bodyB) {
        return;
      }

      bodyA.target.getWorldPosition(positionA);
      bodyB.target.getWorldPosition(positionB);
      distance.copy(positionB).sub(positionA);

      bodyA.boundingBox.setFromObject(bodyA.target);
      bodyB.boundingBox.setFromObject(bodyB.target);

      if (DummyDebug.get(DebugFlags.DEBUG_PHYSICS_DYNAMIC)) {
        createArrowHelper(
          RenderService.getScene(),
          `physicsService-updateDynamicBodies-${index}-distance`,
          distance,
          positionA
        );

        createBoxHelper(
          RenderService.getScene(),
          `physicsService-updateDynamicBodies-${index}-boxA`,
          bodyA.boundingBox
        );

        createBoxHelper(
          RenderService.getScene(),
          `physicsService-updateDynamicBodies-${index}-boxB`,
          bodyB.boundingBox
        );
      }

      if (bodyA.boundingBox.intersectsBox(bodyB.boundingBox)) {
        if (bodyA.target.userData.collisionCallbackRef) {
          bodyA.target.userData.collisionCallbackRef(bodyB.target);
        }

        if (bodyB.target.userData.collisionCallbackRef) {
          bodyB.target.userData.collisionCallbackRef(bodyA.target);
        }
      }
    });

    MathService.releaseVec3(positionA);
    MathService.releaseVec3(positionB);
    MathService.releaseVec3(distance);
  }

  registerBody(object) {
    this.bodies.push(object);
  }

  registerDynamicCollisionBody(object, collisionCallback) {
    if (collisionCallback) {
      object.target.userData.collisionCallbackRef = collisionCallback;
    }

    this.dynamicBodies.push(object);

    object.boundingBox.setFromObject(object.target);

    const bodySize = MathService.getVec3();
    object.boundingBox.getSize(bodySize);

    this.maxDynamicBodySize = Math.max(
      this.maxDynamicBodySize,
      bodySize.x,
      bodySize.y,
      bodySize.z
    );

    MathService.releaseVec3(bodySize);
  }

  registerNavmap(object) {
    this.enableNavmap(object);
  }

  enableNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);

    this.navmaps.push(object);

    this.updatePathfinder();
  }

  disableNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);

    this.updatePathfinder();
  }

  updatePathfinder() {
    if (!this.pathfinder) {
      this.pathfinder = new Pathfinding();
    }

    const navmapGeometries = this.navmaps.filter(navmap => navmap.geometry)
      .map(navmap => navmap.geometry);

    if (!navmapGeometries.length) {
      this.pathfinedEnabled = false;
      return;
    }

    const navmeshGeometry = mergeBufferGeometries(
      navmapGeometries,
      false
    );
    const zone = Pathfinding.createZone(navmeshGeometry);

    this.pathfinder.setZoneData(this.pathfinderZoneId, zone);

    this.pathfinedEnabled = this.pathfinder.zones.length > 0;
  }

  registerSurfaceHandler(
    surfaceType,
    handlerClass,
    onInteraction = 'onInteraction',
    onEnter = 'onEnter',
    onLeave = 'onLeave'
  ) {
    this.surfaceHandlers[surfaceType] = {
      cls: handlerClass,
      onInteraction,
      onEnter,
      onLeave
    };
  }

  registerSurface(object) {
    const surfaceType = object.userData.surface;
    const surfaceHandler = this.surfaceHandlers[surfaceType];

    if (!surfaceType) {
      return;
    }

    if (!surfaceHandler) {
      console.warn('registerSurface', `surfaceHandler for "${surfaceType}" does not exist`);

      return;
    }

    const surfaceConstructor = surfaceHandler.cls;

    object.userData.surfaceRef = new surfaceConstructor(object);

    this.surfaces.push(object);
  }

  getNavmaps() {
    return this.navmaps;
  }

  disposeBody(object) {
    this.bodies = this.bodies.filter(match => match !== object);
    this.dynamicBodies = this.dynamicBodies.filter(match => match !== object);
  }

  disposeNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);
  }

  disposeSurface(object) {
    this.surfaces = this.surfaces.filter(match => match !== object);
  }

  disposeAll() {
    this.bodies = [];
    this.dynamicBodies = [];
    this.navmaps = [];
    this.surfaces = [];
    this.surfaceHandlers = {};

    if (this.pathfinder) {
      this.pathfinder = null;
    }
  }
}

export const PhysicsService = new PhysicsServiceClass();