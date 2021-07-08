---
title: "AnimationService"
draft: false
weight: 15
---

## registerAnimation ()

```
registerAnimation({
  target,
  onCreate,
  onStep,
  onDispose,
  interval,
  override = AnimationOverrideType.default,
  randomSeed = 0.0
})
```

Create new animation on target (similar to `TimeService.registerFrameListener`.)

`onCreate` is called with: `{ target }`
`onStep` is called with: `{ target, dt, animationTime, intervalTime }`
`onDispose` is called with `{ target }`. Allows to implement custom disposal.

`interval` is optional, must be in miliseconds (JavaScript default.)

## AnimationOverrideType

```js
{
  noOverride,
  overrideIfExists,
  ignoreIfExists
}
```
