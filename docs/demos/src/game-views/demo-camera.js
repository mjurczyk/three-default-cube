import * as Three from 'three';
import {
  ViewClass,
  Preloader,
  AssetsService,
  CameraService,
  RenderService,
  SceneService,
  TimeService,
  InputService,
  PhysicsWrapper,
  MathService,
  replacePlaceholder,
  AnimationWrapper,
} from 'three-default-cube';

export class DemoCamera extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);

    new Preloader({
      requireAssets: [
        AssetsService.getModel(require('../assets/models/demo-basic.glb')),
        AssetsService.getModel(require('../assets/models/character.glb')),
      ],
      onComplete: ([
        worldModel,
        characterModel
      ]) => {
        SceneService.parseScene({
          target: worldModel,
          gameObjects: {
            'player': (object) => {
              replacePlaceholder(object, characterModel);

              const animations = new AnimationWrapper(characterModel);
              animations.playAnimation('idle');

              const physics = new PhysicsWrapper(object);
              physics.enableNavmaps();

              let playerSpeed = 0.0;
              const maxPlayerSpeed = 0.04;

              CameraService.follow(object);
              CameraService.followPivotPosition.set(0.0, 2.0, 2.0);

              TimeService.registerFrameListener(() => {
                const keyUp = InputService.keys['w'];
                const keyDown = InputService.keys['s'];
                const keyLeft = InputService.keys['a'];
                const keyRight = InputService.keys['d'];

                if (keyLeft) {
                  object.rotation.y -= 0.025;
                }

                if (keyRight) {
                  object.rotation.y += 0.025;
                }

                if (keyUp) {
                  playerSpeed = Three.MathUtils.lerp(playerSpeed, -maxPlayerSpeed, 0.2);
                } else if (keyDown) {
                  playerSpeed = Three.MathUtils.lerp(playerSpeed, maxPlayerSpeed / 2.0, 0.2);
                } else {
                  playerSpeed = Three.MathUtils.lerp(playerSpeed, 0.0, 0.2);
                }

                const velocity = MathService.getVec3();
                object.getWorldDirection(velocity);

                velocity.multiplyScalar(playerSpeed);

                physics.setSimpleVelocity(velocity);

                animations.blendInAnimation('run', Math.abs(playerSpeed) * (1 / maxPlayerSpeed));

                MathService.releaseVec3(velocity);
              });
            }
          },
          onCreate: () => {
            scene.add(worldModel);
          }
        });
      }
    });
  }
}
