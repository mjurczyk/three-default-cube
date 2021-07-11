
export const registerGameObject = (object, { gameObjectRefs }) => {
  const { userData } = object;

  if (userData.gameObject) {
    gameObjectRefs[userData.gameObject] = object;
  }
};

export const parseGameObject = (object, parserPayload) => {
  const { userData } = object;
  const { gameObjects } = parserPayload;

  if (userData.gameObject) {
    const gameObjectMap = gameObjects[userData.gameObject];

    if (gameObjectMap) {
      gameObjectMap(object, parserPayload);
    } else {
      console.info('parseGameObject', 'game object type not recognised', userData.gameObject);
    }
  }
};
