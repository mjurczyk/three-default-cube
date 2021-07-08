import * as Three from 'three';
import { MathUtils } from 'three';
import { GameObjectClass } from '../../classes/game-object-class';
import { DebugFlags, DummyDebug } from '../../services/dummy-debug';
import { InteractionEnums, InteractionsService } from '../../services/interactions-service';
import { MathService } from '../../services/math-service';
import { TimeService } from '../../services/time-service';
import { UtilsService } from '../../services/utils-service';
import { getRandomColor } from '../../utils/shared';

export class ScrollList extends GameObjectClass {
  scrollX = false;
  scrollY = true;

  scrollPositionX = 0.0;
  scrollPositionY = 0.0;
  scrollTween = 0.1;
  scrollSpeed = 6.0;
  scrollHitbox = null;
  scrollMaxOffsetX = 0.0;
  scrollMaxOffsetY = 0.0;

  axisX = 'z';
  axisY = 'y';

  constructor({
    scrollSpeed,
    scrollTween
  } = {}) {
    super();

    this.scrollSpeed = scrollSpeed || this.scrollSpeed;
    this.scrollTween = scrollTween || this.scrollTween;

    this.onCreate();
  }

  onCreate() {
    const debugScrollVisible = DummyDebug.get(DebugFlags.DEBUG_SCROLL_VISIBLE);

    GameObjectClass.prototype.onCreate.call(this);
    this.scrollHitbox = new Three.Mesh(
      new Three.BoxBufferGeometry(1.0, 1.0, 1.0),
      new Three.MeshBasicMaterial({
        color: getRandomColor(),
        opacity: debugScrollVisible ? 0.5 : 1.0,
        transparent: debugScrollVisible
      })
    );
    this.scrollHitbox.visible = debugScrollVisible;

    this.add(this.scrollHitbox);

    TimeService.registerFrameListener(() => {
      if (this.scrollX) {
        if (this.scrollPositionX < 0.0) {
          this.scrollPositionX = MathUtils.lerp(this.scrollPositionX, 0.0, this.scrollTween);
        }

        if (this.scrollPositionX > this.scrollMaxOffsetX) {
          this.scrollPositionX = MathUtils.lerp(this.scrollPositionX, this.scrollMaxOffsetX, this.scrollTween);
        }

        this.position[this.axisX] = MathUtils.lerp(this.position[this.axisX], this.scrollPositionX, this.scrollTween);
      }

      if (this.scrollY) {
        if (this.scrollPositionY < 0.0) {
          this.scrollPositionY = MathUtils.lerp(this.scrollPositionY, 0.0, this.scrollTween);
        }

        if (this.scrollPositionY > this.scrollMaxOffsetY) {
          this.scrollPositionY = MathUtils.lerp(this.scrollPositionY, this.scrollMaxOffsetY, this.scrollTween);
        }

        this.position[this.axisY] = MathUtils.lerp(this.position[this.axisY], this.scrollPositionY, this.scrollTween);
      }
    });
  }

  add(object) {
    InteractionsService.registerListener(
      object,
      InteractionEnums.eventDrag,
      ({ deltaX, deltaY }) => {
        if (this.scrollX) {
          this.scrollPositionX -= deltaX * this.scrollSpeed;
        }

        if (this.scrollY) {
          this.scrollPositionY += deltaY * this.scrollSpeed;
        }
      }
    );

    Three.Group.prototype.add.call(this, object);

    if (object.id === this.scrollHitbox.id) {
      return;
    }

    const boundingBox = UtilsService.getBox3();

    this.remove(this.scrollHitbox);
    boundingBox.setFromObject(this);
    this.add(this.scrollHitbox);

    const geometryCentre = MathService.getVec3(0.0, 0.0, 0.0, 'scroll-list-1');
    boundingBox.getCenter(geometryCentre);
    this.scrollHitbox.position.copy(geometryCentre);
    MathService.releaseVec3(geometryCentre);

    const geometrySize = MathService.getVec3(0.0, 0.0, 0.0, 'scroll-list-2');
    boundingBox.getSize(geometrySize);
    this.scrollHitbox.scale.copy(geometrySize);

    this.scrollMaxOffsetX = geometrySize.x * 0.75;
    this.scrollMaxOffsetY = geometrySize.y * 0.75;

    MathService.releaseVec3(geometrySize);

    this.scrollPositionX = 0.0;
    this.scrollPositionY = 0.0;

    UtilsService.releaseBox3(boundingBox);
  }
}
