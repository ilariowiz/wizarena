import { combineReducers } from 'redux';
import MainReducer from './MainReducer';
import RankReducer from './RankReducer'
import EquipmentReducer from './EquipmentReducer'
import ModalTransactionReducer from './ModalTransactionReducer'
import ChallengesReducer from './ChallengesReducer'
import FlashTournamentsReducer from './FlashTournamentsReducer'

const rootRed = combineReducers({
	mainReducer: MainReducer,
	rankReducer: RankReducer,
	equipmentReducer: EquipmentReducer,
	modalTransactionReducer: ModalTransactionReducer,
	challengesReducer: ChallengesReducer,
	flashTournamentsReducer: FlashTournamentsReducer
});

export default rootRed;
