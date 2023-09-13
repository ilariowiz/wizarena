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
    swapSpell,
    getSpellUpgradeCost,
    improveSpell
} from '../actions'
import { MAIN_NET_ID, CTA_COLOR, MAX_LEVEL } from '../actions/types'
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
const pendant_menu = require('../assets/pendant_undead_h.png')

const retrain_def = require('../assets/retrain_def.png')
const retrain_atk = require('../assets/retrain_atk.png')
const retrain_dmg = require('../assets/retrain_dmg.png')
const retrain_speed = require('../assets/retrain_speed.png')
const retrain_hp = require('../assets/retrain_hp.png')

const book_shop = require('../assets/book_shop.png')
const book_spell = require('../assets/book.png')


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
            rings: [],
            pendants: [],
            decrease: { hp: 1, defense: 1, attack: 1, damage: 1, speed: 1},
            baseStats: undefined,
            wizaValue: 0,
            loadingEquip: true,
            ringsToShow: [],
            pendantsToShow: [],
            searchText: "",
            showModalBuy: false,
            showModalSwapSpell: false,
            newSpellToLearn: {},
            spellUpgradeWizaCost: undefined
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
                this.getSpellUpgradeCost()
			})
		}
	}

    loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                //rimuoviamo i listed
                let equipment = response.filter(i => !i.listed && i.bonus)

                let rings = equipment.filter(i => i.type === "ring")
                let pendants = equipment.filter(i => i.type === "pendant")

                setTimeout(() => {
                    const wizard = this.getWizardSelected()
                    //console.log(wizard);
                    if (wizard) {
                        const equippedRing = rings.find(i => i.equippedToId === wizard.id && i.type === "ring")
                        if (equippedRing) {
                            //mostriamo solo quello equippato
                            rings = [equippedRing]
                        }
                        else {
                            rings = rings.filter(i => !i.equipped)
                        }

                        const equippedPendant = rings.find(i => i.equippedToId === wizard.id && i.type === "pendant")
                        if (equippedPendant) {
                            //mostriamo solo quello equippato
                            pendants = [equippedPendant]
                        }
                        else {
                            pendants = pendants.filter(i => !i.equipped)
                        }
                    }

                    this.setState({ rings, pendants, loadingEquip: false })
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

        let url = `https://estats.chainweb.com/txs/events?search=wiz-arena.BUY_UPGRADE&param=${account.account}&limit=30`

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

    getSpellUpgradeCost() {
        const { chainId, gasPrice, gasLimit, networkUrl, wizardSelectedIdShop } = this.props

        const wizard = this.getWizardSelected()
        //console.log(wizard);

        if (wizard) {
            const spellName = wizard.spellSelected.name

            this.props.getSpellUpgradeCost(chainId, gasPrice, gasLimit, networkUrl, wizardSelectedIdShop, spellName, (response) => {
                //console.log(response);
                this.setState({ spellUpgradeWizaCost: response })
            })
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

    searchByName(type) {
		const { searchText, rings, pendants } = this.state

        if (!searchText) {
            return
        }

        let temp = type === 'ring' ? rings : pendants

		let result = temp.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()))

        if (result.length === 0) {
            result = temp.filter(i => i.id === searchText)
        }

        if (type === 'ring') {
            this.setState({ ringsToShow: result })
        }
		else {
            this.setState({ pendantsToShow: result })
        }
	}

    cancelSearch() {
		this.setState({ searchText: '', ringsToShow: [], pendantsToShow: [] })
	}

    buyStat(stat, costo) {
        const { account, chainId, gasPrice, netId } = this.props
        const { increase } = this.state

        const wizard = this.getWizardSelected()

        let nameNftToUpgrade = wizard.name
        if (wizard.nickname) {
            nameNftToUpgrade = `${wizard.name} ${wizard.nickname}`
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will improve the ${stat} of ${nameNftToUpgrade} using WIZA`,
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
        const { account, chainId, gasPrice, netId } = this.props
        const { increase } = this.state

        const wizard = this.getWizardSelected()

        let nameNftToUpgrade = wizard.name
        if (wizard.nickname) {
            nameNftToUpgrade = `${wizard.name} ${wizard.nickname}`
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will improve the ${stat} of ${nameNftToUpgrade} using AP`,
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
        const { account, chainId, gasPrice, netId } = this.props
        const { apToBurn } = this.state

        const wizard = this.getWizardSelected()

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will burn ${apToBurn} AP for ${apToBurn*15} $WIZA`,
			typeModal: 'burnap',
			transactionOkText: 'AP burned successfully',
		})

        this.props.burnAP(chainId, gasPrice, netId, account, wizard.id, apToBurn)
    }

    downgrade(stat, costo) {
        const { account, chainId, gasPrice, netId } = this.props
        const { decrease } = this.state

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
        const { account, chainId, gasPrice, netId } = this.props
        const { tournamentName } = this.state

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
        const { account, chainId, gasPrice, netId } = this.props

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
        const { account, chainId, gasPrice, netId } = this.props

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
        const { account, chainId, gasPrice, netId } = this.props

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

    upgradeSpell(wizard, stat) {
        const { account, chainId, gasPrice, netId } = this.props

        const wizardName = wizard.nickname ? `${wizard.id} ${wizard.nickname}` : wizard.id

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will improve the ${stat} of the spell ${wizard.spellSelected.name}`,
			typeModal: 'improvespell',
			transactionOkText: `Spell successfully improved!`,
            idNft: wizard.id,
            nameNft: `${wizardName} has improved the ${stat} of the spell ${wizard.spellSelected.name}`
		})

        this.props.improveSpell(chainId, gasPrice, netId, account, wizard.id, stat)
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
                        this.getSpellUpgradeCost()
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
                    this.setState({ searchText: "", ringsToShow: [], pendantsToShow: [], rings: [], pendants: [], loadingEquip: true })
                    this.props.setWizardSelectedShop(undefined)
                }}
			/>
		)
	}

    renderEquipCard(item, index, isMobile, type) {
        const { mainTextColor, isDarkmode } = this.props

        const bonusValues = item.bonus.split(",")

        let bonuses = []
        bonusValues.map(i => {
            const b = i.split("_")
            let btext;
            if (type === 'ring') {
                btext = `+${b[0]} ${b[1]}`
            }
            else {
                if (b[1] === 'res') {
                    btext = `75-90% resistant to ${b[0]}`
                }
                else {
                    btext = `Fixed resistance of ${b[0]} against ${b[1]}`
                }
            }

            bonuses.push(btext)
        })

        const wizard = this.getWizardSelected()

        const isEquipped = item.equippedToId === wizard.id

        return (
            <div
                key={index}
                style={Object.assign({}, styles.cardShopStyle, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                <img
                    src={item.url}
                    style={{ width: 80, marginBottom: 10 }}
                    alt={type}
                />

                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10, textAlign: 'center', minHeight: 38, marginRight: 9, marginLeft: 9 }}>
                    #{item.id} {item.name}
                </p>

                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10, textAlign: 'center', marginLeft: 5, marginRight: 5 }}>
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
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Unequip <br /><span style={{ fontSize: 12 }}>({Math.floor(wizard.level / 5)} $WIZA)</span>
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
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Equip
                        </p>
                    </button>
                }
            </div>
        )
    }

    renderShopCard(key, isMobile) {
        const { increase, wizaValue } = this.state
        const { mainTextColor, isDarkmode } = this.props

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

        let colorTextLevel = getColorTextBasedOnLevel(newLevel, isDarkmode)
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
                style={Object.assign({}, styles.cardShopStyle, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <img
                            src={img}
                            style={{ width: 80, height: 80 }}
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
                                color={mainTextColor}
                                size={20}
                            />
                        </button>


                        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ fontSize: 16, color: mainTextColor }}>
                                +{increase[key]}
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor }} className="text-medium">
                                {key}
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
								color={mainTextColor}
								size={20}
							/>
						</button>
                    </div>

                    <p style={{ fontSize: 14, color: mainTextColor }}>
                        $WIZA
                    </p>
                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-bold">
                        {costo.toFixed(2)}
                    </p>

                    <p style={{ fontSize: 14, color: mainTextColor }}>
                        New Level
                    </p>
                    <p style={{ fontSize: 16, color: colorTextLevel, marginBottom: 10 }} className="text-bold">
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
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Upgrade
                    </p>
                </button>

            </div>
        )
    }

    renderAPShopCard(key, isMobile) {
        const { increase, wizaValue } = this.state
        const { mainTextColor, isDarkmode } = this.props

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
        let costoWiza = 0
        let newLevel;

        if (wizard && wizard.id) {
            statToUpgrade = wizard[key].int
            let arrayLevelsTo = []

            for (let i = 0; i < increaseTo; i++) {
                arrayLevelsTo.push(statToUpgrade + i)
            }

            //console.log(arrayLevelsTo);
            arrayLevelsTo.map(s => {
                costoWiza += calcUpgradeCost(s, key, wizaValue)
            })

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

        costoWiza = round((costoWiza * 9 / 100), 2)
        //console.log(costoWiza);

        let colorTextLevel = getColorTextBasedOnLevel(newLevel, isDarkmode)
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
                style={Object.assign({}, styles.cardShopStyle, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <img
                            src={img}
                            style={{ width: 80, height: 80 }}
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
                                color={mainTextColor}
                                size={20}
                            />
                        </button>


                        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ fontSize: 16, color: mainTextColor }}>
                                +{increase[key]}
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor }} className="text-medium">
                                {key}
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
								color={mainTextColor}
								size={20}
							/>
						</button>
                    </div>

                    <div style={{ alignItems: 'center', justifyContent: 'space-around', width: '100%',  marginBottom: 15 }}>
                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                AP
                            </p>
                            <p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
                                {costo}
                            </p>
                        </div>

                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                $WIZA
                            </p>
                            <p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
                                {costoWiza}
                            </p>
                        </div>

                    </div>

                    <p style={{ fontSize: 14, color: mainTextColor }}>
                        New Level
                    </p>
                    <p style={{ fontSize: 16, color: colorTextLevel, marginBottom: 10 }} className="text-bold">
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
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Upgrade
                    </p>
                </button>

            </div>
        )
    }

    renderAPBurnCard(isMobile) {
        const { apToBurn } = this.state
        const { mainTextColor, isDarkmode } = this.props

        const wizard = this.getWizardSelected()

        return (
            <div
                style={Object.assign({}, styles.cardShopStyle, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <img
                            src={potion_ap_burn}
                            style={{ width: 80, height: 80 }}
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
                                color={mainTextColor}
                                size={20}
                            />
                        </button>


                        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
                                {apToBurn}
                            </p>

                            <p style={{ fontSize: 14, color: mainTextColor }}>
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
								color={mainTextColor}
								size={20}
							/>
						</button>
                    </div>

                    <p style={{ fontSize: 14, color: mainTextColor }}>
                        $WIZA gained
                    </p>
                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-bold">
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
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Burn
                    </p>
                </button>

            </div>
        )
    }

    renderRetrainShopCard(key, isMobile) {
        const { decrease, baseStats } = this.state
        const { mainTextColor, isDarkmode } = this.props

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

        let colorTextLevel = getColorTextBasedOnLevel(newLevel, isDarkmode)
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
                style={Object.assign({}, styles.cardShopStyle, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <img
                            src={img}
                            style={{ width: 80, height: 80 }}
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
                                color={canDecrease ? mainTextColor : "#707070"}
                                size={20}
                            />
                        </button>


                        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <p style={{ fontSize: 16, color: mainTextColor }}>
                                -{decrease[key]}
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor }} className="text-medium">
                                {key}
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
								color={canDecrease ? mainTextColor : "#707070"}
								size={20}
							/>
						</button>
                    </div>

                    <p style={{ fontSize: 14, color: mainTextColor }}>
                        Starting Stat
                    </p>
                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-medium">
                        {baseStat}
                    </p>

                    <div style={{ alignItems: 'center', justifyContent: 'center' }}>

                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>
                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5 }}>
                                Cost
                            </p>
                            <p style={{ fontSize: 16, color: mainTextColor }}>
                                $WIZA
                            </p>
                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-bold">
                                {decreaseTo * 15}
                            </p>
                        </div>

                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: 20 }}>
                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5 }}>
                                Gain
                            </p>
                            <p style={{ fontSize: 16, color: mainTextColor }}>
                                AP
                            </p>
                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-bold">
                                {gain}
                            </p>
                        </div>


                    </div>

                    <p style={{ fontSize: 14, color: mainTextColor }}>
                        {canDecrease ? "New Level" : "Level"}
                    </p>
                    <p style={{ fontSize: 16, color: colorTextLevel, marginBottom: 10 }} className="text-bold">
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
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Downgrade
                    </p>
                </button>

            </div>
        )
    }

    renderVialCard(key, canBuy, isMobile) {
        const { loadingPotionEquipped, wizaValue } = this.state
        const { mainTextColor, isDarkmode } = this.props

        const wizard = this.getWizardSelected()

        if (!wizard) {
            return <div />
        }

        let bonus;
        let costo = round(wizaValue * 2.4, 2);

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
                style={Object.assign({}, styles.cardVialStyle, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

                    <div style={{ width: 50, height: 50, marginBottom: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={img}
                            style={{ height: 50 }}
                            alt="logo"
                        />
                    </div>


                    <p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
                        +{bonus}
                    </p>

                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 10 }}>
                        {key}
                    </p>

                    {
                        canBuy ?
                        <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                $WIZA
                            </p>
                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-bold">
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
                            Loading
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
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Buy Vial
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
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Equipped
                        </p>
                    </div>
                    : null
                }

            </div>
        )
    }

    renderCardNickname(isMobile) {
        const { wizaValue } = this.state
        const { mainTextColor, isDarkmode } = this.props

        return (
            <div
                style={Object.assign({}, styles.cardVialStyle, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", marginBottom: 30 })}
            >
                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15, marginTop: 15 }}>
                    Epic Name
                </p>

                <p style={{ fontSize: 14, color: mainTextColor }}>
                    $WIZA
                </p>
                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 20 }} className="text-bold">
                    {round(wizaValue * 0.6, 2)}
                </p>

                <button
                    className='btnH'
                    style={styles.btnChoose}
                    onClick={() => {
                        this.setState({ showModalSetName: true })
                    }}
                >
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Set Name
                    </p>
                </button>

            </div>
        )
    }

    renderHistory(item, index) {
        //console.log(item);
        const { mainTextColor } = this.props

        return (
            <div key={index} style={styles.rowHistory}>
                <p style={{ color: mainTextColor, fontSize: 16, marginRight: 10 }}>
                    -
                </p>
                <p style={{ color: mainTextColor, fontSize: 16, marginRight: 20 }}>
                    {item.idnft}
                </p>

                <p style={{ color: mainTextColor, fontSize: 16, marginRight: 25 }}>
                    +{item.increment} {item.stat}
                </p>

                {
                    item.cost.int ?
                    <p style={{ color: mainTextColor, fontSize: 16 }}>
                        AP {item.cost.int}
                    </p>
                    :
                    <p style={{ color: mainTextColor, fontSize: 16 }}>
                        $WIZA {item.cost}
                    </p>

                }
            </div>
        )
    }

    renderChoises(width, isMobile, padding) {
        const { userMintedNfts, mainTextColor } = this.props

        const sorted = this.sortById()

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', width, paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 15 }}>
                    Select the Wizard you want to upgrade
                </p>

                <p style={{ fontSize: 14, color: mainTextColor, marginBottom: 35 }}>
                    <span className="text-bold">Attack</span> and <span className="text-bold">Damage</span> you'll see in each wizard is their base <span className="text-bold">Attack</span> and <span className="text-bold">Damage</span>, it doesn't take into account the selected spell.
                </p>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
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
        const { mainTextColor } = this.props

        const wizard = this.getWizardSelected()

        if (!wizard || !wizard.id) {
            return <div />
        }

        //console.log(wizard);

        if (wizard.spellbook.length < 4) {
            return (
                <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <p style={{ fontSize: 16, color: mainTextColor }}>
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
        const { mainTextColor } = this.props

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
                    <p style={{ fontSize: 13, color: 'white', marginBottom: 3 }} className="text-bold">
                        {round((wizaValue * 14), 2)} $WIZA
                    </p>
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Swap
                    </p>
                </button>

				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
					Name
				</p>
				<p style={{ color: mainTextColor, fontSize: 17, marginRight }} className="text-medium">
					{spell.name}
				</p>
				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
					Perk
				</p>

				{
					spell.condition && spell.condition.name ?
					<Popup
						trigger={open => (
							<button style={{ color: mainTextColor, fontSize: 17, marginRight }} className="text-medium">
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
					<p style={{ color: mainTextColor, fontSize: 17, marginRight }}>
						-
					</p>
				}

				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
					Base Atk
				</p>
				<p style={{ color: mainTextColor, fontSize: 17, marginRight }} className="text-medium">
					{spell.atkBase}
				</p>

				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
					Base Dmg
				</p>
				<p style={{ color: mainTextColor, fontSize: 17 }} className="text-medium">
					{spell.dmgBase}
				</p>

			</div>
		)
	}

    renderSpellToUpgrade(wizard) {
        const { wizaValue } = this.state
        const { mainTextColor } = this.props

        const spell = allSpells.find(i => i.name === wizard.spellSelected.name)

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
			<div style={{ alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20, flexDirection: 'column' }}>

                <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>

    				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
    					Name
    				</p>
    				<p style={{ color: mainTextColor, fontSize: 17, marginRight }} className="text-medium">
    					{spell.name}
    				</p>
    				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
    					Perk
    				</p>

    				{
    					spell.condition && spell.condition.name ?
    					<Popup
    						trigger={open => (
    							<button style={{ color: mainTextColor, fontSize: 17, marginRight }} className="text-medium">
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
    					<p style={{ color: mainTextColor, fontSize: 17, marginRight }}>
    						-
    					</p>
    				}

    				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
    					Base Atk
    				</p>
    				<p style={{ color: mainTextColor, fontSize: 17, marginRight }} className="text-medium">
    					{spell.atkBase + wizard['upgrades-spell'].attack.int}
    				</p>

    				<p style={{ color: mainTextColor, fontSize: 14, marginRight: 5 }}>
    					Base Dmg
    				</p>
    				<p style={{ color: mainTextColor, fontSize: 17 }} className="text-medium">
    					{spell.dmgBase + wizard['upgrades-spell'].damage.int}
    				</p>
                </div>

                <div style={{ alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ color: mainTextColor, fontSize: 14 }}>
                        Current upgrades: Attack +{wizard['upgrades-spell'].attack.int} | Damage +{wizard['upgrades-spell'].damage.int}
                    </p>
                </div>

                <div style={{ alignItems: 'center' }}>

                    <button
                        className="btnH"
                        style={styles.btnSwap}
                        onClick={() => this.upgradeSpell(wizard, "attack")}
                    >
                        <p style={{ fontSize: 14, color: 'white', marginBottom: 3 }} className="text-bold">
                            {round(this.state.spellUpgradeWizaCost, 2)} $WIZA
                        </p>
                        <p style={{ fontSize: 14, color: 'white', marginBottom: 8 }} className="text-bold">
                            10 AP
                        </p>
                        <p style={{ fontSize: 15, color: 'white', marginBottom: 8 }} className="text-bold">
                            +1 Attack
                        </p>

                        <p style={{ fontSize: 16, color: 'white' }} className="text-medium">
                            Upgrade
                        </p>
                    </button>

                    <button
                        className="btnH"
                        style={styles.btnSwap}
                        onClick={() => this.upgradeSpell(wizard, "damage")}
                    >
                        <p style={{ fontSize: 14, color: 'white', marginBottom: 3 }} className="text-bold">
                            {round(this.state.spellUpgradeWizaCost, 2)} $WIZA
                        </p>
                        <p style={{ fontSize: 14, color: 'white', marginBottom: 8 }} className="text-bold">
                            10 AP
                        </p>
                        <p style={{ fontSize: 15, color: 'white', marginBottom: 8 }} className="text-bold">
                            +1 Damage
                        </p>

                        <p style={{ fontSize: 16, color: 'white' }} className="text-medium">
                            Upgrade
                        </p>
                    </button>

                </div>

			</div>
		)
	}

    renderBoxMenu(key) {

        let img;
        let imgStyle;
        if (key === "Upgrades") {
            img = potion_hp
            imgStyle = { height: 56 }
        }
        else if (key === "AP") {
            img = potion_dmg
            imgStyle = { height: 56 }
        }
        else if (key === "Retrain") {
            img = retrain_def
            imgStyle = { height: 56 }
        }
        else if (key === "Vials") {
            img = vial_atk
            imgStyle = { height: 36 }
        }
        else if (key === "Nickname") {
            img = banner_nickname
            imgStyle = { height: 46 }
        }
        else if (key === "Rings") {
            img = ring_dmg
            imgStyle = { height: 44 }
        }
        else if (key === "Pendants") {
            img = pendant_menu
            imgStyle = { height: 58 }
        }
        else if (key === "Spellbook") {
            img = book_shop
            imgStyle = { height: 34 }
        }
        else if (key === "Spell") {
            img = book_spell
            imgStyle = { height: 34 }
        }

        let divId = `shop-${key.toLowerCase()}`

        return (
            <button
                className="btnH"
                style={styles.boxMenu}
                onClick={() => {
                    document.getElementById(divId).scrollIntoView({ behavior: 'smooth' })
                }}
            >
                <div style={{ width: 56, height: 56, marginBottom: 3, justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src={img}
                        style={imgStyle}
                        alt="Menu"
                    />
                </div>

                <p style={{ fontSize: 14, color: this.props.mainTextColor }} className="text-medium">
                    {key}
                </p>

            </button>
        )
    }

    renderListStat(item, index, type) {
		return (
			<button
				key={index}
				style={{ marginBottom: 15, marginLeft: 10 }}
				onClick={() => {
					this.listPopup.close()
                    this.setState({ searchText: item }, () => {
                        this.searchByName(type)
                    })
				}}
			>
				<p style={{ fontSize: 16 }}>
					{item}
				</p>
			</button>
		)
	}

    renderBoxSearchStat(type, statDisplay, list) {
        const { searchText } = this.state

		let text = statDisplay
        if (searchText && list.includes(searchText)) {
			text = `${text} = ${searchText}`
		}

		return (
			<Popup
				ref={ref => this.listPopup = ref}
				trigger={
					<button style={styles.btnStat}>
						<p style={{ fontSize: 15, color: this.props.mainTextColor }} className="text-medium">{text}</p>
                        {
							searchText && list.includes(searchText) &&
							<IoClose
								color={this.props.mainTextColor}
								size={22}
								style={{ marginLeft: 5 }}
								onClick={(e) => {
									e.stopPropagation()
									this.cancelSearch()
								}}
							/>
						}
					</button>
				}
				position="right center"
				on="click"
				closeOnDocumentClick
				arrow={true}
			>
				<div style={{ flexDirection: 'column', paddingTop: 10 }}>
					{list.map((item, index) => {
						return this.renderListStat(item, index, type)
					})}
				</div>
			</Popup>
		)
	}

    renderBody(isMobile) {
        const { isConnected, showModalConnection, historyUpgrades, potionEquipped, rings, pendants, ringsToShow, pendantsToShow } = this.state
        const { account, wizaBalance, mainTextColor } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        const wizard = this.getWizardSelected()

        // ACCOUNT NOT CONNECTED
        if (!account || !account.account || !isConnected) {

			return (
				<div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 250, height: 250, borderRadius: 4, marginBottom: 15 }}
						alt='Placeholder'
					/>

					<button
						className='btnH'
						style={styles.btnConnect}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={{ fontSize: 15, color: mainTextColor }}>
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
            return this.renderChoises(boxW, isMobile, padding)
        }


        const ringsFinal = ringsToShow.length > 0 ? ringsToShow : rings
        const pendantsFinal = pendantsToShow.length > 0 ? pendantsToShow : pendants

        const widthSide = 180
		const widthNfts = isMobile ? boxW : boxW - widthSide

        //WIZARD SELECTED
        return (
            <div style={{ flexDirection: 'column', width: boxW, paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

                <div style={{ flexDirection: 'column', marginBottom: 30 }}>

                    <div style={{ height: 'fit-content', justifyContent: 'center' }} className={wizard ? "selectedShow" : "selectedHide"}>
                        {this.renderRowSelected(wizard, 0, boxW)}
                    </div>


                    <div style={{ flexDirection: 'column' }}>

                        <div style={{ flexDirection: 'column', alignItems: 'center' }}>

                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                $WIZA balance:
                            </p>
                            <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 15 }} className="text-medium">
                                {wizaBalance || 0.0}
                            </p>

                            <button
    							className="btnH"
    							style={styles.btnBuyWiza}
    							onClick={() => this.setState({ showModalBuy: true })}
    						>
    							<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
    								Buy $WIZA
    							</p>
    						</button>

                            <div style={{ alignItems: 'center', marginBottom: 20 }}>
                                <p style={{ fontSize: 17, color: mainTextColor, marginRight: 10 }}>
                                    Level Cap:
                                </p>
                                <p style={{ fontSize: 17, color: mainTextColor }} className="text-bold">
                                    {MAX_LEVEL}
                                </p>
                            </div>

                            <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
                                {this.renderBoxMenu("Rings")}
                                {this.renderBoxMenu("Pendants")}
                                {this.renderBoxMenu("Upgrades")}
                                {this.renderBoxMenu("AP")}
                                {this.renderBoxMenu("Retrain")}
                                {this.renderBoxMenu("Vials")}
                                {this.renderBoxMenu("Spellbook")}
                                {this.renderBoxMenu("Spell")}
                                {this.renderBoxMenu("Nickname")}
                            </div>
                        </div>

                        <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 15 }} id="shop-rings" className="text-bold">
                            Rings
                        </p>

                        {
                            this.state.loadingEquip &&
                            <div style={{ alignItems: 'flex-start', flexDirection: 'column', marginBottom: 30 }}>
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    Loading rings...
                                </p>
                            </div>
                        }

                        <div style={{ width: boxW, marginBottom: 30 }}>

                            {
                                !this.state.loadingEquip && !isMobile &&
                                <div style={{ width: widthSide, flexDirection: 'column' }}>
                					{this.renderBoxSearchStat("ring", "HP", ["Ring of HP +4", "Ring of HP +8", "Ring of HP +12", "Ring of HP +16", "Ring of HP +20", "Ring of Life", "Ring of Last Defense", "Ring of Power"].reverse())}
                                    {this.renderBoxSearchStat("ring", "Defense", ["Ring of Defense +1", "Ring of Defense +2", "Ring of Defense +3", "Ring of Defense +4", "Ring of Defense +5", "Ring of Magic Shield", "Ring of Last Defense", "Ring of Power"].reverse())}
                                    {this.renderBoxSearchStat("ring", "Attack", ["Ring of Attack +1", "Ring of Attack +2", "Ring of Attack +3", "Ring of Attack +4", "Ring of Attack +5", "Ring of Accuracy", "Ring of Destruction", "Ring of Swift Death", "Ring of Power"].reverse())}
                                    {this.renderBoxSearchStat("ring", "Damage", ["Ring of Damage +2", "Ring of Damage +4", "Ring of Damage +6", "Ring of Damage +8", "Ring of Damage +10", "Ring of Force", "Ring of Destruction", "Ring of Power"].reverse())}
                                    {this.renderBoxSearchStat("ring", "Speed", ["Ring of Speed +2", "Ring of Speed +4", "Ring of Speed +6", "Ring of Speed +8", "Ring of Speed +10", "Ring of Lightning", "Ring of Swift Death", "Ring of Power"].reverse())}
                				</div>
                            }

                            {
                                ringsFinal.length > 0 ?
                                <div style={{ flexWrap: 'wrap', width: widthNfts }}>
                                    {ringsFinal.map((item, index) => {
                                        return this.renderEquipCard(item, index, isMobile, 'ring')
                                    })}
                                </div>
                                :
                                <div style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
                                    <p style={{ fontSize: 16, color: mainTextColor }}>
                                        No ring available
                                    </p>
                                </div>
                            }
                        </div>

                        <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 15 }} id="shop-pendants" className="text-bold">
                            Pendants
                        </p>

                        {
                            this.state.loadingEquip &&
                            <div style={{ alignItems: 'flex-start', flexDirection: 'column', marginBottom: 30 }}>
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    Loading pendants...
                                </p>
                            </div>
                        }

                        <div style={{ width: boxW, marginBottom: 30 }}>

                            {
                                !this.state.loadingEquip && !isMobile &&
                                <div style={{ width: widthSide, flexDirection: 'column' }}>
                					{this.renderBoxSearchStat("pendant", "Elements", ["Acid Resistance", "Dark Resistance", "Earth Resistance","Fire Resistance", "Ice Resistance", "Psycho Resistance", "Spirit Resistance", "Sun Resistance", "Thunder Resistance", "Undead Resistance", "Water Resistance", "Wind Resistance"])}
                                    {this.renderBoxSearchStat("pendant", "Perks", ["Blind Resistance", "Confuse Resistance", "Fear 2 Resistance", "Freeze Resistance", "Paralyze 2 Resistance", "Poison 3 Resistance", "Shock Resistance"])}
                				</div>
                            }

                            {
                                pendantsFinal.length > 0 ?
                                <div style={{ flexWrap: 'wrap', width: widthNfts }}>
                                    {pendantsFinal.map((item, index) => {
                                        return this.renderEquipCard(item, index, isMobile, 'pendant')
                                    })}
                                </div>
                                :
                                <div style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
                                    <p style={{ fontSize: 16, color: mainTextColor }}>
                                        No pendant available
                                    </p>
                                </div>
                            }
                        </div>

                        <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 15 }} id="shop-upgrades" className="text-bold">
                            Upgrades
                        </p>

                        <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                            {this.renderShopCard("hp", isMobile)}

                            {this.renderShopCard("defense", isMobile)}

                            {this.renderShopCard("attack", isMobile)}

                            {this.renderShopCard("damage", isMobile)}

                            {this.renderShopCard("speed", isMobile)}

                        </div>

                        <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 5 }} id="shop-ap" className="text-bold">
                            Attribute Points
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-medium">
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

                        <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 5 }} id="shop-retrain" className="text-bold">
                            Retrain
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5 }}>
                            Rebuild your wizard, you can't go under the initial stat
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-medium">
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

                                <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 5 }} id="shop-vials" className="text-bold">
                                    Vials
                                </p>

                                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 5 }}>
                                    In each tournament you will be able to buy one vial to temporarily upgrade your wizard. The bonus will last the whole tournament.
                                </p>

                                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 5 }}>
                                    Each wizard can have a maximum of one vial
                                </p>

                                <p style={{ fontSize: 14, color: 'red', marginBottom: 15 }} className="text-medium">
                                    ATTENTION! Vials will not work in the apprentice or chaos tournament
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

                                <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 5 }} id="shop-vials" className="text-bold">
                                    Vials
                                </p>

                                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }}>
                                    Vial Equipped
                                </p>
                                {this.renderVialCard(potionEquipped, false, isMobile)}
                            </div>
                        }

                        <div style={{ flexDirection: 'column', marginTop: 15 }} id="shop-spellbook">

                            <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 5 }} className="text-bold">
                                Spellbook
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5 }}>
                                Swap a spell you know for a new one
                            </p>

                            {this.renderSpellUnkown(isMobile)}
                        </div>

                        <div style={{ flexDirection: 'column' }} id="shop-spell">

                            <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 5 }} className="text-bold">
                                Spell
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 9 }}>
                                Improve your chosen spell:
                            </p>
                            <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }}>
                                The total of improvements on a spell cannot exceed 12 points. Each upgrade will increase the WIZA costs of the next upgrade
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }} className="text-medium">
                                AP available: {wizard.ap ? wizard.ap.int : 0}
                            </p>

                            {this.renderSpellToUpgrade(wizard)}
                        </div>

                        <div style={{ flexDirection: 'column' }} id="shop-nickname">

                            <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 5 }} className="text-bold">
                                Nickname
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 10 }}>
                                Want to give your wizard an epic nickname? Now you can!
                            </p>

                            <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                {this.renderCardNickname(isMobile)}
                            </div>
                        </div>

                    </div>

                </div>


                <p style={{ fontSize: 25, color: mainTextColor, marginBottom: 15 }} className="text-bold">
                    History
                </p>

                {
                    historyUpgrades.map((item, index) => {
                        return this.renderHistory(item, index)
                    })
                }

                {
                    this.state.loadingHistoryUpgrades &&
                    <p style={{ fontSize: 15, color: mainTextColor }}>
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
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />

				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
    btnConnect: {
		width: 250,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderWidth: 1,
		borderStyle: 'solid'
	},
    cardShopStyle: {
        width: 200,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginBottom: 12,
        paddingTop: 5,
        height: 'fit-content',
    },
    cardVialStyle: {
        width: 160,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginBottom: 12,
        paddingTop: 5,
        height: 'fit-content',
    },
    btnChoose: {
        height: 40,
        width: '70%',
        marginBottom: 13,
        borderRadius: 4,
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
        width: 80,
        height: 80,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        display: 'flex',
        marginRight: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid'
    },
    btnStat: {
		padding: 9,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		marginRight: 15,
		borderRadius: 4,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderWidth: 1,
		minWidth: 60,
		display: 'flex',
		flexDirection: 'row'
	},
    btnBuyWiza: {
        height: 40,
        width: 160,
        borderRadius: 4,
        backgroundColor: CTA_COLOR,
		marginBottom: 20,
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
        borderRadius: 4,
        marginRight: 20,
        marginBottom: 5,
        marginTop: 5
    }
}

const mapStateToProps = (state) => {
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, allNfts, wizaBalance, wizardSelectedIdShop, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;
    const { txListen } = state.modalTransactionReducer

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, allNfts, wizaBalance, wizardSelectedIdShop, txListen, mainTextColor, mainBackgroundColor, isDarkmode };
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
    swapSpell,
    getSpellUpgradeCost,
    improveSpell
})(Shop)
