---
title: "Mobile Platforms"
draft: false
weight: 11
---

## Android

To release a game on Android, consider following Ionic / Capacitor release process.

General overview:

1. Create the game.
2. Install Android Studio.
3. If platform hasn't been added yet, add it:

```cli
$ npm add android
```

4. Build an Android project:

```cli
$ cordova-res android --skip-config --copy
$ ionic cap build android
# For consecutive updates, you can also use "ionic cap copy android"
```

5. In Android Studio, either run a development preview of the game, or build the project as an Android App Bundle to release it.

**Note:** Google Play store has a app size limit of 150MB. If your game assets exceed this limit, you can use [this guide](https://developer.android.com/guide/playcore/asset-delivery/integrate-java) or see below.

## Android - Bundling Game Asseets

1. Create and move assets to separate module in Android Studio (ex. `assetspack`, don't use dashes in the module name.)
2. Replicate structure of the original module (ie. put assets in `assetpack/src/main/assets/public/static/media`.) Be sure to remove the assets from the original module.
4. Add `build.gradle` file to the `assetspack`:

```txt
apply plugin: 'com.android.asset-pack'

assetPack {
    packName = "assetpack"
    dynamicDelivery {
        deliveryType = "install-time"
    }
}
```

5. Add `assetspack` reference to the `build.gradle` of the original module (remember to prefix the name with a `:`):

```txt
apply plugin: 'com.android.application'

android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    // ...

    assetPacks = [ ":assetpack" ]
}

repositories {
    // ...
}
```

6. Include `assetpack` reference in `settings.gradle`:

```txt
include ':app'
include ':capacitor-cordova-android-plugins'
project(':capacitor-cordova-android-plugins').projectDir = new File('./capacitor-cordova-android-plugins/')
include ':assetpack'

apply from: 'capacitor.settings.gradle'
```

7. Update the app version in the original module `build.gradle` (increment both `versionCode` and `versionName`.)

8. Build project using `Build -> Generate Signed App Bundle`.

## iOS

To release a game on iOS, consider following Ionic / Capacitor release process.

General overview:

1. Create the game.
2. Make sure you have the latest version of XCode installed (MacOS is required to build iOS apps.)
3. If platform hasn't been added yet, add it:

```cli
$ npm add ios
```

4. Build an iOS project:

```cli
$ cordova-res ios --skip-config --copy
$ ionic cap build ios
# For consecutive updates, you can also use "ionic cap copy ios"
```

5. Run XCode and test the app in the emulator or remote device. To release the app, prepare the bundle and upload it to an active AppStore distribution account.

