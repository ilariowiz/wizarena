import moment from 'moment'
import {
    SAVE_SALES,
    SAVE_SALES_EQUIPMENT
} from '../actions/types'

const INITIAL_STATE = {
    sales: [],
    salesEquipment: [],
    lastTimeUpdateSales: undefined,
    lastTimeUpdateSalesEquipment: undefined
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SAVE_SALES:
			return { ...state, sales: action.payload, lastTimeUpdateSales: moment() }
        case SAVE_SALES_EQUIPMENT:
            return { ...state, salesEquipment: action.payload, lastTimeUpdateSalesEquipment: moment() }
        default:
    		return state
    }
}
