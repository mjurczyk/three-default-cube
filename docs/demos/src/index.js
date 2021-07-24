import {
  RenderService,
  SystemService,
  DebugFlags,
  DummyDebug,
  GameInfoService
} from 'three-default-cube';
import { DemoViewsAndScenes } from './game-views/demo-views-and-scenes';
import { DemoCamera } from './game-views/demo-camera';
import { DemoActionsAndUi } from './game-views/demo-actions-and-ui';
import { DemoDebugging } from './game-views/demo-debugging';
import { DemoGameObjects } from './game-views/demo-game-objects';
import { DemoPersistence } from './game-views/demo-persistence';
import { DemoPhysics } from './game-views/demo-physics';
import { DemoAi } from './game-views/demo-ai';
import { DemoUiAlignment } from './game-views/demo-ui-alignment';
const { demoId } = Object.fromEntries(new URLSearchParams(window.location.search).entries());

DummyDebug.on(DebugFlags.DEBUG_ENABLE);

if (demoId === 'debugging') {
  DummyDebug.on(DebugFlags.DEBUG_LIVE);
  DummyDebug.on(DebugFlags.DEBUG_LOG_ASSETS);
  DummyDebug.on(DebugFlags.DEBUG_LOG_MEMORY);
  DummyDebug.on(DebugFlags.DEBUG_LOG_POOLS);
  DummyDebug.on(DebugFlags.DEBUG_STORAGE);
  DummyDebug.on(DebugFlags.DEBUG_TIME_LISTENERS);
}

GameInfoService
  .system(60, 1.0, true, true, 0x000000)
  .camera(50, 0.1, 1000.0)
  .texture('spinner', require('./assets/ui/spinner-default.png'))
  .font('default', require('./assets/ui/font.ttf'))
  .model('intro', require('./assets/models/intro.glb'));

SystemService.init();
SystemService.onReady(async () => {
  const rootElement = document.querySelector('#root');

  RenderService.init({ domElement: rootElement });
  RenderService.renderView(({
    'camera': new DemoCamera(),
    'views-and-scenes': new DemoViewsAndScenes(),
    'actions-and-ui': new DemoActionsAndUi(),
    'debugging': new DemoDebugging(),
    'game-objects': new DemoGameObjects(),
    'persistence': new DemoPersistence(),
    'physics': new DemoPhysics(),
    'ai': new DemoAi(),
    'ui-alignment': new DemoUiAlignment(),
  })[demoId]);

  RenderService.run();
});
