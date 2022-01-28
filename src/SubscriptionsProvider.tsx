import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import React from "react";

interface Subscription {
  event: string;
  cb: Function;
  name?: string;
}

export enum SubscriptionsActionType {
  ADD = "ADD",
  REMOVE = "REMOVE",
}

type SubscriptionsAction =
  | { type: SubscriptionsActionType.ADD; payload: Subscription }
  | {
      type: SubscriptionsActionType.REMOVE;
      payload: Pick<Subscription, "event" | "name">;
    };

interface SubscriptionsState {
  subscriptions: Subscription[];
}

export enum SubscriptionsStatus {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

function subscriptionsReducer(
  state: SubscriptionsState,
  action: SubscriptionsAction
) {
  switch (action.type) {
    case SubscriptionsActionType.ADD: {
      return { subscriptions: [...state.subscriptions, action.payload] };
    }
    case SubscriptionsActionType.REMOVE: {
      return {
        subscriptions: state.subscriptions.filter(
          (subscription) =>
            !(
              (!action.payload.name &&
                subscription.event === action.payload.event) ||
              (action.payload.name &&
                subscription.event === action.payload.event &&
                subscription.name === action.payload.name)
            )
        ),
      };
    }
  }
}

interface SubscriptionsContextValues {
  dispatch: (action: SubscriptionsAction) => void;
  status: SubscriptionsStatus;
}

const SubscriptionsContext = createContext<
  SubscriptionsContextValues | undefined
>(undefined);

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);

  if (!context) {
    throw new Error("Missing subscriptions context");
  }

  return context;
}

export interface SubscriptionsProviderProps {
  token: string;
  endpointUrl: string;
  children: React.ReactNode;
}

export function SubscriptionsProvider({
  children,
  endpointUrl,
  token,
}: SubscriptionsProviderProps) {
  const [state, dispatch] = useReducer(subscriptionsReducer, {
    subscriptions: [],
  });

  const ws = useRef<WebSocket>();
  const [status, setStatus] = useState<SubscriptionsStatus>(
    SubscriptionsStatus.CLOSED
  );

  const connect = useCallback(() => {
    ws.current = new WebSocket(endpointUrl);
    setStatus(ws.current.readyState);

    ws.current.onopen = async () => {
      setStatus(ws.current?.readyState ?? SubscriptionsStatus.CLOSED);
      ws.current?.send(token);
    };

    ws.current.onclose = () => {
      setStatus(ws.current?.readyState ?? SubscriptionsStatus.CLOSED);
    };
  }, [token]);

  useEffect(() => {
    if (
      status === SubscriptionsStatus.CLOSED &&
      token !== "" &&
      token !== "Bearer undefined"
    ) {
      connect();
    }
  }, [status, token, connect]);

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = (e) => {
      state.subscriptions
        .filter(
          (subscription) =>
            subscription.event === e.data ||
            subscription.event.split("*")[0] ===
              e.data.substr(0, subscription.event.split("*")[0].length)
        )
        .forEach((subscription) =>
          (e.data as string).includes(":")
            ? subscription.cb((e.data as string).split(":")[1])
            : subscription.cb()
        );
    };
    // We need ws.current as a dependency here, I don't really know why its not valid because if its there,
    // everything works as expected.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ws.current]);

  const value = { dispatch, status };

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}
