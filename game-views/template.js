// NOTE Template only

import { ViewClass } from "../classes/view-class";
import { Preloader } from "../game-objects/built-in/preloader";
import { AssetsService } from "../services/assets-service";
import { CameraService } from "../services/camera-service";
import { MathService } from "../services/math-service";
import { RenderService } from "../services/render-service";

export class TemplateView extends ViewClass {
  onCreate() {
    const scene = RenderService.getScene();
    const { camera } = CameraService;

    const cameraOffset = MathService.getVec3(5.0, 0.0, 0.0, 'view-1');
    camera.position.copy(cameraOffset);
    CameraService.setCameraPosition(cameraOffset.x, cameraOffset.y, cameraOffset.z);
    MathService.releaseVec3(cameraOffset);

    const cameraTarget = MathService.getVec3(0, 0, 0, 'view-2');
    camera.lookAt(cameraTarget);
    MathService.releaseVec3(cameraTarget);

    const ambientLight = AssetsService.getAmbientLight();
    scene.add(ambientLight);

    const preloaderObject = new Preloader({
      requireAssets: [

      ],
      onComplete: ([
        
      ]) => {
        this.onLoaded();
      }
    });

    scene.add(preloaderObject);
  }

  onLoaded() {
    
  }

  onDispose() {
    
  }
}
