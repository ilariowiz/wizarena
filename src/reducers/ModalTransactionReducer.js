import {
    UPDATE_INFO_TRANSACTION_MODAL
} from '../actions/types'

const INITIAL_STATE = {
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
    makeOfferValues: {}
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
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
        default:
    		return state
    }
}
