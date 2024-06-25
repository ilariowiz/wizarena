import React, { Component } from 'react';
import { connect } from 'react-redux'
//import anime from 'animejs/lib/anime.es.js';
import { IoClose } from 'react-icons/io5'
import DotLoader from 'react-spinners/DotLoader';
import BounceLoader from 'react-spinners/BounceLoader';
import { sendMessage, sendMessageSales, sendMessageListed, sendMessageDelisted, sendMessageUpdateNickname, sendMessageUpgrade, sendMessageListedEquipment, sendMessageDelistedEquipment, sendMessageSalesEquipment, sendMessageOfferItem, sendMessageDeclineOffer, sendMessageChallenge, sendMessageFlashT, sendMessageFlashTSub, sendMessageCollectionOffer } from './WebhookDiscord'
import '../../css/Modal.css'
import {
	signTransaction,
	pollForTransaction,
	hideModalTx,
	addTxKeyToInfo,
	clearTransactionByPactCode,
	addTxKeyToListed
} from '../../actions'
import { CTA_COLOR, TEXT_SECONDARY_COLOR } from '../../actions/types'
import '../../css/Nft.css'

//const POLL_INTERVAL_S = 4

class ModalTransaction extends Component {

	componentDidMount() {
		const { transactionsState, txListen } = this.props

		//sendMessageUpgrade("866", "#866 Joneleth Irenicus", "hp", 1)
		//sendMessage("866", 32, 3, "k:461ae9f3c9c255112ac3797f6b15699c656c9bc44ed089551a0f792085ef9504")
		//sendMessageUpdateNickname("555", "Test")

		//console.log(transactionsState, txListen);
		if (transactionsState && transactionsState.length > 0) {

			transactionsState.map(i => {
				if (!i.requestKey) {
					this.props.clearTransactionByPactCode(i.cmdToConfirm.pactCode)
				}

				if (!txListen && i.requestKey) {
					setTimeout(() => {
						this.props.pollForTransaction(this.props, i.requestKey)
						this.props.addTxKeyToListed(i.requestKey)
					}, 500)
				}
				else if (i.requestKey && !txListen.includes(i.requestKey)) {
					setTimeout(() => {
						this.props.pollForTransaction(this.props, i.requestKey)
						this.props.addTxKeyToListed(i.requestKey)
					}, 500)
				}
			})
		}
	}

	checkTransaction() {
		const { transactionsState, txInfo, account } = this.props

		const txState = transactionsState && transactionsState.length > 0 ? transactionsState[transactionsState.length-1] : {}

		if (txState && txState.requestKey) {
			//console.log(txState.requestKey)

			const info = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1] : {}

			const typeModal = info.typeModal || ""
			const nameNft = info.nameNft || ""

            const statToUpgrade = info.statToUpgrade || ""
            const howMuchIncrement = info.howMuchIncrement || ""
            const idNft = info.idNft || ""
            const makeOfferValues = info.makeOfferValues || ""
            const saleValues = info.saleValues || ""
            const inputPrice = info.inputPrice || ""
            const ringToEquipName = info.ringToEquipName || ""
            const nicknameToSet = info.nicknameToSet || ""

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
			else if ((typeModal === "improvespell" || typeModal === "resetspell") && nameNft) {
                sendMessageUpgrade(idNft, nameNft)
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
			else if (typeModal === "makecollectionoffer") {
                //console.log(makeOfferValues);
                sendMessageCollectionOffer(makeOfferValues)
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
			else if (typeModal === "createtournament") {
				sendMessageFlashT(makeOfferValues)
			}
			else if (typeModal === "jointournament") {
				sendMessageFlashTSub(makeOfferValues)
			}

			this.props.addTxKeyToInfo(txState.requestKey)
			this.props.pollForTransaction(this.props, txState.requestKey)
			this.props.hideModalTx()
		}
	}

	getContent() {
		const { transactionsState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, txInfo } = this.props

		//console.log(transactionsState);
		//CASO INIZIALE, signingCmd != null in txState
		let title = 'Signing transaction'
		let body = 'Check your wallet to sign transaction'
		let buttonText = 'Test'
		let action = null
		let loading = false
		let canCancel = false

		const txState = transactionsState && transactionsState.length > 0 ? transactionsState[transactionsState.length-1] : {}

		//console.log(transactionToConfirmText, typeModal);

		if (txState) {

			if (txState.cmdToConfirm != null) {

				const transactionToConfirmText = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].transactionToConfirmText : ""
				const idNft = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].idNft : ""

				title = 'Review transaction'
				body = transactionToConfirmText

				buttonText = 'Open Wallet'
				action = async () => this.props.signTransaction(txState.cmdToConfirm, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, idNft, () => this.checkTransaction())
				loading = false
				canCancel = true
			}

			if (txState.signingCmd != null) {
				title = 'Signing transaction...'
				body = 'Check your wallet to sign transaction'
				buttonText = ''
				action = null
				loading = false
				canCancel = false
			}

			if (txState.signedCmd != null) {
				title = 'Submitting the transaction...'
				body = ''
				buttonText = ''
				action = null
				loading = false
				canCancel = false
			}

			if (txState.sentCmd != null) {
				title = 'Checking transaction...'
				body = `Transaction key: ${txState.requestKey}`
				buttonText = ''
				action = null
				loading = true
				canCancel = false
			}

			if (txState.success != null) {

				let transactionOkText = ""
				let info = {}
				if (txInfo && txInfo.length > 0) {
					info = txInfo.find(i => i.requestKey === txState.requestKey)
					if (info) {
						transactionOkText = info.transactionOkText
					}
				}

				title = 'Transaction completed!'
				body = transactionOkText
				buttonText = 'Close'

				action = info && info.location ? () => this.props.mintSuccess(txState.requestKey, info.location) : this.props.mintSuccess(txState.requestKey)
				loading = false
				canCancel = false
			}

			if (txState.error != null) {
				title = 'Failed Transaction...'
				body = txState.error
				buttonText = 'Close'
				action = () => this.props.mintFail(txState.cmdToConfirm.pactCode, txState.requestKey)
				loading = false
				canCancel = false
			}

		}

		return { title, body, buttonText, action, loading, canCancel }
	}

	render() {
		const { showModal, width, mainTextColor, mainBackgroundColor } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		const content = this.getContent()

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, backgroundColor: mainBackgroundColor })}>

					<p style={{ fontSize: 18, color: mainTextColor, marginBottom: 20, textAlign: 'center' }}>
						{content.title}
					</p>

					<p style={{ fontSize: 16, color: mainTextColor, marginBottom: 20, textAlign: 'center', paddingLeft: 15, paddingRight: 15, overflowWrap: 'anywhere' }}>
						{content.body}
					</p>

					{
						content.action &&
						<button
							className='btnH'
							style={styles.btnAction}
							onClick={content.action}
						>
							<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
								{content.buttonText}
							</p>
						</button>
					}

					{
						content.loading &&
						<DotLoader size={25} color={mainTextColor} />
					}

					{
						content.canCancel &&
						<button
							style={{ position: 'absolute', right: 15, top: 15 }}
							onClick={() => this.props.mintFail()}
						>
							<IoClose
								color={mainTextColor}
								size={25}
							/>
						</button>
					}

					{
						content.title.toLowerCase().includes("submitting") &&
						<div id="loaderModalTransaction">
							<BounceLoader
								color={TEXT_SECONDARY_COLOR}
								size={31}
							/>
						</div>
					}

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		minHeight: 240,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
		borderWidth: 1,
		borderColor: "#d7d7d7",
		borderStyle: 'solid'
	},
	btnAction: {
		width: 180,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		backgroundColor: CTA_COLOR
	}
}

const mapStateToProps = (state) => {
	const { transactionsState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit, mainTextColor, mainBackgroundColor } = state.mainReducer
	const { txInfo, txListen, txSucceed } = state.modalTransactionReducer


	return { transactionsState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit, txInfo, txListen, txSucceed, mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps, {
	signTransaction,
	pollForTransaction,
	hideModalTx,
	addTxKeyToInfo,
	clearTransactionByPactCode,
	addTxKeyToListed
})(ModalTransaction);
