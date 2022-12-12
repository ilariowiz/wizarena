import moment from 'moment'
import {
    SAVE_SALES
} from '../actions/types'

const INITIAL_STATE = {
    sales: [],
    lastTimeUpdateSales: undefined
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SAVE_SALES:
			return { ...state, sales: action.payload, lastTimeUpdateSales: moment() }
        default:
    		return state
    }
}
