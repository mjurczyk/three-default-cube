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
  MathUtils,
  Three
} from 'three-default-cube';

export class DemoCamera extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);
    
    let playerCameraHandle;

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

              playerCameraHandle = new Three.Object3D();
              playerCameraHandle.position.y = 2.0;
              characterModel.add(playerCameraHandle);
              CameraService.ignoreCameraCollisions(characterModel);

              const animations = new AnimationWrapper(characterModel);
              animations.playAnimation('idle');
              animations.blendInAnimation('idle', 1.0);

              const physics = new PhysicsWrapper(object);
              physics.enableNavmaps();

              let playerSpeed = 0.0;
              const maxPlayerSpeed = 0.05;

              TimeService.registerFrameListener(() => {
                const keyUp = InputService.keys['w'];
                const keyDown = InputService.keys['s'];
                const keyLeft = InputService.keys['a'];
                const keyRight = InputService.keys['d'];

                if (keyLeft) {
                  object.rotation.y -= 0.05;
                }

                if (keyRight) {
                  object.rotation.y += 0.05;
                }

                if (keyUp) {
                  playerSpeed = MathUtils.lerp(playerSpeed, -maxPlayerSpeed, 0.2);
                } else if (keyDown) {
                  playerSpeed = MathUtils.lerp(playerSpeed, maxPlayerSpeed / 2.0, 0.2);
                } else {
                  playerSpeed = MathUtils.lerp(playerSpeed, 0.0, 0.2);
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

            // NOTE Third-person mode
            CameraService.useThirdPersonCamera(playerCameraHandle, new Three.Vector3(0.0, 4.0, -3.0), true);
            CameraService.lockRotation();

            // NOTE First-person mode 

            // CameraService.useFirstPersonCamera(playerCameraHandle);
            // characterModel.parent.visible = false;

            // TimeService.registerFrameListener(() => {
            //   RenderService.getNativeCamera().getWorldQuaternion(characterModel.parent.quaternion);
            // });
          }
        });
      }
    });
  }
}
