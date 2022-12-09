import React, { Component } from 'react';
import { connect } from 'react-redux'
import _ from 'lodash'
import { IoMenu } from 'react-icons/io5'
import { IoClose } from 'react-icons/io5'
import { SiDiscord } from 'react-icons/si'
import { SiTwitter } from 'react-icons/si'
import getBoxWidth from './common/GetBoxW'
import '../css/Header.css'
import {
	getCirculatingSupply,
	setNetworkSettings,
	setNetworkUrl,
	logout
} from '../actions'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, MAIN_NET_ID } from '../actions/types'

const logo_img = require('../assets/wiz_logo.png')


class Header extends Component {
	constructor(props) {
		super(props)

		this.state = {
			showPanel: false
		}
	}

	componentDidMount() {
		const { circulatingSupply } = this.props

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		if (!circulatingSupply) {
			setTimeout(() => {
				this.getSupply()
			}, 1000)
		}
	}

	getSupply() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getCirculatingSupply(chainId, gasPrice, gasLimit, networkUrl)
	}

	getPct() {
		const { circulatingSupply } = this.props

		if (!circulatingSupply) {
			return ''
		}

		const maxSupply = 13240000

		const pct = circulatingSupply / maxSupply * 100
		return `${_.floor(pct, 2)}%`
	}

	renderSlidePanel(boxW) {
		const { showPanel } = this.state
		const { isMobile, circulatingSupply, account, netId, isXWallet, isQRWalletConnect } = this.props

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
								onClick={() => this.setState({ showPanel: false })}
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

						<p style={{ fontSize: 24, color: 'white', marginBottom: 20 }}>
							About $WIZA
						</p>

						<button
							onClick={() => window.open("https://wizardsarena.gitbook.io/wizards-arena/", "_blank")}
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								What is $WIZA?
							</p>
						</button>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							All you need to know about WIZA
						</p>

						<button
							onClick={() => window.open("https://wizardsarena.gitbook.io/wizards-arena/usdwiza/how-to-mine", "_blank")}
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								Earn $WIZA
							</p>
						</button>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							Read ways to earn WIZA
						</p>


						<button
							onClick={() => window.open("https://wizardsarena.gitbook.io/wizards-arena/usdwiza/how-to-mine", "_blank")}
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								Spend $WIZA
							</p>
						</button>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							Read ways to spend WIZA
						</p>

						<div style={{ alignItems: 'center', marginBottom: 50 }}>
							<p style={{ fontSize: 18, color: 'white', marginRight: 20 }}>
								$WIZA mined
							</p>

							<p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
								{circulatingSupply ? circulatingSupply.toLocaleString() : '...'}
							</p>
							<p style={{ fontSize: 18, color: 'white' }}>
								({this.getPct()})
							</p>
						</div>

						<p style={{ fontSize: 24, color: 'white', marginBottom: 20 }}>
							Tools
						</p>

						<button
							onClick={() => window.open("https://www.kaderare.com/collection/WizardsArena", "_blank")}
							style={{ marginBottom: 5, width: 'fit-content' }}
						>
							<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
								KadeRare
							</p>
						</button>

						<p style={{ fontSize: 16, color: "#c2c0c0", marginBottom: 30 }}>
							Check your Wizard rarity
						</p>

						{
							account.account &&
							<div style={{ flexDirection: 'column', marginTop: 50 }}>
								<p style={{ fontSize: 21, color: 'white', marginBottom: 10 }}>
									Wallet address
								</p>

								<p style={{ fontSize: 15, color: 'white', overflowWrap: 'anywhere', marginBottom: 10 }}>
									{account.account}
								</p>

								{
									isXWallet &&
									<p style={{ fontSize: 16, color: 'white', marginBottom: 10 }}>
										<i>Connected to X-Wallet</i>
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
		const { section, account, page, isMobile } = this.props

		const { boxW } = getBoxWidth(isMobile)

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

						<img
							src={logo_img}
							style={{ height: isMobile ? 30 : 58, borderRadius: 2, marginRight: margin, cursor: 'pointer' }}
							alt='Wizards'
							onClick={() => this.props.history.replace('/collection')}
						/>

						{
							page === 'home' ?
							<div style={{ height: 60, alignItems: 'flex-end', flexWrap: 'wrap' }}>
								<p
									className={section === 1 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/collection')}
								>
									COLLECTION
								</p>

								<p
									className={section === 2 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.push('/mint')}
								>
									MINT
								</p>

								{/*<p
									className={section === 2 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/sales')}
								>
									SALES
								</p>*/}

								<p
									className={section === 3 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/me')}
								>
									PROFILE
								</p>

								<p
									className={section === 7 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/pvp')}
								>
									PVP
								</p>

								<p
									className={section === 5 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/magicshop')}
								>
									MAGIC SHOP
								</p>

								<p
									className={section === 4 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/tournament')}
								>
									TOURNAMENT
								</p>
							</div>
							: null
						}

						{
							page === 'nft' || page === 'settings' ?
							<div style={{ height: 60, alignItems: 'flex-end', flexWrap: 'wrap' }}>
								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/collection')}
								>
									HOME
								</p>

								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/me')}
								>
									PROFILE
								</p>

								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/pvp')}
								>
									PVP
								</p>

								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/magicshop')}
								>
									MAGIC SHOP
								</p>

								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/tournament')}
								>
									TOURNAMENT
								</p>
							</div>
							:
							null
						}

					</div>

					<div style={viewAccountStyle}>
						{
							account && account.account ?
							<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 15, marginRight: isMobile ? 8 : 22, lineHeight: 1 }}>
								{account.account.slice(0, 10)}...
							</p>
							: null
						}

						<button
							onClick={() => this.setState({ showPanel: !this.state.showPanel })}
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
						onClick={() => this.setState({ showPanel: false })}
						style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090' }}
					/>

					{this.renderSlidePanel(boxW)}
				</div>
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
		flexDirection: 'column'
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
        borderStyle: 'solid'
    }
}

const mapStateToProps = (state) => {
	const { circulatingSupply, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId } = state.mainReducer

	return { circulatingSupply, chainId, gasPrice, gasLimit, networkUrl, account, isXWallet, isQRWalletConnect, netId }
}

export default connect(mapStateToProps, {
	getCirculatingSupply,
	setNetworkSettings,
	setNetworkUrl,
	logout
})(Header);
