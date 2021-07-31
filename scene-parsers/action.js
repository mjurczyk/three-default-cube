import { AssetsService } from "../services/assets-service";
import { InteractionEnums, InteractionsService } from "../services/interactions-service";
import { isDefined } from "../utils/shared";

export const parseAction = (object, parserPayload) => {
  const { userData } = object;
  const { actions } = parserPayload;

  if (isDefined(userData.action)) {
    const actionCallback = actions[userData.action];

    if (typeof actionCallback === 'function') {
      InteractionsService.registerListener(
        object,
        InteractionEnums.eventClick,
        ({ stopPropagation } = {}) => {
          actionCallback(object, { ...parserPayload, stopPropagation });
        }
      );

      AssetsService.registerDisposeCallback(object, () => InteractionsService.disposeListener(object));
    } else {
      console.info('parseAction', 'action does not exist or not a valid action', userData.action);
    }
  }
};
