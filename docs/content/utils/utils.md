---
title: "Built-in Utils"
draft: false
weight: 500
---

## Math 𝛑 Helpers

`Math.PI` shorthands - `math2Pi`, `mathPi2`, `mathPi4`, `mathPi8`.

## removePlaceholder ()

`removePlaceholder(mesh)`

Remove mesh from the scene.

## replacePlaceholder ()

`replacePlaceholder(mesh, replacement)`

Replace mesh with another one. Original mesh is removed.

## cloneValue ()

`cloneValue(object)`

Return a deep-clone of a JavaScript value. Does not preserve prototypes.

## getRandomColor ()

`getRandomColor()`

Returns a random `Three.Color`.

## getRandomElement ()

`getRandomElement(array)`

Returns a random element from an array.

## spliceRandomElement ()

`spliceRandomElement(array)`

Splices and returns a random element from an array. Returns an element directly, not as an array.

## moduloAngle ()

`moduloAngle(radians)`

Module an angle. No idea, math is hard.

## defaultTo ()

`defaultTo(value, defaultValue)`

Returns second argument if the first one is undefined. Otherwise, returns the first argument.

## swapVectors ()

Swaps two `Three.Vector3` values.
