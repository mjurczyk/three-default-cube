export class ScrollList extends GameObjectClass {
    constructor({ scrollSpeed, scrollTween }?: {
        scrollSpeed: any;
        scrollTween: any;
    });
    scrollX: boolean;
    scrollY: boolean;
    scrollPositionX: number;
    scrollPositionY: number;
    scrollTween: number;
    scrollSpeed: number;
    scrollHitbox: any;
    scrollMaxOffsetX: number;
    scrollMaxOffsetY: number;
    axisX: string;
    axisY: string;
    add(object: any): void;
}
import { GameObjectClass } from "../../classes/game-object-class";
