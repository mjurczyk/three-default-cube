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
  UtilsService,
  MathUtils
} from 'three-default-cube';

export class DemoViewsAndScenes extends ViewClass {
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
          navpath: 1,
          gameObjects: {
            'player': (object) => {
              replacePlaceholder(object, characterModel);

              const animations = new AnimationWrapper(characterModel);
              animations.playAnimation('idle');

              const physics = new PhysicsWrapper(object);
              physics.enableNavmaps();

              let playerSpeed = 0.0;
              const maxPlayerSpeed = 0.04;

              TimeService.registerFrameListener(() => {
                const keyUp = InputService.keys['w'];
                const keyDown = InputService.keys['s'];
                const keyLeft = InputService.keys['a'];
                const keyRight = InputService.keys['d'];

                const velocity = MathService.getVec3(0.0, 0.0, 0.0);

                if (keyUp) {
                  velocity.z -= 1.0;
                }

                if (keyDown) {
                  velocity.z += 1.0;
                }

                if (keyLeft) {
                  velocity.x -= 1.0;
                }

                if (keyRight) {
                  velocity.x += 1.0;
                }

                if (velocity.length() > 0.0) {
                  playerSpeed = MathUtils.lerp(playerSpeed, maxPlayerSpeed, 0.2);

                  const direction = MathService.getVec3(0.0, 0.0, 0.0);
                  const rotationMock = UtilsService.getEmpty();

                  object.getWorldPosition(direction).sub(velocity);
                  rotationMock.position.copy(object.position);
                  rotationMock.quaternion.copy(object.quaternion);
                  rotationMock.lookAt(direction);

                  object.quaternion.slerp(rotationMock.quaternion, 0.2);

                  MathService.releaseVec3(direction);
                  UtilsService.releaseEmpty(rotationMock);
                } else {
                  playerSpeed = MathUtils.lerp(playerSpeed, 0.0, 0.2);
                }

                velocity.normalize().multiplyScalar(playerSpeed);

                physics.setSimpleVelocity(velocity);

                animations.blendInAnimation('run', playerSpeed * (1 / maxPlayerSpeed));

                MathService.releaseVec3(velocity);
              });
            }
          },
          onCreate: () => {
            CameraService.useCamera(CameraService.getCamera('initial'), false);

            scene.add(worldModel);
          }
        });
      }
    });
  }
}
