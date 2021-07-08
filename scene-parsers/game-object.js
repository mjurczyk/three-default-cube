
export const registerGameObject = (object, { gameObjectRefs }) => {
  const { userData } = object;

  if (userData.gameObject) {
    gameObjectRefs[userData.gameObject] = object;
  }
};

export const parseGameObject = (object, { scene, gameObjects }) => {
  const { userData } = object;

  if (userData.gameObject) {
    const gameObjectMap = gameObjects[userData.gameObject];

    if (gameObjectMap) {
      gameObjectMap(object, { scene });
    } else {
      console.info('parseGameObject', 'game object type not recognised', userData.gameObject);
    }
  }
};
