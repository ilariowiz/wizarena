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

/*
export const updateInfoTransactionModal = (dict) => {
    return {
        type: UPDATE_INFO_TRANSACTION_MODAL,
        payload: {
            transactionToConfirmText: dict.transactionToConfirmText,
            typeModal: dict.typeModal,
            transactionOkText: dict.transactionOkText,
            nameNft: dict.nameNft,
            saleValues: dict.saleValues,
            statToUpgrade: dict.statToUpgrade,
            howMuchIncrement: dict.howMuchIncrement,
            idNft: dict.idNft,
            nicknameToSet: dict.nicknameToSet,
            ringToEquipName: dict.ringToEquipName,
            wizaAmount: dict.wizaAmount,
            toSubscribePvP: dict.toSubscribePvP,
            inputPrice: dict.inputPrice,
            makeOfferValues: dict.makeOfferValues
        }
    }
}
*/

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

            let currentInfo = undefined
            if (txInfo && txInfo.length > 0) {
                currentInfo = txInfo.find(i => i.requestKey === requestKey)
            }

            const typeModal = currentInfo ? currentInfo.typeModal : ""
            const nameNft = currentInfo ? currentInfo.nameNft : ""
            const statToUpgrade = currentInfo ? currentInfo.statToUpgrade : ""
            const howMuchIncrement = currentInfo ? currentInfo.howMuchIncrement : ""
            const idNft = currentInfo ? currentInfo.idNft : ""
            const makeOfferValues = currentInfo ? currentInfo.makeOfferValues : ""
            const saleValues = currentInfo ? currentInfo.saleValues : ""
            const inputPrice = currentInfo ? currentInfo.inputPrice : ""
            const ringToEquipName = currentInfo ? currentInfo.ringToEquipName : ""
            const nicknameToSet = currentInfo ? currentInfo.nicknameToSet : ""


            if (typeModal === "upgrade" && nameNft && statToUpgrade && howMuchIncrement) {
                const msg = `${nameNft} upgrade ${statToUpgrade.toUpperCase()} by ${howMuchIncrement}`
                sendMessageUpgrade(idNft, msg)
            }
            else if (typeModal === "downgrade" && nameNft && statToUpgrade && howMuchIncrement) {
                const msg = `${nameNft} downgrade ${statToUpgrade.toUpperCase()} by ${howMuchIncrement}`
                sendMessageUpgrade(idNft, msg)
            }
            else if (typeModal === "buyvial" && nameNft && statToUpgrade) {
                const msg = `${nameNft} bought a ${statToUpgrade.toUpperCase()} vial`
                sendMessageUpgrade(idNft, msg)
            }
            else if (typeModal === "makeoffer") {
                sendMessage(makeOfferValues.id, makeOfferValues.amount, makeOfferValues.duration, makeOfferValues.owner)
            }
            else if (typeModal === "declineoffer") {
                sendMessageDeclineOffer(saleValues)
            }
            else if (typeModal === "makeofferitem") {
                //console.log(makeOfferValues);
                sendMessageOfferItem(makeOfferValues)
            }
            else if (typeModal === "acceptoffer" || typeModal === "buy") {
                sendMessageSales(saleValues.id, saleValues.amount)
            }
            else if (typeModal === "buyequipment" || typeModal === "acceptofferequipment") {
                sendMessageSalesEquipment(saleValues)
            }
            else if (typeModal === "list") {
                sendMessageListed(idNft, inputPrice)
            }
            else if (typeModal === 'listequipment') {
                sendMessageListedEquipment(saleValues)
            }
            else if (typeModal === "delist") {
                sendMessageDelisted(nameNft.replace("#", ""))
            }
            else if (typeModal === "delistequipment") {
                sendMessageDelistedEquipment(saleValues)
            }
            else if (typeModal === "equip") {
                const msg = `${nameNft} wore the ${ringToEquipName}`
                sendMessageUpgrade(nameNft.replace("#", ""), msg)
            }
            else if (typeModal === "buynickname") {
                sendMessageUpdateNickname(nameNft.replace("#", ""), nicknameToSet)
            }
            else if (typeModal === "sendchallenge") {
                 sendMessageChallenge(makeOfferValues)
            }
        }
        else {
            dispatch(updateTransactionState("error", `Cannot complete transaction\n${requestKey}`))
        }

        //dispatch({ type: 'fake' })
    }
}
