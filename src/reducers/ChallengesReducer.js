import {
    SET_WIZARD_SFIDATO,
    SET_CHALLENGE_REPLAY,
    SHOW_WINNER_CHALLENGE
} from '../actions/types'

const INITIAL_STATE = {
    wizardSfidato: {},
    challengeReplay: {},
    showWinnerChallenges: []
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SET_WIZARD_SFIDATO:
            return { ...state, wizardSfidato: action.payload }
        case SET_CHALLENGE_REPLAY:
            return { ...state, challengeReplay: action.payload }
        case SHOW_WINNER_CHALLENGE: {
            let oldShow = Object.assign([], state.showWinnerChallenges)

            if (!oldShow.includes(action.payload)) {
                oldShow.push(action.payload)  
            }

            return { ...state, showWinnerChallenges: oldShow }
        }
        default:
    		return state
    }
}
