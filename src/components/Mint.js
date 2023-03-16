import React, { Component } from "react";
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import Media from 'react-media';
import { AiOutlinePlus } from 'react-icons/ai'
import { AiOutlineMinus } from 'react-icons/ai'
import Header from './Header'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import getBoxWidth from './common/GetBoxW'
import {
	mintNft,
	clearTransaction,
	getNumberMinted,
	loadMaxItemsPerWallet,
	setNetworkSettings,
	setNetworkUrl,
	readAccountMinted,
	getMintPhase,
	getMintPrice,
	updateInfoTransactionModal
} from '../actions'
import { MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../actions/types'
import '../css/Nft.css'

const logo = require('../assets/wiz_logo_centrale.png')
const sample1 = require('../assets/sneak/sneak1.png')
const sample2 = require('../assets/sneak/sneak2.png')
const sample3 = require('../assets/sneak/sneak3.png')
const sample4 = require('../assets/sneak/sneak4.png')


class Mint extends Component {
	constructor(props) {
		super(props)

		this.countdownMinted = null

		this.state = {
			amount: 1,
			showModalConnection: false,
			stage: 'early',
			countdownDuration: undefined,
			error: '',
			maxItemsPerWallet: -1,
			loading: true,
			mintPrice: 0,
			inFreeList: false,
			inWList: false
		}
	}

	componentDidMount() {
		const { account } = this.props

		document.title = "Mint - Wizards Arena"

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		setTimeout(() => {
			this.getMintPhase()
			this.getMintPrice()

			if (account && account.account) {
				this.checkWalletInList('0')
				this.checkWalletInList('1')
			}

		}, 500)
	}

	//metodo chiamato prima di fare il calcolo tra quelli che hai mintato e i max,
	//quindi come risposta avremo: 0 all'inizio, 5 durante WL, > 5 durante public
	calcStage(phase) {
		let stage = 'early';

		if (phase === "-1") {
			stage = 'early'
		}
		else if (phase === "0") {
			stage = "free"
		}
		else if (phase === "1") {
			stage = "wl"
		}
		else if (phase === "2") {
			stage = "public"
		}

		//console.log(stage)
		return stage
	}

	getMintPhase() {
		const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

		this.props.getMintPhase(chainId, gasPrice, gasLimit, networkUrl, (response) => {
			const stage = this.calcStage(response)
			this.setState({ stage })

			if (response !== "-1" && account.account) {
				this.maxItemsPerWallet(response)
			}
			else {
				this.setState({ loading: false })
			}
		})
	}

	checkWalletInList(phase) {
		const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

		this.props.loadMaxItemsPerWallet(chainId, gasPrice, gasLimit, networkUrl, account, phase, (res) => {
			//console.log(res);
			if (res.status && res.status === "failure") {
				//non sei in questa fase
			}
			else {
				if (phase === "0") {
					if (res > 0) {
						this.setState({ inFreeList: true })
					}
				}
				else {
					this.setState({ inWList: true })
				}
			}
		})
	}

	getMintPrice() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getMintPrice(chainId, gasPrice, gasLimit, networkUrl, (response) => {
			this.setState({ mintPrice: response })
		})
	}

	maxItemsPerWallet(phase) {
		const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props
		const { stage } = this.state

		this.props.loadMaxItemsPerWallet(chainId, gasPrice, gasLimit, networkUrl, account, phase, (res) => {
			//ci interessa sapere quanti ne ha mintati, solo durante la wl che c'è un numero massimo di mint
			//altrimenti non ci interessa saperlo perché il numero sarà molto alto
			//console.log(res);
			if (account && account.account) {
				if (res.status && res.status === "failure") {
					this.setState({ maxItemsPerWallet: -1, loading: false })
				}
				else {
					this.props.readAccountMinted(chainId, gasPrice, gasLimit, networkUrl, account.account, phase, (minted) => {
						//console.log(minted)

						if (minted.status && minted.status === "failure") {
							this.setState({ maxItemsPerWallet: 0, loading: false })
						}
						else {
							this.setState({ maxItemsPerWallet: res - minted, loading: false })
						}
					})
				}
			}
			else {
				this.setState({ maxItemsPerWallet: 0, loading: false })
			}

			this.minted()

			if (stage !== 'early') {
				this.countdownMinted = setInterval(() => {
					this.minted()
				}, 60000)
			}
		})
	}


	minted() {
		const { chainId, gasPrice, gasLimit, networkUrl, countMinted } = this.props

		if (!networkUrl) {
			return
		}

		//console.log(countMinted);

		if (countMinted >= 3072) {
			clearInterval(this.countdownMinted)
			this.countdownMinted = null
			return
		}

		this.props.getNumberMinted(chainId, gasPrice, gasLimit, networkUrl)
	}

	mint() {
		const { amount, stage, maxItemsPerWallet, mintPrice } = this.state;
		const { account, chainId, gasPrice, netId } = this.props

		if (amount > maxItemsPerWallet) {
			this.setState({ error: 'You can\'t mint others Druids' })
			return
		}

		if (stage === 'early') {
			this.setState({ error: 'Mint not started yet' })
			return
		}

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will mint ${amount} Druids`,
			typeModal: 'mint',
			transactionOkText: "Druids successfully minted!",
		})

		this.props.mintNft(chainId, gasPrice, netId, amount, account, stage, mintPrice)
	}

	renderHeader(width) {

		return (
			<div style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 20, width }}>
				<p style={{ fontSize: 21, color: 'white', marginBottom: 8 }}>
					How to mint
				</p>

				<div style={{ flexDirection: 'column' }}>
					<p style={styles.textHow}>
						1. Click the "Connect wallet" button
					</p>

					<p style={styles.textHow}>
						2. Select with which wallet you want to connect
					</p>

					<p style={styles.textHow}>
						3. Once connected, your k: address will be visible at the top right and the "Connect wallet" button will be replaced by "Mint" button
					</p>
				</div>
			</div>
		)
	}

	renderProgress(width) {
		const { countMinted } = this.props

		let minted = countMinted || 0;

		const max = 3072

		const progress = minted / max * 100

		return (
			<div style={Object.assign({}, styles.boxProgress, { width })}>

				<div style={{ position: 'absolute', height: '100%', width: `${progress}%`, left: 0, backgroundColor: TEXT_SECONDARY_COLOR }} />

				<p style={{ color: 'white', fontSize: 20, zIndex: 100 }}>
					{minted.toLocaleString()} / {max.toLocaleString()}
				</p>
			</div>
		)
	}

	renderEarly(width) {
		return (
			<div
				style={Object.assign({}, styles.btnConnect, { width, cursor: 'default' })}
			>
				<p style={{ fontSize: 19, color: TEXT_SECONDARY_COLOR }}>
					Mint not started yet
				</p>
			</div>
		)
	}

	renderBtnMint(width) {
		const { maxItemsPerWallet, amount, stage } = this.state
		const { countMinted, account } = this.props

		if (countMinted && countMinted === 3072) {
			return (
				<div style={Object.assign({}, styles.btnConnect, { width, cursor: 'default' })}>
					<p style={{ fontSize: 19, color: TEXT_SECONDARY_COLOR }}>
						SOLD OUT
					</p>
				</div>
			)
		}

		if (!account || !account.account) {
			return (
				<button
					className='btnH'
					style={Object.assign({}, styles.btnConnect, { width })}
					onClick={() => this.setState({ showModalConnection: true })}
				>
					<p style={{ fontSize: 19, color: TEXT_SECONDARY_COLOR }}>
						Connect wallet
					</p>
				</button>
			)
		}

		return (
			<div style={{ width, flexDirection: 'column' }}>
				<div style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 }}>
					{
						maxItemsPerWallet > -1 && stage !== 'public' &&
						<div style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
							<p style={{ fontSize: 17, color: '#c2c0c0' }}>
								You can mint up to
							</p>

							<p style={{ fontSize: 19, fontWeight: '500', color: 'white' }}>
								{maxItemsPerWallet}
							</p>
						</div>
					}

					{
						maxItemsPerWallet < 0 &&
						<p style={{ fontSize: 16, color: 'white' }}>
							Your wallet cannot mint at this stage
						</p>
					}
				</div>

				{
					maxItemsPerWallet === -1 &&
					<div
						style={Object.assign({}, styles.btnConnect, { width })}
					>
						<p style={{ fontSize: 18, color: 'white' }}>
							Wait next stage
						</p>
					</div>
				}

				{
					maxItemsPerWallet === 0 &&
					<div
						style={Object.assign({}, styles.btnConnect, { width })}
					>
						<p style={{ fontSize: 18, color: 'white' }}>
							Max reached
						</p>
					</div>
				}

				{
					maxItemsPerWallet > 0 &&
					<div style={Object.assign({}, styles.btnMint, { width })}>
						<button
							style={{ marginLeft: 20, cursor: 'pointer' }}
							onClick={() => {
								if (amount === 1) {
									return
								}

								this.setState({ amount: amount - 1 })
							}}
						>
							<AiOutlineMinus
								color="white"
								size={24}
							/>
						</button>

						<p style={{ fontSize: 22, color: 'white' }}>
							{amount}
						</p>

						<button
							style={{ marginRight: 20, cursor: 'pointer' }}
							onClick={() => {
								if (amount === maxItemsPerWallet) {
									return
								}

								if (maxItemsPerWallet === 200 && amount === 10) {
									return
								}

								this.setState({ amount: amount + 1 })
							}}
						>
							<AiOutlinePlus
								color="white"
								size={24}
							/>
						</button>
					</div>

				}



				{
					maxItemsPerWallet > 0 &&
					<button
						className='btnH'
						style={Object.assign({}, styles.btnMint, { width, marginBottom: 5 })}
						onClick={() => this.mint()}
					>
						<p style={{ fontSize: 19, color: 'white' }}>
							{
								stage === "free" ?
								`MINT ${amount} Druids for FREE`
								:
								`MINT ${amount} Druids for ${this.state.mintPrice * amount} KDA`
							}
						</p>
					</button>
				}

				{
					maxItemsPerWallet > 0 && stage === "public" ?
					<div style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}>
						<p style={{ fontSize: 14, color: 'white' }}>
							Max 10 per transaction
						</p>
					</div>
					:
					<div style={{ height: 20 }} />
				}

			</div>
		)
	}

	renderSample(img, width) {
		return (
			<img
				src={img}
				style={{ width, height: width, borderRadius: 2, marginRight: 15, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
				alt='Sample'
			/>
		)
	}

	renderBoxMint() {
		const { stage, loading, error, mintPrice, inFreeList, inWList } = this.state
		const { account } = this.props

		let title = stage !== 'early' ? `STAGE: ${stage.toUpperCase()} MINT` : 'EARLY'

		return (
			<div style={{ flexDirection: 'column', width: '90%', alignItems: 'flex-start' }}>

				<p style={{ fontSize: 20, color: 'white', marginBottom: 20 }}>
					{title}
				</p>

				<div style={{ flexDirection: 'column', marginBottom: 15 }}>
					<p style={{  fontSize: 19, color: 'white', marginBottom: 10 }}>
						Your wallet is eligible for
					</p>

					<p style={{  fontSize: 16, color: inFreeList ? "white" : "#c2c0c0", marginBottom: 10 }}>
						-Free Mint: {inFreeList ? "YES" : "NO"}
					</p>

					<p style={{  fontSize: 16, color: inWList ? "white" : "#c2c0c0", marginBottom: 10 }}>
						-WL: {inWList ? "YES" : "NO"}
					</p>

				</div>

				<div style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 }}>
					<p style={{ fontSize: 17, color: '#c2c0c0' }}>
						Mint Price
					</p>

					<p style={{ fontSize: 19, color: 'white' }}>
						{stage === "free" ? "FREE" : `${mintPrice} KDA`}
					</p>
				</div>

				{
					loading &&
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
						<DotLoader size={28} color={TEXT_SECONDARY_COLOR} />
						<p style={{ marginLeft: 15, color: 'white' }}>Loading...</p>
					</div>
				}

				{
					stage !== 'early' && !loading &&
					this.renderBtnMint('100%')
				}

				{
					stage === 'early' && !loading &&
					this.renderEarly('100%')
				}

				{
					stage !== 'early' && account.account ?
					<div style={{ flexDirection: 'column', width: '100%' }}>
						<p style={{ fontSize: 17, color: '#c2c0c0' }}>
							Minted
						</p>

						{this.renderProgress('100%')}
					</div>
					: null
				}

				{
					error ?
					<p style={{ fontSize: 17, color: 'red', marginBottom: 20 }}>
						{error}
					</p>
					: null
				}

			</div>
		)
	}

	renderBody(isMobile) {
		const { showModalConnection, stage } = this.state

		const { boxW, modalW } = getBoxWidth(isMobile)

		let width = boxW > 1200 ? 1200 : boxW

		let containerStyle = {
			width,
			flexDirection: 'row',
			alignItems: 'flex-start',
			justifyContent: 'space-between'
		}

		if (isMobile) {
			containerStyle = { width, flexDirection: 'column' }
		}

		let widthLeft = isMobile ? width - 45 : Math.floor((width * 60 / 100) - 60)
		let sampleWidth = widthLeft / 4

		let stageTxt = stage !== 'early' ? `${stage.toUpperCase()} MINT` : 'EARLY'

		return (
			<div style={{ flexDirection: 'column', width, marginTop: 30 }}>
				<div style={containerStyle}>

					<div style={{ flex: 0.6, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20, marginBottom: 30 }}>
						<div style={{ flexDirection: 'column' }}>

							<div style={{ marginBottom: 20 }}>
								<img
									src={logo}
									style={{ width: 60, height: 60, marginRight: 15 }}
									alt='Wizard Logo'
								/>

								<div style={{ flexDirection: 'column', justifyContent: 'center' }}>
									<p style={{ fontSize: 26, color: 'white', lineHeight: 1 }}>Druids Arena</p>
									<p style={{ fontSize: 17, color: '#c2c0c0', lineHeight: 1 }}>Supply: 1.024</p>
								</div>
							</div>

							<div style={{ height: 35, width: 120, paddingLeft: 10, paddingRight: 10, borderWidth: 2, borderRadius: 2, borderColor: TEXT_SECONDARY_COLOR, borderStyle: 'solid', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
								<p style={{ fontSize: 16, color: 'white' }}>{stageTxt}</p>
							</div>

							{this.renderHeader('90%')}

						</div>

					</div>

					<div style={{ flex: 0.4, backgroundColor: '#857f7220', borderRadius: 2, alignItems: 'flex-start', justifyContent: 'center', paddingTop: 20, marginBottom: 30 }}>

						{this.renderBoxMint()}
					</div>
				</div>

				<div style={{ width, flexDirection: 'column', marginBottom: 30 }}>
					<p style={{ fontSize: 19, color: 'white', marginBottom: 10 }}>
						Sample Drops
					</p>

					<div>
						{this.renderSample(sample1, sampleWidth)}
						{this.renderSample(sample2, sampleWidth)}
						{this.renderSample(sample3, sampleWidth)}
						{this.renderSample(sample4, sampleWidth)}
					</div>
				</div>

				<ModalConnectionWidget
					width={modalW}
					showModal={showModalConnection}
					onCloseModal={() => {
						this.setState({ showModalConnection: false })
						this.getMintPhase()
					}}
				/>
			</div>
		)
	}

	renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={2}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

	render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
	container: {
		flexDirection: 'column',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
	container2: {
		width: '90%',
		marginTop: 30,
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between'
	},
	btnMint: {
		flexDirection: 'row',
		height: 45,
		backgroundColor: CTA_COLOR,
		borderRadius: 2,
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20
	},
	btnConnect: {
		height: 45,
		backgroundColor: 'transparent',
		borderRadius: 2,
		borderWidth: 2,
		borderColor: CTA_COLOR,
		borderStyle: 'solid',
		alignItems: 'center',
		cursor: 'pointer',
		justifyContent: 'center',
		marginBottom: 20
	},
	textHow: {
		fontSize: 17,
		color: '#c2c0c0',
		marginBottom: 8,
		lineHeight: 1.2
	},
	boxProgress: {
		height: 35,
		marginBottom: 20,
		borderRadius: 2,
		borderColor: '#c2c0c080',
		borderWidth: 2,
		borderStyle: 'solid',
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		overflow: 'hidden'
	},
	boxMint: {
		flexDirection: 'column',
		paddingTop: 20,
		paddingBottom: 20,
		borderWidth: 2,
		borderColor: 'white',
		borderStyle: 'solid',
		borderRadius: 2,
		justifyContent: 'center',
		alignItems: 'center'
	},
	boxCountdown: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative'
	},
}

const mapStateToProps = (state) => {
	const { totalCountNfts, account, chainId, gasPrice, gasLimit, netId, networkUrl, countMinted } = state.mainReducer;

	return { totalCountNfts, account, chainId, gasPrice, gasLimit, netId, networkUrl, countMinted };
}

export default connect(mapStateToProps, {
	mintNft,
	clearTransaction,
	getNumberMinted,
	loadMaxItemsPerWallet,
	setNetworkSettings,
	setNetworkUrl,
	readAccountMinted,
	getMintPhase,
	getMintPrice,
	updateInfoTransactionModal
})(Mint)
