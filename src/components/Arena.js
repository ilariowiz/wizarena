import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { getDocs, collection, query, doc, getDoc, serverTimestamp, updateDoc, setDoc, where, limit, orderBy, increment } from "firebase/firestore";
import { firebasedb } from './Firebase';
import moment from 'moment'
import _ from 'lodash'
import ReCAPTCHA from 'react-google-recaptcha'
import { MdOutlineDateRange } from 'react-icons/md'
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import Popup from 'reactjs-popup';
import Header from './Header'
import NftCardChoice from './common/NftCardChoice'
import ModalFightConquest from './common/ModalFightConquest'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import allSpells from './common/Spells'
import fight from './common/CalcFightArena'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadUserMintedNfts,
    getInfoItemEquipped,
    getInfoAura,
    loadSingleNft
} from '../actions'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';

const cup_gold = require('../assets/cup_gold.png')
const cup_silver = require('../assets/cup_silver.png')
const cup_bronze = require('../assets/cup_bronze.png')
const medal = require('../assets/medal.png')


class Arena extends Component {
    constructor(props) {
        super(props)

        this.SEASON_ID = ""
        this.SEASON_ID_FIGHTS = ""

        this.state = {
            loading: true,
            loadingYourSubs: true,
            arenaInfo: {},
            subscribersId: [],
            fightsDone: 0,
            showSubscribe: false,
            notSubbed: [],
            toSubscribe: [],
            yourSubs: [],
            categories: {},
            allData: [],
            wizardSelected: {},
            subscribing: false,
            loadingYourChampion: false,
            wizardSelectedLastFights: [],
            showModalFight: false,
            lastOpponentId: "",
            captchaToken: ""
        }
    }

    async componentDidMount() {
		document.title = "Arena - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        const arenaInfo = await this.loadArenaInfo()

        this.SEASON_ID = arenaInfo.ranking
        this.SEASON_ID_FIGHTS = "arena_fights"

        this.setState({ arenaInfo })

        setTimeout(() => {
            this.loadSubscribers()
        }, 500)
	}

    async loadArenaInfo() {
        const docRef = doc(firebasedb, "arena_info", 'XOSKyMnBjlGLN1veCdlD')

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

        //console.log(data);

        return data
    }

    async loadSubscribers() {
        let allData = []

        const q = query(collection(firebasedb, this.SEASON_ID))
        const querySnapshot = await getDocs(q)

        querySnapshot.forEach(doc => {
            const d = doc.data()

            let temp = {}
            temp = d
            temp['docId'] = doc.id

            allData.push(temp)
        })

        //console.log(allData);

        let sub160 = []
        let sub200 = []
        let sub300 = []
        let sub400 = []
        let subscribersId = []

        allData.map(i => {
            if (i.level <= 160) {
                sub160.push(i)
            }

            else if (i.level > 160 && i.level <= 200) {
                sub200.push(i)
            }
            else if (i.level > 200 && i.level <= 300) {
                sub300.push(i)
            }
            else {
                sub400.push(i)
            }

            subscribersId.push(i.idnft)
        })

        sub160.sort((a, b) => {
            return b.ranking - a.ranking
        })

        sub200.sort((a, b) => {
            return b.ranking - a.ranking
        })

        sub300.sort((a, b) => {
            return b.ranking - a.ranking
        })

        sub400.sort((a, b) => {
            return b.ranking - a.ranking
        })

        const categories = {
            "sub160": sub160.slice(0, 10),
            "sub160count": sub160.length,
            "sub200": sub200.slice(0, 10),
            "sub200count":sub200.length,
            "sub300": sub300.slice(0, 10),
            "sub300count": sub300.length,
            "sub400": sub400.slice(0, 10),
            "sub400count": sub400.length
        }

        //console.log(categories);

        this.setState({ categories, allData, subscribersId }, () => {
            if (!this.props.userMintedNfts || this.props.userMintedNfts.length === 0) {
                this.loadMinted()
            }
            else {
                this.getSubscribers()
            }
        })
    }

    loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {

            this.setState({ loadingYourSubs: true })

			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
				//console.log(response);
				setTimeout(() => {
                    this.getSubscribers()
                }, 1500)
			})
		}
        else {
            this.getSubscribers()
        }
	}

    async getSubscribers() {
        const { userMintedNfts } = this.props
        const { subscribersId, allData } = this.state

        //console.log(subscribersId);
        ////// TEST
        //subscribersId = ["396", "777", "2121", "2022", "1455", "183", "2999"]

        let yourSubs = []
        let notSubbed = []

        userMintedNfts && userMintedNfts.map(i => {
            if (subscribersId.includes(i.id)) {

                const data = allData.find(z => z.idnft === i.id)
                //console.log(data);
                if (data && data.fightsDone) {
                    i['fightsDone'] = data.fightsDone
                }
                //console.log(i);

                //se è maggiore di 16, significa che hai spostato di wallet i wzards, li hai iscritti, e poi li hai rispostati in questo wallet
                //a questo punto ignoriamo oltre al 16
                if (yourSubs.length < 16) {
                    yourSubs.push(i)
                }
            }
            else {
                notSubbed.push(i)
            }
        })

        yourSubs.sort((a, b) => {
            return b.level - a.level
        })

        this.setState({ loadingYourSubs: false, loading: false, yourSubs, notSubbed, countSubbedWizards: subscribersId.length })
	}

    async loadYourChampion(infoNft) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props
        const { allData } = this.state

        this.setState({ loadingYourChampion: true })

        const data = allData.find(i => i.idnft === infoNft.id)

        //console.log(data);

        const ring = data.level > 160 ? await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, infoNft.id) : undefined
        const pendant = data.level > 160 ? await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, `${infoNft.id}pendant`) : undefined
        const aura = data.level > 160 ? await this.props.getInfoAura(chainId, gasPrice, gasLimit, networkUrl, infoNft.id) : undefined

        if (ring && ring.equipped) {
            infoNft['ring'] = ring
        }
        else {
            infoNft['ring'] = {}
        }

        if (pendant && pendant.equipped) {
            infoNft['pendant'] = pendant
        }
        else {
            infoNft['pendant'] = {}
        }

        if (aura && aura.bonus.int > 0) {
            infoNft['aura'] = aura
        }
        else {
            infoNft['aura'] = {}
        }

        infoNft['attack'] = infoNft.attack.int
        infoNft['damage'] = infoNft.damage.int
        infoNft['defense'] = infoNft.defense.int
        infoNft['hp'] = infoNft.hp.int
        infoNft['speed'] = infoNft.speed.int
        infoNft['spellSelected'] = allSpells.find(i => i.name === infoNft.spellSelected.name)

        if (infoNft.ring && infoNft.ring.equipped) {
            const stats = infoNft.ring.bonus.split(",")
            //console.log("stats ring 2", stats);
            stats.map(i => {
                const infos = i.split("_")
                //console.log(infos[1], infos[0]);
                infoNft[infos[1]] += parseInt(infos[0])
            })
        }

        if (infoNft.aura && infoNft.aura.bonus) {
            infoNft['defense'] += parseInt(infoNft.aura.bonus.int)
        }

        //console.log(infoNft);

        if (this.recaptchaRef) {
            this.recaptchaRef.current.reset()
        }

        this.setState({ wizardSelected: infoNft, loadingYourChampion: false, fightsDone: data.fightsDone, captchaToken: "" }, () => {
            this.loadWizardSelectedLastFights(infoNft.id)
        })
    }

    async loadWizardSelectedLastFights(idnft) {
        let q1 = query(collection(firebasedb, this.SEASON_ID_FIGHTS), where("wizards", "array-contains-any", [idnft]), limit(5), orderBy("timestamp", "desc"))
        const querySnapshot = await getDocs(q1)

        let fights = []

        querySnapshot.forEach(doc => {
            //console.log(doc.data());

            let data = doc.data()
            data['docId'] = doc.id

            fights.push(data)
        })

        //console.log(fights);
        const lastFight = fights.length > 0 ? fights[0] : undefined
        let lastOpponentId;
        if (lastFight) {
            lastOpponentId = lastFight.idnft1 === idnft ? lastFight.idnft2 : lastFight.idnft1
        }

        //console.log(lastOpponentId);

        this.setState({ wizardSelectedLastFights: fights, lastOpponentId })
    }

    subscribeWizards() {
        const { toSubscribe } = this.state
        const { userMintedNfts } = this.props

        this.setState({ subscribing: true })

        //console.log(toSubscribe);

        toSubscribe.map(async i => {

            const nftInfo = userMintedNfts.find(z => z.id === i)

            const initialDoc = {
                idnft: i,
                fightsDone: 0,
                lastFightTime: serverTimestamp(),
                ranking: 0,
                level: nftInfo.level
            }

            //console.log(nftInfo, initialDoc);

            const docRef = doc(collection(firebasedb, this.SEASON_ID))
            await setDoc(docRef, initialDoc)
        })

        setTimeout(() => {
            window.location.reload()
        }, 1500)
    }

    async addToSubscribers(id) {
        const { toSubscribe } = this.state

        const newToSub = Object.assign([], toSubscribe)
        newToSub.push(id)

        this.setState({ toSubscribe: newToSub })
    }

    async checkIfFightsLeft(idnft) {

        const q = query(collection(firebasedb, this.SEASON_ID), where("idnft", "==", idnft))
        const querySnapshot = await getDocs(q)

        let data = undefined

        querySnapshot.forEach(doc => {
            data = doc.data()
            data['docId'] = doc.id
        })

        if (data.fightsDone < 5) {
            return true
        }

        return false
    }

    getOpponent(opponents) {
        opponents = opponents.sort((a,b) => {

            let fightsGetA = a.fightsGet || 0
            let fightsGetB = b.fightsGet || 0

            return fightsGetA - fightsGetB
        })
        //console.log(opponents);

        const top10 = opponents.slice(0, opponents.length/2)

        return _.sample(top10)
    }

    async startFight() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props
        const { wizardSelected, allData, lastOpponentId } = this.state

        let seasonEnded = this.checkSeasonEnded()
        //console.log(seasonEnded);
        if (seasonEnded) {
            //season finita mentre stavi ancora con la pagina aperta e ti fa fare i fights
            window.location.reload()
            return
        }

        const hasFightsLeft = await this.checkIfFightsLeft(wizardSelected.id)
        //console.log(hasFightsLeft);
        if (!hasFightsLeft) {
            window.location.reload()
            return
        }

        // rimuoviamo il wiz selezionato e l'ultimo wizard sfidato
        let opponents = allData.filter(i => i.idnft !== wizardSelected.id)
        if (lastOpponentId) {
            opponents = opponents.filter(i => i.idnft !== lastOpponentId)
        }

        //filtriamo per categoria
        let opponentsByLevel = []

        opponents.map(i => {
            if (i.level <= 160 && wizardSelected.level <= 160) {
                opponentsByLevel.push(i)
            }
            else if ((i.level > 160 &&  i.level <= 200) && (wizardSelected.level > 160 && wizardSelected.level <= 200)) {
                opponentsByLevel.push(i)
            }
            else if ((i.level > 200 &&  i.level <= 300) && (wizardSelected.level > 200 && wizardSelected.level <= 300)) {
                opponentsByLevel.push(i)
            }
            else if (i.level > 300 && wizardSelected.level > 300) {
                opponentsByLevel.push(i)
            }
        })

        //console.log(opponentsByLevel);

        const opponent = this.getOpponent(opponentsByLevel)//_.sample(opponentsByLevel)

        if (opponent && wizardSelected.attack) {
            this.incrementFights(wizardSelected.id)
        }
        else {
            window.location.reload()
            return
        }

        this.setState({ loadingStartFight: true, showModalFight: true, infoFight: { nft1: wizardSelected, nft2: { id: "" }, winner: "" } })

        this.props.loadSingleNft(chainId, gasPrice, gasLimit, networkUrl, opponent.idnft, async (response) => {

            const ring = opponent.level > 160 ? await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, opponent.idnft) : undefined
            const pendant = opponent.level > 160 ? await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, `${opponent.idnft}pendant`) : undefined
            const aura = opponent.level > 160 ? await this.props.getInfoAura(chainId, gasPrice, gasLimit, networkUrl, opponent.idnft) : undefined

            if (ring && ring.equipped) {
                response['ring'] = ring
            }
            else {
                response['ring'] = {}
            }

            if (pendant && pendant.equipped) {
                response['pendant'] = pendant
            }
            else {
                response['pendant'] = {}
            }

            if (aura && aura.bonus.int > 0) {
                response['aura'] = aura
            }
            else {
                response['aura'] = {}
            }

            response['attack'] = response.attack.int
            response['damage'] = response.damage.int
            response['defense'] = response.defense.int
            response['hp'] = response.hp.int
            response['speed'] = response.speed.int
            response['spellSelected'] = allSpells.find(i => i.name === response.spellSelected.name)

            if (response.ring && response.ring.equipped) {
                const stats = response.ring.bonus.split(",")
                //console.log("stats ring 2", stats);
                stats.map(i => {
                    const infos = i.split("_")
                    //console.log(infos[1], infos[0]);
                    response[infos[1]] += parseInt(infos[0])
                })
            }

            if (response.aura && response.aura.bonus) {
                response['defense'] += parseInt(response.aura.bonus.int)
            }

            fight(wizardSelected, response, undefined, async (history, winner) => {

                this.sendFightToFirebase(history, wizardSelected, response, winner)

                if (winner === wizardSelected.id) {
                    this.updateDataFirebase(wizardSelected.id, true, wizardSelected.level)
                }
                else {
                    this.updateDataFirebase(winner, false, opponent.level)
                }

                this.setState({ infoFight: { nft1: wizardSelected, nft2: response, winner: "" }, loadingStartFight: false })

                setTimeout(async () => {
                    await this.loadSubscribers()

                    this.setState({ isFightDone: true, infoFight: { nft1: wizardSelected, nft2: response, winner } }, () => {
                        this.loadWizardSelectedLastFights(wizardSelected.id)
                    })

                }, 3000)

            })
        })
    }

    sendFightToFirebase(history, player1, player2, winner) {

        const fightObj = {
            actions: history,
            idnft1: player1.id,
            idnft2: player2.id,
            season: this.SEASON_ID,
            winner,
            info1: player1,
            info2: player2,
            hp1: player1.hp,
            hp2: player2.hp,
            timestamp: serverTimestamp(),
            wizards: [player1.id, player2.id]
        }

        const fightRef = doc(collection(firebasedb, this.SEASON_ID_FIGHTS))
        setDoc(fightRef, fightObj)
    }

    async incrementFights(idnft) {
        const { allData } = this.state

        const data = allData.find(i => i.idnft === idnft)

        const docRef = doc(firebasedb, this.SEASON_ID, data.docId)

        updateDoc(docRef, {
            "fightsDone": increment(1),
        })
    }

    async updateDataFirebase(idnft, doIncrement, wizardLevel) {
        const { allData } = this.state

        const data = allData.find(i => i.idnft === idnft)

        const docRef = doc(firebasedb, this.SEASON_ID, data.docId)

        //se hai vinto e sei l'attaccante
        if (doIncrement) {
            updateDoc(docRef, {
                "ranking": increment(5),
                "lastFightTime": serverTimestamp(),
                "level": wizardLevel
            })
        }
        //è il difensore che ha vinto, lo sfidato che ha vinto guadagna 2 punti
        else {
            updateDoc(docRef, {
                "ranking": increment(2),
                "fightsGet": increment(1),
                "level": wizardLevel
            })
        }
    }

    renderRowChoise(item, index) {
		const { toSubscribe } = this.state

        return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
				onSubscribe={(id) => {
                    if (!toSubscribe.includes(id)) {
                        this.addToSubscribers(id)
                    }
                    else {
                        const toSubscribeCopy = Object.assign([], toSubscribe)
                        const idx = toSubscribeCopy.findIndex(i => i === id)
                        toSubscribeCopy.splice(idx, 1)

                        this.setState({ toSubscribe: toSubscribeCopy })
                    }
                }}
				modalWidth={230}
				section={"lords"}

			/>
		)
	}

    renderFooterSubscribe(isMobile) {
		const { toSubscribe, subscribing, yourSubs } = this.state
        const { mainTextColor } = this.props

		let temp = []
		toSubscribe.map(i => {
			temp.push(
                <img
                    key={i}
                    style={{ width: 60, height: 60, borderRadius: 4, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', cursor: 'pointer' }}
                    src={getImageUrl(i)}
                    alt={`#${i}`}
                />
			)
		})

		const styleBox = isMobile ?
						{ flexDirection: 'column', alignItems: 'center', paddingBottom: 10, width: '100%' }
						:
						{ justifyContent: 'space-between', alignItems: 'center', flex: 1 }

		return (
			<div style={styleBox}>
				<div style={{ flexWrap: 'wrap', marginLeft: isMobile ? 0 : 20 }}>
					{temp}
				</div>

				{
                    !subscribing ?
                    <button
    					className="btnH"
    					style={{ width: 180, height: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: CTA_COLOR, marginRight: 20 }}
    					onClick={() => {

                            if (yourSubs.length + toSubscribe.length > 16) {
                                toast.error('You can register a maximum of 16 wizards')
                                return
                            }

                            this.subscribeWizards()
                        }}
    				>
    					<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
    						Subscribe
    					</p>

    				</button>
                    :
                    <div style={{ width: 180, height: 44, justifyContent: 'center', alignItems: 'center' }}>
                        <DotLoader size={25} color={mainTextColor} />
                    </div>
                }

			</div>
		)
	}

    checkSeasonEnded() {
        const { arenaInfo } = this.state

        let seasonEnded = false
        if (arenaInfo && arenaInfo.end) {
            const endSeason = moment(arenaInfo.end.seconds * 1000)
            if (endSeason < moment()) {
                seasonEnded = true
            }
        }

        return seasonEnded
    }

    renderYourSubs(item, index) {
        const { mainTextColor } = this.props
        const { loadingYourChampion } = this.state

        //console.log(item);

        let color;
        if (item.level > 300) {
            color = "gold"
        }

        if (item.level > 200 && item.level <= 300) {
            color = "#c0c0c0"
        }

        if (item.level > 160 && item.level <= 200) {
            color = "#cd7f32"
        }

        if (item.level <= 160) {
            color = "#ad9c8b"
        }

        const fightsLeft = item.fightsDone ? 5 - item.fightsDone : 5

        return (
            <div style={Object.assign({}, styles.yourSubCard, { maxWidth: 120, borderColor: color })} key={index}>
                <img
                    style={{ width: 120, height: 120, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                    src={getImageUrl(item.id)}
                    alt={`#${item.id}`}
                />

                <p style={{ color: mainTextColor, fontSize: 15, marginTop: 10, marginBottom: 10, textAlign: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    {item.name} {item.nickname || ""}
                </p>

                <p style={{ color: mainTextColor, fontSize: 15, marginTop: 10, marginBottom: 10, textAlign: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    Fights left {fightsLeft}
                </p>

                {
                    !loadingYourChampion ?
                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 36, borderTopLeftRadius: 0, borderTopRightRadius: 0 })}
                        onClick={() => this.loadYourChampion(item)}
                    >
                        <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                            Select
                        </p>
                    </button>
                    :
                    <div
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, borderTopLeftRadius: 0, borderTopRightRadius: 0 })}
                    >
                        <DotLoader size={20} color={mainTextColor} />
                    </div>
                }
            </div>
        )
    }


    renderWizardSelected(isMobile, seasonStarted, seasonEnded) {
        const { mainTextColor } = this.props
        const { wizardSelected, fightsDone, wizardSelectedLastFights, allData } = this.state

        const data = allData.find(i => i.idnft === wizardSelected.id)
        const wizardSelectedRanking = data.ranking

        const fightsLeft = 5 - fightsDone

        const maxWidth = 180

        const recaptchaRef = React.createRef()

        return (
            <div style={{ flexDirection: isMobile ? 'column' : 'row', width: "100%" }}>

                <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${wizardSelected.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            style={{ width: 220, height: 220, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid' }}
                            src={getImageUrl(wizardSelected.id)}
                            alt={`#${wizardSelected.id}`}
                        />
                    </a>

                    <p style={{ color: mainTextColor, fontSize: 18, marginTop: 10, marginBottom: 10, maxWidth: 220, textAlign: 'center' }} className="text-medium">
                        {wizardSelected.name} {wizardSelected.nickname}
                    </p>

                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 30, marginBottom: 25 })}
                        onClick={() => this.setState({ wizardSelected: {}, wizardSelectedElos: {}, fightsDone: 0 })}
                    >
                        <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                            Change
                        </p>
                    </button>

                    <p style={{ fontSize: 20, color: CTA_COLOR, marginBottom: 10 }} className="text-bold">
                        Daily fights left {fightsLeft}
                    </p>

                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5, textAlign: 'center' }}>
                        Points: {wizardSelectedRanking}
                    </p>

                    {
                        !seasonStarted && !seasonEnded &&
                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginBottom: 15 }}>
                            Season hasn't started yet
                        </p>
                    }

                    {
                        seasonEnded &&
                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginBottom: 15 }}>
                            Season is over! Congrats all
                        </p>
                    }

                    {
                        !seasonEnded && seasonStarted && fightsLeft > 0 &&
                        <button
                            style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 36 })}
                            onClick={() => {
                                if (this.state.captchaToken) {
                                    this.startFight()
                                }
                            }}
                        >
                            <p style={{ fontSize: 16, color: 'white', textAlign: 'center' }} className="text-medium">
                                Fight
                            </p>
                        </button>
                    }

                    {
                        fightsLeft <= 0 &&
                        <div
                            style={Object.assign({}, styles.btnSubscribe, { width: maxWidth, height: 30, backgroundColor: 'transparent', marginBottom: 8, cursor: 'default', borderWidth: 1, borderColor: CTA_COLOR, borderStyle: 'solid' })}
                        >
                            <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                                No fights left
                            </p>
                        </div>
                    }

                    <ReCAPTCHA
                        style={{ display: this.state.captchaToken ? "none" : "block" }}
                        ref={recaptchaRef}
                        //size="invisible"
                        sitekey="6LeMHekpAAAAALxSDiImZ24NxsXipt69omZH03S8"
                        onChange={(e) => this.setState({ captchaToken: e })}
                    />
                </div>

                <div style={{ flexDirection: 'column', marginLeft: 20 }}>
                    <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 10 }} className="text-medium">
                        Last fights
                    </p>

                    <div style={{ flexWrap: 'wrap' }}>
                        {
                            wizardSelectedLastFights.map((item, index) => {
                                return this.renderSingleFight(item, index)
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }

    renderSingleFight(item, index) {
        const { wizardSelected } = this.state
        const { mainTextColor } = this.props

        //console.log(item);

        const otherWizardId = item.idnft1 === wizardSelected.id ? item.idnft2 : item.idnft1

        const otherWizardInfo = item.info1.id === otherWizardId ? item.info1 : item.info2

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', marginRight: 20, justifyContent: 'space-between' }} key={index}>
                <a
                    href={`${window.location.protocol}//${window.location.host}/nft/${otherWizardId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        style={{ width: 100, height: 100, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid' }}
                        src={getImageUrl(otherWizardId)}
                        alt={`#${otherWizardId}`}
                    />
                </a>

                <p style={{ color: mainTextColor, fontSize: 13, marginTop: 5, marginBottom: 5, maxWidth: 100, textAlign: 'center' }}>
                    {otherWizardInfo.name} {otherWizardInfo.nickname}
                </p>

                <a
                    style={Object.assign({}, styles.btnSubscribe, { width: 100, height: 30, cursor: 'pointer' })}
                    href={`${window.location.protocol}//${window.location.host}/fightreplay/${this.SEASON_ID_FIGHTS}/${item.docId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                        Replay
                    </p>
                </a>
            </div>
        )
    }

    renderRowRank(item, index, array) {
        const { mainTextColor } = this.props

        let imageLeft = index < 5 ? medal : undefined

        const currentRanking = item.ranking

        if (index >= 5) {
            const lastRanking = array[4].ranking
            //console.log(currentRanking, previousRanking);
            if (currentRanking === lastRanking) {
                imageLeft = medal
            }
        }

        return (
            <div style={{ alignItems: 'center', padding: 5 }} key={item.idnft}>
                {
                    imageLeft ?
                    <img
                        src={imageLeft}
                        style={{ width: 34, height: 34, marginRight: 10 }}
                        alt="Cup"
                    />
                    :
                    <div style={{ width: 34, height: 34, marginRight: 10 }} />
                }
                <a
                    href={`${window.location.protocol}//${window.location.host}/nft/${item.idnft}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        src={getImageUrl(item.idnft)}
                        style={{ height: 70, width: 70, marginRight: 10, borderRadius: 2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: "solid" }}
                        alt={`${item.idnft}`}
                    />
                </a>

                <p style={{ fontSize: 18, color: mainTextColor, width: 80 }}>
                    #{item.idnft}
                </p>
                <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'right' }}>
                    {item.ranking} pts.
                </p>
            </div>
        )
    }

    renderRanking(level) {
        const { mainBackgroundColor } = this.props
        const { categories } = this.state

        let color;
        if (level === 400) {
            color = "gold"
        }

        if (level === 300) {
            color = "#c0c0c0"
        }

        if (level === 200) {
            color = "#cd7f32"
        }

        if (level === 160) {
            color = "#ad9c8b"
        }

        const key = `sub${level}`
        const keyCount = `${key}count`

        //console.log(categories);

        return (
            <div style={{ flexDirection: 'column', marginBottom: 30, flex: 1, borderWidth: 1, borderColor: color, borderStyle: 'solid', borderTopWidth: 0, borderRightWidth: 0 }}>

                <div style={{ backgroundImage: `linear-gradient(to right, ${color}, transparent)`, flexDirection: 'column' }}>
                    <p style={{ fontSize: 20, color: mainBackgroundColor, padding: 10, paddingBottom: 2 }} className="text-bold">
                        Level {level} Ranking
                    </p>

                    {
                        categories && categories[key] &&
                        <p style={{ fontSize: 12, color: mainBackgroundColor, marginLeft: 10, marginBottom: 3 }}>
                            {categories[keyCount]} wizards
                        </p>
                    }
                </div>

                {
                    categories && categories[key] &&
                    categories[key].map((i, index) => {
                        return this.renderRowRank(i, index, categories[key])
                    })
                }

            </div>
        )
    }

    renderBody(isMobile) {
        const { loadingYourSubs, yourSubs, wizardSelected, infoFight, isFightDone, showSubscribe, arenaInfo, notSubbed, countSubbedWizards } = this.state
        const { mainTextColor, mainBackgroundColor } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        let boxCardSelected = boxW * 90 / 100
        if (boxCardSelected > 400) {
            boxCardSelected = 400
        }

        const insideWidth = boxW > 1250 ? 1250 : boxW

        let endSeasonText;
        let endLongText;
        let endSeason;
        let seasonEnded;
        if (arenaInfo && arenaInfo.end) {
            seasonEnded = this.checkSeasonEnded()
            endSeason = moment(arenaInfo.end.seconds * 1000)
            endSeasonText = moment().to(endSeason)
            endLongText = endSeason.format("DD/MM HH:mm")
        }

        let startSeasonText;
        let startLongText;
        let startSeason;
        let seasonStarted = false
        if (arenaInfo && arenaInfo.start) {
            startSeason = moment(arenaInfo.start.seconds * 1000)
            startSeasonText = moment().to(startSeason)
            startLongText = startSeason.format("DD/MM HH:mm")

            if (startSeason < moment()) {
                seasonStarted = true
            }
        }

        ///// PAGINA SUBSCRIBE ******************************
        if (showSubscribe && arenaInfo.start) {
           //console.log(startLongText);

           return (
               <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, paddingBottom: 0, overflowY: 'auto', overflowX: 'hidden' }}>

                   <div style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', width: '100%', marginBottom: 25 }}>
                       <p style={{ fontSize: 28, color: mainTextColor, marginBottom: isMobile ? 10 : 0 }} className="text-medium">
                           Arena
                       </p>

                       <button
                           className='btnH'
                           style={styles.btnSubscribe}
                           onClick={() => {
                               this.setState({ showSubscribe: false })
                           }}
                       >
                           <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                               Play
                           </p>
                       </button>
                   </div>

                   <div style={{ flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                       <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginRight: 20, marginBottom: 15 }}>
                           FREE TO PLAY
                       </p>

                       <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginRight: 20, marginBottom: 15 }}>
                           Start {startSeasonText} ({startLongText})
                       </p>

                       <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginRight: 20, marginBottom: 15 }}>
                           End {endSeasonText} ({endLongText})
                       </p>
                   </div>

                   <div style={{ flexWrap: 'wrap', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 30 }}>
                   {
                       notSubbed && notSubbed.map((item, index) => {
                           return this.renderRowChoise(item, index)
                       })
                   }
                   </div>

                   {
                       this.state.toSubscribe.length > 0 &&
                       <div style={Object.assign({}, styles.footerSubscribe, { bottom: -padding, width: insideWidth, backgroundColor: mainBackgroundColor })}>
                           {this.renderFooterSubscribe(isMobile)}
                       </div>
                   }
               </div>
           )
        }

        ///// SECTION PLAY ******************************
        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, overflowY: 'auto', overflowX: 'hidden' }}>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', width: '100%', marginBottom: 10 }}>
                    <p style={{ fontSize: 28, color: mainTextColor, marginBottom: isMobile ? 10 : 0 }} className="text-medium">
                        Arena
                    </p>

                    {
                       loadingYourSubs ?
                        <div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
                            <DotLoader size={25} color={mainTextColor} />
                        </div>
                        : null
                     }

                    <div style={{ flexDirection: 'column' }}>

                        {
                            !seasonEnded ?
                            <button
                                className='btnH'
                                style={Object.assign({}, styles.btnSubscribe, { marginBottom: 10 })}
                                onClick={() => {
                                    if (loadingYourSubs) {
                                        return
                                    }
                                    this.setState({ showSubscribe: true })
                                }}
                            >
                                {
                                    loadingYourSubs ?
                                    <DotLoader size={16} color={mainTextColor} />
                                    :
                                    null
                                }

                                {
                                    !loadingYourSubs && yourSubs.length < 16 ?
                                    <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                        Subscribe your wizards
                                    </p>
                                    : null
                                }
                            </button>
                            :
                            null
                        }

                        <Popup
                            trigger={
                                <button
                                    className='btnH'
                                    style={styles.btnRules}
                                    onClick={() => {
                                        this.setState({ showSubscribe: true })
                                    }}
                                >
                                    <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                                        Rules
                                    </p>
                                </button>
                            }
                            modal
                            nested
                        >
                            {close => (
                                <div style={{ flexDirection: 'column' }}>
                                    <div style={{ justifyContent: 'center', fontSize: 19, color: 'black', marginBottom: 10, marginTop: 5 }}>Rules</div>
                                    <div style={{ fontSize: 16, color: 'black', paddingLeft: 5, paddingRight: 5, marginBottom: 15 }}>
                                      {' '}
                                      There are 4 leaderboards of 4 different levels. Your wizard will automatically participate in the one best suited to his level.
                                      <br />
                                      Each wizard has 5 daily fights and will fight with a random wizard among those registered (can also fight against a wizard of the same wallet).
                                      <br />
                                      Each victory will earn the wizard 5. If you are challenged and win, you earn 2 points. The loser will not lose points.
                                      <br />
                                    </div>
                                    <div style={{ justifyContent: 'center', marginBottom: 10 }}>
                                        <button
                                            style={{ color: 'black', fontSize: 16 }}
                                            onClick={() => {
                                              close();
                                            }}
                                          >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Popup>
                    </div>
                </div>

                <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 25 }}>
                    {countSubbedWizards} participating Wizards
                </p>

                <div style={{ alignItems: 'center', marginBottom: 25, flexWrap: 'wrap' }}>
                    {
                        startSeasonText &&
                        <div style={{ alignItems: 'center', marginRight: 20 }}>

                            <MdOutlineDateRange
                                size={22}
                                color={mainTextColor}
                                style={{ marginRight: 3 }}
                            />

                            <p style={{ fontSize: 17, color: mainTextColor }}>
                                Start {startSeasonText} ({startLongText})
                            </p>
                        </div>
                    }

                    {
                        endSeasonText &&
                        <div style={{ alignItems: 'center' }}>

                            <MdOutlineDateRange
                                size={22}
                                color={mainTextColor}
                                style={{ marginRight: 3 }}
                            />

                            <p style={{ fontSize: 17, color: mainTextColor }}>
                                End {endSeasonText} ({endLongText})
                            </p>
                        </div>
                    }
                </div>

                {
                    wizardSelected && wizardSelected.id ?
                    this.renderWizardSelected(isMobile, seasonStarted, seasonEnded)
                    :
                    <div style={{ flexDirection: 'column' }}>
                        <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 10 }} className="text-medium">
                            Your subscribed Wizards <span style={{ fontSize: 13 }}>({yourSubs.length})</span>
                        </p>

                        {
        					loadingYourSubs ?
        					<div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
        						<DotLoader size={25} color={mainTextColor} />
        					</div>
        					: null
        				}

                        <div style={{ overflow: 'scroll' }}>
                            {
                                yourSubs && yourSubs.length > 0 && !loadingYourSubs &&
                                yourSubs.map((item, index) => {
                                    return this.renderYourSubs(item, index)
                                })
                            }
                        </div>

                        {
                            !loadingYourSubs && yourSubs && yourSubs.length === 0 &&
                            <p style={{ fontSize: 16, color: mainTextColor, marginTop: 10, marginBottom: 10 }} className="text-medium">
                                No Wizards subscribed...
                            </p>
                        }
                    </div>
                }

                <p style={{ marginTop: 20, marginBottom: 20, fontSize: 24, color: mainTextColor }}>
                    Rankings
                </p>

                <div style={{ flexWrap: 'wrap' }}>

                    {this.renderRanking(400)}

                    {this.renderRanking(300)}

                    {this.renderRanking(200)}

                    {this.renderRanking(160)}

                </div>

                {
                    infoFight && infoFight.nft1 &&
                    <ModalFightConquest
                        showModal={this.state.showModalFight}
                        width={modalW}
                        infoFight={infoFight}
                        isMobile={isMobile}
                        isFightDone={isFightDone}
                        closeModal={() => {
                            this.setState({ showModalFight: false, infoFight: {}, isFightDone: false, fightsDone: this.state.fightsDone+1 })
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
					page='nft'
					section={32}
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
    btnSubscribe: {
        width: 170,
		height: 40,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        display: 'flex',
        cursor: 'pointer'
	},
    btnRules: {
        width: 170,
		height: 40,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        borderWidth: 1,
        borderColor: CTA_COLOR,
        borderStyle: 'solid',
        display: 'flex',
        cursor: 'pointer'
	},
    yourSubCard: {
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderStyle: 'solid',
        marginRight: 15,
        marginBottom: 15,
        justifyContent: 'space-between'
    },
    footerSubscribe: {
		position: 'sticky',
		bottom: 0,
		left: 0,
		backgroundColor: "white",
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
	const { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts, mainTextColor, mainBackgroundColor } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts, mainTextColor, mainBackgroundColor };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    loadUserMintedNfts,
    getInfoItemEquipped,
    getInfoAura,
    loadSingleNft
})(Arena)
