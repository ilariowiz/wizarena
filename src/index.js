import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import Collection from './components/Collection'
import Mint from './components/Mint'
import Profile from './components/Profile'
import Nft from './components/Nft';
import Settings from './components/Settings';
import Fight from './components/Fight'
import Rules from './components/Rules'

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { store, persistor } from './store';
import './index.css';
import * as serviceWorker from './serviceWorker';


ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <div>
          <Switch>
            <Route exact path="/" component={App} />
            <Route path="/collection" component={Collection} />
            <Route path="/mint" component={Mint} />
            <Route path="/me" component={Profile} />
            <Route path="/nft/" component={Nft} />
            <Route path="/settings" component={Settings} />
            <Route path="/fight/" component={Fight} />
            <Route path="/rules" component={Rules} />
          </Switch>
        </div>
      </BrowserRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
