export class Preloader extends GameObjectClass {
    constructor({ requireAssets, onComplete, spinnerTexture }?: {
        requireAssets: any;
        onComplete: any;
        spinnerTexture: any;
    });
    spinnerTexture: any;
    onLoaded(): void;
}
import { GameObjectClass } from "../../classes/game-object-class";
