import { AssetsService } from '../../services/assets-service';
import { DebugFlags, DummyDebug } from '../../services/dummy-debug';
import { MathService } from '../../services/math-service';
import { RenderService } from '../../services/render-service';
import { createArrowHelper } from '../../utils/helpers';

export class AiWrapper {
  target = null;
  targetNode = null;
  targetNodeId = 0;
  tickListener = null;

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
    return !!this.targetNode;
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
    // NOTE Ground angle is assumed as an angle on XZ-plane
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
  }
}
