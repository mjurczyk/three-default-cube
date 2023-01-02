// NOTE Core functionality
import * as _Three from 'three';

export * from './classes/game-object-class';
export * from './classes/view-class';

export * from './scene-parsers/navmap';
export * from './scene-parsers/rotate-xyz';
export * from './scene-parsers/scroll';
export * from './scene-parsers/shader';
export * from './scene-parsers/shading';
export * from './scene-parsers/slideshow';
export * from './scene-parsers/surface';
export * from './scene-parsers/template';
export * from './scene-parsers/if';
export * from './scene-parsers/if-not';
export * from './scene-parsers/label';
export * from './scene-parsers/material';

export * from './services/ai-service';
export * from './services/animation-service';
export * from './services/assets-service';
export * from './services/audio-service';
export * from './services/camera-service';
export * from './services/debug-service';
export * from './services/game-info-service';
export * from './services/input-service';
export * from './services/interactions-service';
export * from './services/math-service';
export * from './services/parser-service';
export * from './services/particle-service';
export * from './services/physics-service';
export * from './services/render-service';
export * from './services/scene-service';
export * from './services/storage-service';
export * from './services/system-service';
export * from './services/time-service';
export * from './services/ui-service';
export * from './services/utils-service';
export * from './services/var-service';

export * from './utils/constants';
export * from './utils/helpers';
export * from './utils/materials';
export * from './utils/remove-placeholder';
export * from './utils/replace-placeholder';
export * from './utils/screen-size';
export * from './utils/shared';

// NOTE Extra helpers

export * from './extras/game-objects/built-in/ai-wrapper';
export * from './extras/game-objects/built-in/animation-wrapper';
export * from './extras/game-objects/built-in/physics-wrapper';
export * from './extras/game-objects/built-in/preloader';
export * from './extras/game-objects/built-in/scroll-list';
export * from './extras/game-objects/built-in/skinned-game-object';
export * from './extras/game-objects/built-in/text';

// NOTE Export internal Three.js instance

export const Three = _Three;
