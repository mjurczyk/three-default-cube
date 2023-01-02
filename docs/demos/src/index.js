import {
  RenderService,
  SystemService,
  DebugFlags,
  DebugService,
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
import { DemoChessBoardView } from './game-views/demo-example-chess-board';
const { demoId } = Object.fromEntries(new URLSearchParams(window.location.search).entries());

DebugService.on(DebugFlags.DEBUG_ENABLE);

if (demoId === 'debugging' || !demoId) {
  DebugService.on(DebugFlags.DEBUG_LIVE);
  DebugService.on(DebugFlags.DEBUG_LOG_ASSETS);
  DebugService.on(DebugFlags.DEBUG_LOG_MEMORY);
  DebugService.on(DebugFlags.DEBUG_LOG_POOLS);
  DebugService.on(DebugFlags.DEBUG_STORAGE);
  DebugService.on(DebugFlags.DEBUG_TIME_LISTENERS);
}

GameInfoService
  .system(null, window.devicePixelRatio, true, false, 0x000000)
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
    'example-chess-board': new DemoChessBoardView(),
  })[demoId || 'camera']);

  RenderService.run();
});
