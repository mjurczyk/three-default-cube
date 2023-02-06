import { StorageService } from './storage-service';
import { DebugFlags, DebugService } from './debug-service';
import { VarService } from './var-service';
import { RenderService } from './render-service';
import { GameInfoService } from './game-info-service';
import { MobileAdapter, MobileAdapterConstants } from '../adapters/mobile-adapter';
import { NetworkEnums, NetworkServerSideInstanceUserAgent, NetworkService } from './network-service';

class SystemServiceClass {
  promised = [];

  init({ statusBar } = {}) {
    if (navigator.userAgent.includes(NetworkServerSideInstanceUserAgent)) {
      NetworkService.connectAsServer();
      return;
    }

    StorageService.init();

    if (statusBar !== true) {
      SystemService.hideStatusBar();
    }

    if (DebugService.get(DebugFlags.DEBUG_ENABLE)) {
      DebugService.showStats();
    }

    this.promised.push(VarService.retrievePersistentVars());

    if (GameInfoService.config.system.postprocessing) {
      this.promised.push(RenderService.createSMAATextures());
    }

    if (GameInfoService.config.network.serverAddress) {
      this.promised.push(NetworkService.connectAsClient());
    }

    if (MobileAdapter.isMobile()) {
      this.promised.push(new Promise((resolve) => {
        document.addEventListener('deviceready', () => resolve(), false);
      }));
    }
  }

  hideStatusBar() {
    MobileAdapter.getNavigationBar().hide();
  }

  lockOrientation(orientation = MobileAdapterConstants.screenOrientation.landscape) {
    if (MobileAdapter.isMobile()) {
      MobileAdapter.getScreenOrientation().lock(orientation);
    }
  }

  onReady(then) {
    if (!then) {
      return;
    }

    Promise.all(this.promised).then(() => {
      then();
    });
  }

  disposeAll() {
    MobileAdapter.disposeAll();
  }
}

export const SystemService = new SystemServiceClass();