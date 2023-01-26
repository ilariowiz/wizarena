import { combineReducers } from 'redux';
import MainReducer from './MainReducer';
import SalesReducer from './SalesReducer';
import RankReducer from './RankReducer'
import EquipmentReducer from './EquipmentReducer'

const rootRed = combineReducers({
	mainReducer: MainReducer,
	salesReducer: SalesReducer,
	rankReducer: RankReducer,
	equipmentReducer: EquipmentReducer
});

export default rootRed;
