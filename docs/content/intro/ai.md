---
title: "IX: AI"
draft: false
weight: 9
demoId: 'ai'
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

  // NOTE Advice object can, for example, tell which direction should the character move next
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

## Pathfinding

Using Default Cube navmaps and `AiWrapper` you can find a path between two points on the scene. This allows you to plan a path an object should move along:

```js
SceneService.parseScene({
  target: sceneModel,
  gameObjects: {
    heroObject: (object) => {
      const physics = new PhysicsWrapper(object);
      physics.enableNavmaps();

      // NOTE Pathfinding can sometimes move the object to the edge of a navmesh
      //      which PhysicsService will consider leaving a navmap. To prevent annoying
      //      stutter - consider disabling navmap clipping when using pathfinding.
      physics.enableNoClip();

      const ai = new AiWrapper(object);

      ai.registerBehaviour(() => {
        if (ai.hasTargetNode() && ai.getDistanceToTargetNode() <= 0.5) {
          ai.setTargetNode(null);
        }

        if (!ai.hasTargetNode() || ai.path.length === 0) {
          ai.setTargetNode(AiService.getAiNodeById('targetNode'));
          ai.findPathToTargetNode();
        }

        return { targetNode: ai.getTargetNode() };
      });

      TimeService.registerFrameListener(() => {
        const { targetNode } = ai.getAiBehaviour();

        if (!targetNode) {
          return;
        }

        const targetNodePosition = MathService.getVec3();
        targetNode.getWorldPosition(targetNodePosition);

        object.lookAt(targetNodePosition);

        const heroDirection = MathService.getVec3();
        object.getWorldDirection(heroDirection);

        object.setSimpleVelocity(heroDirection);

        MathService.releaseVec3(targetNodePosition);
        MathService.releaseVec3(heroDirection);
      });
    }
  },
  onCreate: () => {
    // NOTE Rest of the code
  }
});
```
