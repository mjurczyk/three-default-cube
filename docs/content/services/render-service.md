---
title: "RenderService"
draft: false
weight: 15
---

## getScene ()

`getScene()`

Return native `Three.Scene`.

## getNativeCamera ()

`getNativeCamera()`

Return native `Three.PerspectiveCamera`.

## getRenderer ()

`getRenderer()`

Return native `Three.WebGLRenderer`.

## pauseRendering ()

`pauseRendering(callback)`

Pauses the renderer. `callback` is called on the first paused frame.

## resumeRendering ()

`resumeRendering(callback)`

Resumes the renderer. `callback` is called on the first rendered frame.
