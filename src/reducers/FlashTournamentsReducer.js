import {
    SET_PENDING_TOURNAMENTS,
    SET_COMPLETED_TOURNAMENTS,
    SET_LOADING_PENDING_TOURNAMENTS,
    SET_LOADING_COMPLETED_TOURNAMENTS,
    SORT_PENDING_TOURNAMENTS
} from '../actions/types'

const INITIAL_STATE = {
    pendingTournaments: [],
    completedTournaments: [],
    loadingPending: true,
    loadingCompleted: true
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
        case SET_LOADING_PENDING_TOURNAMENTS:
            return { ...state, loadingPending: action.payload }
        case SET_PENDING_TOURNAMENTS:
            return { ...state, pendingTournaments: action.payload, loadingPending: false }
        case SET_LOADING_COMPLETED_TOURNAMENTS:
            return { ...state, loadingCompleted: action.payload }
        case SET_COMPLETED_TOURNAMENTS:
            return { ...state, completedTournaments: action.payload, loadingCompleted: false }
        case SORT_PENDING_TOURNAMENTS: {
            const oldPending = Object.assign([], state.pendingTournaments)

            if (action.payload === 'playersDesc') {
                oldPending.sort((a, b) => {
                    return b.players.length - a.players.length
                })
            }

            if (action.payload === 'playersAsc') {
                oldPending.sort((a, b) => {
                    return a.players.length - b.players.length
                })
            }

            if (action.payload === 'buyinDesc') {
                oldPending.sort((a, b) => {
                    return b.buyin - a.buyin
                })
            }

            if (action.payload === 'buyinAsc') {
                oldPending.sort((a, b) => {
                    return a.buyin - b.buyin
                })
            }

            if (action.payload === 'levelDesc') {
                oldPending.sort((a, b) => {
                    return b.maxLevel.int - a.maxLevel.int
                })
            }

            if (action.payload === 'levelAsc') {
                oldPending.sort((a, b) => {
                    return a.maxLevel.int - b.maxLevel.int
                })
            }

            return { ...state, pendingTournaments: oldPending }
        }
        default:
    		return state
    }
}
