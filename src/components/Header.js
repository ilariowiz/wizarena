import React, { Component } from 'react';
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import Popup from 'reactjs-popup';
import BounceLoader from 'react-spinners/BounceLoader';
import { IoMenu, IoClose } from 'react-icons/io5'
import { SiDiscord, SiTwitter } from 'react-icons/si'
import { MdDarkMode, MdOutlineDarkMode } from 'react-icons/md'
//import ModalBuyWIZA from './common/ModalBuyWIZA'
import ModalTransaction from './common/ModalTransaction'
import getBoxWidth from './common/GetBoxW'
import '../css/Header.css'
import {
	getTotalMined,
	getCirculatingSupply,
	setNetworkSettings,
	setNetworkUrl,
	logout,
	swapKdaWiza,
	clearTransaction,
	updateInfoTransactionModal,
	setHideNavBar,
	removeInfo,
	clearTransactionByPactCode,
	loadAllNftsIds,
	setVisualColors,
	getWizaKDAPool
} from '../actions'
import { TEXT_SECONDARY_COLOR, MAIN_NET_ID } from '../actions/types'
import 'reactjs-popup/dist/index.css';

require('moment-countdown');

const logo_img = require('../assets/wzlogo_bg_transparent.png')
const logo_kadena = require('../assets/kdalogo2.png')

const market_icon = require('../assets/menu/black/marketplace.png')
const profile_icon = require('../assets/menu/black/profile.png')
const shop_icon = require('../assets/menu/black/shop.png')
const pvp_icon = require('../assets/menu/black/pvp.png')
const forge_icon = require('../assets/menu/black/forge.png')

const market_icon_night = require('../assets/menu/marketplace.png')
const flash_icon_night = require('../assets/menu/flash_tournament.png')
const profile_icon_night = require('../assets/menu/profile.png')
const shop_icon_night = require('../assets/menu/shop.png')
const pvp_icon_night = require('../assets/menu/pvp.png')
const tournaments_icon_night = require('../assets/menu/tournaments.png')
const challenges_icon_night = require('../assets/menu/wand.png')
const dungeons_icon_night = require('../assets/menu/dungeons.png')
const forge_icon_night = require('../assets/menu/forge.png')

const mapimg = require('../assets/ww_map.png')

const signboard_arena = require('../assets/menu_desktop/signboard_arena.png')
const signboard_challenges = require('../assets/menu_desktop/signboard_challenges.png')
const signboard_dungeons = require('../assets/menu_desktop/signboard_dungeons.png')
const signboard_lord = require('../assets/menu_desktop/signboard_lord.png')
const signboard_pvp = require('../assets/menu_desktop/signboard_pvp.png')
const signboard_weekly = require('../assets/menu_desktop/signboard_weekly.png')
const signboard_flash = require('../assets/menu_desktop/signboard_flash.png')

class Header extends Component {
	constructor(props) {
		super(props)

		this.state = {
			showPanel: false,
			showModalBuy: false,
			showPopupMenu: false,
			wizaReserve: undefined
		}
	}

	componentDidMount() {
		const { isDarkmode } = this.props

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")
		this.props.setVisualColors(isDarkmode)
	}

	getMined() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getTotalMined(chainId, gasPrice, gasLimit, networkUrl)
	}

	getSupply() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getCirculatingSupply(chainId, gasPrice, gasLimit, networkUrl)
	}

	getPairKdaWiza() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getWizaKDAPool(chainId, gasPrice, gasLimit, networkUrl, (response) => {
			//console.log(response);
			this.setState({ wizaReserve: parseInt(response.leg1.reserve.decimal) })
		})
	}

	getPct(numb) {
		if (!numb) {
			return ''
		}

		const maxSupply = 13240000

		const pct = numb / maxSupply * 100
		return `${_.floor(pct, 2)}%`
	}

	getWizaMinedForWizard(multiplier, timestamp) {
        const diffMinsFromStaked = moment().diff(moment(timestamp.timep), 'minutes')
        //console.log(diffMinsFromStaked);
        const minAday = 1440
        const daysPassed = (diffMinsFromStaked / minAday)
        const unclaimedWiza = daysPassed * multiplier * 0.5

		return unclaimedWiza
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
		const { showPanel, wizaReserve } = this.state
		const { isMobile, circulatingSupply, totalMined, account, netId, isXWallet, isQRWalletConnect, mainTextColor, isDarkmode, mainBackgroundColor } = this.props

		const panelWidth = isMobile ? "100%" : boxW * 60 / 100

		let realCirculatingSupply;
		if (circulatingSupply && wizaReserve) {
			realCirculatingSupply = circulatingSupply - wizaReserve
		}

		return (
			<div style={styles.panelShadow}>

				<div
					className={showPanel ? "slide-panel-container-on" : "slide-panel-container-off"}
					style={Object.assign({}, styles.panel, { width: showPanel ? panelWidth : 0, zIndex: 1000, backgroundColor: mainBackgroundColor })}
				>

					<div style={styles.headerPanel}>

						<div style={{ flexDirection: 'column', marginLeft: 30 }}>
							<p style={{ fontSize: 24, color: mainTextColor, marginBottom: 2 }} className="text-bold">
								Wizards Arena
							</p>
							<div
								style={{ alignItems: 'center', marginLeft: 17, cursor: 'pointer' }}
								onClick={() => window.open("https://www.kadena.io/", "_blank")}
							>
								<p style={{ color: mainTextColor, fontSize: 16 }}>
									Powered by Kadena
								</p>
								<img
									src={logo_kadena}
									style={{ width: 30 }}
								/>
							</div>
						</div>

						<div style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
							<button
								onClick={() => window.open("https://discord.gg/5vK5frRHMj", "_blank")}
								style={{ marginRight: 20 }}
							>
								<SiDiscord
									color={mainTextColor}
									size={28}
								/>
							</button>

							<button
								onClick={() => window.open("https://twitter.com/WizardsArena", "_blank")}
								style={{ marginRight: 18 }}
							>
								<SiTwitter
									color={mainTextColor}
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
									color={mainTextColor}
									size={34}
								/>
							</button>
						</div>

					</div>

					<div style={{ flexDirection: 'column', paddingLeft: 50, paddingRight: 30 }}>

						<p style={{ fontSize: 22, color: mainTextColor, marginBottom: 20 }}>
							What is Wizards Arena?
						</p>

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								Player's Handbook
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 30 }}>
							All you need to know about the game
						</p>


						<p style={{ fontSize: 22, color: mainTextColor, marginBottom: 20 }}>
							About $WIZA
						</p>

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/usdwiza"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								What is $WIZA?
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 20 }}>
							All you need to know about WIZA
						</p>

						{/*<button
							className="btnH"
							style={Object.assign({}, styles.btnLogout, { borderColor: isDarkmode ? '#d7d7d7' : mainTextColor, marginBottom: 20, width: 180, height: 36 })}
							onClick={() => this.setState({ showModalBuy: true })}
						>
							<p style={{ fontSize: 14, color: mainTextColor }} className="text-medium">
								BUY WIZA
							</p>
						</button>*/}

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/usdwiza/how-to-mine"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								Earn $WIZA
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 30 }}>
							Read ways to earn WIZA
						</p>

						<a
							href="https://www.kdswap.exchange/pools/kda/wiza"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								Buy/Sell WIZA
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 30 }}>
							KDA/WIZA liquidity pool
						</p>

						<a
							href="https://wizardsarena.gitbook.io/wizards-arena/usdwiza/how-to-mine"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								Spend $WIZA
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 30 }}>
							Read ways to spend WIZA
						</p>

						<div style={{ alignItems: 'center', marginBottom: 10 }}>
							<p style={{ fontSize: 15, color: mainTextColor, marginRight: 15 }}>
								$WIZA mined
							</p>

							<p style={{ fontSize: 15, color: mainTextColor, marginRight: 10 }} className="text-medium">
								{totalMined ? totalMined.toLocaleString() : '...'}
							</p>
							<p style={{ fontSize: 13, color: '#707070' }}>
								({this.getPct(totalMined)})
							</p>
						</div>

						<div style={{ alignItems: 'center', marginBottom: 10 }}>
							<p style={{ fontSize: 15, color: mainTextColor, marginRight: 15 }}>
								$WIZA circulating
							</p>

							<p style={{ fontSize: 15, color: mainTextColor, marginRight: 10 }} className="text-medium">
								{realCirculatingSupply ? realCirculatingSupply.toLocaleString() : '...'}
							</p>

							<p style={{ fontSize: 13, color: '#707070' }}>
								({this.getPct(realCirculatingSupply)})
							</p>
						</div>

						<div style={{ alignItems: 'center', marginBottom: 30 }}>
							<p style={{ fontSize: 15, color: mainTextColor, marginRight: 15 }}>
								$WIZA in Liquidity Pool
							</p>

							<p style={{ fontSize: 15, color: mainTextColor, marginRight: 10 }} className="text-medium">
								{this.state.wizaReserve ? this.state.wizaReserve.toLocaleString() : '...'}
							</p>

							<p style={{ fontSize: 13, color: '#707070' }}>
								({this.getPct(this.state.wizaReserve)})
							</p>
						</div>

						<p style={{ fontSize: 22, color: mainTextColor, marginBottom: 20 }}>
							Tools
						</p>

						<a
							href="https://www.kaderare.com/collection/WizardsArena"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								KadeRare Wizards
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 15 }}>
							Check your Wizard rarity
						</p>

						<a
							href="https://www.kaderare.com/collection/ClericsArena"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								KadeRare Clerics
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 15 }}>
							Check your Cleric rarity
						</p>

						<a
							href="https://www.kaderare.com/collection/DruidsArena"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 16, color: TEXT_SECONDARY_COLOR }} className="text-medium">
								KadeRare Druids
							</p>
						</a>

						<p style={{ fontSize: 14, color: "#707070", marginBottom: 20 }}>
							Check your Druid rarity
						</p>

						<p style={{ fontSize: 22, color: mainTextColor, marginBottom: 20 }}>
							Dark Mode
						</p>

						<button
							style={styles.btnDarkMode}
							onClick={() => this.props.setVisualColors(!this.props.isDarkmode)}
						>
							{
								!isDarkmode ?
								<MdDarkMode
									size={26}
									color='black'
								/>
								:
								<MdOutlineDarkMode
									size={26}
									color='black'
								/>
							}
						</button>

						{
							account.account &&
							<div style={{ flexDirection: 'column', marginTop: 30 }}>
								<p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5 }}>
									Wallet address
								</p>

								<p style={{ fontSize: 15, color: mainTextColor, overflowWrap: 'anywhere', marginBottom: 10 }}>
									{account.account}
								</p>

								{
									isXWallet &&
									<p style={{ fontSize: 15, color: '#707070', marginBottom: 10 }}>
										Connected to eckoWallet
									</p>
								}

								{
									isQRWalletConnect &&
									<p style={{ fontSize: 15, color: '#707070', marginBottom: 10 }}>
										Connected to Wallet Connect
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
			                        <p style={{ fontSize: 16, color: 'red' }} className="text-medium">
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

	renderSlidePanelPlay(isMobile) {
		const { showPopupMenu } = this.state
		const { mainTextColor, mainBackgroundColor } = this.props

		const panelWidth = isMobile ? "90%" : "90%"

		return (
			<div style={styles.panelShadow}>

				<div
					className={showPopupMenu ? "slide-panel-container-on" : "slide-panel-container-off"}
					style={Object.assign({}, styles.panel, { width: showPopupMenu ? panelWidth : 0, zIndex: 997, backgroundColor: mainBackgroundColor })}
				>

					<div style={Object.assign({}, styles.headerPanel, { height: 70 })}>

						<p style={{ fontSize: 30, color: mainTextColor, marginLeft: 30 }} className="text-bold">
							Play
						</p>

						<div style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
							<button
								onClick={() => {
									document.body.style.overflow = "auto"
									document.body.style.height = "auto"
									this.setState({ showPopupMenu: false })
								}}
								style={{ marginRight: 30 }}
							>
								<IoClose
									color={mainTextColor}
									size={38}
								/>
							</button>
						</div>

					</div>

					<div style={{ width: "100%", flexDirection: 'row'}}>
					{
						showPopupMenu ?
						this.renderPlayMenu(isMobile)
						: undefined
					}
					</div>
				</div>
			</div>
		)
	}

	renderPlayMenu(isMobile) {

		if (!isMobile) {

			const height = window.innerHeight - 110

			return (
				<div style={{ width: "100%", justifyContent: 'center' }}>
					<div style={{ position: 'relative' }}>
						<img
							src={mapimg}
							className="mapimg"
							style={{ maxHeight: height }}
						/>

						{this.renderSignboard("17%", "26%", "arena", signboard_arena, 0.55)}

						{this.renderSignboard("34%", "49%", "dungeons", signboard_dungeons, 0.61)}

						{this.renderSignboard("11%", "66%", "challenges", signboard_challenges, 0.58)}

						{this.renderSignboard("47%", "17%", "lords", signboard_lord, 0.64)}

						{this.renderSignboard("61%", "41%", "pvp", signboard_pvp, 0.68)}

						{this.renderSignboard("55%", "71%", "tournaments", signboard_weekly, 0.72)}

						{this.renderSignboard("78%", "26%", "flashtournaments", signboard_flash, 0.76)}
					</div>
				</div>
			)
		}

		return (
			<div style={{ flexDirection: "column", flexWrap: 'wrap', width: '100%' }}>

				<div style={Object.assign({}, styles.boxGradient, { backgroundImage: `linear-gradient(to right, #378c9c, transparent)` })}>
					{this.renderBtnMenuPlay(
						'dungeons',
						dungeons_icon_night,
						"Dungeons of Wizards World",
						99,
						17)
					}
				</div>

				<div style={Object.assign({}, styles.boxGradient, { backgroundImage: `linear-gradient(to right, #3a3aaf, transparent)` })}>
					{this.renderBtnMenuPlay(
						'lords',
						profile_icon_night,
						"Lords of Wizards World",
						99,
						17)
					}
				</div>

				<div style={Object.assign({}, styles.boxGradient, { backgroundImage: `linear-gradient(to right, #6a36bf, transparent)` })}>

					{this.renderBtnMenuPlay(
						'challenges',
						challenges_icon_night,
						"Challenges",
						99,
						17)
					}
				</div>

				<div style={Object.assign({}, styles.boxGradient, { backgroundImage: `linear-gradient(to right, #b33a78, transparent)` })}>

					{this.renderBtnMenuPlay(
						'pvp',
						pvp_icon_night,
						"PvP",
						99,
						17)
					}

				</div>

				<div style={Object.assign({}, styles.boxGradient, { backgroundImage: `linear-gradient(to right, #d6863e, transparent)` })}>

					{this.renderBtnMenuPlay(
						'arena',
						pvp_icon_night,
						"Arena",
						99,
						17)
					}

				</div>

				<div style={Object.assign({}, styles.boxGradient, { backgroundImage: `linear-gradient(to right, #b99642, transparent)` })}>
					{this.renderBtnMenuPlay(
						'flashtournaments',
						flash_icon_night,
						"Flash Tournaments",
						99,
						17)
					}

				</div>

				<div style={Object.assign({}, styles.boxGradient, { backgroundImage: `linear-gradient(to right, #b35448, transparent)` })}>

					{this.renderBtnMenuPlay(
						'tournaments',
						tournaments_icon_night,
						"Weekly Tournaments",
						99,
						17)
					}

				</div>

			</div>
		)
	}

	renderSignboard(left, top, goto, image, delay) {
		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/${goto}`}
				className="containersign"
				onClick={(e) => {
					e.preventDefault()
					this.props.history.replace(`/${goto}`)
				}}
			>
				<img
					src={image}
					className="signboard"
					style={{ position: 'absolute', left, top, width: 104, animationDelay: delay+"s" }}
				/>
			</a>
		)
	}

	renderBtnMenu(goto, icon, title, id, fontSize, iconSize = 28) {
		const { section, mainTextColor } = this.props

		const className = section === id ? 'text-bold' : 'text-medium'

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/${goto}`}
				style={styles.boxBtnMenu}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.replace(`/${goto}`)
				}}
			>
				<img
					style={{ width: iconSize, height: iconSize, marginRight: 5 }}
					src={icon}
					alt={title}
				/>
				<p style={{ fontSize, color: mainTextColor }} className={className}>
					{title}
				</p>
			</a>
		)
	}

	renderBtnMenuPlay(goto, icon, title, id, fontSize) {
		const { section } = this.props

		let iconSize = 28

		const className = section === id ? 'text-bold' : 'text-medium'

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/${goto}`}
				style={styles.boxBtnMenuPlay}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.replace(`/${goto}`)
				}}
			>
				<img
					style={{ width: iconSize, height: iconSize, marginRight: 5 }}
					src={icon}
					alt={title}
				/>
				<p style={{ fontSize, color: "white" }} className={className}>
					{title}
				</p>
			</a>
		)
	}

	renderBtnRight(isMobile) {
		const { account, mainTextColor, circulatingSupply } = this.props

		return (
			<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

				{
					account && account.account && !isMobile ?
					<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14 }}>
						{`${account.account.slice(0, 10)}...`}
					</p>
					: null
				}

				{
					!isMobile &&
					<div style={{ width: 1, height: 20, backgroundColor: "#d7d7d7", marginLeft: 8, marginRight: 8 }} />
				}

				<button
					onClick={() => {
						if (!circulatingSupply) {
							setTimeout(() => {
								this.getMined()
								this.getSupply()
								this.getPairKdaWiza()
							}, 1000)
						}

						this.setState({ showPanel: !this.state.showPanel })
					}}
					style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
				>
					<IoMenu
						color={mainTextColor}
						size={26}
					/>
				</button>


			</div>
		)
	}

	renderLogo(isMobile, width) {
		const { transactionsState, showModalTx, txInfo } = this.props

		const textToConfirm = txInfo && txInfo.length > 0 ? txInfo[txInfo.length-1].transactionToConfirmText : ""

		return (
			<div style={{ alignItems: 'flex-start', width }}>

				{
					transactionsState && transactionsState.length > 0 && !showModalTx ?
					<div style={{ justifyContent: 'center', alignItems: 'center', padding: 5 }}>
						<Popup
							trigger={open => (
								<div>
									<BounceLoader
										color={TEXT_SECONDARY_COLOR}
										size={31}
									/>
								</div>
							)}
							position="right top"
							on="hover"
						>
							<div style={{ width: 200, overflowWrap: "anywhere", padding: 8 }}>
								<a
									href={`https://explorer.chainweb.com/mainnet/tx/${transactionsState[transactionsState.length-1].requestKey}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<p style={{ color: "#1d1d1f", fontSize: 15, lineHeight: 1.4 }}>
										{textToConfirm}.<br /> Request key: {transactionsState[transactionsState.length-1].requestKey}
									</p>
								</a>
							</div>
						</Popup>
					</div>
					:
					<img
						src={logo_img}
						style={{ width: isMobile ? 40 : 50 }}
						alt='logo'
						id="logo"
					/>
				}
			</div>
		)
	}

	renderDesktop() {
		const { boxW, modalW, padding } = getBoxWidth(false)
		const { mainBackgroundColor, isDarkmode } = this.props

		return (
			<div style={{ flexDirection: 'row', width: '100%', paddingLeft: padding, paddingRight: padding, paddingTop: 8, paddingBottom: 8, backgroundColor: mainBackgroundColor, position: 'relative', alignItems: 'center', justifyContent: 'space-between' }} id="headerbox">

				{this.renderLogo(false, 131)}

				<div style={{ alignItems: 'center', justifyContent: 'center' }}>
					{this.renderBtnMenu(
						'collection',
						isDarkmode ? market_icon_night : market_icon,
						"Marketplace",
						1,
						14)
					}

					{this.renderBtnMenu(
						'me',
						isDarkmode ? profile_icon_night : profile_icon,
						"Profile",
						3,
						14)
					}

					{this.renderBtnMenu(
						'magicshop',
						isDarkmode ? shop_icon_night : shop_icon,
						"Magic shop",
						5,
						14)
					}

					{this.renderBtnMenu(
						'forge',
						isDarkmode ? forge_icon_night : forge_icon,
						"Forge",
						6,
						14,
						31)
					}

					{this.renderBtnPlay(false, 7, "Play")}
				</div>

				{this.renderBtnRight(false)}

				<div
					className={this.state.showPanel ? "bg-slide-on" : "bg-slide-off"}
					onClick={() => {
						document.body.style.overflow = "auto"
						document.body.style.height = "auto"
						this.setState({ showPanel: false })
					}}
					style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: this.state.showPanel ? window.innerWidth : 0, zIndex: 999 }}
				/>

				{this.renderSlidePanel(boxW)}

				{/*<ModalBuyWIZA
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
				/>*/}

				{this.renderModalTx(modalW)}

				<div
					style={{ height: 1, backgroundColor: '#d7d7d7', position: 'absolute', bottom: 0, left: 0, right: 0, marginLeft: padding, marginRight: padding }}
				/>
			</div>
		)
	}

	renderModalTx(width) {
		return (
			<ModalTransaction
				showModal={this.props.showModalTx}
				width={width}
				mintSuccess={(requestKey, location) => {
					this.props.clearTransaction(requestKey)
					this.props.removeInfo(requestKey)

					//console.log(requestKey);
					if (location === window.location.href) {
						setTimeout(() => {
							window.location.reload()
						}, 200)
					}
				}}
				mintFail={(pactCode, requestKey) => {
					//console.log(pactCode);

					if (!requestKey) {
						this.props.clearTransactionByPactCode(pactCode)
					}
					else {
						this.props.clearTransaction(requestKey)
						this.props.removeInfo(requestKey)
					}

					setTimeout(() => {
						window.location.reload()
					}, 100)
				}}
			/>
		)
	}

	renderBtnPlay(isMobile, id, title) {
		const { showPopupMenu } = this.state
		const { section, mainTextColor, isDarkmode } = this.props

		let iconSize = isMobile ? 35 : 28

		const className = section === id ? 'text-bold' : 'text-medium'

		return (
			<div>
				<div
					style={styles.boxBtnMenu}
					onClick={() => this.setState({ showPopupMenu: true })}
				>
					<img
						style={{ width: iconSize, height: iconSize }}
						src={isDarkmode ? pvp_icon_night : pvp_icon}
						alt={title}
					/>
					{
						!isMobile &&
						<p style={{ fontSize: 14, color: mainTextColor }} className={className}>
							{title}
						</p>
					}
				</div>

				<div
					className={showPopupMenu ? "bg-slide-on" : "bg-slide-off"}
					onClick={() => {
						document.body.style.overflow = "auto"
						document.body.style.height = "auto"
						this.setState({ showPopupMenu: false })
					}}
					style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: showPopupMenu ? window.innerWidth : 0 }}
				/>

				{this.renderSlidePanelPlay(false)}
			</div>
		)
	}

	renderBtnMenuMobile(goto, icon, id, iconSize = 35) {
		const { showPopupMenu } = this.state

		if (goto.toLowerCase() === "play") {
			return (
				<div>
					<div
						style={styles.boxBtnMenu}
						onClick={() => this.setState({ showPopupMenu: true })}
					>
						<img
							style={{ width: iconSize, height: iconSize }}
							src={icon}
							alt={goto}
						/>
					</div>


					<div
						className={showPopupMenu ? "bg-slide-on" : "bg-slide-off"}
						onClick={() => {
							document.body.style.overflow = "auto"
							document.body.style.height = "auto"
							this.setState({ showPopupMenu: false })
						}}
						style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: showPopupMenu ? window.innerWidth : 0 }}
					/>

					{this.renderSlidePanelPlay(true)}
				</div>
			)
		}

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/${goto}`}
				style={styles.boxBtnMenu}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.replace(`/${goto}`)
				}}
			>
				<img
					style={{ width: iconSize, height: iconSize }}
					src={icon}
					alt={goto}
				/>
			</a>
		)
	}

	renderMobile() {
		const { showPanel } = this.state
		const { transactionsState, showModalTx, mainTextColor, mainBackgroundColor, isDarkmode } = this.props

		const { boxW, modalW, padding } = getBoxWidth(true)

		return (
			<div style={{ flexDirection: 'row', width: '100%', paddingLeft: padding, paddingRight: padding, paddingTop: 8, paddingBottom: 8, backgroundColor: mainBackgroundColor, position: 'relative', alignItems: 'center', justifyContent: 'space-between' }} id="headerbox">

				{this.renderLogo(true, 40)}

				<div style={{ alignItems: 'center', justifyContent: 'center' }}>
					{this.renderBtnMenuMobile(
						'collection',
						isDarkmode ? market_icon_night : market_icon,
						1)
					}

					{this.renderBtnMenuMobile(
						'me',
						isDarkmode ? profile_icon_night : profile_icon,
						3)
					}

					{this.renderBtnMenuMobile(
						'magicshop',
						isDarkmode ? shop_icon_night : shop_icon,
						5)
					}

					{this.renderBtnMenuMobile(
						'forge',
						isDarkmode ? forge_icon_night : forge_icon,
						6,
						38)
					}

					{this.renderBtnMenuMobile(
						'play',
						isDarkmode ? pvp_icon_night : pvp_icon,
						7)
					}
				</div>

				{this.renderBtnRight(true)}

				<div
					className={this.state.showPanel ? "bg-slide-on" : "bg-slide-off"}
					onClick={() => {
						document.body.style.overflow = "auto"
						document.body.style.height = "auto"
						this.setState({ showPanel: false })
					}}
					style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: showPanel ? window.innerWidth : 0 }}
				/>

				{this.renderSlidePanel(boxW)}

				{
					transactionsState && transactionsState.length > 0 && !showModalTx &&
					<div style={{ justifyContent: 'center', alignItems: 'center', padding: 5, marginTop: 15 }}>
						<Popup
							trigger={open => (
								<div>
									<BounceLoader
										color={mainTextColor}
										size={26}
									/>
								</div>
							)}
							position="right center"
							on="hover"
						>
							<div style={{ width: 200, overflowWrap: "anywhere" }}>
								<p style={{ color: mainTextColor, fontSize: 16 }}>
									{transactionsState[transactionsState.length-1].requestKey}
								</p>
							</div>
						</Popup>
					</div>
				}

				{/*<ModalBuyWIZA
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
				/>*/}

				{this.renderModalTx(modalW)}

				<div
					style={{ height: 1, backgroundColor: '#d7d7d7', position: 'absolute', bottom: 0, left: 0, right: 0, marginLeft: padding, marginRight: padding }}
				/>
			</div>
		)
	}

	render() {
		const { isMobile } = this.props

		if (!isMobile) {
			return this.renderDesktop()
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
        height: 32,
        width: 120,
        borderRadius: 4,
        borderColor: 'red',
        borderWidth: 1,
        borderStyle: 'solid',
		marginBottom: 40
    },
	boxBtnMenu: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row',
		cursor: 'pointer',
		padding: 16
	},
	boxBtnMenuPlay: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
		flexDirection: 'row',
		cursor: 'pointer',
		height: 30,
		paddingLeft: 20
	},
	boxGradient: {
		alignItems: 'center',
		width: '100%',
		flexWrap: 'wrap',
		paddingTop: 10,
		paddingBottom: 10,
		marginBottom: 20
	},
	btnDarkMode: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 4,
		marginBottom: 20,
		backgroundColor: "#d7d7d7",
		width: 36,
		height: 36,
		borderRadius: 18
	}
}

const mapStateToProps = (state) => {
	const { allNftsIds, totalMined, circulatingSupply, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId, showModalTx, hideNavBar, transactionsState, isDarkmode, mainTextColor, mainBackgroundColor } = state.mainReducer
	const { txInfo } = state.modalTransactionReducer

	return { allNftsIds, totalMined, circulatingSupply, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId, showModalTx, hideNavBar, txInfo, transactionsState, isDarkmode, mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps, {
	getTotalMined,
	getCirculatingSupply,
	setNetworkSettings,
	setNetworkUrl,
	logout,
	swapKdaWiza,
	clearTransaction,
	updateInfoTransactionModal,
	setHideNavBar,
	removeInfo,
	clearTransactionByPactCode,
	loadAllNftsIds,
	setVisualColors,
	getWizaKDAPool
})(Header);
