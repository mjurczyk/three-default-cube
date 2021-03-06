---
title: "CameraService"
draft: false
weight: 15
---

## getCamera ()

`getCamera(id)`

Returns a camera. See `camera` in [Custom Properties List](/advanced/custom-properties/).

## useCamera ()

`useCamera(camera, instant = false)`

Moves viewport to a specific camera. If instant is not specified, camera is tweened according to `CameraService.tween`.

## follow ()

`follow(object, onReachTarget, freezeFrame)`

Moves viewport to follow a specific mesh. `onReachTarget` is optionally called when camera reaches the target.

By default, rendering is paused on the first frame to prevent jumpy frames. To disable frame freeze, set `freezeFrame` to `false`.

## getFollowPivot ()

`getFollowPivot()`, `CameraService.followPivotPosition`

Requires `follow()` to be enabled. Returns a follow pivot. Use `followPivotPosition` to specify the distance camera should keep from the target.

## stopFollowing ()

`stopFollowing()`

Disables `follow()`.

## getCameraAsTexture ()

`getCameraAsTexture(id, { width, height, minFilter, magFilter } = {})`

Experimental. Returns specific camera as a `Three.Texture` using render targets. May affect performance.

## preventOcclusion ()

```
preventOcclusion({
  allowTransparent,
  faceTarget,
  collisionRadius,
  occlusionStep
})
```

Experimental.

## allowOcclusion ()

`allowOcclusion()`

Disables `preventOcclusion()`.

## lockTranslation ()

`lockTranslation()`

Locks camera translation.

## lockRotation ()

`lockRotation()`

Locks camera rotation.

## unlockTranslation ()

`unlockTranslation()`

Unlocks camera translation.

## unlockRotation ()

`unlockRotation()`

Unlocks camera rotation.

