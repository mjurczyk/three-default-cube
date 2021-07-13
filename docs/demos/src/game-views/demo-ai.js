import * as Three from 'three';
import {
  ViewClass,
  Preloader,
  AssetsService,
  CameraService,
  RenderService,
  SceneService,
  TimeService,
  PhysicsWrapper,
  MathService,
  replacePlaceholder,
  AnimationWrapper,
  UtilsService,
  AiService,
  AiWrapper,
  getRandomElement,
  createArrowHelper,
} from 'three-default-cube';

export class DemoAi extends ViewClass {
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
          navpath: 2,
          gameObjects: {
            'player': (object) => {
              replacePlaceholder(object, characterModel);

              const animations = new AnimationWrapper(characterModel);
              animations.playAnimation('run');

              const physics = new PhysicsWrapper(object);
              physics.enableNavmaps();
              physics.enableNoClip();

              const ai = new AiWrapper(object);

              ai.registerBehaviour(() => {
                if (ai.hasTargetNode() && ai.getDistanceToTargetNode() <= 0.5) {
                  ai.setTargetNode(null);
                }

                if (!ai.hasTargetNode() || ai.path.length === 0) {
                  ai.setTargetNode(AiService.getAiNodeById(getRandomElement([ 1, 2, 3 ])));
                  ai.findPathToTargetNode();
                }

                const targetNode = ai.getTargetNode();
                const targetNodePosition = MathService.getVec3();
                targetNode.getWorldPosition(targetNodePosition);

                createArrowHelper(RenderService.getScene(), 'target-position', new Three.Vector3(0.0, 2.0, 0.0), targetNodePosition);

                MathService.releaseVec3(targetNodePosition);

                return { targetNode };
              });

              const playerSpeed = 0.04;

              TimeService.registerFrameListener(() => {
                const {
                  targetNode
                } = ai.getAiBehaviour();

                if (!targetNode) {
                  return;
                }

                const targetNodePosition = MathService.getVec3();
                targetNode.getWorldPosition(targetNodePosition);

                targetNodePosition.y = object.position.y;

                const rotationMock = UtilsService.getEmpty();
                object.add(rotationMock);

                rotationMock.lookAt(targetNodePosition);
                characterModel.quaternion.slerp(rotationMock.quaternion, 0.2);
                
                const playerDirection = MathService.getVec3();
                characterModel.getWorldDirection(playerDirection);

                physics.setSimpleVelocity(playerDirection.multiplyScalar(playerSpeed));
                
                MathService.releaseVec3(targetNodePosition);
                MathService.releaseVec3(playerDirection);
                UtilsService.releaseEmpty(rotationMock);
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
