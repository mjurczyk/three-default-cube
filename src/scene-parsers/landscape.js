import * as Three from "three";
import { AssetsService } from '../services/assets-service';
import { isDefined } from '../utils/shared';

const { MeshStandardMaterial, RepeatWrapping, RGBEEncoding } = Three;

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
    _splats = { value: [] };
    _diffuseMaps = { value: [] };
    _detailMaps = { value: [] };
    _normalMaps = { value: [] };
    _normalWeights = { value: [] };
    _scale = { value: [] };
    _detailScale = { value: [] };
    _saturation = { value: [] };
    _brightness = { value: [] };
    _noise = { value: undefined };

    constructor(parameters) {
        super(parameters);

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

        this.color = new Three.Color(0xff0000);

        this.parameters = parameters;
        this._normalWeights.value = this._normalWeights.value.length > 0 ? this._normalWeights.value : new Array(12).fill("0.75");
        // todo estimate scale
    }

    onBeforeCompile(shader) {
        shader.extensions = {
            derivatives: true,
            shaderTextureLOD: true,
        };

        const { normalMaps, normalMap, diffuseMaps, splats, noise } = this.parameters;

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

        if (noise) shader.uniforms["noise"] = { value: noise };

        // make sure that these textures tile correctly
        [...(normalMaps || []), ...splats, ...diffuseMaps, normalMap, noise]
            .filter((d) => d !== null && d !== undefined)
            .forEach((t) => {
                t.wrapS = RepeatWrapping;
                t.wrapT = RepeatWrapping;
            });

        shader.fragmentShader = shader.fragmentShader
            .replace(
                "uniform float opacity;",
                `
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
    `)
    .replace(
      "#include <map_fragment>",
      `
        #include <map_fragment>
        vec4 color_override = ${computeDiffuse({
            splats,
            noise,
            diffuseMaps: this._diffuseMaps.value,
            saturation: this._saturation.value,
            brightness: this._brightness.value,
        })};
        diffuseColor = vec4(color_override.rgb, 1.0);
      `).replace(
        "#include <normal_fragment_maps>",
        `
        vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
        vec4 _b = vec4(0.0, 0.0, 0.0, 1.0);
        ${computeNormal({ normalMaps: this._normalMaps.value, detailMaps: this._detailMaps.value, splats, noise })}

        mapN = _b.rgb;
        mapN.xy *= normalScale;

        #ifdef USE_TANGENT
          normal = normalize( vTBN * mapN );
        #else
          normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );
        #endif
`
    );
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

const computeDiffuse = ({ diffuseMaps = [], splats, saturation = [], brightness = [] }) => {
  return diffuseMaps
    .filter((d) => d !== null && d !== undefined)
    .map((diffuse, i) => {
        // base rgba values
        let colorValue = `textureNoTile(diffuseMaps[${i}], noise, vUv * vec2(scale[${i}],scale[${i}]))`;
        let alphaValue = `texture2D(splats[${splatIndex(i)}], vUv).${splatChannel(i)}`;

        // optional modifiers
        if (typeof saturation !== 'undefined' && i < saturation.length) colorValue = `czm_saturation(${colorValue}, saturation[${i}])`;
        if (typeof brightness !== 'undefined' && i < brightness.length) colorValue = `(${colorValue} + vec4(brightness[${i}], brightness[${i}], brightness[${i}], 0.0))`;

        return `${colorValue} * ${alphaValue}`;
    })
    .join(" + ");
};

const computeNormal = ({ normalMaps = [], detailMaps = [], splats }) => {
    // return normalMaps
    //     .filter((d) => d !== null && d !== undefined)
    //     .map((diffuse, i) => {
    //         // base rgba values
    //         let colorValue = `textureNoTile(normalMaps[${i}], noise, vUv * vec2(scale[${i}],scale[${i}]))`;
    //         let alphaValue = `texture2D(splats[${splatIndex(i)}], vUv).${splatChannel(i)}`;

    //         return `${colorValue} * ${alphaValue}`;
    //     })
    //     .join(" + ");
    const norms = normalMaps
        .filter((n) => n !== null && n !== undefined)
        .map((normal, i) => {
            let colorValue = `textureNoTile(normalMaps[${i}], noise, vUv * vec2(scale[${i}],scale[${i}]))`;
            let alphaValue = `texture2D(splats[${splatIndex(i)}], vUv).${splatChannel(i)}`;

            // let zeroN = `vec4(0.5, 0.5, 1.0, 1.0)`;
            // const n = `mix(${zeroN}, ${colorValue}, ${alphaValue} * normalWeights[${i}])`;
            return `_b = mix(_b, ${colorValue}, ${alphaValue})`;
        })
        .join(`; \n`);

    return norms + "; \n";
};

const sampler2d = (name, data) => (data && data.length ? `uniform sampler2D ${name}[${data.length}];` : "");
const float = (name, data) => (data && data.length ? `uniform float ${name}[10];` : "");

const splatIndex = (i) => {
    return Math.floor(i / 4);
};

const splatChannel = (i) => {
    return ["r", "g", "b", "a"][i % 4];
};

export const parseLandscape = (object) => {
  const { userData, material, children } = object;

  if (!isDefined(userData.landscape) || !material || !children.length) {
    return;
  }

  const { map: splatMap, normalMap: noiseMap, roughnessMap: splatNormal } = material;

  const landscapeHelpers = object.children.filter(child => child.userData.landscapeChannel)
    .map(child => {
      child.userData.landscapeId = ['r', 'g', 'b', 'a'].indexOf(child.userData.landscapeChannel);
      child.visible = false;

      return child;
    })
    .sort((a, b) => a.userData.landscapeId - b.userData.landscapeId);

  AssetsService.registerDisposable(object.material);

  object.material = new LandscapeMaterial({
    splats: [ splatMap ],
    normalMap: splatNormal,
    diffuseMaps: landscapeHelpers.map(object => object.material.map),
    normalMaps: landscapeHelpers.map(object => object.material.normalMap),
    normalWeights: landscapeHelpers.map(object => typeof object.userData.normalWeight === 'number' ? object.userData.normalWeight : 1.0),
    saturation: landscapeHelpers.map(object => typeof object.userData.saturation === 'number' ? object.userData.saturation : 1.0),
    brightness: landscapeHelpers.map(object => typeof object.userData.brightness === 'number' ? object.userData.brightness : 0.1),
    scale: landscapeHelpers.map(object => typeof object.userData.scale === 'number' ? object.userData.scale : 1.0),
    noise: noiseMap,
    side: Three.FrontSide
  });

  AssetsService.registerDisposable(object.material);

  object.material.roughness = 0.5;
  object.material.metalness = 0.0;

  object.children = [];

  if (isDefined(userData.key)) {
    AssetsService.registerDisposeCallback(object, () => {});
  }
};


