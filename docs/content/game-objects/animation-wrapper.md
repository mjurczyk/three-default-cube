---
title: "AnimationWrapper"
draft: false
weight: 20
---

## playAnimation ()

`playAnimation(name, tweenDuration, reset, onFinish)`

Starts playing specific animation on the model.

If `reset` is set to `true` - animation will start from frame 0.

If `onFinish` callback is defined - animation will play only once. The callback is called when the animation reaches the last frame.

## stopAnimation ()

`stopAnimation(name, tweenDuration)`

Stops playing specific animation on the model.

## blendInAnimation ()

`blendInAnimation(name, blendWeight)`

Blends in specific animation on the model. `0.0` weight disables the blending.

## playAllAnimations ()

`playAllAnimations(tweenDuration)`

Plays all animations on the model at once.

## stopAllAnimations ()

`stopAllAnimations(tweenDuration)`

Stops all animations on the model at once.
