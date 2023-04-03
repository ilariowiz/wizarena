import {
    SET_WIZARD_SFIDATO,
    SET_CHALLENGE_REPLAY,
    SHOW_WINNER_CHALLENGE
} from './types'


export const setWizardSfidato = (data) => {
	return {
		type: SET_WIZARD_SFIDATO,
		payload: data
	}
}

export const setChallengeReplay = (data) => {
    return {
        type: SET_CHALLENGE_REPLAY,
        payload: data
    }
}

export const showWinnerChallenge = (challengeid) => {
    return {
        type: SHOW_WINNER_CHALLENGE,
        payload: challengeid
    }
}
