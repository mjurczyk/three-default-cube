import * as Three from 'three';
import { removePlaceholder } from '../utils/remove-placeholder';
import { defaultTo, MathUtils } from '../utils/shared';
import { AssetsService } from './assets-service';
import { MathService } from './math-service';
import { RenderService } from './render-service';
import { TimeService } from './time-service';
import { InstancedScene } from '../game-objects/built-in/instanced-scene';

class ParticleServiceClass {
  emitters = [];

  init() {
    TimeService.registerPersistentFrameListener(({ dt }) => {
      this.emitters.forEach(emitter => {
        const { particles, onFrame, onReset, active, instanced, instancedScene } = emitter;

        particles.forEach(target => {
          if (!target.visible) {
            if (!active) {
              return;
            } else if (!instanced) {
              target.visible = true;
            }
          }

          target.userData.lifeTime += dt;

          if (target.userData.lifeTime < 0.0) {
            target.visible = false;
            return;
          }

          const originalMatrix = MathService.getMatrix4();
          const originalMatrixWorld = MathService.getMatrix4();

          originalMatrix.copy(target.children[0].matrix);
          originalMatrixWorld.copy(target.children[0].matrixWorld);

          if (onFrame({
            target: target.children[0],
            random: target.userData.particleEmitterRandom,
            lifeTime: target.userData.lifeTime
          }) === false) {
            if (active) {
              if (onReset) {
                onReset({ target: target.children[0] });
              }

              this.createRandomParticle(target, emitter);
            } else {
              target.visible = false;
            }
          }

          if (instanced) {
            target.visible = false;
            target.children[0].visible = false;

            target.updateMatrix();
            target.updateMatrixWorld();

            if (
              !target.children[0].matrix.equals(originalMatrix) ||
              !target.children[0].matrixWorld.equals(originalMatrixWorld)  
            ) {
              instancedScene.markDirty(target.children[0]);
            } 
          }
        });
      });
    });
  }

  registerParticleEmitter(object, {
    particleObject,
    particleDensity,
    positionBase,
    rotationBase,
    scaleBase,
    positionJitter,
    rotationJitter,
    scaleJitter,
    spawnJitter,
    globalTransforms,
    onCreate,
    onFrame,
    onReset,
    instanced
  } = {}) {
    const emitterProps = {
      particleDensity: defaultTo(particleDensity, 10),
      positionBase: defaultTo(positionBase, [0.0, 0.0, 0.0]),
      rotationBase: defaultTo(rotationBase, [0.0, 0.0, 0.0]),
      scaleBase: defaultTo(scaleBase, [1.0, 1.0, 1.0]),
      positionJitter: defaultTo(positionJitter, [1.0, 1.0, 1.0]),
      rotationJitter: defaultTo(rotationJitter, [Math.PI, Math.PI, Math.PI]),
      scaleJitter: defaultTo(scaleJitter, 0.1),
      spawnJitter: defaultTo(spawnJitter, 0.0),
      globalTransforms: defaultTo(globalTransforms, false),
      particles: [],
      root: object,
      onFrame,
      onReset,
      active: true,
      instanced,
      instancedScene: null,
    };
    const scene = RenderService.getScene();

    emitterProps.play = () => emitterProps.active = true;
    emitterProps.stop = () => emitterProps.active = false;
    emitterProps.toggle = () => emitterProps.active = !emitterProps.active;

    removePlaceholder(object);

    if (!onFrame || !particleObject) {
      return;
    }

    if (instanced) {
      emitterProps.instancedScene = new InstancedScene(particleObject, emitterProps.particleDensity);

      scene.add(emitterProps.instancedScene);
    }

    AssetsService.registerDisposable(particleObject);

    for (let i = 0; i < emitterProps.particleDensity; i++) {
      const particle = new Three.Group();
      particle.add(particleObject.clone());
      
      this.createRandomParticle(particle, emitterProps);

      if (onCreate) {
        onCreate({ target: particle.children[0] });
      }

      if (globalTransforms) {
        scene.add(particle);
      } else {
        object.add(particle);
      }

      if (instanced) {
        particle.visible = false;

        emitterProps.instancedScene.addVirtualObject(particle.children[0]);
      }

      AssetsService.registerDisposable(particle);

      emitterProps.particles.push(particle);
    }

    this.emitters.push(emitterProps);

    return emitterProps;
  }

  createRandomParticle(pivot, emitterProps) {
    const {
      positionBase,
      rotationBase,
      scaleBase,
      positionJitter,
      rotationJitter,
      spawnJitter,
      scaleJitter,
      globalTransforms,
      root
    } = emitterProps;

    const object = pivot.children[0];
    const position = this.getUniformBase(positionBase);
    const rotation = this.getUniformBase(rotationBase);
    const scale = this.getUniformBase(scaleBase);
    const positionShift = this.getUniformRandomness(positionJitter);
    const rotationShift = this.getUniformRandomness(rotationJitter);
    const scaleShift = this.getUniformRandomness(scaleJitter);

    object.position.x = position[0] + positionShift[0];
    object.position.y = position[1] + positionShift[1];
    object.position.z = position[2] + positionShift[2];

    object.rotation.x = rotation[0] + rotationShift[0];
    object.rotation.y = rotation[1] + rotationShift[1];
    object.rotation.z = rotation[2] + rotationShift[2];

    object.scale.x = scale[0] + scaleShift[0];
    object.scale.y = scale[0] + scaleShift[1];
    object.scale.z = scale[0] + scaleShift[2];

    if (globalTransforms) {
      const transformVector = MathService.getVec3(0.0, 0.0, 0.0, 'particle-1');
      const transformQuaternion = MathService.getQuaternion();

      root.getWorldPosition(transformVector);
      root.getWorldQuaternion(transformQuaternion);

      pivot.position.copy(transformVector);
      pivot.quaternion.copy(transformQuaternion);
      pivot.scale.copy(root.scale);

      MathService.releaseVec3(transformVector);
      MathService.releaseQuaternion(transformQuaternion);
    }

    pivot.userData.lifeTime = spawnJitter ? -Math.random() * spawnJitter : 0.0;
    pivot.userData.particleEmitterRandom = Math.random();
  }

  getUniformBase(value) {
    if (value instanceof Array) {
      return [ value[0], value[1], value[2] ];
    } else if (value instanceof Three.Vector3) {
      return [ value.x, value.y, value.z ];
    } else if (typeof value === 'number') {
      return [ value, value, value ];
    }

    return [ 0, 0, 0 ];
  }

  getUniformRandomness(value) {
    if (value instanceof Array) {
      return [
        MathUtils.randFloatSpread(value[0]),
        MathUtils.randFloatSpread(value[1]),
        MathUtils.randFloatSpread(value[2]),
      ];
    } else if (value instanceof Three.Vector3) {
      return [
        MathUtils.randFloatSpread(value.x),
        MathUtils.randFloatSpread(value.y),
        MathUtils.randFloatSpread(value.z),
      ];
    } else if (typeof value === 'number') {
      const uniformRandom = MathUtils.randFloatSpread(value);

      return [ uniformRandom, uniformRandom, uniformRandom ];
    }

    return [ 0, 0, 0 ];
  }

  disposeAll() {
    delete this.emitters;

    this.emitters = [];
  }
}

export const ParticleService = new ParticleServiceClass();
