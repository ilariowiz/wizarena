import {
    UPDATE_INFO_TRANSACTION_MODAL
} from './types'

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
