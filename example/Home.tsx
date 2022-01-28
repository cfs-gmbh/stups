import * as React from 'react';
import { useStups } from '../.';

export function Home() {
  const doSomething = React.useCallback(
    eventId => console.log(`Do something for event ${eventId}`),
    []
  );

  useStups('event:*', doSomething, 'home');

  return <div>Look at the console!</div>;
}
