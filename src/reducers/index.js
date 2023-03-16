import { combineReducers } from 'redux';
import MainReducer from './MainReducer';
import SalesReducer from './SalesReducer';
import RankReducer from './RankReducer'
import EquipmentReducer from './EquipmentReducer'
import ModalTransactionReducer from './ModalTransactionReducer'

const rootRed = combineReducers({
	mainReducer: MainReducer,
	salesReducer: SalesReducer,
	rankReducer: RankReducer,
	equipmentReducer: EquipmentReducer,
	modalTransactionReducer: ModalTransactionReducer
});

export default rootRed;
