---
title: "InteractionsService"
draft: false
weight: 15
---

## InteractionEnums

```
{
  eventClick,
  eventDrag,
  eventHold,
  eventRelease,
  eventLeave,
}
```

## registerListener ()

`registerListener(target, interactionEnum, callback)`

## registerInvisibleListener ()

`registerInvisibleListener(target, interactionEnum, callback)`

Allows the interaction listener to be invisible, while still triggering the event callback.
