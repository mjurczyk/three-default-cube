class InputServiceClass {
  keys = {};

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  key(key) {
    return this.keys[id];
  }

  onKeyDown({ key: pressed }) {
    const id = `${pressed}`.toLowerCase();

    this.keys[id] = true;
  }

  onKeyUp({ key: released }) {
    const id = `${released}`.toLowerCase();

    this.keys[id] = false;
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.keys = {};
  }
}

export const InputService = new InputServiceClass();
