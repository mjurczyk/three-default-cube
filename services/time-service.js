import * as uuid from 'uuid';

class TimeServiceClass {
  frameListeners = [];
  persistentFrameListeners = {};

  createTimeoutPromise(timeout = 1000) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  registerFrameListener(callback) {
    this.frameListeners.push(callback);

    return callback;
  }

  registerPersistentFrameListener(callback) {
    const persistentUid = uuid.v4();

    this.persistentFrameListeners[persistentUid] = callback;

    return persistentUid;
  }

  onFrame({ dt, elapsedTime }) {
    this.frameListeners = this.frameListeners.filter(listener => {
      return listener({ dt, elapsedTime }) !== false;
    });

    Object.keys(this.persistentFrameListeners).forEach(uid => {
      const listener = this.persistentFrameListeners[uid];

      if (listener({ dt, elapsedTime }) === false) {
        this.disposePersistentListener(listener);
      }
    });
  }

  disposeFrameListener(callback) {
    this.frameListeners = this.frameListeners.filter(match => match !== callback);
  }

  disposePersistentListener(uid) {
    delete this.persistentFrameListeners[uid];
  }

  disposeAll() {
    this.frameListeners = [];
  }
}

export const TimeService = new TimeServiceClass();