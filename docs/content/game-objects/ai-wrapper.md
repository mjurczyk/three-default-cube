---
title: "AiWrapper"
draft: false
weight: 20
---

## registerBehaviour ()

`registerBehaviour(callback)`

Stores an AI decision making callback. `callback` is called without any arguments and should return an AI decision based on object position, surroundings, and state. See [AI](/intro/ai/).

## getAiBehaviour ()

`getAiBehaviour()`

Retrieves AI decision for the current object state. Returns decision based on `registerBehaviour` callback.

## hasTargetNode ()

`hasTargetNode()`

Returns true if object currently has a target `aiNode`. See `aiNode` in [Custom Properties List](/advanced/custom-properties/).

## setTargetNode ()

`setTargetNode(nodeObject)`

Sets node as a current target node.

## getDistanceToTargetNode ()

`getDistanceToTargetNode()`

Returns vector distance to the current target node. `0.0` if no node is assigned.

## getGroundAngleToTargetNode ()

`getGroundAngleToTargetNode()`

Returns distance on XZ plane to the target node. `0.0` if no node is assigned.
