import { isDefined } from "../utils/shared";

export const registerGameObject = (object, { gameObjectRefs }) => {
  const { userData } = object;

  if (isDefined(userData.gameObject)) {
    gameObjectRefs[userData.gameObject] = object;
  }
};

export const parseGameObject = (object, parserPayload) => {
  const { userData } = object;
  const { gameObjects } = parserPayload;

  if (isDefined(userData.gameObject)) {
    const gameObjectMap = gameObjects[userData.gameObject];

    if (gameObjectMap) {
      gameObjectMap(object, parserPayload);
    } else {
      console.info('parseGameObject', 'game object type not recognised', userData.gameObject);
    }
  }
};
