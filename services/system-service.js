/* global cordova */
import { Plugins } from '@capacitor/core';
import { NavigationBar } from '@ionic-native/navigation-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { StorageService } from './storage-service';
import { DebugFlags, DummyDebug } from './dummy-debug';

const { App, StatusBar } = Plugins;

class SystemServiceClass {
  isCordova = false;
  appStateListeners = [];

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

    if (DummyDebug.get(DebugFlags.DEBUG_ENABLE)) {
      DummyDebug.showStats();
    }

    if (DummyDebug.get(DebugFlags.DEBUG_LIVE)) {
      DummyDebug.showLogs();
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

    if (this.isCordova) {
      document.addEventListener('deviceready', then, false);
    } else {
      then();
    }
  }

  disposeAll() {
    this.appStateListeners = [];
  }
}

export const SystemService = new SystemServiceClass();