import * as Three from 'three';
import { AssetsService } from "../services/assets-service";
import { GameInfoService } from '../services/game-info-service';

export const parseShader = (object) => {
  const { userData } = object;

  if (userData.shader) {
    const shaderFunction = GameInfoService.config.shaders[userData.shader];

    if (!shaderFunction || typeof shaderFunction !== 'function') {
      console.info('parseShader', 'shader does not exist or not a valid shader', userData.shader, { shaderFunction });

      return;
    }

    const shaderMaterial = new Three.ShaderMaterial(shaderFunction({
      target: object
    }));

    AssetsService.disposeProps(object.material);
    AssetsService.registerDisposable(shaderMaterial);

    object.material = shaderMaterial;
  }
};
