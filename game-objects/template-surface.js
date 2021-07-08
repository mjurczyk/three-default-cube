export class TemplateSurface {
  constructor(target) {
    this.target = target;

    this.onCreate();
  }

  onCreate() {
    
  }

  onInteraction({ hit } = {}) {
    
  }

  dispose() {
    if (this.target) {
      delete this.target;
    }
  }
}
