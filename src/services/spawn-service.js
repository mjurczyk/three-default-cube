import { AssetsService } from "./assets-service";

class SpawnServiceClass {
  spawnableGameObjects = {};

  registerSpawnableGameObject(type, spawnFunction) {
    this.spawnableGameObjects[type] = spawnFunction;
  }

  createSpawnableGameObject(type, payload) {
    const spawnFunction = this.spawnableGameObjects[type];

    if (!spawnFunction) {
      console.info('SpawnService', 'createSpawnableGameObject', 'spawn function for object type does not exist', { type });
      return;
    }

    const object = spawnFunction(payload);
    object.gameObject = type;

    AssetsService.registerDisposable(object);

    return object;
  }

  disposeAll() {
    this.spawnableGameObjects = {};
  }
}

export const SpawnService = new SpawnServiceClass();