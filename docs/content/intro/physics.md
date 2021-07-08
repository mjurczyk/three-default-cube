---
title: "V: Physics"
draft: false
weight: 6
demoId: 'physics'
---

## Overview

Default Cube does give a few world-navigation helpers, but does not come with an actual physics engine. You are free to integrate any engine compatible with Three.js though.

## Navmeshes

You can limit the walkable area of every scene using navmeshes. When, for example, a character is moving around - `PhysicsService` will the check whether the character is within the allowed area. This allows you to easily create floors, walls, and doors.

**Note:** Navmeshes can be dynamically enabled and disabled using the `PhysicsService`.

```js
const hero = myHeroModel;

// NOTE Enable physics for the model using a PhysicsWrapper
const heroPhysics = new PhysicsWrapper(hero);
heroPhysics.enableNavmaps();
```

Navmaps can be declared directly within the Blender file using a custom property (it requires no value):

```txt
navmap: []
```

## Hit-testing

To determine collisions between two meshes, you can use `PhysicsService.registerDynamicCollisionBody`:

```js
PhysicsService.registerDynamicCollisionBody(hero, (hitObject) => {
  if (hitObject instanceof Enemy) {
    // NOTE Game logic
  }
});
```

## Surfaces

`PhysicsService` allows you to also register trigger surfaces - think of it as an extension of the navmaps idea.

Registered surface reacts to being stepped on, for example snow caving in. To setup a surface type, you need to first define the behaviour in code:

```js
class SampleSufrace {
  onInteraction(threeJsCollision) {
    console.info('Surface reached', { threeJsCollision });
  }
}

PhysicsService.registerSurfaceHandler('snow', SampleSufrace, 'onInteraction');
```

Then, in the Blender file, you can assign the surface type to specific meshes:

```txt
surface: [surfaceId]
```

Next: [Audio](/intro/audio/)
