---
title: "Controlling Animations"
draft: false
weight: 12
---

## Animation Wrappers

Apply an `AnimationWrapper` to a mesh to parse its animations:

```js
const animations = new AnimationWrapper(characterModel);
```

Use the animation wrapper to play and blend the animations on the mesh:

```js
animations.playAnimation('idle');
animations.blendInAnimation('run', 0.5);
```
