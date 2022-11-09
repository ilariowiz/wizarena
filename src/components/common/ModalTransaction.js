import React, { Component } from 'react';
import { connect } from 'react-redux'
import { doc, updateDoc, setDoc, increment, collection, serverTimestamp } from "firebase/firestore";
import { firebasedb } from '../Firebase';
import { IoClose } from 'react-icons/io5'
import DotLoader from 'react-spinners/DotLoader';
import Pact from "pact-lang-api";
import '../../css/Modal.css'
import {
	signTransaction,
	updateTransactionState
} from '../../actions'
import { TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../../actions/types'
import '../../css/Nft.css'


const POLL_INTERVAL_S = 3

class ModalTransaction extends Component {

	checkTransaction() {
		const { transactionState } = this.props

		if (transactionState && transactionState.requestKey) {
			console.log(transactionState.requestKey)

			this.pollForTransaction()
		}
	}

	pollForTransaction = async () => {
		const { transactionState, networkUrl, nameNft, statToUpgrade, type, wizaCostToUpgrade, account } = this.props


		const requestKey = transactionState.requestKey

		let time_spent_polling_s = 0;
		let pollRes = null

		while (time_spent_polling_s < 240) {
			await this.wait(POLL_INTERVAL_S * 1000)

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

			//chiamato solo per transaction upgrade, serve per far funzionare correttamente i filtri su firebase
			if (type === "upgrade" && nameNft && statToUpgrade) {

				const docRef = doc(firebasedb, "stats", `${nameNft}`)
				updateDoc(docRef, {
		            [statToUpgrade]: increment(1)
		        })

				const docRefHistory = doc(collection(firebasedb, "history_upgrades"))
				let objHistory = {
					address: account.account,
					cost: wizaCostToUpgrade,
					idnft: nameNft,
					stat: statToUpgrade,
					timestamp: serverTimestamp()
				}

				setDoc(docRefHistory, objHistory)
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
		const { transactionState, isXWallet, netId, networkUrl, account, chainId, type, inputPrice, idNft, nameNft, statToUpgrade, wizaCostToUpgrade } = this.props

		//console.log(isXWallet)

		//CASO INIZIALE, signingCmd != null in transactionState
		let title = 'Signing transaction'
		let body = 'Check your wallet to sign transaction'
		let buttonText = 'Test'
		let action = null
		let loading = false
		let canCancel = false

		if (transactionState) {

			if (transactionState.cmdToConfirm != null) {
				title = 'Review transaction'
				body = ''
				if (type === 'mint') {
					body = `You will mint 1 wizard`
				}
				else if (type === 'list') {
					body = `You will list ${nameNft} for ${inputPrice} KDA`
				}
				else if (type === 'delist') {
					body = `You will delist ${nameNft}`
				}
				else if (type === 'buy') {
					body = `You will buy ${nameNft} (you will need KDA on chain 1)`
				}
				else if (type === 'subscription') {
					body = `You will subscribe ${nameNft}`
				}
				else if (type === 'withdraw') {
					body = 'You will collect your prize'
				}
				else if (type === 'transfer') {
					body = `You will transfer ${nameNft} to another wallet`
				}
				else if (type === 'stake') {
					body = `You will stake ${nameNft}. You can unstake it any time. While it is staked you will not be able to sell this wizard but you will still be able to register it for tournaments.`
				}
				else if (type === 'unstake') {
					body = `You will unstake ${nameNft}`
				}
				else if (type === 'claim') {
					body = `You will claim your $WIZA mined by ${nameNft}`
				}
				else if (type === 'claimall') {
					body = `You will claim your $WIZA mined by all your wizards`
				}
				else if (type === 'upgrade') {
					body = `You will improve the ${statToUpgrade} of ${nameNft}`
				}

				buttonText = 'Open Wallet'
				action = async () => this.props.signTransaction(transactionState.cmdToConfirm, isXWallet, netId, networkUrl, account, chainId, idNft, () => this.checkTransaction())
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
				body = `Transaction key: ${transactionState.requestKey.slice(0, 15)}...`
				buttonText = ''
				action = null
				loading = true
				canCancel = false
			}

			if (transactionState.success != null) {
				title = 'Transaction completed!'
				body = ''
				buttonText = ''
				if (type === 'mint') {
					body = "Wizard successfully minted!"
					buttonText = 'Profile'
				}
				else if (type === 'list') {
					body = 'Listing successfully'
					buttonText = 'Close'
				}
				else if (type === 'delist') {
					body = 'Delisting successfully'
					buttonText = 'Close'
				}
				else if (type === 'buy') {
					body = `You bought ${nameNft}`
					buttonText = 'Close'
				}
				else if (type === 'subscription') {
					body = `Your Wizard ${nameNft} is enrolled in this tournament!`
					buttonText = 'Close'
				}
				else if (type === 'withdraw') {
					body = `Prize successfully withdrawn!`
					buttonText = 'Close'
				}
				else if (type === 'transfer') {
					body = `Transfer completed successfully`
					buttonText = 'Close'
				}
				else if (type === 'stake') {
					body = `Your Wizard ${nameNft} is staked!`
					buttonText = 'Close'
				}
				else if (type === 'unstake') {
					body = `Your Wizard ${nameNft} is unstaked!`
					buttonText = 'Close'
				}
				else if (type === 'claim' || type === 'claimall') {
					body = `Your $WIZA have been claimed!`
					buttonText = 'Close'
				}
				else if (type === 'upgrade') {
					body = `Your Wizard ${nameNft} is stronger now!`
					buttonText = 'Close'
				}

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
	const { transactionState, isXWallet, netId, networkUrl, account, chainId, gasPrice, gasLimit } = state.mainReducer

	return { transactionState, isXWallet, netId, networkUrl, account, chainId, gasPrice, gasLimit }
}

export default connect(mapStateToProps, {
	signTransaction,
	updateTransactionState
})(ModalTransaction);
