import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment'
import _ from 'lodash'
import Popup from 'reactjs-popup';
import Header from './Header'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalSpellbook from './common/ModalSpellbook'
import ModalWizaPvP from './common/ModalWizaPvP'
import NftCardChoicePvP from './common/NftCardChoicePvP'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import allSpells from './common/Spells'
import getRingBonuses from './common/GetRingBonuses'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
    getPvPweek,
    getPvPopen,
    subscribeToPvPMass,
    incrementFightPvP,
    getAllSubscribersPvP,
    setSfida,
    changeSpellPvP,
    getWizaBalance,
    loadSingleNft,
    loadEquipMinted,
    updateInfoTransactionModal
} from '../actions'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import '../css/Nft.css'


class PvP extends Component {
    constructor(props) {
        super(props)

        let isConnected = this.props.account && this.props.account.account

        this.state = {
            error: "",
            loading: true,
            isConnected,
            showModalConnection: false,
            pvpOpen: false,
            pvpWeek: "",
            pvpWeekEnd: undefined,
            pvpFightsStart: undefined,
            pvpFightsStartDate: undefined,
            yourSubscribers: [],
            yourSubscribersResults: [],
            activeSubs: 0,
            showModalSpellbook: false,
            showModalWizaPvP: false,
            itemChangeSpell: {},
            wizaAmount: 0,
            idNftIncrementFights: "",
            equipment: [],
            toSubscribe: [],
        }
    }

    componentDidMount() {
		document.title = "PvP - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadMinted()
			this.loadProfile()
		}, 500)
	}

    async loadProfile() {

        const docRef = doc(firebasedb, "aaa", `zGVGOTbYTTIcX3EIvMob`)

		const docSnap = await getDoc(docRef)
		let data = docSnap.data()

        //console.log(data);

        if (data) {
            this.loadPvpWeek()
            this.loadPvpOpen()
            this.loadWizaBalance()
            this.loadEquip()
        }
        else {
            this.setState({ error: "Firebase/Firestore not available, check if you have an adblocker or firewall blocking the connection" })
        }
	}

    loadMinted() {
        const { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props

        if (account.account) {
            this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account)
        }
    }

    loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                this.setState({ equipment: response })
			})
		}
    }

    loadWizaBalance() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account)
		}
	}

    loadPvpWeek() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPweek(chainId, gasPrice, gasLimit, networkUrl, async(res) => {

            const docRef = doc(firebasedb, "pvp_week", "general")

    		const docSnap = await getDoc(docRef)
    		let data = docSnap.data()

            let dateFightsStart;

            if (data) {
                dateFightsStart = moment(data.start.seconds * 1000)
                const dateFightsStartTo = moment().to(dateFightsStart)

                //console.log(data);
                const dateEnd = moment(data.end.seconds * 1000)
                //console.log(dateEnd);
                const dateEndTo = moment().to(dateEnd)

                this.setState({ pvpWeek: res, pvpWeekEnd: dateEndTo, pvpFightsStart: dateFightsStartTo, pvpFightsStartDate: dateFightsStart })
            }
            else {
                this.setState({ pvpWeek: res })
            }

            this.loadInfoPvP(res, dateFightsStart)
        })
    }

    loadInfoPvP(week, dateFightsStart) {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        //console.log(dateFightsStart);

        let isTraining = false
        if (moment() < dateFightsStart) {
            isTraining = true
        }

        if (!this.props.subscribersPvP) {
            this.props.getAllSubscribersPvP(chainId, gasPrice, gasLimit, networkUrl, week, (subs) => {
                //console.log(subs);
                //console.log(this.props.userMintedNfts);
                if (account && account.account) {

                    if (this.props.userMintedNfts && this.props.userMintedNfts.length > 0) {
                        this.loadYourSubs(this.props.userMintedNfts, subs, dateFightsStart)
                    }
                    else {
                        this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {

                            this.loadYourSubs(response, subs, dateFightsStart)
            			})
                    }
                }
            })

            return
        }


        if (isTraining) {
            this.props.getAllSubscribersPvP(chainId, gasPrice, gasLimit, networkUrl, week, (subs) => {
                //console.log(subs);
                //console.log(this.props.userMintedNfts);
                if (account && account.account) {

                    if (this.props.userMintedNfts && this.props.userMintedNfts.length > 0) {
                        this.loadYourSubs(this.props.userMintedNfts, subs, dateFightsStart)
                    }
                    else {
                        this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {

                            this.loadYourSubs(response, subs, dateFightsStart)
            			})
                    }
                }
            })
        }
        else {
            if (account && account.account) {

                if (this.props.userMintedNfts && this.props.userMintedNfts.length > 0) {
                    this.loadYourSubs(this.props.userMintedNfts, this.props.subscribersPvP, dateFightsStart)
                }
                else {
                    this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {

                        this.loadYourSubs(this.props.userMintedNfts, this.props.subscribersPvP, dateFightsStart)
                    })
                }
            }
        }

    }

    loadPvpOpen() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPopen(chainId, gasPrice, gasLimit, networkUrl, (res) => {
            this.setState({ pvpOpen: res === "1" })
        })
    }

    loadYourSubs(response, subs, dateFightsStart) {
        let yourSubs = []
        let activeSubs = 0

        subs.map(i => {
            //console.log(i);
            if (i.fightsLeft && i.fightsLeft > 0) {
                activeSubs += 1
            }

            const idSub = i.idnft

            let yourSub = response.find(z => z.id === idSub)
            if (yourSub) {
                yourSub["spellSelected"] = i.spellSelected
                yourSub["rounds"] = i.rounds.int
                yourSub["fightsLeft"] = i.fightsLeft
                //console.log(yourSub, i);
                yourSubs.push(yourSub)
                this.loadResultsYourSub(yourSub, dateFightsStart)
            }
        })
        //console.log(yourSubs);
        //console.log(activeSubs);

        this.setState({ loading: false, yourSubscribers: yourSubs, activeSubs })
    }

    subscribe(idNft, spellSelected, wizaAmount) {
		const { pvpWeek } = this.state
        const { account } = this.props

		if (!pvpWeek) {
			return
		}

		let refactorSpellSelected = { name: spellSelected.name }

		let obj = {
			spellSelected: refactorSpellSelected,
			idnft: idNft,
            week: pvpWeek,
            wizaAmount,
            id: `${pvpWeek}_${idNft}`,
            address: account.account
		}

		const toSubscribe = Object.assign([],  this.state.toSubscribe)
		toSubscribe.push(obj)

		this.setState({ toSubscribe })
	}

    subscribeMass() {
		const { chainId, gasPrice, gasLimit, netId, account } = this.props
		const { toSubscribe } = this.state

		let tot = 0
        toSubscribe.map(i => tot += i.wizaAmount)

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${toSubscribe.length} KDA and ${tot} WIZA`,
			typeModal: 'subscribe_pvp',
			transactionOkText: `Your Wizards are registered for PvP arena!`,
            toSubscribePvP: toSubscribe
		})

		this.props.subscribeToPvPMass(chainId, gasPrice, gasLimit, netId, account, toSubscribe)
	}

    incrementPvP(wizaAmount) {
        const { account, chainId, gasPrice, netId } = this.props
        const { pvpWeek, idNftIncrementFights } = this.state

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will increase the number of fights Wizard #${idNftIncrementFights} can do by ${wizaAmount}`,
			typeModal: 'increment_fight_pvp',
			transactionOkText: `Maximum fights increased!`,
            nameNft: `#${idNftIncrementFights}`,
            wizaAmount,
            pvpWeek
		})

        this.props.incrementFightPvP(chainId, gasPrice, 6000, netId, account, pvpWeek, idNftIncrementFights, wizaAmount)
    }

    changeSpell(spellSelected) {
        const { account, chainId, gasPrice, netId } = this.props
        const { pvpWeek, itemChangeSpell } = this.state

        //console.log(itemChangeSpell);

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will change the spell of #${itemChangeSpell.id}`,
			typeModal: 'changespell_pvp',
			transactionOkText: `Spell changed!`,
		})

        let refactorSpellSelected = { name: spellSelected.name }

        this.props.changeSpellPvP(chainId, gasPrice, 5000, netId, account, pvpWeek, itemChangeSpell.id, refactorSpellSelected)
    }

    sortById(array, key) {

        //console.log(array);

        let sorted = []

        if (array && array.length > 0) {
            sorted = array.sort((a, b) => {
                return parseInt(a[key]) - parseInt(b[key])
            })
        }

        return sorted
    }

    sortByIdSubs(array, key) {

        //console.log(array);

        let sorted = []

        if (array && array.length > 0) {
            sorted = array.sort((a, b) => {
                return parseInt(a[key]) - parseInt(b[key])
            })
        }

        sorted = sorted.sort((a, b) => {
            return b.fightsLeft - a.fightsLeft
        })
        //console.log(sorted);

        return sorted
    }

    async loadResultsYourSub(item, dateFightsStart) {
        const { pvpWeek } = this.state

        //console.log(item);

        let keyDb = "pvp_results"
        if (dateFightsStart) {
            const fightsStart = moment().isAfter(dateFightsStart)

            if (!fightsStart) {
                keyDb = "pvp_training"
            }
        }

        const docRef = doc(firebasedb, keyDb, `${pvpWeek}_#${item.id}`)

		const docSnap = await getDoc(docRef)
		let data = docSnap.data()

        if (!data) {
            data = { win: 0, lose: 0, maxFights: 0 }
        }

        //console.log(data);

        const finalData = {...data, ...item}

        //console.log(finalData);

        const temp = Object.assign([], this.state.yourSubscribersResults)

        //console.log(temp);

        temp.push(finalData)

        this.setState({ yourSubscribersResults: temp })
    }

    async chooseOpponent(item, level) {
        const { pvpWeek, pvpFightsStartDate } = this.state
        const { account, subscribersPvP } = this.props

        this.setState({ loading: true })

        const docTest = doc(firebasedb, "aaa", `zGVGOTbYTTIcX3EIvMob`)
		const docSnapTest = await getDoc(docTest)
		let dataTest = docSnapTest.data()

        if (!dataTest) {
            toast.error('Something goes wrong... please try again')
            return
        }

        const fightsStart = moment().isAfter(pvpFightsStartDate)

        let maxL = level+25
        let minL = level-25
        let validSubs = []

        if (fightsStart) {
            const docRef = doc(firebasedb, "pvp_results", `${pvpWeek}_#${item.id}`)
            const docSnap = await getDoc(docRef)
            let data = docSnap.data()

            //console.log(item);

            //se per caso hai fatto un update rounds ma nel BE non si sono aggiornati, li aggiorniamo e facciamo un refresh della pagina
            if (data && data.maxFights < item.rounds) {
                await updateDoc(docRef, {"maxFights": item.rounds })
                window.location.reload()
                return
            }

            //questo non ho ancora chiaro quando capita ma nel BE non dovresti avere più rounds di quelli che hai nel contratto
            if (data && data.maxFights > item.rounds) {
                await updateDoc(docRef, {"maxFights": item.rounds })
                window.location.reload()
                return
            }

            if (data) {
                //questo può capitare se ti stanno sfidando e hai lasciato la pagina aperta
                //quando vai a sfidare tu non si è aggiornata la pagina e quindi ti sembra che puoi ancora fare fights
                //quindi facciamo il check con i fights dal BE e se sono >= dei tuoi rounds allora facciamo un refresh
                const fightsDone = data.win + data.lose
                if (fightsDone >= item.rounds) {
                    window.location.reload()
                    return
                }
            }

            //rimuoviamo se stessi
            //se vengono dallo stesso account
            // se il livello è compreso tra max e min
            //se ha ancora fights left
            validSubs = subscribersPvP.filter(i => {
                return i.idnft !== item.id
                    && i.address !== account.account
                    && i.level >= minL && i.level <= maxL
                    && i.fightsLeft > 0
            })
        }
        else {
            //rimuoviamo se stessi
            //se vengono dallo stesso account
            // se il livello è compreso tra max e min
            validSubs = subscribersPvP.filter(i => {
                return i.idnft !== item.id
                    && i.address !== account.account
                    && i.level >= minL && i.level <= maxL
            })
        }


        //console.log(subs);
        //return

        if (validSubs.length === 0) {
            this.setState({ loading: false })
            toast.error('No opponent found, please try again')
            return
        }

        const idxRandom = Math.floor(Math.random() * validSubs.length) //da 0 a validSubs.length -1

        let opponent = validSubs[idxRandom]

        //console.log(opponent);

        if (fightsStart) {
            const docRefOpponent = doc(firebasedb, "pvp_results", `${pvpWeek}_#${opponent.idnft}`)
            const docSnapOppo = await getDoc(docRefOpponent)
            let dataOppo = docSnapOppo.data()

            if (dataOppo) {

                //facciamo un refresh per aggiornare i dati sia su FE che su BE
                if (dataOppo.maxFights < opponent.rounds.int) {
                    await updateDoc(docRefOpponent, {"maxFights": opponent.rounds.int })
                    window.location.reload()
                    return
                }
                //vuol dire che il FE non è aggiornato con gli ultimi dati
                else if (dataOppo.maxFights > opponent.rounds.int) {
                    window.location.reload()
                    return
                }

                const fightsDone = dataOppo.win + dataOppo.lose
                if (fightsDone >= opponent.rounds.int) {
                    window.location.reload()
                    return
                }
            }
            else {
                window.location.reload()
                return
            }
        }


        //return
        const sfida = {
            player1: item,
            player2: opponent,
            pvpWeek: pvpWeek,
            fightsStart
        }
        //console.log(sfida);
        //return

        this.props.setSfida(sfida)

        this.setState({ loading: false }, () => {
            this.props.history.push('/fightpvp')
        })
    }

    openPopupChangeSpell(id) {
        const { userMintedNfts } = this.props

        const item = userMintedNfts.find(i => i.id === id)

        //console.log(item);

        this.setState({ showModalSpellbook: true, itemChangeSpell: item })
    }

    openPopupIncrementFights(id) {
        this.setState({ showModalWizaPvP: true, idNftIncrementFights: id })
    }


    calcWinRate(item) {

        const lose = item.lose
        const win = item.win

        const totalFights = lose + win

        const winRate = Math.round(win * 100 / totalFights)

        if (!winRate) {
            return 0
        }

        return winRate
    }

    renderRowChoise(item, index, modalWidth) {
        const { pvpWeek, pvpOpen, equipment, toSubscribe } = this.state
        const { wizaBalance } = this.props


        if (!item.attack) {
            return <div key={index} />
        }

		return (
            <NftCardChoicePvP
				key={index}
				item={item}
				width={230}
				pvpWeek={pvpWeek}
				canSubscribe={pvpOpen}
				onSubscribe={(spellSelected, wizaAmount) => this.subscribe(item.id, spellSelected, wizaAmount)}
				modalWidth={modalWidth}
                index={index}
                wizaBalance={wizaBalance || 0}
                equipment={equipment}
                toSubscribe={toSubscribe}
                removeFromSubscribers={(idnft) => {
					let toSubscribe = Object.assign([], this.state.toSubscribe)

					const idx = toSubscribe.findIndex(i => i.idnft === idnft)
					if (idx > -1) {
						toSubscribe.splice(idx, 1)
					}
					this.setState({ toSubscribe })
				}}
			/>
		)
	}

    getRingEquipped(item) {
		const { equipment } = this.state

        //console.log(equipment);

		if (!equipment || equipment.length === 0) {
			return ""
		}

		const ring = equipment.find(i => i.equippedToId === item.id)

		//console.log(ring);

		if (ring && ring.equipped) {
			return ring
		}
		//console.log(ring);

		return ""
	}

    renderRowSub(item, index, isMobile, maxWidth) {
        //console.log(item);
        const { pvpFightsStartDate } = this.state
        const { userMintedNfts, mainTextColor, isDarkmode } = this.props

        const winRate = this.calcWinRate(item)

        const nftInfo = userMintedNfts.find(i => i.id === item.id)


        //console.log(nftInfo);

        //console.log(item);

        const totalFights = item.win + item.lose

        const fightsStart = moment().isAfter(pvpFightsStartDate)
        //console.log(fightsStart);

        const spellSelectedInfo = allSpells.find(i => i.name === item.spellSelected.name)
        const ringEquipped = this.getRingEquipped(item)

        //console.log(ringEquipped);

        let bonusEquipment;
		if (ringEquipped) {
			bonusEquipment = getRingBonuses(ringEquipped).bonusesDict
            //console.log(bonusEquipment);
		}

        //console.log(bonusEquipment['hp']);

        let hp = bonusEquipment && bonusEquipment['hp'] ? item.hp.int + bonusEquipment['hp'] : item.hp.int
        let def = bonusEquipment && bonusEquipment['defense'] ? item.defense.int + bonusEquipment['defense'] : item.defense.int
        let atk = bonusEquipment && bonusEquipment['attack'] ? item.attack.int + bonusEquipment['attack'] : item.attack.int
        let dmg = bonusEquipment && bonusEquipment['damage'] ? item.damage.int + bonusEquipment['damage'] : item.damage.int
        let speed = bonusEquipment && bonusEquipment['speed'] ? item.speed.int + bonusEquipment['speed'] : item.speed.int

        if (item['upgrades-spell']) {
            atk += item['upgrades-spell'].attack.int
            dmg += item['upgrades-spell'].damage.int
        }

        return (
            <div
                key={index}
                style={Object.assign({}, styles.boxSubscribed, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", flexDirection: isMobile ? 'column' : 'row', maxWidth: maxWidth - 10, marginRight: isMobile ? 5 : 20 })}
            >
                <img
                    src={getImageUrl(item.id)}
                    style={{ width: 100, height: 100, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid', marginRight: 10, marginBottom: isMobile ? 7 : 0 }}
                    alt={item.id}
                />

                <div style={{ flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>

                    <div style={{ alignItems: 'center', marginBottom: 10 }}>
                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 20, width: 50 }} className="text-medium">
                            #{item.id}
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, width: 170 }}>
                            Win rate <span className="text-bold">{winRate}%</span>
                        </p>
                    </div>

                    <div style={{ alignItems: 'center', marginBottom: 10, minWidth: 283 }}>
                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 10 }}>
                            Win <span className="text-bold">{item.win}</span>
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 10 }}>
                            Lose <span className="text-bold">{item.lose}</span>
                        </p>

                        {
                            item.rounds && fightsStart &&
                            <p style={{ fontSize: 16, color: mainTextColor }}>
                                {totalFights}/{item.rounds} fights
                            </p>
                        }

                        {
                            !fightsStart &&
                            <p style={{ fontSize: 16, color: mainTextColor }}>
                                {item.win + item.lose} fights
                            </p>
                        }
                    </div>

                    {
                        item.level &&
                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 14, color: mainTextColor, marginRight: 7 }}>
                                Level
                            </p>

                            <p style={{ fontSize: 17, color: getColorTextBasedOnLevel(item.level, isDarkmode) }} className="text-bold">
                                {item.level}
                            </p>
                        </div>
                    }

                    <div style={{ alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 4 }}>
                            HP
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 8 }} className="text-bold">
                            {hp}
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 4 }}>
                            Def
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 8 }} className="text-bold">
                            {def}
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 4 }}>
                            Atk
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 8 }} className="text-bold">
                            {atk + spellSelectedInfo.atkBase}
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 4 }}>
                            Dmg
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 8 }} className="text-bold">
                            {dmg + spellSelectedInfo.dmgBase}
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 4 }}>
                            Speed
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 8 }} className="text-bold">
                            {speed}
                        </p>
                    </div>

                    <p style={{ fontSize: 14, color: mainTextColor, marginBottom: 10 }}>
                        Spell selected: {item.spellSelected.name}
                    </p>

                    {
                        this.state.loading ?
                        <div
                            style={styles.btnPlay}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Loading...
                            </p>
                        </div>
                        :
                        null
                    }

                    {
                        !this.state.loading && !fightsStart &&
                        <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: isMobile ? 'space-around' : 'space-between' }}>
                            <button
                                className="btnH"
                                style={Object.assign({}, styles.btnPlay, { marginRight: 10 })}
                                onClick={() => {
                                    if (this.state.loading) {
                                        return
                                    }

                                    this.chooseOpponent(item, item.level)
                                }}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Training
                                </p>
                            </button>

                            <button
                                className="btnH"
                                style={styles.btnPlay}
                                onClick={() => {
                                    if (this.state.loading) {
                                        return
                                    }

                                    this.openPopupChangeSpell(item.id)
                                }}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Change spell
                                </p>
                            </button>
                        </div>
                    }

                    {
                        !this.state.loading && totalFights < item.rounds && fightsStart ?
                        <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: isMobile ? 'space-around' : 'space-between' }}>
                            <button
                                className="btnH"
                                style={Object.assign({}, styles.btnPlay, { marginRight: 10 })}
                                onClick={() => {
                                    if (this.state.loading) {
                                        return
                                    }

                                    this.chooseOpponent(item, item.level)
                                }}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Fight
                                </p>
                            </button>

                            <button
                                className="btnH"
                                style={styles.btnPlay}
                                onClick={() => {
                                    if (this.state.loading) {
                                        return
                                    }

                                    this.openPopupChangeSpell(item.id)
                                }}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Change spell
                                </p>
                            </button>
                        </div>
                        : null
                    }

                    {
                        !this.state.loading && totalFights >= item.rounds && fightsStart ?
                        <button
                            className="btnH"
                            style={Object.assign({}, styles.btnPlay, { width: 210 })}
                            onClick={() => {
                                if (this.state.loading) {
                                    return
                                }
                                this.openPopupIncrementFights(item.id)
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Increment max fights
                            </p>
                        </button>
                        : null
                    }

                </div>

            </div>
        )
    }

    renderFooterSubscribe(isMobile) {
		const { toSubscribe } = this.state
        const { wizaBalance, account, mainTextColor } = this.props

        let totWiza = 0


		let temp = []
		toSubscribe.map(i => {

            totWiza += i.wizaAmount

			temp.push(
				<Popup
					key={i.idnft}
					trigger={open => (
						<img
							style={{ width: 60, height: 60, borderRadius: 4, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', cursor: 'pointer' }}
							src={getImageUrl(i.idnft)}
							alt={`#${i.idnft}`}
						/>
					)}
					position="top center"
					on="hover"
				>
					<div style={{ padding: 10, fontSize: 15 }}>
						#{i.idnft} <br /> Spell Selected: {i.spellSelected.name} <br /> WIZA: {i.wizaAmount}
					</div>
				</Popup>
			)
		})

		return (
			<div style={{ justifyContent: 'space-between', alignItems: 'center', flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
				<div style={{ flexWrap: 'wrap', marginLeft: isMobile ? 0 : 20 }}>
					{temp}
				</div>

                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: 20 }}>

                    <p style={{ fontSize: 14, color: mainTextColor, marginBottom: 6 }} className="text-bold">
                        Tot $WIZA {totWiza}
                    </p>
                    <button
    					className="btnH"
    					style={{ width: 180, height: 45, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: CTA_COLOR }}
    					onClick={() => this.subscribeMass()}
    				>
    					<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
    						Subscribe
    					</p>

                        {
                            account.account &&
                            <p style={{ fontSize: 13, color: 'white', marginTop: 2 }}>
                                Balance: {_.floor(wizaBalance, 1)} $WIZA
                            </p>
                        }

    				</button>
                </div>
			</div>
		)
	}

    renderBody(isMobile) {
        const { isConnected, showModalConnection, pvpOpen, yourSubscribersResults, error, activeSubs, pvpWeekEnd, pvpFightsStart, pvpFightsStartDate } = this.state
        const { account, userMintedNfts, mainTextColor, mainBackgroundColor, subscribersPvP } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        if (!account || !account.account || !isConnected) {

			return (
				<div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

                    <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }}>
                        PvP
                    </p>

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

        if (error) {
			return (
				<div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 250, height: 250, borderRadius: 4, marginBottom: 30 }}
						alt='Placeholder'
					/>

					<p style={{ fontSize: 16, color: 'red', textAlign: 'center', width: 250, marginBottom: 30 }}>
						{error}
					</p>
				</div>
			)
		}


        const sorted = this.sortById(userMintedNfts, "id")

        const yourSubscribersResultsSorted = this.sortByIdSubs(yourSubscribersResults, "idnft")

        //console.log(pvpFightsStartDate);
        const now = moment()
        const fightsStart = now.isAfter(pvpFightsStartDate)
        //console.log(fightsStart);

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 30 }} className="text-medium">
                    PvP
                </p>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                <div style={{ marginBottom: 20 }}>

                    <div style={{  flexDirection: "column" }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }}>
                            PvP open: {pvpOpen ? "Yes" : "No"}
                        </p>

                        <p style={{ fontSize: 15, color: mainTextColor }}>
                            PvP fee: <span className="text-medium">1 $KDA</span>
                        </p>
                    </div>

                    <div style={{  flexDirection: "column", marginLeft: isMobile ? 10 : 50 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }}>
                            Subscribers {subscribersPvP ? subscribersPvP.length : 0}
                        </p>

                        {
                            activeSubs && subscribersPvP && subscribersPvP.length > 0 ?
                            <div style={{ alignItems: 'center' }}>
                                <p style={{ fontSize: 15, color: mainTextColor, marginRight: 10 }}>
                                    Active subs
                                </p>
                                <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                                    {activeSubs}
                                </p>
                            </div>
                            : null
                        }
                    </div>

                    <div style={{ flexDirection: 'column', marginLeft: isMobile ? 10 : 50 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }}>
                            Reward: +2 AP (min 30 fights)
                        </p>

                        {
                            !fightsStart &&
                            <p style={{ fontSize: 15, color: mainTextColor }}>
                                Registrations close: {pvpFightsStart}
                            </p>
                        }

                        {
                            pvpWeekEnd && fightsStart &&
                            <p style={{ fontSize: 15, color: mainTextColor }}>
                                PvP end: {pvpWeekEnd}
                            </p>
                        }

                    </div>
                </div>

                <div style={{ width: '100%', height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginBottom: 30 }} />

                <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 5 }} className="text-bold">
                    Your Wizards in the arena ({yourSubscribersResults.length})
                </p>

                <p style={{ fontSize: 14, color: mainTextColor, marginBottom: 30 }}>
                    You will only fight wizards 25 levels higher or lower
                </p>

                <div style={{ flexDirection: 'row', width: boxW, marginBottom: 14, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                    {
                        yourSubscribersResults && yourSubscribersResults.length > 0 &&
                        yourSubscribersResultsSorted.map((item, index) => {
                            return this.renderRowSub(item, index, isMobile, boxW)
                        })
                    }

                </div>

                <div style={{ width: '100%', height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginBottom: 30 }} />

                {
                    !fightsStart &&
                    <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 40 }} className="text-bold">
                        Select the wizard you want to enroll in the PvP Arena
                    </p>
                }

                {
                    !fightsStart &&
                    <div style={{ flexWrap: 'wrap', marginBottom: 30, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        {
                            sorted && sorted.length > 0 &&
                            sorted.map((item, index) => {
                                return this.renderRowChoise(item, index, modalW)
                            })
                        }
                    </div>
                }

                {
                    this.state.toSubscribe.length > 0 &&
                    <div style={Object.assign({}, styles.footerSubscribe, { bottom: -padding, backgroundColor: mainBackgroundColor })}>
						{this.renderFooterSubscribe(isMobile)}
					</div>
                }


                {
                    this.state.showModalSpellbook ?
                    <ModalSpellbook
                        showModal={this.state.showModalSpellbook}
                        onCloseModal={() => this.setState({ showModalSpellbook: false })}
                        width={modalW}
                        stats={this.state.itemChangeSpell}
                        onSub={(spellSelected) => {
                            this.changeSpell(spellSelected)
                            this.setState({ showModalSpellbook: false })
                        }}
                    />
                    : null
                }

                {
                    this.state.showModalWizaPvP &&
                    <ModalWizaPvP
                        showModal={this.state.showModalWizaPvP}
                        onCloseModal={() => this.setState({ showModalWizaPvP: false })}
                        width={modalW}
                        wizaBalance={this.props.wizaBalance}
                        callback={(wizaAmount) => {
                            this.incrementPvP(wizaAmount)
                            this.setState({ showModalWizaPvP: false })
                        }}
                    />
                }

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='home'
					section={7}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
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
        borderStyle: 'solid',
        display: 'flex'
	},
    btnPlay: {
        height: 36,
        width: 110,
        minWidth: 110,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    },
    btnWait: {
        height: 35,
        width: 150,
        minWidth: 150,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: CTA_COLOR,
        borderWidth: 2,
        borderStyle: 'solid'
    },
    boxSubscribed: {
        marginBottom: 20,
        marginRight: 20,
        alignItems: 'center',
        width: 'fit-content',
        padding: 10,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderRadius: 4,
    },
    footerSubscribe: {
		width: '100%',
		position: 'sticky',
		bottom: 0,
		left: 0,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderRadius: 4,
		borderTopWidth: 1,
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderBottomWidth: 0,
		paddingTop: 10
	},
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, avgLevelPvP, wizaBalance, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode, subscribersPvP } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, avgLevelPvP, wizaBalance, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode, subscribersPvP };
}

export default connect(mapStateToProps, {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
    getPvPweek,
    getPvPopen,
    subscribeToPvPMass,
    incrementFightPvP,
    getAllSubscribersPvP,
    setSfida,
    changeSpellPvP,
    getWizaBalance,
    loadSingleNft,
    loadEquipMinted,
    updateInfoTransactionModal
})(PvP)
