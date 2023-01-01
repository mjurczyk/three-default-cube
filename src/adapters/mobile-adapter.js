import { Plugins } from '@capacitor/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { NavigationBar } from '@ionic-native/navigation-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

const { App, StatusBar } = Plugins;

export const MobileAdapterConstants = {
  screenOrientation: {
    landscape: ScreenOrientation.ORIENTATIONS.LANDSCAPE,
    portrait: ScreenOrientation.ORIENTATIONS.PORTRAIT
  }
};

class MobileAdapterClass {
  appStateListeners = [];

  constructor() {
    App.addListener('appStateChange', (state) => {
      this.appStateListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(state);
        }
      });
    });
  }

  isMobile() {
    return typeof cordova !== 'undefined';
  }

  getNativeStorage() {
    return {
      keys: NativeStorage.keys,
      getItem: NativeStorage.getItem,
      setItem: NativeStorage.setItem
    };
  }

  getNavigationBar() {
    return {
      hide: () => {
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
    };
  }

  getScreenOrientation() {
    return {
      lock: (orientation) => ScreenOrientation.lock(orientation)
    };
  }

  disposeAll() {
    this.appStateListeners = [];
  }
}

export const MobileAdapter = new MobileAdapterClass();
