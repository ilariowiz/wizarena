import { combineReducers } from 'redux';
import MainReducer from './MainReducer';

const rootRed = combineReducers({
	mainReducer: MainReducer,
});

export default rootRed;
