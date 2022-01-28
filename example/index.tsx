import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SubscriptionsProvider } from '../.';
import { Home } from './Home';

const App = () => {
  return (
    <SubscriptionsProvider endpointUrl="ws://localhost/stups" token="someJWT">
      <Home></Home>
    </SubscriptionsProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
