---
title: "II: Camera"
draft: false
weight: 3
demoId: 'camera'
---

## Default Cube vs Three.js Camera

While Three.js allows you to use multiple cameras on the scene, Default Cube uses always only a single camera.

That camera can dynamically switch and tween between positions and orientations. It can also follow objects around the game world.

## Switching Cameras

Cameras are defined per-view. You can define any object to act as a camera using a custom property:

```txt
camera: [cameraId]
```

When the scene is loaded, you can then find cameras using the `CameraService`:

```js
SceneService.parseScene({
  target: sceneModel,
  onCreate: () => {
    const cameraById = CameraService.getCamera('exampleCameraId');

    CameraService.useCamera(
      cameraById,
      true // NOTE You can either smoothly float or instantly jump to the next camera
    );
  }
});
```

## Following Objects

You can ask the `CameraService` to follow a specific object in the game - and keep a certain distance using a pivot.

```js
CameraService.follow(object);
CameraService.followPivotPosition.set(0.0, 2.0, 2.0);
```

Next: [Actions & UI](/intro/actions-and-ui/)
