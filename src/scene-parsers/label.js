import { Text } from "../extras/game-objects/built-in/text";
import { MathService } from "../services/math-service";
import { VarService } from "../services/var-service";
import { replacePlaceholder } from "../utils/replace-placeholder";
import { AssetsService } from "../services/assets-service";
import { GameInfoService } from "../services/game-info-service";
import { isDefined } from "../utils/shared";

export const parseLabel = (object) => {
  const { userData } = object;

  if (isDefined(userData.label)) {
    const label = new Text({
      font: GameInfoService.config.fonts[userData.labelFont] || GameInfoService.config.fonts.default,
      fontSize: userData.labelSize || 1.0,
      textAlign: userData.labelAlign || 'center',
      color: '#ffffff',
      outlineWidth: userData.labelOutlineColor ? 5.0 : 0.0,
      outlineColor: userData.labelOutlineColor || '#000000',
      alwaysOnTop: userData.labelAlwaysOnTop,
      text: ''
    });

    VarService.resolveVar(
      userData.label,
      (value) => {
        label.troikaText.text = value;
        label.troikaText.sync();
      },
      (listener) => {
        AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.label, listener));
      }
    );

    VarService.resolveVar(
      userData.labelColor,
      (value) => {
        label.troikaText.color.set(value || '#ffffff');
        label.troikaText.sync();
      },
      (listener) => {
        AssetsService.registerDisposeCallback(object, () => VarService.disposeListener(userData.labelColor, listener));
      }
    );

    const positionOffset = MathService.getVec3(0.0, 0.5 * (userData.labelSize || 1.0), 0.0, 'var-label-1');
    object.position.add(positionOffset);
    MathService.releaseVec3(positionOffset);

    object.userData.troikaRef = label.troikaText;

    replacePlaceholder(object, label);
  }
};
