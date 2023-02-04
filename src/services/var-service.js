import { GameInfoService } from "./game-info-service";
import { StorageService } from "./storage-service";

class VarServiceClass {
  variables = {};
  listeners = {};
  persistentVars = {};

  init({ language } = {}) {
    if (GameInfoService.config.labels) {
      const defaultLabels = GameInfoService.config.labels[language || 'en'] || {};

      Object.keys(defaultLabels).forEach(key => {
        this.setVar(key, defaultLabels[key]);
      });
    }

    if (GameInfoService.config.vars) {
      const defaultGameState = GameInfoService.config.vars;

      Object.keys(defaultGameState).forEach(key => {
        this.setVar(key, defaultGameState[key]);
      });
    }
  }

  setVar(id, value) {
    this.variables[id] = value;

    if (!this.listeners[id]) {
      this.listeners[id] = [];
    } else {
      this.listeners[id] = this.listeners[id].filter(callback => {
        if (callback) {
          return callback(value) !== false;
        }

        return false;
      });
    }

    if (this.persistentVars[id]) {
      this.persistentVars[id](value);
    }
  }

  getVar(id, onUpdate, onCreate) {
    if (!this.listeners[id]) {
      this.listeners[id] = [];
    }

    if (onUpdate) {
      this.listeners[id].push(onUpdate);

      onUpdate(this.variables[id]);
    }

    if (onCreate) {
      onCreate(onUpdate);
    }

    return this.variables[id];
  }

  removeVar(id) {
    delete this.variables[id];
    delete this.listeners[id];
  }

  registerPersistentVar(id, defaultValue) {
    return StorageService.get(id).then(initialValue => {
      this.persistentVars[id] = (newValue) => {
        StorageService.set(id, newValue);
      };

      if (initialValue !== null || typeof defaultValue !== 'undefined') {
        VarService.setVar(id, initialValue !== null ? initialValue : defaultValue);
      }

      return Promise.resolve();
    });
  }

  retrievePersistentVars() {
    return new Promise(async (resolve) => {
      const keys = await StorageService.getAllKeys();

      await Promise.all(keys.map(key => {
        return this.registerPersistentVar(key);
      }));

      resolve();
    });
  }

  resolveVar(variableString, onResolve, onCreate) {
    if (typeof variableString === 'undefined') {
      return onResolve();
    }

    if (variableString[0] === ':' && variableString[variableString.length - 1] === ':') {
      return this.getVar(
        variableString.substr(1, variableString.length - 2),
        (value) => { onResolve ? onResolve(value) : null; },
        (listener) => { onCreate ? onCreate(listener) : null; }
      );
    }

    return onResolve(variableString);
  }

  disposeListener(id, callback) {
    if (id && this.listeners[id]) {
      this.listeners[id] = this.listeners[id].filter(match => match !== callback);
    } else {
      Object.keys(this.listeners).forEach(id => {
        this.listeners[id] = this.listeners[id].filter(match => match !== callback);
      });
    }
  }

  disposeListeners() {
    Object.keys(this.listeners).forEach(key => {
      delete this.listeners[key];
    });

    this.listeners = {};
  }
}

export const VarService = new VarServiceClass();