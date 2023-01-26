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
import Tournament from './components/Tournament'
import Sales from './components/Sales'
import Shop from './components/Shop'
import BurningQueue from './components/BurningQueue'

import DoFight from './components/DoFight'
import PvP from './components/PvP'

import League from './components/League'
import Equipment from './components/Equipment'
import ItemEquipment from './components/ItemEquipment'


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
            <Route path="/tournament" component={Tournament} />
            <Route path="/sales" component={Sales} />
            <Route path="/magicshop" component={Shop} />
            <Route path="/burningqueue" component={BurningQueue} />
            <Route path="/fightpvp" component={DoFight} />
            <Route path="/pvp" component={PvP} />
            <Route path="/league" component={League} />
            <Route path="/equipment" component={Equipment} />
            <Route path="/item/" component={ItemEquipment} />
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
