---
title: "TODO"
draft: false
weight: 999
---

# Active Issues

Some or all of the things below may or may not be 100% working / are inconsistent / missing documentation.

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
