class AiServiceClass {
  aiNodes = [];

  registerAiNode(object) {
    this.aiNodes.push(object);
  }

  getAiNodeById(id) {
    return this.aiNodes.find(node => {
      return node.userData.aiNode === id;
    });
  }

  disposeAiNode(object) {
    this.aiNodes = this.aiNodes.filter(match => match !== object);
  }

  disposeAll() {
    this.aiNodes = [];
  }
}

export const AiService = new AiServiceClass();