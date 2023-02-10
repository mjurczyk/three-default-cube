import * as Three from 'three';
import * as Cannon from 'cannon-es';
import * as BufferGeometryScope from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createBoxHelper } from '../utils/helpers';
import { AssetsService } from './assets-service';
import { DebugFlags, DebugService } from './debug-service';
import { MathService } from './math-service';
import { RenderService } from './render-service';
import { TimeService } from './time-service';
import { UtilsService } from './utils-service';
import { Pathfinding } from 'three-pathfinding';
import { defaultTo, isDefined } from '../utils/shared';
import { NetworkEnums, NetworkService } from './network-service';

class PhysicsServiceClass {
  physicsSmoothing = 0.75;

  physicsWorld = null;
  physicsLoop = null;
  physicsStaticBodies = null;

  navmaps = [];
  pathfinder = null;
  pathfinedEnabled = false;
  pathfinderZoneId = 'zone';

  surfaceHandlers = {};
  surfaces = [];

  init() {
    if (!this.physicsWorld) {
      const physicsWorld = new Cannon.World({
        gravity: new Cannon.Vec3(0.0, -9.86, 0.0)
      });

      this.physicsWorld = physicsWorld;
    }
  }

  onFrame({ dt }) {
    if (!this.physicsWorld) {
      return;
    }

    this.physicsWorld.bodies.forEach(body => {
      const { targetRef } = body;

      if (body.mass === 0.0 || body.type === Cannon.Body.STATIC) {
        body.allowSleep = true;

        return;
      }

      targetRef.position.lerp(body.position, this.physicsSmoothing);
      targetRef.quaternion.copy(body.quaternion);
    });

    if (dt !== 0) {
      this.physicsWorld.fixedStep();
    }
  }

  registerBody(object, physicsConfig) {
    const {
      physicsShape,
      physicsSize,
      physicsCapsuleHeight,
      physicsStatic,
      physicsFriction,
      physicsRestitution,
      physicsWeight,
      physicsCollisionGroup,
      physicsPreventRotation,
      physicsHidden,
      physicsDamping
    } = physicsConfig;
    const scene = RenderService.getScene();

    if (object.userData.cannonRef) {
      return;
    }

    if (object === scene) {
      console.warn('PhysicsService', 'registerBody', 'attempting to register root scene as physically active object', { object });

      return;
    }

    if (object.parent !== scene) {
      console.warn('PhysicsService', 'registerBody', 'only direct children of the Scene can be physically active', { object });

      const worldPosition = MathService.getVec3();
      object.getWorldPosition(worldPosition);

      scene.add(object);
      object.position.copy(worldPosition);

      MathService.releaseVec3(worldPosition);
    }

    if (physicsHidden) {
      object.visible = false;
    }

    const quaternion = MathService.getQuaternion();
    quaternion.copy(object.quaternion);
    object.quaternion.identity();
    const position = MathService.getVec3();
    position.copy(object.position);
    object.position.set(0.0, 0.0, 0.0);
    const box3 = UtilsService.getBox3();

    if (!physicsSize) {
      object.traverse(child => {
        if (child.isMesh) {
          const worldBbox = UtilsService.getBox3();
          worldBbox.expandByObject(child);

          child.updateMatrix();
          child.updateMatrixWorld();
          const worldTransform = child.matrixWorld.clone();
          const [ e11, e21, e31, e41, e12, e22, e32, e42, e13, e23, e33, e43, e14, e24, e34, e44 ] = worldTransform.elements;

          worldTransform.set(
            e11, e12, e13, 0.0,
            e21, e22, e23, 0.0,
            e31, e32, e33, 0.0,
            e41, e42, e43, e44
          );
          worldBbox.applyMatrix4(worldTransform);

          box3.union(worldBbox);

          UtilsService.releaseBox3(worldBbox);
        }
      });
    } else {
      box3.setFromCenterAndSize(
        new Three.Vector3(0.0, 0.0, 0.0),
        new Three.Vector3(physicsSize / 2.0, physicsSize / 2.0, physicsSize / 2.0)
      );
    }

    object.quaternion.copy(quaternion);
    object.position.copy(position);
    MathService.releaseVec3(position);
    MathService.releaseQuaternion(quaternion);

    const objectSize = MathService.getVec3();
    box3.getSize(objectSize);
    
    const shape = ({
      'box': new Cannon.Box(new Cannon.Vec3(objectSize.x / 2.0, objectSize.y / 2.0, objectSize.z / 2.0)),
      'plane': new Cannon.Plane(),
      'sphere': new Cannon.Sphere(objectSize.x / 2.0),
    })[physicsShape] || new Cannon.Sphere(objectSize.x / 2.0);

    const material = new Cannon.Material({
      friction: defaultTo(physicsFriction, 0.3),
      restitution: defaultTo(physicsRestitution, 0.3)
    });

    let body;
    let bodyDebugColor;

    if (physicsShape === 'plane') {
      object.rotateX(-Math.PI / 2.0); // NOTE Fix z-up planes
    }

    if (physicsStatic) {
      if (!this.physicsStaticBodies) {
        const physicsStaticBodies = new Cannon.Body({
          mass: 0.0,
          material: material,
          allowSleep: true,
          type: Cannon.Body.STATIC
        });

        this.physicsWorld.addBody(physicsStaticBodies);
        this.physicsStaticBodies = physicsStaticBodies;
      }

      this.physicsStaticBodies.addShape(
        shape,
        new Cannon.Vec3().copy(object.position),
        new Cannon.Quaternion().copy(object.quaternion)
      );

      body = this.physicsStaticBodies;
      bodyDebugColor = new Three.Color(0xff00ff);

      // NOTE Cannot remove or dispose a merged static body
    } else {
      body = new Cannon.Body({
        mass: physicsStatic ? 0.0 : (physicsWeight || 1.0),
        material: material,
        collisionFilterGroup: physicsCollisionGroup || -1,
        collisionFilterMask: physicsCollisionGroup || -1,
        fixedRotation: isDefined(physicsPreventRotation),
        linearDamping: physicsDamping,
        angularDamping: physicsDamping,
      });
      bodyDebugColor = new Three.Color(Math.random() * 0x888888 + 0x888888);

      if (physicsShape === 'capsule') {
        const horizontalSpan = objectSize.x / 2.0;

        body.addShape(new Cannon.Sphere(horizontalSpan), new Cannon.Vec3(0.0, horizontalSpan / 2.0, 0.0));

        if (physicsCapsuleHeight > 0.0) {
          body.addShape(
            new Cannon.Box(new Cannon.Vec3(horizontalSpan / 2.0, physicsCapsuleHeight / 2.0, horizontalSpan / 2.0)),
            new Cannon.Vec3(0.0, physicsCapsuleHeight / 2.0 + horizontalSpan / 2.0, 0.0)
          );
          body.addShape(new Cannon.Sphere(horizontalSpan), new Cannon.Vec3(0.0, physicsCapsuleHeight + horizontalSpan / 2.0, 0.0));
        }
      } else {
        body.addShape(shape);
      }

      body.position.copy(object.position);
      body.quaternion.copy(object.quaternion);

      this.physicsWorld.addBody(body);

      AssetsService.registerDisposeCallback(object, () => {
        this.physicsWorld.removeBody(body);
      });

      body.name = object.name;
      body.gameObject = object.gameObject;

      if (!body.userData) {
        body.userData = {};
      }

      NetworkService.registerSyncObject(body);
    }
    
    if (physicsShape === 'plane') {
      object.rotateX(Math.PI / 2.0);
    }

    object.userData.cannonRef = body;
    body.targetRef = object;

    if (DebugService.get(DebugFlags.DEBUG_PHYSICS)) {
      if (object.userData.collisionBox) {
        return;
      }

      const helper = createBoxHelper(object, object.uuid, box3.clone());
      helper.material.color.set(bodyDebugColor);
      helper.material.transparent = true;
      helper.material.opacity = 0.25;

      const debugSize = new Three.Vector3();
      box3.getSize(debugSize);
      debugSize.addScalar(0.01);

      const debugBox = new Three.Mesh(
        ({
          'box': new Three.BoxBufferGeometry(debugSize.x / 2.0, debugSize.y / 2.0, debugSize.z / 2.0),
          'plane': new Three.PlaneBufferGeometry(debugSize.x, debugSize.z),
          'sphere': new Three.SphereBufferGeometry(debugSize.x / 2.0, 8, 8),
          'capsule': new Three.CapsuleGeometry(debugSize.x / 2.0, physicsCapsuleHeight, 8, 8)
        })[physicsShape] || new Three.SphereBufferGeometry(debugSize.x / 2.0, 8, 8),
        new Three.MeshBasicMaterial({
          color: bodyDebugColor,
          wireframe: true
        })
      );
      box3.getCenter(debugBox.position);

      if (physicsShape === 'plane') {
        debugBox.rotateX(Math.PI / 2.0);
      } else if (physicsShape === 'capsule') {
        debugBox.translateY(physicsCapsuleHeight / 2.0 + debugSize.x / 4.0);
      }

      object.add(debugBox);

      object.userData.collisionBox = debugBox;
    }

    MathService.releaseVec3(objectSize);
    UtilsService.releaseBox3(box3);

    return body;
  }

  registerConstraint(objectA, objectB, distance) {
    if (!this.physicsWorld) {
      return;
    }

    const scene = RenderService.getScene();

    if (objectA === scene || objectB === scene) {
      console.info('PhysicsService', 'registerConstraint', 'attempting to connect object to root scene. Forgot to assign parent?', { objectA, objectB });
      return;
    }

    if (!objectA.userData.cannonRef) {
      console.info('PhysicsService', 'registerConstraint', 'attempting to connect non-physical object to a constraint', { objectA, objectB });
      return;
    }

    if (!objectB.userData.cannonRef) {
      console.info('PhysicsService', 'registerConstraint', 'attempting to connect non-physical object to a constraint', { objectA, objectB });
      return;
    }

    this.disposeConstraintOnBody(objectA.userData.cannonRef);
    this.disposeConstraintOnBody(objectB.userData.cannonRef);

    const constraint = new Cannon.PointToPointConstraint(
      objectA.userData.cannonRef,
      new Cannon.Vec3(0.0, 0.0, 0.0),
      objectB.userData.cannonRef,
      new Cannon.Vec3(0.0, -distance, 0.0)
    );
    this.physicsWorld.addConstraint(constraint);

    objectA.physicsConstraintRef = constraint;
    objectB.physicsConstraintRef = constraint;

    return constraint;
  }

  disposeConstraintOnBody(object) {
    if (!this.physicsWorld || !object.physicsConstraintRef) {
      return;
    }

    this.physicsWorld.removeConstraint(object.physicsConstraintRef);
    object.physicsConstraintRef = null;
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

    const navmeshGeometry = (BufferGeometryScope.mergeBufferGeometries ? BufferGeometryScope : BufferGeometryScope.BufferGeometryUtils).mergeBufferGeometries(
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

    const surface = new surfaceConstructor(object);

    if (surface.onInteraction) surface.onInteraction = surface.onInteraction.bind(surface);
    if (surface.onEnter) surface.onEnter = surface.onEnter.bind(surface);
    if (surface.onLeave) surface.onLeave = surface.onLeave.bind(surface);

    object.userData.surfaceRef = surface;

    this.surfaces.push(object);
  }

  getNavmaps() {
    return this.navmaps;
  }

  disposeNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);
  }

  disposeSurface(object) {
    this.surfaces = this.surfaces.filter(match => match !== object);
  }

  disposeAll() {
    this.physicsWorld.removeBody(this.physicsStaticBodies);
    this.physicsStaticBodies = null;

    this.navmaps = [];
    this.surfaces = [];

    MathService.releaseVec3(this.emptyVector3);

    if (this.pathfinder) {
      this.pathfinder = null;
    }
  }
}

export const PhysicsService = new PhysicsServiceClass();