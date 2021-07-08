---
title: "VIII: Persistence"
draft: false
weight: 9
demoId: 'persistence'
---

## Saving Variables

Default Cube uses Ionic native storage to save variables locally. To register a permanent variable, request it at the beginning of the game (using the `VarService`):

```js
await VarService.registerPersistentVar('playerName', 'Banjer');

VarService.setVar('playerName', 'Finn');
```

Whenever the specific variable is updated, it will also be saved locally.

Next: [AI](/intro/ai/)
