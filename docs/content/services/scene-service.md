---
title: "SceneService"
draft: false
weight: 15
---

## parseScene ()

```
parseScene({
  target,
  navpath = null,
  actions = {},
  gameObjects = {},
  onCreate,
})
```

Parse model as a Default Cube scene using parsers. `actions` and `gameObjects` are used to parse respective [Custom Properties](/advanced/custom-properties/).

`gameObject` and `action` parsers are called with the target object as the first argument and parsing payload as the second one (`gameObjectRefs` stores all existing game objects before the parsing is started):

```js
{
    scrollLists,
    actions,
    gameObjectRefs,
    aiNodes,
    aiSpawns,
    children,
  }
```

If `navpath` is specified, meshes with different value of `navpath` custom property are not added to the scene.

`onCreate` is called with:
```
{
  scene: target,
  scrollLists,
  actions,
  gameObjects,
  aiNodes,
  aiSpawns,
  children
}
```

## setBackgroundImage ()

`setBackgroundImage(texture, spherical = true)`

Assigns an environment map as a scene background.

## setBackground ()

`setBackground(background)`

Experimental. Stores a reference to a background object.

## getBackground ()

`getBackground()`

## setEnvironment ()

`setEnvironment(hdri)`

Assigns a HDRI map as a scene environment and reflections.

## getEnvironment ()

`getEnvironment()`
