import { DQ } from "../utils/constants";

class GameInfoServiceClass {
  config = {
    system: {},
    vars: {},
    labels: {},
    textures: {},
    models: {},
    audio: {},
    shaders: {},
    fonts: {},
    animations: {},
  };

  constructor() {
    this.system();
    this.camera();
  }

  addConfig(config = {}) {
    this.config = {
      ...this.config,
      ...config
    };

    return this;
  }

  system(
    fps = 0,
    pixelRatio,
    antialiasing = true,
    postprocessing = true,
    sceneBackgroundDefault = 0x000000,
    correctBlenderLights = true
  ) {
    return this.addConfig({
      system: {
        ...(this.config.system || {}),
        fps,
        pixelRatio: typeof pixelRatio !== 'undefined' ? pixelRatio : window.devicePixelRatio,
        antialiasing,
        postprocessing,
        sceneBackgroundDefault,
        correctBlenderLights
      }
    });
  }

  vr(enabled = true) {
    return this.addConfig({
      system: {
        ...(this.config.system || {}),
        vr: enabled,
        postprocessing: false
      }
    });
  }

  camera(
    fov = 50,
    near = 0.1,
    far = 2000.0,
  ) {
    return this.addConfig({
      system: {
        ...(this.config.system || {}),
        camera: { fov, near, far }
      }
    });
  }

  shadows(
    enabled = DQ.ShadowsAllObjects,
    resolution = 1024,
    radius = 4,
    type = Three.PCFShadowMap
  ) {
    return this.addConfig({
      system: {
        ...(this.config.system || {}),
        shadows: enabled,
        shadowsResolution: resolution,
        shadowsRadius: radius,
        shadowMapType: type
      }
    });
  }

  initialVars(vars = {}) {
    return this.addConfig({
      vars: {
        ...(this.config.vars || {}),
        ...vars
      }
    });
  }

  vars(vars = {}) {
    return this.initialVars(vars);
  }

  labels(
    language = 'en',
    vars = {}
  ) {
    return this.addConfig({
      labels: {
        ...(this.config.labels || {}),
        [language]: vars
      }
    });
  }

  animation(id, animation) {
    return this.addConfig({
      animations: {
        ...(this.config.animations || {}),
        [id]: animation
      }
    });
  }

  font(id, font) {
    return this.addConfig({
      fonts: {
        ...(this.config.fonts || {}),
        [id]: font
      }
    });
  }

  texture(id, texture) {
    return this.addConfig({
      textures: {
        ...(this.config.textures || {}),
        [id]: texture
      }
    });
  }

  model(id, model) {
    return this.addConfig({
      models: {
        ...(this.config.models || {}),
        [id]: model
      }
    });
  }

  audio(id, audio) {
    return this.addConfig({
      audio: {
        ...(this.config.audio || {}),
        [id]: audio
      }
    });
  }

  shader(id, shader) {
    return this.addConfig({
      shaders: {
        ...(this.config.shaders || {}),
        [id]: shader
      }
    });
  }

  custom(
    key,
    value
  ) {
    if (!key) {
      return;
    }

    return this.addConfig({ [key]: value });
  }
}

export const GameInfoService = new GameInfoServiceClass();
