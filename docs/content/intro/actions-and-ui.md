---
title: "III: Actions & UI"
draft: false
weight: 4
demoId: 'actions-and-ui'
---

## Key Inputs

You can add keyboard interactions using a combination of `InputService` and `TimeService`:

```js
TimeService.registerFrameListener(() => {
  const keyUp = InputService.key('w');

  if (keyUp) {
    hero.position.z += 1.0;
  }
});
```

**Note:** Keyboard controls do not work on mobile devices in most cases. Be sure to add touch fallbacks to allow people to play on mobile.

## Touch & Mouse Inputs

Default Cube combines both touch and click inputs into **actions**. Actions are declared per-scene in the `SceneService.parseScene`. Each action is executed whenever an assigned object is pressed.

To assign an action to a specific object on the scene, use a custom property in Blender:

```txt
action: [actionId]
```

Then define action behaviour in the parser:

```js
SceneService.parseScene({
  target: sceneModel,
  actions: {
    'exampleActionId': (object) => {
      // NOTE Action receives a single parameter when activated - the object that has been clicked

      object.rotation.x += 0.1;
    }
  },
  onCreate: () => {
    // NOTE Rest of the code
  }
});
```

## User Interface

Since Default Cube runs on top of Three.js and WebGL - you are allowed to create HTML UI overlaying the rendering canvas. This may have some slight caveats though when it comes to portability between mobile and web games.

On the other hand, Default Cube also allows you to create UI as scenes - composed out of actions and game objects. To do that, you are also given control over variables in the `SceneService`.

First, define a variable in the `GameInfoService`:

```js
GameInfoService.vars({
  'playerHealth': 100,
  'playerName': 'Ogar'
});
```

These variables are global and reactive - meaning you can also listen to variable state at any time (using `VarService`):

```js
const initialPlayerName = VarService.getVar('playerName', (newName) => {
  console.info({newName});
});

// NOTE initialPlayerName is assigned `Ogar`

VarService.setVar('playerName', 'Beliarek');

// NOTE console is activated, logging: { newName: 'Beliarek' }
```

Knowing the basics of Default Cube variables - you can now assign them inside Blender using a double-colon variable notation:

```txt
someCustomProperty: [:variableId:]
```

Variables assigned in the scene are automatically updated according to the `GameInfoService` - this allows you to dynamically change text, textures, and behaviours.

**Note:** Some properties may not update dynamically. Be sure to check the documentation.

## User Interface Text

To create a useful UI you usually need some kind of text. Using Blender text meshes or textures would be less than optimal - instead, you can create placeholders in the scene that are later going to be replaced by Default Cube with actual text:

```txt
label: [:variableId: | "static text"]
labelFont: [:variableId: | fontId]
labelAlign: [:variableId: | 'left' | 'right' | 'center']
labelSize: [:variableId: | fontSize]
labelColor: [:variableId: | '#HEX']
labelOutlineColor: [:variableId: | '#HEX']
```

**Note:** Any mesh with a label property will removed and replaced with a label.

## Camera-facing User Interface

`UiService` allows you to additionally make a particular object or scene always face the camera - and render above all other objects. To register a specific scene as a UI view, it's enough to do:

```js
SceneService.parseScene({
  target: sceneModel,
  onCreate: ({ scene }) => {
    // NOTE onCreate is called with an object describing various elements on the scene, and the scene itself

    UiService.registerUiElement(scene);
  }
});
```

Next: [Game Objects](/intro/game-objects/)

See Also: [UI Alignment](/advanced/ui-alignment/)
