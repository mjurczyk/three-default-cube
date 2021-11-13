---
title: "AssetsService"
draft: false
weight: 15
---

## getDefaultCube ()

Returns a cube.

## getAmbientLight ()

`getAmbientLight(groundColor = 0xffffff, skyColor = 0xffffff, intensity = 1.0)`

Returns a new hemisphere light, acting as an ambient light.

## getImage ()

`getImage(path)`

Fetches an image as a `Three.Texture`.

## getImageSync ()

See `getImage`. Synchronous.

## getHDRI ()

`getHDRI(path)`

Fetches a HDRI texture.

## getModel ()

```
getModel(
  path,
  {
    internalAllowPreloaded = true,
    forceUniqueMaterials = false,
    forceMaterialsType = null
  }
)
```

Fetches a glTF model.

If `forceUniqueMaterials` is set - every material on the model will be cloned to avoid reference duplication.

If `forceMaterialsType` is set - every material on the model will be converted to the passed material type. See `shading` in [Custom Properties List](/advanced/custom-properties/).

## preloadModel ()

```
preloadModel(
  path,
  {
    forceUniqueMaterials = false
  }
)
```

Fetches a glTF model and stores it in the service.

## preloadFont ()

`preloadFont(path)`

Fetches a [Troika](https://www.npmjs.com/package/troika-three-text)-compatible font.

## preloadAudio ()

`preloadAudio(path)`

Preloads a Howler audio. See [docs](https://github.com/goldfire/howler.js).

## getAudio ()

`getAudio(path)`

Fetches a Howler audio. See [docs](https://github.com/goldfire/howler.js).

## getMaterial ()

`getMaterial(name)`

Returns a clone of a saved material. See `cacheMaterial` in [Custom Properties List](/advanced/custom-properties/).

## saveMaterial ()

`saveMaterial(material)`

Stores a material using its name as an id.

## cloneMaterial ()

`cloneMaterial(material)`

Returns a clone of a material.

## cloneTexture ()

`cloneTexture(texture)`

Returns a clone of a texture.

## isDisposed ()

`isDisposed()`

Returns true if object has been already disposed.

## willBeDisposed ()

`willBeDisposed()`

Returns true if object has been registered for disposal. If object is disposed, this method returns false.
