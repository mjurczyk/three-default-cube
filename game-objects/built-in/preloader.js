import * as Three from 'three';
import { GameObjectClass } from "../../classes/game-object-class";
import { AssetsService } from "../../services/assets-service";
import { RenderService } from "../../services/render-service";
import { TimeService } from "../../services/time-service";
import { fitToCamera } from "../../utils/screen-size";
import { AnimationService } from '../../services/animation-service';
import { GameInfoService } from '../../services/game-info-service';

export class Preloader extends GameObjectClass {
  spinnerTexture = null;

  constructor({ requireAssets, onComplete, spinnerTexture } = {}) {
    super();

    this.spinnerTexture = spinnerTexture || GameInfoService.config.textures.spinner || null;

    Promise.all([
      ...(requireAssets || []),
      TimeService.createTimeoutPromise(3000)
    ]).then(assets => {
      const complete = onComplete(assets);

      if (complete && complete.then) {
        complete.then(() => this.onLoaded());
      } else {
        this.onLoaded();
      }
    }).catch(error => {
      console.info('Preloader', 'error', { error });
    });

    this.onCreate();
  }

  async onCreate() {
    GameObjectClass.prototype.onCreate.call(this);

    const camera = RenderService.getNativeCamera();

    const background = new Three.Mesh(
      new Three.PlaneBufferGeometry(1.0, 1.0),
      new Three.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
      })
    );
    background.name = 'background';

    const spinner = new Three.Mesh(
      new Three.PlaneBufferGeometry(1.0, 1.0),
      new Three.MeshBasicMaterial({
        map: await AssetsService.getTexture(this.spinnerTexture),
        transparent: true,
      })
    );
    spinner.name = 'spinner';

    this.add(spinner);
    this.add(background);

    this.position.z -= 5.0;
    this.lookAt(new Three.Vector3(0, 0, 0));

    TimeService.registerFrameListener(() => {
      const spinner = this.getObjectByName('spinner');
      const background = this.getObjectByName('background');

      if (!background || !spinner || !camera) {
        return false;
      }

      fitToCamera(background, camera);

      spinner.rotation.z -= 0.1;
    });

    camera.add(this);
  }

  onLoaded() {
    const camera = RenderService.getNativeCamera();
    const spinner = this.getObjectByName('spinner');

    if (spinner) {
      this.remove(spinner);

      AssetsService.disposeAsset(spinner);
    }

    AnimationService.registerAnimation({
      target: this,
      onStep: ({ target }) => {
        const background = target.getObjectByName('background');

        if (!background) {
          return;
        }

        if (background.material.opacity <= 0.0) {
          AssetsService.disposeAsset(target);

          return false;
        }
        
        fitToCamera(background, camera);
        background.material.opacity -= 0.05;
      },
    });
  }

  dispose() {
    GameObjectClass.prototype.dispose.call(this);

    if (this.spinnerTexture) {
      AssetsService.disposeAsset(this.spinnerTexture);

      this.spinnerTexture = null;
    }
  }
}
