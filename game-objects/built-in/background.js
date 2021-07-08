import * as Three from 'three';
import { GameObjectClass } from '../../classes/game-object-class';
import { AssetsService } from '../../services/assets-service';
import { MathService } from '../../services/math-service';
import { RenderService } from '../../services/render-service';
import { TimeService } from '../../services/time-service';
import { fitToCamera } from '../../utils/screen-size';
import { getRandomColor } from '../../utils/shared';

export class BackgroundPlane extends GameObjectClass {
  backgroundPlane = null;
  cameraOffset = 40.0;
  colorTarget = null;
  colorTween = 1.0;

  constructor() {
    super();

    this.backgroundPlane = new Three.Mesh(
      new Three.PlaneBufferGeometry(10.0, 10.0),
      new Three.MeshBasicMaterial({
        color: getRandomColor(),
      })
    );

    this.add(this.backgroundPlane);
    this.setCameraOffset(this.cameraOffset);

    this.onCreate();
  }

  setRepeatedTexture(texture, repeatX = 1.0, repeatY = 1.0) {
    if (this.backgroundPlane.material.map) {
      this.backgroundPlane.material.map.dispose();
    }

    this.backgroundPlane.material.map = texture;

    texture.wrapT = Three.RepeatWrapping;
    texture.wrapS = Three.RepeatWrapping;

    texture.repeat.set(repeatX, repeatY);
  }

  setColor(color) {
    if (this.backgroundPlane && this.colorTween === 1.0) {
      this.backgroundPlane.material.color.set(color);
    } else {
      if (!this.colorTarget) {
        this.colorTarget = new Three.Color();
      }

      this.colorTarget.set(color);
    }
  }

  setCameraOffset(offset = 10.0) {
    if (!this.backgroundPlane) {
      return;
    }

    this.cameraOffset = offset;

    this.repositionPlane({
      recalculateSize: true
    });
  }

  repositionPlane({ recalculateSize } = {}) {
    const camera = RenderService.getNativeCamera();

    camera.getWorldPosition(this.backgroundPlane.position);

    const cameraForward = MathService.getVec3(0.0, 0.0, 0.0, 'background-1');
    camera.getWorldDirection(cameraForward);

    this.backgroundPlane.position.add(cameraForward.multiplyScalar(this.cameraOffset));
    MathService.releaseVec3(cameraForward);

    if (recalculateSize) {
      this.backgroundPlane.rotation.set(0.0, 0.0, 0.0);
      fitToCamera(this.backgroundPlane, camera, true);
    }

    const cameraPosition = MathService.getVec3(0.0, 0.0, 0.0, 'background-2');
    camera.getWorldPosition(cameraPosition);
    this.backgroundPlane.lookAt(cameraPosition);
    MathService.releaseVec3(cameraPosition);
  }

  onCreate() {
    GameObjectClass.prototype.onCreate.call(this);

    TimeService.registerFrameListener(() => {
      if (!this.backgroundPlane) {
        return false;
      }

      if (this.colorTarget !== null) {
        if (!this.backgroundPlane.material.color.equals(this.colorTarget)) {
          this.backgroundPlane.material.color.lerp(this.colorTarget, this.colorTween);
        } else {
          this.colorTarget = null;
        }
      }

      this.repositionPlane();
    });
  }

  dispose() {
    GameObjectClass.prototype.dispose.call(this);

    if (this.backgroundPlane) {
      AssetsService.disposeAsset(this.backgroundPlane);

      this.backgroundPlane = null;
    }
  }
}
