import * as Colyseus from 'colyseus.js';
import { GameInfoService } from './game-info-service';
import { TimeService } from './time-service';
import { RenderService } from './render-service';
import { SpawnService } from './spawn-service';
import { MathService } from './math-service';

export const NetworkEnums = {
  statusSingleplayer: 'offline',
  statusConnecting: 'connecting',
  statusNotConnected: 'not-connected',
  statusConnected: 'connected',
  statusServing: 'server',

  modeClient: 'client',
  modeServer: 'server'
};

export const NetworkServerSideInstanceUserAgent = 'dqServerInstanceUserAgent';

class NetworkServiceClass {
  mode = NetworkEnums.modeClient;
  client = null;
  game = null;
  clientId = null;
  isMultiplayer = false;
  status = NetworkEnums.statusSingleplayer;
  syncObjects = {};

  ping = Infinity;
  lastTimestamp = performance.now();

  networkActionsListeners = {};

  connectAsClient() {
    const client = new Colyseus.Client(GameInfoService.config.network.serverAddress);
    this.status = NetworkEnums.statusConnecting;
    this.isMultiplayer = true;

    client.joinOrCreate('dqGame')
      .then(this.handleGameConnection.bind(this))
      .catch(error => {
        console.warn('NetworkServiceClass', 'connect', { error });

        this.status = NetworkEnums.statusNotConnected;
        this.ping = Infinity;
      });

    this.client = client;
  }

  handleGameConnection(game) {
    this.status = NetworkEnums.statusConnected;
    this.clientId = game.sessionId;
    this.game = game;

    game.onMessage('ping', (timestamp) => {
      this.ping = ~~(timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;
    });

    game.onStateChange(state => {
      const serverPosition = MathService.getVec3();
      const serverQuaternion = MathService.getQuaternion();

      const localPosition = MathService.getVec3();
      const localQuaternion = MathService.getQuaternion();
      state.syncObjects.forEach((syncObject, key) => {
        const {
          gameObject,
          positionX,
          positionY,
          positionZ,
          quaternionX,
          quaternionY,
          quaternionZ,
          quaternionW,
          userData,
        } = syncObject;

        if (!gameObject && !this.syncObjects[key]) {
          return;
        }

        if (!this.syncObjects[key]) {
          const object = SpawnService.createSpawnableGameObject(gameObject, userData ? (JSON.parse(userData) || {}) : {});
          const scene = RenderService.getScene();

          console.info('NetworkService', 'handleGameConnection', 'syncObject does not exist, creating', { key, gameObject, createdObject: object });

          if (object) {
            this.syncObjects[key] = object;

            scene.add(object);
          } else {
            return;
          }
        }

        let target;

        // NOTE Physical objects are controlled by their cannon bodies - sync cannon when possible
        if (this.syncObjects[key].userData && this.syncObjects[key].userData.cannonRef) {
          target = this.syncObjects[key].userData.cannonRef;
        } else {
          target = this.syncObjects[key];
        }

        serverPosition.set(positionX, positionY, positionZ);
        serverQuaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);

        const { x: px, y: py, z: pz } = target.position;
        localPosition.set(px, py, pz);

        const { x: qx, y: qy, z: qz, w: qw } = target.quaternion;
        localQuaternion.set(qx, qy, qz, qw);

        localPosition.lerp(serverPosition, 0.5);
        localQuaternion.slerp(serverQuaternion, 0.5);

        target.position.set(localPosition.x, localPosition.y, localPosition.z);
        target.quaternion.set(localQuaternion.x, localQuaternion.y, localQuaternion.z, localQuaternion.w);

        target.userData = userData ? (JSON.parse(userData) || {}) : {};
      });

      MathService.releaseVec3(serverPosition);
      MathService.releaseQuaternion(serverQuaternion);
      MathService.releaseVec3(localPosition);
      MathService.releaseQuaternion(localQuaternion);
    });

    game.onError(() => {
      console.warn('NetworkServiceClass', 'handleGameConnection', { game, error });

      this.status = NetworkEnums.statusNotConnected;
      this.ping = Infinity;
    });

    game.onLeave(() => {
      this.status = NetworkEnums.statusNotConnected;
      this.ping = Infinity;
    });
  }

  send(action, payload) {
    if (!this.game) {
      return;
    }

    this.game.send(action, payload);
  }

  connectAsServer() {
    this.mode = NetworkEnums.modeServer;
    this.status = NetworkEnums.statusServing;
    this.ping = 0;
    this.isMultiplayer = !!GameInfoService.config.network.serverAddress;

    TimeService.registerPersistentFrameListener(() => {
      if (typeof window.dqSendToServer === 'undefined') {
        return;
      }

      window.dqSendToServer('sync', { syncObjects: this.syncObjects });
    });

    const dqReceiveFromServer = (action, payload) => {
      if (this.networkActionsListeners[action]) {
        this.networkActionsListeners[action].forEach(listener => {
          listener(payload);
        });
      }
    };

    window.dqSendToGame = (action, payload) => dqReceiveFromServer(action, payload);
  }

  registerServerActionListener(action, listener) {
    if (!this.isMultiplayer) {
      return;
    }

    if (!this.networkActionsListeners[action]) {
      this.networkActionsListeners[action] = [];
    }

    this.networkActionsListeners[action].push(listener);
  }

  registerClientHandler(listener) {
    if (!this.isMultiplayer || this.mode === NetworkEnums.modeServer) {
      return;
    }

    listener();
  }

  syncPropNames = ['position', 'quaternion', 'gameObject', 'userData'];

  registerSyncObject(target) {
    if (!target.name) {
      console.warn('NetworkServiceClass', 'registerSyncObject', 'sync object missing a name, assign name before registering as SyncObject', target);
      return;
    }

    if (this.syncObjects[target.name]) {
      console.warn('NetworkServiceClass', 'registerSyncObject', 'attempting to register two objects with the same name', { original: this.syncObjects[target.name], new: target });
      return;
    }

    console.info('NetworkServiceClass', 'registerSyncObject', 'sync new object', { target });

    this.syncObjects[target.name] = {};

    this.syncPropNames.forEach(name => {
      this.syncObjects[target.name][name] = target[name];
    });
  }

  disposeSyncObject(target) {
    if (this.syncObjects[target.name]) {
      delete this.syncObjects[target.name];
    }
  }

  disposeAll() {
    this.syncObjects = {};

    this.networkActionsListeners = {};
  }
}

export const NetworkService = new NetworkServiceClass();
