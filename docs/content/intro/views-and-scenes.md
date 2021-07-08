---
title: "I: Views & Scenes"
draft: false
weight: 2
demoId: 'views-and-scenes'
---

## General Idea

Default Cube uses Three.js, JavaScript, and Blender files (exported as `.glb`) to create games.

To build a game with as little issues as possible, you should focus on creating *as much content as possible* in Blender. That way, Default Cube will be able to properly swap and dispose whichever assets you serve it.

**Note:** You can still use basic Three.js API to generate meshes and objects - but you should remember to manually dispose them. Otherwise you may start encountering memory leaks.

## Views & Scenes

It should be easy to imagine each view within Default Cube as a box - each containing separate meshes, textures, physics, audio, and so on.

The core idea of the framework is to allow you, as a developer, to add, modify, and remove the views - without worrying about leaked WebGL resources and memory leak troubles.

Views don't have to necessarily be rooms, or game levels. Since they can be dynamically toggled - views can also define things like the game UI.

## Quick Glossary

`AssetsService` ([docs](/services/assets-service)) - this service helps you load and dispose assets. You can combine it with a Preloader to create all necessary assets before showing the scene.

`Preloader` ([docs](/game-objects/preloader)) - this built-in object allows you to define a list of Promises that have to be fulfilled before the scene is allowed to render.

`SceneService` ([docs](/services/scene-service)) - this service allows you to parse a loaded scene model. We will dive deeper into parsing in the next section.

`GameInfoService` ([docs](/services/game-info-service)) - this service allows you to define core features of the game. Things like camera FOV setup, resolution, global variables, models etc.

`RenderService` ([docs](/services/render-service)) - this service gives you access to the raw Three.js features like renderer, native scene, and the native camera. 

`TimeService` ([docs](/services/time-service)) - this service allows you to register events that happen continuously.

`CameraService` ([docs](/services/camera-service)) - this service allows you to control the camera. We will discuss it more in futher sections.

Next: [Camera](/intro/camera/)
