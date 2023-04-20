import { combineReducers } from 'redux';
import MainReducer from './MainReducer';
import SalesReducer from './SalesReducer';
import RankReducer from './RankReducer'
import EquipmentReducer from './EquipmentReducer'
import ModalTransactionReducer from './ModalTransactionReducer'
import ChallengesReducer from './ChallengesReducer'
import FlashTournamentsReducer from './FlashTournamentsReducer'

const rootRed = combineReducers({
	mainReducer: MainReducer,
	salesReducer: SalesReducer,
	rankReducer: RankReducer,
	equipmentReducer: EquipmentReducer,
	modalTransactionReducer: ModalTransactionReducer,
	challengesReducer: ChallengesReducer,
	flashTournamentsReducer: FlashTournamentsReducer
});

export default rootRed;
