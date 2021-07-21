---
title: "TimeService"
draft: false
weight: 15
---

## registerFrameListener ()

`registerFrameListener(onFrame)`

Creates a continuous loop. Calls `onFrame` on each frame. Frame listeners are cancelled when view is disposed.

If a listener returns `false`, it is automatically disposed.

## registerPersistentFrameListener ()

`registerPersistentFrameListener(onFrame)`

Similar to `registerFrameListener`, but the listener is never disposed. 

**Note:** May cause memory leaks.

## registerIntervalListener ()

`registerIntervalListener(onIntervalStep, intervalTime)`

Creates an interval listener similar to `setInterval`. Interval listeners are cancelled when view is disposed.

If a listener returns `false`, it is automatically disposed.
