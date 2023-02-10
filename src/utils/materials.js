import * as Three from 'three';

export const convertMaterialType = (material, targetType = 'basic') => {
  const [ materialConstructor, inheritProps ] = {
    'basic': ['MeshBasicMaterial', [ 'alphaMap', 'color', 'map' ]],
    'normal': ['MeshNormalMaterial', [ 'normalMap', 'displacementMap', 'displacementScale' ]],
    'depth': ['MeshDepthMaterial', [ 'normalMap', 'displacementMap', 'displacementScale' ]],
    'lambert': ['MeshLambertMaterial', [ 'alphaMap', 'color', 'map', 'reflectivity', 'emissive', 'emissiveMap', 'emissiveIntensity', 'specularMap', 'envMap' ]],
    'phong': ['MeshPhongMaterial', [ 'alphaMap', 'aoMap', 'displacementMap', 'displacementScale', 'emissive', 'emissiveMap', 'emissiveIntensity', 'normalMap', 'color', 'reflectivity', 'shininess', 'map', 'specular', 'specularMap', 'envMap' ]],
    'standard': ['MeshStandardMaterial', [ 'alphaMap', 'aoMap', 'color', 'map', 'reflectivity', 'emissive', 'emissiveMap', 'emissiveIntensity', 'displacementMap', 'displacementScale', 'metalness', 'metalnessMap', 'roughness', 'roughnessMap', 'normalMap', 'envMap' ]],
    'physical': ['MeshPhysicalMaterial', [ 'alphaMap', 'aoMap', 'color', 'map', 'reflectivity', 'emissive', 'emissiveMap', 'emissiveIntensity', 'displacementMap', 'displacementScale', 'metalness', 'metalnessMap', 'roughness', 'roughnessMap', 'normalMap', 'clearcoat', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughness', 'clearcoatRoughnessMap', 'ior', 'reflectivity', 'sheen', 'transmission', 'transmissionMap', 'envMap' ]],
    'toon': ['MeshToonMaterial', [ 'alphaMap', 'aoMap', 'displacementMap', 'displacementScale', 'emissive', 'emissiveMap', 'emissiveIntensity', 'normalMap', 'color', 'map' ]],
    'matcap': ['MeshMatcapMaterial', [ 'alphaMap', 'color', 'displacementMap', 'displacementScale', 'map', 'matcap', 'normalMap' ]],
  }[targetType];

  if (!materialConstructor || !material) {
    return;
  }

  const replacementProps = {};

  [...inheritProps, 'side', 'name', 'skinning', 'transparent', 'vertexColors', 'visible', 'toneMapped', 'dithering', 'premultipliedAlpha', 'precision', 'opacity'].forEach(prop => {
    replacementProps[prop] = material[prop] || null;
  });

  return new Three[materialConstructor](replacementProps);
};
