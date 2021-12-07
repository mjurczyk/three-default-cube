'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Three = require('three');
var uuid = require('uuid');
var GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader');
var RGBELoader = require('three/examples/jsm/loaders/RGBELoader');
var postprocessing = require('postprocessing');
var Stats = require('three/examples/jsm/libs/stats.module');
var core = require('@capacitor/core');
var admob = require('@capacitor-community/admob');
var nativeStorage = require('@ionic-native/native-storage');
var OrbitControls = require('three/examples/jsm/controls/OrbitControls');
var BufferGeometryScope = require('three/examples/jsm/utils/BufferGeometryUtils');
var threePathfinding = require('three-pathfinding');
var howler = require('howler');
var troikaThreeText = require('troika-three-text');
var threeDefaultCube = require('three-default-cube');
var navigationBar = require('@ionic-native/navigation-bar');
var screenOrientation = require('@ionic-native/screen-orientation');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

var Three__namespace = /*#__PURE__*/_interopNamespace(Three);
var uuid__namespace = /*#__PURE__*/_interopNamespace(uuid);
var Stats__default = /*#__PURE__*/_interopDefaultLegacy(Stats);
var BufferGeometryScope__namespace = /*#__PURE__*/_interopNamespace(BufferGeometryScope);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

class TimeServiceClass {
  constructor() {
    _defineProperty(this, "frameListeners", []);

    _defineProperty(this, "intervals", {});

    _defineProperty(this, "persistentFrameListeners", {});
  }

  createTimeoutPromise(timeout = 1000) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  registerFrameListener(onFrame) {
    this.frameListeners.push(onFrame);
    return onFrame;
  }

  registerIntervalListener(onIntervalStep, intervalTime = 1000) {
    const interval = intervalTime / 1000.0;

    if (!this.intervals[interval]) {
      this.intervals[interval] = {
        time: interval,
        listeners: []
      };
    }

    this.intervals[interval].listeners.push(onIntervalStep);
  }

  registerPersistentFrameListener(onFrame) {
    const persistentUid = uuid__namespace.v4();
    this.persistentFrameListeners[persistentUid] = onFrame;
    return persistentUid;
  }

  onFrame({
    dt,
    elapsedTime
  }) {
    this.frameListeners = this.frameListeners.filter(listener => {
      return listener({
        dt,
        elapsedTime
      }) !== false;
    });
    Object.keys(this.persistentFrameListeners).forEach(uid => {
      const listener = this.persistentFrameListeners[uid];

      if (listener({
        dt,
        elapsedTime
      }) === false) {
        this.disposePersistentListener(listener);
      }
    });
    Object.keys(this.intervals).forEach(key => {
      const intervals = this.intervals[key];
      intervals.time -= dt;

      if (intervals.time <= 0.0) {
        intervals.listeners = intervals.listeners.filter(listener => {
          return listener({
            dt,
            elapsedTime
          }) !== false;
        });

        if (intervals.listeners.length === 0) {
          delete this.intervals[key];
        }

        intervals.time = key;
      }
    });
  }

  disposeFrameListener(frameListener) {
    this.frameListeners = this.frameListeners.filter(match => match !== frameListener);
  }

  disposePersistentListener(uid) {
    delete this.persistentFrameListeners[uid];
  }

  disposeIntervalListener(intervalListener, intervalTime) {
    if (intervalTime) {
      if (this.intervals[intervalTime]) {
        this.intervals[intervalTime].listeners = this.intervals[intervalTime].listeners.filter(match => match !== intervalListener);

        if (this.intervals[intervalTime].listeners.length === 0) {
          delete this.intervals[intervalTime];
        }
      }

      return;
    }

    Object.keys(this.intervals).forEach(key => {
      this.intervals[key].listeners = this.intervals[key].listeners.filter(match => match !== intervalListener);

      if (this.intervals[key].listeners.length === 0) {
        delete this.intervals[key];
      }
    });
  }

  disposeAll() {
    this.frameListeners = [];
    this.intervals = {};
  }

}

const TimeService = new TimeServiceClass();

const animateLinearInverse = (x, duration = 1.0, offset = 1.0) => offset - Math.min(x, duration) / duration * offset;
const animateLinear = (x, duration = 1.0, offset = 1.0) => Math.min(x, duration) / duration * offset;
const animateDelay = (x, delay = 0.0) => Math.max(0.0, x - delay);
const AnimationOverrideType = {
  default: 0,
  noOverride: 0,
  overrideIfExists: 1,
  ignoreIfExists: 2
};

class AnimationServiceClass {
  constructor() {
    _defineProperty(this, "animations", []);

    _defineProperty(this, "frameListenerUid", null);

    this.initLoop();
  }

  initLoop() {
    this.frameListenerUid = TimeService.registerPersistentFrameListener(({
      dt,
      elapsedTime
    }) => {
      this.onStep({
        dt,
        elapsedTime
      });
    });
  }

  onStep({
    dt,
    elapsedTime
  }) {
    const time = elapsedTime;
    this.animations = this.animations.filter(animation => {
      const {
        onStep,
        target,
        interval
      } = animation;

      if (typeof onStep !== 'function' || !target) {
        return false;
      }

      if (target.__disposed__) {
        AssetsService.disposeAsset(target);
        return false;
      }

      animation.animationTime += dt;
      animation.intervalTime += dt;

      if (interval === 0 || animation.intervalTime >= interval) {
        const result = onStep({
          target,
          dt,
          time,
          animationTime: animation.animationTime,
          intervalTime: animation.intervalTime
        });
        animation.intervalTime = animation.intervalTime - interval;

        if (result === false) {
          animation.dispose();
          return false;
        }
      }

      return true;
    });
  }

  registerAnimation({
    target,
    onCreate,
    onStep,
    onDispose: customDispose,
    interval,
    override = AnimationOverrideType.default,
    randomSeed = 0.0
  } = {}) {
    if (!target || !onStep) {
      return;
    }

    if (target.userData.animationServiceRef) {
      if (override === AnimationOverrideType.ignoreIfExists) {
        return target.userData.animationServiceRef;
      } else if (override === AnimationOverrideType.overrideIfExists) {
        this.cancelAnimation(target.userData.animationServiceRef);
      }
    }

    const animation = {
      target,
      onStep,
      interval: interval ? interval / 1000.0 : 0.0,
      animationTime: randomSeed,
      intervalTime: 0.0,
      dispose: () => {
        if (customDispose) {
          customDispose({
            target
          });
        }

        this.animations = this.animations.filter(item => item !== animation);
        delete target.userData.animationServiceRef;
      }
    };

    if (onCreate) {
      onCreate(animation);
    }

    this.animations.push(animation);
    target.userData.animationServiceRef = animation;
    return animation;
  }

  cancelAnimation(animation) {
    if (animation.dispose) {
      animation.dispose();
    }

    this.animations = this.animations.filter(item => item !== animation);
  }

  disposeAll() {
    this.animations = this.animations.filter(({
      target
    }) => {
      if (target.userData) {
        delete target.userData.animationServiceRef;
      }

      return false;
    });
    this.animations = [];
  }

  dispose() {
    if (this.frameListenerUid) {
      TimeService.disposePersistentListener(this.frameListenerUid);
    }
  }

}

const AnimationService = new AnimationServiceClass();

class GameInfoServiceClass {
  constructor() {
    _defineProperty(this, "config", {
      system: {},
      vars: {},
      labels: {},
      textures: {},
      models: {},
      audio: {},
      shaders: {},
      fonts: {},
      animations: {}
    });

    this.system();
    this.camera();
  }

  addConfig(config = {}) {
    this.config = { ...this.config,
      ...config
    };
    return this;
  }

  system(fps = 60, pixelRatio = 1.5, antialiasing = true, postprocessing = true, sceneBackgroundDefault = 0x000000, correctBlenderLights = true) {
    return this.addConfig({
      system: { ...(this.config.system || {}),
        fps,
        pixelRatio,
        antialiasing,
        postprocessing,
        sceneBackgroundDefault,
        correctBlenderLights
      }
    });
  }

  vr(enabled = true) {
    return this.addConfig({
      system: { ...(this.config.system || {}),
        vr: enabled,
        postprocessing: false
      }
    });
  }

  camera(fov = 50, near = 0.1, far = 2000.0) {
    return this.addConfig({
      system: { ...(this.config.system || {}),
        camera: {
          fov,
          near,
          far
        }
      }
    });
  }

  initialVars(vars = {}) {
    return this.addConfig({
      vars: { ...(this.config.vars || {}),
        ...vars
      }
    });
  }

  vars(vars = {}) {
    return this.initialVars(vars);
  }

  labels(language = 'en', vars = {}) {
    return this.addConfig({
      labels: { ...(this.config.labels || {}),
        [language]: vars
      }
    });
  }

  animation(id, animation) {
    return this.addConfig({
      animations: { ...(this.config.animations || {}),
        [id]: animation
      }
    });
  }

  font(id, font) {
    return this.addConfig({
      fonts: { ...(this.config.fonts || {}),
        [id]: font
      }
    });
  }

  texture(id, texture) {
    return this.addConfig({
      textures: { ...(this.config.textures || {}),
        [id]: texture
      }
    });
  }

  model(id, model) {
    return this.addConfig({
      models: { ...(this.config.models || {}),
        [id]: model
      }
    });
  }

  audio(id, audio) {
    return this.addConfig({
      audio: { ...(this.config.audio || {}),
        [id]: audio
      }
    });
  }

  shader(id, shader) {
    return this.addConfig({
      shaders: { ...(this.config.shaders || {}),
        [id]: shader
      }
    });
  }

  custom(key, value) {
    if (!key) {
      return;
    }

    return this.addConfig({
      [key]: value
    });
  }

}

const GameInfoService = new GameInfoServiceClass();

class StorageServiceClass {
  constructor() {
    _defineProperty(this, "reads", 0);

    _defineProperty(this, "writes", 0);

    _defineProperty(this, "useNative", true);

    this.useNative = typeof cordova !== 'undefined';
  }

  init() {
    this.set('system.control', Date.now());
  }

  getAllKeys() {
    return new Promise(resolve => {
      if (!this.useNative) {
        return resolve(Object.keys(localStorage));
      }

      return nativeStorage.NativeStorage.keys(keys => resolve(keys), error => {
        if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
          console.info('StorageServiceClass', 'getAllKeys', 'error', {
            error
          });
        }

        return resolve([]);
      });
    });
  }

  set(key, value) {
    if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'set', {
        key,
        value
      });
    }

    this.writes++;

    if (!this.useNative) {
      return Promise.resolve(localStorage.setItem(key, JSON.stringify(value)));
    }

    return nativeStorage.NativeStorage.setItem(key, value).catch(error => {
      if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
        console.info('StorageServiceClass', 'set', 'not saved', {
          key,
          value,
          error
        });
      }

      return Promise.resolve(null);
    });
  }

  get(key) {
    if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'get', {
        key
      });
    }

    this.reads++;

    if (!this.useNative) {
      return Promise.resolve(JSON.parse(localStorage.getItem(key) || 'null'));
    }

    return nativeStorage.NativeStorage.getItem(key).catch(error => {
      if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
        console.info('StorageServiceClass', 'get', 'not read', {
          key,
          error
        });
      }

      return Promise.resolve(null);
    });
  }

}

const StorageService = new StorageServiceClass();

class VarServiceClass {
  constructor() {
    _defineProperty(this, "variables", {});

    _defineProperty(this, "listeners", {});

    _defineProperty(this, "persistentVars", {});
  }

  init({
    language
  } = {}) {
    if (GameInfoService.config.labels) {
      const defaultLabels = GameInfoService.config.labels[language || 'en'] || {};
      Object.keys(defaultLabels).forEach(key => {
        this.setVar(key, defaultLabels[key]);
      });
    }

    if (GameInfoService.config.vars) {
      const defaultGameState = GameInfoService.config.vars;
      Object.keys(defaultGameState).forEach(key => {
        this.setVar(key, defaultGameState[key]);
      });
    }
  }

  setVar(id, value) {
    this.variables[id] = value;

    if (!this.listeners[id]) {
      this.listeners[id] = [];
    } else {
      this.listeners[id] = this.listeners[id].filter(callback => {
        if (callback) {
          return callback(value) !== false;
        }

        return false;
      });
    }

    if (this.persistentVars[id]) {
      this.persistentVars[id](value);
    }
  }

  getVar(id, onUpdate, onCreate) {
    if (!this.listeners[id]) {
      this.listeners[id] = [];
    }

    if (onUpdate) {
      this.listeners[id].push(onUpdate);
      onUpdate(this.variables[id]);
    }

    if (onCreate) {
      onCreate(onUpdate);
    }

    return this.variables[id];
  }

  removeVar(id) {
    delete this.variables[id];
    delete this.listeners[id];
  }

  registerPersistentVar(id, defaultValue) {
    return StorageService.get(id).then(initialValue => {
      this.persistentVars[id] = newValue => {
        StorageService.set(id, newValue);
      };

      if (initialValue !== null || typeof defaultValue !== 'undefined') {
        VarService.setVar(id, initialValue !== null ? initialValue : defaultValue);
      }

      return Promise.resolve();
    });
  }

  retrievePersistentVars() {
    return new Promise(async resolve => {
      const keys = await StorageService.getAllKeys();
      await Promise.all(keys.map(key => {
        return this.registerPersistentVar(key);
      }));
      resolve();
    });
  }

  resolveVar(variableString, onResolve, onCreate) {
    if (!variableString) {
      return onResolve();
    }

    if (variableString[0] === ':' && variableString[variableString.length - 1] === ':') {
      return this.getVar(variableString.substr(1, variableString.length - 2), value => {
        onResolve ? onResolve(value) : null;
      }, listener => {
        onCreate ? onCreate(listener) : null;
      });
    }

    return onResolve(variableString);
  }

  disposeListener(id, callback) {
    if (id && this.listeners[id]) {
      this.listeners[id] = this.listeners[id].filter(match => match !== callback);
    } else {
      Object.keys(this.listeners).forEach(id => {
        this.listeners[id] = this.listeners[id].filter(match => match !== callback);
      });
    }
  }

  disposeListeners() {
    Object.keys(this.listeners).forEach(key => {
      delete this.listeners[key];
    });
    this.listeners = {};
  }

}

const VarService = new VarServiceClass();

const {
  AdMob,
  Modals
} = core.Plugins;

class MoneyServiceClass {
  constructor() {
    _defineProperty(this, "platformId", null);

    _defineProperty(this, "adsInitialised", false);

    this.platformId = GameInfoService.config.system.adMobId;
  }

  async init() {
    return AdMob.initialize({
      requestTrackingAuthorization: false
    }).then(() => {
      this.adsInitialised = true;
    });
  }

  async showAd(then = () => {}) {
    if (!this.adsInitialised) {
      await this.init();
    }

    const options = {
      adId: this.platformAdId,
      adSize: admob.AdSize.FLUID,
      position: admob.AdPosition.CENTER
    };
    return new Promise(resolve => {
      AdMob.addListener('onInterstitialAdFailedToLoad', info => {
        then();
        resolve();
      });
      AdMob.addListener('onInterstitialAdClosed', info => {
        then();
        resolve();
      });
      AdMob.addListener('onInterstitialAdLeftApplication', info => {
        then();
        resolve();
      });
      AdMob.prepareInterstitial(options).then(() => {
        AdMob.showInterstitial();
      }).catch(() => {
        then();
        resolve();
      });
    });
  }

}

const MoneyService = new MoneyServiceClass();

class UtilsServiceClass {
  constructor() {
    _defineProperty(this, "poolRaycaster", []);

    _defineProperty(this, "poolBox3", []);

    _defineProperty(this, "poolCamera", []);

    _defineProperty(this, "poolEmpty", []);

    _defineProperty(this, "poolBlankMaterial", []);

    _defineProperty(this, "poolRaycasterTotal", 0);

    _defineProperty(this, "poolBox3Total", 0);

    _defineProperty(this, "poolCameraTotal", 0);

    _defineProperty(this, "poolEmptyTotal", 0);

    _defineProperty(this, "poolBlankMaterialTotal", 0);
  }

  getRaycaster() {
    const pooled = this.poolRaycaster.pop();

    if (pooled) {
      return pooled;
    }

    this.poolRaycasterTotal++;
    return new Three__namespace.Raycaster();
  }

  releaseRaycaster(raycaster) {
    raycaster.near = 0.0;
    raycaster.far = Infinity;
    this.poolRaycaster.push(raycaster);
  }

  getBox3() {
    const pooled = this.poolBox3.pop();

    if (pooled) {
      return pooled;
    }

    this.poolBox3Total++;
    return new Three__namespace.Box3();
  }

  releaseBox3(box3) {
    box3.makeEmpty();
    this.poolBox3.push(box3);
  }

  getCamera() {
    const pooled = this.poolCamera.pop();

    if (pooled) {
      return pooled;
    }

    this.poolCameraTotal++;
    return new Three__namespace.PerspectiveCamera(GameInfoService.config.system.camera.fov, 1.0);
  }

  releaseCamera(camera) {
    camera.position.set(0.0, 0.0, 0.0);
    camera.rotation.set(0.0, 0.0, 0.0);
    camera.quaternion.identity();
    this.poolCamera.push(camera);
  }

  getEmpty() {
    const pooled = this.poolEmpty.pop();

    if (pooled) {
      return pooled;
    }

    this.poolEmptyTotal++;
    const empty = new Three__namespace.Object3D();
    AssetsService.registerDisposable(empty);
    return empty;
  }

  releaseEmpty(object) {
    object.position.set(0.0, 0.0, 0.0);
    object.rotation.set(0.0, 0.0, 0.0);
    object.scale.set(1.0, 1.0, 1.0);
    object.quaternion.identity();
    object.children.forEach(child => object.remove(child));
    object.children = [];
    object.userData = {};

    if (object.parent) {
      object.parent.remove(object);
    }

    this.poolEmpty.push(object);
  }

  getBlankMaterial() {
    const pooled = this.poolBlankMaterial.pop();

    if (pooled) {
      return pooled;
    }

    this.poolBlankMaterialTotal++;
    const material = new Three__namespace.MeshBasicMaterial();
    AssetsService.registerDisposable(material);
    return material;
  }

  releaseBlankMaterial(material) {
    this.poolBlankMaterial.push(material);
  }

  disposeAll() {
    this.poolEmpty = [];
    this.poolBlankMaterial = [];
    this.poolEmptyTotal = 0;
    this.poolBlankMaterialTotal = 0;
  }

}

const UtilsService = new UtilsServiceClass();

const LogsNaturalColor = '#ffffff';
const LogsHighlightColor = '#ffff33';
const DebugFlags = {
  DEBUG_ENABLE: 'DEBUG_ENABLE',
  DEBUG_LIVE: 'DEBUG_LIVE',
  DEBUG_LOG_MEMORY: 'DEBUG_LOG_MEMORY',
  DEBUG_LOG_POOLS: 'DEBUG_LOG_POOLS',
  DEBUG_LOG_ASSETS: 'DEBUG_LOG_ASSETS',
  DEBUG_ORBIT_CONTROLS: 'DEBUG_ORBIT_CONTROLS',
  DEBUG_SCROLL_VISIBLE: 'DEBUG_SCROLL_VISIBLE',
  DEBUG_TIME_LISTENERS: 'DEBUG_TIME_LISTENERS',
  DEBUG_SKINNING_SKELETONS: 'DEBUG_SKINNING_SKELETONS',
  DEBUG_ADS: 'DEBUG_ADS',
  DEBUG_DISABLE_ADS: 'DEBUG_DISABLE_ADS',
  DEBUG_STORAGE: 'DEBUG_STORAGE',
  DEBUG_AI_NODES: 'DEBUG_AI_NODES',
  DEBUG_AI_TARGETS: 'DEBUG_AI_TARGETS',
  DEBUG_PHYSICS: 'DEBUG_PHYSICS',
  DEBUG_PHYSICS_DYNAMIC: 'DEBUG_PHYSICS_DYNAMIC'
};

class DummyDebugClass {
  constructor() {
    _defineProperty(this, "stats", null);

    _defineProperty(this, "logs", null);

    _defineProperty(this, "leaks", {
      textures: 0,
      geometries: 0
    });

    _defineProperty(this, "flags", {});
  }

  on(debugFlag) {
    this.flags[debugFlag] = true;
  }

  off(debugFlag) {
    this.flags[debugFlag] = false;
  }

  get(debugFlag) {
    return this.flags['DEBUG_ENABLE'] && this.flags[debugFlag] || false;
  }

  showStats() {
    const stats = new Stats__default['default']();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    this.stats = stats;
    TimeService.registerPersistentFrameListener(() => {
      this.stats.update();
      return !!this.stats;
    });
  }

  hideStats() {
    if (this.stats) {
      document.body.removeChild(this.stats.dom);
    }
  }

  showLogs() {
    const outputElement = document.createElement('div');
    outputElement.style.position = 'absolute';
    outputElement.style.top = '5px';
    outputElement.style.right = '5px';
    outputElement.style.display = 'inline-block';
    outputElement.style.overflow = 'hidden';
    outputElement.style.pointerEvents = 'none';
    outputElement.style.touchAction = 'none';
    outputElement.style.zIndex = Number.MAX_SAFE_INTEGER;
    outputElement.style.color = '#ffffff';
    outputElement.style.textShadow = '0px 0px 2px #000000';
    outputElement.style.textAlign = 'right';
    outputElement.style.background = 'rgba(0, 0, 0, 0.5)';
    outputElement.style.borderRadius = '5px';
    outputElement.style.padding = '5px';
    outputElement.style.userSelect = 'none';
    document.body.appendChild(outputElement);
    this.logs = outputElement;
    TimeService.registerPersistentFrameListener(() => {
      if (!this.logs) {
        return false;
      }

      const outputElement = this.logs;
      outputElement.innerHTML = '';

      if (this.get(DebugFlags.DEBUG_LOG_MEMORY)) {
        outputElement.appendChild(this.createLogLine({
          text: 'Geometries:'
        }, {
          text: RenderService.getRenderer().info.memory.geometries,
          color: LogsHighlightColor
        }, {
          text: `(☒ ${this.leaks.geometries})`,
          color: LogsHighlightColor
        }, {
          text: 'Textures:'
        }, {
          text: RenderService.getRenderer().info.memory.textures,
          color: LogsHighlightColor
        }, {
          text: `(☒ ${this.leaks.textures})`,
          color: LogsHighlightColor
        }, {
          text: 'Materials:'
        }, {
          text: Object.keys(AssetsService.savedMaterials).length,
          color: LogsHighlightColor
        }));
        outputElement.appendChild(this.createLogLine({
          text: 'Memory (%):'
        }, {
          text: performance.memory.totalJSHeapSize,
          color: LogsHighlightColor
        }, {
          text: `(${(performance.memory.totalJSHeapSize / performance.memory.jsHeapSizeLimit * 100.0).toFixed(0)}%)`,
          color: LogsHighlightColor
        }));
      }

      if (this.get(DebugFlags.DEBUG_LOG_ASSETS)) {
        outputElement.appendChild(this.createLogLine({
          text: 'Disposables:'
        }, {
          text: AssetsService.disposables.length,
          color: LogsHighlightColor
        }, {
          text: 'Preloaded:'
        }, {
          text: Object.keys(AssetsService.preloaded).length,
          color: LogsHighlightColor
        }, {
          text: 'Pending:'
        }, {
          text: Object.keys(AssetsService.pending).length,
          color: LogsHighlightColor
        }, {
          text: 'Audio: '
        }, {
          text: Object.keys(AssetsService.audioBuffers).length,
          color: LogsHighlightColor
        }));
      }

      if (this.get(DebugFlags.DEBUG_LOG_POOLS)) {
        outputElement.appendChild(this.createLogLine({
          text: 'Vec3:'
        }, {
          text: MathService.poolVec3Total - MathService.poolVec3.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: MathService.poolVec3Total,
          color: LogsHighlightColor
        }, {
          text: 'Vec2:'
        }, {
          text: MathService.poolVec2Total - MathService.poolVec2.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: MathService.poolVec2Total,
          color: LogsHighlightColor
        }, {
          text: 'Quat:'
        }, {
          text: MathService.poolQuaternionsTotal - MathService.poolQuaternions.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: MathService.poolQuaternionsTotal,
          color: LogsHighlightColor
        }));
        outputElement.appendChild(this.createLogLine({
          text: 'RayC:'
        }, {
          text: UtilsService.poolRaycasterTotal - UtilsService.poolRaycaster.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: UtilsService.poolRaycasterTotal,
          color: LogsHighlightColor
        }, {
          text: 'Box3:'
        }, {
          text: UtilsService.poolBox3Total - UtilsService.poolBox3.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: UtilsService.poolBox3Total,
          color: LogsHighlightColor
        }, {
          text: 'Cam:'
        }, {
          text: UtilsService.poolCameraTotal - UtilsService.poolCamera.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: UtilsService.poolCameraTotal,
          color: LogsHighlightColor
        }));
        outputElement.appendChild(this.createLogLine({
          text: 'Empt:'
        }, {
          text: UtilsService.poolEmptyTotal - UtilsService.poolEmpty.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: UtilsService.poolEmptyTotal,
          color: LogsHighlightColor
        }, {
          text: 'Mat:'
        }, {
          text: UtilsService.poolBlankMaterialTotal - UtilsService.poolBlankMaterial.length,
          color: LogsHighlightColor
        }, {
          text: '/'
        }, {
          text: UtilsService.poolBlankMaterialTotal,
          color: LogsHighlightColor
        }));
      }

      if (this.get(DebugFlags.DEBUG_TIME_LISTENERS)) {
        outputElement.appendChild(this.createLogLine({
          text: 'Timed Fn.:'
        }, {
          text: TimeService.frameListeners.length,
          color: LogsHighlightColor
        }, {
          text: 'Pers. Timed:'
        }, {
          text: Object.keys(TimeService.persistentFrameListeners).length,
          color: LogsHighlightColor
        }, {
          text: 'Vars:'
        }, {
          text: Object.keys(VarService.listeners).flatMap(key => VarService.listeners[key]).length,
          color: LogsHighlightColor
        }));
      }

      if (this.get(DebugFlags.DEBUG_ADS)) {
        outputElement.appendChild(this.createLogLine({
          text: 'Ads:'
        }, {
          text: MoneyService.adsDisabled ? 'disabled' : 'enabled',
          color: LogsHighlightColor
        }, {
          text: 'AdStat:'
        }, {
          text: MoneyService.adsInitialised ? 'ok' : 'error',
          color: LogsHighlightColor
        }));
      }

      if (this.get(DebugFlags.DEBUG_STORAGE)) {
        outputElement.appendChild(this.createLogLine({
          text: 'Storage'
        }, {
          text: 'Reads:'
        }, {
          text: StorageService.reads,
          color: LogsHighlightColor
        }, {
          text: 'Writes:'
        }, {
          text: StorageService.writes,
          color: LogsHighlightColor
        }));
      }
    });
  }

  createLogLine(...logs) {
    const logLineElement = document.createElement('div');
    logs.forEach(({
      text,
      color
    }) => {
      const spanElement = document.createElement('span');
      spanElement.style.color = color || LogsNaturalColor;
      spanElement.style.margin = '0px 4px';
      spanElement.innerHTML = text;
      logLineElement.appendChild(spanElement);
    });
    return logLineElement;
  }

}

const DummyDebug = new DummyDebugClass();

class MathServiceClass {
  constructor() {
    _defineProperty(this, "poolVec2", []);

    _defineProperty(this, "poolVec3", []);

    _defineProperty(this, "poolQuaternions", []);

    _defineProperty(this, "poolVec2Total", 0);

    _defineProperty(this, "poolVec3Total", 0);

    _defineProperty(this, "poolQuaternionsTotal", 0);

    _defineProperty(this, "leakRegistry", {});
  }

  getVec2(x = 0.0, y = 0.0, id) {
    const pooled = this.poolVec2.pop();

    if (pooled) {
      return pooled.set(x, y);
    }

    this.poolVec2Total++;
    const vector = new Three__namespace.Vector2(x, y);
    this.registerId(vector, id);
    return vector;
  }

  releaseVec2(vector) {
    vector.set(0, 0);
    this.unregisterId(vector);
    this.poolVec2.push(vector);
  }

  getQuaternion(id) {
    const pooled = this.poolQuaternions.pop();

    if (pooled) {
      return pooled.identity();
    }

    this.poolQuaternionsTotal++;
    const quaternion = new Three__namespace.Quaternion();
    this.registerId(quaternion, id);
    return quaternion;
  }

  releaseQuaternion(quaternion) {
    quaternion.identity();
    this.unregisterId(quaternion);
    this.poolQuaternions.push(quaternion);
  }

  getVec3(x = 0.0, y = 0.0, z = 0.0, id) {
    const pooled = this.poolVec3.pop();

    if (pooled) {
      return pooled.set(x, y, z);
    }

    this.poolVec3Total++;
    const vector = new Three__namespace.Vector3(x, y, z);
    this.registerId(vector, id);
    return vector;
  }

  cloneVec3(sourceVector) {
    const pooled = this.poolVec3.pop();

    if (pooled) {
      return pooled.copy(sourceVector);
    }

    this.poolVec3Total++;
    return new Three__namespace.Vector3().copy(sourceVector);
  }

  releaseVec3(vector) {
    if (!vector) {
      return;
    }

    vector.set(0, 0, 0);
    this.unregisterId(vector);
    this.poolVec3.push(vector);
  }

  registerId(object, id) {
    if (!DummyDebug.get(DebugFlags.DEBUG_LOG_POOLS) || !id) {
      return;
    }

    object.userData = {
      id
    };
    const key = `${object.constructor.name}:${id}`;

    if (this.leakRegistry[key]) {
      this.leakRegistry[key]++;
    } else {
      this.leakRegistry[key] = 1;
    }
  }

  unregisterId(object) {
    if (!DummyDebug.get(DebugFlags.DEBUG_LOG_POOLS) || !object.userData || !object.userData.id) {
      return;
    }

    const {
      id
    } = object.userData;
    const key = `${object.constructor.name}:${id}`;

    if (this.leakRegistry[key]) {
      this.leakRegistry[key]--;
    }

    if (this.leakRegistry[key] <= 0) {
      delete this.leakRegistry[key];
    }

    delete object.userData;
  }

  handleLeaks() {
    if (!DummyDebug.get(DebugFlags.DEBUG_LOG_POOLS)) {
      return;
    }

    const leaks = Object.keys(this.leakRegistry);

    if (leaks.length > 0) {
      console.info('MathService', 'handleLeaks', 'leakedPools', {
        leaks: this.leakRegistry
      });
    }
  }

}

const MathService = new MathServiceClass();

const OcclusionStepEnum = {
  progressive: 'progressive'
};

class CameraServiceClass {
  constructor() {
    _defineProperty(this, "cameras", {});

    _defineProperty(this, "detachedControls", null);

    _defineProperty(this, "renderTargets", {});

    _defineProperty(this, "autoUpdateRenderTargets", false);

    _defineProperty(this, "cameraPosition", MathService.getVec3(0.0, 0.0, 0.0, 'camera-1'));

    _defineProperty(this, "cameraQuaternion", MathService.getQuaternion());

    _defineProperty(this, "defaultTween", 0.2);

    _defineProperty(this, "tween", 0.2);

    _defineProperty(this, "camera", null);

    _defineProperty(this, "followedObject", null);

    _defineProperty(this, "followListener", null);

    _defineProperty(this, "followThreshold", 0.001);

    _defineProperty(this, "followPivot", null);

    _defineProperty(this, "followPivotPosition", MathService.getVec3(0.0, 0.0, 0.0, 'camera-2'));

    _defineProperty(this, "occlusionTest", false);

    _defineProperty(this, "occlusionSettings", {});

    _defineProperty(this, "occlusionStep", OcclusionStepEnum.progressive);

    _defineProperty(this, "occlusionSphere", 0.1);

    _defineProperty(this, "translationLocked", false);

    _defineProperty(this, "rotationLocked", false);
  }

  init({
    camera
  } = {}) {
    this.camera = camera;
    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);
  }

  onFrame() {
    this.updateCamera();

    if (this.occlusionTest) {
      this.determineTargetVisibility();
    }

    if (this.autoUpdateRenderTargets) {
      this.updateRenderTargets();
    }
  }

  resetCamera() {
    this.camera.position.set(0.0, 0.0, 0.0);
    this.camera.rotation.set(0.0, 0.0, 0.0);
    this.camera.quaternion.identity();
    this.cameraPosition.copy(this.camera.position);
    this.cameraQuaternion.copy(this.camera.quaternion);
  }

  updateCamera() {
    if (this.detachedControls) {
      return;
    }

    if (this.followedObject) {
      this.followedObject.getWorldPosition(this.cameraPosition);
      this.followedObject.getWorldQuaternion(this.cameraQuaternion);

      if (this.followListener) {
        const distanceToTarget = MathService.getVec3(0.0, 0.0, 0.0, 'camera-3').copy(this.camera.position).sub(this.cameraPosition);

        if (distanceToTarget.length() <= this.followThreshold) {
          this.followListener();
          delete this.followListener;
        }

        MathService.releaseVec3(distanceToTarget);
      }

      this.followPivot.position.copy(this.followPivotPosition);

      if (this.followPivot && !this.occlusionSettings.faceTarget) {
        this.followPivot.lookAt(this.cameraPosition);
      }
    }

    if (!this.translationLocked) {
      this.camera.position.lerp(this.cameraPosition, this.tween);
    }

    if (!this.rotationLocked) {
      this.camera.quaternion.slerp(this.cameraQuaternion, this.tween);
    }
  }

  setCameraPosition(x, y, z) {
    this.cameraPosition.set(x, y, z);
  }

  setCameraQuaternion(quaternion) {
    this.cameraQuaternion.set(quaternion);
  }

  copyCameraPosition(position) {
    this.cameraPosition.copy(position);
  }

  copyCameraQuaternion(quaternion) {
    this.cameraQuaternion.copy(quaternion);
  }

  addCamera(id, camera) {
    this.cameras[id] = camera;
  }

  getCamera(id) {
    return this.cameras[id];
  }

  useCamera(camera, instant = false) {
    this.stopFollowing();
    this.reattachCamera();
    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);

    if (instant) {
      this.camera.position.copy(this.cameraPosition);
      this.camera.quaternion.copy(this.cameraQuaternion);
    }
  }

  follow(object, onReachTarget, freezeFrame = true) {
    const callback = () => {
      this.stopFollowing();
      this.reattachCamera();
      this.followedObject = object;
      this.followListener = onReachTarget;
      const pivot = UtilsService.getEmpty();
      this.camera.parent.add(pivot);
      pivot.position.copy(this.camera.position);
      pivot.quaternion.copy(this.camera.quaternion);
      this.camera.position.set(0.0, 0.0, 0.0);
      this.camera.quaternion.identity();
      pivot.add(this.camera);
      this.followPivot = this.camera;
      this.camera = pivot;

      if (freezeFrame) {
        RenderService.resumeRendering();
      }
    };

    if (freezeFrame) {
      RenderService.pauseRendering(() => callback());
    } else {
      callback();
    }
  }

  getFollowPivot() {
    return this.followPivot;
  }

  stopFollowing() {
    delete this.followedObject;

    if (this.followPivot) {
      const originalCamera = this.followPivot;
      originalCamera.position.copy(this.camera.position);
      originalCamera.quaternion.copy(this.camera.quaternion);
      const cameraRoot = this.camera.parent;
      this.camera.remove(originalCamera);
      cameraRoot.remove(this.camera);
      cameraRoot.add(originalCamera);
      const pivot = this.camera;
      this.camera = this.followPivot;
      UtilsService.releaseEmpty(pivot);
      this.followPivot = null;
    }

    this.cameraPosition.copy(this.camera.position);
    this.cameraQuaternion.copy(this.camera.quaternion);
  }

  getCameraAsTexture(id, {
    width,
    height,
    minFilter,
    magFilter
  } = {}) {
    const camera = this.cameras[id];

    if (!camera) {
      console.warn('CameraService', 'getCameraAsTexture', `camera ${id} does not exist`);
      return;
    }

    if (this.renderTargets[id]) {
      return this.renderTargets[id].texture;
    }

    const renderTarget = new Three__namespace.WebGLRenderTarget(width || window.innerWidth, height || window.innerHeight, {
      minFilter: minFilter || Three__namespace.LinearFilter,
      magFilter: magFilter || Three__namespace.NearestFilter,
      format: Three__namespace.RGBFormat
    });
    this.renderTargets[id] = renderTarget;
    return renderTarget.texture;
  }

  updateRenderTargets() {
    const scene = RenderService.getScene();
    const renderer = RenderService.getRenderer();

    if (!scene || !renderer) {
      console.info('CameraService', 'updateRenderTargets', 'missing scene or renderer');
      return;
    }

    const uncontrolledCamera = UtilsService.getCamera();
    Object.keys(this.renderTargets).forEach(id => {
      const renderTarget = this.renderTargets[id];
      const camera = this.cameras[id];
      uncontrolledCamera.position.copy(camera.position);
      uncontrolledCamera.quaternion.copy(camera.quaternion);

      if (!camera) {
        console.info('CameraService', 'updateRenderTargets', `missing camera ${id}`);
        this.disposeRenderTarget(renderTarget);
        return;
      }

      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, uncontrolledCamera);
    });
    renderer.setRenderTarget(null);
    UtilsService.releaseCamera(uncontrolledCamera);
  }

  disposeRenderTarget(renderTarget) {
    AssetsService.disposeAsset(renderTarget.texture);
    AssetsService.disposeAsset(renderTarget);
  }

  preventOcclusion({
    allowTransparent,
    faceTarget,
    collisionRadius,
    occlusionStep
  } = {}) {
    if (!this.followedObject) {
      console.warn('CameraService', 'preventOcclusion', 'unable to prevent occlusion unless following a target');
      return;
    }

    this.occlusionTest = true;
    this.occlusionSettings = {
      allowTransparent: allowTransparent || false,
      faceTarget: faceTarget !== false
    };
    this.occlusionSphere = collisionRadius || 0.1;
    this.occlusionStep = occlusionStep || OcclusionStepEnum.progressive;
  }

  allowOcclusion() {
    this.occlusionTest = false;
    this.occlusionSettings = {};
    this.occlusionSphere = 0.1;
  }

  determineTargetVisibility() {
    if (!this.followedObject) {
      return;
    }

    const scene = RenderService.getScene();

    if (!scene) {
      return;
    }

    let latestHits = null;
    let step = null;
    const pivotDirection = MathService.getVec3(0.0, 0.0, 0.0, 'camera-4').copy(this.followPivot.position).normalize().negate();
    const raycaster = UtilsService.getRaycaster();
    raycaster.near = Number.MIN_VALUE;
    const targetPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-5');
    this.camera.getWorldPosition(targetPosition);
    const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-6');

    if (this.occlusionStep !== OcclusionStepEnum.progressive) {
      step = this.occlusionStep;
    }

    const direction = MathService.getVec3(0.0, 0.0, 0.0, 'camera-7');
    this.followPivot.getWorldPosition(cameraPosition);
    direction.copy(targetPosition).sub(cameraPosition).normalize();

    const determineVisibility = () => {
      this.followPivot.getWorldPosition(cameraPosition);
      raycaster.far = Math.max(this.followPivot.position.length(), raycaster.near);
      raycaster.set(cameraPosition, direction);

      if (raycaster.far <= raycaster.near) {
        return false;
      }

      let hits = raycaster.intersectObjects(scene.children, true);

      if (this.occlusionStep === OcclusionStepEnum.progressive) {
        if (!step) {
          step = this.occlusionSphere;
        } else {
          const newStep = Math.sqrt(latestHits[latestHits.length - 1].distance);

          if (step === newStep) {
            return false;
          }

          step = newStep;
        }
      }

      if (hits.length) {
        hits = hits.filter(({
          object
        }) => {
          if (!object.visible) {
            return false;
          }

          if (this.occlusionSettings.allowTransparent) {
            return !(object.material && object.material.transparent && object.material.opacity < 1.0);
          }

          return true;
        });
        this.followedObject.traverse(child => {
          hits = hits.filter(({
            object
          }) => object.uuid !== child.uuid);
        });
      }

      if (hits.length > 0) {
        this.followPivot.position.add(pivotDirection.clone().multiplyScalar(step));
        latestHits = hits;
        return true;
      } else {
        if (latestHits) {
          const nearbyHits = latestHits.filter(({
            point
          }) => point.clone().sub(cameraPosition).length() <= this.occlusionSphere);

          if (nearbyHits.length > 0) {
            this.followPivot.position.add(pivotDirection.clone().multiplyScalar(step));
            latestHits = nearbyHits;
            return true;
          }
        }
      }

      return false;
    };

    while (determineVisibility());

    MathService.releaseVec3(direction);
    MathService.releaseVec3(pivotDirection);
    MathService.releaseVec3(targetPosition);
    MathService.releaseVec3(cameraPosition);
    UtilsService.releaseRaycaster(raycaster);
    latestHits = null;
  }

  detachCamera() {
    this.stopFollowing();
    this.allowOcclusion();
    this.detachedControls = new OrbitControls.OrbitControls(RenderService.getNativeCamera(), RenderService.getRenderer().domElement);
  }

  reattachCamera() {
    if (!this.detachedControls) {
      return;
    }

    this.detachedControls.dispose();
    this.detachedControls = null;
  }

  lockTranslation() {
    this.translationLocked = true;
  }

  lockRotation() {
    this.rotationLocked = true;
  }

  unlockTranslation() {
    this.translationLocked = false;
  }

  unlockRotation() {
    this.rotationLocked = false;
  }

  disposeCamera(id) {
    this.cameras[id] = null;
  }

  disposeAll() {
    this.stopFollowing();
    this.cameras = {};
    Object.keys(this.renderTargets).forEach(id => {
      const renderTarget = this.renderTargets[id];
      this.disposeRenderTarget(renderTarget);
    });
    this.renderTargets = {};

    if (this.cameraPosition) {
      MathService.releaseVec3(this.cameraPosition);
    }

    this.cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-7');

    if (this.followPivotPosition) {
      MathService.releaseVec3(this.followPivotPosition);
    }

    this.followPivotPosition = MathService.getVec3(0.0, 0.0, 0.0, 'camera-8');

    if (this.cameraQuaternion) {
      MathService.releaseQuaternion(this.cameraQuaternion);
    }

    this.cameraQuaternion = MathService.getQuaternion();
    this.followedObject = null;
    this.followListener = null;
    this.followThreshold = 0.001;
    this.occlusionTest = false;
    this.occlusionSettings = {};
    this.allowOcclusion();
    this.resetCamera();
    this.reattachCamera();
    this.tween = 0.2;
  }

}

const CameraService = new CameraServiceClass();

const InteractionEnums = {
  eventClick: 'interactionServiceClick',
  eventDrag: 'interactionServiceDrag',
  eventHold: 'interactionServiceHold',
  eventRelease: 'interactionServiceRelease',
  eventLeave: 'interactionServiceLeave',
  stateEnabled: 'interactionServiceEnabled',
  stateHovered: 'interactionServiceStateHovered',
  stateClicked: 'interactionServiceStateClicked',
  stateIntInactive: 0,
  stateIntActive: 2,
  stateIntPending: 1
};

class InteractionsServiceClass {
  constructor() {
    _defineProperty(this, "listeners", []);

    _defineProperty(this, "camera", null);

    _defineProperty(this, "pointer", MathService.getVec2());

    _defineProperty(this, "delta", MathService.getVec2());

    _defineProperty(this, "touches", []);

    _defineProperty(this, "useTouch", false);
  }

  init({
    camera
  } = {}) {
    if (window.interactionsService) {
      window.interactionsService.dispose();
    }

    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    window.interactionsService = this;
    this.camera = camera;
    this.addListeners();
  }

  addListeners() {
    const renderer = RenderService.getRenderer();
    renderer.domElement.addEventListener('touchstart', this.onTouchStart);
    renderer.domElement.addEventListener('touchmove', this.onTouchMove);
    renderer.domElement.addEventListener('touchend', this.onTouchEnd);
    renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    renderer.domElement.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown(event) {
    const fauxTouch = {
      identifier: 'pointer',
      clientX: event.clientX,
      clientY: event.clientY
    };
    event.changedTouches = [fauxTouch];
    event.source = 'pointer';
    this.onTouchStart(event);
  }

  onPointerMove(event) {
    if (this.useTouch) {
      return;
    }

    const fauxTouch = {
      identifier: 'pointer',
      clientX: event.clientX,
      clientY: event.clientY
    };
    event.changedTouches = [fauxTouch];
    this.onTouchMove(event);
  }

  onPointerUp(event) {
    if (this.useTouch) {
      return;
    }

    const fauxTouch = {
      identifier: 'pointer',
      clientX: event.clientX,
      clientY: event.clientY
    };
    event.changedTouches = [fauxTouch];
    this.onTouchEnd(event);
  }

  onTouchStart(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.useTouch && event.source !== 'pointer') {
      this.disposePointerListeners();
      this.useTouch = true;
    }

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.pointer.x = touch.clientX / window.innerWidth * 2 - 1;
      this.pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      this.delta.set(0.0, 0.0);
      this.touches[touch.identifier] = {
        touch: this.pointer.clone(),
        hits: [],
        drag: false
      };
      this.startTouch({
        pointer: this.pointer,
        touch: this.touches[touch.identifier]
      });
    }
  }

  onTouchMove(event) {
    event.preventDefault();
    event.stopPropagation();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      if (!this.touches[touch.identifier]) {
        continue;
      }

      const {
        touch: previousTouch
      } = this.touches[touch.identifier];
      this.delta.set(previousTouch.x, previousTouch.y);
      this.pointer.x = touch.clientX / window.innerWidth * 2 - 1;
      this.pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      this.delta.set(this.pointer.x - this.delta.x, this.pointer.y - this.delta.y);
      this.moveTouch({
        pointer: this.pointer,
        delta: this.delta,
        touch: this.touches[touch.identifier]
      });

      if (this.delta.length() >= 0.015) {
        this.touches[touch.identifier].drag = true;
      }

      this.touches[touch.identifier].touch.copy(this.pointer);
    }
  }

  onTouchEnd(event) {
    event.preventDefault();
    event.stopPropagation();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      if (!this.touches[touch.identifier]) {
        continue;
      }

      this.pointer.x = touch.clientX / window.innerWidth * 2 - 1;
      this.pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      this.delta.set(0.0, 0.0);
      this.dismissTouch({
        pointer: this.pointer,
        touch: this.touches[touch.identifier]
      });
      delete this.touches[touch.identifier];
    }
  }

  startTouch({
    pointer,
    touch
  }) {
    const hits = this.getHits({
      pointer
    });
    hits.forEach(({
      object
    }) => {
      if (object.userData[InteractionEnums.eventHold]) {
        object.userData[InteractionEnums.eventHold]();
      }
    });
    touch.hits = hits;
  }

  dismissTouch({
    pointer,
    touch
  }) {
    const hits = this.getHits({
      pointer
    });
    let bubbleStopped = false;

    const stopPropagation = () => {
      bubbleStopped = true;
    };

    hits.some(({
      object
    }) => {
      if (bubbleStopped) {
        return true;
      }

      if (object.userData[InteractionEnums.eventRelease]) {
        object.userData[InteractionEnums.eventRelease]({
          stopPropagation
        });
      }
    });

    if (!touch.drag) {
      touch.hits.some(({
        object
      }) => {
        if (bubbleStopped) {
          return true;
        }

        if (object.userData[InteractionEnums.eventClick]) {
          object.userData[InteractionEnums.eventClick]({
            stopPropagation
          });
        }
      });
    }

    touch.hits = [];
    touch.drag = false;
  }

  moveTouch({
    pointer,
    delta,
    touch
  }) {
    const hits = this.getHits({
      pointer
    });
    touch.hits.forEach(({
      object
    }) => {
      if (object.userData[InteractionEnums.eventDrag]) {
        object.userData[InteractionEnums.eventDrag]({
          deltaX: delta.x,
          deltaY: delta.y
        });
      }

      if (object.userData[InteractionEnums.eventLeave]) {
        const stillHit = hits.some(match => match.object.uuid === object.uuid);

        if (!stillHit) {
          object.userData[InteractionEnums.eventLeave]();
        }
      }
    });
    hits.forEach(({
      object
    }) => {
      if (object.userData[InteractionEnums.eventHold]) {
        object.userData[InteractionEnums.eventHold]();
      }
    });
    touch.hits = hits;
  }

  registerListener(target, eventType, callback) {
    target.userData[eventType] = callback;

    if (!target.userData[InteractionEnums.stateEnabled]) {
      target.userData[InteractionEnums.stateEnabled] = true;
      target.userData[InteractionEnums.stateHovered] = InteractionEnums.stateIntInactive;
      this.listeners.push(target);
    }
  }

  registerInvisibleListener(target, eventType, callback) {
    target.userData.interactionsServiceInvisibleListener = true;
    this.registerListener(target, eventType, callback);
  }

  getHits({
    pointer
  }) {
    const raycaster = UtilsService.getRaycaster();
    raycaster.setFromCamera(pointer, this.camera);
    const hits = raycaster.intersectObjects(this.listeners, true);
    UtilsService.releaseRaycaster(raycaster);
    return hits.filter(({
      object
    }, index) => {
      if (object.interactionsServiceInvisibleListener !== true) {
        let visible = true;
        object.traverseAncestors(parent => {
          visible = parent.visible && visible;
        });

        if (!visible) {
          return;
        }
      }

      const nonUniqueHit = hits.findIndex(({
        object: searchObject
      }) => searchObject.uuid === object.uuid);
      return nonUniqueHit === index;
    });
  }

  disposeListener(target) {
    this.listeners = this.listeners.filter(match => match !== target);
  }

  disposeListeners() {
    this.listeners = this.listeners.filter(object => {
      if (object.userData) {
        Object.keys(object.userData).forEach(key => {
          delete object.userData[key];
        });
      }

      return false;
    });
    this.listeners = [];
  }

  disposePointerListeners() {
    const renderer = RenderService.getRenderer();
    renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
  }

  dispose() {
    const renderer = RenderService.getRenderer();
    renderer.domElement.removeEventListener('touchmove', this.onTouchMove);
    renderer.domElement.removeEventListener('touchstart', this.onTouchStart);
    renderer.domElement.removeEventListener('touchend', this.onTouchEnd);
    this.disposePointerListeners();
    delete this.camera;
    this.listeners = [];
    this.camera = null;

    if (this.touches) {
      this.touches.forEach(touch => {
        delete touch.hits;
      });
    }

    this.touches = [];

    if (this.pointer) {
      MathService.releaseVec2(this.pointer);
    }

    this.pointer = MathService.getVec2();

    if (this.delta) {
      MathService.releaseVec2(this.delta);
    }

    this.delta = MathService.getVec2();
  }

}

const InteractionsService = new InteractionsServiceClass();

const MathUtils = Three__namespace.MathUtils;
const isDefined = value => typeof value !== 'undefined';
const cloneValue = value => JSON.parse(JSON.stringify(value));
const getRandomColor = () => new Three__namespace.Color(Math.random() * 0xffffff);
const getRandomElement = set => set[Math.floor(Math.random() * set.length)];
const spliceRandomElement = set => set.splice(Math.floor(Math.random() * set.length), 1)[0];
const moduloAngle = x => Math.atan2(Math.sin(x), Math.cos(x));
const defaultTo = (value, defaultValue) => typeof value === 'undefined' ? defaultValue : value;
const swapVectors = (vectorA, vectorB) => {
  const helper = MathService.getVec3(0.0, 0.0, 0.0, 'swap-vectors-1');
  helper.copy(vectorA);
  vectorA.copy(vectorB);
  vectorB.copy(helper);
  MathService.releaseVec3(helper);
};
const textureFields = [// NOTE Excluding lightMap and envMap
'alphaMap', 'aoMap', 'bumpMap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap', 'emissiveMap', 'gradientMap', 'displacementMap', 'map', 'metalnessMap', 'matcap', 'normalMap', 'transmissionMap', 'roughnessMap', 'specularMap'];
const forAllMaterialTextures = (material, callback) => {
  textureFields.forEach(key => {
    if (material[key] && material[key].isTexture) {
      callback(material[key], key);
    }
  });
};

const createArrowHelper = (container, id, vector, origin, color) => {
  let helper = container.getObjectByName(id);

  if (!helper) {
    helper = new Three__namespace.ArrowHelper(vector, undefined, vector.length(), color || getRandomColor());
    helper.name = id;
    AssetsService.registerDisposable(helper);
    container.add(helper);
  }

  helper.setLength(vector.length());
  helper.setDirection(vector.normalize());

  if (origin) {
    helper.position.copy(origin);
  }

  return helper;
};
const createBoxHelper = (container, id, box) => {
  let helper = container.getObjectByName(id);

  if (!helper) {
    helper = new Three__namespace.Box3Helper(box, getRandomColor());
    helper.name = id;
    AssetsService.registerDisposable(helper);
    container.add(helper);
  }

  helper.box.copy(box);
  return helper;
};
const createDefaultCube = (container, id, {
  position,
  size,
  color
} = {}) => {
  let helper = container.getObjectByName(id);

  if (!helper) {
    helper = new Three__namespace.Mesh(new Three__namespace.BoxBufferGeometry(size || 1.0, size || 1.0, size || 1.0), new Three__namespace.MeshStandardMaterial({
      color: color || getRandomColor()
    }));
    helper.name = id;
    AssetsService.registerDisposable(helper);
    container.add(helper);
  }

  if (position) {
    helper.position.copy(position);
  }

  return helper;
};

class PhysicsServiceClass {
  constructor() {
    _defineProperty(this, "bodies", []);

    _defineProperty(this, "dynamicBodies", []);

    _defineProperty(this, "navmaps", []);

    _defineProperty(this, "pathfinder", null);

    _defineProperty(this, "pathfinedEnabled", false);

    _defineProperty(this, "pathfinderZoneId", 'zone');

    _defineProperty(this, "surfaceHandlers", {});

    _defineProperty(this, "surfaces", []);

    _defineProperty(this, "slopeTolerance", 1.0);

    _defineProperty(this, "gravityConstant", -0.986);

    _defineProperty(this, "maxDynamicBodySize", 1.0);
  }

  init() {
    TimeService.registerPersistentFrameListener(() => {
      this.updateDynamicBodies();
      this.updateStaticBodies();
    });
  }

  updateStaticBodies() {
    if (!this.bodies.length) {
      return;
    }

    const direction = MathService.getVec3(0.0, 0.0, 0.0, 'physics-1');
    const position = MathService.getVec3(0.0, 0.0, 0.0, 'physics-1');
    const raycaster = UtilsService.getRaycaster();
    this.bodies = this.bodies.filter(body => {
      if (!body.simpleGravity) {
        return false;
      }

      raycaster.near = -0.00001;
      raycaster.far = 500.0; // NOTE If navmap is not found within this limit, it's assumed body left the navmap

      if (!body || !body.target) {
        AssetsService.disposeAsset(body);
        AssetsService.disposeAsset(body.target);
        return false;
      }

      if (body.grounded) {
        body.simpleGravity.y = 0.0;
      } else {
        body.simpleGravity.y = MathUtils.lerp(body.simpleGravity.y, this.gravityConstant, 0.1);
      }

      const simpleVelocity = body.getSimpleVelocity();
      const simpleGravity = body.simpleGravity;

      if (simpleVelocity) {
        body.target.getWorldPosition(position);
        position.add(simpleVelocity);
        const slopeVector = MathService.getVec3(0.0, 0.0, 0.0, 'physics-1').copy(simpleGravity).normalize().multiplyScalar(-this.slopeTolerance);
        position.add(slopeVector);
        const gravityDirection = MathService.getVec3(0.0, -1.0, 0.0, 'physics-2');
        position.sub(gravityDirection);
        raycaster.set(position, gravityDirection);
        MathService.releaseVec3(gravityDirection); // Surfaces

        let collisions = raycaster.intersectObjects(this.surfaces, true);
        let cachedCollisions = Object.keys(body.surfaceCollisions || {});
        collisions.forEach(collision => {
          const {
            surface: surfaceType,
            surfaceRef
          } = collision.object.userData;
          const {
            onInteraction,
            onEnter,
            onLeave
          } = this.surfaceHandlers[surfaceType];

          if (surfaceRef[onEnter] && !body.surfaceCollisions[collision.object.uuid]) {
            surfaceRef[onEnter]({
              body,
              hit: collision
            });
          }

          if (surfaceRef[onInteraction]) {
            surfaceRef[onInteraction]({
              body,
              hit: collision
            });
          }

          body.surfaceCollisions[collision.object.uuid] = {
            onLeave: surfaceRef[onLeave]
          };
          cachedCollisions = cachedCollisions.filter(uuid => uuid !== collision.object.uuid);
        });
        cachedCollisions.forEach(collisionUuid => {
          if (body.surfaceCollisions[collisionUuid].onLeave) {
            body.surfaceCollisions[collisionUuid].onLeave({
              body,
              hit: null
            });
          }

          delete body.surfaceCollisions[collisionUuid];
        });
        MathService.releaseVec3(slopeVector); // Collisions

        collisions = raycaster.intersectObjects(this.navmaps, true);

        if (collisions[0]) {
          const {
            point
          } = collisions[0];
          body.target.getWorldPosition(position);
          const pointOffset = MathService.getVec3(0.0, 0.0, 0.0, 'physics-3').copy(point).sub(position);

          if (pointOffset.length() - this.slopeTolerance <= simpleVelocity.length()) {
            body.target.position.add(pointOffset);
            body.grounded = true;
          } else {
            body.target.position.add(simpleVelocity);
            body.target.position.add(simpleGravity);
            body.grounded = false;
          }

          MathService.releaseVec3(pointOffset);
        } else {
          if (!body.noClip) {
            if (body.collisionListener) {
              body.collisionListener();
            }

            body.grounded = false;
          } else {
            body.target.position.add(simpleVelocity);
            body.grounded = true;
          }
        }
      }

      if (body.dynamicCollision) {
        body.dynamicCollision = false;
      }

      return true;
    });
    MathService.releaseVec3(direction);
    MathService.releaseVec3(position);
    UtilsService.releaseRaycaster(raycaster);
  }

  updateDynamicBodies() {
    if (!this.dynamicBodies.length) {
      return;
    }

    const tests = {};
    const positionA = MathService.getVec3(0.0, 0.0, 0.0, 'physics-4');
    const positionB = MathService.getVec3(0.0, 0.0, 0.0, 'physics-5');
    this.dynamicBodies = this.dynamicBodies.filter(bodyA => {
      if (!bodyA || !bodyA.target) {
        return false;
      }

      bodyA.target.getWorldPosition(positionA);
      this.dynamicBodies.forEach(bodyB => {
        if (bodyA === bodyB || !bodyB || !bodyB.target) {
          return;
        }

        bodyB.target.getWorldPosition(positionB);
        const distance = positionB.distanceTo(positionA);
        const isNearby = distance <= this.maxDynamicBodySize && distance > 0.0;
        const collisionKey = [bodyA.target.uuid, bodyB.target.uuid].sort().join(':');
        const isTested = typeof tests[collisionKey] !== 'undefined';

        if (!isNearby || isTested) {
          return;
        }

        tests[collisionKey] = {
          bodyA,
          bodyB
        };
      });
      return true;
    });
    const distance = MathService.getVec3(0.0, 0.0, 0.0, 'physics-6');
    Object.keys(tests).forEach((testId, index) => {
      const {
        bodyA,
        bodyB
      } = tests[testId];

      if (bodyA === bodyB) {
        return;
      }

      bodyA.target.getWorldPosition(positionA);
      bodyB.target.getWorldPosition(positionB);
      distance.copy(positionB).sub(positionA);
      bodyA.boundingBox.setFromObject(bodyA.target);
      bodyB.boundingBox.setFromObject(bodyB.target);

      if (DummyDebug.get(DebugFlags.DEBUG_PHYSICS_DYNAMIC)) {
        createArrowHelper(RenderService.getScene(), `physicsService-updateDynamicBodies-${index}-distance`, distance, positionA);
        createBoxHelper(RenderService.getScene(), `physicsService-updateDynamicBodies-${index}-boxA`, bodyA.boundingBox);
        createBoxHelper(RenderService.getScene(), `physicsService-updateDynamicBodies-${index}-boxB`, bodyB.boundingBox);
      }

      if (bodyA.boundingBox.intersectsBox(bodyB.boundingBox)) {
        if (bodyA.target.userData.collisionCallbackRef) {
          bodyA.target.userData.collisionCallbackRef(bodyB.target);
        }

        if (bodyB.target.userData.collisionCallbackRef) {
          bodyB.target.userData.collisionCallbackRef(bodyA.target);
        }
      }
    });
    MathService.releaseVec3(positionA);
    MathService.releaseVec3(positionB);
    MathService.releaseVec3(distance);
  }

  registerBody(object) {
    this.bodies.push(object);
  }

  registerDynamicCollisionBody(object, collisionCallback) {
    if (collisionCallback) {
      object.target.userData.collisionCallbackRef = collisionCallback;
    }

    this.dynamicBodies.push(object);
    object.boundingBox.setFromObject(object.target);
    const bodySize = MathService.getVec3();
    object.boundingBox.getSize(bodySize);
    this.maxDynamicBodySize = Math.max(this.maxDynamicBodySize, bodySize.x, bodySize.y, bodySize.z);
    MathService.releaseVec3(bodySize);
  }

  registerNavmap(object) {
    this.enableNavmap(object);
  }

  enableNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);
    this.navmaps.push(object);
    this.updatePathfinder();
  }

  disableNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);
    this.updatePathfinder();
  }

  updatePathfinder() {
    if (!this.pathfinder) {
      this.pathfinder = new threePathfinding.Pathfinding();
    }

    const navmapGeometries = this.navmaps.filter(navmap => navmap.geometry).map(navmap => navmap.geometry);

    if (!navmapGeometries.length) {
      this.pathfinedEnabled = false;
      return;
    }

    const navmeshGeometry = (BufferGeometryScope__namespace.mergeBufferGeometries ? BufferGeometryScope__namespace : BufferGeometryScope__namespace.BufferGeometryUtils).mergeBufferGeometries(navmapGeometries, false);
    const zone = threePathfinding.Pathfinding.createZone(navmeshGeometry);
    this.pathfinder.setZoneData(this.pathfinderZoneId, zone);
    this.pathfinedEnabled = this.pathfinder.zones.length > 0;
  }

  registerSurfaceHandler(surfaceType, handlerClass, onInteraction = 'onInteraction', onEnter = 'onEnter', onLeave = 'onLeave') {
    this.surfaceHandlers[surfaceType] = {
      cls: handlerClass,
      onInteraction,
      onEnter,
      onLeave
    };
  }

  registerSurface(object) {
    const surfaceType = object.userData.surface;
    const surfaceHandler = this.surfaceHandlers[surfaceType];

    if (!surfaceType) {
      return;
    }

    if (!surfaceHandler) {
      console.warn('registerSurface', `surfaceHandler for "${surfaceType}" does not exist`);
      return;
    }

    const surfaceConstructor = surfaceHandler.cls;
    object.userData.surfaceRef = new surfaceConstructor(object);
    this.surfaces.push(object);
  }

  getNavmaps() {
    return this.navmaps;
  }

  disposeBody(object) {
    this.bodies = this.bodies.filter(match => match !== object);
    this.dynamicBodies = this.dynamicBodies.filter(match => match !== object);
  }

  disposeNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);
  }

  disposeSurface(object) {
    this.surfaces = this.surfaces.filter(match => match !== object);
  }

  disposeAll() {
    this.bodies = [];
    this.dynamicBodies = [];
    this.navmaps = [];
    this.surfaces = [];
    this.surfaceHandlers = {};

    if (this.pathfinder) {
      this.pathfinder = null;
    }
  }

}

const PhysicsService = new PhysicsServiceClass();

class InputServiceClass {
  constructor() {
    _defineProperty(this, "keys", {});

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  key(key) {
    return this.keys[id];
  }

  onKeyDown({
    key: pressed
  }) {
    const id = `${pressed}`.toLowerCase();
    this.keys[id] = true;
  }

  onKeyUp({
    key: released
  }) {
    const id = `${released}`.toLowerCase();
    this.keys[id] = false;
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.keys = {};
  }

}

const InputService = new InputServiceClass();

class UiServiceClass {
  constructor() {
    _defineProperty(this, "uiElements", []);

    _defineProperty(this, "uiScene", this.createUiScene());

    _defineProperty(this, "tween", 0.8);
  }

  createUiScene() {
    const scene = new Three__namespace.Object3D();
    const ambientLight = new Three__namespace.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    return scene;
  }

  registerUiElement(object) {
    this.uiScene.add(object);
    this.uiElements.push(object);
  }

  isUiElement(object) {
    let result = false;
    object.traverseAncestors(parent => {
      result = result || parent === this.uiScene;
    });
    return result;
  }

  onFrame() {
    const camera = RenderService.getNativeCamera();
    const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'ui-1');
    const cameraQuaternion = MathService.getQuaternion();
    camera.getWorldPosition(cameraPosition);
    camera.getWorldQuaternion(cameraQuaternion);
    this.uiScene.position.lerp(cameraPosition, this.tween);
    this.uiScene.quaternion.slerp(cameraQuaternion, this.tween);
    MathService.releaseVec3(cameraPosition);
    MathService.releaseQuaternion(cameraQuaternion);
    this.uiScene.updateMatrixWorld();
  }

  disposeAll() {
    this.uiElements.forEach(layer => {
      AssetsService.registerDisposable(layer);
    });
    this.uiElements = [];
    this.tween = 0.8;
  }

}

const UiService = new UiServiceClass();

const AudioChannelEnums = {
  ambientChannel: 'ambient',
  globalChannel: 'global'
};

class AudioServiceClass {
  constructor() {
    _defineProperty(this, "channels", {});
  }

  init() {
    howler.Howler.autoUnlock = true;
  }

  setMasterVolume(volume = 1.0) {
    howler.Howler.volume(volume);
  }

  getMasterVolume() {
    return howler.Howler.volume();
  }

  setAudioVolume(audio, volume = 1.0) {
    if (!audio) {
      return;
    }

    audio.volume(volume);
  }

  setAudioPlaybackRate(audio, playbackRate = 1.0) {
    if (!audio) {
      return;
    }

    audio.rate(playbackRate);
  }

  setChannelVolume(channel, volume = 1.0, tweenDuration = 0.0) {
    if (!this.channels[channel]) {
      return;
    }

    if (tweenDuration) {
      this.channels[channel].fade(this.channels[channel].volume(), volume, tweenDuration * 1000);
    } else {
      this.channels[channel].volume(volume);
    }
  }

  setChannelPlaybackRate(channel, playbackRate = 1.0) {
    if (!this.channels[channel]) {
      return;
    }

    this.channels[channel].rate(playbackRate);
  }

  stopChannel(channel) {
    if (!this.channels[channel]) {
      return;
    }

    this.stopAudio(this.channels[channel]);
    this.channels[channel] = null;
  }

  async playAudio(channel, audioOrPromised, loop = false) {
    if (!audioOrPromised) {
      return;
    }

    if (channel && this.channels[channel]) {
      this.stopAudio(this.channels[channel]);
      this.channels[channel] = null;
    }

    const audio = await audioOrPromised;
    audio.loop(loop || channel && channel === AudioChannelEnums.ambientChannel);
    audio.mute(false);
    audio.play();

    if (channel) {
      this.channels[channel] = audio;
    }

    return audio;
  }

  stopAudio(sound) {
    sound.stop();
    sound.mute();
    sound.unload();
  }

  resetAudio() {
    Object.keys(this.channels).forEach(key => {
      const sound = this.channels[key];
      AssetsService.registerDisposable(sound);
      this.stopAudio(sound);
    });
    this.channels = {};
  }

  disposeAll() {
    this.resetAudio();
  }

}

const AudioService = new AudioServiceClass();

const removePlaceholder = target => {
  if (target.geometry) {
    AssetsService.disposeProps(target.geometry);
  }

  if (target.material) {
    AssetsService.disposeProps(target.material);
  }

  if (target.children) {
    target.children.forEach(child => target.remove(child));
  }

  delete target.geometry;
  delete target.material;
  target.isGroup = true; // NOTE Very nasty hack

  target.isMesh = false;
};

class ParticleServiceClass {
  constructor() {
    _defineProperty(this, "emitters", []);
  }

  init() {
    TimeService.registerPersistentFrameListener(({
      dt
    }) => {
      this.emitters.forEach(emitter => {
        const {
          particles,
          onFrame,
          onReset,
          active
        } = emitter;
        particles.forEach(target => {
          if (!target.visible) {
            if (!active) {
              return;
            } else {
              target.visible = true;
            }
          }

          target.userData.lifeTime += dt;

          if (target.userData.lifeTime < 0.0) {
            target.visible = false;
            return;
          }

          if (onFrame({
            target: target.children[0],
            random: target.userData.particleEmitterRandom,
            lifeTime: target.userData.lifeTime
          }) === false) {
            if (active) {
              if (onReset) {
                onReset({
                  target: target.children[0]
                });
              }

              this.createRandomParticle(target, emitter);
            } else {
              target.visible = false;
            }
          }
        });
      });
    });
  }

  registerParticleEmitter(object, {
    particleObject,
    particleDensity,
    positionBase,
    rotationBase,
    scaleBase,
    positionJitter,
    rotationJitter,
    scaleJitter,
    spawnJitter,
    globalTransforms,
    onCreate,
    onFrame,
    onReset
  } = {}) {
    const emitterProps = {
      particleDensity: defaultTo(particleDensity, 10),
      positionBase: defaultTo(positionBase, [0.0, 0.0, 0.0]),
      rotationBase: defaultTo(rotationBase, [0.0, 0.0, 0.0]),
      scaleBase: defaultTo(scaleBase, [1.0, 1.0, 1.0]),
      positionJitter: defaultTo(positionJitter, [1.0, 1.0, 1.0]),
      rotationJitter: defaultTo(rotationJitter, [Math.PI, Math.PI, Math.PI]),
      scaleJitter: defaultTo(scaleJitter, 0.1),
      spawnJitter: defaultTo(spawnJitter, 0.0),
      globalTransforms: defaultTo(globalTransforms, false),
      particles: [],
      root: object,
      onFrame,
      onReset,
      active: true
    };
    const scene = RenderService.getScene();

    emitterProps.play = () => emitterProps.active = true;

    emitterProps.stop = () => emitterProps.active = false;

    emitterProps.toggle = () => emitterProps.active = !emitterProps.active;

    removePlaceholder(object);

    if (!onFrame || !particleObject) {
      return;
    }

    AssetsService.registerDisposable(particleObject);

    for (let i = 0; i < emitterProps.particleDensity; i++) {
      const particle = new Three__namespace.Group();
      particle.add(particleObject.clone());
      this.createRandomParticle(particle, emitterProps);

      if (onCreate) {
        onCreate({
          target: particle.children[0]
        });
      }

      if (globalTransforms) {
        scene.add(particle);
      } else {
        object.add(particle);
      }

      AssetsService.registerDisposable(particle);
      emitterProps.particles.push(particle);
    }

    this.emitters.push(emitterProps);
    return emitterProps;
  }

  createRandomParticle(pivot, emitterProps) {
    const {
      positionBase,
      rotationBase,
      scaleBase,
      positionJitter,
      rotationJitter,
      spawnJitter,
      scaleJitter,
      globalTransforms,
      root
    } = emitterProps;
    const object = pivot.children[0];
    const position = this.getUniformBase(positionBase);
    const rotation = this.getUniformBase(rotationBase);
    const scale = this.getUniformBase(scaleBase);
    const positionShift = this.getUniformRandomness(positionJitter);
    const rotationShift = this.getUniformRandomness(rotationJitter);
    const scaleShift = this.getUniformRandomness(scaleJitter);
    object.position.x = position[0] + positionShift[0];
    object.position.y = position[1] + positionShift[1];
    object.position.z = position[2] + positionShift[2];
    object.rotation.x = rotation[0] + rotationShift[0];
    object.rotation.y = rotation[1] + rotationShift[1];
    object.rotation.z = rotation[2] + rotationShift[2];
    object.scale.x = scale[0] + scaleShift[0];
    object.scale.y = scale[0] + scaleShift[1];
    object.scale.z = scale[0] + scaleShift[2];

    if (globalTransforms) {
      const transformVector = MathService.getVec3(0.0, 0.0, 0.0, 'particle-1');
      const transformQuaternion = MathService.getQuaternion();
      root.getWorldPosition(transformVector);
      root.getWorldQuaternion(transformQuaternion);
      pivot.position.copy(transformVector);
      pivot.quaternion.copy(transformQuaternion);
      pivot.scale.copy(root.scale);
      MathService.releaseVec3(transformVector);
      MathService.releaseQuaternion(transformQuaternion);
    }

    pivot.userData.lifeTime = spawnJitter ? -Math.random() * spawnJitter : 0.0;
    pivot.userData.particleEmitterRandom = Math.random();
  }

  getUniformBase(value) {
    if (value instanceof Array) {
      return [value[0], value[1], value[2]];
    } else if (value instanceof Three__namespace.Vector3) {
      return [value.x, value.y, value.z];
    } else if (typeof value === 'number') {
      return [value, value, value];
    }

    return [0, 0, 0];
  }

  getUniformRandomness(value) {
    if (value instanceof Array) {
      return [MathUtils.randFloatSpread(value[0]), MathUtils.randFloatSpread(value[1]), MathUtils.randFloatSpread(value[2])];
    } else if (value instanceof Three__namespace.Vector3) {
      return [MathUtils.randFloatSpread(value.x), MathUtils.randFloatSpread(value.y), MathUtils.randFloatSpread(value.z)];
    } else if (typeof value === 'number') {
      const uniformRandom = MathUtils.randFloatSpread(value);
      return [uniformRandom, uniformRandom, uniformRandom];
    }

    return [0, 0, 0];
  }

  disposeAll() {
    delete this.emitters;
    this.emitters = [];
  }

}

const ParticleService = new ParticleServiceClass();

class RenderServiceClass {
  constructor() {
    _defineProperty(this, "systemClock", new Three__namespace.Clock());

    _defineProperty(this, "animationClock", new Three__namespace.Clock());

    _defineProperty(this, "animationDelta", 0.0);

    _defineProperty(this, "camera", null);

    _defineProperty(this, "renderer", null);

    _defineProperty(this, "composer", null);

    _defineProperty(this, "postProcessingEffects", {});

    _defineProperty(this, "scene", null);

    _defineProperty(this, "controls", null);

    _defineProperty(this, "currentView", null);

    _defineProperty(this, "paused", false);

    _defineProperty(this, "onPaused", null);

    _defineProperty(this, "onResumed", null);

    _defineProperty(this, "animationLoop", null);

    _defineProperty(this, "systemLoop", null);

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

  init({
    domElement,
    pixelRatio
  } = {}) {
    const windowInfo = this.getWindowSize();
    const camera = new Three__namespace.PerspectiveCamera(GameInfoService.config.system.camera.fov, windowInfo.aspectRatio, GameInfoService.config.system.camera.near, GameInfoService.config.system.camera.far);
    this.camera = camera;
    const scene = new Three__namespace.Scene();
    scene.background = new Three__namespace.Color(GameInfoService.config.system.sceneBackgroundDefault);
    this.scene = scene;

    if (GameInfoService.config.system.vr) {
      GameInfoService.config.system.postprocessing = false;
    }

    const renderer = new Three__namespace.WebGLRenderer({
      antialias: GameInfoService.config.system.antialiasing,
      powerPreference: 'high-performance'
    });
    renderer.toneMapping = Three__namespace.ACESFilmicToneMapping;
    renderer.outputEncoding = Three__namespace.sRGBEncoding;
    renderer.autoClear = false;
    renderer.physicallyCorrectLights = true;
    renderer.xr.enabled = GameInfoService.config.system.vr || false;
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
      const composer = new postprocessing.EffectComposer(this.renderer, {
        frameBufferType: Three__namespace.HalfFloatType
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
    VarService.init({
      language: 'en'
    });
    InteractionsService.init({
      camera: this.camera
    });
    PhysicsService.init();
    CameraService.init({
      camera: this.camera
    });
    InputService.init();
    ParticleService.init();
    AudioService.init({
      root: this.camera
    });
  }

  initPostProcessing() {
    const worldRenderPass = new postprocessing.RenderPass(this.scene, this.camera);
    this.composer.addPass(worldRenderPass);
    this.composer.addPass(new postprocessing.ClearPass(false, true, false));
    const uiRenderPass = new postprocessing.RenderPass(UiService.uiScene, this.camera);
    uiRenderPass.clear = false;
    this.composer.addPass(uiRenderPass);
    this.composer.addPass(new postprocessing.ClearPass(false, true, false));
    const bloomDefaults = {
      luminanceThreshold: 0.0,
      luminanceSmoothing: 0.8,
      intensity: 0.2,
      kernelSize: 5,
      width: 256,
      height: 256
    };
    const bloomEffect = new postprocessing.BloomEffect(bloomDefaults);
    const bloomPass = new postprocessing.EffectPass(this.camera, bloomEffect);
    this.composer.addPass(bloomPass);
    this.postProcessingEffects.bloom = {
      effect: postprocessing.BloomEffect,
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
    const newEffect = new postprocessing.BloomEffect({ ...(this.postProcessingEffects[id].defaults || {}),
      ...values
    });
    const newPass = new postprocessing.EffectPass(this.camera, newEffect);
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
    if (!this.renderer.xr.enabled) {
      this.onAnimationFrame();
    } else {
      this.renderer.setAnimationLoop(() => this.onAnimationFrame());
    }

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
    CameraService.onFrame();
    UiService.onFrame();
    TimeService.onFrame({
      dt,
      elapsedTime
    });
  }

  onAnimationFrame() {
    if (!this.renderer.xr.enabled) {
      if (this.animationLoop) {
        cancelAnimationFrame(this.animationLoop);
      }

      this.animationLoop = requestAnimationFrame(() => this.onAnimationFrame());
    }

    const dt = this.animationClock.getDelta();

    if (!this.paused) {
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
      aspectRatio: window.innerWidth / window.innerHeight
    };
  }

  pauseRendering(whenPaused) {
    this.paused = true;
    this.onResumed = null;

    if (whenPaused) {
      this.onPaused = whenPaused;
    } else {
      return new Promise(resolve => {
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
      return new Promise(resolve => {
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

const RenderService = new RenderServiceClass();

const convertMaterialType = (material, targetType = 'basic') => {
  const [materialConstructor, inheritProps] = {
    'basic': ['MeshBasicMaterial', ['alphaMap', 'color', 'map']],
    'normal': ['MeshNormalMaterial', ['normalMap', 'displacementMap', 'displacementScale']],
    'depth': ['MeshDepthMaterial', ['normalMap', 'displacementMap', 'displacementScale']],
    'lambert': ['MeshLambertMaterial', ['alphaMap', 'color', 'map', 'reflectivity', 'emissive', 'emissiveMap', 'emissiveIntensity', 'specularMap', 'envMap']],
    'phong': ['MeshPhongMaterial', ['alphaMap', 'aoMap', 'displacementMap', 'displacementScale', 'emissive', 'emissiveMap', 'emissiveIntensity', 'normalMap', 'color', 'reflectivity', 'shininess', 'map', 'specular', 'specularMap', 'envMap']],
    'standard': ['MeshStandardMaterial', ['alphaMap', 'aoMap', 'color', 'map', 'reflectivity', 'emissive', 'emissiveMap', 'emissiveIntensity', 'displacementMap', 'displacementScale', 'metalness', 'metalnessMap', 'roughness', 'roughnessMap', 'normalMap', 'envMap']],
    'physical': ['MeshPhysicalMaterial', ['alphaMap', 'aoMap', 'color', 'map', 'reflectivity', 'emissive', 'emissiveMap', 'emissiveIntensity', 'displacementMap', 'displacementScale', 'metalness', 'metalnessMap', 'roughness', 'roughnessMap', 'normalMap', 'clearcoat', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughness', 'clearcoatRoughnessMap', 'ior', 'reflectivity', 'sheen', 'transmission', 'transmissionMap', 'envMap']],
    'toon': ['MeshToonMaterial', ['alphaMap', 'aoMap', 'displacementMap', 'displacementScale', 'emissive', 'emissiveMap', 'emissiveIntensity', 'normalMap', 'color', 'map']],
    'matcap': ['MeshMatcapMaterial', ['alphaMap', 'color', 'displacementMap', 'displacementScale', 'map', 'matcap', 'normalMap']]
  }[targetType];

  if (!materialConstructor || !material) {
    return;
  }

  const replacementProps = {};
  [...inheritProps, 'side', 'name', 'skinning', 'transparent', 'vertexColors', 'visible', 'toneMapped', 'dithering', 'premultipliedAlpha', 'precision', 'opacity'].forEach(prop => {
    replacementProps[prop] = material[prop] || null;
  });
  return new Three__namespace[materialConstructor](replacementProps);
};

const loaders = {
  models: new GLTFLoader.GLTFLoader(),
  images: new Three__namespace.TextureLoader(),
  hdri: new RGBELoader.RGBELoader(),
  audio: new Three__namespace.AudioLoader()
};

class AssetsServiceClass {
  constructor() {
    _defineProperty(this, "disposables", []);

    _defineProperty(this, "pending", {});

    _defineProperty(this, "preloaded", {});

    _defineProperty(this, "savedMaterials", {});

    _defineProperty(this, "audioBuffers", {});
  }

  getDefaultCube() {
    const cube = new Three__namespace.Mesh(new Three__namespace.BoxBufferGeometry(1, 1, 1), new Three__namespace.MeshNormalMaterial());
    this.registerDisposable(cube);
    return cube;
  }

  getAmbientLight(groundColor = 0xffffff, skyColor = 0xffffff, intensity = 1.0) {
    const light = new Three__namespace.HemisphereLight(groundColor, skyColor, intensity);
    this.registerDisposable(light);
    return light;
  }

  registerAsyncAsset(promisable) {
    const pid = uuid__namespace.v4();
    const promised = new Promise((resolve, reject) => {
      new Promise(promisable).then(result => {
        if (!this.pending[pid]) {
          this.disposeAsset(result);
          return reject();
        }

        delete this.pending[pid];
        resolve(result);
      });
    });
    this.pending[pid] = promised;
    return promised;
  }

  getTexture(path) {
    return this.registerAsyncAsset(resolve => {
      this.getImageSync(path, image => {
        resolve(image);
      });
    });
  }

  getTextureSync(path, then) {
    return loaders.images.load(path, image => {
      this.registerDisposable(image);
      image.encoding = Three__namespace.sRGBEncoding;

      if (then) {
        then(image);
      }
    });
  }

  getImage(path) {
    console.warn('AssetsService', 'getImage', 'AssetsService.getImage is deprecated, please use AssetsService.getTexture instead');
    return this.getTexture(path);
  }

  getImageSync(path, then) {
    console.warn('AssetsService', 'getImageSync', 'AssetsService.getImageSync is deprecated, please use AssetsService.getTextureSync instead');
    return this.getTextureSync(path, then);
  }

  getHDRI(path, encoding = Three__namespace.RGBEEncoding) {
    return this.registerAsyncAsset(resolve => {
      loaders.hdri.setDataType(Three__namespace.UnsignedByteType).load(path, texture => {
        const renderer = RenderService.getRenderer();
        const generator = new Three__namespace.PMREMGenerator(renderer);
        const renderTarget = generator.fromEquirectangular(texture);
        const hdri = renderTarget.texture;
        hdri.encoding = encoding || Three__namespace.RGBEEncoding;
        AssetsService.registerDisposable(hdri);
        AssetsService.registerDisposable(renderTarget);
        texture.dispose();
        generator.dispose();
        resolve(hdri);
      });
    });
  }

  getReflectionsTexture(path) {
    return this.registerAsyncAsset(resolve => {
      this.getTexture(path).then(texture => {
        const renderer = RenderService.getRenderer();
        const generator = new Three__namespace.PMREMGenerator(renderer);
        const renderTarget = generator.fromEquirectangular(texture);
        const reflections = renderTarget.texture;
        reflections.encoding = Three__namespace.sRGBEncoding;
        AssetsService.registerDisposable(reflections);
        AssetsService.registerDisposable(renderTarget);
        texture.dispose();
        generator.dispose();
        resolve(reflections);
      });
    });
  }

  getModel(path, {
    internalAllowPreloaded,
    forceUniqueMaterials,
    forceMaterialsType
  } = {}) {
    return this.registerAsyncAsset(resolve => {
      // NOTE Prevent fetching previously preloaded models when preloading
      if (internalAllowPreloaded !== false) {
        if (this.preloaded[path] && this.preloaded[path].length > 0) {
          const preloaded = this.preloaded[path].pop();
          return resolve(preloaded);
        }
      }

      loaders.models.load(path, model => {
        const renderer = RenderService.getRenderer();
        const camera = RenderService.getNativeCamera();
        model.parser.cache.removeAll();
        delete model.parser;
        delete model.asset;
        delete model.scenes;
        model.scene.traverse(child => {
          this.registerDisposable(child);

          if (child.material) {
            if (forceMaterialsType) {
              child.material = convertMaterialType(child.material, forceMaterialsType);
            } else if (forceUniqueMaterials) {
              child.material = this.cloneMaterial(child.material);
            }
          }

          if (GameInfoService.config.system.correctBlenderLights) {
            // NOTE More arbitrary that you dare to imagine 👀
            if (child instanceof Three__namespace.Light) {
              child.intensity /= 68.3;

              if (typeof child.distance === 'number') {
                child.distance *= 10.0;
              }

              if (typeof child.decay === 'number') {
                child.decay /= 2.0;
              }
            }
          }
        });
        model.scene.frustumCulled = false;

        model.scene.onAfterRender = function () {
          model.scene.frustumCulled = true;

          model.scene.onAfterRender = function () {};
        };

        renderer.compile(model.scene, camera);
        model.scene.userData.skinnedAnimations = model.animations;
        delete model.animations;
        resolve(model.scene);
      });
    });
  }

  preloadModel(path, {
    forceUniqueMaterials
  } = {}) {
    return this.getModel(path, {
      internalAllowPreloaded: false,
      forceUniqueMaterials: forceUniqueMaterials
    }).then(model => {
      if (!this.preloaded[path]) {
        this.preloaded[path] = [];
      }

      this.preloaded[path].push(model);
      return Promise.resolve();
    });
  }

  preloadFont(path) {
    return this.registerAsyncAsset(resolve => {
      troikaThreeText.preloadFont({
        font: path,
        characters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ',', ':']
      }, resolve);
    });
  }

  preloadAudio(path) {
    return this.registerAsyncAsset(resolve => {
      const audio = new howler.Howl({
        src: [path],
        loop: false,
        autoplay: false,
        mute: false,
        rate: 1.0,
        onload: () => {
          this.registerDisposable(audio);
        }
      });
      resolve(audio);
    });
  }

  getAudio(path) {
    return this.registerAsyncAsset(resolve => {
      if (this.audioBuffers[path]) {
        return resolve(this.audioBuffers[path]);
      }

      this.preloadAudio(path).then(audio => {
        return resolve(audio);
      });
    });
  }

  getMaterial(name) {
    if (this.savedMaterials[name]) {
      return this.cloneMaterial(this.savedMaterials[name]);
    }
  }

  saveMaterial(material) {
    if (this.savedMaterials[material.name]) {
      return;
    }

    this.registerDisposable(material);
    this.savedMaterials[material.name] = this.cloneMaterial(material);
  }

  cloneMaterial(material) {
    const copy = material.clone();
    this.registerDisposable(material);
    this.registerDisposable(copy);
    return copy;
  }

  cloneTexture(texture) {
    const copy = texture.clone();
    this.registerDisposable(copy);
    return copy;
  }

  registerDisposeCallback(object, dispose) {
    if (!object || !dispose || !object.userData) {
      return;
    }

    if (!object.userData.disposeRefs) {
      object.userData.disposeRefs = [];
    }

    object.userData.disposeRefs.push(dispose);
  }

  markDisposable(object) {
    object.__registeredDisposable__ = true;
  }

  markDisposed(object) {
    object.__registeredDisposable__ = false;
    object.__disposed__ = true;
  }

  markUndisposed(object, reason) {
    object.__undisposed__ = reason;
  }

  isDisposed(object) {
    return object.__disposed__;
  }

  willBeDisposed(object) {
    return object.__registeredDisposable__;
  }

  registerDisposable(object) {
    if (!object || object.__registeredDisposable__) {
      return;
    }

    this.markDisposable(object);
    this.disposables.push(object);

    if (object.children) {
      object.children.forEach(child => this.registerDisposable(child));
    }
  }

  disposeAll() {
    Object.keys(this.pending).forEach(pid => {
      delete this.preloaded[pid];
    });
    Object.keys(this.preloaded).forEach(path => {
      while (this.preloaded[path].length > 0) {
        this.disposables.push(this.preloaded[path].pop());
      }

      delete this.preloaded[path];
    });
    Object.keys(this.audioBuffers).forEach(path => {
      delete this.audioBuffers[path];
    });
    this.disposables = this.disposables.filter(object => {
      this.disposeAsset(object);
      return false;
    });
    this.savedMaterials = {};
    this.audioBuffers = {};
    this.preloaded = [];
    this.pending = {};
  }

  disposeAsset(object) {
    if (!object || typeof object !== 'object') {
      return;
    }

    if (object instanceof Three__namespace.Scene || object instanceof Three__namespace.Camera) {
      this.markUndisposed(object, 'Object is a Scene or Camera');
      return;
    }

    if (object instanceof AudioBuffer) {
      this.markUndisposed(object, 'Object is an AudioBuffer');
      return;
    }

    if (object instanceof howler.Howl) {
      AudioService.stopAudio(object);
      return;
    }

    object.visible = false;

    if (object.__registeredDisposable__) {
      this.markDisposed(object);
      this.disposables = this.disposables.filter(match => match !== object);
    }

    if (object.parent) {
      object.parent.remove(object);
    }

    if (object instanceof troikaThreeText.Text) {
      object.dispose();

      if (object._textRenderInfo && object._textRenderInfo.sdfTexture) {
        object._textRenderInfo.sdfTexture.dispose();
      }

      return;
    }

    if (object.children) {
      object.children = object.children.filter(child => {
        child.parent = null;
        this.disposeAsset(child);
      });
    }

    if (object.geometry) {
      object.geometry.dispose();
      delete object.geometry;
    }

    if (object.material) {
      this.disposeProps(object.material);

      try {
        object.material.dispose();
      } catch (error) {
        console.info(object);
      }

      delete object.material;
    }

    if (object.userData) {
      if (object.userData.disposeRefs) {
        object.userData.disposeRefs.forEach(dispose => dispose && dispose());
      }

      Object.keys(object.userData).forEach(key => {
        delete object.userData[key];
      });
    }

    this.disposeProps(object);

    if (typeof object.dispose === 'function') {
      object.dispose();
    }
  }

  disposeProps(object) {
    Object.keys(object).forEach(prop => {
      if (object[prop] && typeof object[prop].dispose === 'function') {
        object[prop].dispose();
      }
    });

    if (typeof object.dispose === 'function') {
      object.dispose();
    }
  }

}

const AssetsService = new AssetsServiceClass();

class GameObjectClass extends Three__namespace.Group {
  constructor() {
    super();
    AssetsService.registerDisposable(this);
  }

  onCreate() {}

  dispose() {}

}

class AiServiceClass {
  constructor() {
    _defineProperty(this, "aiNodes", []);
  }

  registerAiNode(object) {
    this.aiNodes.push(object);
  }

  getAiNodeById(id) {
    return this.aiNodes.find(node => {
      return node.userData.aiNode === id;
    });
  }

  disposeAiNode(object) {
    this.aiNodes = this.aiNodes.filter(match => match !== object);
  }

  disposeAll() {
    this.aiNodes = [];
  }

}

const AiService = new AiServiceClass();

const parseCamera = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.camera)) {
    object.visible = false;
    CameraService.addCamera(userData.camera, object);
    AssetsService.registerDisposeCallback(object, () => CameraService.disposeCamera(userData.camera));
  }
};

const parseAction = (object, parserPayload) => {
  const {
    userData
  } = object;
  const {
    actions
  } = parserPayload;

  if (isDefined(userData.action)) {
    const actionCallback = actions[userData.action];

    if (typeof actionCallback === 'function') {
      InteractionsService.registerListener(object, InteractionEnums.eventClick, ({
        stopPropagation
      } = {}) => {
        actionCallback(object, { ...parserPayload,
          stopPropagation
        });
      });
      AssetsService.registerDisposeCallback(object, () => InteractionsService.disposeListener(object));
    } else {
      console.info('parseAction', 'action does not exist or not a valid action', userData.action);
    }
  }
};

class Text extends GameObjectClass {
  constructor({
    font,
    color,
    textAlign,
    fontSize,
    text,
    outlineWidth,
    outlineColor,
    alwaysOnTop
  } = {}) {
    super();

    _defineProperty(this, "troikaText", null);

    const troikaText = new troikaThreeText.Text();
    troikaText.font = font;
    troikaText.text = text;
    troikaText.anchorX = textAlign || 'center';
    troikaText.textAlign = textAlign || 'center';
    troikaText.fontSize = fontSize || 1.0;
    troikaText.material.transparent = true;
    troikaText.color = new Three__namespace.Color(color || '#ffffff');

    if (alwaysOnTop) {
      troikaText.renderOrder = Number.MAX_SAFE_INTEGER;
      troikaText.material.depthTest = false;
    }

    if (outlineWidth) {
      troikaText.outlineWidth = `${outlineWidth}%`;
      troikaText.outlineColor = new Three__namespace.Color(outlineColor || '#000000');
    }

    troikaText.sync();
    this.troikaText = troikaText;
    this.add(troikaText);
  }

}

const replacePlaceholder = (target, replacement) => {
  if (target.geometry) {
    AssetsService.disposeProps(target.geometry);
  }

  if (target.material) {
    AssetsService.disposeProps(target.material);
  }

  if (target.children) {
    target.children.forEach(child => target.remove(child));
  }

  delete target.geometry;
  delete target.material;
  target.isGroup = true; // NOTE Very nasty hack

  target.isMesh = false;
  replacement.rotation.y = Math.PI; // NOTE Blender rotations are weird

  target.add(replacement);
};

const parseLabel = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.label)) {
    const label = new Text({
      font: GameInfoService.config.fonts[userData.labelFont] || GameInfoService.config.fonts.default,
      fontSize: userData.labelSize || 1.0,
      textAlign: userData.labelAlign || 'center',
      color: '#ffffff',
      outlineWidth: userData.labelOutlineColor ? 5.0 : 0.0,
      outlineColor: userData.labelOutlineColor || '#000000',
      alwaysOnTop: userData.labelAlwaysOnTop,
      text: ''
    });
    VarService.resolveVar(userData.label, value => {
      label.troikaText.text = value;
      label.troikaText.sync();
    }, listener => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.label, listener));
    });
    VarService.resolveVar(userData.labelColor, value => {
      label.troikaText.color.set(value || '#ffffff');
      label.troikaText.sync();
    }, listener => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.labelColor, listener));
    });
    const positionOffset = MathService.getVec3(0.0, 0.5 * (userData.labelSize || 1.0), 0.0, 'var-label-1');
    object.position.add(positionOffset);
    MathService.releaseVec3(positionOffset);
    object.userData.troikaRef = label.troikaText;
    replacePlaceholder(object, label);
  }
};

class ScrollList extends GameObjectClass {
  constructor({
    scrollSpeed,
    scrollTween
  } = {}) {
    super();

    _defineProperty(this, "scrollX", false);

    _defineProperty(this, "scrollY", true);

    _defineProperty(this, "scrollPositionX", 0.0);

    _defineProperty(this, "scrollPositionY", 0.0);

    _defineProperty(this, "scrollTween", 0.1);

    _defineProperty(this, "scrollSpeed", 6.0);

    _defineProperty(this, "scrollHitbox", null);

    _defineProperty(this, "scrollMaxOffsetX", 0.0);

    _defineProperty(this, "scrollMaxOffsetY", 0.0);

    _defineProperty(this, "axisX", 'z');

    _defineProperty(this, "axisY", 'y');

    this.scrollSpeed = scrollSpeed || this.scrollSpeed;
    this.scrollTween = scrollTween || this.scrollTween;
    this.onCreate();
  }

  onCreate() {
    const debugScrollVisible = DummyDebug.get(DebugFlags.DEBUG_SCROLL_VISIBLE);
    GameObjectClass.prototype.onCreate.call(this);
    this.scrollHitbox = new Three__namespace.Mesh(new Three__namespace.BoxBufferGeometry(1.0, 1.0, 1.0), new Three__namespace.MeshBasicMaterial({
      color: getRandomColor(),
      opacity: debugScrollVisible ? 0.5 : 1.0,
      transparent: debugScrollVisible
    }));
    this.scrollHitbox.visible = debugScrollVisible;
    this.add(this.scrollHitbox);
    TimeService.registerFrameListener(() => {
      if (this.scrollX) {
        if (this.scrollPositionX < 0.0) {
          this.scrollPositionX = Three.MathUtils.lerp(this.scrollPositionX, 0.0, this.scrollTween);
        }

        if (this.scrollPositionX > this.scrollMaxOffsetX) {
          this.scrollPositionX = Three.MathUtils.lerp(this.scrollPositionX, this.scrollMaxOffsetX, this.scrollTween);
        }

        this.position[this.axisX] = Three.MathUtils.lerp(this.position[this.axisX], this.scrollPositionX, this.scrollTween);
      }

      if (this.scrollY) {
        if (this.scrollPositionY < 0.0) {
          this.scrollPositionY = Three.MathUtils.lerp(this.scrollPositionY, 0.0, this.scrollTween);
        }

        if (this.scrollPositionY > this.scrollMaxOffsetY) {
          this.scrollPositionY = Three.MathUtils.lerp(this.scrollPositionY, this.scrollMaxOffsetY, this.scrollTween);
        }

        this.position[this.axisY] = Three.MathUtils.lerp(this.position[this.axisY], this.scrollPositionY, this.scrollTween);
      }
    });
  }

  add(object) {
    InteractionsService.registerListener(object, InteractionEnums.eventDrag, ({
      deltaX,
      deltaY
    }) => {
      if (this.scrollX) {
        this.scrollPositionX -= deltaX * this.scrollSpeed;
      }

      if (this.scrollY) {
        this.scrollPositionY += deltaY * this.scrollSpeed;
      }
    });
    Three__namespace.Group.prototype.add.call(this, object);

    if (object.id === this.scrollHitbox.id) {
      return;
    }

    const boundingBox = UtilsService.getBox3();
    this.remove(this.scrollHitbox);
    boundingBox.setFromObject(this);
    this.add(this.scrollHitbox);
    const geometryCentre = MathService.getVec3(0.0, 0.0, 0.0, 'scroll-list-1');
    boundingBox.getCenter(geometryCentre);
    this.scrollHitbox.position.copy(geometryCentre);
    MathService.releaseVec3(geometryCentre);
    const geometrySize = MathService.getVec3(0.0, 0.0, 0.0, 'scroll-list-2');
    boundingBox.getSize(geometrySize);
    this.scrollHitbox.scale.copy(geometrySize);
    this.scrollMaxOffsetX = geometrySize.x * 0.75;
    this.scrollMaxOffsetY = geometrySize.y * 0.75;
    MathService.releaseVec3(geometrySize);
    this.scrollPositionX = 0.0;
    this.scrollPositionY = 0.0;
    UtilsService.releaseBox3(boundingBox);
  }

}

const parseScroll = (object, {
  scene,
  scrollLists
}) => {
  const {
    userData
  } = object;

  if (isDefined(userData.scroll)) {
    const scrollId = Number(userData.scroll);

    if (!scrollLists[scrollId]) {
      scrollLists[scrollId] = new ScrollList();
      scene.add(scrollLists[scrollId]);
    }

    scrollLists[scrollId].add(object);
  }
};

const parseIf = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.if)) {
    VarService.resolveVar(userData.if, newValue => {
      if (!object || !object.parent) {
        return false;
      }

      object.visible = !!newValue;
    }, listener => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.if, listener));
    });
  }
};

const parseIfNot = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.ifNot)) {
    VarService.resolveVar(userData.ifNot, newValue => {
      if (!object || !object.parent) {
        return false;
      }

      object.visible = !newValue;
    }, listener => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.ifNot, listener));
    });
  }
};

const parseRotateXYZ = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.rotateX) || isDefined(userData.rotateY) || isDefined(userData.rotateZ)) {
    AnimationService.registerAnimation({
      target: object,
      onStep: ({
        target
      }) => {
        if (isDefined(userData.rotateX)) {
          target.rotateX(userData.rotateX);
        }

        if (isDefined(userData.rotateY)) {
          target.rotateY(userData.rotateY);
        }

        if (isDefined(userData.rotateZ)) {
          target.rotateZ(userData.rotateZ);
        }
      }
    });
  }
};

const parseMaterial = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.material)) {
    VarService.resolveVar(userData.material, materialName => {
      if (!object || !object.parent) {
        return false;
      }

      const material = AssetsService.getMaterial(materialName);

      if (material) {
        AssetsService.disposeProps(object.material);
        object.material = material;
      }
    }, listener => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.material, listener));
    });
  }
};

const parseAnimation = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.animation)) {
    const animation = GameInfoService.config.animations[userData.animation];

    if (animation) {
      animation(object);
    } else {
      console.warn('parseAnimation', `animation does not exist`, userData.animation);
    }
  }
};

const parseCacheMaterial = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.cacheMaterial)) {
    AssetsService.saveMaterial(object.material);
    object.userData.cachedMaterialId = object.material.name;
  }
};

const get3dScreenHeight = (depth = 1.0, camera) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const fov = targetCamera.fov * Three.MathUtils.DEG2RAD;

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }

  return 2.0 * Math.tan(fov / 2.0) * Math.abs(depth !== 0.0 ? depth : 1.0);
};
const get3dScreenWidth = (depth = 1.0, camera) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const height = get3dScreenHeight(depth, targetCamera);

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }

  return height * targetCamera.aspect;
};
const fitToScreen = (mesh, depth = 1.0, camera, preserveRatio = false) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const height = get3dScreenHeight(depth, targetCamera) + 1.0;
  const width = height * targetCamera.aspect + 1.0;
  const mock = mesh.clone();
  mock.scale.set(1.0, 1.0, 1.0);
  const box = UtilsService.getBox3();
  box.setFromObject(mock);
  const boxWidth = box.max.x - box.min.x;
  const boxHeight = box.max.y - box.min.y;
  const ratioWidth = width / boxWidth;
  const ratioHeight = height / boxHeight;
  AssetsService.disposeAsset(mock);
  UtilsService.releaseBox3(box);

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }

  if (preserveRatio) {
    const maxRatio = Math.max(ratioWidth, ratioHeight);
    mesh.scale.set(maxRatio, maxRatio, 1.0);
  } else {
    mesh.scale.set(ratioWidth, ratioHeight, 1.0);
  }
};
const fitToCamera = (mesh, camera, preserveRatio = false) => {
  let targetCamera = camera;

  if (!camera) {
    targetCamera = UtilsService.getCamera();
  }

  const distance = MathService.getVec3(0.0, 0.0, 0.0, 'screen-size-1');
  targetCamera.getWorldPosition(distance);
  const meshPosition = MathService.getVec3(0.0, 0.0, 0.0, 'screen-size-1');
  mesh.getWorldPosition(meshPosition);
  distance.sub(meshPosition);
  MathService.releaseVec3(meshPosition);
  fitToScreen(mesh, distance.length(), targetCamera, preserveRatio);
  MathService.releaseVec3(distance);

  if (!camera) {
    UtilsService.releaseCamera(targetCamera);
  }
};

const math2Pi = Math.PI * 2.0;
const mathPi2 = Math.PI / 2.0;
const mathPi4 = Math.PI / 4.0;
const mathPi8 = Math.PI / 8.0;

const parseFullscreen = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.fullscreen)) {
    const camera = RenderService.getNativeCamera();
    const originalOrientation = MathService.getVec3(0.0, 0.0, 0.0, 'fullscreen-1').copy(object.rotation); // NOTE Blender uses XZY axis orientation

    object.rotation.set(-mathPi2, -mathPi2, -mathPi2);

    if (userData.fullscreenOffset) {
      fitToScreen(object, userData.fullscreenOffset, camera, userData.fullscreenPreserveRatio);
    } else {
      const frameListener = TimeService.registerFrameListener(() => {
        fitToCamera(object, camera, userData.fullscreenPreserveRatio);
      });
      AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
    }

    object.scale.set(object.scale.z, object.scale.y, object.scale.x);
    object.rotation.x = originalOrientation.z;
    object.rotation.y = originalOrientation.y;
    object.rotation.z = originalOrientation.x;
    MathService.releaseVec3(originalOrientation);
  }
};

const registerGameObject = (object, {
  gameObjectRefs
}) => {
  const {
    userData
  } = object;

  if (isDefined(userData.gameObject)) {
    gameObjectRefs[userData.gameObject] = object;
  }
};
const parseGameObject = (object, parserPayload) => {
  const {
    userData
  } = object;
  const {
    gameObjects
  } = parserPayload;

  if (isDefined(userData.gameObject)) {
    const gameObjectMap = gameObjects[userData.gameObject];

    if (gameObjectMap) {
      gameObjectMap(object, parserPayload);
    } else {
      console.info('parseGameObject', 'game object type not recognised', userData.gameObject);
    }
  }
};

const parseAiNode = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.aiNode)) {
    if (!DummyDebug.get(DebugFlags.DEBUG_AI_NODES)) {
      removePlaceholder(object);
      object.visible = false;
    } else {
      AssetsService.disposeAsset(object.material);
      object.material = new Three__namespace.MeshNormalMaterial();
      AssetsService.registerDisposable(object.material);
      AnimationService.registerAnimation({
        target: object,
        onCreate: ({
          target
        }) => {
          target.userData.originalLevel = target.position.y;
        },
        onStep: ({
          target,
          animationTime
        }) => {
          target.rotation.y += 0.01;
          target.rotation.x += 0.01;
          target.rotation.z += 0.01;
          target.position.y = target.userData.originalLevel + Math.sin(animationTime);
        },
        onDispose: ({
          target
        }) => {
          delete target.userData.originalLevel;
        }
      });
    }

    AiService.registerAiNode(object);
    AssetsService.registerDisposeCallback(object, () => AiService.disposeAiNode(object));
  }
};

const parseAiSpawn = (object, {
  aiSpawns
}) => {
  const {
    userData
  } = object;

  if (isDefined(userData.aiSpawn)) {
    removePlaceholder(object);
    object.visible = false;
    aiSpawns.push(object);
  }
};

const parseShader = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.shader)) {
    const shaderFunction = GameInfoService.config.shaders[userData.shader];

    if (!shaderFunction || typeof shaderFunction !== 'function') {
      console.info('parseShader', 'shader does not exist or not a valid shader', userData.shader, {
        shaderFunction
      });
      return;
    }

    const shaderMaterial = new Three__namespace.ShaderMaterial(shaderFunction({
      target: object
    }));
    AssetsService.disposeProps(object.material);
    AssetsService.registerDisposable(shaderMaterial);
    object.material = shaderMaterial;
  }
};

const parseNavmap = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.navmap)) {
    object.visible = false;
    PhysicsService.registerNavmap(object);
    AssetsService.registerDisposeCallback(object, () => PhysicsService.disposeNavmap(object));
  }
};

const parseAlign = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.align)) {
    const frameListener = TimeService.registerFrameListener(() => {
      const camera = RenderService.getNativeCamera();
      const position = MathService.getVec3(0.0, 0.0, 0.0, 'align-1');
      const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'align-2');
      object.getWorldPosition(position);
      camera.getWorldPosition(cameraPosition);
      const screenWidth = get3dScreenWidth(position.sub(cameraPosition).length() / 2.0, camera);
      let targetOffset = 0;

      if (userData.align === 'left') {
        targetOffset = -screenWidth / 2.0 + 0.1;
      } else if (userData.align === 'right') {
        targetOffset = screenWidth / 2.0 - 0.1;
      }

      object.position.z = MathUtils.lerp(object.position.z, targetOffset, 0.05);
      MathService.releaseVec3(position);
      MathService.releaseVec3(cameraPosition);
    });
    AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
  }
};

const parseSlideshow = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.slideshow)) {
    let slidesX = parseInt(userData.slidesX, 10);
    let slidesY = parseInt(userData.slidesY, 10);
    const slideshowFrequency = 500;

    if (isNaN(slidesX)) {
      slidesX = 1.0;
    }

    if (isNaN(slidesY)) {
      slidesY = 1.0;
    }

    const dX = slidesX === 1 ? 0 : 1 / slidesX;
    const dY = slidesY === 1 ? 0 : 1 / slidesY;
    AnimationService.registerAnimation({
      target: object,
      interval: slideshowFrequency,
      onCreate: target => {
        if (target.material && target.material.map) {
          target.material = AssetsService.cloneMaterial(target.material);
          target.material.map = AssetsService.cloneTexture(target.material.map);
          target.material.map.offset.x = 0;
          target.material.map.offset.y = 0;
        }
      },
      onStep: ({
        target
      }) => {
        if (!target || !target.parent || !target.material || !target.material.map) {
          return false;
        }

        target.material.map.offset.x += dX;
        target.material.map.offset.y += dY;
      }
    });
  }
};

const parseSurface = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.surface)) {
    PhysicsService.registerSurface(object);
    AssetsService.registerDisposeCallback(object, () => PhysicsService.disposeSurface(object));
  }
};

const parseShading = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.shading)) {
    VarService.resolveVar(userData.shading, value => {
      const replacementMaterial = convertMaterialType(object.material, value);
      AssetsService.registerDisposable(object.material);
      object.material = replacementMaterial;
    }, listener => {
      AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.shading, listener));
    });
  }
};

const parseLeft = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.left)) {
    if (!UiService.isUiElement(object)) {
      console.info('parseLeft', 'object must be part of the UI layer');
      return;
    }

    let frameListener = null;
    VarService.resolveVar(userData.left, value => {
      if (frameListener) {
        TimeService.disposeFrameListener(frameListener);
      }

      if (!value) {
        return;
      }

      const percentageOffset = value.substr(-1) === '%';
      const offset = parseFloat(value);

      if (isNaN(offset)) {
        console.info('parseLeft', 'NaN value');
        return;
      }

      frameListener = TimeService.registerFrameListener(() => {
        if (!object.visible) {
          return;
        }

        const camera = RenderService.getNativeCamera();
        const position = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraDirection = MathService.getVec3(0.0, 0.0, 0.0);
        object.getWorldPosition(position);
        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);
        const cameraOffset = position.sub(cameraPosition).projectOnVector(cameraDirection).length();
        const screenWidth = get3dScreenWidth(cameraOffset, camera);
        object.position.x = -screenWidth / 2.0;

        if (percentageOffset) {
          object.position.x += offset / 100.0 * screenWidth;
        } else {
          object.position.x += offset;
        }

        MathService.releaseVec3(position);
        MathService.releaseVec3(cameraPosition);
        MathService.releaseVec3(cameraDirection);
      });
      AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
    });
  }
};

const parseRight = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.right)) {
    if (!UiService.isUiElement(object)) {
      console.info('parseRight', 'object must be part of the UI layer');
      return;
    }

    let frameListener = null;
    VarService.resolveVar(userData.right, value => {
      if (frameListener) {
        TimeService.disposeFrameListener(frameListener);
      }

      if (!value) {
        return;
      }

      const percentageOffset = value.substr(-1) === '%';
      const offset = parseFloat(value);

      if (isNaN(offset)) {
        console.info('parseRight', 'NaN value');
        return;
      }

      frameListener = TimeService.registerFrameListener(() => {
        if (!object.visible) {
          return;
        }

        const camera = RenderService.getNativeCamera();
        const position = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraDirection = MathService.getVec3(0.0, 0.0, 0.0);
        object.getWorldPosition(position);
        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);
        const cameraOffset = position.sub(cameraPosition).projectOnVector(cameraDirection).length();
        const screenWidth = get3dScreenWidth(cameraOffset, camera);
        object.position.x = screenWidth / 2.0;

        if (percentageOffset) {
          object.position.x -= offset / 100.0 * screenWidth;
        } else {
          object.position.x -= offset;
        }

        MathService.releaseVec3(position);
        MathService.releaseVec3(cameraPosition);
        MathService.releaseVec3(cameraDirection);
      });
      AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
    });
  }
};

const parseTop = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.top)) {
    if (!UiService.isUiElement(object)) {
      console.info('parseTop', 'object must be part of the UI layer');
      return;
    }

    let frameListener = null;
    VarService.resolveVar(userData.top, value => {
      if (frameListener) {
        TimeService.disposeFrameListener(frameListener);
      }

      if (!value) {
        return;
      }

      const percentageOffset = value.substr(-1) === '%';
      const offset = parseFloat(value);

      if (isNaN(offset)) {
        console.info('parseTop', 'NaN value');
        return;
      }

      frameListener = TimeService.registerFrameListener(() => {
        if (!object.visible) {
          return;
        }

        const camera = RenderService.getNativeCamera();
        const position = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraDirection = MathService.getVec3(0.0, 0.0, 0.0);
        object.getWorldPosition(position);
        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);
        const cameraOffset = position.sub(cameraPosition).projectOnVector(cameraDirection).length();
        const screenHeight = get3dScreenHeight(cameraOffset, camera);
        object.position.y = screenHeight / 2.0;

        if (percentageOffset) {
          object.position.y -= offset / 100.0 * screenHeight;
        } else {
          object.position.y -= offset;
        }

        MathService.releaseVec3(position);
        MathService.releaseVec3(cameraPosition);
        MathService.releaseVec3(cameraDirection);
      });
      AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
    });
  }
};

const parseBottom = object => {
  const {
    userData
  } = object;

  if (isDefined(userData.bottom)) {
    if (!UiService.isUiElement(object)) {
      console.info('parseBottom', 'object must be part of the UI layer');
      return;
    }

    let frameListener = null;
    VarService.resolveVar(userData.bottom, value => {
      if (frameListener) {
        TimeService.disposeFrameListener(frameListener);
      }

      if (!value) {
        return;
      }

      const percentageOffset = value.substr(-1) === '%';
      const offset = parseFloat(value);

      if (isNaN(offset)) {
        console.info('parseBottom', 'NaN value');
        return;
      }

      frameListener = TimeService.registerFrameListener(() => {
        if (!object.visible) {
          return;
        }

        const camera = RenderService.getNativeCamera();
        const position = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0);
        const cameraDirection = MathService.getVec3(0.0, 0.0, 0.0);
        object.getWorldPosition(position);
        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);
        const cameraOffset = position.sub(cameraPosition).projectOnVector(cameraDirection).length();
        const screenHeight = get3dScreenHeight(cameraOffset, camera);
        object.position.y = -screenHeight / 2.0;

        if (percentageOffset) {
          object.position.y += offset / 100.0 * screenHeight;
        } else {
          object.position.y += offset;
        }

        MathService.releaseVec3(position);
        MathService.releaseVec3(cameraPosition);
        MathService.releaseVec3(cameraDirection);
      });
      AssetsService.registerDisposeCallback(object, () => TimeService.disposeFrameListener(frameListener));
    });
  }
};

// NOTE See DOCS.md for userData declarations

class ParserServiceClass {
  parseModel({
    target,
    navpath,
    actions,
    gameObjects,
    onCreate
  }) {
    const garbageCollector = [];
    const children = [];
    const scrollLists = {};
    const gameObjectRefs = {};
    const aiNodes = [];
    const aiSpawns = [];
    const parserPayload = {
      scene: target,
      scrollLists,
      actions: actions || {},
      gameObjects: gameObjects || {},
      gameObjectRefs: gameObjectRefs,
      aiNodes: aiNodes,
      aiSpawns: aiSpawns,
      children: children
    };
    target.traverse(child => {
      if (navpath && child.userData && typeof child.userData.navpath !== 'undefined' && child.userData.navpath !== navpath) {
        garbageCollector.push(child);
        return;
      }

      children.push(child);
    });
    garbageCollector.forEach(child => {
      child.parent.remove(child);
    }); // NOTE Parsers caching and registering scene objects

    children.forEach(child => {
      registerGameObject(child, parserPayload);
      parseCamera(child);
      parseAction(child, parserPayload);
      parseScroll(child, parserPayload);
      parseCacheMaterial(child);
      parseAiNode(child);
      parseAiSpawn(child, parserPayload);
      parseNavmap(child);
      parseSurface(child);
    }); // NOTE Parsers potentially consuming scene objects

    children.forEach(child => {
      parseShader(child);
      parseAnimation(child);
      parseGameObject(child, parserPayload);
      parseLabel(child);
      parseIf(child);
      parseIfNot(child);
      parseMaterial(child);
      parseShading(child);
      parseAlign(child);
      parseLeft(child);
      parseRight(child);
      parseTop(child);
      parseBottom(child);
      parseSlideshow(child);
      parseRotateXYZ(child);
      parseFullscreen(child);
    });
    Object.keys(scrollLists).forEach(key => {
      delete scrollLists[key];
    });

    if (onCreate) {
      onCreate(parserPayload);
    }

    RenderService.getRenderer().compile(RenderService.getScene(), RenderService.getNativeCamera());
  }

}

const ParserService = new ParserServiceClass();

class SceneServiceClass {
  constructor() {
    _defineProperty(this, "gameObjectRefs", {});
  }

  parseScene({
    target,
    navpath,
    actions,
    gameObjects,
    onCreate
  }) {
    ParserService.parseModel({
      target,
      navpath,
      actions,
      gameObjects,
      onCreate: parserPayload => {
        this.gameObjectRefs = parserPayload.gameObjectRefs;
        onCreate(parserPayload);
      }
    });
  }

  setBackground(texture, spherical = true) {
    const scene = RenderService.getScene();

    if (scene.background) {
      AssetsService.disposeAsset(scene.background);
    }

    if (!spherical) {
      scene.background = texture;
    } else {
      const renderer = RenderService.getRenderer();
      const generator = new Three__namespace.PMREMGenerator(renderer);
      const renderTarget = generator.fromEquirectangular(texture);
      const sphericalTexture = renderTarget.texture;
      AssetsService.registerDisposable(sphericalTexture);
      AssetsService.registerDisposable(renderTarget);
      texture.dispose();
      generator.dispose();
      scene.background = sphericalTexture;
    }
  }

  setEnvironment(hdri) {
    const scene = RenderService.getScene();

    if (scene.environment) {
      AssetsService.disposeAsset(scene.environment);
    }

    scene.environment = hdri;
  }

  getEnvironment() {
    const scene = RenderService.getScene();
    return scene.environment;
  }

  disposeAll() {
    const scene = RenderService.getScene();

    if (scene.environment) {
      AssetsService.disposeAsset(scene.environment);
      delete scene.environment;
    }

    if (scene.background) {
      AssetsService.disposeAsset(scene.background);
      scene.background = new Three__namespace.Color(GameInfoService.config.system.sceneBackgroundDefault);
    }

    if (this.gameObjectRefs) {
      Object.keys(this.gameObjectRefs).forEach(key => {
        AssetsService.disposeAsset(this.gameObjectRefs[key]);
        delete this.gameObjectRefs[key];
      });
    }

    this.gameObjectRefs = {};
  }

}
const SceneService = new SceneServiceClass();

class ViewClass {
  onCreate() {}

  onDispose() {}

  dispose() {
    const scene = RenderService.getScene();
    scene.children.forEach(child => {
      AssetsService.registerDisposable(child);
    });
    this.onDispose();
    RenderService.resetPostProcessing();
    AiService.disposeAll();
    PhysicsService.disposeAll();
    CameraService.disposeAll();
    TimeService.disposeAll();
    AnimationService.disposeAll();
    InteractionsService.disposeListeners();
    VarService.disposeListeners();
    SceneService.disposeAll();
    UiService.disposeAll();
    ParticleService.disposeAll();
    AudioService.resetAudio();
    UtilsService.disposeAll();
    AssetsService.disposeAll();
    MathService.handleLeaks();
  }

}

class AiWrapper {
  constructor(target) {
    _defineProperty(this, "target", null);

    _defineProperty(this, "targetNode", null);

    _defineProperty(this, "targetNodeId", 0);

    _defineProperty(this, "tickListener", null);

    _defineProperty(this, "path", []);

    this.target = target;
    AssetsService.registerDisposeCallback(this.target, () => this.dispose());
  }

  registerBehaviour(callback) {
    this.tickListener = callback;
  }

  getAiBehaviour() {
    if (this.tickListener) {
      if (DummyDebug.get(DebugFlags.DEBUG_AI_TARGETS)) {
        if (this.target && this.targetNode) {
          const scene = RenderService.getScene();
          const target = MathService.getVec3(0.0, 0.0, 0.0, 'ai-1');
          const node = MathService.getVec3(0.0, 0.0, 0.0, 'ai-2');
          this.target.getWorldPosition(target);
          this.targetNode.getWorldPosition(node);
          node.sub(target);
          createArrowHelper(scene, `aiWrapper-getAiBehaviour-${this.target.uuid}`, node, target);
          MathService.releaseVec3(target);
          MathService.releaseVec3(node);
        }
      }

      return this.tickListener();
    }
  }

  hasTargetNode() {
    if (this.targetNode) {
      return true;
    } else {
      if (this.path && this.path.length) {
        this.targetNode = this.path.shift();
        return true;
      }

      return false;
    }
  }

  getTargetNode() {
    return this.targetNode;
  }

  setTargetNode(node) {
    if (node) {
      this.targetNode = node;
      this.targetNodeId = node.userData.aiNode;
    } else {
      this.targetNode = null;
      this.targetNodeId = 0;
    }
  }

  getDistanceToTargetNode() {
    if (!this.targetNode) {
      return 0.0;
    }

    const position = MathService.getVec3(0.0, 0.0, 0.0, 'ai-3');
    const node = MathService.getVec3(0.0, 0.0, 0.0, 'ai-4');
    this.target.getWorldPosition(position);
    this.targetNode.getWorldPosition(node);
    const distance = position.sub(node).length();
    MathService.releaseVec3(position);
    MathService.releaseVec3(node);
    return distance;
  }

  getGroundAngleToTargetNode() {
    if (!this.target || !this.targetNode) {
      return 0.0;
    }

    const origin = MathService.getVec3(0.0, 0.0, 0.0, 'ai-5');
    const position = MathService.getVec3(0.0, 0.0, 0.0, 'ai-6');
    this.target.getWorldPosition(origin);
    this.targetNode.getWorldPosition(position);
    position.y = 0;
    origin.y = 0;
    position.sub(origin);
    this.target.getWorldDirection(origin);
    origin.y = 0;
    const angle = position.normalize().angleTo(origin);
    MathService.releaseVec3(origin);
    MathService.releaseVec3(position);
    return angle;
  }

  findPathToTargetNode() {
    if (!this.target || !this.targetNode) {
      console.info('AiWrapper', 'getPathToTargetNode', 'missing target node');
      return [];
    }

    if (!PhysicsService.pathfinderZoneId) {
      console.info('AiWrapper', 'getPathToTargetNode', 'pathfinder not enabled or navmesh missing');
      return [];
    }

    const targetPosition = MathService.getVec3();
    this.target.getWorldPosition(targetPosition);
    const groupId = PhysicsService.pathfinder.getGroup(PhysicsService.pathfinderZoneId, targetPosition);
    const targetNodePosition = MathService.getVec3();
    this.targetNode.getWorldPosition(targetNodePosition);
    this.path = [];
    (PhysicsService.pathfinder.findPath(targetPosition, targetNodePosition, PhysicsService.pathfinderZoneId, groupId) || []).forEach(position => {
      const mock = UtilsService.getEmpty();
      mock.position.copy(position);
      this.path.push(mock);
    });
    this.path.push(this.targetNode);
    this.targetNode = this.path.shift();
    MathService.releaseVec3(targetPosition);
    return this.path;
  }

  getPathLength() {
    return (this.path || []).length;
  }

  dispose() {
    if (this.targetNode) {
      AssetsService.registerDisposable(this.targetNode);
      delete this.targetNode;
    }

    if (this.tickListener) {
      delete this.tickListener;
    }

    if (this.target) {
      delete this.target;
    }

    if (this.path) {
      this.path = [];
    }
  }

}

class AnimationWrapper {
  constructor(target) {
    _defineProperty(this, "target", null);

    _defineProperty(this, "mixer", null);

    _defineProperty(this, "mixerActions", {});

    _defineProperty(this, "mixerClips", []);

    this.target = target;
    this.parseAnimations();
    AssetsService.registerDisposeCallback(this.target, () => this.dispose());
  }

  parseAnimations() {
    const {
      userData
    } = this.target;

    if (!userData.skinnedAnimations) {
      console.warn('SkinnedGameObject', 'onLoaded', 'model does not have animations');
      return;
    }

    if (DummyDebug.get(DebugFlags.DEBUG_SKINNING_SKELETONS)) {
      const scene = RenderService.getScene();
      const skeletorHelper = new Three__namespace.SkeletonHelper(this.target);
      scene.add(skeletorHelper);
      AssetsService.registerDisposable(skeletorHelper);
    }

    this.mixer = new Three__namespace.AnimationMixer(this.target);
    userData.skinnedAnimations.forEach(clip => {
      const action = this.mixer.clipAction(clip);
      action.reset();
      action.play(); // NOTE Internal only

      this.mixerActions[clip.name] = action;
      this.mixerClips.push(clip);
    });
    this.stopAllAnimations();
    TimeService.registerFrameListener(({
      dt
    }) => {
      if (!this.mixer) {
        return;
      }

      this.mixer.update(dt);
    });
  }

  playAnimation(name, tweenDuration = 1000, reset = false, onFinish) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'playAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];

    if (action.isRunning()) {
      return;
    }

    if (reset) {
      action.reset();
    }

    if (typeof onFinish === 'function') {
      const listener = event => {
        if (event.action !== action) {
          return;
        }

        onFinish();
        this.mixer.removeEventListener('finished', listener);
      };

      this.mixer.addEventListener('finished', listener);
      action.loop = Three__namespace.LoopOnce;
    } else {
      action.loop = Three__namespace.LoopRepeat;
    }

    action.enabled = true;
    action.setEffectiveTimeScale(1.0);
    action.fadeIn(tweenDuration / 1000.0);
  }

  stopAnimation(name, tweenDuration = 1000) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'stopAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];

    if (!action.isRunning()) {
      return;
    }

    action.enabled = true;
    action.setEffectiveTimeScale(1.0);
    action.fadeOut(tweenDuration / 1000.0);
  }

  blendInAnimation(name, blendWeight = 0.0) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'blendInAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];
    action.enabled = true;
    action.setEffectiveWeight(blendWeight);
  }

  playAllAnimations(tweenDuration = 0) {
    Object.keys(this.mixerActions).forEach(name => {
      this.playAnimation(name, tweenDuration);
    });
  }

  stopAllAnimations(tweenDuration = 0) {
    Object.keys(this.mixerActions).forEach(name => {
      this.stopAnimation(name, tweenDuration);
    });
  }

  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();
      Object.keys(this.mixerActions).forEach(name => this.mixer.uncacheAction(this.mixerActions[name]));
      this.mixerClips.forEach(clip => this.mixer.uncacheClip(clip));
      this.mixer.uncacheRoot(this.mixer.getRoot());
      delete this.mixerActions;
      delete this.mixerClips;
      delete this.mixer;
    }

    if (this.target) {
      delete this.target;
    }
  }

}

class PhysicsWrapper {
  constructor(target) {
    _defineProperty(this, "target", null);

    _defineProperty(this, "simpleVelocity", null);

    _defineProperty(this, "simpleGravity", null);

    _defineProperty(this, "grounded", true);

    _defineProperty(this, "collisionListener", null);

    _defineProperty(this, "dynamicCollisions", false);

    _defineProperty(this, "boundingBox", null);

    _defineProperty(this, "noClip", false);

    _defineProperty(this, "surfaceCollisions", {});

    this.target = target;
    PhysicsService.registerBody(this);
    AssetsService.registerDisposeCallback(this.target, () => {
      PhysicsService.disposeBody(this);
      this.dispose();
    });
  }

  enableNavmaps() {
    this.simpleVelocity = MathService.getVec3(0.0, 0.0, 0.0, 'physics-wrapper-2');
    this.simpleGravity = MathService.getVec3(0.0, 0.0, 0.0, 'physics-wrapper-3');
  }

  enableNoClip() {
    this.noClip = true;
  }

  disableNoClip() {
    this.noClip = false;
  }

  enablePhysics() {// FIXME Implement CannonES instead: https://pmndrs.github.io/cannon-es/
  }

  enableDynamicCollisions(callback) {
    this.dynamicCollisions = true;
    this.boundingBox = UtilsService.getBox3();
    PhysicsService.registerDynamicCollisionBody(this, callback);
  }

  disableDynamicCollisions() {
    this.dynamicCollisions = false;

    if (this.boundingBox) {
      UtilsService.releaseBox3(this.boundingBox);
    }
  }

  disablePhysics() {
    if (this.simpleVelocity) {
      MathService.releaseVec3(this.simpleVelocity);
      delete this.simpleVelocity;
    }

    if (this.simpleGravity) {
      MathService.releaseVec3(this.simpleGravity);
      delete this.simpleGravity;
    }
  }

  getSimpleVelocity() {
    return this.simpleVelocity;
  }

  setSimpleVelocity(value) {
    this.simpleVelocity.copy(value);
  }

  onCollision(listener) {
    this.collisionListener = listener;
  }

  dispose() {
    delete this.collisionListener;
    this.disablePhysics();
    this.disableDynamicCollisions();

    if (this.target) {
      delete this.target;
    }

    delete this.surfaceCollisions;
  }

}

class Preloader extends GameObjectClass {
  constructor({
    requireAssets,
    onComplete,
    spinnerTexture
  } = {}) {
    super();

    _defineProperty(this, "spinnerTexture", null);

    this.spinnerTexture = spinnerTexture || GameInfoService.config.textures.spinner || null;
    Promise.all([...(requireAssets || []), TimeService.createTimeoutPromise(3000)]).then(assets => {
      const complete = onComplete(assets);

      if (complete && complete.then) {
        complete.then(() => this.onLoaded());
      } else {
        this.onLoaded();
      }
    }).catch(error => {
      console.info('Preloader', 'error', {
        error
      });
    });
    this.onCreate();
  }

  async onCreate() {
    GameObjectClass.prototype.onCreate.call(this);
    const camera = RenderService.getNativeCamera();
    const background = new Three__namespace.Mesh(new Three__namespace.PlaneBufferGeometry(1.0, 1.0), new Three__namespace.MeshBasicMaterial({
      color: 0x000000,
      transparent: true
    }));
    background.name = 'background';
    const spinner = new Three__namespace.Mesh(new Three__namespace.PlaneBufferGeometry(1.0, 1.0), new Three__namespace.MeshBasicMaterial({
      map: await AssetsService.getTexture(this.spinnerTexture),
      transparent: true
    }));
    spinner.name = 'spinner';
    this.add(spinner);
    this.add(background);
    this.position.z -= 5.0;
    this.lookAt(new Three__namespace.Vector3(0, 0, 0));
    TimeService.registerFrameListener(() => {
      const spinner = this.getObjectByName('spinner');
      const background = this.getObjectByName('background');

      if (!background || !spinner || !camera) {
        return false;
      }

      fitToCamera(background, camera);
      spinner.rotation.z -= 0.1;
    });
    camera.add(this);
  }

  onLoaded() {
    const camera = RenderService.getNativeCamera();
    const spinner = this.getObjectByName('spinner');

    if (spinner) {
      this.remove(spinner);
      AssetsService.disposeAsset(spinner);
    }

    AnimationService.registerAnimation({
      target: this,
      onStep: ({
        target
      }) => {
        const background = target.getObjectByName('background');

        if (!background) {
          return;
        }

        if (background.material.opacity <= 0.0) {
          AssetsService.disposeAsset(target);
          return false;
        }

        fitToCamera(background, camera);
        background.material.opacity -= 0.05;
      }
    });
  }

  dispose() {
    GameObjectClass.prototype.dispose.call(this);

    if (this.spinnerTexture) {
      AssetsService.disposeAsset(this.spinnerTexture);
      this.spinnerTexture = null;
    }
  }

}

class SkinnedGameObject extends GameObjectClass {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "mixer", null);

    _defineProperty(this, "mixerActions", {});

    _defineProperty(this, "mixerClips", []);
  }

  onCreate(model) {
    GameObjectClass.prototype.onCreate.call(this);
    const {
      userData
    } = model;

    if (!userData.skinnedAnimations) {
      console.warn('SkinnedGameObject', 'onLoaded', 'model does not have animations');
      return;
    }

    if (DummyDebug.get(DebugFlags.DEBUG_SKINNING_SKELETONS)) {
      const scene = RenderService.getScene();
      const skeletorHelper = new Three__namespace.SkeletonHelper(model);
      scene.add(skeletorHelper);
      AssetsService.registerDisposable(skeletorHelper);
    }

    this.mixer = new Three__namespace.AnimationMixer(model);
    userData.skinnedAnimations.forEach(clip => {
      const action = this.mixer.clipAction(clip);
      action.reset();
      action.play(); // NOTE Internal only

      this.mixerActions[clip.name] = action;
      this.mixerClips.push(clip);
    });
    this.stopAllAnimations();
    TimeService.registerFrameListener(({
      dt
    }) => {
      if (!this.mixer) {
        return;
      }

      this.mixer.update(dt);
    });
  }

  playAnimation(name, tweenDuration = 1000) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'playAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];
    action.enabled = true;
    action.setEffectiveTimeScale(1.0);
    action.fadeIn(tweenDuration / 1000.0);
  }

  stopAnimation(name, tweenDuration = 1000) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'stopAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];
    action.enabled = true;
    action.setEffectiveTimeScale(1.0);
    action.fadeOut(tweenDuration / 1000.0);
  }

  blendInAnimation(name, blendWeight = 0.0) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'blendInAnimation', `animation "${name}" does not exist`);
      return;
    }

    const action = this.mixerActions[name];
    action.enabled = true;
    action.setEffectiveWeight(blendWeight);
  }

  playAllAnimations(tweenDuration = 0) {
    Object.keys(this.mixerActions).forEach(name => {
      this.playAnimation(name, tweenDuration);
    });
  }

  stopAllAnimations(tweenDuration = 0) {
    Object.keys(this.mixerActions).forEach(name => {
      this.stopAnimation(name, tweenDuration);
    });
  }

  dispose() {
    GameObjectClass.prototype.dispose.call(this);

    if (this.mixer) {
      this.mixer.stopAllAction();
      Object.keys(this.mixerActions).forEach(name => this.mixer.uncacheAction(this.mixerActions[name]));
      this.mixerClips.forEach(clip => this.mixer.uncacheClip(clip));
      this.mixer.uncacheRoot(this.mixer.getRoot());
      delete this.mixerActions;
      delete this.mixerClips;
      delete this.mixer;
    }
  }

}

const IntroFadeShader = ({
  target
}) => {
  const shader = {
    uniforms: {
      tMap: {
        value: AssetsService.getMaterial('shader-map').map
      },
      tDiffuse: {
        value: target.material.map.clone()
      },
      fTime: {
        value: 0.0
      }
    },
    vertexShader: `
      varying vec2 vUV;

      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        vUV = uv;
      }
    `,
    fragmentShader: `
      varying vec2 vUV;

      uniform sampler2D tMap;
      uniform sampler2D tDiffuse;
      uniform float fTime;

      void main() {
        vec4 tFadeInMap = texture2D(tMap, vUV);
        vec4 tDiffuseMap = texture2D(tDiffuse, vUV);

        float avgFade = (tFadeInMap.x + tFadeInMap.y + tFadeInMap.z) / 3.0;
        float avgDiff = fTime - avgFade;
        
        if (avgDiff > 0.12) {
          gl_FragColor = tDiffuseMap;
        } else if (avgDiff > 0.08) {
          gl_FragColor = vec4(0.0, tDiffuseMap.g * 0.6, 0.0, 1.0);
        } else if (avgDiff > 0.04) {
          gl_FragColor = vec4(0.0, 0.0, tDiffuseMap.b * 0.4, 1.0);
        } else if (avgDiff > 0.0) {
          gl_FragColor = vec4(tDiffuseMap.r * 0.2, 0.0, 0.0, 1.0);
        } else {
          discard;
        }
      }
    `,
    transparent: true
  };
  return shader;
};

GameInfoService.shader('introFade', IntroFadeShader);
class IntroView extends ViewClass {
  constructor(nextView) {
    super();

    _defineProperty(this, "nextView", null);

    this.nextView = nextView;
  }

  onCreate() {
    const scene = RenderService.getScene();
    const {
      camera
    } = CameraService;
    const cameraTarget = MathService.getVec3(0, 0, 0);
    camera.lookAt(cameraTarget);
    MathService.releaseVec3(cameraTarget);
    const ambientLight = AssetsService.getAmbientLight();
    scene.add(ambientLight);
    AssetsService.getModel(GameInfoService.config.models.intro).then(introModel => {
      SceneService.parseScene({
        target: introModel,
        actions: {
          'skip': () => {
            this.onPlaquesShown();
          }
        },
        onCreate: ({
          gameObjectRefs
        }) => {
          CameraService.useCamera(CameraService.getCamera('intro'), true);
          scene.add(introModel);
          Promise.all([VarService.registerPersistentVar('playerBike', 'fusion'), VarService.registerPersistentVar('playerOutfit', 'safety'), VarService.registerPersistentVar('playerPoints', 0), VarService.registerPersistentVar('playerSunracePoints', 0), VarService.registerPersistentVar('playerTierUnlocks', [3, 0, 0, 0]), VarService.registerPersistentVar('playerMapRecords', []), VarService.registerPersistentVar('optionsShowDriver', true), VarService.registerPersistentVar('optionsAudioVolume', 0.2), VarService.registerPersistentVar('optionsAdsEnabled', true), VarService.registerPersistentVar('optionsPerformanceMode', false), VarService.registerPersistentVar('statsTotalPlaytime', 0), VarService.registerPersistentVar('statsMapPlays', [])]).then(() => {
            this.showPlaques(['plaque-1', 'plaque-2'], gameObjectRefs);
          });
        }
      });
    });
  }

  showPlaques(queue, gameObjectRefs) {
    const plaque = gameObjectRefs[queue.shift()];

    if (!plaque) {
      this.onPlaquesShown();
      return;
    }

    AnimationService.registerAnimation({
      target: plaque,
      override: AnimationOverrideType.overrideIfExists,
      onStep: ({
        target,
        animationTime
      }) => {
        if (animationTime > 1 && target.material.uniforms.fTime.value >= 2.0) {
          setTimeout(() => {
            this.hidePlaques(target, queue, gameObjectRefs);
          }, 0);
          return false;
        }

        target.material.uniforms.fTime.value += Math.sin(target.material.uniforms.fTime.value / 60 + 0.01);

        if (target.material.uniforms.fTime.value > 3.0) {
          target.material.uniforms.fTime.value = 3.0;
        }
      }
    });
  }

  hidePlaques(plaque, queue, gameObjectRefs) {
    AnimationService.registerAnimation({
      target: plaque,
      override: AnimationOverrideType.overrideIfExists,
      onStep: ({
        target,
        animationTime
      }) => {
        if (animationTime > 1 && target.material.uniforms.fTime.value <= 0) {
          setTimeout(() => {
            this.showPlaques(queue, gameObjectRefs);
          }, 0);
          return false;
        }

        target.material.uniforms.fTime.value -= 0.01;
      }
    });
  }

  onPlaquesShown() {
    if (this.nextView) {
      RenderService.renderView(this.nextView);
    }
  }

}

// NOTE Template only
const parse = (object, payload) => {
  const {
    userData
  } = object;

  if (threeDefaultCube.isDefined(userData.key)) {
    threeDefaultCube.AssetsService.registerDisposeCallback(object, () => {});
  }
};

const {
  App,
  StatusBar
} = core.Plugins;

class SystemServiceClass {
  constructor() {
    _defineProperty(this, "isCordova", false);

    _defineProperty(this, "appStateListeners", []);

    _defineProperty(this, "promised", []);

    this.isCordova = typeof cordova !== 'undefined';
  }

  init({
    statusBar
  } = {}) {
    StorageService.init();
    App.addListener('appStateChange', state => {
      this.appStateListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(state);
        }
      });
    });

    if (statusBar !== true) {
      SystemService.hideStatusBar();
    }

    if (DummyDebug.get(DebugFlags.DEBUG_ENABLE)) {
      DummyDebug.showStats();
    }

    if (DummyDebug.get(DebugFlags.DEBUG_LIVE)) {
      DummyDebug.showLogs();
    }

    this.promised.push(VarService.retrievePersistentVars());

    if (this.isCordova) {
      this.promised.push(new Promise(resolve => {
        document.addEventListener('deviceready', () => resolve(), false);
      }));
    }
  }

  hideStatusBar() {
    try {
      navigationBar.NavigationBar.setUp(true);
      setTimeout(() => {
        StatusBar.hide();
        StatusBar.setOverlaysWebView(false);
      }, 500);
      this.appStateListeners.push(({
        isActive
      }) => {
        if (isActive) {
          StatusBar.hide();
        }
      });
    } catch {}
  }

  lockOrientation(orientation = screenOrientation.ScreenOrientation.ORIENTATIONS.LANDSCAPE) {
    if (this.isCordova) {
      screenOrientation.ScreenOrientation.lock(orientation);
    }
  }

  onReady(then) {
    if (!then) {
      return;
    }

    Promise.all(this.promised).then(() => {
      then();
    });
  }

  disposeAll() {
    this.appStateListeners = [];
  }

}

const SystemService = new SystemServiceClass();

exports.AiService = AiService;
exports.AiWrapper = AiWrapper;
exports.AnimationOverrideType = AnimationOverrideType;
exports.AnimationService = AnimationService;
exports.AnimationWrapper = AnimationWrapper;
exports.AssetsService = AssetsService;
exports.AudioChannelEnums = AudioChannelEnums;
exports.AudioService = AudioService;
exports.CameraService = CameraService;
exports.DebugFlags = DebugFlags;
exports.DummyDebug = DummyDebug;
exports.GameInfoService = GameInfoService;
exports.GameObjectClass = GameObjectClass;
exports.InputService = InputService;
exports.InteractionEnums = InteractionEnums;
exports.InteractionsService = InteractionsService;
exports.IntroFadeShader = IntroFadeShader;
exports.IntroView = IntroView;
exports.MathService = MathService;
exports.MathUtils = MathUtils;
exports.MoneyService = MoneyService;
exports.OcclusionStepEnum = OcclusionStepEnum;
exports.ParserService = ParserService;
exports.ParticleService = ParticleService;
exports.PhysicsService = PhysicsService;
exports.PhysicsWrapper = PhysicsWrapper;
exports.Preloader = Preloader;
exports.RenderService = RenderService;
exports.SceneService = SceneService;
exports.SceneServiceClass = SceneServiceClass;
exports.ScrollList = ScrollList;
exports.SkinnedGameObject = SkinnedGameObject;
exports.StorageService = StorageService;
exports.SystemService = SystemService;
exports.Text = Text;
exports.TimeService = TimeService;
exports.UiService = UiService;
exports.UtilsService = UtilsService;
exports.VarService = VarService;
exports.ViewClass = ViewClass;
exports.animateDelay = animateDelay;
exports.animateLinear = animateLinear;
exports.animateLinearInverse = animateLinearInverse;
exports.cloneValue = cloneValue;
exports.convertMaterialType = convertMaterialType;
exports.createArrowHelper = createArrowHelper;
exports.createBoxHelper = createBoxHelper;
exports.createDefaultCube = createDefaultCube;
exports.defaultTo = defaultTo;
exports.fitToCamera = fitToCamera;
exports.fitToScreen = fitToScreen;
exports.forAllMaterialTextures = forAllMaterialTextures;
exports.get3dScreenHeight = get3dScreenHeight;
exports.get3dScreenWidth = get3dScreenWidth;
exports.getRandomColor = getRandomColor;
exports.getRandomElement = getRandomElement;
exports.isDefined = isDefined;
exports.math2Pi = math2Pi;
exports.mathPi2 = mathPi2;
exports.mathPi4 = mathPi4;
exports.mathPi8 = mathPi8;
exports.moduloAngle = moduloAngle;
exports.parse = parse;
exports.parseIf = parseIf;
exports.parseIfNot = parseIfNot;
exports.parseLabel = parseLabel;
exports.parseMaterial = parseMaterial;
exports.parseNavmap = parseNavmap;
exports.parseRotateXYZ = parseRotateXYZ;
exports.parseScroll = parseScroll;
exports.parseShader = parseShader;
exports.parseShading = parseShading;
exports.parseSlideshow = parseSlideshow;
exports.parseSurface = parseSurface;
exports.removePlaceholder = removePlaceholder;
exports.replacePlaceholder = replacePlaceholder;
exports.spliceRandomElement = spliceRandomElement;
exports.swapVectors = swapVectors;
