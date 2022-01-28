import { useEffect } from "react";

import {
  SubscriptionsActionType,
  useSubscriptions,
} from "../SubscriptionsProvider";

export function useStups(event: string, cb: Function, name?: string) {
  const { dispatch, status } = useSubscriptions();

  useEffect(() => {
    dispatch({
      payload: { event, name },
      type: SubscriptionsActionType.REMOVE,
    });
    dispatch({
      payload: { cb, event, name },
      type: SubscriptionsActionType.ADD,
    });
  }, [cb, dispatch, event, name]);

  return {
    status,
    unsubscribe() {
      dispatch({
        payload: { event, name },
        type: SubscriptionsActionType.REMOVE,
      });
    },
  };
}
