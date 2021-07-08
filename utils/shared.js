import * as Three from 'three';
import { MathService } from '../services/math-service';

export const cloneValue = (value) => JSON.parse(JSON.stringify(value));

export const getRandomColor = () => new Three.Color(Math.random() * 0xffffff);

export const getRandomElement = (set) => set[Math.floor(Math.random() * set.length)];

export const spliceRandomElement = (set) => set.splice(Math.floor(Math.random() * set.length), 1)[0];

export const moduloAngle = (x) => Math.atan2(Math.sin(x), Math.cos(x));

export const defaultTo = (value, defaultValue) => typeof value === 'undefined' ? defaultValue : value;

export const swapVectors = (vectorA, vectorB) => {
  const helper = MathService.getVec3(0.0, 0.0, 0.0, 'swap-vectors-1');

  helper.copy(vectorA);
  vectorA.copy(vectorB);
  vectorB.copy(helper);

  MathService.releaseVec3(helper);
};

const textureFields = [
  // NOTE Excluding lightMap and envMap
  'alphaMap',
  'aoMap',
  'bumpMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'emissiveMap',
  'gradientMap',
  'displacementMap',
  'map',
  'metalnessMap',
  'matcap',
  'normalMap',
  'transmissionMap',
  'roughnessMap',
  'specularMap',
];

export const forAllMaterialTextures = (material, callback) => {
  textureFields.forEach(key => {
    if (material[key] && material[key].isTexture) {
      callback(material[key], key);
    }
  });
};
