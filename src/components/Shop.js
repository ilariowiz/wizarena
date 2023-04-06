import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import { round } from 'lodash'
import { AiOutlinePlus } from 'react-icons/ai'
import { AiOutlineMinus } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5'
import Media from 'react-media';
import Popup from 'reactjs-popup';
import toast, { Toaster } from 'react-hot-toast';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import ModalSwapSpell from './common/ModalSwapSpell'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalSetName from './common/ModalSetName'
import NftCardShop from './common/NftCardShop'
import NftCardShopSelected from './common/NftCardShopSelected'
import calcUpgradeCost from './common/CalcUpgradeCost'
import allSpells from './common/Spells'
import conditions from './common/Conditions'
import { calcLevelWizardAfterUpgrade, getColorTextBasedOnLevel, calcLevelWizardAfterDowngrade } from './common/CalcLevelWizard'
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
    buyVial,
    buyNickname,
    buyUpgradeWithAp,
    burnAP,
    loadEquipMinted,
    equipItem,
    unequipItem,
    buyDowngrade,
    getWizaValue,
    updateInfoTransactionModal,
    swapSpell
} from '../actions'
import { BACKGROUND_COLOR, MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR, MAX_LEVEL, TEST_NET_ID } from '../actions/types'
import '../css/Nft.css'
import '../css/Shop.css'

const potion_hp = require('../assets/potion_hp.png')
const potion_def = require('../assets/potion_def.png')
const potion_atk = require('../assets/potion_atk.png')
const potion_dmg = require('../assets/potion_dmg.png')
const potion_ap_burn = require('../assets/potion_ap_burn.png')
const potion_speed = require('../assets/potion_speed.png')

const vial_hp = require('../assets/vial_hp.png')
const vial_def = require('../assets/vial_def.png')
const vial_atk = require('../assets/vial_atk.png')
const vial_dmg = require('../assets/vial_dmg.png')
const vial_speed = require('../assets/vial_speed.png')

const banner_nickname = require('../assets/banner_nickname.png')

const ring_dmg = require('../assets/ring_dmg_1.png')

const retrain_def = require('../assets/retrain_def.png')
const retrain_atk = require('../assets/retrain_atk.png')
const retrain_dmg = require('../assets/retrain_dmg.png')
const retrain_speed = require('../assets/retrain_speed.png')
const retrain_hp = require('../assets/retrain_hp.png')

const book_shop = require('../assets/book_shop.png')


class Shop extends Component {
    constructor(props) {
        super(props)

        let isConnected = this.props.account && this.props.account.account

        this.state = {
            loading: true,
            isConnected,
            showModalConnection: false,
            historyUpgrades: [],
            loadingHistoryUpgrades: true,
            increase: { hp: 1, defense: 1, attack: 1, damage: 1, speed: 1},
            potionEquipped: "",
            loadingPotionEquipped: false,
            tournamentName: "",
            showModalSetName: false,
            apToBurn: 1,
            equipment: [],
            decrease: { hp: 1, defense: 1, attack: 1, damage: 1, speed: 1},
            baseStats: undefined,
            wizaValue: 0,
            loadingEquip: true,
            itemsToShow: [],
            searchText: "",
            searchedText: "",
            showModalBuy: false,
            showModalSwapSpell: false,
            newSpellToLearn: {}
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

                this.getBaseStats()
            }
		}, 500)
	}

    loadProfile() {
		this.loadMinted()

        this.loadEquip()

		this.loadWizaBalance()

        this.getHistoryUpgrades()

        this.loadWizaValue()
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

    loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                //rimuoviamo i listed
                let equipment = response.filter(i => !i.listed)

                setTimeout(() => {
                    const wizard = this.getWizardSelected()
                    //console.log(wizard);
                    if (wizard) {
                        const equippedItem = equipment.find(i => i.equippedToId === wizard.id)
                        if (equippedItem) {
                            //mostriamo solo quello equippato
                            equipment = [equippedItem]
                        }
                        else {
                            equipment = equipment.filter(i => !i.equipped)
                        }
                    }

                    this.setState({ equipment, loadingEquip: false })
                }, 500)
			})
		}
    }

	loadWizaBalance() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account)
		}
	}

    loadWizaValue() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getWizaValue(chainId, gasPrice, gasLimit, networkUrl, (wizaValue) => {
            console.log(wizaValue);
            this.setState({ wizaValue })
        })
	}

    async getHistoryUpgrades() {
        const { account } = this.props

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

    async getBaseStats() {
        const { wizardSelectedIdShop } = this.props

        if (wizardSelectedIdShop) {
            const docRef = doc(firebasedb, "base_stats", `${wizardSelectedIdShop}`)

    		const docSnap = await getDoc(docRef)
    		let data = docSnap.data()

            if (data) {
                if (!data.speed) {
                    data['speed'] = 0
                }
                //console.log(data);
                this.setState({ baseStats: data })
            }
        }
    }

    getWizardSelected() {
        const { userMintedNfts, wizardSelectedIdShop } = this.props

        //console.log(userMintedNfts, wizardSelectedIdShop);
        if (!userMintedNfts) {
            return undefined
        }

        const wizard = userMintedNfts.find(i => i.id === wizardSelectedIdShop)

        //console.log(wizard);

        if (wizard) {
            return wizard
        }

        return undefined
    }

    searchByName() {
		const { searchText, equipment } = this.state

        if (!searchText) {
            return
        }

		let result = equipment.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()))

        if (result.length === 0) {
            result = equipment.filter(i => i.id === searchText)
        }

		this.setState({ itemsToShow: result, searchedText: searchText })
	}

    cancelSearch() {
		this.setState({ searchedText: '', searchText: '', itemsToShow: [] })
	}

    buyStat(stat, costo) {
        const { account, chainId, gasPrice, netId, txListen } = this.props
        const { increase } = this.state

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot upgrade if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        let nameNftToUpgrade = wizard.name
        if (wizard.nickname) {
            nameNftToUpgrade = `${wizard.name} ${wizard.nickname}`
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will improve the ${stat} of ${nameNftToUpgrade}`,
			typeModal: 'upgrade',
			transactionOkText: `Your Wizard #${wizard.id} is stronger now!`,
            nameNft: nameNftToUpgrade,
            statToUpgrade: stat,
            howMuchIncrement: increase[stat],
            idNft: wizard.id
		})

        this.props.buyUpgrade(chainId, gasPrice, netId, account, wizard.id, stat, increase[stat])
    }

    buyStatWithAP(stat, costo) {
        const { account, chainId, gasPrice, netId, txListen } = this.props
        const { increase } = this.state

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot upgrade if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        let nameNftToUpgrade = wizard.name
        if (wizard.nickname) {
            nameNftToUpgrade = `${wizard.name} ${wizard.nickname}`
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will improve the ${stat} of ${nameNftToUpgrade}`,
			typeModal: 'upgrade',
			transactionOkText: `Your Wizard #${wizard.id} is stronger now!`,
            nameNft: nameNftToUpgrade,
            statToUpgrade: stat,
            howMuchIncrement: increase[stat],
            idNft: wizard.id
		})

        this.props.buyUpgradeWithAp(chainId, gasPrice, netId, account, wizard.id, stat, increase[stat])
    }

    burnAP() {
        const { account, chainId, gasPrice, netId, txListen } = this.props
        const { apToBurn } = this.state

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot burn AP if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will burn ${apToBurn} AP for ${apToBurn*15} $WIZA`,
			typeModal: 'burnap',
			transactionOkText: 'AP burned successfully',
		})

        this.props.burnAP(chainId, gasPrice, netId, account, wizard.id, apToBurn)
    }

    downgrade(stat, costo) {
        const { account, chainId, gasPrice, netId, txListen } = this.props
        const { decrease } = this.state

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot downgrade if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        let nameNftToUpgrade = wizard.name
        if (wizard.nickname) {
            nameNftToUpgrade = `${wizard.name} ${wizard.nickname}`
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will downgrade the ${stat} of ${nameNftToUpgrade}`,
			typeModal: 'downgrade',
			transactionOkText: 'Retrain done!',
            nameNft: nameNftToUpgrade,
            statToUpgrade: stat,
            howMuchIncrement: decrease[stat],
            idNft: wizard.id
		})

        this.props.buyDowngrade(chainId, gasPrice, netId, account, wizard.id, stat, decrease[stat])
    }

    buyVial(potion, costo) {
        const { account, chainId, gasPrice, netId, txListen } = this.props
        const { tournamentName } = this.state

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot buy a vial if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        const key = `${tournamentName}_${wizard.id}`

        let nameNftToUpgrade = wizard.name
        if (wizard.nickname) {
            nameNftToUpgrade = `${wizard.name} ${wizard.nickname}`
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will buy the ${potion} vial for the ${nameNftToUpgrade}`,
			typeModal: 'buyvial',
			transactionOkText: `Vial bought!`,
            nameNft: nameNftToUpgrade,
            statToUpgrade: potion,
            idNft: wizard.id
		})

        this.props.buyVial(chainId, gasPrice, netId, account, wizard.id, key, potion)
    }

    buyNickname(nickname) {
        const { account, chainId, gasPrice, netId, txListen } = this.props

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot set a nickname if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will give the nickname ${nickname} to Wizard ${wizard.name}`,
			typeModal: 'buynickname',
			transactionOkText: 'Nickname set successfully',
            nameNft: wizard.name,
            idNft: wizard.id,
            nicknameToSet: nickname
		})

        this.props.buyNickname(chainId, gasPrice, netId, account, wizard.id, nickname)
    }

    equipEquipment(id, name) {
        const { account, chainId, gasPrice, netId, txListen } = this.props

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot equip if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        //console.log(wizard);
        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will equip ${name} to ${wizard.name}`,
			typeModal: 'equip',
			transactionOkText: `${name} successfully equipped!`,
            nameNft: wizard.name,
            ringToEquipName: name
		})

        this.props.equipItem(chainId, gasPrice, netId, id, account, wizard.id)
    }

    unequipEquipment(id, name) {
        const { account, chainId, gasPrice, netId, txListen } = this.props

        /*
        if (txListen && txListen.length > 0) {
            toast.error('You cannot unequip if there is a transaction in progress')
            return
        }
        */

        const wizard = this.getWizardSelected()

        //console.log(wizard);
        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will unequip ${name} from ${wizard.name}`,
			typeModal: 'unequip',
			transactionOkText: `${name} successfully unequipped!`,
            nameNft: wizard.name,
            ringToEquipName: name
		})

        this.props.unequipItem(chainId, gasPrice, netId, id, account, wizard.id)
    }

    swapSpell(oldspell) {
        const { account, chainId, gasPrice, netId } = this.props
        const { newSpellToLearn } = this.state

        const wizard = this.getWizardSelected()

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will swap ${oldspell.name} to ${newSpellToLearn.name}`,
			typeModal: 'swapspell',
			transactionOkText: `Spell swapped successfully!`
		})

        this.props.swapSpell(chainId, gasPrice, netId, account, wizard.id, oldspell.name, newSpellToLearn.name)
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
                        this.loadEquip()
                        this.getBaseStats()
                    }, 200)
                }}
			/>
		)
	}

    renderRowSelected(item, index, width) {

        if (!item.attack) {
            return <div key={index} />
        }

        let w = width * 90 / 100
        if (w > 400) {
            w = 400
        }

		return (
			<NftCardShopSelected
				key={index}
				item={item}
				width={w}
                onChange={() => {
                    this.setState({ searchText: "", searchedText: "", itemsToShow: [], equipment: [], loadingEquip: true })
                    this.props.setWizardSelectedShop(undefined)
                }}
			/>
		)
	}

    renderRingsCard(item, index, isMobile) {

        const bonusValues = item.bonus.split(",")

        let bonuses = []
        bonusValues.map(i => {
            const b = i.split("_")
            const btext = `+${b[0]} ${b[1]}`
            bonuses.push(btext)
        })

        const wizard = this.getWizardSelected()

        const isEquipped = item.equippedToId === wizard.id

        return (
            <div
                key={index}
                className="cardShopShadow"
                style={Object.assign({}, styles.cardShopStyle, { marginRight: isMobile ? 10 : 35, marginBottom: isMobile ? 10 : 35 })}
            >
                <img
                    src={item.url}
                    style={{ width: 100, marginBottom: 10 }}
                    alt="Ring"
                />

                <p style={{ fontSize: 19, color: 'white', marginBottom: 10, textAlign: 'center', minHeight: 38, marginRight: 9, marginLeft: 9 }}>
                    #{item.id} {item.name}
                </p>

                <p style={{ fontSize: 18, color: 'white', marginBottom: 15, textAlign: 'center' }}>
                    {bonuses.join(", ")}
                </p>

                {
                    isEquipped ?
                    <button
                        className='btnH'
                        style={styles.btnChoose}
                        onClick={() => {
                            this.unequipEquipment(item.id, item.name)
                        }}
                    >
                        <p style={{ fontSize: 16, color: 'white' }}>
                            UNEQUIP <br /><span style={{ fontSize: 13 }}>({Math.floor(wizard.level / 5)} WIZA)</span>
                        </p>
                    </button>
                    :
                    <button
                        className='btnH'
                        style={styles.btnChoose}
                        onClick={() => {
                            this.equipEquipment(item.id, item.name)
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            EQUIP
                        </p>
                    </button>
                }
            </div>
        )
    }

    renderShopCard(key, isMobile) {
        const { increase, wizaValue } = this.state

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
                costo += calcUpgradeCost(s, key, wizaValue)
            })

            //console.log(arrayLevelsTo);

            //console.log(wizard);

            const copySelected = {
                hp: wizard.hp.int,
                defense: wizard.defense.int,
                attack: wizard.attack.int,
                damage: wizard.damage.int,
                speed: wizard.speed.int || 0
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
        else if (key === "speed") {
            img = potion_speed
        }

        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.cardShopStyle, { marginRight: isMobile ? 10 : 35, marginBottom: isMobile ? 10 : 35 })}
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

    renderAPShopCard(key, isMobile) {
        const { increase } = this.state

        const wizard = this.getWizardSelected()

        const increaseTo = increase[key]

        let apCosts = {
            hp_cost: 1,
            defense_cost: 4,
            attack_cost: 4,
            damage_cost: 2,
            speed_cost: 2
        }

        let statToUpgrade;

        const baseApCost = apCosts[`${key}_cost`]

        let costo = increaseTo * baseApCost;
        let newLevel;

        if (wizard && wizard.id) {
            statToUpgrade = wizard[key].int
            let arrayLevelsTo = []

            for (let i = 0; i < increaseTo; i++) {
                arrayLevelsTo.push(statToUpgrade + i)
            }

            //console.log(arrayLevelsTo);

            let speed = wizard.speed.int
            if (!speed) {
                speed = 0
            }

            const copySelected = {
                hp: wizard.hp.int,
                defense: wizard.defense.int,
                attack: wizard.attack.int,
                damage: wizard.damage.int,
                speed
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
        else if (key === "speed") {
            img = potion_speed
        }

        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.cardShopStyle, { marginRight: isMobile ? 10 : 35, marginBottom: isMobile ? 10 : 35 })}
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
                        AP
                    </p>
                    <p style={{ fontSize: 21, color: 'white', marginBottom: 15 }}>
                        {costo}
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

                        this.buyStatWithAP(key, costo)
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        UPGRADE
                    </p>
                </button>

            </div>
        )
    }

    renderAPBurnCard(isMobile) {
        const { apToBurn } = this.state

        const wizard = this.getWizardSelected()

        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.cardShopStyle, { marginRight: isMobile ? 10 : 35, marginBottom: isMobile ? 10 : 35 })}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={potion_ap_burn}
                            style={{ width: 110, height: 110 }}
                            alt="logo"
                        />
                    </div>


                    <div style={{ justifyContent: 'space-between', marginBottom: 15, width: '100%' }}>

                        <button
                            style={{ marginLeft: 15, cursor: 'pointer', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => {
                                if (!wizard || this.state.apToBurn <= 1) {
                                    return
                                }

                                this.setState({ apToBurn: this.state.apToBurn - 1 })
							}}
                        >
                            <AiOutlineMinus
                                color="white"
                                size={22}
                            />
                        </button>


                        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ fontSize: 22, color: 'white' }}>
                                {apToBurn}
                            </p>

                            <p style={{ fontSize: 20, color: 'white' }}>
                                AP
                            </p>
                        </div>

                        <button
							style={{ marginRight: 15, cursor: 'pointer', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => {
                                if (!wizard || this.state.apToBurn >= wizard.ap.int) {
                                    return
                                }

                                this.setState({ apToBurn: this.state.apToBurn + 1 })
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
                        {apToBurn * 15}
                    </p>

                    <div style={{ height: 48 }}/>
                </div>

                <button
                    className='btnH'
                    style={Object.assign({}, styles.btnChoose, { opacity: wizard.ap && wizard.ap.int === 0 ? 0.5 : 1 })}
                    onClick={() => {
                        if (!wizard) {
                            return
                        }

                        this.burnAP()
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        BURN
                    </p>
                </button>

            </div>
        )
    }

    renderRetrainShopCard(key, isMobile) {
        const { decrease, baseStats } = this.state

        const wizard = this.getWizardSelected()

        const decreaseTo = decrease[key]

        let apGain = {
            hp_gain: 0.5,
            defense_gain: 2,
            attack_gain: 2,
            damage_gain: 1,
            speed_gain: 1
        }

        const downgradesLeft = wizard.downgrades ? wizard.downgrades.int : 0

        let statToDowngrade;

        const baseApGain = apGain[`${key}_gain`]

        //console.log(decreaseTo, key, baseApGain);

        let gain = Math.floor(decreaseTo * baseApGain);
        if (gain > downgradesLeft) {
            gain = downgradesLeft
        }

        let newLevel;

        if (wizard && wizard.id) {
            statToDowngrade = wizard[key].int
            let arrayLevelsTo = []

            for (let i = 0; i < decreaseTo; i++) {
                if ((statToDowngrade - i) < 0) {
                    break
                }
                arrayLevelsTo.push(statToDowngrade - i)
            }

            //console.log(arrayLevelsTo);

            const copySelected = {
                hp: wizard.hp.int,
                defense: wizard.defense.int,
                attack: wizard.attack.int,
                damage: wizard.damage.int,
                speed: wizard.speed ? wizard.speed.int : 0
            }

            copySelected[key] = arrayLevelsTo[arrayLevelsTo.length - 1]

            //console.log(copySelected);
            newLevel = calcLevelWizardAfterDowngrade(copySelected, key)
        }

        let colorTextLevel = getColorTextBasedOnLevel(newLevel)
        if (newLevel > MAX_LEVEL) {
            colorTextLevel = "red"
        }


        let img;
        if (key === "hp") {
            img = retrain_hp
        }
        else if (key === "defense") {
            img = retrain_def
        }
        else if (key === "attack") {
            img = retrain_atk
        }
        else if (key === "damage") {
            img = retrain_dmg
        }
        else if (key === "speed") {
            img = retrain_speed
        }

        if (!baseStats) {
            return <div />
        }

        const baseStat = baseStats[key]


        const statAfterDowngrade = wizard[key].int - decrease[key]

        let canDecrease = statAfterDowngrade >= baseStat
        //console.log(statAfterDowngrade, key, canDecrease);

        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.cardShopStyle, { marginRight: isMobile ? 10 : 35, marginBottom: isMobile ? 10 : 35 })}
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

                                const oldState = Object.assign({}, this.state.decrease)
                                if (oldState[key] === 1) {
                                    return
                                }

                                oldState[key] -= 1

                                this.setState({ decrease: oldState })
							}}
                        >
                            <AiOutlineMinus
                                color={canDecrease ? "white" : "#c2c0c0"}
                                size={22}
                            />
                        </button>


                        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ fontSize: 22, color: 'white' }}>
                                -{decrease[key]}
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

                                const oldState = Object.assign({}, this.state.decrease)
                                oldState[key] += 1

                                const newStatAfterDowngrade = wizard[key].int - oldState[key]

                                let newCanDecrease = newStatAfterDowngrade >= baseStat

                                if (!newCanDecrease) {
                                    return
                                }

                                this.setState({ decrease: oldState })
							}}
						>
							<AiOutlinePlus
								color={canDecrease ? "white" : "#c2c0c0"}
								size={22}
							/>
						</button>
                    </div>

                    <p style={{ fontSize: 17, color: '#c2c0c0' }}>
                        INITIAL STAT
                    </p>
                    <p style={{ fontSize: 17, color: '#c2c0c0', marginBottom: 15 }}>
                        {baseStat}
                    </p>

                    <div style={{ alignItems: 'center', justifyContent: 'center' }}>

                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>
                            <p style={{ fontSize: 17, color: '#f80303', marginBottom: 5 }}>
                                COST
                            </p>
                            <p style={{ fontSize: 17, color: 'white' }}>
                                WIZA
                            </p>
                            <p style={{ fontSize: 21, color: 'white', marginBottom: 15 }}>
                                {decreaseTo * 15}
                            </p>
                        </div>

                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: 20 }}>
                            <p style={{ fontSize: 17, color: 'gold', marginBottom: 5 }}>
                                GAIN
                            </p>
                            <p style={{ fontSize: 17, color: 'white' }}>
                                AP
                            </p>
                            <p style={{ fontSize: 21, color: 'white', marginBottom: 15 }}>
                                {gain}
                            </p>
                        </div>


                    </div>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        {canDecrease ? "NEW LEVEL" : "LEVEL"}
                    </p>
                    <p style={{ fontSize: 21, color: colorTextLevel, marginBottom: 10 }}>
                        {canDecrease ? newLevel : wizard.level}
                    </p>
                </div>

                <button
                    className='btnH'
                    style={Object.assign({}, styles.btnChoose, { opacity: !canDecrease ? 0.5 : 1 })}
                    onClick={() => {

                        if (!wizard || !canDecrease) {
                            return
                        }

                        this.downgrade(key, decreaseTo*5)
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        DOWNGRADE
                    </p>
                </button>

            </div>
        )
    }

    renderVialCard(key, canBuy, isMobile) {
        const { loadingPotionEquipped, wizaValue } = this.state

        const wizard = this.getWizardSelected()

        if (!wizard) {
            return <div />
        }

        let bonus;
        let costo = round(wizaValue * 2.1, 2);

        let img;
        if (key === "hp") {
            img = vial_hp
            bonus = 8
        }
        else if (key === "defense") {
            img = vial_def
            bonus = 2
        }
        else if (key === "attack") {
            img = vial_atk
            bonus = 2
        }
        else if (key === "damage") {
            img = vial_dmg
            bonus = 4
        }
        else if (key === "speed") {
            img = vial_speed
            bonus = 4
        }

        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.cardVialStyle, { marginRight: isMobile ? 10 : 35, marginBottom: isMobile ? 10 : 35 })}
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

    renderCardNickname(isMobile) {
        const { wizaValue } = this.state
        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.cardVialStyle, { marginBottom: 30 })}
            >
                <p style={{ fontSize: 22, color: 'white', marginBottom: 15, marginTop: 15 }}>
                    EPIC NAME
                </p>

                <p style={{ fontSize: 17, color: 'white' }}>
                    $WIZA
                </p>
                <p style={{ fontSize: 21, color: 'white', marginBottom: 20 }}>
                    {round(wizaValue * 1.4, 2)}
                </p>

                <button
                    className='btnH'
                    style={styles.btnChoose}
                    onClick={() => {
                        this.setState({ showModalSetName: true })
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        SET NAME
                    </p>
                </button>

            </div>
        )
    }

    renderHistory(item, index) {
        //console.log(item);

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

                {
                    item.cost.int ?
                    <p style={{ color: 'white', fontSize: 18 }}>
                        AP {item.cost.int}
                    </p>
                    :
                    <p style={{ color: 'white', fontSize: 18 }}>
                        $WIZA {item.cost}
                    </p>

                }
            </div>
        )
    }

    renderChoises(width, isMobile) {
        const { userMintedNfts } = this.props

        const sorted = this.sortById()

        return (
            <div style={{ flexDirection: 'column', width, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'auto' }}>

                <p style={{ color: '#8d8d8d', fontSize: 30, marginBottom: 20 }}>
                    Magic Shop
                </p>

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

    renderSpellUnkown(isMobile) {

        const wizard = this.getWizardSelected()

        if (!wizard || !wizard.id) {
            return <div />
        }

        //console.log(wizard);

        if (wizard.spellbook.length < 4) {
            return (
                <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <p style={{ fontSize: 17, color: 'white' }}>
                        Your wizard must know at least 4 spells in order to learn another
                    </p>
                </div>
            )
        }

        const wizardSpellbook = wizard.spellbook

        let spellMancanti = []

        const spellsWizardElement = allSpells.filter(i => i.element === wizard.element)
        //console.log(spellsWizardElement);

        spellsWizardElement.map(i => {
            const alreadyHas = wizardSpellbook.some(s => s.name === i.name)
            if (!alreadyHas) {
                spellMancanti.push(i)
            }
        })

        //console.log(spellMancanti);

        return (
            <div style={{ marginTop: 20, marginBottom: 20, flexDirection: 'column' }}>
                {spellMancanti.map((spell, index) => {
                    return this.renderSpell(spell, index)
                })}
            </div>
        )
    }

    renderSpell(spell, index) {
        const { wizaValue } = this.state

		const marginRight = 12

		//console.log(item);
		let condDesc;
		if (spell.condition && spell.condition.name) {
			let condInfo = conditions.find(i => i.name === spell.condition.name)
			if (condInfo) {
				condDesc = `${condInfo.effect} - Chance of success: ${spell.condition.pct}%`
			}
		}

		return (
			<div key={index} style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>

                <button
                    className="btnH"
                    style={styles.btnSwap}
                    onClick={() => this.setState({ showModalSwapSpell: true, newSpellToLearn: spell })}
                >
                    <p style={{ fontSize: 14, color: 'white', marginBottom: 3 }}>
                        {round((wizaValue * 10), 2)} WIZA
                    </p>
                    <p style={{ fontSize: 16, color: 'white' }}>
                        SWAP
                    </p>
                </button>

				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					NAME
				</p>
				<p style={{ color: "white", fontSize: 20, marginRight }}>
					{spell.name}
				</p>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					PERK
				</p>

				{
					spell.condition && spell.condition.name ?
					<Popup
						trigger={open => (
							<button style={{ color: "white", fontSize: 20, marginRight }}>
								{spell.condition.name}
							</button>
						)}
						position="top center"
						on="hover"
					>
						<div style={{ padding: 10, fontSize: 16 }}>
							{condDesc}
						</div>
					</Popup>
					:
					<p style={{ color: "white", fontSize: 20, marginRight }}>
						-
					</p>
				}



				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					BASE ATK
				</p>
				<p style={{ color: "white", fontSize: 20, marginRight }}>
					{spell.atkBase}
				</p>

				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					BASE DMG
				</p>
				<p style={{ color: "white", fontSize: 20 }}>
					{spell.dmgBase}
				</p>

			</div>
		)
	}

    renderBoxMenu(key) {

        let img;
        let imgStyle;
        if (key === "UPGRADES") {
            img = potion_hp
            imgStyle = { height: 62 }
        }
        else if (key === "AP") {
            img = potion_dmg
            imgStyle = { height: 62 }
        }
        else if (key === "RETRAIN") {
            img = retrain_def
            imgStyle = { height: 62 }
        }
        else if (key === "VIALS") {
            img = vial_atk
            imgStyle = { height: 42 }
        }
        else if (key === "NICKNAME") {
            img = banner_nickname
            imgStyle = { height: 52 }
        }
        else if (key === "RINGS") {
            img = ring_dmg
            imgStyle = { height: 50 }
        }
        else if (key === "SPELLBOOK") {
            img = book_shop
            imgStyle = { height: 40 }
        }

        let divId = `shop-${key.toLowerCase()}`

        return (
            <button
                className="btnH cardShopShadow"
                style={styles.boxMenu}
                onClick={() => {
                    document.getElementById(divId).scrollIntoView({ behavior: 'smooth' })
                }}
            >
                <div style={{ width: 62, height: 62, marginBottom: 3, justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src={img}
                        style={imgStyle}
                        alt="Menu"
                    />
                </div>

                <p style={{ fontSize: 16, color: 'white' }}>
                    {key}
                </p>

            </button>
        )
    }

    renderListStat(item, index) {
		return (
			<button
				key={index}
				style={{ marginBottom: 15, marginLeft: 10 }}
				onClick={() => {
					this.listPopup.close()
                    this.setState({ searchText: item }, () => {
                        this.searchByName()
                    })
				}}
			>
				<p style={{ fontSize: 19 }}>
					{item}
				</p>
			</button>
		)
	}

    renderSearched() {
		const { searchedText } = this.state

		if (!searchedText) {
			return null
		}

		return (
			<div style={{ width: '100%', marginBottom: 20 }}>
				<div style={{ backgroundColor: '#e5e8eb80', justifyContent: 'center', alignItems: 'center', height: 45, paddingLeft: 20, paddingRight: 20, borderRadius: 2 }}>
					<p style={{ fontSize: 22, color: 'black', marginRight: 10 }}>
						{searchedText}
					</p>

					<button
						style={{ paddingTop: 5 }}
						onClick={() => this.cancelSearch()}
					>
						<IoClose
							color='black'
							size={22}
						/>
					</button>
				</div>
			</div>
		)
	}

    renderBoxSearchStat(statDisplay, list) {

		let text = statDisplay.toUpperCase()

		return (
			<Popup
				ref={ref => this.listPopup = ref}
				trigger={
					<button style={styles.btnStat}>
						<p style={{ fontSize: 18, color: 'white' }}>{text}</p>
					</button>
				}
				position="bottom left"
				on="click"
				closeOnDocumentClick
				arrow={true}
			>
				<div style={{ flexDirection: 'column', paddingTop: 10 }}>
					{list.map((item, index) => {
						return this.renderListStat(item, index)
					})}
				</div>
			</Popup>
		)
	}

    renderBody(isMobile) {
        const { isConnected, showModalConnection, historyUpgrades, potionEquipped, equipment, itemsToShow, searchedText } = this.state
        const { account, wizaBalance } = this.props

        const { boxW, modalW } = getBoxWidth(isMobile)

        const wizard = this.getWizardSelected()

        // ACCOUNT NOT CONNECTED
        if (!account || !account.account || !isConnected) {

			return (
				<div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'auto' }}>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 300, height: 300, borderRadius: 2, marginBottom: 30 }}
						alt='Placeholder'
					/>

					<p style={{ fontSize: 19, color: 'white', textAlign: 'center', width: 300, marginBottom: 30, lineHeight: 1.2 }}>
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


        // LIST OF YOUR WIZARDS
        if (!wizard) {
            return this.renderChoises(boxW, isMobile)
        }

        //console.log(equipment);

        const showMenuRings = equipment.length > 0 && !equipment[0].equipped
        const ringsToShow = itemsToShow.length > 0 ? itemsToShow : equipment

        //WIZARD SELECTED
        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'auto' }}>

                <p style={{ color: '#8d8d8d', fontSize: 30, marginBottom: 20 }}>
                    Magic Shop
                </p>

                <div style={{ flexDirection: 'column', marginBottom: 30 }}>

                    <div style={{ height: 'fit-content', justifyContent: 'center' }} className={wizard ? "selectedShow" : "selectedHide"}>
                        {this.renderRowSelected(wizard, 0, boxW)}
                    </div>


                    <div style={{ flexDirection: 'column' }}>

                        <p style={{ fontSize: 22, color: "white", marginBottom: 15 }}>
                            $WIZA balance: {wizaBalance || 0.0}
                        </p>

                        <button
							className="btnH"
							style={styles.btnBuyWiza}
							onClick={() => this.setState({ showModalBuy: true })}
						>
							<p style={{ fontSize: 16, color: 'white' }}>
								BUY WIZA
							</p>
						</button>

                        <div style={{ alignItems: 'center', marginBottom: 20 }}>
                            <p style={{ fontSize: 22, color: "white", marginRight: 10 }}>
                                LEVEL CAP:
                            </p>
                            <p style={{ fontSize: 22, color: getColorTextBasedOnLevel(MAX_LEVEL) }}>
                                {MAX_LEVEL}
                            </p>
                        </div>

                        <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                            {this.renderBoxMenu("RINGS")}
                            {this.renderBoxMenu("UPGRADES")}
                            {this.renderBoxMenu("AP")}
                            {this.renderBoxMenu("RETRAIN")}
                            {this.renderBoxMenu("VIALS")}
                            {this.renderBoxMenu("SPELLBOOK")}
                            {this.renderBoxMenu("NICKNAME")}
                        </div>

                        <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 10, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                            <p style={{ fontSize: 26, color: 'white' }} id="shop-rings">
                                RINGS
                            </p>
                        </div>

                        {
                            this.state.loadingEquip &&
                            <div style={{ alignItems: 'flex-start', flexDirection: 'column', marginBottom: 30 }}>
                                <p style={{ fontSize: 21, color: 'white' }}>
                                    Loading equipment...
                                </p>
                            </div>
                        }

                        {
                            !this.state.loadingEquip && showMenuRings &&
                            <div style={{ flexWrap: 'wrap', marginBottom: 10 }}>
            					{this.renderBoxSearchStat("HP", ["Ring of HP +4", "Ring of HP +8", "Ring of HP +12", "Ring of HP +16", "Ring of HP +20", "Ring of Life", "Ring of Last Defense", "Ring of Power"].reverse())}
                                {this.renderBoxSearchStat("DEFENSE", ["Ring of Defense +1", "Ring of Defense +2", "Ring of Defense +3", "Ring of Defense +4", "Ring of Defense +5", "Ring of Magic Shield", "Ring of Last Defense", "Ring of Power"].reverse())}
                                {this.renderBoxSearchStat("ATTACK", ["Ring of Attack +1", "Ring of Attack +2", "Ring of Attack +3", "Ring of Attack +4", "Ring of Attack +5", "Ring of Accuracy", "Ring of Destruction", "Ring of Swift Death", "Ring of Power"].reverse())}
                                {this.renderBoxSearchStat("DAMAGE", ["Ring of Damage +2", "Ring of Damage +4", "Ring of Damage +6", "Ring of Damage +8", "Ring of Damage +10", "Ring of Force", "Ring of Destruction", "Ring of Power"].reverse())}
                                {this.renderBoxSearchStat("SPEED", ["Ring of Speed +2", "Ring of Speed +4", "Ring of Speed +6", "Ring of Speed +8", "Ring of Speed +10", "Ring of Lightning", "Ring of Swift Death", "Ring of Power"].reverse())}
            				</div>
                        }

                        {
                            !this.state.loadingEquip && showMenuRings &&
                            this.renderSearched()
                        }

                        {
                            ringsToShow.length > 0 ?
                            <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                                {ringsToShow.map((item, index) => {
                                    return this.renderRingsCard(item, index, isMobile)
                                })}
                            </div>
                            :
                            <div style={{ alignItems: 'flex-start', flexDirection: 'column', marginBottom: 30 }}>
                                <p style={{ fontSize: 21, color: 'white' }}>
                                    No ring available
                                </p>
                            </div>
                        }

                        <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 10, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                            <p style={{ fontSize: 26, color: 'white' }} id="shop-upgrades">
                                UPGRADES
                            </p>
                        </div>

                        <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                            {this.renderShopCard("hp", isMobile)}

                            {this.renderShopCard("defense", isMobile)}

                            {this.renderShopCard("attack", isMobile)}

                            {this.renderShopCard("damage", isMobile)}

                            {this.renderShopCard("speed", isMobile)}

                        </div>

                        <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 10, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                            <p style={{ fontSize: 26, color: 'white' }} id="shop-ap">
                                ATTRIBUTE POINTS
                            </p>
                        </div>

                        <p style={{ fontSize: 20, color: "white", marginBottom: 15 }}>
                            AP available: {wizard.ap ? wizard.ap.int : 0}
                        </p>

                        <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                            {this.renderAPShopCard("hp", isMobile)}

                            {this.renderAPShopCard("defense", isMobile)}

                            {this.renderAPShopCard("attack", isMobile)}

                            {this.renderAPShopCard("damage", isMobile)}

                            {this.renderAPShopCard("speed", isMobile)}

                            {this.renderAPBurnCard(isMobile)}

                        </div>

                        <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 10, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                            <p style={{ fontSize: 26, color: 'white' }} id="shop-retrain">
                                RETRAIN
                            </p>
                        </div>

                        <p style={{ fontSize: 20, color: "white", marginBottom: 10 }}>
                            Rebuild your wizard, you can't go under the initial stat
                        </p>

                        <p style={{ fontSize: 20, color: "white", marginBottom: 15 }}>
                            Downgrade points: {wizard.downgrades ? wizard.downgrades.int : 0}
                        </p>

                        <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                            {this.renderRetrainShopCard("hp", isMobile)}

                            {this.renderRetrainShopCard("defense", isMobile)}

                            {this.renderRetrainShopCard("attack", isMobile)}

                            {this.renderRetrainShopCard("damage", isMobile)}

                            {this.renderRetrainShopCard("speed", isMobile)}

                        </div>

                        {
                            !potionEquipped ?
                            <div style={{ flexDirection: 'column' }} id="shop-vials">

                                <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 5, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                                    <p style={{ fontSize: 26, color: 'white' }}>
                                        VIALS
                                    </p>
                                </div>

                                <p style={{ fontSize: 18, color: 'white', marginBottom: 10 }}>
                                    In each tournament you will be able to buy one vial to temporarily upgrade your wizard. The bonus will last the whole tournament.
                                </p>

                                <p style={{ fontSize: 18, color: 'white', marginBottom: 10 }}>
                                    Each wizard can have a maximum of one vial
                                </p>

                                <p style={{ fontSize: 18, color: 'gold', marginBottom: 10 }}>
                                    ATTENTION! Vials will not work in the apprentice tournament
                                </p>

                                <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                    {this.renderVialCard("hp", true, isMobile)}

                                    {this.renderVialCard("defense", true, isMobile)}

                                    {this.renderVialCard("attack", true, isMobile)}

                                    {this.renderVialCard("damage", true, isMobile)}

                                    {this.renderVialCard("speed", true, isMobile)}

                                </div>
                            </div>
                            :
                            <div style={{ flexDirection: 'column' }} id="shop-vials">

                                <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 5, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                                    <p style={{ fontSize: 26, color: 'white' }}>
                                        VIALS
                                    </p>
                                </div>

                                <p style={{ fontSize: 17, color: 'white', marginBottom: 10 }}>
                                    Vial Equipped
                                </p>
                                {this.renderVialCard(potionEquipped, false, isMobile)}
                            </div>
                        }

                        <div style={{ flexDirection: 'column' }} id="shop-spellbook">

                            <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 5, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                                <p style={{ fontSize: 26, color: 'white' }}>
                                    SPELLBOOK
                                </p>
                            </div>

                            <p style={{ fontSize: 18, color: 'white', marginBottom: 10 }}>
                                Swap a spell you know for a new one
                            </p>

                            {this.renderSpellUnkown(isMobile)}
                        </div>

                        <div style={{ flexDirection: 'column' }} id="shop-nickname">

                            <div style={{ width: '100%', alignItems: 'center', padding: 5, marginBottom: 5, backgroundColor: "#2d2a42", borderRadius: 2 }}>
                                <p style={{ fontSize: 26, color: 'white' }}>
                                    NICKNAME
                                </p>
                            </div>

                            <p style={{ fontSize: 18, color: 'white', marginBottom: 10 }}>
                                Want to give your wizard an epic nickname? Now you can!
                            </p>

                            <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                {this.renderCardNickname(isMobile)}

                            </div>
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

                <ModalSetName
                    showModal={this.state.showModalSetName}
                    onCloseModal={() => this.setState({ showModalSetName: false })}
                    width={modalW}
                    wizaBalance={this.props.wizaBalance}
                    callback={(nickname) => {
                        this.buyNickname(nickname)
                        this.setState({ showModalSetName: false })
                    }}
                />

                {
                    this.state.showModalSwapSpell &&
                    <ModalSwapSpell
                        showModal={this.state.showModalSwapSpell}
                        onCloseModal={() => this.setState({ showModalSwapSpell: false })}
                        width={modalW}
                        stats={wizard}
                        onSwap={(spellSelected) => {
                            this.swapSpell(spellSelected)
                            this.setState({ showModalSwapSpell: false })
                        }}
                    />
                }

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props
        const { showModalBuy } = this.state

		return (
			<div>
				<Header
					page='home'
					section={5}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
                    showModalBuyFromShop={showModalBuy}
                    closeModalBuyOnShop={() => this.setState({ showModalBuy: false })}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={styles.container}>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />

				<Media
					query="(max-width: 1199px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1200px)"
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
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
    btnConnect: {
		width: 300,
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
    },
    boxMenu: {
        width: 90,
        height: 90,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        display: 'flex',
        marginRight: 15,
        marginBottom: 15
    },
    btnStat: {
		padding: 10,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
		marginBottom: 10,
		borderRadius: 2,
		minWidth: 60,
		display: 'flex',
		flexDirection: 'row'
	},
    btnBuyWiza: {
        height: 40,
        width: 180,
        borderRadius: 2,
        borderColor: TEXT_SECONDARY_COLOR,
        borderWidth: 2,
        borderStyle: 'solid',
		marginBottom: 15,
    },
    btnSwap: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        borderRadius: 2,
        marginRight: 20,
        marginBottom: 5,
        marginTop: 5
    }
}

const mapStateToProps = (state) => {
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, allNfts, wizaBalance, wizardSelectedIdShop } = state.mainReducer;
    const { txListen } = state.modalTransactionReducer

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, allNfts, wizaBalance, wizardSelectedIdShop, txListen };
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
    buyVial,
    buyNickname,
    buyUpgradeWithAp,
    burnAP,
    loadEquipMinted,
    equipItem,
    unequipItem,
    buyDowngrade,
    getWizaValue,
    updateInfoTransactionModal,
    swapSpell
})(Shop)
