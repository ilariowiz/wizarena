import React, { Component } from 'react';
import { connect } from 'react-redux'
import _ from 'lodash'
import Popup from 'reactjs-popup';
import { IoMenu } from 'react-icons/io5'
import { IoClose } from 'react-icons/io5'
import { SiDiscord } from 'react-icons/si'
import { SiTwitter } from 'react-icons/si'
import { AiOutlineEye } from 'react-icons/ai'
import { AiOutlineEyeInvisible } from 'react-icons/ai'
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
	updateInfoTransactionModal,
	setHideNavBar
} from '../actions'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, MAIN_NET_ID } from '../actions/types'
import 'reactjs-popup/dist/index.css';

const logo_img = require('../assets/wzlogo_bg_transparent.png')

const market_icon = require('../assets/menu/marketplace.png')
const equipment_icon = require('../assets/menu/equipment.png')
const forge_icon = require('../assets/menu/forge.png')
const profile_icon = require('../assets/menu/profile.png')
const shop_icon = require('../assets/menu/shop.png')
const pvp_icon = require('../assets/menu/pvp.png')
const tournaments_icon = require('../assets/menu/tournaments.png')


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

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 15 }}>
							Check your Cleric rarity
						</p>

						<a
							href="https://www.kaderare.com/collection/DruidsArena"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								KadeRare Druids
							</p>
						</a>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 20 }}>
							Check your Druid rarity
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

	renderBtnMenu(goto, icon, title, id) {
		const { section } = this.props

		let iconSize = 35

		const borderColor = section === id ? "white" : "transparent"

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/${goto}`}
				style={Object.assign({}, styles.boxBtnMenu, { borderColor })}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.replace(`/${goto}`)
				}}
			>
				<img
					style={{ width: iconSize, height: iconSize, marginRight: 10 }}
					src={icon}
				/>
				<p style={{ fontSize: 18, color: 'white' }}>
					{title}
				</p>
			</a>
		)
	}

	renderDesktop() {
		const { account, kadenaname } = this.props

		const { boxW, modalW } = getBoxWidth(false)

		return (
			<div style={{ flexDirection: 'column', padding: 15, backgroundColor: '#2d2a42', position: 'relative', overflowY: 'auto' }} id="headerbox">

				<div style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 20 }}>
					<img
						src={logo_img}
						style={{ width: 50, marginRight: 10 }}
					/>

					<p style={styles.title}>
						WizardsArena
					</p>
				</div>

				{this.renderBtnMenu(
					'collection',
					market_icon,
					"MARKETPLACE",
					1)
				}

				{this.renderBtnMenu(
					'equipment',
					equipment_icon,
					"EQUIPMENT",
					8)
				}

				{this.renderBtnMenu(
					'forge',
					forge_icon,
					"FORGE",
					9)
				}

				{this.renderBtnMenu(
					'me',
					profile_icon,
					"PROFILE",
					3)
				}

				{this.renderBtnMenu(
					'magicshop',
					shop_icon,
					"MAGIC SHOP",
					5)
				}

				{this.renderBtnMenu(
					'pvp',
					pvp_icon,
					"PVP",
					7)
				}

				{this.renderBtnMenu(
					'tournaments',
					tournaments_icon,
					"TOURNAMENTS",
					4)
				}

				<button
					onClick={() => {
						//document.body.style.overflow = "hidden"
						//document.body.style.height = "100%"
						this.setState({ showPanel: !this.state.showPanel })
					}}
					style={{ display: 'flex', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', borderStyle: 'solid', padding: 5 }}
				>
					<IoMenu
						color='white'
						size={35}
						style={{ marginRight: 10 }}
					/>
					<p style={{ fontSize: 18, color: 'white' }}>
						INFO
					</p>
				</button>

				{
					account && account.account ?
					<p style={{ color: 'white', fontSize: 15, position: 'absolute', bottom: 25, left: 25 }}>
						{kadenaname ? kadenaname : `${account.account.slice(0, 10)}...`}
					</p>
					: null
				}

				<div
					className={this.state.showPanel ? "bg-slide-on" : "bg-slide-off"}
					onClick={() => {
						document.body.style.overflow = "auto"
						document.body.style.height = "auto"
						this.setState({ showPanel: false })
					}}
					style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: this.state.showPanel ? window.innerWidth : 0 }}
				/>

				{this.renderSlidePanel(boxW)}

				<ModalBuyWIZA
					width={modalW}
					showModal={this.state.showModalBuy || this.props.showModalBuyFromShop}
					onCloseModal={() => {
						this.setState({ showModalBuy: false })
						if (this.props.closeModalBuyOnShop) {
							this.props.closeModalBuyOnShop()
						}
					}}
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

	renderBtnMenuMobile(goto, icon, id) {
		const { section } = this.props

		let iconSize = 35

		const borderColor = section === id ? "white" : "transparent"

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/${goto}`}
				style={Object.assign({}, styles.boxBtnMenu, { borderColor })}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.replace(`/${goto}`)
				}}
			>
				<img
					style={{ width: iconSize, height: iconSize }}
					src={icon}
				/>
			</a>
		)
	}

	renderMobile() {
		const { boxW, modalW } = getBoxWidth(true)

		return (
			<div style={{ flexDirection: 'column', padding: 6, backgroundColor: '#2d2a42', overflow: 'auto' }} id="headerbox">

				<div style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 20 }}>
					<img
						src={logo_img}
						style={{ width: 50 }}
					/>
				</div>

				{this.renderBtnMenuMobile(
					'collection',
					market_icon,
					1)
				}

				{this.renderBtnMenuMobile(
					'equipment',
					equipment_icon,
					8)
				}

				{this.renderBtnMenuMobile(
					'forge',
					forge_icon,
					9)
				}

				{this.renderBtnMenuMobile(
					'me',
					profile_icon,
					3)
				}

				{this.renderBtnMenuMobile(
					'magicshop',
					shop_icon,
					5)
				}

				{this.renderBtnMenuMobile(
					'pvp',
					pvp_icon,
					7)
				}

				{this.renderBtnMenuMobile(
					'tournaments',
					tournaments_icon,
					4)
				}

				<button
					onClick={() => {
						document.body.style.overflow = "hidden"
						document.body.style.height = "100%"
						this.setState({ showPanel: !this.state.showPanel })
					}}
					style={{ display: 'flex', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', borderStyle: 'solid', padding: 5 }}
				>
					<IoMenu
						color='white'
						size={35}
					/>
				</button>

				<div
					className={this.state.showPanel ? "bg-slide-on" : "bg-slide-off"}
					onClick={() => {
						document.body.style.overflow = "auto"
						document.body.style.height = "auto"
						this.setState({ showPanel: false })
					}}
					style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: this.state.showPanel ? window.innerWidth : 0 }}
				/>

				{this.renderSlidePanel(boxW)}

				<button
					style={{ position: 'absolute', left: 20, bottom: 20 }}
					onClick={() => {
						this.props.setHideNavBar(true)
						//window.location.reload()
					}}
				>
					<AiOutlineEyeInvisible
						size={26}
						color='white'
					/>
				</button>

				<ModalBuyWIZA
					width={modalW}
					showModal={this.state.showModalBuy || this.props.showModalBuyFromShop}
					onCloseModal={() => {
						this.setState({ showModalBuy: false })
						if (this.props.closeModalBuyOnShop) {
							this.props.closeModalBuyOnShop()
						}
					}}
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

	renderUnhideMobile() {

		const { boxW, modalW } = getBoxWidth(true)

		return (
			<div>
				<button
					style={styles.btnShow}
					className="btn-show-shadow"
					onClick={() => this.props.setHideNavBar(false)}
				>
					<AiOutlineEye
						size={26}
						color='black'
					/>
				</button>

				<ModalBuyWIZA
					width={modalW}
					showModal={this.state.showModalBuy || this.props.showModalBuyFromShop}
					onCloseModal={() => {
						this.setState({ showModalBuy: false })
						if (this.props.closeModalBuyOnShop) {
							this.props.closeModalBuyOnShop()
						}
					}}
					onSwap={(amount, estimatedWiza) => {
						this.swap(amount, estimatedWiza)
					}}
				/>
			</div>
		)

	}

	render() {
		const { section, account, page, isMobile, kadenaname, hideNavBar } = this.props

		//console.log(hideNavBar);

		const { boxW, modalW } = getBoxWidth(isMobile)

		if (!isMobile) {
			return this.renderDesktop()
		}

		if (hideNavBar) {
			return this.renderUnhideMobile()
		}

		return this.renderMobile()
	}
}

const styles = {
	title: {
		fontSize: 24,
		color: '#ed0404',
		textShadow: "0px  0px  10px  black"
	},
	panelShadow: {
		justifyContent: 'flex-end',
		position: 'absolute',
	},
	panel: {
		backgroundColor: BACKGROUND_COLOR,
		flexDirection: 'column',
		overflow: 'auto',
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
    },
	boxBtnMenu: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row',
		cursor: 'pointer',
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 8,
		paddingRight: 8,
		marginBottom: 10,
		borderWidth: 0.5,
		borderStyle: 'solid',
		borderRadius: 4
	},
	btnShow: {
		position: 'absolute',
		right: 20,
		bottom: 20,
		backgroundColor: '#ffffff',
		width: 40,
		height: 40,
		borderRadius: 20,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	}
}

const mapStateToProps = (state) => {
	const { totalMined, circulatingSupply, wizaNotClaimed, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId, kadenaname, showModalTx, hideNavBar } = state.mainReducer
	const { transactionToConfirmText, typeModal, transactionOkText } = state.modalTransactionReducer

	return { totalMined, circulatingSupply, wizaNotClaimed, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId, kadenaname, showModalTx, hideNavBar, transactionToConfirmText, typeModal, transactionOkText }
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
	updateInfoTransactionModal,
	setHideNavBar
})(Header);
