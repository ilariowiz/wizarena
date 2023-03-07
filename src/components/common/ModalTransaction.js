import React, { Component } from 'react';
import { connect } from 'react-redux'
import { doc, updateDoc, setDoc, increment } from "firebase/firestore";
import { firebasedb } from '../Firebase';
import { IoClose } from 'react-icons/io5'
import DotLoader from 'react-spinners/DotLoader';
import Pact from "pact-lang-api";
import { sendMessage, sendMessageSales, sendMessageListed, sendMessageDelisted, sendMessageUpdateNickname, sendMessageUpgrade, sendMessageListedEquipment, sendMessageDelistedEquipment, sendMessageSalesEquipment, sendMessageOfferItem } from './WebhookDiscord'
import '../../css/Modal.css'
import {
	signTransaction,
	updateTransactionState
} from '../../actions'
import { TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR, RING_MINT_PRICE } from '../../actions/types'
import '../../css/Nft.css'


const POLL_INTERVAL_S = 3

class ModalTransaction extends Component {

	componentDidMount() {
		//sendMessageUpgrade("866", "#866 Joneleth Irenicus", "hp", 1)
		//sendMessage("866", 32, 3, "k:461ae9f3c9c255112ac3797f6b15699c656c9bc44ed089551a0f792085ef9504")
	}

	checkTransaction() {
		const { transactionState } = this.props

		if (transactionState && transactionState.requestKey) {
			console.log(transactionState.requestKey)

			this.pollForTransaction()
		}
	}

	pollForTransaction = async () => {
		const { transactionState, networkUrl, nameNft, idNft, inputPrice, statToUpgrade, howMuchIncrement, type, pvpWeek, makeOfferValues, saleValues, wizaAmount, nicknameToSet, ringToEquipName, toSubscribePvP } = this.props


		const requestKey = transactionState.requestKey

		let time_spent_polling_s = 0;
		let pollRes = null

		while (time_spent_polling_s < 240) {
			await this.wait(POLL_INTERVAL_S * 2000)

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

			if (type === "upgrade" && nameNft && statToUpgrade && howMuchIncrement) {
				const msg = `${nameNft} upgrade ${statToUpgrade.toUpperCase()} by ${howMuchIncrement}`
				sendMessageUpgrade(idNft, msg)
			}
			else if (type === "downgrade" && nameNft && statToUpgrade && howMuchIncrement) {
				const msg = `${nameNft} downgrade ${statToUpgrade.toUpperCase()} by ${howMuchIncrement}`
				sendMessageUpgrade(idNft, msg)
			}
			else if (type === "buyvial" && nameNft && statToUpgrade) {
				const msg = `${nameNft} bought a ${statToUpgrade.toUpperCase()} vial`
				sendMessageUpgrade(idNft, msg)
			}
			else if (type === "subscribe_pvp") {

				toSubscribePvP.map(i => {
					const docRef = doc(firebasedb, "pvp_results", `${i.week}_#${i.idnft}`)
					setDoc(docRef, { "lose": 0, "win": 0, "maxFights": i.wizaAmount })

					const docRefTraining = doc(firebasedb, "pvp_training", `${i.week}_#${i.idnft}`)
					setDoc(docRefTraining, { "lose": 0, "win": 0 })
				})
			}
			else if (type === "increment_fight_pvp") {
				const docRef = doc(firebasedb, "pvp_results", `${pvpWeek}_${nameNft}`)
				updateDoc(docRef, {"maxFights": increment(wizaAmount) })
			}
			else if (type === "makeoffer") {
				//console.log(makeOfferValues);
				sendMessage(makeOfferValues.id, makeOfferValues.amount, makeOfferValues.duration, makeOfferValues.owner)
			}
			else if (type === "makeofferitem") {
				//console.log(makeOfferValues);
				sendMessageOfferItem(makeOfferValues)
			}
			else if (type === "acceptoffer" || type === "buy") {
				sendMessageSales(saleValues.id, saleValues.amount)
			}
			else if (type === "buyequipment" || type === "acceptofferequipment") {
				sendMessageSalesEquipment(saleValues)
			}
			else if (type === "list") {
				sendMessageListed(idNft, inputPrice)
			}
			else if (type === 'listequipment') {
				sendMessageListedEquipment(saleValues)
			}
			else if (type === "delist") {
				sendMessageDelisted(nameNft.replace("#", ""))
			}
			else if (type === "delistequipment") {
				sendMessageDelistedEquipment(saleValues)
			}
			else if (type === "equip") {
				const msg = `${nameNft} wore the ${ringToEquipName}`
				sendMessageUpgrade(nameNft.replace("#", ""), msg)
			}
			else if (type === "buynickname") {
				sendMessageUpdateNickname(nameNft.replace("#", ""), nicknameToSet)
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
		const { transactionState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, type, inputPrice, idNft, nameNft, statToUpgrade, amountToMint, offerInfoRecap, wizaAmount, nicknameToSet, apToBurn, numberOfChest, ringToEquipName, makeOfferValues, sumSubscribePvP } = this.props

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
					body = `You will mint ${amountToMint} Clerics`
				}
				else if (type === 'list') {
					body = `You will list ${nameNft} for ${inputPrice} KDA. Marketplace Fee: 7%`
				}
				else if (type === 'listequipment') {
					body = `You will list ${nameNft} for ${inputPrice} WIZA. Marketplace Fee: 2%`
				}
				else if (type === 'delist' || type === 'delistequipment') {
					body = `You will delist ${nameNft}`
				}
				else if (type === 'buy') {
					body = `You will buy ${nameNft} (you will need KDA on chain 1)`
				}
				else if (type === 'buyequipment') {
					body = `You will buy ${nameNft} (you will need WIZA on chain 1)`
				}
				else if (type === 'subscribe_pvp') {
					body = sumSubscribePvP
				}
				else if (type === 'increment_fight_pvp') {
					body = `You will increase the number of fights Wizard ${nameNft} can do by ${wizaAmount}`
				}
				else if (type === 'subscriptionmass') {
					body = nameNft
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
				else if (type === 'unstakeandclaimall') {
					body = `You will unstake and claim your $WIZA mined by all your wizards`
				}
				else if (type === 'stakeall') {
					body = `You will stake all your wizards that aren't listed or in burning queue`
				}
				else if (type === 'burningon') {
					body = `You will add Wizard ${nameNft} to the burning queue`
				}
				else if (type === 'burningoff') {
					body = `You will remove ${nameNft} from burning queue`
				}
				else if (type === 'upgrade') {
					body = `You will improve the ${statToUpgrade} of ${nameNft}`
				}
				else if (type === 'downgrade') {
					body = `You will downgrade the ${statToUpgrade} of ${nameNft}`
				}
				else if (type === 'buyvial') {
					body = `You will buy the ${statToUpgrade} vial for the ${nameNft}`
				}
				else if (type === 'changespell_pvp') {
					body = `You will change the spell of ${nameNft}`
				}
				else if (type === 'makeoffer') {
					body = `You will submit the offer. Remember that the amount of the offer will be locked in the contract for the duration of the offer.`
				}
				else if (type === "acceptoffer" || type === "acceptofferequipment") {
					body = offerInfoRecap || "You will accept this offer"
				}
				else if (type === "withdrawoffer") {
					body = 'You will withdraw funds from this offer'
				}
				else if (type === "forge") {
					body = 'You are about to forge a ring.'
				}
				else if (type === "buynickname") {
					body = `You will give the nickname ${nicknameToSet} to Wizard ${nameNft}`
				}
				else if (type === "burnap") {
					body = `You will burn ${apToBurn} AP for ${apToBurn*15} $WIZA`
				}
				else if (type === "buychest") {
					body = `You will buy ${numberOfChest} ${numberOfChest > 1 ? "chests" : "chest"} for ${numberOfChest*RING_MINT_PRICE} $KDA`
				}
				else if (type === "equip") {
					body = `You will equip ${ringToEquipName} to ${nameNft}`
				}
				else if (type === "unequip") {
					body = `You will unequip ${ringToEquipName} from ${nameNft}`
				}
				else if (type === "makeofferitem") {
					body = `You will offer ${makeOfferValues.amount} WIZA for ${makeOfferValues.ringType}, expiring in ${makeOfferValues.duration} ${makeOfferValues.duration > 1 ? "days" : "day"}`
				}

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
					body = "Clerics successfully minted!"
					buttonText = 'Close'
				}
				else if (type === 'list' || type === 'listequipment') {
					body = 'Listing successfully'
					buttonText = 'Close'
				}
				else if (type === 'delist' || type === "delistequipment") {
					body = 'Delisting successfully'
					buttonText = 'Close'
				}
				else if (type === 'buy' || type === 'buyequipment') {
					body = `You bought ${nameNft}`
					buttonText = 'Close'
				}
				else if (type === 'subscriptionmass') {
					body = `Your Wizards are registered for the tournament!`
					buttonText = 'Close'
				}
				else if (type === 'subscribe_pvp') {
					body = `Your Wizards are registered for PvP arena!`
					buttonText = 'Close'
				}
				else if (type === 'increment_fight_pvp') {
					body = `Maximum fights increased!`
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
				else if (type === 'stakeall') {
					body = `Your Wizards are staked!`
					buttonText = 'Close'
				}
				else if (type === 'unstake') {
					body = `Your Wizard ${nameNft} is unstaked!`
					buttonText = 'Close'
				}
				else if (type === 'burningon') {
					body = `Your Wizard ${nameNft} has been added to the burning queue!`
					buttonText = 'Close'
				}
				else if (type === 'burningoff') {
					body = `Your Wizard ${nameNft} has been removed from the burning queue`
					buttonText = 'Close'
				}
				else if (type === 'claim' || type === 'claimall' || type === "unstakeandclaimall") {
					body = `Your $WIZA have been claimed!`
					buttonText = 'Close'
				}
				else if (type === 'upgrade') {
					body = `Your Wizard ${nameNft} is stronger now!`
					buttonText = 'Close'
				}
				else if (type === 'downgrade') {
					body = 'Retrain done!'
					buttonText = 'Close'
				}
				else if (type === 'buyvial') {
					body = `Vial bought!`
					buttonText = 'Close'
				}
				else if (type === 'changespell_pvp') {
					body = `Spell changed!`
					buttonText = 'Close'
				}
				else if (type === 'makeoffer' || type === 'makeofferitem') {
					body = `Offer sent!`
					buttonText = 'Close'
				}
				else if (type === 'acceptoffer' || type === 'acceptofferequipment') {
					body = `Offer accepted!`
					buttonText = 'Close'
				}
				else if (type === 'withdrawoffer') {
					body = 'Funds successfully withdrawn'
					buttonText = 'Close'
				}
				else if (type === 'buynickname') {
					body = 'Nickname set successfully'
					buttonText = 'Close'
				}
				else if (type === 'burnap') {
					body = 'AP burned successfully'
					buttonText = 'Close'
				}
				else if (type === 'forge') {
					body = 'Ring forged successfully'
					buttonText = 'Close'
				}
				else if (type === 'buychest') {
					body = `${numberOfChest} ${numberOfChest > 1 ? 'chests' : 'chest'} successfully bought!`
					buttonText = 'Close'
				}
				else if (type === 'equip') {
					body = `${ringToEquipName} successfully equipped!`
					buttonText = 'Close'
				}
				else if (type === 'unequip') {
					body = `${ringToEquipName} successfully unequipped!`
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
	const { transactionState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit } = state.mainReducer

	return { transactionState, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, gasPrice, gasLimit }
}

export default connect(mapStateToProps, {
	signTransaction,
	updateTransactionState
})(ModalTransaction);
