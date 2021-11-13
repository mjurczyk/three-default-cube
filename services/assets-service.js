import * as Three from 'three';
import * as uuid from 'uuid';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { RenderService } from './render-service';
import {
  preloadFont as troikaPreloadFont,
  Text as TroikaText
} from 'troika-three-text';
import { Howl } from 'howler';
import { AudioService } from './audio-service';
import { convertMaterialType } from '../utils/materials';

const loaders = {
  models: new GLTFLoader(),
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
      new Three.BoxBufferGeometry(1, 1, 1),
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

  getImage(path) {
    return this.registerAsyncAsset((resolve) => {
      this.getImageSync(path, (image) => {
        resolve(image);
      });
    });
  }

  getImageSync(path, then) {
    return loaders.images.load(path, (image) => {
      this.registerDisposable(image);

      image.encoding = Three.sRGBEncoding;

      if (then) {
        then(image);
      }
    });
  }

  getHDRI(path) {
    return this.registerAsyncAsset(resolve => {
      loaders.hdri
        .setDataType(Three.UnsignedByteType)
        .load(path, (texture) => {
          const renderer = RenderService.getRenderer();
          const generator = new Three.PMREMGenerator(renderer);

          const renderTarget = generator.fromEquirectangular(texture);
          const hdri = renderTarget.texture;

          AssetsService.registerDisposable(hdri);
          AssetsService.registerDisposable(renderTarget);
          texture.dispose();
          generator.dispose();

          resolve(hdri);
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