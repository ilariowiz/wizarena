import {
    SET_PENDING_TOURNAMENTS,
    SET_COMPLETED_TOURNAMENTS,
    SET_LOADING_PENDING_TOURNAMENTS,
    SET_LOADING_COMPLETED_TOURNAMENTS
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
        default:
    		return state
    }
}
