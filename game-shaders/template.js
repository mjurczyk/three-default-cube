import * as Three from 'three';

export const TemplateShader = () => {
  const shader = {
    uniforms: {
      
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `,
    transparent: true,
  };

  return shader;
};
