export class IntroView extends ViewClass {
    constructor(nextView: any);
    nextView: any;
    showPlaques(queue: any, gameObjectRefs: any): void;
    hidePlaques(plaque: any, queue: any, gameObjectRefs: any): void;
    onPlaquesShown(): void;
}
import { ViewClass } from "../classes/view-class";
