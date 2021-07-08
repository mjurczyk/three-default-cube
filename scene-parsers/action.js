import { AssetsService } from "../services/assets-service";
import { InteractionEnums, InteractionsService } from "../services/interactions-service";

export const parseAction = (object, { actions, scene }) => {
  const { userData } = object;

  if (userData.action) {
    const actionCallback = actions[userData.action];

    if (typeof actionCallback === 'function') {
      InteractionsService.registerListener(
        object,
        InteractionEnums.eventClick,
        ({ stopPropagation } = {}) => {
          actionCallback(object, { scene, stopPropagation });
        }
      );

      AssetsService.registerDisposeCallback(object, () => InteractionsService.disposeListener(object));
    } else {
      console.info('parseAction', 'action does not exist or not a valid action', userData.action);
    }
  }
};
