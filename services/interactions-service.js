import { MathService } from './math-service';
import { RenderService } from './render-service';
import { UtilsService } from './utils-service';

export const InteractionEnums = {
  eventClick: 'interactionServiceClick',
  eventDrag: 'interactionServiceDrag',
  eventHold: 'interactionServiceHold',
  eventRelease: 'interactionServiceRelease',
  eventLeave: 'interactionServiceLeave',

  stateEnabled: 'interactionServiceEnabled',
  stateHovered: 'interactionServiceStateHovered',
  stateClicked: 'interactionServiceStateClicked',

  stateIntInactive: 0,
  stateIntActive: 2,
  stateIntPending: 1
};

class InteractionsServiceClass {
  listeners = [];
  camera = null;
  pointer = MathService.getVec2();
  delta = MathService.getVec2();
  touches = [];
  useTouch = false;

  init({ camera } = {}) {
    if (window.interactionsService) {
      window.interactionsService.dispose();
    }

    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    window.interactionsService = this;

    this.camera = camera;

    this.addListeners();
  }

  addListeners() {
    const renderer = RenderService.getRenderer();

    renderer.domElement.addEventListener('touchstart', this.onTouchStart);
    renderer.domElement.addEventListener('touchmove', this.onTouchMove);
    renderer.domElement.addEventListener('touchend', this.onTouchEnd);

    renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    renderer.domElement.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown(event) {
    const fauxTouch = { identifier: 'pointer', clientX: event.clientX, clientY: event.clientY };
    event.changedTouches = [fauxTouch];
    event.source = 'pointer';

    this.onTouchStart(event);
  }

  onPointerMove(event) {
    if (this.useTouch) {
      return;
    }

    const fauxTouch = { identifier: 'pointer', clientX: event.clientX, clientY: event.clientY };
    event.changedTouches = [fauxTouch];

    this.onTouchMove(event);
  }

  onPointerUp(event) {
    if (this.useTouch) {
      return;
    }

    const fauxTouch = { identifier: 'pointer', clientX: event.clientX, clientY: event.clientY };
    event.changedTouches = [fauxTouch];

    this.onTouchEnd(event);
  }

  onTouchStart(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.useTouch && event.source !== 'pointer') {
      this.disposePointerListeners();

      this.useTouch = true;
    }
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      this.pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      this.delta.set(0.0, 0.0);

      this.touches[touch.identifier] = { touch: this.pointer.clone(), hits: [], drag: false };

      this.startTouch({ pointer: this.pointer, touch: this.touches[touch.identifier] });
    }
  }

  onTouchMove(event) {
    event.preventDefault();
    event.stopPropagation();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      if (!this.touches[touch.identifier]) {
        continue;
      }

      const { touch: previousTouch } = this.touches[touch.identifier];

      this.delta.set(previousTouch.x, previousTouch.y);

      this.pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      this.delta.set(this.pointer.x - this.delta.x, this.pointer.y - this.delta.y);

      this.moveTouch({ pointer: this.pointer, delta: this.delta, touch: this.touches[touch.identifier] });

      if (this.delta.length() >= 0.015) {
        this.touches[touch.identifier].drag = true;
      }

      this.touches[touch.identifier].touch.copy(this.pointer);
    }
  }

  onTouchEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      if (!this.touches[touch.identifier]) {
        continue;
      }

      this.pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      this.delta.set(0.0, 0.0);

      this.dismissTouch({ pointer: this.pointer, touch: this.touches[touch.identifier] });

      delete this.touches[touch.identifier];
    }
  }

  startTouch({ pointer, touch }) {
    const hits = this.getHits({ pointer });

    hits.forEach(({ object }) => {
      if (object.userData[InteractionEnums.eventHold]) {
        object.userData[InteractionEnums.eventHold]();
      }
    });

    touch.hits = hits;
  }

  dismissTouch({ pointer, touch }) {
    const hits = this.getHits({ pointer });
    let bubbleStopped = false;

    const stopPropagation = () => {
      bubbleStopped = true;
    };

    hits.some(({ object }) => {
      if (bubbleStopped) {
        return true;
      }

      if (object.userData[InteractionEnums.eventRelease]) {
        object.userData[InteractionEnums.eventRelease]({ stopPropagation });
      }
    });

    if (!touch.drag) {
      touch.hits.some(({ object }) => {
        if (bubbleStopped) {
          return true;
        }

        if (object.userData[InteractionEnums.eventClick]) {
          object.userData[InteractionEnums.eventClick]({ stopPropagation });
        }
      });
    }

    touch.hits = [];
    touch.drag = false;
  }

  moveTouch({ pointer, delta, touch }) {
    const hits = this.getHits({ pointer });

    touch.hits.forEach(({ object }) => {
      if (object.userData[InteractionEnums.eventDrag]) {
        object.userData[InteractionEnums.eventDrag]({ deltaX: delta.x, deltaY: delta.y });
      }

      if (object.userData[InteractionEnums.eventLeave]) {
        const stillHit = hits.some(match => match.object.uuid === object.uuid);

        if (!stillHit) {
          object.userData[InteractionEnums.eventLeave]();
        }
      }
    });

    hits.forEach(({ object }) => {
      if (object.userData[InteractionEnums.eventHold]) {
        object.userData[InteractionEnums.eventHold]();
      }
    });

    touch.hits = hits;
  }

  registerListener(target, eventType, callback) {
    target.userData[eventType] = callback;

    if (!target.userData[InteractionEnums.stateEnabled]) {
      target.userData[InteractionEnums.stateEnabled] = true;
      target.userData[InteractionEnums.stateHovered] = InteractionEnums.stateIntInactive;

      this.listeners.push(target);
    }
  }

  registerInvisibleListener(target, eventType, callback) {
    target.userData.interactionsServiceInvisibleListener = true;

    this.registerListener(target, eventType, callback);
  }

  getHits({ pointer }) {
    const raycaster = UtilsService.getRaycaster();

    raycaster.setFromCamera(pointer, this.camera);

    const hits = raycaster.intersectObjects(this.listeners, true);

    UtilsService.releaseRaycaster(raycaster);

    return hits.filter(({ object }, index) => {
      if (object.interactionsServiceInvisibleListener !== true) {
        let visible = true;

        object.traverseAncestors(parent => {
          visible = parent.visible && visible;
        });

        if (!visible) {
          return;
        }
      }

      const nonUniqueHit = hits.findIndex(({ object: searchObject }) => searchObject.uuid === object.uuid);

      return nonUniqueHit === index;  
    });
  }

  disposeListener(target) {
    this.listeners = this.listeners.filter(match => match !== target);
  }

  disposeListeners() {
    this.listeners = this.listeners.filter(object => {
      if (object.userData) {
        Object.keys(object.userData).forEach(key => {
          delete object.userData[key];
        });
      }

      return false;
    });

    this.listeners = [];
  }

  disposePointerListeners() {
    const renderer = RenderService.getRenderer();

    renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
  }

  dispose() {
    const renderer = RenderService.getRenderer();

    renderer.domElement.removeEventListener('touchmove', this.onTouchMove);
    renderer.domElement.removeEventListener('touchstart', this.onTouchStart);
    renderer.domElement.removeEventListener('touchend', this.onTouchEnd);

    this.disposePointerListeners();

    delete this.camera;

    this.listeners = [];
    this.camera = null;
    
    if (this.touches) {
      this.touches.forEach(touch => {
        delete touch.hits;
      });
    }

    this.touches = [];

    if (this.pointer) {
      MathService.releaseVec2(this.pointer);
    }

    this.pointer = MathService.getVec2();

    if (this.delta) {
      MathService.releaseVec2(this.delta);
    }

    this.delta = MathService.getVec2();
  }
}

export const InteractionsService = new InteractionsServiceClass();