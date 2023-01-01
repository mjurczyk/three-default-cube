import * as Three from 'three';
import { DebugFlags, DebugService } from './debug-service';

class MathServiceClass {
  poolVec2 = [];
  poolVec3 = [];
  poolQuaternions = [];
  poolMatrix4 = [];

  poolVec2Total = 0;
  poolVec3Total = 0;
  poolQuaternionsTotal = 0;
  poolMatrix4Total = 0;

  leakRegistry = {};

  getVec2(x = 0.0, y = 0.0, id) {
    const pooled = this.poolVec2.pop();

    if (pooled) {
      return pooled.set(x, y);
    }

    this.poolVec2Total++;

    const vector = new Three.Vector2(x, y);

    this.registerId(vector, id);

    return vector;
  }

  releaseVec2(vector) {
    vector.set(0, 0);

    this.unregisterId(vector);

    this.poolVec2.push(vector);
  }

  getQuaternion(id) {
    const pooled = this.poolQuaternions.pop();

    if (pooled) {
      return pooled.identity();
    }

    this.poolQuaternionsTotal++;

    const quaternion = new Three.Quaternion();

    this.registerId(quaternion, id);

    return quaternion;
  }

  releaseQuaternion(quaternion) {
    quaternion.identity();

    this.unregisterId(quaternion);

    this.poolQuaternions.push(quaternion);
  }

  getMatrix4(id) {
    const pooled = this.poolMatrix4.pop();

    if (pooled) {
      return pooled.identity();
    }

    this.poolMatrix4Total++;

    const matrix = new Three.Matrix4();

    this.registerId(matrix, id);

    return matrix;
  }

  releaseMatrix4(matrix) {
    matrix.identity();

    this.unregisterId(matrix);

    this.poolMatrix4.push(matrix);
  }

  getVec3(x = 0.0, y = 0.0, z = 0.0, id) {
    const pooled = this.poolVec3.pop();

    if (pooled) {
      return pooled.set(x, y, z);
    }

    this.poolVec3Total++;

    const vector = new Three.Vector3(x, y, z);

    this.registerId(vector, id);

    return vector;
  }

  cloneVec3(sourceVector) {
    const pooled = this.poolVec3.pop();

    if (pooled) {
      return pooled.copy(sourceVector);
    }

    this.poolVec3Total++;

    return new Three.Vector3().copy(sourceVector);
  }

  releaseVec3(vector) {
    if (!vector) {
      return;
    }

    vector.set(0, 0, 0);

    this.unregisterId(vector);

    this.poolVec3.push(vector);
  }

  registerId(object, id) {
    if (!DebugService.get(DebugFlags.DEBUG_LOG_POOLS) || !id) {
      return;
    }

    object.userData = { id };

    const key = `${object.constructor.name}:${id}`;

    if (this.leakRegistry[key]) {
      this.leakRegistry[key]++;
    } else {
      this.leakRegistry[key] = 1;
    }
  }

  unregisterId(object) {
    if (!DebugService.get(DebugFlags.DEBUG_LOG_POOLS) || !object.userData || !object.userData.id) {
      return;
    }

    const { id } = object.userData;
    const key = `${object.constructor.name}:${id}`;

    if (this.leakRegistry[key]) {
      this.leakRegistry[key]--;
    }

    if (this.leakRegistry[key] <= 0) {
      delete this.leakRegistry[key];
    }

    delete object.userData;
  }

  handleLeaks() {
    if (!DebugService.get(DebugFlags.DEBUG_LOG_POOLS)) {
      return;
    }

    const leaks = Object.keys(this.leakRegistry);

    if (leaks.length > 0) {
      console.info('MathService', 'handleLeaks', 'leakedPools', { leaks: this.leakRegistry });
    }
  }

  disposeAll() {
    this.poolVec2 = [];
    this.poolVec3 = [];
    this.poolQuaternions = [];
    this.poolMatrix4 = [];

    this.poolVec2Total = 0;
    this.poolVec3Total = 0;
    this.poolQuaternionsTotal = 0;
    this.poolMatrix4Total = 0;
  }
}

export const MathService = new MathServiceClass();