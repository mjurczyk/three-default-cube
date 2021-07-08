---
title: "Custom Properties List"
draft: false
weight: 10
---

## action

Value: action id (string)

Assign a click action. See [Actions & UI](/intro/actions-and-ui/).

## aiNode

Value: node id (string)

Declare mesh to be an AI node. This removes the mesh from the scene. See [AI](/intro/ai/).

## aiSpawn

Value: none

Declare mesh to be an AI spawn. This removes the mesh from the scene. See [AI](/intro/ai/).

## align

Values: `left`, `right`.

Align mesh to a side of the screen. This effect is continuous and may affect performance.

## animation

Value: animation id (string)

Assign a global animation script. See [Controlling Animations](/advanced/controlling-animations/).

## cacheMaterial

Value: none

Save mesh material to `AssetsService`. Material can be retrieved in-code using `AssetsService.getMaterial(materialName)`. Material is disposed on scene change.

## camera

Value: camera id (string)

Declare mesh to be a camera. This removes the mesh from the scene. See [Camera](/intro/camera/).

## fullscreen

Scale mesh to cover the entire screen based on camera position and FOV. This effect is continuous and may affect performance.

**Note:** If `fullscreenOffset` is not defined, object will be scaled continously. This may severely affect framerate.

## fullscreenOffset

Value: constant offset (number)

Offset at which camera is assumed to be located.

## fullscreenPreserveRatio

Value: none

Preserve scale ratio when applying `fullscreen` effect.

## gameObject

Value: game object id (string)

Declare mesh to be a game object. See [Game Objects](/intro/game-objects/).

## label

Value: text (string) or variable (:variable:)

Declare mesh to be a label placeholder. This removes the mesh from the scene. See [Actions & UI](/intro/actions-and-ui/).

## labelFont

Value: font id (string)

Assign font family to a `label`. Font must be defined using `GameInfoService.font`. Falls back to `GameInfoService.config.fonts.default`.

## labelSize

Value: font size (number)

Define font size for `label`. Default is `1.0`.

## labelAlign

Value: `left`, `center`, `right`

Define font alignment for `label`. Default is `center`.

## labelColor

Value: color (string, prefixed with `#`)

Define font color for `label`. Default is `#ffffff`. Color value must be compatible with `Three.Color`.

## labelOutlineColor

Value: color (string, prefixed with `#`)

Define outline color for `label`. If not defined, outline is not added. Color value must be compatible with `Three.Color`.

## material

Value: material id (string) or variable (:variable:)

Assign material to mesh. Material must be defined using `AssetsService.saveMaterial` or `cacheMaterial`.

## navmap

Value: none

Declare mesh to be a navmap. This removes the mesh from the scene. See [Views & Scenes](/intro/views-and-scenes/) and [Physics](/intro/physics/). 

## navpath

Value: navpath id (string)

Declare mesh to be a navpath. See [SceneService.parseScene#navpath](/services/scene-service). If defined, mesh is only added to the scene if value matches the current `parseScene` navpath value.

## rotateX / Y / Z

Value: angular velocity (number)

Rotate mesh.

## scroll

Value: scroll container id (number)

Assign mesh to a scroll container. Meshes in a container can be scrolled by panning.

## shader

Value: shader id (string)

Assign shader to mesh. Shader must be defined using `GameInfoService.shader`.

## shading

Value: `basic`, `normal`, `depth`, `lambert`, `phong`, `standard`, `physical`, `toon`, `matcap` (string) or variable (:variable:)

Convert default `MeshStandardMaterial` to another material type.

## slideshow

Value: none

Declare mesh to be a slideshow. Slideshow mesh UV map is split into X/Y panels and shifts over time. Requires either `slidesX` or `slidesY`.

## slidesX

Value: slide count (number)

Amount of horizontal UV slides. Default is `1.0`;

## slidesY

Value: slide count (number)

Amount of vertical UV slides. Default is `1.0`;

## surface

Value: surface id (string)

Declare mesh to be of specific surface type. Surface handler must be registered using `PhysicsService.registerSurfaceHandler`. See [Physics](/intro/physics/).

## if

Value: value (string) or variable (:variable:)

Show mesh only if value is truthy.

## ifNot

Value: value (string) or variable (:variable:)

Show mesh only if value is falsy.
