import {
    SAVE_SALES,
    SAVE_SALES_EQUIPMENT
} from './types'


export const setSales = (sales) => {
	return {
		type: SAVE_SALES,
		payload: sales
	}
}


export const setSalesEquipment = (sales) => {
	return {
		type: SAVE_SALES_EQUIPMENT,
		payload: sales
	}
}
