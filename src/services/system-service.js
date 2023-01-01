/* global cordova */
import { Plugins } from '@capacitor/core';
import { NavigationBar } from '@ionic-native/navigation-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { StorageService } from './storage-service';
import { DebugFlags, DebugService } from './debug-service';
import { VarService } from './var-service';
import { RenderService } from './render-service';
import { GameInfoService } from './game-info-service';

const { App, StatusBar } = Plugins;

class SystemServiceClass {
  isCordova = false;
  appStateListeners = [];
  promised = [];

  constructor() {
    this.isCordova = typeof cordova !== 'undefined';
  }

  init({ statusBar } = {}) {
    StorageService.init();

    App.addListener('appStateChange', (state) => {
      this.appStateListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(state);
        }
      });
    });

    if (statusBar !== true) {
      SystemService.hideStatusBar();
    }

    if (DebugService.get(DebugFlags.DEBUG_ENABLE)) {
      DebugService.showStats();
    }

    if (DebugService.get(DebugFlags.DEBUG_LIVE)) {
      DebugService.showLogs();
    }

    this.promised.push(VarService.retrievePersistentVars());

    if (GameInfoService.config.system.postprocessing) {
      this.promised.push(RenderService.createSMAATextures());
    }

    if (this.isCordova) {
      this.promised.push(new Promise((resolve) => {
        document.addEventListener('deviceready', () => resolve(), false);
      }));
    }
  }

  hideStatusBar() {
    try {
      NavigationBar.setUp(true);
      
      setTimeout(() => {
        StatusBar.hide();
        StatusBar.setOverlaysWebView(false);
      }, 500);

      this.appStateListeners.push(({ isActive }) => {
        if (isActive) {
          StatusBar.hide();
        }
      });
    } catch {}
  }

  lockOrientation(orientation = ScreenOrientation.ORIENTATIONS.LANDSCAPE) {
    if (this.isCordova) {
      ScreenOrientation.lock(orientation);
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
    this.appStateListeners = [];
  }
}

export const SystemService = new SystemServiceClass();