import React, { Component } from 'react';
import { connect } from 'react-redux'
import _ from 'lodash'
import { IoMenu } from 'react-icons/io5'
import { IoClose } from 'react-icons/io5'
import { SiDiscord } from 'react-icons/si'
import { SiTwitter } from 'react-icons/si'
import ModalBuyWIZA from './common/ModalBuyWIZA'
import ModalTransaction from './common/ModalTransaction'
import getBoxWidth from './common/GetBoxW'
import '../css/Header.css'
import {
	getTotalMined,
	getCirculatingSupply,
	setNetworkSettings,
	setNetworkUrl,
	logout,
	getWizaNotClaimed,
	swapKdaWiza,
	clearTransaction,
	updateInfoTransactionModal
} from '../actions'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, MAIN_NET_ID } from '../actions/types'

const logo_img = require('../assets/wiz_logo.png')


class Header extends Component {
	constructor(props) {
		super(props)

		this.state = {
			showPanel: false,
			showModalBuy: false,
		}
	}

	componentDidMount() {
		const { circulatingSupply } = this.props

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		if (!circulatingSupply) {
			setTimeout(() => {
				this.getMined()
				this.getSupply()
				this.getWizaNotClaimed()
			}, 1000)
		}
	}

	getMined() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getTotalMined(chainId, gasPrice, gasLimit, networkUrl)
	}

	getSupply() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getCirculatingSupply(chainId, gasPrice, gasLimit, networkUrl)
	}

	getPct(numb) {
		if (!numb) {
			return ''
		}

		const maxSupply = 13240000

		const pct = numb / maxSupply * 100
		return `${_.floor(pct, 2)}%`
	}

	getWizaNotClaimed() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getWizaNotClaimed(chainId, gasPrice, gasLimit, networkUrl)
	}

	swap(amount, estimatedWiza) {
        const { chainId, gasPrice, netId, account } = this.props

        //console.log(account);

        if (!amount || !account.account || !estimatedWiza) {
            return
        }

        let decAmount = amount
        if (!decAmount.includes(',') && !decAmount.includes('.')) {
            decAmount = `${decAmount}.0`
        }

        const text = `You will swap ${decAmount} KDA to (estimated) ${estimatedWiza} WIZA`
		this.props.updateInfoTransactionModal({
			transactionToConfirmText: text,
			typeModal: 'swap',
			transactionOkText: 'Swap was successfully'
		})

		this.setState({ showModalBuy: false })
		this.props.swapKdaWiza(chainId, gasPrice, netId, parseFloat(decAmount), estimatedWiza, account)
    }

	renderSlidePanel(boxW) {
		const { showPanel } = this.state
		const { isMobile, circulatingSupply, wizaNotClaimed, totalMined, account, netId, isXWallet, isQRWalletConnect } = this.props

		const panelWidth = isMobile ? "100%" : boxW * 60 / 100

		return (
			<div style={styles.panelShadow}>

				<div
					className={showPanel ? "slide-panel-container-on" : "slide-panel-container-off"}
					style={Object.assign({}, styles.panel, { width: showPanel ? panelWidth : 0 })}
				>

					<div style={styles.headerPanel}>

						<p style={{ fontSize: 28, color: 'white', marginLeft: 30 }}>
							Wizards Arena
						</p>

						<div style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
							<button
								onClick={() => window.open("https://discord.gg/5vK5frRHMj", "_blank")}
								style={{ marginRight: 20 }}
							>
								<SiDiscord
									color="white"
									size={28}
								/>
							</button>

							<button
								onClick={() => window.open("https://twitter.com/WizardsArena", "_blank")}
								style={{ marginRight: 18 }}
							>
								<SiTwitter
									color="white"
									size={28}
								/>
							</button>

							<button
								onClick={() => {
									document.body.style.overflow = "auto"
									document.body.style.height = "auto"
									this.setState({ showPanel: false })
								}}
								style={{ marginRight: 30 }}
							>
								<IoClose
									color="white"
									size={34}
								/>
							</button>
						</div>

					</div>

					<div style={{ flexDirection: 'column', paddingLeft: 50, paddingRight: 30 }}>

						<p style={{ fontSize: 26, color: 'white', marginBottom: 20 }}>
							What is Wizards Arena?
						</p>

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								Player's Handbook
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							All you need to know about the game
						</p>


						<p style={{ fontSize: 26, color: 'white', marginBottom: 20 }}>
							About $WIZA
						</p>

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/usdwiza"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								What is $WIZA?
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 20 }}>
							All you need to know about WIZA
						</p>

						<button
							className="btnH"
							style={Object.assign({}, styles.btnLogout, { borderColor: TEXT_SECONDARY_COLOR, marginBottom: 20, width: 180, height: 40 })}
							onClick={() => this.setState({ showModalBuy: true })}
						>
							<p style={{ fontSize: 16, color: 'white' }}>
								BUY WIZA
							</p>
						</button>

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/usdwiza/how-to-mine"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								Earn $WIZA
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							Read ways to earn WIZA
						</p>

						<a
							href="https://www.kdswap.exchange/pools/kda/wiza"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								Buy/Sell WIZA
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							KDA/WIZA liquidity pool
						</p>

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/usdwiza/how-to-mine"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								Spend $WIZA
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							Read ways to spend WIZA
						</p>

						<div style={{ alignItems: 'center', marginBottom: 10 }}>
							<p style={{ fontSize: 18, color: 'white', marginRight: 20 }}>
								$WIZA mined
							</p>

							<p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
								{totalMined ? totalMined.toLocaleString() : '...'}
							</p>
							<p style={{ fontSize: 18, color: 'white' }}>
								({this.getPct(totalMined)})
							</p>
						</div>

						<div style={{ alignItems: 'center', marginBottom: 10 }}>
							<p style={{ fontSize: 18, color: 'white', marginRight: 20 }}>
								$WIZA circulating
							</p>

							<p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
								{circulatingSupply ? circulatingSupply.toLocaleString() : '...'}
							</p>

							<p style={{ fontSize: 18, color: 'white' }}>
								({this.getPct(circulatingSupply)})
							</p>
						</div>

						<div style={{ alignItems: 'center', marginBottom: 30 }}>
							<p style={{ fontSize: 18, color: 'white', marginRight: 20 }}>
								$WIZA not claimed
							</p>

							<p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
								{wizaNotClaimed ? wizaNotClaimed.toLocaleString() : '...'}
							</p>

							<p style={{ fontSize: 18, color: 'white' }}>
								({this.getPct(wizaNotClaimed)})
							</p>
						</div>

						<p style={{ fontSize: 26, color: 'white', marginBottom: 20 }}>
							Tools
						</p>

						<a
							href="https://www.kaderare.com/collection/WizardsArena"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								KadeRare Wizards
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 15 }}>
							Check your Wizard rarity
						</p>

						<a
							href="https://www.kaderare.com/collection/ClericsArena"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								KadeRare Clerics
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 20 }}>
							Check your Cleric rarity
						</p>

						{
							account.account &&
							<div style={{ flexDirection: 'column', marginTop: 30 }}>
								<p style={{ fontSize: 21, color: 'white', marginBottom: 10 }}>
									Wallet address
								</p>

								<p style={{ fontSize: 15, color: 'white', overflowWrap: 'anywhere', marginBottom: 10 }}>
									{account.account}
								</p>

								{
									isXWallet &&
									<p style={{ fontSize: 16, color: 'white', marginBottom: 10 }}>
										<i>Connected to eckoWallet</i>
									</p>
								}

								{
									isQRWalletConnect &&
									<p style={{ fontSize: 16, color: 'white', marginBottom: 10 }}>
										<i>Connected to Wallet Connect</i>
									</p>
								}

								<button
			                        style={styles.btnLogout}
			                        onClick={() => {
										document.body.style.overflow = "auto"
										document.body.style.height = "auto"
			                            this.props.logout(isXWallet, netId)
			                            this.props.history.replace('/collection')
			                        }}
			                    >
			                        <p style={{ fontSize: 18, color: 'red' }}>
			                            Logout
			                        </p>
			                    </button>
							</div>
						}

					</div>

				</div>
			</div>
		)
	}

	render() {
		const { section, account, page, isMobile, kadenaname } = this.props

		const { boxW, modalW } = getBoxWidth(isMobile)

		let margin = isMobile ? 12 : 22

		let viewAccountStyle = isMobile ?
								{ width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }
								:
								{ height: 60, flexDirection: 'row', alignItems: 'flex-end',  justifyContent: 'flex-end' }

		let btnPressedStyle = isMobile ? 'btnPressedMobile' : 'btnPressed'
		let btnStyle = isMobile ? 'btnMobile' : 'btn'

		let btnHeaderNft = isMobile ? 'btnPressedBlackMobile' : 'btnPressedBlack'

		const hinside = isMobile ? { flexDirection: 'column', justifyContent: 'space-around', width: boxW } : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: boxW }

		return (
			<div className={isMobile ? 'homeheaderMobile' : 'homeheader'}>

				<div style={hinside}>
					<div style={{ alignItems: 'flex-end' }}>

						<a
							href={`${window.location.protocol}//${window.location.host}/collection`}
						>
							<img
								src={logo_img}
								style={{ height: isMobile ? 30 : 58, borderRadius: 2, marginRight: margin, cursor: 'pointer' }}
								alt='Wizards'
								onClick={(e) => {
									e.preventDefault()
									this.props.history.replace('/collection')
								}}
							/>
						</a>

						{
							page === 'home' ?
							<div style={{ height: 60, alignItems: 'flex-end', flexWrap: 'wrap' }}>
								<a
									href={`${window.location.protocol}//${window.location.host}/collection`}
									className={section === 1 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/collection')
									}}
								>
									MARKETPLACE
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/equipment`}
									className={section === 8 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/equipment')
									}}
								>
									EQUIPMENT
								</a>

								{/*<a
									href={`${window.location.protocol}//${window.location.host}/mint`}
									className={section === 2 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/mint')
									}}
								>
									MINT
								</a>*/}

								<a
									href={`${window.location.protocol}//${window.location.host}/forge`}
									className={section === 9 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/forge')
									}}
								>
									FORGE
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/me`}
									className={section === 3 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/me')
									}}
								>
									PROFILE
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/magicshop`}
									className={section === 5 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/magicshop')
									}}
								>
									MAGIC SHOP
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/pvp`}
									className={section === 7 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/pvp')
									}}
								>
									PVP
								</a>


								<a
									href={`${window.location.protocol}//${window.location.host}/tournaments`}
									className={section === 4 ? btnPressedStyle : btnStyle}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/tournaments')
									}}
								>
									TOURNAMENTS
								</a>
							</div>
							: null
						}

						{
							page === 'nft' || page === 'settings' ?
							<div style={{ height: 60, alignItems: 'flex-end', flexWrap: 'wrap' }}>
								<a
									href={`${window.location.protocol}//${window.location.host}/collection`}
									className={btnHeaderNft}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/collection')
									}}
								>
									HOME
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/equipment`}
									className={btnHeaderNft}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/equipment')
									}}
								>
									EQUIPMENT
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/forge`}
									className={btnHeaderNft}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/forge')
									}}
								>
									FORGE
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/me`}
									className={btnHeaderNft}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/me')
									}}
								>
									PROFILE
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/magicshop`}
									className={btnHeaderNft}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/magicshop')
									}}
								>
									MAGIC SHOP
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/pvp`}
									className={btnHeaderNft}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/pvp')
									}}
								>
									PVP
								</a>

								<a
									href={`${window.location.protocol}//${window.location.host}/tournaments`}
									className={btnHeaderNft}
									onClick={(e) => {
										e.preventDefault()
										this.props.history.replace('/tournaments')
									}}
								>
									TOURNAMENTS
								</a>
							</div>
							:
							null
						}

					</div>

					<div style={viewAccountStyle}>
						{
							account && account.account ?
							<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 15, marginRight: isMobile ? 8 : 22, lineHeight: 1 }}>
								{kadenaname ? kadenaname : `${account.account.slice(0, 10)}...`}
							</p>
							: null
						}

						<button
							onClick={() => {
								document.body.style.overflow = "hidden"
								document.body.style.height = "100%"
								this.setState({ showPanel: !this.state.showPanel })
							}}
							style={{ marginRight: isMobile ? 12 : 0, display: 'flex', alignItems: 'flex-end' }}
						>
							<IoMenu
								color={TEXT_SECONDARY_COLOR}
								size={28}
							/>
						</button>

					</div>

					<div
						className={this.state.showPanel ? "bg-slide-on" : "bg-slide-off"}
						onClick={() => {
							document.body.style.overflow = "auto"
							document.body.style.height = "auto"
							this.setState({ showPanel: false })
						}}
						style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090' }}
					/>

					{this.renderSlidePanel(boxW)}
				</div>

				<ModalBuyWIZA
					width={modalW}
					showModal={this.state.showModalBuy}
					onCloseModal={() => this.setState({ showModalBuy: false })}
					onSwap={(amount, estimatedWiza) => {
						this.swap(amount, estimatedWiza)
					}}
				/>

				<ModalTransaction
					showModal={this.props.showModalTx}
					width={modalW}
					mintSuccess={() => {
						this.props.clearTransaction()
						window.location.reload()
					}}
					mintFail={() => {
						this.props.clearTransaction()
						window.location.reload()
					}}
				/>

			</div>
		)
	}
}

const styles = {
	panelShadow: {
		justifyContent: 'flex-end',
		position: 'absolute'
	},
	panel: {
		backgroundColor: BACKGROUND_COLOR,
		flexDirection: 'column',
		overflow: 'scroll'
	},
	headerPanel: {
		height: 90,
		width: '100%',
		paddingTop: 10,
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 30
	},
	btnLogout: {
        height: 35,
        width: 120,
        borderRadius: 2,
        borderColor: 'red',
        borderWidth: 2,
        borderStyle: 'solid',
		marginBottom: 40
    }
}

const mapStateToProps = (state) => {
	const { totalMined, circulatingSupply, wizaNotClaimed, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId, kadenaname, showModalTx } = state.mainReducer
	const { transactionToConfirmText, typeModal, transactionOkText } = state.modalTransactionReducer

	return { totalMined, circulatingSupply, wizaNotClaimed, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId, kadenaname, showModalTx, transactionToConfirmText, typeModal, transactionOkText }
}

export default connect(mapStateToProps, {
	getTotalMined,
	getCirculatingSupply,
	setNetworkSettings,
	setNetworkUrl,
	logout,
	getWizaNotClaimed,
	swapKdaWiza,
	clearTransaction,
	updateInfoTransactionModal
})(Header);
