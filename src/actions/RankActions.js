import {
    SAVE_RANK
} from './types'


export const setRank = (id, rank) => {
	return {
		type: SAVE_RANK,
		payload: { id, rank }
	}
}
