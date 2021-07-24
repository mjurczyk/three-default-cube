---
title: "Getting Started"
draft: false
weight: 1
---

## Culling crazy expectations

* Default Cube projects have to be started using a boilerplate.

The entire framework is dependent on [Ionic](https://ionicframework.com/docs/react/your-first-app) and [Capacitor](https://capacitorjs.com/docs/basics/workflow). It will not work without them - since it's using a lot of their features to make your life easier. The boilerplate setup is described later on.

* Why is there a React dependency?

Default Cube isn't really using React, but `react-scripts` makes deployment a bit faster. In the future it may be removed (the size of the dependency is quite negligable compared to size of game assets anyway.)

* Do I need to know Three.js?

Yep. Default Cube may make the most annoying parts of gamedev easier - but still heavily depends on your Three.js knowledge.

## Setting up a Default Cube game

First, download the [boilerplate](https://github.com/mjurczyk/three-default-cube-boilerplate). Create a directory for it, then install the necessary dependencies (remember to also install the `three-default-cube` library itself):

```cli
$ cd ./my-game-directory
$ npm install
$ npm install three-default-cube
```

Boilerplate contains a sample scene and a general setup. To start the development server use:

```cli
$ npm run start
```

When your game is ready, you can build the web release version using:

```cli
$ npm run build:web
```

Releasing games on other platforms is described [here](/advanced/mobile-platforms).

**Note:** The framework is built mostly using directory-independent singletons (ie. classes that are created only once.) Thanks to that you can structure the game files which ever way you desire.

## Learning Default Cube

Each intro section in the documentation contains an interactive preview of described features. For every preview you can also download the source files and run them locally (this may be especially useful for Blender files, which are the core of Default Cube.)

Next: [Views & Scenes](/intro/views-and-scenes/)
