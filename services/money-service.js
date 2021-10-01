import { Plugins } from '@capacitor/core';
import { AdSize, AdPosition } from '@capacitor-community/admob';
import { VarService } from './var-service';
import { StorageService } from './storage-service';
import { DebugFlags, DummyDebug } from './dummy-debug';
import { GameInfoService } from './game-info-service';

const { AdMob, Modals } = Plugins;

class MoneyServiceClass {
  platformId = null;
  adsInitialised = false;

  constructor() {
    this.platformId = GameInfoService.config.system.adMobId;
  }

  async init() {
    return AdMob.initialize({
      requestTrackingAuthorization: false,
    }).then(() => {
      this.adsInitialised = true;
    });
  }

  async showAd(then = () => {}) {
    if (!this.adsInitialised) {
      await this.init();
    }
  
    const options = {
      adId: this.platformAdId,
      adSize: AdSize.FLUID,
      position: AdPosition.CENTER
    };

    return new Promise(resolve => {
      AdMob.addListener('onInterstitialAdFailedToLoad', (info) => {
        then();

        resolve();
      });

      AdMob.addListener('onInterstitialAdClosed', (info) => {
        then();

        resolve();
      });

      AdMob.addListener('onInterstitialAdLeftApplication', (info) => {
        then();

        resolve();
      });

      AdMob.prepareInterstitial(options).then(() => {
        AdMob.showInterstitial();
      }).catch(() => {
        then();

        resolve();
      });
    });
  }
}

export const MoneyService = new MoneyServiceClass();
