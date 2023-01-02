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
  UtilsService,
  PhysicsService,
  MathUtils
} from 'three-default-cube';

export class SnowSurface {
  target = null;
  snowCanvas = null;
  snowTexture = null;
  snowProps = {
    textureSize: 64,
    textureColor: '#999999',
    snowOffset: 2.0,
    snowDisplacement: 0.1
  };

  constructor(target) {
    this.target = target;

    this.onCreate();
  }

  onCreate() {
    if (this.target.material) {
      AssetsService.disposeProps(this.target.material);
    }

    this.snowCanvas = document.createElement('canvas');
    this.snowCanvas.width = this.snowProps.textureSize;
    this.snowCanvas.height = this.snowProps.textureSize;
  
    const ctx = this.snowCanvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.snowCanvas.width, this.snowCanvas.height);
    ctx.globalCompositeOperation = 'screen';
  
    this.snowTexture = new Three.CanvasTexture(this.snowCanvas);
    AssetsService.registerDisposable(this.snowTexture);

    this.target.material = new Three.MeshPhongMaterial({
      color: 0xffffff,
      side: Three.DoubleSide,
      displacementMap: this.snowTexture,
      displacementScale: -this.snowProps.snowDisplacement,
      metalness: .5,
      roughness: .5,
      emissive: new Three.Color(0xffffff),
      emissiveIntensity: 0.3
    });

    AssetsService.registerDisposable(this.target.material);
  }

  onInteraction({ hit } = {}) {
    const { uv } = hit;
    const { image: canvas } = this.snowTexture;

    if (!uv || !canvas) {
      return;
    }

    this.snowTexture.transformUv(uv);

    const ctx = canvas.getContext('2d');
    const x = uv.x * this.snowProps.textureSize - this.snowProps.snowOffset / 2;
    const y = uv.y * this.snowProps.textureSize - this.snowProps.snowOffset / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, this.snowProps.snowOffset, this.snowProps.snowOffset);

    this.snowTexture.needsUpdate = true;
  }

  dispose() {
    if (this.target) {
      delete this.target;
    }

    if (this.snowTexture) {
      delete this.snowTexture;
    }

    delete this.snowCanvas;
    this.snowCanvas = null;

    delete this.snowProps;
  }
}

export class DemoPhysics extends ViewClass {
  async onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0x0000ff, 7.0);
    scene.add(ambientLight);

    PhysicsService.registerSurfaceHandler('snow', SnowSurface, 'onInteraction');

    new Preloader({
      requireAssets: [
        AssetsService.getModel(require('../assets/models/demo-physics.glb')),
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
            CameraService.useCamera('initial');

            scene.add(worldModel);
          }
        });
      }
    });
  }
}
