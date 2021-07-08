---
title: "IX: AI"
draft: false
weight: 9
---

## Overview

Default Cube AI system contains 2 elements: AI game objects (wrapped in `AiWrapper`) and AI nodes.

## AI Nodes

AI nodes are static meshes with assigned custom property:

```txt
aiNode: [aiNodeId]
```

## AI Maps

AI maps are an extension of AI nodes.

```txt
aiMap: [aiMapId]
```

Each vertex of a static mesh with an assigned AI map custom property will become an independent AI node. This makes creating complex routing and behaviour a bit easier.

## AiWrapper & AI Behaviours

Each AI wrapper should provide an advice callback - using the game object position, state, and AI nodes.

```js
const ai = new AiWrapper(object);

ai.registerBehaviour(() => {
  if (!ai.hasTargetNode()) {
    ai.setTargetNode(AiService.getAiNodeById('start'));
  }

  // NOTE advice object can, for example, tell which direction should the character move next
  let advice = {
    w: false,
    a: false,
    s: false,
    d: false
  };

  const distanceToTarget = ai.getDistanceToTargetNode();
  const angleToTarget = ai.getGroundAngleToTargetNode();

  if (distance > 0.1) {
    advice.w = true;
  } else {
    ai.setTargetNode(AiService.getAiNodeById(ai.targetNodeId + 1));
  }

  if (angle < -0.1) {
    advice.d = true;
  } else if (angle > 0.1) {
    advice.a = true;
  }

  return advice;
});
```

In the game object definition you can then retrieve AI advice on each frame:

```js
SceneService.parseScene({
  target: sceneModel,
  gameObjects: {
    heroObject: (object) => {
      const ai = new AiWrapper(object);

      // NOTE Behaviour code

      TimeService.registerFrameListener(() => {
        const { w, a, s, d } = ai.getAiBehaviour();

        // NOTE React to AI advice
      });
    }
  }
  onCreate: () => {
    // NOTE Rest of the code
  }
});
```
