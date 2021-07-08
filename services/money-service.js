import { Plugins } from '@capacitor/core';
import { AdSize, AdPosition } from '@capacitor-community/admob';
import { VarService } from './var-service';
import { StorageService } from './storage-service';
import { DebugFlags, DummyDebug } from './dummy-debug';
import { GameInfoService } from './game-info-service';

const { AdMob, Modals } = Plugins;

class MoneyServiceClass {
  platformId = null;
  adsStoredResponse = null;
  adsInitialised = false;
  adsDisabled = false;

  constructor() {
    this.platformId = GameInfoService.config.system.adMobId;
  }

  async init() {
    if (this.adsStoredResponse === null) {
      const adsEnabled = VarService.getVar('optionsAdsEnabled');

      if (!adsEnabled) {
        this.adsStoredResponse = false;
      } else {
        this.adsStoredResponse = await StorageService.get('optionsAdsEnabled');
      }
    }

    let allowAds;

    if (this.adsStoredResponse !== null) {
      allowAds = this.adsStoredResponse;
    } else {
      if (DummyDebug.get(DebugFlags.DEBUG_DISABLE_ADS)) {
        allowAds = false;
      } else {
        allowAds = (await Modals.confirm({
          title: VarService.getVar('strAllowAdsModalTitle'),
          message: VarService.getVar('strAllowAdsModalBody')
        })).value;
      }

      StorageService.set('optionsAdsEnabled', allowAds);
    }

    if (!allowAds) {
      this.adsDisabled = true;
      this.adsInitialised = true;

      return Promise.resolve();
    }

    return AdMob.initialize({
      requestTrackingAuthorization: false,
    }).then(() => {
      this.adsInitialised = true;
    });
  }

  toggleAds() {
    this.adsDisabled = !this.adsDisabled;

    VarService.setVar('optionsAdsEnabled', !this.adsDisabled);
    StorageService.set('optionsAdsEnabled', !this.adsDisabled);

    return !this.adsDisabled;
  }

  async showAd(then = () => {}) {
    if (!this.adsInitialised) {
      await this.init();

      return then();
    }

    if (this.adsDisabled) {
      return then();
    }
  
    const options = {
      adId: this.platformAdId,
      adSize: AdSize.FLUID,
      position: AdPosition.CENTER
    };

    AdMob.addListener('onInterstitialAdFailedToLoad', (info) => {
      then();
    });

    AdMob.addListener('onInterstitialAdClosed', (info) => {
      then();
    });

    AdMob.addListener('onInterstitialAdLeftApplication', (info) => {
      then();
    });

    AdMob.prepareInterstitial(options).then(() => {
      AdMob.showInterstitial();
    }).catch(() => {
      then();
    });
  }
}

export const MoneyService = new MoneyServiceClass();
