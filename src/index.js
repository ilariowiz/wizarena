import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import Collection from './components/Collection'
import Mint from './components/Mint'
import Profile from './components/Profile'
import Nft from './components/Nft';
import Fight from './components/Fight'

import Sales from './components/Sales'
import SalesEquipment from './components/SalesEquipment'
import Shop from './components/Shop'
import BurningQueue from './components/BurningQueue'

import PvP from './components/PvP'

import DoFightPvE from './components/DoFightPvE'
import PvE from './components/PvE'

import League from './components/League'
import LeagueFarmers from './components/LeagueFarmers'
import Equipment from './components/Equipment'
import ItemEquipment from './components/ItemEquipment'
import EquipmentOffers from './components/EquipmentOffers'
import CollectionOffers from './components/CollectionOffers'

import TournamentPre from './components/TournamentPre'
import Tournament from './components/Tournament'
import TournamentWiza from './components/TournamentWiza'
import TournamentElite from './components/TournamentElite'

import Forge from './components/Forge'
import Recipes from './components/Recipes'

import Challenges from './components/Challenges'
import DoChallenges from './components/DoChallenges'

import FlashTournaments from './components/FlashTournaments'
import WalletsXpLeaderboard from './components/WalletsXpLeaderboard'

import Conquest from './components/Conquest'
import FightsReplay from './components/FightsReplay'
import FightsReplayBrawl from './components/FightsReplayBrawl'

import Arena from './components/Arena'

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
            {/*<Route path="/mint" component={Mint} />*/}
            <Route path="/me" component={Profile} />
            <Route path="/nft/" component={Nft} />
            <Route path="/fight/" component={Fight} />
            <Route path="/sales" component={Sales} />
            <Route path="/salesequipment" component={SalesEquipment} />
            <Route path="/magicshop" component={Shop} />
            <Route path="/burningqueue" component={BurningQueue} />
            <Route path="/fightpve" component={DoFightPvE} />
            <Route path="/pvp" component={PvP} />
            <Route path="/pve" component={PvE} />
            <Route path="/league" component={League} />
            <Route path="/leaguefarmers" component={LeagueFarmers} />
            <Route path="/equipment" component={Equipment} />
            <Route path="/equipmentoffers" component={EquipmentOffers} />
            <Route path="/collectionoffers" component={CollectionOffers} />
            <Route path="/item/" component={ItemEquipment} />
            <Route path="/tournaments/" component={TournamentPre} />
            <Route path="/tournamentK" component={Tournament} />
            <Route path="/tournamentW" component={TournamentWiza} />
            <Route path="/tournamentE" component={TournamentElite} />
            <Route path="/forge" component={Forge} />
            <Route path="/recipes" component={Recipes} />
            <Route path="/challenges" component={Challenges} />
            <Route path="/startchallenge" component={DoChallenges} />
            <Route path="/flashtournaments" component={FlashTournaments} />
            <Route path="/walletsxp" component={WalletsXpLeaderboard} />
            <Route path="/lords" component={Conquest} />
            <Route path="/fightreplay" component={FightsReplay} />
            <Route path="/fightreplaybrawl" component={FightsReplayBrawl} />
            <Route path="/arena" component={Arena} />
          </Switch>
        </div>
      </BrowserRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

//<Route path="/fighttest" component={DoFightTEST} />
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
