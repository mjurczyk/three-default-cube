// NOTE Template only

import {
  ViewClass,
  Preloader,
  AssetsService,
  CameraService,
  MathService,
  RenderService,
} from 'three-default-cube';

export class TemplateView extends ViewClass {
  onCreate() {
    const scene = RenderService.getScene();
    const { camera } = CameraService;

    const cameraOffset = MathService.getVec3(5.0, 0.0, 0.0);
    camera.position.copy(cameraOffset);
    CameraService.setCameraPosition(cameraOffset.x, cameraOffset.y, cameraOffset.z);
    MathService.releaseVec3(cameraOffset);

    const cameraTarget = MathService.getVec3(0.0, 0.0, 0.0);
    camera.lookAt(cameraTarget);
    MathService.releaseVec3(cameraTarget);

    const ambientLight = AssetsService.getAmbientLight(0x000033, 0xffffcc, 1.0);
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
}
