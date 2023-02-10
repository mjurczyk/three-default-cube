// NOTE See DOCS.md for userData declarations

import { parseCamera } from '../scene-parsers/camera';
import { parseAction } from '../scene-parsers/action';
import { parseLabel } from '../scene-parsers/label';
import { parseScroll } from '../scene-parsers/scroll';
import { parseIf } from '../scene-parsers/if';
import { parseIfNot } from '../scene-parsers/if-not';
import { parseRotateXYZ } from '../scene-parsers/rotate-xyz';
import { parseMaterial } from '../scene-parsers/material';
import { parseAnimation } from '../scene-parsers/animation';
import { parseCacheMaterial } from '../scene-parsers/cache-material';
import { parseFullscreen } from '../scene-parsers/fullscreen';
import { parseGameObject, registerGameObject } from '../scene-parsers/game-object';
import { parseAiNode } from '../scene-parsers/ai-node';
import { parseAiSpawn } from '../scene-parsers/ai-spawn';
import { parseShader } from '../scene-parsers/shader';
import { parseNavmap } from '../scene-parsers/navmap';
import { parseAlign } from '../scene-parsers/align';
import { parseSlideshow } from '../scene-parsers/slideshow';
import { parseSurface } from '../scene-parsers/surface';
import { parseShading } from '../scene-parsers/shading';
import { RenderService } from './render-service';
import { parseLeft } from '../scene-parsers/left';
import { parseRight } from '../scene-parsers/right';
import { parseTop } from '../scene-parsers/top';
import { parseBottom } from '../scene-parsers/bottom';
import { parseLandscape } from '../scene-parsers/landscape';
import { parsePhysics } from '../scene-parsers/physics';
import { parsePhysicsRope } from '../scene-parsers/physics-rope';

class ParserServiceClass {
  parseModel({
    target,
    navpath,
    actions,
    gameObjects,
    onCreate
  }) {
    const garbageCollector = [];
    const children = [];
    const scrollLists = {};
    const gameObjectRefs = {};
    const aiNodes = [];
    const aiSpawns = [];

    const parserPayload = {
      scene: target,
      scrollLists,
      actions: actions || {},
      gameObjects: gameObjects || {},
      gameObjectRefs: gameObjectRefs,
      aiNodes: aiNodes,
      aiSpawns: aiSpawns,
      children: children,
    };

    target.traverse(child => {
      if (navpath && child.userData && typeof child.userData.navpath !== 'undefined' && child.userData.navpath !== navpath) {
        garbageCollector.push(child);

        return;
      }

      children.push(child);
    });

    garbageCollector.forEach(child => {
      child.parent.remove(child);
    });

    // NOTE Parsers caching and registering scene objects
    children.forEach(child => {
      registerGameObject(child, parserPayload);

      parseCamera(child, parserPayload);
      parseAction(child, parserPayload);
      parseScroll(child, parserPayload);
      parseCacheMaterial(child, parserPayload);
      parseAiNode(child, parserPayload);
      parseAiSpawn(child, parserPayload);
      parseNavmap(child, parserPayload);
      parseSurface(child, parserPayload);
      parsePhysics(child, parserPayload);
    });

    // NOTE Parsers potentially consuming scene objects
    children.forEach(child => {
      parsePhysicsRope(child, parserPayload);
      parseShader(child, parserPayload);
      parseLandscape(child, parserPayload);
      parseAnimation(child, parserPayload);
      parseGameObject(child, parserPayload);
      parseLabel(child, parserPayload);
      parseIf(child, parserPayload);
      parseIfNot(child, parserPayload);
      parseMaterial(child, parserPayload);
      parseShading(child, parserPayload);
      parseAlign(child, parserPayload);
      parseLeft(child, parserPayload);
      parseRight(child, parserPayload);
      parseTop(child, parserPayload);
      parseBottom(child, parserPayload);
      parseSlideshow(child, parserPayload);
      parseRotateXYZ(child, parserPayload);
      parseFullscreen(child, parserPayload);
    });
  
    Object.keys(scrollLists).forEach(key => {
      delete scrollLists[key];
    });
  
    if (onCreate) {
      onCreate(parserPayload);
    }

    const renderer = RenderService.getRenderer();

    if (renderer) {
      renderer.compile(RenderService.getScene(), RenderService.getNativeCamera());
    }
  }
}

export const ParserService = new ParserServiceClass();