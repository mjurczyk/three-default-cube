---
title: "IV: Game Objects"
draft: false
weight: 5
demoId: 'game-objects'
---

## Building Scenes

Default Cube scenes are generally built with only 2 things: static meshes and game objects.

Game object declaration allows you to assign any kind of logic to a specific object exported from Blender.

```txt
gameObject: [gameObjectId]
```

`SceneService` parses and initializes each object separately:

Since each object is initialized only once - you can use `TimeService.registerFrameListener` to assign continuous logic to it.

```js
SceneService.parseScene({
  target: sceneModel,
  gameObjects: {
    'gameObjectId': (object) => {
      TimeService.registerFrameListener(() => {
        object.rotation.y += 0.1;
      });
    }
  },
  onCreate: () => {
    // NOTE Rest of the code
  }
});
```

Next: [Physics](/intro/physics/)
