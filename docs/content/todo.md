---
title: "TODO"
draft: false
weight: 999
---

# Active Issues

Some or all of the things below may or may not be 100% working / are inconsistent / missing documentation.

## [ParserService] Remove var- prefix from labels

Originally labels were supposed to always use text read from `VarService` - but that's not necessary for static text. Also, `var-` prefix is inconsistent in terms of when it fetches a value from `VarService` and when it just uses direct value from Blender.

**Note:** This will likely break a lot of stuff in games running on first version, add
only after they are finished.

## [ParserService] Add variable notation

Use `:variable-name:` to denote variables in `userData`. Only values matching `:variable-name:` should be fetched from `VarService`.

**Note:** This will likely break a lot of stuff in games running on first version, add
only after they are finished.

## [ParserService] flatshade (ie. shading)

Deprecate `flatshade` in favor of using `shading` (ie. remove it from the code. `shading` is already implemented. `flatshade` remains for backwards compatibility.)

## [AssetsService] Rename getImage to getTexture

Since there's already `cloneTexture`, and game info uses `textures` field, there seems to be no reason for using an alternative name.

## [General] Uniform axes

Make sure axes exported from Blender are the same as three axes (Z-forward.)

## [AiService] Geometry AI nodes

For more complex AI nets separate geometry nodes lack "networking" factor. `aiNodeConnection` seems like an overkill of an attribute. Allow using any mesh as an `aiNodeMesh` - then generate aiNodes and connections between them based on that geometry faces.

## [AudioService] AudioMapping

Allow surfaces to make specific noises when interacted with (ex. metal boink when a character walks on a metal bridge.) Should work similarly to navmaps, with hue defining the correct audio.

## [Utils] Replacement should inherit original transforms

When replacing objects with `replacePlaceholder`, original transforms should be moved to the new object (to keep the orientation from Blender file.)

## [RenderService] Add pre-compile helper

Allow precompilling all scene materials with a helper method in RenderService.

## [AssetsService] Improve raycasting by using BVH

Add `three-mesh-bvh` as a default handler for raycasting.

## [SceneService] setBackgroundImage and setBackground naming

`setBackgroundImage` and `setBackground` seem to have exactly opposite meanings than their names. Double-check and rename properly.

# (Likely) Resolved

## Rename `physics-wrapper` to `physics-game-object`

`PhysicsWrapper` was originally bound to `GameObjectClass` - that was removed. Right now, to enable physics on an object manually, pass the parent object via the constructor:

```js
class Object extends GameObjectClass {
  physics = null;

  constructor() {
    super();

    this.physics = new PhysicsWrapper(this);
  }

  dispose() {
    this.physics.dispose();

    delete this.physics;
  }
}
```

## Rename `ai-wrapper` to `ai-game-object` (Kept `-wrapper` for consitency.)

Same as above - apply AI to an object by passing it via the constructor.

## [General] Add ConfigService

Add `ConfigService` to allow swapping config files easier (prod vs dev for example.) Read config values only from that service.

## [GameInfo] GameInfo and VarsService clarity

(Done) 1. Improve GameInfo vars clarity. It's a little hard to understand what goes where.
(Done) 2. Unify GameInfo vars. Using `game.options` and `game.system` etc. is quite misleading and arbitrary.

Config has been simplified to only include `system` (system-related variables), `vars` (global runtime variables), and `labels` (localized strings.)

## [GameInfo] Add automatic GameInfo parsing

Add parser for GameInfo that will ensure: (1) all mandatory properties are there / using default values, (2) GameInfo values cannot be accessed directly - only via getters.

## [AssetsService] Add userData flag signifying whether object was registered for disposal to prevent multiple disposals

Objects are likely registered for disposal multiple times - pretty much any service or class that uses any object almost automatically ensures this object is disposed when no longer needed.

Add `userData` flag to objects when they are registered for disposal - just for the sake of saving memory in `AssetsService`.
