export class SkinnedGameObject extends GameObjectClass {
    mixer: any;
    mixerActions: {};
    mixerClips: any[];
    playAnimation(name: any, tweenDuration?: number): void;
    stopAnimation(name: any, tweenDuration?: number): void;
    blendInAnimation(name: any, blendWeight?: number): void;
    playAllAnimations(tweenDuration?: number): void;
    stopAllAnimations(tweenDuration?: number): void;
}
import { GameObjectClass } from "../../classes/game-object-class";
