import * as Three from 'three';
import { TimeService } from '../../../services/time-service';

export class InstancedScene extends Three.Group {
  objects = [];
  dirty = [];

  root = null;

  constructor(sourceMesh, count) {
    super();

    this.root = new Three.InstancedMesh(sourceMesh.geometry, sourceMesh.material, count);
    this.add(this.root);

    this.onCreate();
  }

  onCreate() {
    TimeService.registerFrameListener(() => {
      this.onFrame();
    });
  }

  addVirtualObject(object) { 
    object.userData.__instancedSceneUid__ = this.objects.length;

    this.objects.push(object);
    
    this.markDirty(object);
  }

  markDirty(object) {
    this.dirty.push(object);
  }

  onFrame() {
    if (this.dirty.length > 0) {
      this.root.instanceMatrix.needsUpdate = true;
    }

    this.dirty = this.dirty.filter(object => {
      const {  __instancedSceneUid__ } = object.userData;

      this.root.setMatrixAt(__instancedSceneUid__, object.matrixWorld);

      return false;
    });
  }

  dispose() {
    this.dirty = null;
    this.objects = null;
  }
}
