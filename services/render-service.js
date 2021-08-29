import * as Three from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ClearPass } from 'postprocessing';
import { AnimationService } from './animation-service';
import { AssetsService } from './assets-service';
import { CameraService } from './camera-service';
import { InteractionsService } from './interactions-service';
import { TimeService } from './time-service';
import { VarService } from './var-service';
import { PhysicsService } from './physics-service';
import { InputService } from './input-service';
import { UiService } from './ui-service';
import { DebugFlags, DummyDebug } from './dummy-debug';
import { AudioService } from './audio-service';
import { ParticleService } from './particle-service';
import { GameInfoService } from './game-info-service';

class RenderServiceClass {
  systemClock = new Three.Clock();
  animationClock = new Three.Clock();
  animationDelta = 0.0;
  camera = null;
  renderer = null;
  composer = null;
  postProcessingEffects = {};
  scene = null;
  controls = null;
  currentView = null;
  paused = false;
  onPaused = null;
  onResumed = null;

  animationLoop = null;
  systemLoop = null;

  constructor() {
    window.addEventListener('resize', () => this.onResize());
  }

  getScene() {
    return this.scene;
  }

  getNativeCamera() {
    return this.camera;
  }

  getRenderer() {
    return this.renderer;
  }

  init({ domElement, pixelRatio } = {}) {
    const windowInfo = this.getWindowSize();

    const camera = new Three.PerspectiveCamera(
      GameInfoService.config.system.camera.fov,
      windowInfo.aspectRatio,
      GameInfoService.config.system.camera.near,
      GameInfoService.config.system.camera.far,
    );
    this.camera = camera;

    const scene = new Three.Scene();
    scene.background = new Three.Color(GameInfoService.config.system.sceneBackgroundDefault);

    this.scene = scene;

    const renderer = new Three.WebGLRenderer({
      antialias: GameInfoService.config.system.antialiasing,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    });

    renderer.toneMapping = Three.ACESFilmicToneMapping;
    renderer.outputEncoding = Three.sRGBEncoding;
    renderer.autoClear = false;

    renderer.setPixelRatio(typeof pixelRatio === 'number' ? pixelRatio : GameInfoService.config.system.pixelRatio);
    renderer.setSize(windowInfo.width, windowInfo.height);

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.overflow = 'hidden';

    this.renderer = renderer;

    this.scene.add(this.camera);

    if (GameInfoService.config.system.postprocessing) {
      const composer = new EffectComposer(this.renderer, {
        frameBufferType: Three.HalfFloatType,
      });
      composer.multisampling = 0;

      this.composer = composer;

      this.initPostProcessing();
    }

    if (domElement) {
      domElement.appendChild(renderer.domElement);
    }

    this.initEssentialServices();

    if (DummyDebug.get(DebugFlags.DEBUG_ORBIT_CONTROLS)) {
      CameraService.detachCamera();
    }
  }

  initEssentialServices() {
    VarService.init({ language: 'en' });
    InteractionsService.init({ camera: this.camera });
    PhysicsService.init();
    CameraService.init({ camera: this.camera });
    InputService.init();
    ParticleService.init();
    AudioService.init({ root: this.camera });
  }

  initPostProcessing() {
    const worldRenderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(worldRenderPass);
    
    this.composer.addPass(new ClearPass(false, true, false));
    
    const uiRenderPass = new RenderPass(UiService.uiScene, this.camera);
    uiRenderPass.clear = false;
    this.composer.addPass(uiRenderPass);

    this.composer.addPass(new ClearPass(false, true, false));

    const bloomDefaults = {
      luminanceThreshold: 0.0,
      luminanceSmoothing: 0.8,
      intensity: 0.2,
      kernelSize: 5,
      width: 256,
      height: 256,
    };
    const bloomEffect = new BloomEffect(bloomDefaults);
    const bloomPass = new EffectPass(this.camera, bloomEffect);
    this.composer.addPass(bloomPass);

    this.postProcessingEffects.bloom = {
      effect: BloomEffect,
      pass: bloomPass,
      defaults: bloomDefaults
    };
  }

  updatePostProcessingEffect(id, values = {}) {
    if (!this.postProcessingEffects[id]) {
      return;
    }

    this.composer.removePass(this.postProcessingEffects[id].pass);

    this.postProcessingEffects[id].pass.dispose();
    this.postProcessingEffects[id].pass = null;

    const newEffect = new BloomEffect({
      ...(this.postProcessingEffects[id].defaults || {}),
      ...values
    });
    const newPass = new EffectPass(this.camera, newEffect);
    this.composer.addPass(newPass);

    this.postProcessingEffects[id].pass = newPass;
  }

  resetPostProcessingEffect(id) {
    if (!this.postProcessingEffects[id]) {
      return;
    }

    this.updatePostProcessingEffect(id);
  }

  resetPostProcessing() {
    Object.keys(this.postProcessingEffects).forEach(effect => {
      this.resetPostProcessingEffect(effect);
    });
  }

  run() {
    this.onAnimationFrame();
    this.onSystemFrame();
  }

  renderView(viewInstance) {
    if (this.currentView) {
      this.currentView.dispose();

      delete this.currentView;
    }

    this.currentView = viewInstance;

    DummyDebug.leaks.geometries = Math.max(DummyDebug.leaks.geometries, this.renderer.info.memory.geometries);
    DummyDebug.leaks.textures = Math.max(DummyDebug.leaks.textures, this.renderer.info.memory.textures);

    viewInstance.onCreate();
  }

  onSystemFrame() {
    if (this.systemLoop) {
      clearTimeout(this.systemLoop);
    }

    this.systemLoop = setTimeout(() => this.onSystemFrame(), 1000 / 60);

    const dt = this.systemClock.getDelta();
    const elapsedTime = this.systemClock.getElapsedTime();

    TimeService.onFrame({ dt, elapsedTime });
  }

  onAnimationFrame() {
    if (this.animationLoop) {
      cancelAnimationFrame(this.animationLoop);
    }

    this.animationLoop = requestAnimationFrame(() => this.onAnimationFrame());

    const dt = this.animationClock.getDelta();

    if (!this.paused) {
      CameraService.onFrame();
      UiService.onFrame();

      if (this.composer) {
        this.composer.render(dt);
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      if (this.onResumed) {
        this.onResumed();

        this.onResumed = null;
      }
    } else {
      if (this.onPaused) {
        this.onPaused();

        this.onPaused = null;
      }
    }
  }

  onResize() {
    const windowInfo = this.getWindowSize();

    if (this.camera) {
      this.camera.aspect = windowInfo.aspectRatio;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(windowInfo.width, windowInfo.height);
    }

    if (this.composer) {
      this.composer.setSize(windowInfo.width, windowInfo.height);
    }
  }

  getWindowSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
    };
  }

  pauseRendering(whenPaused) {
    this.paused = true;
    this.onResumed = null;

    if (whenPaused) {
      this.onPaused = whenPaused;
    } else {
      return new Promise((resolve) => {
        this.onPaused = resolve();
      });
    }
  }

  resumeRendering(whenResumed) {
    this.paused = false;
    this.onPaused = null;

    if (whenResumed) {
      this.onResumed = whenResumed;
    } else {
      return new Promise((resolve) => {
        this.onResumed = resolve();
      });
    }
  }

  dispose() {
    if (this.currentView) {
      this.currentView.dispose();
      delete this.currentView;

      delete this.currentView;
    }

    if (this.controls) {
      this.controls.dispose();

      delete this.controls;
    }

    if (this.renderer) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      this.renderer.dispose();

      delete this.renderer;
    }

    if (this.composer) {
      this.composer.dispose();

      delete this.composer;
    }

    if (this.camera) {
      delete this.camera;
    }

    if (this.scene) {
      AssetsService.disposeAll();
      AnimationService.disposeAll();
      TimeService.disposeAll();
      AudioService.disposeAll();

      delete this.scene;
    }

    if (this.onPaused) {
      this.onPaused = null;
    }

    if (this.onResumed) {
      this.onResumed = null;
    }
  }
}

export const RenderService = new RenderServiceClass();
