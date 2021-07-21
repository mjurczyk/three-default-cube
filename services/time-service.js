import * as uuid from 'uuid';

class TimeServiceClass {
  frameListeners = [];
  intervals = {};
  persistentFrameListeners = {};

  createTimeoutPromise(timeout = 1000) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  registerFrameListener(onFrame) {
    this.frameListeners.push(onFrame);

    return onFrame;
  }

  registerIntervalListener(onIntervalStep, intervalTime = 1000) {
    const interval = intervalTime / 1000.0;

    if (!this.intervals[interval]) {
      this.intervals[interval] = {
        time: interval,
        listeners: []
      };
    }

    this.intervals[interval].listeners.push(onIntervalStep);
  }

  registerPersistentFrameListener(onFrame) {
    const persistentUid = uuid.v4();

    this.persistentFrameListeners[persistentUid] = onFrame;

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

    Object.keys(this.intervals).forEach(key => {
      const intervals = this.intervals[key];

      intervals.time -= dt;

      if (intervals.time <= 0.0) {
        intervals.listeners = intervals.listeners.filter(listener => {
          return listener({ dt, elapsedTime }) !== false;
        });

        if (intervals.listeners.length === 0) {
          delete this.intervals[key];
        }

        intervals.time = key;
      }
    });
  }

  disposeFrameListener(frameListener) {
    this.frameListeners = this.frameListeners.filter(match => match !== frameListener);
  }

  disposePersistentListener(uid) {
    delete this.persistentFrameListeners[uid];
  }

  disposeIntervalListener(intervalListener, intervalTime) {
    if (intervalTime) {
      if (this.intervals[intervalTime]) {
        this.intervals[intervalTime].listeners = this.intervals[intervalTime].listeners.filter(match => match !== intervalListener);

        if (this.intervals[intervalTime].listeners.length === 0) {
          delete this.intervals[intervalTime];
        }
      }

      return;
    }

    Object.keys(this.intervals).forEach(key => {
      this.intervals[key].listeners = this.intervals[key].listeners.filter(match => match !== intervalListener);

      if (this.intervals[key].listeners.length === 0) {
        delete this.intervals[key];
      }
    });
  }

  disposeAll() {
    this.frameListeners = [];
    this.intervals = {};
  }
}

export const TimeService = new TimeServiceClass();