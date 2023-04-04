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
	updateTransactionState,
	pollForTransaction,
	hideModalTx,
	addTxKeyToInfo,
	clearTransactionByPactCode
} from '../../actions'
import { TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../../actions/types'
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
					}, 500)
				}
				else if (i.requestKey && !txListen.includes(i.requestKey)) {
					setTimeout(() => {
						this.props.pollForTransaction(this.props, i.requestKey)
					}, 500)
				}
			})
		}
	}

	checkTransaction() {
		const { transactionsState, txInfo } = this.props

		const txState = transactionsState && transactionsState.length > 0 ? transactionsState[transactionsState.length-1] : {}

		if (txState && txState.requestKey) {
			//console.log(txState.requestKey)

			const typeModal = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].typeModal : ""
			const toSubscribePvP = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].toSubscribePvP : ""
			const pvpWeek = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].pvpWeek : ""
			const nameNft = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].nameNft : ""
			const wizaAmount = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].wizaAmount : ""

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
				if (txInfo && txInfo.length > 0) {
					const info = txInfo.find(i => i.requestKey === txState.requestKey)
					if (info) {
						transactionOkText = info.transactionOkText
					}
				}

				title = 'Transaction completed!'
				body = transactionOkText
				buttonText = 'Close'

				action = () => this.props.mintSuccess(txState.requestKey)
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
	const { transactionsState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit } = state.mainReducer
	const { txInfo, txListen, txSucceed } = state.modalTransactionReducer


	return { transactionsState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit, txInfo, txListen, txSucceed }
}

export default connect(mapStateToProps, {
	signTransaction,
	updateTransactionState,
	pollForTransaction,
	hideModalTx,
	addTxKeyToInfo,
	clearTransactionByPactCode
})(ModalTransaction);
