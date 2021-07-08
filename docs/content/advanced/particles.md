---
title: "Particles"
draft: false
weight: 12
---

## Creating Particle Emitters

Particles are created using `ParticleService`.

The goal of using a particle emitter is to spawn a higher amount of similarly looking / behaving objects, from an approximately same spot.

**Note:** Particles can be emitted from any `Object3D` - it can be either a game object defined in the parsed scene, or a manually created Three `Object3D`.

**Note:** You can use `emitter.play()` and `emitter.stop()` to spawn particles only when necessary.

```js
// ...
'game-object': (object) => {
  // Create a particle base shape
  const dustParticle = new Three.Mesh(
    new Three.SphereBufferGeometry(0.1, 8, 6),
    new Three.MeshBasicMaterial({
      color: 0xeeeeee
    })
  );

  // Register an emmiter (emitter will replace the source object)
  this.dustParticleEmitter = ParticleService.registerParticleEmitter(object, {
    particleObject: dustParticle,
    particleDensity: 30,
    positionJitter: 0.5,
    onFrame: ({ target, random, lifeTime }) => {
      // Modify the particle over time

      return lifeTime < endOfLife;
    }
  });
}
// ...
```

Particle emitter properties:

## particleObject: Object3D

Mesh that will be spawned as particles.

## particleDensity: number

Amount of particles.

## positionBase / rotationBase / scaleBase: [x, y, z] | number

Initial transformation values for each particle.

## positionJitter / rotationJitter / scaleJitter: [x, y, z] | number

Random jitter applied to each particle separately.

## spawnJitter: number

Random delay added to the particle spawn timing.

## globalTransforms: boolean

Make particles independent of their parent transformations.

## onCreate: function ({ target })

Optional function called when a particle is generated in the memory. Particles by default are shallow copies of the same object. In case of an complex particle, with changing materials or children, you can use this function to ensure each particle
creates a deep copy of necessary object.

* `target` - The particle.

## onFrame: function ({ target, random, lifeTime })

Function called on each frame for each particle.

* `target` - The particle.
* `random` - A unique value assigned to each particle (between 0.0 and 1.0.)
* `lifeTime` - A total time this particle spent in the scene.

**Note:** `onFrame` must return a boolean. When the function returns `false`, the particle is removed and a new one is generated in its place.

## onReset: function ({ target })

Optional function called when a particle is about to be generated. If `onFrame` function modifies elements like children or materials - you can use `onReset` to return them to an initial state.

* `target` - The particle.

