---
title: "DummyDebug"
draft: false
weight: 15
---

## DebugFlags

```
DebugFlags = {
  DEBUG_ENABLE,
  DEBUG_LIVE,
  DEBUG_LOG_MEMORY,
  DEBUG_LOG_POOLS,
  DEBUG_LOG_ASSETS,
  DEBUG_ORBIT_CONTROLS,
  DEBUG_SCROLL_VISIBLE,
  DEBUG_TIME_LISTENERS,
  DEBUG_SKINNING_SKELETONS,
  DEBUG_ADS,
  DEBUG_DISABLE_ADS,
  DEBUG_STORAGE,
  DEBUG_AI_NODES,
  DEBUG_AI_TARGETS,
  DEBUG_PHYSICS,
  DEBUG_PHYSICS_DYNAMIC,
}
```

## on ()

`on(flag)`

Enables specific debugging flag. Cannot be called after game is initialized.

## off ()

`off(flag)`

Disables specific debugging flag. Cannot be called after game is initialized.
