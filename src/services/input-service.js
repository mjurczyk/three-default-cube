class InputServiceClass {
  keys = {};
  inputListeners = [];

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  key(id) {
    return this.keys[id];
  }

  onKeyDown({ key: pressed }) {
    const id = `${pressed}`.toLowerCase();

    if (this.keys[id] !== true) {
      this.onChange(id, true);
    }

    this.keys[id] = true;
  }

  onKeyUp({ key: released }) {
    const id = `${released}`.toLowerCase();

    if (this.keys[id] !== false) {
      this.onChange(id, false);
    }

    this.keys[id] = false;
  }

  onChange(key, status) {
    this.inputListeners.forEach(listener => {
      listener({ key, status });
    });
  }

  registerListener(listener) {
    this.inputListeners.push(listener);
  }

  disposeAll() {
    this.inputListeners = [];
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.keys = {};
    this.inputListeners = [];
  }
}

export const InputService = new InputServiceClass();
