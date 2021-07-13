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

Returns true if object currently has a target `aiNode`.

Returns true if object has nodes left in their `path`. If target node is not defined, but `path` exists - first node in the path is automatically assigned as the target node. See `findPathToTargetNode`.

See `aiNode` in [Custom Properties List](/advanced/custom-properties/).

## setTargetNode ()

`setTargetNode(nodeObject)`

Sets node as a current target node.

## getTargetNode ()

`getTargetNode()`

Returns current target node.

## getDistanceToTargetNode ()

`getDistanceToTargetNode()`

Returns vector distance to the current target node. `0.0` if no node is assigned.

## getGroundAngleToTargetNode ()

`getGroundAngleToTargetNode()`

Returns angle on XZ plane to the target node. `0.0` if no node is assigned.

## findPathToTargetNode ()

`findPathToTargetNode()`

Find a shortest path to the currently set target node.

If path exists - target node is replaced with the first node of the path.

**Note:** To make pathfinding work flawlessly, consider turning `PhysicsWrapper.enableNoClip()` on when traveling along the path. Path nodes can be perfectly aligned with navmesh corners - which may at times be considered outside of the navmesh.

See [AI](/intro/ai/).

## getPathLength ()

`getPathLength()`

Returns amount of nodes left in the path. See `findPathToTargetNode`.

See [AI](/intro/ai/).
