import { combineReducers } from 'redux';
import MainReducer from './MainReducer';
import SalesReducer from './SalesReducer';

const rootRed = combineReducers({
	mainReducer: MainReducer,
	salesReducer: SalesReducer
});

export default rootRed;
