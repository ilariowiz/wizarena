import {
    UPDATE_INFO_TRANSACTION_MODAL,
    ADD_TX_KEY_TO_INFO,
    REMOVE_INFO_TX,
    ADD_TX_TO_SUCCEED
} from '../actions/types'

const INITIAL_STATE = {
    /*
    transactionToConfirmText: "",
    typeModal: "",
    transactionOkText: "",
    nameNft: "",
    saleValues: {},
    statToUpgrade: "",
    howMuchIncrement: "",
    idNft: "",
    nicknameToSet: "",
    ringToEquipName: "",
    wizaAmount: 0,
    toSubscribePvP: [],
    inputPrice: 0,
    makeOfferValues: {},
    */
    txListen: [],
    txInfo: [],
    txSucceed: []
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
        /*
        case UPDATE_INFO_TRANSACTION_MODAL: {
            const { transactionToConfirmText, typeModal, transactionOkText, nameNft, saleValues, statToUpgrade, howMuchIncrement, idNft, nicknameToSet, ringToEquipName, wizaAmount, toSubscribePvP, inputPrice, makeOfferValues } = action.payload

            return {
                ...state,
                transactionToConfirmText,
                typeModal,
                transactionOkText,
                nameNft,
                saleValues,
                statToUpgrade,
                howMuchIncrement,
                idNft,
                nicknameToSet,
                ringToEquipName,
                wizaAmount,
                toSubscribePvP,
                inputPrice,
                makeOfferValues
            }
        }
        */
        case UPDATE_INFO_TRANSACTION_MODAL: {
            let oldInfos = Object.assign([], state.txInfo)

            oldInfos.push(action.payload)

            return { ...state, txInfo: oldInfos }
        }
        case ADD_TX_KEY_TO_INFO: {
            let oldInfos = Object.assign([], state.txInfo)

            let last = oldInfos[oldInfos.length-1]
            last['requestKey'] = action.payload

            oldInfos[oldInfos.length-1] = last

            let oldListen = Object.assign([], state.txListen)
            oldListen.push(action.payload)

            return { ...state, txInfo: oldInfos, txListen: oldListen }
        }
        case REMOVE_INFO_TX: {
            let oldInfos = Object.assign([], state.txInfo)

            const idx = oldInfos.findIndex(i => i.requestKey === action.payload)
            if (idx > -1) {
                oldInfos.splice(idx, 1)
            }

            let oldListen = Object.assign([], state.txListen)
            const idxListen = oldListen.findIndex(i => i === action.payload)
            if (idxListen > -1) {
                oldListen.splice(idxListen, 1)
            }

            return { ...state, txInfo: oldInfos, txListen: oldListen }
        }
        case ADD_TX_TO_SUCCEED: {
            let oldTxSucceed = Object.assign([], state.txSucceed)

            if (!oldTxSucceed.includes(action.payload)) {
                oldTxSucceed.push(action.payload)
            }

            return { ...state, txSucceed: oldTxSucceed }
        }
        default:
    		return state
    }
}
