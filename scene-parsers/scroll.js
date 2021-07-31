import { ScrollList } from "../game-objects/built-in/scroll-list";
import { isDefined } from "../utils/shared";

export const parseScroll = (object, { scene, scrollLists }) => {
  const { userData } = object;

  if (isDefined(userData.scroll)) {
    const scrollId = Number(userData.scroll);

    if (!scrollLists[scrollId]) {
      scrollLists[scrollId] = new ScrollList();

      scene.add(scrollLists[scrollId]);
    }

    scrollLists[scrollId].add(object);
  }
};
