import Pact from "pact-lang-api";
import { sendMessage, sendMessageSales, sendMessageListed, sendMessageDelisted, sendMessageUpdateNickname, sendMessageUpgrade, sendMessageListedEquipment, sendMessageDelistedEquipment, sendMessageSalesEquipment, sendMessageOfferItem, sendMessageDeclineOffer, sendMessageChallenge } from '../components/common/WebhookDiscord'
import { updateTransactionState } from './index'
import {
    UPDATE_INFO_TRANSACTION_MODAL,
    ADD_TX_KEY_TO_INFO,
    REMOVE_INFO_TX,
    ADD_TX_TO_SUCCEED,
    ADD_TX_KEY_TO_LISTEN
} from './types'


export const updateInfoTransactionModal = (dict) => {
    return {
        type: UPDATE_INFO_TRANSACTION_MODAL,
        payload: dict
    }
}

export const addTxKeyToInfo = (tx) => {
    return {
        type: ADD_TX_KEY_TO_INFO,
        payload: tx
    }
}

export const removeInfo = (tx) => {
    return {
        type: REMOVE_INFO_TX,
        payload: tx
    }
}

export const addTxToSucceed = (tx) => {
    return {
        type: ADD_TX_TO_SUCCEED,
        payload: tx
    }
}

export const addTxKeyToListed = (tx) => {
    return {
        type: ADD_TX_KEY_TO_LISTEN,
        payload: tx
    }
}

export const pollForTransaction = (props, requestKey) => {
    return async (dispatch) => {
        const { transactionsState, networkUrl, txInfo, txSucceed } = props

        const txState = transactionsState && transactionsState.length > 0 ? transactionsState.find(i => i.requestKey === requestKey) : undefined

        //const requestKey = txState ? txState.requestKey : ""

        //console.log(requestKey, txState);

        let pollRes = null

        try {
            pollRes = await Pact.fetch.listen(
                { listen: requestKey },
                "https://api.chainweb.com/chainweb/0.0/mainnet01/chain/1/pact"
            )
        }
        catch (e) {
            console.log(e)
            console.log("Had trouble getting transaction update, will try again")
        }

        //console.log(pollRes);

        if (pollRes.result.status === "success") {
            dispatch(updateTransactionState("success", 1))

            if (txSucceed && txSucceed.includes(requestKey)) {
                return
            }
            dispatch(addTxToSucceed(requestKey))
        }
        else {
            dispatch(updateTransactionState("error", `Cannot complete transaction\n${requestKey}`))
        }

        //dispatch({ type: 'fake' })
    }
}
