import * as Three from 'three';
import { AssetsService } from '../services/assets-service';

export class GameObjectClass extends Three.Group {
  constructor() {
    super();

    AssetsService.registerDisposable(this);
  }

  onCreate() {}

  dispose() {}
}
