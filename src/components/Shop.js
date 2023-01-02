import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, collection } from "firebase/firestore";
import { firebasedb } from './Firebase';
import { AiOutlinePlus } from 'react-icons/ai'
import { AiOutlineMinus } from 'react-icons/ai'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import NftCardShop from './common/NftCardShop'
import calcUpgradeCost from './common/CalcUpgradeCost'
import { calcLevelWizardAfterUpgrade, getColorTextBasedOnLevel, calcLevelWizard } from './common/CalcLevelWizard'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getWizaBalance,
    buyUpgrade,
    setWizardSelectedShop,
    getPotionEquipped,
    buyVial
} from '../actions'
import { BACKGROUND_COLOR, MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR, MAX_LEVEL } from '../actions/types'
import '../css/Nft.css'
import '../css/Shop.css'

const potion_hp = require('../assets/potion_hp.png')
const potion_def = require('../assets/potion_def.png')
const potion_atk = require('../assets/potion_atk.png')
const potion_dmg = require('../assets/potion_dmg.png')

const vial_hp = require('../assets/vial_hp.png')
const vial_def = require('../assets/vial_def.png')
const vial_atk = require('../assets/vial_atk.png')
const vial_dmg = require('../assets/vial_dmg.png')


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
            increase: { hp: 1, defense: 1, attack: 1, damage: 1},
            potionEquipped: "",
            loadingPotionEquipped: false,
            tournamentName: ""
        }
    }

    componentDidMount() {
		document.title = "Magic Shop - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
			this.loadProfile()

            if (this.props.wizardSelectedIdShop) {
                this.getPotionEquipped()
            }
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

    async getPotionEquipped() {
        const { chainId, gasPrice, gasLimit, networkUrl, wizardSelectedIdShop } = this.props

        this.setState({ loadingPotionEquipped: true })

        const querySnapshot = await getDocs(collection(firebasedb, "stage"))

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
			const tournament = doc.data()

            const tournamentName = tournament.name.split("_")[0]

            const key = `${tournamentName}_${wizardSelectedIdShop}`

            this.props.getPotionEquipped(chainId, gasPrice, gasLimit, networkUrl, key, (response) => {
                //console.log(response);
                this.setState({ potionEquipped: response.potionEquipped, loadingPotionEquipped: false, tournamentName })
            })
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

        this.setState({ nameNftToUpgrade: wizard.name, statToUpgrade: stat, wizaCostToUpgrade: costo, howMuchIncrement: increase[stat], typeModal: 'upgrade' })

        this.props.buyUpgrade(chainId, gasPrice, netId, account, wizard.id, stat, increase[stat])
    }

    buyVial(potion, costo) {
        const { account, chainId, gasPrice, netId } = this.props
        const { tournamentName } = this.state

        const wizard = this.getWizardSelected()

        const key = `${tournamentName}_${wizard.id}`

        this.setState({ nameNftToUpgrade: wizard.name, statToUpgrade: potion, wizaCostToUpgrade: costo, typeModal: 'buyvial' })

        this.props.buyVial(chainId, gasPrice, netId, account, wizard.id, key, potion)
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

                    setTimeout(() => {
                        this.getPotionEquipped()
                    }, 200)
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
        if (key === "hp") {
            img = potion_hp
        }
        else if (key === "defense") {
            img = potion_def
        }
        else if (key === "attack") {
            img = potion_atk
        }
        else if (key === "damage") {
            img = potion_dmg
        }

        return (
            <div
                className="cardShopShadow"
                style={styles.cardShopStyle}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={img}
                            style={{ width: 110, height: 110 }}
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
                    <p style={{ fontSize: 21, color: colorTextLevel, marginBottom: 10 }}>
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

    renderVialCard(key, canBuy) {
        const { loadingPotionEquipped } = this.state

        const wizard = this.getWizardSelected()

        if (!wizard) {
            return <div />
        }

        let bonus;
        let costo = 0;
        let level = calcLevelWizard(wizard)

        let img;
        if (key === "hp") {
            img = vial_hp
            bonus = 5
            costo = (level / 2) + 0.01
        }
        else if (key === "defense") {
            img = vial_def
            bonus = 2
            costo = level + 0.01
        }
        else if (key === "attack") {
            img = vial_atk
            bonus = 2
            costo = level + 0.01
        }
        else if (key === "damage") {
            img = vial_dmg
            bonus = 3
            costo = Math.round(level / 1.4) + 0.01
        }

        return (
            <div
                className="cardShopShadow"
                style={styles.cardVialStyle}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 70, height: 70, marginBottom: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={img}
                            style={{ height: 70 }}
                            alt="logo"
                        />
                    </div>


                    <p style={{ fontSize: 22, color: 'white' }}>
                        +{bonus}
                    </p>

                    <p style={{ fontSize: 20, color: 'white', marginBottom: 10 }}>
                        {key.toUpperCase()}
                    </p>

                    {
                        canBuy ?
                        <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ fontSize: 17, color: 'white' }}>
                                $WIZA
                            </p>
                            <p style={{ fontSize: 21, color: 'white', marginBottom: 15 }}>
                                {costo.toFixed(2)}
                            </p>
                        </div>
                        : null
                    }

                </div>

                {
                    loadingPotionEquipped ?
                    <div
                        className='btnH'
                        style={styles.btnChoose}
                    >
                        <p style={{ fontSize: 15, color: 'white' }}>
                            LOADING
                        </p>
                    </div>
                    : null
                }

                {
                    canBuy && !loadingPotionEquipped ?
                    <button
                        className='btnH'
                        style={styles.btnChoose}
                        onClick={() => {
                            this.buyVial(key, costo)
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            BUY VIAL
                        </p>
                    </button>
                    : null
                }

                {
                    !canBuy && !loadingPotionEquipped ?
                    <div
                        className='btnH'
                        style={styles.btnChoose}
                    >
                        <p style={{ fontSize: 16, color: 'white' }}>
                            EQUIPPED
                        </p>
                    </div>
                    : null
                }

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
        const { isConnected, showModalConnection, historyUpgrades, potionEquipped } = this.state
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

                        <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                            {this.renderShopCard("hp")}

                            {this.renderShopCard("defense")}

                            {this.renderShopCard("attack")}

                            {this.renderShopCard("damage")}

                        </div>

                        {
                            !potionEquipped ?
                            <div style={{ flexDirection: 'column' }}>
                                <p style={{ fontSize: 26, color: 'white', marginBottom: 5 }}>
                                    VIALS
                                </p>

                                <p style={{ fontSize: 18, color: 'white', marginBottom: 10 }}>
                                    In each tournament you will be able to buy one vial to temporarily upgrade your wizard. The bonus will last the whole tournament.
                                </p>

                                <p style={{ fontSize: 18, color: 'white', marginBottom: 10 }}>
                                    ATTENTION! Each wizard can have a maximum of one vial
                                </p>

                                <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                    {this.renderVialCard("hp", true)}

                                    {this.renderVialCard("defense", true)}

                                    {this.renderVialCard("attack", true)}

                                    {this.renderVialCard("damage", true)}

                                </div>
                            </div>
                            :
                            <div style={{ flexDirection: 'column' }}>
                                <p style={{ fontSize: 26, color: 'white', marginBottom: 5 }}>
                                    VIALS
                                </p>

                                <p style={{ fontSize: 17, color: 'white', marginBottom: 10 }}>
                                    Vial Equipped
                                </p>
                                {this.renderVialCard(potionEquipped, false)}
                            </div>
                        }

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
    cardVialStyle: {
        width: 160,
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
    setWizardSelectedShop,
    getPotionEquipped,
    buyVial
})(Shop)
