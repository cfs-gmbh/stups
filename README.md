# useStups

React hook to do things on websocket events.

## why?

While building a web app, we are often in a situation where we want to react to changes of server side data on the client. There are multiple ways to accomplish that. From SSE over websockets to paid services. This library aims on beeing a simple and small (< 4kB) solution to the problem. It's main feature is, that its well integrated with react and that it tries not to get in your way.

## usage

useStups is a react hook that allows you to define an event and a some callback function that ist triggered when the defined event is sent on the websocket connection. To use it, you have to wrap your components in a `<SubscriptionProder>` context.

```
const App = () => {
  return (
    <SubscriptionsProvider endpointUrl="ws://localhost:8080/" token="someJWT">
      <Home></Home>
    </SubscriptionsProvider>
  );
};
```

The token attibute is optional and can carry a JWT which is sent to the endpoint, so the client can be authenticated.

Now the useStups hook can be used in your components.

```
export function Home() {
  const doSomething = React.useCallback(
    eventId => console.log(`Do something for event ${eventId}`),
    []
  );

  useStups('event:*', doSomething, 'home');

  return <div>Look at the console!</div>;
}
```

In this example, we listen for all events called 'event' and log to the console if the event occurs.
By changing the event string, we can listen for a specific event ('event:123').

## tip

Beeing able to do something on push is especially useful if you use it for refetching. Because stups is unopinionated in what it does on events, you might use Apollo or React Query and pass the refetch function of a query to stups. This way, the query can stay up to date with the server while not interfering with your caching strategy.

## server side

For now, you can find an example implementation of an example server in `example/server`. In the future we might create a docker image that offers basic server capabilities.
