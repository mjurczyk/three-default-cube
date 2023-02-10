import { MobileAdapter } from '../adapters/mobile-adapter';
import { DebugFlags, DebugService } from './debug-service';

class StorageServiceClass {
  reads = 0;
  writes = 0;
  useNative = true;

  constructor() {
    this.useNative = MobileAdapter.isMobile();
  }

  init() {
    this.set('system.control', Date.now());    
  }

  getAllKeys() {
    return new Promise((resolve) => {
      if (!this.useNative) {
        return resolve(Object.keys(localStorage));
      }

      return MobileAdapter.getNativeStorage().keys(
        keys => resolve(keys),
        error => {
          if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
            console.info('StorageServiceClass', 'getAllKeys', 'error', { error });
          }
    
          return resolve([]);
        }
      );
    });
  }

  set(key, value) {
    if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'set', { key, value });
    }

    this.writes++;

    if (!this.useNative) {
      return Promise.resolve(localStorage.setItem(key, JSON.stringify(value)));
    }

    return MobileAdapter.getNativeStorage().setItem(key, value).catch((error) => {
      if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
        console.info('StorageServiceClass', 'set', 'not saved', { key, value, error });
      }

      return Promise.resolve(null);
    });
  }

  get(key) {
    if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
      console.info('StorageServiceClass', 'get', { key });
    }

    this.reads++;

    if (!this.useNative) {
      return Promise.resolve(JSON.parse(localStorage.getItem(key) || 'null'));
    }

    return MobileAdapter.getNativeStorage().getItem(key).catch((error) => {
      if (DebugService.get(DebugFlags.DEBUG_STORAGE)) {
        console.info('StorageServiceClass', 'get', 'not read', { key, error });
      }

      return Promise.resolve(null);
    });
  }
}

export const StorageService = new StorageServiceClass();
