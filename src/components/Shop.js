import React, { Component } from 'react'
import { connect } from 'react-redux'
//import { getDocs, query, where, collection, orderBy } from "firebase/firestore";
//import { firebasedb } from './Firebase';
import { AiOutlinePlus } from 'react-icons/ai'
import { AiOutlineMinus } from 'react-icons/ai'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import NftCardShop from './common/NftCardShop'
import calcUpgradeCost from './common/CalcUpgradeCost'
import { calcLevelWizardAfterUpgrade, getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getWizaBalance,
    buyUpgrade,
    setWizardSelectedShop
} from '../actions'
import { BACKGROUND_COLOR, MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR, MAX_LEVEL } from '../actions/types'
import '../css/Nft.css'
import '../css/Shop.css'

const logo_hp = require('../assets/hp_shops.png')
const logo_defense = require('../assets/defense_shops.png')
const logo_atk = require('../assets/attack_shops.png')
const logo_dmg = require('../assets/damage_shops.png')

class Shop extends Component {
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
            howMuchIncrement: 1,
            wizaCostToUpgrade: 0,
            historyUpgrades: [],
            loadingHistoryUpgrades: true,
            increase: { hp: 1, defense: 1, attack: 1, damage: 1}
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

        /*
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
        */

        let historyUpgrades = []

        let url = `https://estats.chainweb.com/txs/events?search=wiz-arena.BUY_UPGRADE&param=${account.account}&limit=50`

		//console.log(url);
		fetch(url)
  		.then(response => response.json())
  		.then(data => {
  			//console.log(data)

            for (let i = 0; i < data.length; i++) {
                const u = data[i]

                const obj = {
                    idnft: u.params[0],
                    stat: u.params[1],
                    increment: u.params[2].int,
                    cost: u.params[3]
                }

                historyUpgrades.push(obj)
            }

            //console.log(historyUpgrades);

            this.setState({ historyUpgrades, loadingHistoryUpgrades: false })
  		})
		.catch(e => {
			console.log(e)
		})
    }

    getWizardSelected() {
        const { userMintedNfts, wizardSelectedIdShop } = this.props

        //console.log(userMintedNfts, wizardSelectedIdShop);
        if (!userMintedNfts) {
            return undefined
        }

        const wizard = userMintedNfts.find(i => i.id === wizardSelectedIdShop)

        if (wizard) {
            return wizard
        }

        return undefined
    }

    buyStat(stat, costo) {
        const { account, chainId, gasPrice, netId } = this.props
        const { increase } = this.state

        const wizard = this.getWizardSelected()

        this.setState({ nameNftToUpgrade: wizard.name, statToUpgrade: stat, wizaCostToUpgrade: costo, howMuchIncrement: increase[stat] })

        this.props.buyUpgrade(chainId, gasPrice, netId, account, wizard.id, stat, increase[stat])
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
            return <div key={index} />
        }

		return (
			<NftCardShop
				key={index}
				item={item}
				width={200}
                isSelect={isSelect}
				onSelect={() => {
                    this.props.setWizardSelectedShop(item.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onChange={() => this.props.setWizardSelectedShop(undefined)}
			/>
		)
	}

    renderShopCard(key) {
        const { increase } = this.state

        const wizard = this.getWizardSelected()

        const increaseTo = increase[key]
        let statToUpgrade;
        let costo = 0;
        let newLevel;

        if (wizard && wizard.id) {
            statToUpgrade = wizard[key].int
            let arrayLevelsTo = []

            for (let i = 0; i < increaseTo; i++) {
                arrayLevelsTo.push(statToUpgrade + i)
            }

            //console.log(arrayLevelsTo);
            arrayLevelsTo.map(s => {
                costo += calcUpgradeCost(s, key)
            })

            //console.log(arrayLevelsTo);

            const copySelected = {
                hp: wizard.hp.int,
                defense: wizard.defense.int,
                attack: wizard.attack.int,
                damage: wizard.damage.int
            }

            copySelected[key] = arrayLevelsTo[arrayLevelsTo.length - 1]

            //console.log(copySelected);
            newLevel = calcLevelWizardAfterUpgrade(copySelected, key)
        }

        let colorTextLevel = getColorTextBasedOnLevel(newLevel)
        if (newLevel > MAX_LEVEL) {
            colorTextLevel = "red"
        }


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
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 58, height: 58, marginBottom: 14, alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={img}
                            style={imgStyle}
                            alt="logo"
                        />
                    </div>


                    <div style={{ justifyContent: 'space-between', marginBottom: 15, width: '100%' }}>

                        <button
                            style={{ marginLeft: 15, cursor: 'pointer', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => {
                                if (!wizard) {
                                    return
                                }

                                const oldState = Object.assign({}, this.state.increase)
                                if (oldState[key] === 1) {
                                    return
                                }

                                oldState[key] -= 1

                                this.setState({ increase: oldState })
							}}
                        >
                            <AiOutlineMinus
                                color="white"
                                size={22}
                            />
                        </button>


                        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ fontSize: 22, color: 'white' }}>
                                +{increase[key]}
                            </p>

                            <p style={{ fontSize: 20, color: 'white' }}>
                                {key.toUpperCase()}
                            </p>
                        </div>

                        <button
							style={{ marginRight: 15, cursor: 'pointer', justifyContent: 'center', alignItems: 'center' }}
							onClick={() => {
                                if (!wizard) {
                                    return
                                }

                                const oldState = Object.assign({}, this.state.increase)
                                oldState[key] += 1

                                this.setState({ increase: oldState })
							}}
						>
							<AiOutlinePlus
								color="white"
								size={22}
							/>
						</button>
                    </div>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        $WIZA
                    </p>
                    <p style={{ fontSize: 21, color: 'white', marginBottom: 15 }}>
                        {costo.toFixed(2)}
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        NEW LEVEL
                    </p>
                    <p style={{ fontSize: 21, color: colorTextLevel, marginBottom: 20 }}>
                        {newLevel}
                    </p>
                </div>

                <button
                    className='btnH'
                    style={Object.assign({}, styles.btnChoose, { opacity: newLevel > MAX_LEVEL ? 0.5 : 1 })}
                    onClick={() => {

                        if (!wizard || newLevel > MAX_LEVEL) {
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
                    +{item.increment} {item.stat}
                </p>

                <p style={{ color: 'white', fontSize: 18 }}>
                    $WIZA {item.cost}
                </p>
            </div>
        )
    }

    renderChoises(width) {
        const { userMintedNfts } = this.props

        const sorted = this.sortById()

        return (
            <div style={{ width, flexDirection: 'column', paddingTop: 30 }}>
                <p style={{ fontSize: 22, color: 'white', marginBottom: 10 }}>
                    Select the Wizard you want to improve
                </p>

                <p style={{ fontSize: 17, color: 'white', marginBottom: 15 }}>
                    ATK and DMG you'll see in each wizard is their base ATK and DMG, it doesn't take into account the selected spell.
                </p>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                <div style={{ flexWrap: 'wrap', marginBottom: 30 }}>
                    {
                        userMintedNfts && userMintedNfts.length > 0 &&
                        sorted.map((item, index) => {
                            return this.renderRowChoise(item, index, true)
                        })
                    }

                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { isConnected, showModalConnection, historyUpgrades } = this.state
        const { account, showModalTx, wizaBalance } = this.props

        const { boxW, modalW } = getBoxWidth(isMobile)

        const wizard = this.getWizardSelected()

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


        if (!wizard) {
            return this.renderChoises(boxW)
        }

        return (
            <div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>

                <div style={{ flexDirection: isMobile ? 'column' : 'row', marginBottom: 30 }}>

                    <div style={{ height: 'fit-content', marginRight: 30 }} className={wizard ? "selectedShow" : "selectedHide"}>
                        {this.renderRowChoise(wizard, 0, false)}
                    </div>


                    <div style={{ flexDirection: 'column' }}>

                        <p style={{ fontSize: 22, color: "white", marginBottom: 15 }}>
                            $WIZA balance: {wizaBalance || 0.0}
                        </p>

                        <p style={{ fontSize: 22, color: "white", marginBottom: 25 }}>
                            LEVEL CAP: {MAX_LEVEL}
                        </p>

                        <p style={{ fontSize: 26, color: 'white', marginBottom: 10 }}>
                            UPGRADES
                        </p>

                        <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            {this.renderShopCard("hp")}

                            {this.renderShopCard("defense")}

                            {this.renderShopCard("attack")}

                            {this.renderShopCard("damage")}

                        </div>

                    </div>

                </div>


                <p style={{ fontSize: 26, color: 'white', marginBottom: 15 }}>
                    HISTORY
                </p>

                {
                    historyUpgrades.map((item, index) => {
                        return this.renderHistory(item, index)
                    })
                }

                {
                    this.state.loadingHistoryUpgrades &&
                    <p style={{ fontSize: 15, color: 'white' }}>
                        Loading...
                    </p>
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
                    howMuchIncrement={this.state.howMuchIncrement}
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
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, wizaBalance, wizardSelectedIdShop } = state.mainReducer;

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, wizaBalance, wizardSelectedIdShop };
}

export default connect(mapStateToProps, {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getWizaBalance,
    buyUpgrade,
    setWizardSelectedShop
})(Shop)
