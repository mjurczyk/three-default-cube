import * as Three from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ClearPass, SMAAImageLoader, SMAAEffect, SMAAPreset, EdgeDetectionMode, PredicationMode, ToneMappingMode, ToneMappingEffect } from 'postprocessing';
import { AnimationService } from './animation-service';
import { AssetsService } from './assets-service';
import { CameraService } from './camera-service';
import { InteractionsService } from './interactions-service';
import { TimeService } from './time-service';
import { VarService } from './var-service';
import { PhysicsService } from './physics-service';
import { InputService } from './input-service';
import { UiService } from './ui-service';
import { DebugFlags, DebugService } from './debug-service';
import { AudioService } from './audio-service';
import { ParticleService } from './particle-service';
import { GameInfoService } from './game-info-service';
import { NetworkServerSideInstanceUserAgent } from './network-service';

class RenderServiceClass {
  isHeadless = navigator.userAgent === NetworkServerSideInstanceUserAgent;
  systemClock = new Three.Clock();
  animationClock = new Three.Clock();
  animationDelta = 0.0;
  camera = null;
  renderer = null;
  composer = null;
  postProcessingEffects = {};
  smaaPostprocessingTextures = {};
  depthMaterial = null;
  depthRenderTarget = null;
  scene = null;
  controls = null;
  currentView = null;
  paused = false;
  onPaused = null;
  onResumed = null;
  onBeforeRenderFrame = null;
  onBeforeRenderDepth = null;
  onAfterRenderDepth = null;
  onAfterRenderFrame = null;

  animationLoop = null;
  logicLoop = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.onResize());
    }
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
    const isHeadless = typeof domElement === 'undefined' || this.isHeadless;
    const windowInfo = this.getWindowSize();

    this.isHeadless = isHeadless;

    const scene = new Three.Scene();
    scene.background = new Three.Color(GameInfoService.config.system.sceneBackgroundDefault);

    this.scene = scene;

    if (!isHeadless) {
      this.camera = new Three.PerspectiveCamera(
        GameInfoService.config.system.camera.fov,
        windowInfo.aspectRatio,
        GameInfoService.config.system.camera.near,
        GameInfoService.config.system.camera.far,
      );
    } else {
      this.camera = new Three.PerspectiveCamera(1.0, 1.0, 0.0, 1.0);
    }

    this.scene.add(this.camera);

    if (GameInfoService.config.system.vr) {
      GameInfoService.config.system.postprocessing = false;
    }

    let renderer;

    if (!isHeadless) {
      renderer = new Three.WebGLRenderer({
        antialias: GameInfoService.config.system.antialiasing && !GameInfoService.config.system.postprocessing,
        powerPreference: 'high-performance'
      });

      renderer.toneMapping = Three.ACESFilmicToneMapping;
      renderer.outputEncoding = Three.sRGBEncoding;
      renderer.autoClear = false;
      renderer.physicallyCorrectLights = true;

      renderer.xr.enabled = GameInfoService.config.system.vr || false;

      renderer.setPixelRatio(typeof pixelRatio === 'number' ? pixelRatio : GameInfoService.config.system.pixelRatio);
      renderer.setSize(windowInfo.width, windowInfo.height);

      if (GameInfoService.config.system.shadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = GameInfoService.config.system.shadowMapType || Three.PCFShadowMap;
      }

      renderer.domElement.style.display = 'block';
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = 0;
      renderer.domElement.style.left = 0;
      renderer.domElement.style.width = '100vw';
      renderer.domElement.style.height = '100vh';
      renderer.domElement.style.overflow = 'hidden';

      this.renderer = renderer;

      if (GameInfoService.config.system.postprocessing) {
        const composer = new EffectComposer(this.renderer, {
          frameBufferType: Three.HalfFloatType,
        });
        composer.multisampling = 0;

        this.composer = composer;

        this.initPostProcessing();
      }

      domElement.appendChild(renderer.domElement);
    }

    this.initEssentialServices();

    const depthMaterial = new Three.MeshDepthMaterial();
    depthMaterial.depthPacking = Three.RGBADepthPacking;
    depthMaterial.blending = Three.NoBlending;

    const depthTexturesSupport = isHeadless ? false : !!renderer.extensions.get('WEBGL_depth_texture');

    const depthRenderTarget = new Three.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    depthRenderTarget.texture.minFilter = Three.NearestFilter;
    depthRenderTarget.texture.magFilter = Three.NearestFilter;
    depthRenderTarget.texture.generateMipmaps = false;
    depthRenderTarget.stencilBuffer = false;
  
    if (depthTexturesSupport) {
      depthRenderTarget.depthTexture = new Three.DepthTexture();
      depthRenderTarget.depthTexture.type = Three.UnsignedShortType;
      depthRenderTarget.depthTexture.minFilter = Three.NearestFilter;
      depthRenderTarget.depthTexture.maxFilter = Three.NearestFilter;
    }

    this.depthMaterial = depthMaterial;
    this.depthRenderTarget = depthRenderTarget;

    if (DebugService.get(DebugFlags.DEBUG_ORBIT_CONTROLS)) {
      CameraService.detachCamera();
    }
  }

  initEssentialServices() {
    DebugService.init();
    VarService.init({ language: 'en' });
    InteractionsService.init({ camera: this.camera });
    PhysicsService.init();
    CameraService.init({ camera: this.camera, renderer: this.renderer });
    InputService.init();
    ParticleService.init();
    AudioService.init({ root: this.camera });
  }

  initPostProcessing() {
    if (this.isHeadless) {
      return;
    }

    const worldRenderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(worldRenderPass);
    
    this.composer.addPass(new ClearPass(false, true, false));
    
    const uiRenderPass = new RenderPass(UiService.uiScene, this.camera);
    uiRenderPass.clear = false;
    this.composer.addPass(uiRenderPass);

    this.composer.addPass(new ClearPass(false, true, false));

    if (GameInfoService.config.system.antialiasing && this.smaaPostprocessingTextures.area && this.smaaPostprocessingTextures.search) {
      const smaaEffect = new SMAAEffect(
        this.smaaPostprocessingTextures.search,
        this.smaaPostprocessingTextures.area,
        SMAAPreset.HIGH,
        EdgeDetectionMode.COLOR
      );

      smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.02);
      smaaEffect.edgeDetectionMaterial.setPredicationMode(PredicationMode.DEPTH);
      smaaEffect.edgeDetectionMaterial.setPredicationThreshold(0.002);
      smaaEffect.edgeDetectionMaterial.setPredicationScale(1.0);

      const smaaPass = new EffectPass(this.camera, smaaEffect);
      this.composer.addPass(smaaPass);
    } else {
      console.info('RenderService', 'initPostProcessing', 'SMAA textures not available', {
        area: this.smaaPostprocessingTextures.area,
        search: this.smaaPostprocessingTextures.search
      });
    }

    const toneMappingEffect = new ToneMappingEffect({
      mode: ToneMappingMode.REINHARD2_ADAPTIVE,
      resolution: 256,
      whitePoint: 10.0,
      middleGrey: 1.0,
      minLuminance: 0.01,
      averageLuminance: 0.01,
      adaptationRate: 0.75
    });

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

    const toneMappingPass = new EffectPass(this.camera, toneMappingEffect);
    this.composer.addPass(toneMappingPass);

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

  renderView(viewInstance) {
    if (this.currentView) {
      this.currentView.dispose();

      delete this.currentView;
    }

    this.currentView = viewInstance;

    if (!this.isHeadless) {
      DebugService.leaks.geometries = Math.max(DebugService.leaks.geometries, this.renderer.info.memory.geometries);
      DebugService.leaks.textures = Math.max(DebugService.leaks.textures, this.renderer.info.memory.textures);
    }

    viewInstance.onCreate();
  }

  resetPostProcessing() {
    Object.keys(this.postProcessingEffects).forEach(effect => {
      this.resetPostProcessingEffect(effect);
    });
  }

  createSMAATextures() {
    if (this.isHeadless) {
      return;
    }

    return new Promise(resolve => {
      const smaaImageLoader = new SMAAImageLoader();
      smaaImageLoader.disableCache = true;

      smaaImageLoader.load(([ search, area ]) => {
        this.smaaPostprocessingTextures.search = search;
        this.smaaPostprocessingTextures.area = area;

        resolve();
      });
    });
  }

  run() {
    this.runAnimationLoop();
    this.runLogicLoop();
  }

  runAnimationLoop() {
    if (this.isHeadless) {
      return;
    }

    if (!this.renderer.xr.enabled) {
      this.onAnimationFrame();
    } else {
      this.renderer.setAnimationLoop(() => this.onAnimationFrame());
    }
  }

  lastFrameTimestamp = 0;
  logicFixedStep = 1000.0 / 60.0;

  runLogicLoop() {
    if (this.logicLoop) {
      clearTimeout(this.logicLoop);
    }

    // NOTE setTimeout lets the logic progress, even if the user switched the tab and paused rendering
    this.logicLoop = setTimeout(() => this.runLogicLoop(), this.logicFixedStep);

    const now = performance.now();
    const dt = now - this.lastFrameTimestamp;

    if (dt >= this.logicFixedStep) {
      this.lastFrameTimestamp = now;

      const steps = Math.floor(dt / this.logicFixedStep);

      for (let i = 0; i < steps; i++) {
        this.onLogicFrame();
      }
    }
  }

  onLogicFrame() {
    const dt = this.systemClock.getDelta();
    const elapsedTime = this.systemClock.getElapsedTime();

    if (!this.isHeadless) {
      CameraService.onFrame(dt);
      UiService.onFrame();
    }

    TimeService.onFrame({ dt, elapsedTime });
  }

  onAnimationFrame() {
    if (!this.renderer.xr.enabled) {
      if (this.animationLoop) {
        if (GameInfoService.config.system.fps) {
          clearTimeout(this.animationLoop);
        } else {
          cancelAnimationFrame(this.animationLoop);
        }
      }

      if (GameInfoService.config.system.fps) {
        this.animationLoop = setTimeout(() => this.onAnimationFrame(), 1000.0 / GameInfoService.config.system.fps);
      } else {
        this.animationLoop = requestAnimationFrame(() => this.onAnimationFrame());
      }
    }

    const dt = this.animationClock.getDelta();

    if (!this.paused) {
      if (this.onBeforeRenderFrame) {
        this.onBeforeRenderFrame();
      }

      if (this.depthMaterial && this.depthRenderTarget) {
        if (this.onBeforeRenderDepth) {
          this.onBeforeRenderDepth();
        }

        this.scene.overrideMaterial = this.depthMaterial;

        this.renderer.setRenderTarget(this.depthRenderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);

        this.scene.overrideMaterial = null;

        if (this.onAfterRenderDepth) {
          this.onAfterRenderDepth();
        }
      }

      if (this.composer) {
        this.composer.render(dt);
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      if (this.onResumed) {
        this.onResumed();

        this.onResumed = null;
      }

      if (this.onAfterRenderFrame) {
        this.onAfterRenderFrame();
      }
    } else {
      if (this.onPaused) {
        this.onPaused();

        this.onPaused = null;
      }
    }

    if (DebugService.stats) {
      DebugService.stats.update();
    }
  }

  onResize() {
    if (this.isHeadless) {
      return;
    }

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

    if (this.depthRenderTarget) {
      this.depthRenderTarget.setSize(
        windowInfo.width,
        windowInfo.height
      );
    }
  }

  getWindowSize() {
    if (this.isHeadless) {
      return {
        width: 0.0,
        height: 0.0,
        aspectRatio: 1.0
      };
    }

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
