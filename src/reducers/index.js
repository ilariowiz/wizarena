import { combineReducers } from 'redux';
import MainReducer from './MainReducer';
import SalesReducer from './SalesReducer';
import RankReducer from './RankReducer'

const rootRed = combineReducers({
	mainReducer: MainReducer,
	salesReducer: SalesReducer,
	rankReducer: RankReducer
});

export default rootRed;
