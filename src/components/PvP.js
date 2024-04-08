import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDoc, doc, updateDoc, query, collection, where, limit, orderBy, getDocs, serverTimestamp, setDoc, increment } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment'
import _ from 'lodash'
import Popup from 'reactjs-popup';
import Header from './Header'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalWizaPvP from './common/ModalWizaPvP'
import ModalStats from './common/ModalStats'
import NftCardChoicePvP from './common/NftCardChoicePvP'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import allSpells from './common/Spells'
import fight from './common/CalcFight'
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
    updateInfoTransactionModal,
    loadBlockNftsSplit,
    getInfoItemEquippedMass,
    getInfoAuraMass
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
            dailyFights: 40,
            yourSubscribers: [],
            yourSubscribersResults: [],
            activeSubs: 0,
            showModalWizaPvP: false,
            wizaAmount: 0,
            idNftIncrementFights: "",
            toSubscribe: [],
            replay: {},
            loadingReplay: false,
            allSubscribers: [],
            showModalStats: false,
            itemShowStats: undefined
        }
    }

    componentDidMount() {
		document.title = "PvP - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadMinted()
		}, 500)
	}

    loadMinted() {
        const { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props

        if (account.account) {
            if (userMintedNfts) {
                this.loadProfile()
            }
            else {
                this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
                    this.loadProfile()
                })
            }
        }
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
        }
        else {
            this.setState({ error: "Firebase/Firestore not available, check if you have an adblocker or firewall blocking the connection" })
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

                this.setState({ pvpWeek: res, pvpWeekEnd: dateEndTo, pvpFightsStart: dateFightsStartTo, pvpFightsStartDate: dateFightsStart, dailyFights: data.dailyFights })
            }
            else {
                this.setState({ pvpWeek: res })
            }

            this.loadInfoPvP(res, dateFightsStart)
        })
    }

    loadPvpOpen() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPopen(chainId, gasPrice, gasLimit, networkUrl, (res) => {
            this.setState({ pvpOpen: res === "1" })
        })
    }

    async loadInfoPvP(week, dateFightsStart) {
        //console.log(dateFightsStart);

        let isTraining = false
        let keydb = "pvp_results"
        if (moment() < dateFightsStart) {
            isTraining = true
            keydb = "pvp_training"
        }

        const q = query(collection(firebasedb, keydb), where("week", "==", week))
        const querySnapshot = await getDocs(q)

        let subscribers = []

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
            let data = doc.data()
            data['id'] = doc.id.replace(`${week}_#`, "")
            const fightsLeft = isTraining ? 30 : data.maxFights - (data.win + data.lose)

            data['fightsLeft'] = fightsLeft

            subscribers.push(data)
        })

        //console.log(subscribers);
        this.loadYourSubs(subscribers, dateFightsStart, isTraining)
    }

    async loadYourSubs(subs, dateFightsStart, isTraining) {

        const { userMintedNfts, chainId, gasPrice, networkUrl } = this.props

        let yourSubs = []
        let activeSubs = 0

        //console.log(response, subs);

        let onlySubIds = []

        subs.map(i => {
            //console.log(i);
            onlySubIds.push(i.id)

            if (i.fightsLeft && i.fightsLeft > 0) {
                activeSubs += 1
            }

            let yourSub = userMintedNfts.find(z => z.id === i.id)
            //console.log(yourSub);
            if (yourSub) {
                //yourSub["spellSelected"] = y.spellSelected
                yourSub["rounds"] = isTraining ? i.fightsLeft : i.maxFights
                yourSub["fightsLeft"] = i.fightsLeft
                //console.log(yourSub, i);
                yourSubs.push(yourSub)
                this.loadResultsYourSub(yourSub, dateFightsStart)
            }
        })
        //console.log(yourSubs);
        //console.log(activeSubs);
        let infoSubs = await this.props.loadBlockNftsSplit(chainId, gasPrice, 1000000, networkUrl, onlySubIds)
        //console.log(infoSubs);
        infoSubs.map(i => {
            const w = subs.find(z => z.id === i.id)
            if (w) {
                i['fightsLeft'] = w.fightsLeft
            }
        })

        this.setState({ loading: false, yourSubscribers: yourSubs, activeSubs, allSubscribers: subs, allSubscribersInfo: infoSubs })
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

    checkIfCanDoManualFights(item) {
        const { pvpFightsStartDate, dailyFights } = this.state

        //console.log(pvpFightsStartDate);
        const hours = moment().diff(pvpFightsStartDate, 'hours')
        //console.log(hours);

        const totalFights = item.manualFights || 0

        let canFight = false

        if (hours < 24 && totalFights < dailyFights) {
            canFight = true
        }
        else if (hours >= 24 && hours < 48 && totalFights < (dailyFights * 2)) {
            canFight = true
        }
        else if (hours >= 48 && totalFights < (dailyFights * 3)) {
            canFight = true
        }

        return canFight
    }

    async chooseOpponent(item) {
        const { pvpWeek, pvpFightsStartDate, allSubscribersInfo } = this.state
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        //console.log(item);
        //console.log(allSubscribersInfo);

        this.setState({ loading: true })

        const docTest = doc(firebasedb, "aaa", `zGVGOTbYTTIcX3EIvMob`)
		const docSnapTest = await getDoc(docTest)
		let dataTest = docSnapTest.data()

        if (!dataTest) {
            toast.error('Something goes wrong... please try again')
            return
        }

        const fightsStart = moment().isAfter(pvpFightsStartDate)


        let maxL = item.level+25
        let minL = item.level-25
        let validSubs = []

        if (fightsStart) {
            const docRef = doc(firebasedb, "pvp_results", `${pvpWeek}_#${item.id}`)
            const docSnap = await getDoc(docRef)
            let data = docSnap.data()

            //console.log(data);

            //se per caso hai fatto un update rounds ma nel BE non si sono aggiornati, li aggiorniamo e facciamo un refresh della pagina
            if (data && data.maxFights < item.rounds) {
                //await updateDoc(docRef, {"maxFights": item.rounds })
                window.location.reload()
                return
            }

            //questo non ho ancora chiaro quando capita ma nel BE non dovresti avere più rounds di quelli che hai nel contratto
            if (data && data.maxFights > item.rounds) {
                //await updateDoc(docRef, {"maxFights": item.rounds })
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

                const canFight = this.checkIfCanDoManualFights(item)
                if (!canFight) {
                    window.location.reload()
                    return
                }
            }

            //rimuoviamo se stessi
            //se vengono dallo stesso account
            // se il livello è compreso tra max e min
            //se ha ancora fights left
            validSubs = allSubscribersInfo.filter(i => {
                return i.id !== item.id
                    && i.owner !== account.account
                    && i.level.int >= minL && i.level.int <= maxL
                    && i.fightsLeft > 0
            })
        }
        else {
            //rimuoviamo se stessi
            //se vengono dallo stesso account
            // se il livello è compreso tra max e min
            validSubs = allSubscribersInfo.filter(i => {
                return i.id !== item.id
                    && i.owner !== account.account
                    && i.level.int >= minL && i.level.int <= maxL
            })
        }

        //console.log(validSubs);

        if (validSubs.length === 0) {
            this.setState({ loading: false })
            toast.error('No opponent found, please try again')
            return
        }

        const idxRandom = Math.floor(Math.random() * validSubs.length) //da 0 a validSubs.length -1

        //console.log(idxRandom);

        let opponent = validSubs[idxRandom]

        //console.log(opponent);

        if (fightsStart) {
            const docRefOpponent = doc(firebasedb, "pvp_results", `${pvpWeek}_#${opponent.id}`)
            const docSnapOppo = await getDoc(docRefOpponent)
            let dataOppo = docSnapOppo.data()

            //console.log(dataOppo);
            const fightsLeftAggiornato = dataOppo.lose + dataOppo.win

            if (dataOppo) {
                //facciamo un refresh per aggiornare i dati sia su FE che su BE
                if (dataOppo.maxFights <= fightsLeftAggiornato) {
                    window.location.reload()
                    return
                }
            }
            else {
                window.location.reload()
                return
            }
        }

        //console.log(item, opponent);

        const rings = await this.props.getInfoItemEquippedMass(chainId, gasPrice, gasLimit, networkUrl, [item.id, opponent.id])
        //console.log(ring);
        const pendants = await this.props.getInfoItemEquippedMass(chainId, gasPrice, gasLimit, networkUrl, [`${item.id}pendant`, `${opponent.id}pendant`])

        const auras = await this.props.getInfoAuraMass(chainId, gasPrice, gasLimit, networkUrl, [item.id, opponent.id])

        //console.log(rings, pendants, auras);

        const finalInfo = this.clearInfo([item, opponent], rings, pendants, auras)

        //console.log(finalInfo);

        const finalInfo1 = finalInfo[0]
        const finalInfo2 = finalInfo[1]

        fight(finalInfo1, finalInfo2, undefined, async (history, winner) => {
            //console.log(history, winner)

            //inviare a firebase il fight
            //e poi aggiungere a obj il fightId

            const fightObj = {
                actions: history,
                idnft1: finalInfo1.id,
                idnft2: finalInfo2.id,
                info1: finalInfo1,
                info2: finalInfo2,
                winner,
                wizards: [finalInfo1.id, finalInfo2.id],
                timestamp: serverTimestamp()
            }

            //console.log(fightObj);

            const fightRef = doc(collection(firebasedb, "fights_pvp2"))
            const newDoc = setDoc(fightRef, fightObj)

            //console.log(fightRef.id)

            const playerIsWinner = finalInfo1.id === winner

            let keyDb = fightsStart ? "pvp_results" : "pvp_training"

            const docRef = doc(firebasedb, keyDb, `${pvpWeek}_#${winner}`)
            try {
                if (playerIsWinner) {
                    updateDoc(docRef, {
                        "win": increment(1),
                        "manualFights": increment(1)
                    })
                }
                else {
                    updateDoc(docRef, {
                        "win": increment(1)
                    })
                }
            }
            catch (error) {
                console.log(error);
            }

            const loserId = finalInfo1.id === winner ? finalInfo2.id : finalInfo1.id

            const docRef2 = doc(firebasedb, keyDb, `${pvpWeek}_#${loserId}`)
            try {
                if (!playerIsWinner) {
                    updateDoc(docRef2, {
                        "lose": increment(1),
                        "manualFights": increment(1)
                    })
                }
                else {
                    updateDoc(docRef2, {
                        "lose": increment(1)
                    })
                }
            }
            catch (error) {
                console.log(error);
            }


            this.setState({ loading: false }, () => {
                this.props.history.push(`/fightreplay/fights_pvp2/${fightRef.id}`)
            })
        })
    }

    clearInfo(infoNfts, rings, pendants, auras) {
    	let newInfo = []

    	for (var i = 0; i < infoNfts.length; i++) {
            let info = infoNfts[i]

            info['attack'] = info.attack.int
            info['damage'] = info.damage.int
            info['defense'] = info.defense.int
            info['hp'] = info.hp.int
            info['speed'] = info.speed.int

            //console.log(info.spellSelected);

            if (info.spellSelected) {
                info['spellSelected'] = this.refactorSpell(info.spellSelected)
            }


            //RING
            const ring = rings.find(i => i.equippedToId === info.id)
            if (ring && ring.equipped) {
                info['ring'] = ring

                const stats = ring.bonus.split(",")
                stats.map(i => {
                    const infos = i.split("_")
                    info[infos[1]] += parseInt(infos[0])
                })
            }
            else {
                info['ring'] = {}
            }

            // PENDANT
            const pendant = pendants.find(i => i.equippedToId === `${info.id}pendant`)
            if (pendant && pendant.equipped) {
                info['pendant'] = pendant
            }
            else {
                info['pendant'] = {}
            }

            // AURA
            const aura = auras.find(i => i.idnft === info.id)
            if (aura && aura.bonus.int > 0) {
                info['aura'] = aura
                info['defense'] += parseInt(aura.bonus.int)
            }
            else {
                info['aura'] = {}
            }

            newInfo.push(info)
        }

        return newInfo
    }

    refactorSpell(spell) {
        const newSpell = allSpells.find(i => i.name === spell.name)

        return newSpell;
    }

    async loadReplay(item) {
        //console.log(item);
        this.setState({ loadingReplay: true })

        let q1 = query(collection(firebasedb, "fights_pvp2"), where("wizards", "array-contains", item.id), limit(40), orderBy("timestamp", "desc"))
        const querySnapshot = await getDocs(q1)

        let fights = []

        querySnapshot.forEach(doc => {
            //console.log(doc.data());

            let data = doc.data()
            data['docId'] = doc.id

            //console.log(moment(data.timestamp.seconds * 1000).fromNow());

            fights.push(data)
        })

        //console.log(fights);

        fights.sort((a,b) => {
            const dateA = moment(a.timestamp.seconds * 1000)
            const dateB = moment(b.timestamp.seconds * 1000)

            //console.log(dateA, dateB);

            return dateB - dateA
        })

        //console.log(fights);

        fights = fights.slice(0, 4)

        //console.log(fights);
        //console.log(moment(fights[0]['timestamp']['seconds'] * 1000));

        let oldReplay = Object.assign({}, this.state.replay)
        oldReplay[item.id] = fights

        this.setState({ replay: oldReplay, loadingReplay: false })
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
        const { pvpWeek, pvpOpen, toSubscribe } = this.state
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

    renderReplay(currentWizId, item, index) {
        const { mainTextColor } = this.props

        //console.log(item);

        const sfidanteId = item.idnft1 === currentWizId ? item.idnft2 : item.idnft1

        //console.log(sfidanteId);

        return (
            <a
                href={`${window.location.protocol}//${window.location.host}/fightreplay/fights_pvp2/${item.docId}`}
                target="_blank"
                rel="noopener noreferrer"
                className='btnH'
                style={{ flexDirection: 'column', alignItems: 'center', borderRadius: 4, marginBottom: 8, marginRight: 8, marginTop: 8 }}
                key={index}
            >
                <img
                    src={getImageUrl(sfidanteId)}
                    style={{ width: 70, height: 70, borderRadius: 4, marginBottom: 5 }}
                    alt={`${sfidanteId}`}
                />

                <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center', maxWidth: 70 }}>
                    #{sfidanteId}
                </p>
            </a>
        )
    }

    renderRowSub(item, index, isMobile, maxWidth) {
        //console.log(item);
        const { pvpFightsStartDate, replay, loadingReplay } = this.state
        const { mainTextColor, isDarkmode } = this.props

        const winRate = this.calcWinRate(item)

        const totalFights = item.win + item.lose
        //console.log(totalFights, item);

        const fightsStart = moment().isAfter(pvpFightsStartDate)
        //console.log(fightsStart);

        //console.log(bonusEquipment['hp']);
        const canFight = !fightsStart ? true : this.checkIfCanDoManualFights(item)
        const hasFightsLeft = !fightsStart ? true : totalFights < item.rounds

        return (
            <div
                key={index}
                style={Object.assign({}, styles.boxSubscribed, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", maxWidth: maxWidth - 10, marginRight: isMobile ? 5 : 20 })}
            >

                <div style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'start' }}>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={getImageUrl(item.id)}
                            style={{ width: 100, height: 100, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid', marginRight: 10, marginBottom: isMobile ? 7 : 0 }}
                            alt={item.id}
                        />
                    </a>

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

                        <button
                            style={{ marginBottom: 10, width: 100, height: 23, alignItems: 'center', borderRadius: 4, borderColor: CTA_COLOR, borderWidth: 1, borderStyle: 'solid' }}
                            onClick={() => this.setState({ showModalStats: true, itemShowStats: item })}
                        >
                            <p style={{ fontSize: 14, color: mainTextColor }} className="text-regular">
                                see stats
                            </p>
                        </button>

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

                    </div>

                </div>


                {
                    !this.state.loading && !loadingReplay && !replay[item.id] ?
                    <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
                        <button
                            className="btnH"
                            style={styles.btnPlay}
                            onClick={() => {
                                if (this.state.loading) {
                                    return
                                }
                                this.loadReplay(item)
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Last fights
                            </p>
                        </button>

                        {
                            canFight && hasFightsLeft &&
                            <button
                                className="btnH"
                                style={styles.btnPlay}
                                onClick={() => {
                                    if (this.state.loading) {
                                        return
                                    }
                                    this.chooseOpponent(item)
                                }}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Fight
                                </p>
                            </button>
                        }

                        {
                            fightsStart && totalFights >= item.rounds &&
                            <button
                                className="btnH"
                                style={Object.assign({}, styles.btnPlay, { width: 190 })}
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
                        }
                    </div>
                    : null
                }

                {
                    loadingReplay &&
                    <div
                        style={styles.btnPlay}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Loading...
                        </p>
                    </div>
                }

                {
                    replay[item.id] &&
                    <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        {replay[item.id].map((items, index) => {
                            return this.renderReplay(item.id, items, index)
                        })}
                    </div>
                }
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
        const { isConnected, showModalConnection, pvpOpen, yourSubscribersResults, error, activeSubs, pvpWeekEnd, pvpFightsStart, pvpFightsStartDate, allSubscribers, loading } = this.state
        const { account, userMintedNfts, mainTextColor, mainBackgroundColor } = this.props

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
                            Subscribers {allSubscribers.length}
                        </p>

                        {
                            activeSubs && allSubscribers && allSubscribers.length > 0 ?
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
                            Reward: +3 AP
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

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 20 }}>
                    A bot will do all your wizards' fights for you, but you can do them manually during the Training period
                </p>

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
                    !fightsStart && !loading &&
                    <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 40 }} className="text-bold">
                        Select the wizard you want to enroll in the PvP Arena
                    </p>
                }

                {
                    !fightsStart && !loading &&
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

                {
                    this.state.showModalStats ?
                    <ModalStats
                        item={this.state.itemShowStats}
                        showModal={this.state.showModalStats}
                        onCloseModal={() => this.setState({ showModalStats: false })}
                    />
                    : undefined
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
        flexDirection: 'column'
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
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, avgLevelPvP, wizaBalance, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, avgLevelPvP, wizaBalance, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode };
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
    updateInfoTransactionModal,
    loadBlockNftsSplit,
    getInfoItemEquippedMass,
    getInfoAuraMass
})(PvP)
