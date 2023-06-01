import moment from 'moment'
import {
    SET_PENDING_TOURNAMENTS,
    SET_COMPLETED_TOURNAMENTS,
    SET_LOADING_PENDING_TOURNAMENTS,
    SET_LOADING_COMPLETED_TOURNAMENTS,
    SORT_AUTO_TOURNAMENTS
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
        case SORT_AUTO_TOURNAMENTS: {
            const { key, section } = action.payload
            //console.log(key, section);

            let oldPending;
            if (section === 1) {
                oldPending = Object.assign([], state.pendingTournaments)
            }
            else {
                oldPending = Object.assign([], state.completedTournaments)
            }

            if (key === 'playersDesc') {
                oldPending.sort((a, b) => {
                    let playersLeftA = a.nPlayers.int - a.players.length
                    let playersLeftB = b.nPlayers.int - b.players.length

                    return playersLeftA - playersLeftB
                })
            }

            if (key === 'playersAsc') {
                oldPending.sort((a, b) => {
                    let playersLeftA = a.nPlayers.int - a.players.length
                    let playersLeftB = b.nPlayers.int - b.players.length

                    return playersLeftB - playersLeftA
                })
            }

            if (key === 'buyinDesc') {
                oldPending.sort((a, b) => {
                    return b.buyin - a.buyin
                })
            }

            if (key === 'buyinAsc') {
                oldPending.sort((a, b) => {
                    return a.buyin - b.buyin
                })
            }

            if (key === 'levelDesc') {
                oldPending.sort((a, b) => {
                    return b.maxLevel.int - a.maxLevel.int
                })
            }

            if (key === 'levelAsc') {
                oldPending.sort((a, b) => {
                    return a.maxLevel.int - b.maxLevel.int
                })
            }

            if (key === 'completedAt') {
                oldPending.sort((a, b) => {

                    const moment1 = b.completedAt ? moment(b.completedAt.timep) : moment(b.createdAt.timep)
                    const moment2 = a.completedAt ? moment(a.completedAt.timep) : moment(a.createdAt.timep)

                    return moment1 - moment2
                })
            }

            //console.log(oldPending);

            if (section === 1) {
                return { ...state, pendingTournaments: oldPending }
            }
            return { ...state, completedTournaments: oldPending }
        }
        default:
    		return state
    }
}
