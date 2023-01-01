---
title: "VII: Debugging"
draft: false
weight: 8
demoId: 'debugging'
---

## DebugService

`DebugService` is the main debugging tool of Default Cube games. To enable it, turn `DEBUG_ENABLE` flag on:

```js
DebugService.on(DebugFlags.DEBUG_ENABLE);
```

Afterwards, you can toggle various feature flags on and off to see different stats.

**Note:** `🅇` sign next to specific elements shows you how many resources could not be disposed. These numbers should stay low - but it's alright if they do not reach 0.

Next: [Persistence](/intro/persistence/)
