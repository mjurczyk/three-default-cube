import * as Three from 'three';
import { GameObjectClass } from '../../../classes/game-object-class';
import { Text as TroikaText } from 'troika-three-text';
import { RenderService } from '../../../services/render-service';

export class Text extends GameObjectClass {
  troikaText = null;

  constructor({
    font,
    color,
    textAlign,
    fontSize,
    text,
    outlineWidth,
    outlineColor,
    alwaysOnTop
  } = {}) {
    super();

    if (RenderService.isHeadless) {
      this.troikaText = new Three.Group();
      this.troikaText.text = '';
      this.troikaText.color = new Three.Color(0x000000);
      this.troikaText.sync = () => {};
      this.add(this.troikaText);

      return;
    }
    
    const troikaText = new TroikaText();
    troikaText.font = font;
    troikaText.text = text;
    troikaText.anchorX = textAlign || 'center';
    troikaText.textAlign = textAlign || 'center';
    troikaText.fontSize = fontSize || 1.0;
    troikaText.material.transparent = true;
    troikaText.color = new Three.Color(color || '#ffffff');

    if (alwaysOnTop) {
      troikaText.renderOrder = Number.MAX_SAFE_INTEGER;
      troikaText.material.depthTest = false;
    }

    if (outlineWidth) {
      troikaText.outlineWidth = `${outlineWidth}%`;
      troikaText.outlineColor = new Three.Color(outlineColor || '#000000');
    }

    troikaText.sync();

    this.troikaText = troikaText;

    this.add(troikaText);
  }
}
