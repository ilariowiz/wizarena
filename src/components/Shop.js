import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, query, where, collection, orderBy } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import NftCardShop from './common/NftCardShop'
import calcUpgradeCost from './common/CalcUpgradeCost'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getWizaBalance,
    getUpgradeCost,
    buyUpgrade
} from '../actions'
import { BACKGROUND_COLOR, MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR } from '../actions/types'
import '../css/Nft.css'
import '../css/Shop.css'

const logo_hp = require('../assets/hp_shops.png')
const logo_defense = require('../assets/defense_shops.png')
const logo_atk = require('../assets/attack_shops.png')
const logo_dmg = require('../assets/damage_shops.png')

class Rules extends Component {
    constructor(props) {
        super(props)

        let isConnected = this.props.account && this.props.account.account

        this.state = {
            loading: true,
            isConnected,
            showModalConnection: false,
            typeModal: 'upgrade',
            nameNftToUpgrade: '',
            statToUpgrade: '',
            wizaCostToUpgrade: 0,
            wizardSelected: {},
            historyUpgrades: []
        }
    }

    componentDidMount() {
		document.title = "Magic Shop - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
			this.loadProfile()
		}, 500)
	}

    loadProfile() {
		this.loadMinted()

		this.loadWizaBalance()

        this.getHistoryUpgrades()
	}

    loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
				this.setState({ loading: false })
			})
		}
	}

	loadWizaBalance() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account)
		}
	}

    async getHistoryUpgrades() {
        const { account } = this.props

        const q = query(collection(firebasedb, "history_upgrades"),
                        where("address", "==", account.account),
                        orderBy("timestamp", "desc"))

        const querySnap = await getDocs(q)
        //console.log(querySnap);

        let historyUpgrades = []

        querySnap.forEach(doc => {
            //console.log(doc.data());
            historyUpgrades.push(doc.data())
        })

        //console.log(historyUpgrades);

        this.setState({ historyUpgrades })
    }

    buyStat(stat, costo) {
        const { account, chainId, gasPrice, netId } = this.props
        const { wizardSelected } = this.state

        this.setState({ nameNftToUpgrade: wizardSelected.name, statToUpgrade: stat, wizaCostToUpgrade: costo })

        this.props.buyUpgrade(chainId, gasPrice, netId, account, wizardSelected.id, stat)
    }

    sortById() {
        const { userMintedNfts } = this.props

        let sorted = []

        if (userMintedNfts && userMintedNfts.length > 0) {
            sorted = userMintedNfts.sort((a, b) => {
                return parseInt(a.id) - parseInt(b.id)
            })
        }

        return sorted
    }

    renderRowChoise(item, index, isSelect) {

        if (!item.attack) {
            return <div />
        }

		return (
			<NftCardShop
				key={index}
				item={item}
				width={200}
                isSelect={isSelect}
				onSelect={() => this.setState({ wizardSelected: item })}
                onChange={() => this.setState({ wizardSelected: {} })}
			/>
		)
	}

    renderShopCard(key) {
        //const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        const costo = calcUpgradeCost(this.state.wizardSelected, key)

        /*
        if (this.state.wizardSelected && this.state.wizardSelected.hp) {
            this.props.getUpgradeCost(chainId, gasPrice, gasLimit, networkUrl, this.state.wizardSelected.id, key)
        }
        */

        let img;
        let imgStyle;
        if (key === "hp") {
            img = logo_hp
            imgStyle = { width: 52, height: 52 }
        }
        else if (key === "defense") {
            img = logo_defense
            imgStyle = { width: 45, height: 45 }
        }
        else if (key === "attack") {
            img = logo_atk
            imgStyle = { width: 58, height: 58 }
        }
        else if (key === "damage") {
            img = logo_dmg
            imgStyle = { width: 58, height: 58 }
        }

        return (
            <div
                className="cardShopShadow"
                style={styles.cardShopStyle}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                    <div style={{ width: 58, height: 58, marginBottom: 14, alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={img}
                            style={imgStyle}
                        />
                    </div>

                    <p style={{ fontSize: 22, color: 'white' }}>
                        +1
                    </p>

                    <p style={{ fontSize: 20, color: 'white', marginBottom: 15 }}>
                        {key.toUpperCase()}
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        $WIZA
                    </p>
                    <p style={{ fontSize: 21, color: 'white', marginBottom: 20 }}>
                        {costo}
                    </p>
                </div>

                <button
                    className='btnH'
                    style={styles.btnChoose}
                    onClick={() => {

                        if (!this.state.wizardSelected.name) {
                            return
                        }

                        this.buyStat(key, costo)
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        UPGRADE
                    </p>
                </button>

            </div>
        )
    }

    renderHistory(item, index) {
        return (
            <div key={index} style={styles.rowHistory}>
                <p style={{ color: 'white', fontSize: 18, marginRight: 10 }}>
                    -
                </p>
                <p style={{ color: 'white', fontSize: 18, marginRight: 20 }}>
                    {item.idnft}
                </p>

                <p style={{ color: 'white', fontSize: 18, marginRight: 25 }}>
                    +1 {item.stat}
                </p>

                <p style={{ color: 'white', fontSize: 18 }}>
                    $WIZA {item.cost}
                </p>
            </div>
        )
    }

    renderBody(isMobile) {
        const { isConnected, showModalConnection, wizardSelected, historyUpgrades } = this.state
        const { account, showModalTx, wizaBalance, userMintedNfts } = this.props

        const { boxW, modalW } = getBoxWidth(isMobile)

        if (!account || !account.account || !isConnected) {

			return (
				<div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: boxW, marginTop: 30 }}>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 340, height: 340, borderRadius: 2, marginBottom: 30 }}
						alt='Placeholder'
					/>

					<p style={{ fontSize: 23, color: 'white', textAlign: 'center', width: 340, marginBottom: 30, lineHeight: 1.2 }}>
						Connect your wallet and enter the Arena
					</p>

					<button
						className='btnH'
						style={styles.btnConnect}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={{ fontSize: 19, color: TEXT_SECONDARY_COLOR }}>
							Connect wallet
						</p>
					</button>

					<ModalConnectionWidget
						width={modalW}
						showModal={showModalConnection}
						onCloseModal={() => {
							this.setState({ showModalConnection: false, isConnected: true }, () => {
								setTimeout(() => {
									this.loadProfile()
								}, 500)
							})
						}}
					/>
				</div>
			)
		}


        const sorted = this.sortById()

        return (
            <div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>

                <p style={{ fontSize: 22, color: 'white', marginBottom: 15 }}>
                    Select the Wizard you want to improve
                </p>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                <div style={{ marginBottom: 30 }} className={wizardSelected && wizardSelected.attack ? "selectedShow" : "selectedHide"}>
                    {this.renderRowChoise(wizardSelected, 0, false)}
                </div>

                {
                    !wizardSelected || !wizardSelected.attack ?
                    <div style={{ overflow: 'scroll', marginBottom: 30 }}>
                        {
                            userMintedNfts && userMintedNfts.length > 0 &&
                            sorted.map((item, index) => {
                                return this.renderRowChoise(item, index, true)
                            })
                        }

                    </div>
                    : null
                }

                <p style={{ fontSize: 26, color: 'white', marginBottom: 10 }}>
                    IMPROVE
                </p>

                <p style={{ fontSize: 18, color: "white", marginBottom: 25 }}>
					$WIZA balance: {wizaBalance || 0.0}
				</p>

                <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    {this.renderShopCard("hp")}

                    {this.renderShopCard("defense")}

                    {this.renderShopCard("attack")}

                    {this.renderShopCard("damage")}

                </div>

                <p style={{ fontSize: 26, color: 'white', marginBottom: 15 }}>
                    HISTORY
                </p>

                {
                    historyUpgrades.map((item, index) => {
                        return this.renderHistory(item, index)
                    })
                }

                <div style={{ height: 50 }} />


                <ModalTransaction
					showModal={showModalTx}
					width={modalW}
					type={this.state.typeModal}
					mintSuccess={() => {
						this.props.clearTransaction()
						window.location.reload()
					}}
					mintFail={() => {
						this.props.clearTransaction()
						window.location.reload()
					}}
					nameNft={this.state.nameNftToUpgrade}
                    statToUpgrade={this.state.statToUpgrade}
                    wizaCostToUpgrade={this.state.wizaCostToUpgrade}
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
					section={5}
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
    btnConnect: {
		width: 340,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
		borderColor: CTA_COLOR,
		borderWidth: 2,
		borderStyle: 'solid'
	},
    cardShopStyle: {
        width: 200,
        borderRadius: 2,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 35,
        marginBottom: 35,
        paddingTop: 5,
        backgroundColor: "#3729af"
    },
    btnChoose: {
        height: 40,
        width: '70%',
        marginBottom: 13,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    },
    rowHistory: {
        paddingTop: 6,
        paddingBottom: 12,
        paddingLeft: 10,
        borderBottomWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: 'white',
        borderStyle: 'solid',
        marginBottom: 6,
        alignItems: 'center'
    }
}

const mapStateToProps = (state) => {
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, wizaBalance } = state.mainReducer;

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, wizaBalance };
}

export default connect(mapStateToProps, {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getWizaBalance,
    getUpgradeCost,
    buyUpgrade
})(Rules)
