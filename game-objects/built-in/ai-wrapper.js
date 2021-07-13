import { AssetsService } from '../../services/assets-service';
import { DebugFlags, DummyDebug } from '../../services/dummy-debug';
import { MathService } from '../../services/math-service';
import { PhysicsService } from '../../services/physics-service';
import { RenderService } from '../../services/render-service';
import { UtilsService } from '../../services/utils-service';
import { createArrowHelper } from '../../utils/helpers';

export class AiWrapper {
  target = null;
  targetNode = null;
  targetNodeId = 0;
  tickListener = null;
  path = [];

  constructor(target) {
    this.target = target;

    AssetsService.registerDisposeCallback(this.target, () => this.dispose());
  }
  
  registerBehaviour(callback) {
    this.tickListener = callback;
  }

  getAiBehaviour() {
    if (this.tickListener) {
      if (DummyDebug.get(DebugFlags.DEBUG_AI_TARGETS)) {
        if (this.target && this.targetNode) {
          const scene = RenderService.getScene();
          const target = MathService.getVec3(0.0, 0.0, 0.0, 'ai-1');
          const node = MathService.getVec3(0.0, 0.0, 0.0, 'ai-2');

          this.target.getWorldPosition(target);
          this.targetNode.getWorldPosition(node);

          node.sub(target);

          createArrowHelper(scene, `aiWrapper-getAiBehaviour-${this.target.uuid}`, node, target);
          
          MathService.releaseVec3(target);
          MathService.releaseVec3(node);
        }
      }

      return this.tickListener();
    }
  }

  hasTargetNode() {
    if (this.targetNode) {
      return true;
    } else {
      if (this.path && this.path.length) {
        this.targetNode = this.path.shift();

        return true;
      }

      return false;
    }
  }

  getTargetNode() {
    return this.targetNode;
  }

  setTargetNode(node) {
    if (node) {
      this.targetNode = node;
      this.targetNodeId = node.userData.aiNode;
    } else {
      this.targetNode = null;
      this.targetNodeId = 0;
    }
  }

  getDistanceToTargetNode() {
    if (!this.targetNode) {
      return 0.0;
    }

    const position = MathService.getVec3(0.0, 0.0, 0.0, 'ai-3');
    const node = MathService.getVec3(0.0, 0.0, 0.0, 'ai-4');

    this.target.getWorldPosition(position);
    this.targetNode.getWorldPosition(node);

    const distance = position.sub(node).length();

    MathService.releaseVec3(position);
    MathService.releaseVec3(node);

    return distance;
  }

  getGroundAngleToTargetNode() {
    if (!this.target || !this.targetNode) {
      return 0.0;
    }

    const origin = MathService.getVec3(0.0, 0.0, 0.0, 'ai-5');
    const position = MathService.getVec3(0.0, 0.0, 0.0, 'ai-6');

    this.target.getWorldPosition(origin);
    this.targetNode.getWorldPosition(position);

    position.y = 0;
    origin.y = 0;

    position.sub(origin);

    this.target.getWorldDirection(origin);

    origin.y = 0;

    const angle = position.normalize().angleTo(origin);

    MathService.releaseVec3(origin);
    MathService.releaseVec3(position);

    return angle;
  }

  findPathToTargetNode() {
    if (!this.target || !this.targetNode) {
      console.info('AiWrapper', 'getPathToTargetNode', 'missing target node');
      return [];
    }

    if (!PhysicsService.pathfinderZoneId) {
      console.info('AiWrapper', 'getPathToTargetNode', 'pathfinder not enabled or navmesh missing');
      return [];
    }

    const targetPosition = MathService.getVec3();
    this.target.getWorldPosition(targetPosition);

    const groupId = PhysicsService.pathfinder.getGroup(PhysicsService.pathfinderZoneId, targetPosition);

    const targetNodePosition = MathService.getVec3();
    this.targetNode.getWorldPosition(targetNodePosition);

    this.path = [];

    PhysicsService.pathfinder.findPath(
      targetPosition,
      targetNodePosition,
      PhysicsService.pathfinderZoneId,
      groupId
    ).forEach(position => {
      const mock = UtilsService.getEmpty();

      mock.position.copy(position);

      this.path.push(mock);
    });

    this.path.push(this.targetNode);
    this.targetNode = this.path.shift();

    MathService.releaseVec3(targetPosition);

    return this.path;
  }

  getPathLength() {
    return (this.path || []).length;
  }

  dispose() {
    if (this.targetNode) {
      AssetsService.registerDisposable(this.targetNode);

      delete this.targetNode;
    }

    if (this.tickListener) {
      delete this.tickListener;
    }

    if (this.target) {
      delete this.target;
    }

    if (this.path) {
      this.path = [];
    }
  }
}
