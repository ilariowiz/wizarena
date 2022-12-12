import {
    SAVE_SALES
} from './types'


export const setSales = (sales) => {
	return {
		type: SAVE_SALES,
		payload: sales
	}
}
