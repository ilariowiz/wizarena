import {
    SAVE_RANK
} from '../actions/types'

const INITIAL_STATE = {
    ranks: {}
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SAVE_RANK: {
            const { id, rank } = action.payload

            const oldState = Object.assign({}, state.ranks)
            oldState[id] = rank

            return { ...state, ranks: oldState }
        }

        default:
    		return state
    }
}
