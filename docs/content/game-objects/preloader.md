---
title: "Preloader"
draft: false
weight: 20
---

## Overview

Preloader object helps setting up views and loading models before displaying them.

```js
new Preloader({
  requireAssets: [
    AssetsService.getModel(GameInfoService.config.models.world),
    AssetsService.getModel(GameInfoService.config.models.hero),
  ],
  onComplete: ([
    worldModel,
    heroModel
  ]) => {
    // NOTE Both models can be assumed to be fully ready at this point.
  }
});
```

## constructor

`Preloader({ requireAssets, onComplete, spinnerTexture })`

Creates a new preloader. `onComplete` is called only when all `requireAssets` are ready. If one or more assets fail or error, preloader will not display the scene.
