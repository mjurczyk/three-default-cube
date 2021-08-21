// NOTE Template only

export class TemplateSurface {
  constructor(target) {
    this.target = target;

    this.onCreate();
  }

  onCreate() {
    
  }

  onInteraction({ hit } = {}) {
    
  }

  onEnter() {
    
  }

  onLeave() {

  }

  dispose() {
    if (this.target) {
      delete this.target;
    }
  }
}
