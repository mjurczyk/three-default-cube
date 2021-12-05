---
title: "GameInfoService"
draft: false
weight: 15
---

## system ()

```
system(
  fps = 60,
  pixelRatio = 1.5,
  antialiasing = true,
  postprocessing = true,
  sceneBackgroundDefault = 0x000000,
)
```

## camera ()

```
camera(
  fov = 50,
  near = 0.1,
  far = 2000.0,
)
```

## vr (enabled = true)

```
vr(
  enabled = true
)
```

Enable VR capabilities. Disables postprocessing and enabled XR-compatible rendering loop.

## vars ()

`vars({ varKey: varValue, ... })`

Adds variables to the system config.

## labels ()

`labels(language = 'en', vars)`

Adds localized string variables to the system config. Similar to `vars`.

## animation ()

`animation(id, animation)`

Registers a system animation. See `animation` in [Custom Properties List](/advanced/custom-properties/).

Template in `game-animations`.

## font ()

`font(id, font)`

Registers a system font. See `labelFont` in [Custom Properties List](/advanced/custom-properties/).

## texture ()

`texture(id, imagePath)`

Registers a global image reference. Can be used in views as:

```js
AssetsService.getImage(GameInfoService.config.textures.sampleTexture);
```

## model ()

`model(id, modelPath)`

Registers a global model reference. Can be used in views as:

```js
AssetsService.getModel(GameInfoService.config.models.sampleModel);
```

## audio ()

`audio(id, audioPath)`

Registers a global audio reference. Can be used in views as:

```js
AssetsService.getAudio(GameInfoService.config.textaudioures.sampleTrack);
```

## shader ()

`shader(id, shader)`

Registers a system shader. See `shader` in [Custom Properties List](/advanced/custom-properties/).

Template in `game-shaders`.

## custom ()

`custom(key, value)`

Adds a custom key to system configuration.
