import { AssetsService } from '../../services/assets-service';

export const IntroFadeShader = ({ target }) => {
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
      },
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
    transparent: true,
  };

  return shader;
};
