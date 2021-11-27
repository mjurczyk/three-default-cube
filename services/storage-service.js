import { NativeStorage } from '@ionic-native/native-storage';
import { DebugFlags, DummyDebug } from './dummy-debug';

class StorageServiceClass {
  reads = 0;
  writes = 0;
  useNative = true;

  constructor() {
    this.useNative = typeof cordova !== 'undefined';
  }

  init() {
    this.set('system.control', Date.now());    
  }

  getAllKeys() {
    return new Promise((resolve) => {
      if (!this.useNative) {
        return resolve(Object.keys(localStorage));
      }

      return NativeStorage.keys(
        keys => resolve(keys),
        error => {
          if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
            console.info('StorageServiceClass', 'getAllKeys', 'error', { error });
          }
    
          return resolve([]);
        }
      );
    });
  }

  set(key, value) {
    if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'set', { key, value });
    }

    this.writes++;

    if (!this.useNative) {
      return Promise.resolve(localStorage.setItem(key, JSON.stringify(value)));
    }

    return NativeStorage.setItem(key, value).catch((error) => {
      if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
        console.info('StorageServiceClass', 'set', 'not saved', { key, value, error });
      }

      return Promise.resolve(null);
    });
  }

  get(key) {
    if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'get', { key });
    }

    this.reads++;

    if (!this.useNative) {
      return Promise.resolve(JSON.parse(localStorage.getItem(key) || 'null'));
    }

    return NativeStorage.getItem(key).catch((error) => {
      if (DummyDebug.get(DebugFlags.DEBUG_STORAGE)) {
        console.info('StorageServiceClass', 'get', 'not read', { key, error });
      }

      return Promise.resolve(null);
    });
  }
}

export const StorageService = new StorageServiceClass();
