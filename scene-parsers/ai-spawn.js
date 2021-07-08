import { removePlaceholder } from "../utils/remove-placeholder";

export const parseAiSpawn = (object, { aiSpawns }) => {
  const { userData } = object;

  if (userData.aiSpawn) {
    removePlaceholder(object);

    object.visible = false;

    aiSpawns.push(object);
  }
};
