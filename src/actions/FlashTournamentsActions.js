import Pact from "pact-lang-api";
import _ from 'lodash'
import moment from 'moment'
import {
    CONTRACT_NAME,
    DEFAULT_GAS_PRICE,
    SET_PENDING_TOURNAMENTS,
    SET_COMPLETED_TOURNAMENTS,
    SET_LOADING_PENDING_TOURNAMENTS,
    SET_LOADING_COMPLETED_TOURNAMENTS
} from './types'

export const getPendingTournaments = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 150000, networkUrl, callback) => {
	return (dispatch) => {

        dispatch(setLoadingPending(true))

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-pending-auto-tournaments)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

            /*
            response.sort((a, b) => {
                return moment(b.createdAt.timep) - moment(a.createdAt.timep)
            })
            */
            response.sort((a, b) => {
                return b.players.length - a.players.length
            })

            if (response) {
                dispatch({
                    type: SET_PENDING_TOURNAMENTS,
                    payload: response
                })
            }

			if (callback) {
				callback(response)
			}
		})
	}
}

export const getCompletedTournaments = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 150000, networkUrl, callback) => {
	return (dispatch) => {

        dispatch(setLoadingCompleted(true))

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-completed-auto-tournaments)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

            response.sort((a, b) => {
                return moment(b.createdAt.timep) - moment(a.createdAt.timep)
            })

            if (response) {
                dispatch({
                    type: SET_COMPLETED_TOURNAMENTS,
                    payload: response
                })
            }

			if (callback) {
				callback(response)
			}
		})
	}
}

const setLoadingPending = (value) => {
    return {
        type: SET_LOADING_PENDING_TOURNAMENTS,
        payload: value
    }
}

const setLoadingCompleted = (value) => {
    return {
        type: SET_LOADING_COMPLETED_TOURNAMENTS,
        payload: value
    }
}

export const readFromContract = (cmd, returnError, networkUrl) => {
	return async (dispatch) => {

		try {
			let data = await Pact.fetch.local(cmd, networkUrl);

			if (data && data.result && data.result.status === "success") {
				//console.log(data.result)
				return data.result.data
			}
			else {
				//console.log(data)
				if (returnError === true) {
					if (data && data.result) {
						return data.result
					}
					return null;
				}
				return null
			}
		}
		catch (e) {
			//console.log(e)
			console.log("Had trouble fetching data from the blockchain")
		}

		dispatch({ type: 'fake' })
	}
}


export const defaultMeta = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit) => {
	return Pact.lang.mkMeta(
		"",
		chainId,
		gasPrice,
		gasLimit || 150000,
		creationTime(),
		600
	)
}

const creationTime = () => {
	return Math.round(new Date().getTime() / 1000) - 10;
}

const parseRes = async (raw) => {
	const rawRes = await raw;
	const res = await rawRes

	if (res.ok) {
		const resJSON = await rawRes.json()
		return resJSON
	}
	else {
		const resText = await rawRes.text()
		return resText
	}
}

const mkReq = (cmd) => {
	return {
		headers: {
			"Content-Type": "application/json"
		},
		method: "POST",
		body: JSON.stringify(cmd)
	}
}
