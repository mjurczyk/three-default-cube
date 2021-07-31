import { removePlaceholder } from "../utils/remove-placeholder";
import { isDefined } from "../utils/shared";

export const parseAiSpawn = (object, { aiSpawns }) => {
  const { userData } = object;

  if (isDefined(userData.aiSpawn)) {
    removePlaceholder(object);

    object.visible = false;

    aiSpawns.push(object);
  }
};
