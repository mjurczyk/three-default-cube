---
title: "PhysicsService"
draft: false
weight: 15
---

## enableNavmap ()

`enableNavmap(object)`

Declares object as a navmap.

## disableNavmap ()

`disableNavmap(object)`

Disabled object as a navmap.

## registerSurfaceHandler ()

`registerSurfaceHandler(surfaceType, handlerClass, onInteraction, onEnter, onLeave)`

Registers a new surface handler. Second argument should be a class, not an object. `onInteraction` is called with default `Three` ray intersection payload, whenever a dynamic game object touches the surface on Y-axis. See [Physics](/intro/physics/).

`onEnter` and `onLeave` are optional listeners which work similarly to `onInteraction` - but are called only once at a time.
