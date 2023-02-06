import * as Three from 'three';
import * as uuid from 'uuid';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { RenderService } from './render-service';
import {
  preloadFont as troikaPreloadFont,
  Text as TroikaText
} from 'troika-three-text';
import { Howl } from 'howler';
import { AudioService } from './audio-service';
import { convertMaterialType } from '../utils/materials';
import { GameInfoService } from './game-info-service';
import { defaultTo } from '../utils/shared';
import { DQ } from '../utils/constants';
import { NetworkService } from './network-service';

const loaders = {
  models: {
    gltf: new GLTFLoader(),
    fbx: new FBXLoader()
  },
  images: new Three.TextureLoader(),
  hdri: new RGBELoader(),
  audio: new Three.AudioLoader()
};

class AssetsServiceClass {
  disposables = [];
  pending = {};
  preloaded = {};
  savedMaterials = {};
  audioBuffers = {};

  getDefaultCube() {
    const cube = new Three.Mesh(
      new Three.BoxGeometry(1, 1, 1),
      new Three.MeshNormalMaterial()
    );

    this.registerDisposable(cube);

    return cube;
  }

  getAmbientLight(groundColor = 0xffffff, skyColor = 0xffffff, intensity = 1.0) {
    const light = new Three.HemisphereLight(
      groundColor,
      skyColor,
      intensity
    );

    this.registerDisposable(light);

    return light;
  }

  registerAsyncAsset(promisable) {
    const pid = uuid.v4();
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
    return this.registerAsyncAsset((resolve) => {
      this.getImageSync(path, (image) => {
        resolve(image);
      });
    });
  }

  getTextureSync(path, then) {
    return loaders.images.load(path, (image) => {
      this.registerDisposable(image);

      image.encoding = Three.sRGBEncoding;

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

  getHDRI(path, encoding = Three.RGBEEncoding) {
    if (RenderService.isHeadless) {
      return Promise.resolve(new Three.Texture());
    }

    return this.registerAsyncAsset(resolve => {
      loaders.hdri
        .load(path, (texture) => {
          const renderer = RenderService.getRenderer();
          const generator = new Three.PMREMGenerator(renderer);

          const renderTarget = generator.fromEquirectangular(texture);
          const hdri = renderTarget.texture;
          hdri.encoding = encoding || Three.RGBEEncoding;

          AssetsService.registerDisposable(hdri);
          AssetsService.registerDisposable(renderTarget);
          texture.dispose();
          generator.dispose();

          resolve(hdri);
        });
    });
  }

  getReflectionsTexture(path) {
    if (RenderService.isHeadless) {
      return Promise.resolve(new Three.Texture());
    }

    return this.registerAsyncAsset(resolve => {
      this.getTexture(path).then(texture => {
        const renderer = RenderService.getRenderer();
        const generator = new Three.PMREMGenerator(renderer);
        const renderTarget = generator.fromEquirectangular(texture);

        const reflections = renderTarget.texture;
        reflections.encoding = Three.sRGBEncoding;

        AssetsService.registerDisposable(reflections);
        AssetsService.registerDisposable(renderTarget);
        texture.dispose();
        generator.dispose();

        resolve(reflections);
      });
    });
  }

  getModel(path, { internalAllowPreloaded, forceUniqueMaterials, forceMaterialsType } = {}) {
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
              child.material.side = Three.FrontSide;
            }
          }

          if (GameInfoService.config.system.correctBlenderLights) {
            // NOTE More arbitrary that you dare to imagine 👀

            if (child instanceof Three.Light) {
              child.intensity /= 68.3;
  
              if (typeof child.decay === 'number') {
                child.decay /= 2.0;
              }
            }
          }

          if (GameInfoService.config.system.shadows && child.visible) {
            if (child instanceof Three.Mesh) {
              child.castShadow = GameInfoService.config.system.shadows === DQ.ShadowsAllObjects;
              child.receiveShadow = true;
            } else if (child instanceof Three.Light) {
              child.castShadow = true;
              child.shadow.mapSize.width = defaultTo(GameInfoService.config.system.shadowsResolution, 1024);
              child.shadow.mapSize.height = defaultTo(GameInfoService.config.system.shadowsResolution, 1024);
              child.shadow.radius = defaultTo(GameInfoService.config.system.shadowsRadius, 4);
            }
          }
        });

        target.frustumCulled = false;

        target.onAfterRender = function () {
          target.frustumCulled = true;
          
          target.onAfterRender = function () {};
        };

        if (renderer) {
          renderer.compile(target, camera);
        }

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
    })
      .then(model => {
        if (!this.preloaded[path]) {
          this.preloaded[path] = [];
        }

        this.preloaded[path].push(model);

        return Promise.resolve();
      }
    );
  }

  preloadFont(path) {
    return this.registerAsyncAsset(resolve => {
      troikaPreloadFont({
        font: path,
        characters: [
          'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z',
          'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z',
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
          '.', ',', ':'
        ]
      }, resolve);
    });
  }

  preloadAudio(path) {
    return this.registerAsyncAsset(resolve => {
      const audio = new Howl({
        src: [ path ],
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

      this.preloadAudio(path)
      .then(audio => {
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

    if (object instanceof Three.Scene || object instanceof Three.Camera) {
      this.markUndisposed(object, 'Object is a Scene or Camera');

      return;
    }

    if (object instanceof AudioBuffer) {
      this.markUndisposed(object, 'Object is an AudioBuffer');

      return;
    }

    if (object instanceof Howl) {
      AudioService.stopAudio(object);

      return;
    }

    object.visible = false;

    if (object.__registeredDisposable__) {
      this.markDisposed(object);

      this.disposables = this.disposables.filter(match => match !== object);
    }

    if (object.traverse) {
      object.traverse(child => {
        NetworkService.disposeSyncObject(child);
      });
    }

    if (object.parent) {
      object.parent.remove(object);
    }

    if (object instanceof TroikaText) {
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

export const AssetsService = new AssetsServiceClass();