import React, { Component } from 'react';
import { connect } from 'react-redux'
import { doc, updateDoc, setDoc, increment } from "firebase/firestore";
import { firebasedb } from '../Firebase';
import { IoClose } from 'react-icons/io5'
import DotLoader from 'react-spinners/DotLoader';
import Pact from "pact-lang-api";
import { sendMessage, sendMessageSales, sendMessageListed, sendMessageDelisted, sendMessageUpdateNickname, sendMessageUpgrade, sendMessageListedEquipment, sendMessageDelistedEquipment, sendMessageSalesEquipment, sendMessageOfferItem, sendMessageDeclineOffer, sendMessageChallenge } from './WebhookDiscord'
import '../../css/Modal.css'
import {
	signTransaction,
	updateTransactionState
} from '../../actions'
import { TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../../actions/types'
import '../../css/Nft.css'


const POLL_INTERVAL_S = 3

class ModalTransaction extends Component {

	componentDidMount() {
		//sendMessageUpgrade("866", "#866 Joneleth Irenicus", "hp", 1)
		//sendMessage("866", 32, 3, "k:461ae9f3c9c255112ac3797f6b15699c656c9bc44ed089551a0f792085ef9504")
		//sendMessageUpdateNickname("555", "Test")
	}

	checkTransaction() {
		const { transactionState, typeModal, toSubscribePvP, pvpWeek, nameNft, wizaAmount } = this.props

		if (transactionState && transactionState.requestKey) {
			console.log(transactionState.requestKey)

			if (typeModal === "subscribe_pvp") {
				toSubscribePvP.map(i => {
					const docRef = doc(firebasedb, "pvp_results", `${i.week}_#${i.idnft}`)
					setDoc(docRef, { "lose": 0, "win": 0, "maxFights": i.wizaAmount })

					const docRefTraining = doc(firebasedb, "pvp_training", `${i.week}_#${i.idnft}`)
					setDoc(docRefTraining, { "lose": 0, "win": 0 })
				})
			}
			else if (typeModal === "increment_fight_pvp") {
				const docRef = doc(firebasedb, "pvp_results", `${pvpWeek}_${nameNft}`)
				updateDoc(docRef, {"maxFights": increment(wizaAmount) })
			}

			this.pollForTransaction()
		}
	}

	pollForTransaction = async () => {
		const { transactionState, networkUrl, nameNft, idNft, inputPrice, statToUpgrade, howMuchIncrement, typeModal, pvpWeek, makeOfferValues, saleValues, wizaAmount, nicknameToSet, ringToEquipName, toSubscribePvP } = this.props

		const requestKey = transactionState.requestKey

		let time_spent_polling_s = 0;
		let pollRes = null

		while (time_spent_polling_s < 240) {
			await this.wait(POLL_INTERVAL_S * 3000)

			try {
				pollRes = await Pact.fetch.poll(
					{ requestKeys: [requestKey] },
					networkUrl
				)
			}
			catch (e) {
				console.log(e)
				console.log("Had trouble getting transaction update, will try again")
				continue
			}

			if (Object.keys(pollRes).length !== 0) {
				break
			}

			time_spent_polling_s += POLL_INTERVAL_S
		}


		if (pollRes[requestKey].result.status === "success") {
			this.props.updateTransactionState("success", 1)

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
			this.props.updateTransactionState("error", `Cannot complete transaction\n${requestKey}`)
		}
	}

	wait = async (timeout) => {
		return new Promise((resolve) => {
			setTimeout(resolve, timeout)
		})
	}

	getContent() {
		const { transactionState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, idNft, transactionToConfirmText, transactionOkText } = this.props

		//CASO INIZIALE, signingCmd != null in transactionState
		let title = 'Signing transaction'
		let body = 'Check your wallet to sign transaction'
		let buttonText = 'Test'
		let action = null
		let loading = false
		let canCancel = false

		//console.log(transactionToConfirmText, typeModal);

		if (transactionState) {

			if (transactionState.cmdToConfirm != null) {
				title = 'Review transaction'
				body = transactionToConfirmText

				buttonText = 'Open Wallet'
				action = async () => this.props.signTransaction(transactionState.cmdToConfirm, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, idNft, () => this.checkTransaction())
				loading = false
				canCancel = true
			}

			if (transactionState.signingCmd != null) {
				title = 'Signing transaction...'
				body = 'Check your wallet to sign transaction'
				buttonText = ''
				action = null
				loading = false
				canCancel = false
			}

			if (transactionState.signedCmd != null) {
				title = 'Submitting the transaction...'
				body = ''
				buttonText = ''
				action = null
				loading = false
				canCancel = false
			}

			if (transactionState.sentCmd != null) {
				title = 'Checking transaction...'
				body = `Transaction key: ${transactionState.requestKey}`
				buttonText = ''
				action = null
				loading = true
				canCancel = false
			}

			if (transactionState.success != null) {
				title = 'Transaction completed!'
				body = transactionOkText
				buttonText = 'Close'

				action = () => this.props.mintSuccess()
				loading = false
				canCancel = false
			}

			if (transactionState.error != null) {
				title = 'Failed Transaction...'
				body = transactionState.error
				buttonText = 'Close'
				action = () => this.props.mintFail()
				loading = false
				canCancel = false
			}

		}

		return { title, body, buttonText, action, loading, canCancel }
	}

	render() {
		const { showModal, width } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		const content = this.getContent()

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<p style={{ fontSize: 20, color: 'white', marginBottom: 20 }}>
						{content.title}
					</p>

					<p style={{ fontSize: 18, color: 'white', marginBottom: 20, textAlign: 'center', paddingLeft: 15, paddingRight: 15, overflowWrap: 'anywhere' }}>
						{content.body}
					</p>

					{
						content.action &&
						<button
							className='btnH'
							style={styles.btnAction}
							onClick={content.action}
						>
							<p style={{ fontSize: 16, color: 'white' }}>
								{content.buttonText}
							</p>
						</button>
					}

					{
						content.loading &&
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					}

					{
						content.canCancel &&
						<button
							style={{ position: 'absolute', right: 15, top: 15 }}
							onClick={() => this.props.mintFail()}
						>
							<IoClose
								color='white'
								size={25}
							/>
						</button>
					}

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		minHeight: 240,
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
		borderWidth: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid'
	},
	btnAction: {
		width: 180,
		height: 42,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
		backgroundColor: CTA_COLOR
	}
}

const mapStateToProps = (state) => {
	const { transactionState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit } = state.mainReducer
	const { transactionToConfirmText, typeModal, transactionOkText, nameNft, saleValues, howMuchIncrement, statToUpgrade, idNft, nicknameToSet, ringToEquipName, wizaAmount, toSubscribePvP, inputPrice, makeOfferValues } = state.modalTransactionReducer


	return { transactionState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit, transactionToConfirmText, typeModal, transactionOkText, nameNft, saleValues, howMuchIncrement, statToUpgrade, idNft, nicknameToSet, ringToEquipName, wizaAmount, toSubscribePvP, inputPrice, makeOfferValues }
}

export default connect(mapStateToProps, {
	signTransaction,
	updateTransactionState
})(ModalTransaction);
