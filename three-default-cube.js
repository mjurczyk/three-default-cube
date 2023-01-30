'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Three$1 = require('three');
var Cannon$1 = require('cannon-es');
var uuid = require('uuid');
var GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader');
var FBXLoader = require('three/examples/jsm/loaders/FBXLoader');
var RGBELoader = require('three/examples/jsm/loaders/RGBELoader');
var postprocessing = require('postprocessing');
var Stats = require('three/examples/jsm/libs/stats.module');
var core = require('@capacitor/core');
var nativeStorage = require('@ionic-native/native-storage');
var navigationBar = require('@ionic-native/navigation-bar');
var screenOrientation = require('@ionic-native/screen-orientation');
var PointerLockControls = require('three/examples/jsm/controls/PointerLockControls');
var CameraControls = require('camera-controls');
var BufferGeometryScope = require('three/examples/jsm/utils/BufferGeometryUtils');
var threePathfinding = require('three-pathfinding');
var howler = require('howler');
var troikaThreeText = require('troika-three-text');
var threeDefaultCube = require('three-default-cube');

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

var Three__namespace = /*#__PURE__*/_interopNamespace(Three$1);
var Cannon__namespace = /*#__PURE__*/_interopNamespace(Cannon$1);
var uuid__namespace = /*#__PURE__*/_interopNamespace(uuid);
var Stats__default = /*#__PURE__*/_interopDefaultLegacy(Stats);
var CameraControls__default = /*#__PURE__*/_interopDefaultLegacy(CameraControls);
var BufferGeometryScope__namespace = /*#__PURE__*/_interopNamespace(BufferGeometryScope);

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
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
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

const {
  App,
  StatusBar
} = core.Plugins;
const MobileAdapterConstants = {
  screenOrientation: {
    landscape: screenOrientation.ScreenOrientation.ORIENTATIONS.LANDSCAPE,
    portrait: screenOrientation.ScreenOrientation.ORIENTATIONS.PORTRAIT
  }
};
class MobileAdapterClass {
  constructor() {
    _defineProperty(this, "appStateListeners", []);
    App.addListener('appStateChange', state => {
      this.appStateListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(state);
        }
      });
    });
  }
  isMobile() {
    return typeof cordova !== 'undefined';
  }
  getNativeStorage() {
    return {
      keys: nativeStorage.NativeStorage.keys,
      getItem: nativeStorage.NativeStorage.getItem,
      setItem: nativeStorage.NativeStorage.setItem
    };
  }
  getNavigationBar() {
    return {
      hide: () => {
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
    };
  }
  getScreenOrientation() {
    return {
      lock: orientation => screenOrientation.ScreenOrientation.lock(orientation)
    };
  }
  disposeAll() {
    this.appStateListeners = [];
  }
}
const MobileAdapter = new MobileAdapterClass();

class StorageServiceClass {
  constructor() {
    _defineProperty(this, "reads", 0);
    _defineProperty(this, "writes", 0);
    _defineProperty(this, "useNative", true);
    this.useNative = MobileAdapter.isMobile();
  }
  init() {
    this.set('system.control', Date.now());
  }
  getAllKeys() {
    return new Promise(resolve => {
      if (!this.useNative) {
        return resolve(Object.keys(localStorage));
      }
      return MobileAdapter.getNativeStorage().keys(keys => resolve(keys), error => {
        if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
          console.info('StorageServiceClass', 'getAllKeys', 'error', {
            error
          });
        }
        return resolve([]);
      });
    });
  }
  set(key, value) {
    if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'set', {
        key,
        value
      });
    }
    this.writes++;
    if (!this.useNative) {
      return Promise.resolve(localStorage.setItem(key, JSON.stringify(value)));
    }
    return MobileAdapter.getNativeStorage().setItem(key, value).catch(error => {
      if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
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
    if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'get', {
        key
      });
    }
    this.reads++;
    if (!this.useNative) {
      return Promise.resolve(JSON.parse(localStorage.getItem(key) || 'null'));
    }
    return MobileAdapter.getNativeStorage().getItem(key).catch(error => {
      if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
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
    this.config = {
      ...this.config,
      ...config
    };
    return this;
  }
  system(fps = 0, pixelRatio, antialiasing = true, postprocessing = true, sceneBackgroundDefault = 0x000000, correctBlenderLights = true, shadows = true) {
    return this.addConfig({
      system: {
        ...(this.config.system || {}),
        fps,
        pixelRatio: typeof pixelRatio !== 'undefined' ? pixelRatio : window.devicePixelRatio,
        antialiasing,
        postprocessing,
        sceneBackgroundDefault,
        correctBlenderLights,
        shadows
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
  camera(fov = 50, near = 0.1, far = 2000.0) {
    return this.addConfig({
      system: {
        ...(this.config.system || {}),
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
      vars: {
        ...(this.config.vars || {}),
        ...vars
      }
    });
  }
  vars(vars = {}) {
    return this.initialVars(vars);
  }
  labels(language = 'en', vars = {}) {
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

var version = "0.3.0";
var dependencies = {
	"@babel/core": "7.14.6",
	"@babel/plugin-proposal-class-properties": "7.14.5",
	"@ionic-native/native-storage": "5.33.1",
	"@ionic-native/navigation-bar": "5.33.1",
	"@ionic-native/screen-orientation": "5.30.0",
	"@rollup/plugin-babel": "5.3.0",
	"@rollup/plugin-json": "6.0.0",
	"camera-controls": "1.37.4",
	howler: "2.2.3",
	postprocessing: "6.29.2",
	rollup: "2.52.3",
	three: "0.148.0",
	"three-pathfinding": "1.1.0",
	"troika-three-text": "0.47.1",
	"cannon-es": "0.20.0"
};

const LogsNaturalColor = '#ffffff';
const LogsHighlightColor = '#ffff33';
const DebugFlags = {
  DEBUG_ENABLE: 'DEBUG_ENABLE',
  DEBUG_LIVE: 'DEBUG_LIVE',
  DEBUG_LOG_MEMORY: 'DEBUG_LOG_MEMORY',
  DEBUG_LOG_POOLS: 'DEBUG_LOG_POOLS',
  DEBUG_LOG_ASSETS: 'DEBUG_LOG_ASSETS',
  DEBUG_SCROLL_VISIBLE: 'DEBUG_SCROLL_VISIBLE',
  DEBUG_TIME_LISTENERS: 'DEBUG_TIME_LISTENERS',
  DEBUG_SKINNING_SKELETONS: 'DEBUG_SKINNING_SKELETONS',
  DEBUG_STORAGE: 'DEBUG_STORAGE',
  DEBUG_AI_NODES: 'DEBUG_AI_NODES',
  DEBUG_AI_TARGETS: 'DEBUG_AI_TARGETS',
  DEBUG_PHYSICS: 'DEBUG_PHYSICS'
};
class DebugServiceClass {
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
      outputElement.appendChild(this.createLogLine({
        text: 'DQ Ver:'
      }, {
        text: version,
        color: LogsHighlightColor
      }, {
        text: '(dev)',
        color: LogsHighlightColor
      }, {
        text: 'Three.js Ver:'
      }, {
        text: dependencies.three,
        color: LogsHighlightColor
      }));
      if (this.get(DebugFlags.DEBUG_PHYSICS)) {
        outputElement.appendChild(this.createLogLine({
          text: 'CannonES Ver:'
        }, {
          text: dependencies['cannon-es'],
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
const DebugService = new DebugServiceClass();

class MathServiceClass {
  constructor() {
    _defineProperty(this, "poolVec2", []);
    _defineProperty(this, "poolVec3", []);
    _defineProperty(this, "poolQuaternions", []);
    _defineProperty(this, "poolMatrix4", []);
    _defineProperty(this, "poolVec2Total", 0);
    _defineProperty(this, "poolVec3Total", 0);
    _defineProperty(this, "poolQuaternionsTotal", 0);
    _defineProperty(this, "poolMatrix4Total", 0);
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
  getMatrix4(id) {
    const pooled = this.poolMatrix4.pop();
    if (pooled) {
      return pooled.identity();
    }
    this.poolMatrix4Total++;
    const matrix = new Three__namespace.Matrix4();
    this.registerId(matrix, id);
    return matrix;
  }
  releaseMatrix4(matrix) {
    matrix.identity();
    this.unregisterId(matrix);
    this.poolMatrix4.push(matrix);
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
    if (!DebugService.get(DebugFlags.DEBUG_LOG_POOLS) || !id) {
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
    if (!DebugService.get(DebugFlags.DEBUG_LOG_POOLS) || !object.userData || !object.userData.id) {
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
    if (!DebugService.get(DebugFlags.DEBUG_LOG_POOLS)) {
      return;
    }
    const leaks = Object.keys(this.leakRegistry);
    if (leaks.length > 0) {
      console.info('MathService', 'handleLeaks', 'leakedPools', {
        leaks: this.leakRegistry
      });
    }
  }
  disposeAll() {
    this.poolVec2 = [];
    this.poolVec3 = [];
    this.poolQuaternions = [];
    this.poolMatrix4 = [];
    this.poolVec2Total = 0;
    this.poolVec3Total = 0;
    this.poolQuaternionsTotal = 0;
    this.poolMatrix4Total = 0;
  }
}
const MathService = new MathServiceClass();

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
const textureFields = [
// NOTE Excluding lightMap and envMap
'alphaMap', 'aoMap', 'bumpMap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap', 'emissiveMap', 'gradientMap', 'displacementMap', 'map', 'metalnessMap', 'matcap', 'normalMap', 'transmissionMap', 'roughnessMap', 'specularMap'];
const forAllMaterialTextures = (material, callback) => {
  textureFields.forEach(key => {
    if (material[key] && material[key].isTexture) {
      callback(material[key], key);
    }
  });
};

class TimeServiceClass {
  constructor() {
    _defineProperty(this, "frameListeners", []);
    _defineProperty(this, "intervals", {});
    _defineProperty(this, "persistentFrameListeners", {});
    _defineProperty(this, "lastDt", 0.0);
    _defineProperty(this, "lastInverseDt", 0.0);
    _defineProperty(this, "totalElapsedTime", 0.0);
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
    const inverseDt = dt / (1 / defaultTo(GameInfoService.config.system.camera.fov, 60.0));
    this.lastDt = dt;
    this.lastInverseDt = inverseDt;
    this.totalElapsedTime = elapsedTime;
    this.frameListeners = this.frameListeners.filter(listener => {
      return listener({
        dt,
        elapsedTime,
        inverseDt
      }) !== false;
    });
    Object.keys(this.persistentFrameListeners).forEach(uid => {
      const listener = this.persistentFrameListeners[uid];
      if (listener({
        dt,
        elapsedTime,
        inverseDt
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
            elapsedTime,
            inverseDt
          }) !== false;
        });
        if (intervals.listeners.length === 0) {
          delete this.intervals[key];
        }
        intervals.time = key;
      }
    });
  }
  getLastDt() {
    return this.lastDt;
  }
  getLastInverseDt() {
    return this.lastInverseDt;
  }
  getTotalElapsedTime() {
    return this.totalElapsedTime;
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

CameraControls__default['default'].install({
  THREE: Three__namespace
});
const CameraMovementTypeEnums = {
  rotateOnButtonDown: 'rotateOnButtonDown',
  rotateOnPointerMove: 'rotateOnPointerMove'
};
class CameraServiceClass {
  constructor() {
    _defineProperty(this, "cameras", {});
    _defineProperty(this, "renderTargets", {});
    _defineProperty(this, "autoUpdateRenderTargets", false);
    _defineProperty(this, "cameraPosition", MathService.getVec3(0.0, 1.0, 1.0, 'camera-1'));
    _defineProperty(this, "cameraQuaternion", MathService.getQuaternion());
    _defineProperty(this, "defaultTween", 0.2);
    _defineProperty(this, "tween", 0.2);
    _defineProperty(this, "camera", null);
    _defineProperty(this, "followedObject", null);
    _defineProperty(this, "followListener", null);
    _defineProperty(this, "followListenerThreshold", 0.001);
    _defineProperty(this, "followOffset", new Three__namespace.Vector3(0.0, 0.0, 0.0));
    _defineProperty(this, "rotationLocked", false);
    _defineProperty(this, "cameraControls", null);
    _defineProperty(this, "pointerLockControls", null);
    _defineProperty(this, "cameraMovementType", CameraMovementTypeEnums.rotateOnButtonDown);
  }
  init({
    camera,
    renderer
  } = {}) {
    this.camera = camera;
    this.camera.position.copy(this.cameraPosition);
    this.camera.quaternion.copy(this.cameraQuaternion);
    if (!this.cameraControls) {
      this.cameraControls = new CameraControls__default['default'](RenderService.getNativeCamera(), renderer.domElement);
      this.cameraControls.enabled = false;
    }
    if (!this.pointerLockControls) {
      this.pointerLockControls = new PointerLockControls.PointerLockControls(RenderService.getNativeCamera(), renderer.domElement);
      this.pointerLockControls.unlock();
    }
  }
  onFrame(dt) {
    this.updateCamera(dt);
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
    this.cameraControls.enabled = false;
    this.pointerLockControls.unlock();
  }
  updateCamera(dt = 0.0) {
    if (this.pointerLockControls.isLocked) {
      if (this.followedObject) {
        this.followedObject.getWorldPosition(this.cameraPosition);
        this.camera.position.lerp(this.cameraPosition, this.tween);
      }
      return;
    }
    if (this.followedObject) {
      this.followedObject.getWorldPosition(this.cameraPosition);
      this.followedObject.getWorldQuaternion(this.cameraQuaternion);
      const worldAlignedOffset = MathService.getVec3();
      worldAlignedOffset.copy(this.followOffset);
      worldAlignedOffset.applyQuaternion(this.cameraQuaternion);
      if (this.rotationLocked) {
        this.cameraControls.setLookAt(this.cameraPosition.x + worldAlignedOffset.x, this.cameraPosition.y + worldAlignedOffset.y, this.cameraPosition.z + worldAlignedOffset.z, this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, true);
      } else {
        this.cameraControls.moveTo(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
      }
      MathService.releaseVec3(worldAlignedOffset);
      if (this.followListener) {
        const distanceToTarget = MathService.getVec3(0.0, 0.0, 0.0, 'camera-3').copy(this.camera.position).sub(this.cameraPosition);
        if (distanceToTarget.length() <= this.followListenerThreshold) {
          this.followListener();
          delete this.followListener;
        }
        MathService.releaseVec3(distanceToTarget);
      }
    }
    if (!this.cameraControls.enabled) {
      if (!this.rotationLocked) {
        this.camera.quaternion.slerp(this.cameraQuaternion, this.tween);
      }
      this.camera.position.lerp(this.cameraPosition, this.tween);
    } else {
      this.cameraControls.update(dt);
    }
  }
  addCamera(id, camera) {
    this.cameras[id] = camera;
  }
  getCamera(id) {
    return this.cameras[id];
  }
  setTween(tween = 0.2) {
    this.tween = tween;
  }
  useGameObjectCamera(gameObjectOrId) {
    let camera;
    if (typeof gameObjectOrId === 'string') {
      camera = this.getCamera(gameObjectOrId);
    } else {
      camera = gameObjectOrId;
    }
    if (!camera) {
      console.warn('CameraService', 'useStaticCamera', 'camera not found', {
        cameraOrId
      });
      return;
    }
    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnButtonDown);
    this.followedObject = null;
    this.cameraControls.enabled = false;
    this.cameraPosition.copy(camera.position);
    this.cameraQuaternion.copy(camera.quaternion);
    if (this.tween >= 1.0) {
      this.camera.position.copy(camera.position);
      this.camera.quaternion.copy(camera.quaternion);
    }
  }
  useStaticCamera(position, target) {
    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnButtonDown);
    this.followedObject = null;
    this.followOffset.set(0.1, 0.1, 0.1);
    this.cameraControls.enabled = false;
    this.cameraControls.setOrbitPoint(target.x, target.y, target.z);
    this.cameraPosition.copy(position);
    if (target) {
      const mock = UtilsService.getEmpty();
      mock.position.copy(position);
      mock.lookAt(target);
      this.cameraQuaternion.copy(mock.quaternion);
      UtilsService.releaseEmpty(mock);
    }
    if (this.tween >= 1.0) {
      this.camera.position.copy(this.cameraPosition);
      this.camera.quaternion.copy(this.cameraQuaternion);
    }
  }
  useFirstPersonCamera(object) {
    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnPointerMove);
    this.followedObject = object;
    this.followOffset.set(0.0, 0.0, 0.0);
    this.registerCameraColliders(false);
    this.cameraControls.dampingFactor = 1.0;
    this.cameraControls.enabled = false;
  }
  useThirdPersonCamera(object, offset, preventOcclusion = true) {
    this.setCameraMovementType(CameraMovementTypeEnums.rotateOnButtonDown);
    this.followedObject = object;
    this.followedObject.getWorldPosition(this.cameraPosition);
    this.registerCameraColliders(preventOcclusion);
    if (offset) {
      this.followOffset.copy(offset);
    } else {
      this.followOffset.set(0.1, 0.1, 0.1);
    }
    this.cameraControls.setLookAt(this.cameraPosition.x + this.followOffset.x, this.cameraPosition.y + this.followOffset.y, this.cameraPosition.z + this.followOffset.z, this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, false);
    this.cameraControls.dampingFactor = this.tween;
    this.cameraControls.enabled = true;
  }
  ignoreCameraCollisions(object) {
    object.traverse(child => {
      child.userData._ignoreCameraCollision = true;
    });
  }
  registerCameraColliders(preventOcclusion) {
    if (preventOcclusion) {
      const scene = RenderService.getScene();
      if (scene) {
        this.cameraControls.colliderMeshes = [];
        scene.traverseVisible(child => {
          if (child === this.followedObject || !(child instanceof Three__namespace.Mesh) || child.children.length) {
            return;
          }
          let ignoreCollision = false;
          child.traverseAncestors(ancestor => {
            if (ancestor && (ancestor === this.followedObject || ancestor.userData._ignoreCameraCollision)) {
              ignoreCollision = true;
            }
          });
          if (ignoreCollision) {
            return;
          }
          this.cameraControls.colliderMeshes.push(child);
        });
      }
    } else {
      this.cameraControls.colliderMeshes = [];
    }
  }
  setCameraMovementType(cameraMovementType) {
    this.cameraMovementType = cameraMovementType;
    if (cameraMovementType === CameraMovementTypeEnums.rotateOnButtonDown) {
      this.cameraControls.enabled = true;
      this.pointerLockControls.unlock();
    } else {
      this.cameraControls.enabled = false;
      this.pointerLockControls.lock();
    }
  }
  onReachTarget(callback) {
    this.followListener = callback;
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
  lockRotation() {
    this.rotationLocked = true;
  }
  unlockRotation() {
    this.rotationLocked = false;
  }
  disposeCamera(id) {
    this.cameras[id] = null;
  }
  disposeAll() {
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
    if (this.cameraQuaternion) {
      MathService.releaseQuaternion(this.cameraQuaternion);
    }
    this.cameraQuaternion = MathService.getQuaternion();
    this.followedObject = null;
    this.followListener = null;
    this.followListenerThreshold = 0.001;
    this.cameraControls.enabled = false;
    this.cameraControls.dampingFactor = 0.05;
    this.cameraControls.colliderMeshes = [];
    this.pointerLockControls.unlock();
    this.resetCamera();
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
    _defineProperty(this, "physicsWorld", null);
    _defineProperty(this, "physicsLoop", null);
    _defineProperty(this, "bodies", []);
    _defineProperty(this, "navmaps", []);
    _defineProperty(this, "pathfinder", null);
    _defineProperty(this, "pathfinedEnabled", false);
    _defineProperty(this, "pathfinderZoneId", 'zone');
    _defineProperty(this, "surfaceHandlers", {});
    _defineProperty(this, "surfaces", []);
  }
  init() {
    if (!this.physicsWorld) {
      const physicsWorld = new Cannon__namespace.World({
        gravity: new Cannon__namespace.Vec3(0.0, -9.86, 0.0)
      });
      this.physicsWorld = physicsWorld;
      this.physicsLoop = TimeService.registerFrameListener(({
        dt
      }) => {
        this.physicsWorld.bodies.forEach(body => {
          const {
            targetRef
          } = body;
          if (body.mass === 0.0) {
            body.allowSleep = true;
            return;
          }
          targetRef.position.copy(body.position);
          targetRef.quaternion.copy(body.quaternion);
        });
        if (this.physicsWorld && dt !== 0) {
          this.physicsWorld.fixedStep();
        }
      });
    }
  }
  registerBody(object, physicsConfig) {
    const {
      physicsShape,
      physicsStatic,
      physicsPreventMerge,
      physicsFriction,
      physicsRestitution,
      physicsWeight,
      physicsCollisionGroup,
      physicsPreventRotation,
      physicsControlled
    } = physicsConfig;
    const scene = RenderService.getScene();
    if (object.parent !== scene) {
      console.warn('PhysicsService', 'registerBody', 'only direct children of the Scene can be physically active', {
        object
      });
      scene.add(object);
    }
    const quaternion = MathService.getQuaternion();
    quaternion.copy(object.quaternion);
    object.quaternion.identity();
    const position = MathService.getVec3();
    position.copy(object.position);
    object.position.set(0.0, 0.0, 0.0);
    const box3 = UtilsService.getBox3();
    object.traverse(child => {
      if (child.isMesh) {
        const worldBbox = UtilsService.getBox3();
        worldBbox.expandByObject(child);
        child.updateMatrix();
        child.updateMatrixWorld();
        const worldTransform = child.matrixWorld.clone();
        const [e11, e21, e31, e41, e12, e22, e32, e42, e13, e23, e33, e43, e14, e24, e34, e44] = worldTransform.elements;
        worldTransform.set(e11, e12, e13, 0.0, e21, e22, e23, 0.0, e31, e32, e33, 0.0, e41, e42, e43, e44);
        worldBbox.applyMatrix4(worldTransform);
        box3.union(worldBbox);
        UtilsService.releaseBox3(worldBbox);
      }
    });
    object.quaternion.copy(quaternion);
    object.position.copy(position);
    MathService.releaseVec3(position);
    MathService.releaseQuaternion(quaternion);
    const objectSize = MathService.getVec3();
    box3.getSize(objectSize);
    const shape = {
      'box': new Cannon__namespace.Box(new Cannon__namespace.Vec3(objectSize.x, objectSize.y, objectSize.z)),
      'plane': new Cannon__namespace.Plane(),
      'sphere': new Cannon__namespace.Sphere(objectSize.x / 2.0)
    }[physicsShape] || new Cannon__namespace.Sphere(objectSize.x / 2.0);
    const material = new Cannon__namespace.Material({
      friction: defaultTo(physicsFriction, 0.3),
      restitution: defaultTo(physicsRestitution, 0.3)
    });
    let body;
    let bodyDebugColor;
    if (physicsStatic && !physicsPreventMerge) {
      if (!this.staticBodies) {
        const staticBodies = new Cannon__namespace.Body({
          mass: 0.0,
          material: material,
          allowSleep: true,
          type: Cannon__namespace.Body.STATIC
        });
        this.physicsWorld.addBody(staticBodies);
        this.staticBodies = staticBodies;
      }
      object.rotateX(-Math.PI / 2.0);
      this.staticBodies.addShape(shape, new Cannon__namespace.Vec3().copy(object.position), new Cannon__namespace.Quaternion().copy(object.quaternion));
      object.rotateX(Math.PI / 2.0);
      body = this.staticBodies;
      bodyDebugColor = new Three__namespace.Color(0xff00ff);
    } else {
      body = new Cannon__namespace.Body({
        mass: physicsStatic ? 0.0 : physicsWeight || 1.0,
        material: material,
        collisionFilterGroup: physicsCollisionGroup || -1,
        collisionFilterMask: physicsCollisionGroup || -1,
        fixedRotation: isDefined(physicsPreventRotation)
        // linearDamping: physicsControlled ? 1.0 : 0.01,
        // angularDamping: physicsControlled ? 1.0 : 0.01,
        // type: physicsControlled ? Cannon.Body.KINEMATIC : Cannon.Body.DYNAMIC
      });

      bodyDebugColor = new Three__namespace.Color(Math.random() * 0x888888 + 0x888888);
      body.addShape(shape);
      body.position.copy(object.position);
      body.quaternion.copy(object.quaternion);
      this.physicsWorld.addBody(body);
      AssetsService.registerDisposeCallback(object, () => {
        this.physicsWorld.removeBody(body);
      });
    }
    object.userData.cannonRef = body;
    body.targetRef = object;
    if (DebugService.get(DebugFlags.DEBUG_PHYSICS)) {
      if (physicsStatic && !physicsPreventMerge || object.userData.collisionBox) {
        return;
      }
      const helper = createBoxHelper(object, object.uuid, box3.clone());
      helper.material.color.set(bodyDebugColor);
      helper.material.transparent = true;
      helper.material.opacity = 0.25;
      const debugSize = new Three__namespace.Vector3();
      box3.getSize(debugSize);
      debugSize.subScalar(0.01);
      const debugBox = new Three__namespace.Mesh({
        'box': new Three__namespace.BoxBufferGeometry(debugSize.x, debugSize.y, debugSize.z),
        'plane': new Three__namespace.PlaneBufferGeometry(debugSize.x, debugSize.z),
        'sphere': new Three__namespace.SphereBufferGeometry(debugSize.x / 2.0, 8, 8)
      }[physicsShape] || new Three__namespace.SphereBufferGeometry(debugSize.x / 2.0, 8, 8), new Three__namespace.MeshBasicMaterial({
        color: bodyDebugColor,
        wireframe: true
      }));
      object.add(debugBox);
      box3.getCenter(debugBox.position);
      object.userData.collisionBox = debugBox;
    }
    MathService.releaseVec3(objectSize);
    UtilsService.releaseBox3(box3);
    return body;
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
    const surface = new surfaceConstructor(object);
    if (surface.onInteraction) surface.onInteraction = surface.onInteraction.bind(surface);
    if (surface.onEnter) surface.onEnter = surface.onEnter.bind(surface);
    if (surface.onLeave) surface.onLeave = surface.onLeave.bind(surface);
    object.userData.surfaceRef = surface;
    this.surfaces.push(object);
  }
  getNavmaps() {
    return this.navmaps;
  }
  disposeBody(object) {
    // this.bodies = this.bodies.filter(match => match !== object);
    // this.dynamicBodies = this.dynamicBodies.filter(match => match !== object);
  }
  disposeNavmap(object) {
    this.navmaps = this.navmaps.filter(match => match !== object);
  }
  disposeSurface(object) {
    this.surfaces = this.surfaces.filter(match => match !== object);
  }
  disposeAll() {
    // this.bodies = [];
    // this.dynamicBodies = [];
    this.navmaps = [];
    this.surfaces = [];
    MathService.releaseVec3(this.emptyVector3);
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
  key(id) {
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
    const scene = new Three__namespace.Scene();
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
    try {
      sound.stop();
      sound.mute();
      sound.unload();
    } catch {}
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

class InstancedScene extends Three__namespace.Group {
  constructor(sourceMesh, count) {
    super();
    _defineProperty(this, "objects", []);
    _defineProperty(this, "dirty", []);
    _defineProperty(this, "root", null);
    this.root = new Three__namespace.InstancedMesh(sourceMesh.geometry, sourceMesh.material, count);
    this.add(this.root);
    this.onCreate();
  }
  onCreate() {
    TimeService.registerFrameListener(() => {
      this.onFrame();
    });
  }
  addVirtualObject(object) {
    object.userData.__instancedSceneUid__ = this.objects.length;
    this.objects.push(object);
    this.markDirty(object);
  }
  markDirty(object) {
    this.dirty.push(object);
  }
  onFrame() {
    if (this.dirty.length > 0) {
      this.root.instanceMatrix.needsUpdate = true;
    }
    this.dirty = this.dirty.filter(object => {
      const {
        __instancedSceneUid__
      } = object.userData;
      this.root.setMatrixAt(__instancedSceneUid__, object.matrixWorld);
      return false;
    });
  }
  dispose() {
    this.dirty = null;
    this.objects = null;
  }
}

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
          active,
          instanced,
          instancedScene
        } = emitter;
        if (!particles.length) {
          return;
        }
        let visible = true;
        particles[0].parent.traverseAncestors(parent => {
          visible = parent.visible && visible;
        });
        if (!visible) {
          return;
        }
        particles.forEach(target => {
          target.userData.lifeTime += dt;
          if (target.userData.lifeTime < 0.0) {
            target.visible = false;
            return;
          }
          if (!target.visible) {
            if (!active) {
              return;
            } else if (!instanced) {
              target.visible = true;
            }
          }
          if (target.userData.delayedCreateParticle) {
            target.userData.delayedCreateParticle();
            delete target.userData.delayedCreateParticle;
          }
          const originalMatrix = MathService.getMatrix4();
          const originalMatrixWorld = MathService.getMatrix4();
          originalMatrix.copy(target.children[0].matrix);
          originalMatrixWorld.copy(target.children[0].matrixWorld);
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
          if (instanced) {
            target.visible = false;
            target.children[0].visible = false;
            target.updateMatrix();
            target.updateMatrixWorld();
            if (!target.children[0].matrix.equals(originalMatrix) || !target.children[0].matrixWorld.equals(originalMatrixWorld)) {
              instancedScene.markDirty(target.children[0]);
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
    onReset,
    instanced
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
      active: true,
      instanced,
      instancedScene: null
    };
    const scene = RenderService.getScene();
    emitterProps.play = () => emitterProps.active = true;
    emitterProps.stop = () => emitterProps.active = false;
    emitterProps.toggle = () => emitterProps.active = !emitterProps.active;
    removePlaceholder(object);
    if (!onFrame || !particleObject) {
      return;
    }
    if (instanced) {
      emitterProps.instancedScene = new InstancedScene(particleObject, emitterProps.particleDensity);
      scene.add(emitterProps.instancedScene);
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
      if (instanced) {
        particle.visible = false;
        emitterProps.instancedScene.addVirtualObject(particle.children[0]);
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
    pivot.userData.lifeTime = spawnJitter ? -Math.random() * spawnJitter : 0.0;
    pivot.userData.particleEmitterRandom = Math.random();
    const createParticle = () => {
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
    };
    if (pivot.userData.lifeTime < 0.0) {
      pivot.userData.delayedCreateParticle = createParticle;
    } else {
      createParticle();
    }
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
    _defineProperty(this, "smaaPostprocessingTextures", {});
    _defineProperty(this, "depthMaterial", null);
    _defineProperty(this, "depthRenderTarget", null);
    _defineProperty(this, "scene", null);
    _defineProperty(this, "controls", null);
    _defineProperty(this, "currentView", null);
    _defineProperty(this, "paused", false);
    _defineProperty(this, "onPaused", null);
    _defineProperty(this, "onResumed", null);
    _defineProperty(this, "onBeforeRenderFrame", null);
    _defineProperty(this, "onBeforeRenderDepth", null);
    _defineProperty(this, "onAfterRenderDepth", null);
    _defineProperty(this, "onAfterRenderFrame", null);
    _defineProperty(this, "animationLoop", null);
    _defineProperty(this, "logicLoop", null);
    _defineProperty(this, "lastFrameTimestamp", 0);
    _defineProperty(this, "logicFixedStep", 1000.0 / 60.0);
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
      antialias: GameInfoService.config.system.antialiasing && !GameInfoService.config.system.postprocessing,
      powerPreference: 'high-performance'
    });
    renderer.toneMapping = Three__namespace.ACESFilmicToneMapping;
    renderer.outputEncoding = Three__namespace.sRGBEncoding;
    renderer.autoClear = false;
    renderer.physicallyCorrectLights = true;
    renderer.xr.enabled = GameInfoService.config.system.vr || false;
    renderer.setPixelRatio(typeof pixelRatio === 'number' ? pixelRatio : GameInfoService.config.system.pixelRatio);
    renderer.setSize(windowInfo.width, windowInfo.height);
    if (GameInfoService.config.system.shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = Three__namespace.PCFShadowMap;
    }
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
    if (DebugService.get(DebugFlags.DEBUG_ORBIT_CONTROLS)) {
      CameraService.detachCamera();
    }
    const depthMaterial = new Three__namespace.MeshDepthMaterial();
    depthMaterial.depthPacking = Three__namespace.RGBADepthPacking;
    depthMaterial.blending = Three__namespace.NoBlending;
    const depthTexturesSupport = !!renderer.extensions.get('WEBGL_depth_texture');
    const depthRenderTarget = new Three__namespace.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    depthRenderTarget.texture.minFilter = Three__namespace.NearestFilter;
    depthRenderTarget.texture.magFilter = Three__namespace.NearestFilter;
    depthRenderTarget.texture.generateMipmaps = false;
    depthRenderTarget.stencilBuffer = false;
    if (depthTexturesSupport) {
      depthRenderTarget.depthTexture = new Three__namespace.DepthTexture();
      depthRenderTarget.depthTexture.type = Three__namespace.UnsignedShortType;
      depthRenderTarget.depthTexture.minFilter = Three__namespace.NearestFilter;
      depthRenderTarget.depthTexture.maxFilter = Three__namespace.NearestFilter;
    }
    this.depthMaterial = depthMaterial;
    this.depthRenderTarget = depthRenderTarget;
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
      camera: this.camera,
      renderer: this.renderer
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
    if (GameInfoService.config.system.antialiasing && this.smaaPostprocessingTextures.area && this.smaaPostprocessingTextures.search) {
      const smaaEffect = new postprocessing.SMAAEffect(this.smaaPostprocessingTextures.search, this.smaaPostprocessingTextures.area, postprocessing.SMAAPreset.HIGH, postprocessing.EdgeDetectionMode.COLOR);
      smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.02);
      smaaEffect.edgeDetectionMaterial.setPredicationMode(postprocessing.PredicationMode.DEPTH);
      smaaEffect.edgeDetectionMaterial.setPredicationThreshold(0.002);
      smaaEffect.edgeDetectionMaterial.setPredicationScale(1.0);
      const smaaPass = new postprocessing.EffectPass(this.camera, smaaEffect);
      this.composer.addPass(smaaPass);
    } else {
      console.info('RenderService', 'initPostProcessing', 'SMAA textures not available', {
        area: this.smaaPostprocessingTextures.area,
        search: this.smaaPostprocessingTextures.search
      });
    }
    const toneMappingEffect = new postprocessing.ToneMappingEffect({
      mode: postprocessing.ToneMappingMode.REINHARD2_ADAPTIVE,
      resolution: 256,
      whitePoint: 16.0,
      middleGrey: 0.6,
      minLuminance: 0.01,
      averageLuminance: 0.01,
      adaptationRate: 0.5
    });
    new postprocessing.EffectPass(this.camera, toneMappingEffect);
    this.composer.addPass(toneMappingEffect);
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
    const newEffect = new postprocessing.BloomEffect({
      ...(this.postProcessingEffects[id].defaults || {}),
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
  renderView(viewInstance) {
    if (this.currentView) {
      this.currentView.dispose();
      delete this.currentView;
    }
    this.currentView = viewInstance;
    DebugService.leaks.geometries = Math.max(DebugService.leaks.geometries, this.renderer.info.memory.geometries);
    DebugService.leaks.textures = Math.max(DebugService.leaks.textures, this.renderer.info.memory.textures);
    viewInstance.onCreate();
  }
  resetPostProcessing() {
    Object.keys(this.postProcessingEffects).forEach(effect => {
      this.resetPostProcessingEffect(effect);
    });
  }
  createSMAATextures() {
    return new Promise(resolve => {
      const smaaImageLoader = new postprocessing.SMAAImageLoader();
      smaaImageLoader.disableCache = true;
      smaaImageLoader.load(([search, area]) => {
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
    if (!this.renderer.xr.enabled) {
      this.onAnimationFrame();
    } else {
      this.renderer.setAnimationLoop(() => this.onAnimationFrame());
    }
  }
  runLogicLoop() {
    if (this.logicLoop) {
      cancelAnimationFrame(this.logicLoop);
    }
    this.logicLoop = requestAnimationFrame(() => this.runLogicLoop());
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
    CameraService.onFrame(dt);
    UiService.onFrame();
    TimeService.onFrame({
      dt,
      elapsedTime
    });
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
      this.depthRenderTarget.setSize(windowInfo.width, windowInfo.height);
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
  models: {
    gltf: new GLTFLoader.GLTFLoader(),
    fbx: new FBXLoader.FBXLoader()
  },
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
      loaders.hdri.load(path, texture => {
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
      let modelType = 'gltf';
      if (path.endsWith('.fbx')) {
        modelType = 'fbx';
      }
      loaders.models[modelType].load(path, model => {
        const renderer = RenderService.getRenderer();
        const camera = RenderService.getNativeCamera();
        let target;
        if (model.scene) {
          target = model.scene;
          target.animations = model.animations;
          model.parser.cache.removeAll();
          delete model.parser;
          delete model.asset;
          delete model.scenes;
        } else {
          target = model;
        }
        target.traverse(child => {
          this.registerDisposable(child);
          if (child.material) {
            if (forceMaterialsType) {
              child.material = convertMaterialType(child.material, forceMaterialsType);
            } else if (forceUniqueMaterials) {
              child.material = this.cloneMaterial(child.material);
            }
            if (GameInfoService.config.system.shadows) {
              child.material.side = Three__namespace.FrontSide;
            }
          }
          if (GameInfoService.config.system.correctBlenderLights) {
            // NOTE More arbitrary that you dare to imagine 👀

            if (child instanceof Three__namespace.Light) {
              child.intensity /= 68.3;
              if (typeof child.decay === 'number') {
                child.decay /= 2.0;
              }
            }
          }
          if (GameInfoService.config.system.shadows && child.visible) {
            if (child instanceof Three__namespace.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            } else if (child instanceof Three__namespace.Light) {
              child.castShadow = true;
              child.shadow.mapSize.width = 1024;
              child.shadow.mapSize.height = 1024;
              child.shadow.radius = 4;
            }
          }
        });
        target.frustumCulled = false;
        target.onAfterRender = function () {
          target.frustumCulled = true;
          target.onAfterRender = function () {};
        };
        renderer.compile(target, camera);
        target.userData.skinnedAnimations = target.animations;
        delete target.animations;
        resolve(target);
      });
    });
  }

  // NOTE Use this method to load FBX animations exported from Mixamo (without model)
  getMixamoAnimation(path) {
    return this.registerAsyncAsset(resolve => {
      loaders.models.fbx.load(path, model => {
        resolve(model.animations[Object.keys(model.animations)[0]]);
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
    copy.needsUpdate = true;
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
        actionCallback(object, {
          ...parserPayload,
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
    const debugScrollVisible = DebugService.get(DebugFlags.DEBUG_SCROLL_VISIBLE);
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
          this.scrollPositionX = Three$1.MathUtils.lerp(this.scrollPositionX, 0.0, this.scrollTween);
        }
        if (this.scrollPositionX > this.scrollMaxOffsetX) {
          this.scrollPositionX = Three$1.MathUtils.lerp(this.scrollPositionX, this.scrollMaxOffsetX, this.scrollTween);
        }
        this.position[this.axisX] = Three$1.MathUtils.lerp(this.position[this.axisX], this.scrollPositionX, this.scrollTween);
      }
      if (this.scrollY) {
        if (this.scrollPositionY < 0.0) {
          this.scrollPositionY = Three$1.MathUtils.lerp(this.scrollPositionY, 0.0, this.scrollTween);
        }
        if (this.scrollPositionY > this.scrollMaxOffsetY) {
          this.scrollPositionY = Three$1.MathUtils.lerp(this.scrollPositionY, this.scrollMaxOffsetY, this.scrollTween);
        }
        this.position[this.axisY] = Three$1.MathUtils.lerp(this.position[this.axisY], this.scrollPositionY, this.scrollTween);
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
  const fov = targetCamera.fov * Three$1.MathUtils.DEG2RAD;
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
const axisX = new Three__namespace.Vector3(1.0, 0.0, 0.0);
const axisY = new Three__namespace.Vector3(0.0, 1.0, 0.0);
const axisZ = new Three__namespace.Vector3(0.0, 0.0, 1.0);

const parseFullscreen = object => {
  const {
    userData
  } = object;
  if (isDefined(userData.fullscreen)) {
    const camera = RenderService.getNativeCamera();
    const originalOrientation = MathService.getVec3(0.0, 0.0, 0.0, 'fullscreen-1').copy(object.rotation);

    // NOTE Blender uses XZY axis orientation
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
    if (!DebugService.get(DebugFlags.DEBUG_AI_NODES)) {
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

const {
  MeshStandardMaterial,
  RepeatWrapping,
  RGBEEncoding
} = Three__namespace;
const utilityFunctions = `
float sum( vec3 v ) { return v.x+v.y+v.z; }
vec4 textureNoTile( sampler2D samp, sampler2D noise, vec2 uv )
{
  // sample variation pattern
  float k = texture2D( noise, 0.005*uv ).x; // cheap (cache friendly) lookup
  // compute index
  float l = k*8.0;
  float f = fract(l);
  float ia = floor(l);
  float ib = ia + 1.0;
  // offsets for the different virtual patterns
  float v = 0.4;
  vec2 offa = sin(vec2(3.0,7.0)*ia); // can replace with any other hash
  vec2 offb = sin(vec2(3.0,7.0)*ib); // can replace with any other hash
  // compute derivatives for mip-mapping, requires shader extension derivatives:true
  vec2 dx = dFdx(uv), dy = dFdy(uv);
  // sample the two closest virtual patterns
  vec3 cola = texture2DGradEXT( samp, uv + v*offa, dx, dy ).xyz;
  vec3 colb = texture2DGradEXT( samp, uv + v*offb, dx, dy ).xyz;
  // // interpolate between the two virtual patterns
  vec3 col = mix( cola, colb, smoothstep(0.2,0.8,f-0.1*sum(cola-colb)) );
  return vec4(col,1.0);
  // return vec4(0.0,0.0,0.0,0.0);
}
vec4 blend_rnm(vec4 n1, vec4 n2){
  vec3 t = n1.xyz*vec3( 2,  2, 2) + vec3(-1, -1,  0);
  vec3 u = n2.xyz*vec3(-2, -2, 2) + vec3( 1,  1, -1);
  vec3 r = t*dot(t, u) /t.z -u;
  return vec4((r), 1.0) * 0.5 + 0.5;
}
/**
* Adjusts the saturation of a color.
*
* @name czm_saturation
* @glslFunction
*
* @param {vec3} rgb The color.
* @param {float} adjustment The amount to adjust the saturation of the color.
*
* @returns {float} The color with the saturation adjusted.
*
* @example
* vec3 greyScale = czm_saturation(color, 0.0);
* vec3 doubleSaturation = czm_saturation(color, 2.0);
*/
vec4 czm_saturation(vec4 rgba, float adjustment)
{
    // Algorithm from Chapter 16 of OpenGL Shading Language
    vec3 rgb = rgba.rgb;
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return vec4(mix(intensity, rgb, adjustment), rgba.a);
}
`;
class LandscapeMaterial extends MeshStandardMaterial {
  constructor(parameters) {
    super(parameters);
    _defineProperty(this, "_splats", {
      value: []
    });
    _defineProperty(this, "_diffuseMaps", {
      value: []
    });
    _defineProperty(this, "_detailMaps", {
      value: []
    });
    _defineProperty(this, "_normalMaps", {
      value: []
    });
    _defineProperty(this, "_normalWeights", {
      value: []
    });
    _defineProperty(this, "_scale", {
      value: []
    });
    _defineProperty(this, "_detailScale", {
      value: []
    });
    _defineProperty(this, "_saturation", {
      value: []
    });
    _defineProperty(this, "_brightness", {
      value: []
    });
    _defineProperty(this, "_noise", {
      value: undefined
    });
    this.splats = parameters.splats || [];
    this.diffuseMaps = parameters.diffuseMaps || [];
    this.normalMaps = parameters.normalMaps || [];
    this.detailMaps = parameters.detailMaps || [];
    this.normalWeights = parameters.normalWeights || [];
    this.scale = parameters.scale || [];
    this.detailScale = parameters.detailScale || [];
    this.saturation = parameters.saturation || [];
    this.brightness = parameters.brightness || [];
    this.noise = parameters.noise;
    this.color = new Three__namespace.Color(0xff0000);
    this.parameters = parameters;
    this._normalWeights.value = this._normalWeights.value.length > 0 ? this._normalWeights.value : new Array(12).fill("0.75");
    // todo estimate scale
  }

  onBeforeCompile(shader) {
    shader.extensions = {
      derivatives: true,
      shaderTextureLOD: true
    };
    const {
      normalMaps,
      normalMap,
      diffuseMaps,
      splats,
      noise
    } = this.parameters;
    if (!splats) {
      throw new Error("splats is a required properties of SplatStandardMaterial");
    }
    shader.uniforms["splats"] = this._splats;
    shader.uniforms["diffuseMaps"] = this._diffuseMaps;
    shader.uniforms["normalMaps"] = this._normalMaps;
    shader.uniforms["detailMaps"] = this._detailMaps;
    shader.uniforms["normalWeights"] = this._normalWeights;
    shader.uniforms["scale"] = this._scale;
    shader.uniforms["detailScale"] = this._detailScale;
    shader.uniforms["saturation"] = this._saturation;
    shader.uniforms["brightness"] = this._brightness;

    // shader.vertexUvs = true;
    // shader.vertexTangents = true;

    if (noise) shader.uniforms["noise"] = {
      value: noise
    };

    // make sure that these textures tile correctly
    [...(normalMaps || []), ...splats, ...diffuseMaps, normalMap, noise].filter(d => d !== null && d !== undefined).forEach(t => {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
    });
    shader.fragmentShader = shader.fragmentShader.replace("uniform float opacity;", `
          uniform float opacity;
          uniform sampler2D noise;
          ${sampler2d("splats", this._splats.value)}
          ${sampler2d("diffuseMaps", this._diffuseMaps.value)}
          ${sampler2d("detailMaps", this._detailMaps.value)}
          ${sampler2d("normalMaps", this._normalMaps.value)}
          ${float("normalWeights", this._normalWeights.value)}
          ${float("scale", this._scale.value)}
          ${float("detailScale", this._detailScale.value)}
          ${float("saturation", this._saturation.value)}
          ${float("brightness", this._brightness.value)}
          
          ${utilityFunctions}
    `).replace("#include <map_fragment>", `
        #include <map_fragment>
        vec4 color_override = ${computeDiffuse({
      splats,
      noise,
      diffuseMaps: this._diffuseMaps.value,
      saturation: this._saturation.value,
      brightness: this._brightness.value
    })};
        diffuseColor = vec4(color_override.rgb, 1.0);
      `).replace("#include <normal_fragment_maps>", `
        vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
        vec4 _b = vec4(0.0, 0.0, 0.0, 1.0);
        ${computeNormal({
      normalMaps: this._normalMaps.value,
      detailMaps: this._detailMaps.value,
      splats,
      noise
    })}

        mapN = _b.rgb;
        mapN.xy *= normalScale;

        #ifdef USE_TANGENT
          normal = normalize( vTBN * mapN );
        #else
          normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );
        #endif
`);
  }
  set splats(v) {
    this._splats.value = v;
  }
  set normalMaps(v) {
    this._normalMaps.value = v;
  }
  set normalWeights(v) {
    this._normalWeights.value = v;
  }
  set detailMaps(v) {
    this._detailMaps.value = v;
  }
  set diffuseMaps(v) {
    this._diffuseMaps.value = v;
  }
  set scale(v) {
    this._scale.value = v;
  }
  set detailScale(v) {
    this._detailScale.value = v;
  }
  set saturation(v) {
    this._saturation.value = v;
  }
  set brightness(v) {
    this._brightness.value = v;
  }
  set noise(v) {
    this._noise.value = v;
  }
}
const computeDiffuse = ({
  diffuseMaps = [],
  splats,
  saturation = [],
  brightness = []
}) => {
  return diffuseMaps.filter(d => d !== null && d !== undefined).map((diffuse, i) => {
    // base rgba values
    let colorValue = `textureNoTile(diffuseMaps[${i}], noise, vUv * vec2(scale[${i}],scale[${i}]))`;
    let alphaValue = `texture2D(splats[${splatIndex(i)}], vUv).${splatChannel(i)}`;

    // optional modifiers
    if (typeof saturation !== 'undefined' && i < saturation.length) colorValue = `czm_saturation(${colorValue}, saturation[${i}])`;
    if (typeof brightness !== 'undefined' && i < brightness.length) colorValue = `(${colorValue} + vec4(brightness[${i}], brightness[${i}], brightness[${i}], 0.0))`;
    return `${colorValue} * ${alphaValue}`;
  }).join(" + ");
};
const computeNormal = ({
  normalMaps = [],
  detailMaps = [],
  splats
}) => {
  // return normalMaps
  //     .filter((d) => d !== null && d !== undefined)
  //     .map((diffuse, i) => {
  //         // base rgba values
  //         let colorValue = `textureNoTile(normalMaps[${i}], noise, vUv * vec2(scale[${i}],scale[${i}]))`;
  //         let alphaValue = `texture2D(splats[${splatIndex(i)}], vUv).${splatChannel(i)}`;

  //         return `${colorValue} * ${alphaValue}`;
  //     })
  //     .join(" + ");
  const norms = normalMaps.filter(n => n !== null && n !== undefined).map((normal, i) => {
    let colorValue = `textureNoTile(normalMaps[${i}], noise, vUv * vec2(scale[${i}],scale[${i}]))`;
    let alphaValue = `texture2D(splats[${splatIndex(i)}], vUv).${splatChannel(i)}`;

    // let zeroN = `vec4(0.5, 0.5, 1.0, 1.0)`;
    // const n = `mix(${zeroN}, ${colorValue}, ${alphaValue} * normalWeights[${i}])`;
    return `_b = mix(_b, ${colorValue}, ${alphaValue})`;
  }).join(`; \n`);
  return norms + "; \n";
};
const sampler2d = (name, data) => data && data.length ? `uniform sampler2D ${name}[${data.length}];` : "";
const float = (name, data) => data && data.length ? `uniform float ${name}[10];` : "";
const splatIndex = i => {
  return Math.floor(i / 4);
};
const splatChannel = i => {
  return ["r", "g", "b", "a"][i % 4];
};
const parseLandscape = object => {
  const {
    userData,
    material,
    children
  } = object;
  if (!isDefined(userData.landscape) || !material || !children.length) {
    return;
  }
  const {
    map: splatMap,
    normalMap: noiseMap,
    roughnessMap: splatNormal
  } = material;
  const landscapeHelpers = object.children.filter(child => child.userData.landscapeChannel).map(child => {
    child.userData.landscapeId = ['r', 'g', 'b', 'a'].indexOf(child.userData.landscapeChannel);
    child.visible = false;
    return child;
  }).sort((a, b) => a.userData.landscapeId - b.userData.landscapeId);
  AssetsService.registerDisposable(object.material);
  object.material = new LandscapeMaterial({
    splats: [splatMap],
    normalMap: splatNormal,
    diffuseMaps: landscapeHelpers.map(object => object.material.map),
    normalMaps: landscapeHelpers.map(object => object.material.normalMap),
    normalWeights: landscapeHelpers.map(object => typeof object.userData.normalWeight === 'number' ? object.userData.normalWeight : 1.0),
    saturation: landscapeHelpers.map(object => typeof object.userData.saturation === 'number' ? object.userData.saturation : 1.0),
    brightness: landscapeHelpers.map(object => typeof object.userData.brightness === 'number' ? object.userData.brightness : 0.1),
    scale: landscapeHelpers.map(object => typeof object.userData.scale === 'number' ? object.userData.scale : 1.0),
    noise: noiseMap,
    side: Three__namespace.FrontSide
  });
  AssetsService.registerDisposable(object.material);
  object.material.roughness = 0.5;
  object.material.metalness = 0.0;
  object.children = [];
  if (isDefined(userData.key)) {
    AssetsService.registerDisposeCallback(object, () => {});
  }
};

class PhysicsWrapper {
  constructor(target, physicsConfig = {}) {
    _defineProperty(this, "target", null);
    _defineProperty(this, "body", null);
    _defineProperty(this, "surfaceCollisions", {});
    this.target = target;
    this.body = PhysicsService.registerBody(target, physicsConfig);
  }
  getBody() {
    return this.body;
  }
  enableNoClip() {
    this.noClip = true;
  }
  disableNoClip() {
    this.noClip = false;
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

const parsePhysics = (object, {
  scene,
  scrollLists
}) => {
  const {
    userData
  } = object;
  if (isDefined(userData.physics)) {
    new PhysicsWrapper(object, userData || {});
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
    });

    // NOTE Parsers caching and registering scene objects
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
      parsePhysics(child, parserPayload);
    });

    // NOTE Parsers potentially consuming scene objects
    children.forEach(child => {
      parseShader(child);
      parseLandscape(child);
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
    MathService.disposeAll();
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

class SystemServiceClass {
  constructor() {
    _defineProperty(this, "promised", []);
  }
  init({
    statusBar
  } = {}) {
    StorageService.init();
    if (statusBar !== true) {
      SystemService.hideStatusBar();
    }
    if (DebugService.get(DebugFlags.DEBUG_ENABLE)) {
      DebugService.showStats();
    }
    if (DebugService.get(DebugFlags.DEBUG_LIVE)) {
      DebugService.showLogs();
    }
    this.promised.push(VarService.retrievePersistentVars());
    if (GameInfoService.config.system.postprocessing) {
      this.promised.push(RenderService.createSMAATextures());
    }
    if (MobileAdapter.isMobile()) {
      this.promised.push(new Promise(resolve => {
        document.addEventListener('deviceready', () => resolve(), false);
      }));
    }
  }
  hideStatusBar() {
    MobileAdapter.getNavigationBar().hide();
  }
  lockOrientation(orientation = MobileAdapterConstants.screenOrientation.landscape) {
    if (MobileAdapter.isMobile()) {
      MobileAdapter.getScreenOrientation().lock(orientation);
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
    MobileAdapter.disposeAll();
  }
}
const SystemService = new SystemServiceClass();

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
      if (DebugService.get(DebugFlags.DEBUG_AI_TARGETS)) {
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
    if (DebugService.get(DebugFlags.DEBUG_SKINNING_SKELETONS)) {
      const scene = RenderService.getScene();
      const skeletorHelper = new Three__namespace.SkeletonHelper(this.target);
      scene.add(skeletorHelper);
      AssetsService.registerDisposable(skeletorHelper);
    }
    this.mixer = new Three__namespace.AnimationMixer(this.target);
    userData.skinnedAnimations.forEach(clip => {
      if (clip.name === 'mixamo.com') {
        // NOTE Clean-up Mixamo exported default name
        clip.name = 'idle';
      }
      const action = this.mixer.clipAction(clip);
      action.reset();
      action.play();

      // NOTE Internal only
      this.mixerActions[clip.name] = action;
      this.mixerClips.push(clip);
      this.blendInAnimation(clip.name, 1.0);
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
  renameAnimation(original, newName) {
    this.mixerActions[newName] = this.mixerActions[original];
    delete this.mixerActions[original];
  }
  addMixamoAnimation(name, animation) {
    animation.name = name;
    const action = this.mixer.clipAction(animation);
    action.reset();
    action.play();
    this.mixerActions[name] = action;
    this.mixerClips.push(animation);
    this.blendInAnimation(name, 1.0);
    this.stopAllAnimations();
  }
  playAnimation(name, tweenDuration = 1000, reset = false, onFinish) {
    if (!this.mixerActions[name]) {
      console.warn('SkinnedGameObject', 'playAnimation', `animation "${name}" does not exist`);
      return;
    }
    const action = this.mixerActions[name];
    action.isStopping = false;
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
    if (!action.isRunning() || action.isStopping) {
      return;
    }
    action.isStopping = true;
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
    action.isStopping = false;
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
    if (DebugService.get(DebugFlags.DEBUG_SKINNING_SKELETONS)) {
      const scene = RenderService.getScene();
      const skeletorHelper = new Three__namespace.SkeletonHelper(model);
      scene.add(skeletorHelper);
      AssetsService.registerDisposable(skeletorHelper);
    }
    this.mixer = new Three__namespace.AnimationMixer(model);
    userData.skinnedAnimations.forEach(clip => {
      const action = this.mixer.clipAction(clip);
      action.reset();
      action.play();

      // NOTE Internal only
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

// NOTE Core functionality

// NOTE Export internal Three.js instance

const Three = Three__namespace;
const Cannon = Cannon__namespace;

exports.AiService = AiService;
exports.AiWrapper = AiWrapper;
exports.AnimationOverrideType = AnimationOverrideType;
exports.AnimationService = AnimationService;
exports.AnimationWrapper = AnimationWrapper;
exports.AssetsService = AssetsService;
exports.AudioChannelEnums = AudioChannelEnums;
exports.AudioService = AudioService;
exports.CameraMovementTypeEnums = CameraMovementTypeEnums;
exports.CameraService = CameraService;
exports.Cannon = Cannon;
exports.DebugFlags = DebugFlags;
exports.DebugService = DebugService;
exports.GameInfoService = GameInfoService;
exports.GameObjectClass = GameObjectClass;
exports.InputService = InputService;
exports.InteractionEnums = InteractionEnums;
exports.InteractionsService = InteractionsService;
exports.MathService = MathService;
exports.MathUtils = MathUtils;
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
exports.Three = Three;
exports.TimeService = TimeService;
exports.UiService = UiService;
exports.UtilsService = UtilsService;
exports.VarService = VarService;
exports.ViewClass = ViewClass;
exports.animateDelay = animateDelay;
exports.animateLinear = animateLinear;
exports.animateLinearInverse = animateLinearInverse;
exports.axisX = axisX;
exports.axisY = axisY;
exports.axisZ = axisZ;
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
exports.parseLandscape = parseLandscape;
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
